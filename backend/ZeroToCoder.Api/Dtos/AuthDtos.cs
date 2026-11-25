using System.ComponentModel.DataAnnotations;

namespace ZeroToCoder.Api.Dtos;

public class SignupRequest
{
    [Required, StringLength(100, MinimumLength = 2)]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required, StringLength(128, MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;
}

public class LoginRequest
{
    [Required, MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(128)]
    public string Password { get; set; } = string.Empty;
}
