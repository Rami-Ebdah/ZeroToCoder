using System.ComponentModel.DataAnnotations;

namespace ZeroToCoder.Api.Dtos;

public class RoadmapDto
{
    public int RoadmapID { get; set; }
    public string? ImagePath { get; set; }
    public string Specialization { get; set; } = string.Empty;
}

public class RoadmapUpsertRequest
{
    [MaxLength(255)]
    public string? ImagePath { get; set; }

    [Required, MaxLength(100)]
    public string Specialization { get; set; } = string.Empty;
}
