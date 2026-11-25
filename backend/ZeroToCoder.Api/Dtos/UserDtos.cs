using System.ComponentModel.DataAnnotations;

namespace ZeroToCoder.Api.Dtos;

/// <summary>Profile returned to its owner. Never contains the password hash.</summary>
public class UserProfileDto
{
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Expertise { get; set; }
    public string? Bio { get; set; }
    public string? Image { get; set; }
}

/// <summary>Partial profile update: only non-empty fields are applied.</summary>
public class UpdateProfileRequest
{
    [StringLength(100, MinimumLength = 2)]
    public string? FullName { get; set; }

    [MaxLength(50)]
    public string? Phone { get; set; }

    [MaxLength(50)]
    public string? Address { get; set; }

    public DateTime? DateOfBirth { get; set; }

    [MaxLength(255)]
    public string? Expertise { get; set; }

    [MaxLength(2000)]
    public string? Bio { get; set; }

    [MaxLength(200)]
    public string? Image { get; set; }

    [StringLength(128, MinimumLength = 6)]
    public string? Password { get; set; }
}

public class UserSummaryDto
{
    public int Id { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public bool IsBlocked { get; set; }
}

public class PurchaseHistoryDto
{
    public string? CourseTitle { get; set; }
    public DateTime DateEnrolled { get; set; }
    public double? Price { get; set; }
}
