namespace ZeroToCoder.Api.Options;

public sealed class FileStorageOptions
{
    public const string SectionName = "FileStorage";

    /// <summary>Root folder for private uploads, relative to the content root. Never served statically.</summary>
    public string RootPath { get; set; } = "Storage";

    public long MaxCvSizeBytes { get; set; } = 5 * 1024 * 1024;

    public string[] AllowedCvExtensions { get; set; } = [".pdf", ".doc", ".docx"];
}
