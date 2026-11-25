using System.ComponentModel.DataAnnotations;

namespace ZeroToCoder.Api.Dtos;

/// <summary>Job post; used for both reads and admin create/update.</summary>
public class JobPostDto
{
    public int JobID { get; set; }

    [Required, MaxLength(255)]
    public string? Title { get; set; }

    [MaxLength(100)]
    public string? Company { get; set; }

    [MaxLength(100)]
    public string? Location { get; set; }

    [MaxLength(100)]
    public string? Type { get; set; }

    [MaxLength(100)]
    public string? EmploymentType { get; set; }

    public string? Description { get; set; }

    [MaxLength(100)]
    public string? AboutJob { get; set; }

    [MaxLength(100)]
    public string? AboutCompany { get; set; }

    /// <summary>Pipe-separated list of skills.</summary>
    [MaxLength(100)]
    public string? Skills { get; set; }
}

/// <summary>Multipart form for applying to a job. The applicant is taken from the access token.</summary>
public class JobApplicationRequest
{
    [Range(1, int.MaxValue)]
    public int JobID { get; set; }

    [Required]
    public IFormFile? CV { get; set; }
}

public class JobApplicationDto
{
    public int ApplicationID { get; set; }
    public int UserId { get; set; }
    public int JobID { get; set; }
    public string? CV { get; set; }
    public DateTime AppliedAt { get; set; }
}
