using System.ComponentModel.DataAnnotations;

namespace ZeroToCoder.Api.Options;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    /// <summary>HMAC-SHA256 signing key. Must be at least 32 characters; keep it out of source control.</summary>
    [Required, MinLength(32)]
    public string Key { get; set; } = string.Empty;

    [Required]
    public string Issuer { get; set; } = string.Empty;

    [Required]
    public string Audience { get; set; } = string.Empty;

    [Range(1, 1440)]
    public int ExpireMinutes { get; set; } = 120;
}
