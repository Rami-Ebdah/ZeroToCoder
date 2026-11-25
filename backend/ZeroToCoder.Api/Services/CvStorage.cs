using Microsoft.Extensions.Options;
using ZeroToCoder.Api.Options;

namespace ZeroToCoder.Api.Services;

public interface ICvStorage
{
    /// <summary>Validates and stores the CV, returning its storage-relative path (e.g. <c>CVs/abc_cv.pdf</c>).</summary>
    Task<string> SaveAsync(IFormFile file, CancellationToken ct = default);

    /// <summary>Resolves a stored relative path to an absolute path, or <c>null</c> if it is invalid or missing.</summary>
    string? Resolve(string? relativePath);

    void Delete(string? relativePath);
}

public sealed class CvValidationException(string message) : Exception(message);

/// <summary>
/// Stores uploaded CVs outside the web root so they are never publicly reachable;
/// admins download them through an authorized endpoint.
/// </summary>
public sealed class CvStorage : ICvStorage
{
    private const string Folder = "CVs";

    // Magic numbers: %PDF, OLE2 (legacy .doc), ZIP (OOXML .docx).
    private static readonly Dictionary<string, byte[]> Signatures = new(StringComparer.OrdinalIgnoreCase)
    {
        [".pdf"] = "%PDF"u8.ToArray(),
        [".doc"] = [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1],
        [".docx"] = [0x50, 0x4B, 0x03, 0x04],
    };

    private readonly FileStorageOptions _options;
    private readonly string _root;

    public CvStorage(IOptions<FileStorageOptions> options, IWebHostEnvironment env)
    {
        _options = options.Value;
        _root = Path.GetFullPath(Path.Combine(env.ContentRootPath, _options.RootPath));
    }

    public async Task<string> SaveAsync(IFormFile file, CancellationToken ct = default)
    {
        if (file.Length == 0)
            throw new CvValidationException("CV file is empty.");
        if (file.Length > _options.MaxCvSizeBytes)
            throw new CvValidationException($"CV must be smaller than {_options.MaxCvSizeBytes / (1024 * 1024)} MB.");

        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(extension) ||
            !_options.AllowedCvExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase) ||
            !Signatures.TryGetValue(extension, out var signature))
        {
            throw new CvValidationException("Only PDF, DOC and DOCX files are allowed.");
        }

        await using (var probe = file.OpenReadStream())
        {
            var header = new byte[signature.Length];
            var read = await probe.ReadAtLeastAsync(header, header.Length, throwOnEndOfStream: false, ct);
            if (read < header.Length || !header.AsSpan().SequenceEqual(signature))
                throw new CvValidationException("The file content does not match its extension.");
        }

        var directory = Path.Combine(_root, Folder);
        Directory.CreateDirectory(directory);

        // Never trust the client file name: keep a short sanitized version for readability only.
        var baseName = SanitizeFileName(Path.GetFileNameWithoutExtension(file.FileName));
        var fileName = $"{Guid.NewGuid():N}_{baseName}{extension.ToLowerInvariant()}";

        await using (var target = new FileStream(Path.Combine(directory, fileName), FileMode.CreateNew))
        {
            await file.CopyToAsync(target, ct);
        }

        return $"{Folder}/{fileName}";
    }

    public string? Resolve(string? relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
            return null;

        var fullPath = Path.GetFullPath(Path.Combine(_root, relativePath));

        // Guard against path traversal ("../") in stored values.
        var rootWithSeparator = _root.EndsWith(Path.DirectorySeparatorChar) ? _root : _root + Path.DirectorySeparatorChar;
        if (!fullPath.StartsWith(rootWithSeparator, StringComparison.OrdinalIgnoreCase))
            return null;

        return File.Exists(fullPath) ? fullPath : null;
    }

    public void Delete(string? relativePath)
    {
        var fullPath = Resolve(relativePath);
        if (fullPath is not null)
            File.Delete(fullPath);
    }

    private static string SanitizeFileName(string name)
    {
        var invalid = Path.GetInvalidFileNameChars();
        var cleaned = new string(name.Where(c => !invalid.Contains(c) && c != ' ').Take(50).ToArray());
        return string.IsNullOrEmpty(cleaned) ? "cv" : cleaned;
    }
}
