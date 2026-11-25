using System.ComponentModel.DataAnnotations;

namespace ZeroToCoder.Api.Models;

public class PostReport
{
    [Key]
    public int PostReportID { get; set; }

    public int PostID { get; set; }

    public int UserID { get; set; }

    [MaxLength(500)]
    public string? Reason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Post Post { get; set; } = null!;
    public User User { get; set; } = null!;
}
