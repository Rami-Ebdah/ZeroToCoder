using System.Security.Cryptography;
using System.Text;

namespace ZeroToCoder.Api.Helpers;

/// <summary>
/// Salted PBKDF2-SHA256 password hashing.
/// Format: <c>pbkdf2$&lt;iterations&gt;$&lt;base64 salt&gt;$&lt;base64 hash&gt;</c>.
/// Legacy unsalted SHA-256 hashes are still accepted so existing users can log in;
/// callers should re-hash when <see cref="Verify"/> reports <c>needsRehash</c>.
/// </summary>
public static class PasswordHasher
{
    private const string Prefix = "pbkdf2";
    private const int SaltSize = 16;
    private const int KeySize = 32;
    private const int Iterations = 210_000;
    private static readonly HashAlgorithmName Algorithm = HashAlgorithmName.SHA256;

    public static string Hash(string password)
    {
        ArgumentNullException.ThrowIfNull(password);

        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var key = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, Algorithm, KeySize);
        return $"{Prefix}${Iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(key)}";
    }

    public static bool Verify(string password, string? storedHash, out bool needsRehash)
    {
        needsRehash = false;
        if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(storedHash))
            return false;

        var parts = storedHash.Split('$');
        if (parts.Length == 4 && parts[0] == Prefix)
        {
            if (!int.TryParse(parts[1], out var iterations) || iterations <= 0)
                return false;

            byte[] salt, expected;
            try
            {
                salt = Convert.FromBase64String(parts[2]);
                expected = Convert.FromBase64String(parts[3]);
            }
            catch (FormatException)
            {
                return false;
            }

            var actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, Algorithm, expected.Length);
            var ok = CryptographicOperations.FixedTimeEquals(actual, expected);
            needsRehash = ok && iterations < Iterations;
            return ok;
        }

        // Legacy format: base64(SHA256(password)) with no salt.
        var legacy = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        byte[] stored;
        try
        {
            stored = Convert.FromBase64String(storedHash);
        }
        catch (FormatException)
        {
            return false;
        }

        var legacyOk = CryptographicOperations.FixedTimeEquals(legacy, stored);
        needsRehash = legacyOk;
        return legacyOk;
    }
}
