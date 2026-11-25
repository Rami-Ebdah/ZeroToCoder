using System.ComponentModel.DataAnnotations;

namespace ZeroToCoder.Api.Models;

public class ReplyReport
{
    [Key]
    public int ReplyReportID { get; set; }

    public int ReplyID { get; set; }

    public int UserID { get; set; }

    [MaxLength(500)]
    public string? Reason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Reply Reply { get; set; } = null!;
    public User User { get; set; } = null!;
}
