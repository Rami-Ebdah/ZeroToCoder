using System.ComponentModel.DataAnnotations;

namespace ZeroToCoder.Api.Models;

public class Reply
{
    [Key]
    public int ReplyID { get; set; }

    public int PostID { get; set; }

    public int UserID { get; set; }

    [Required, MaxLength(500)]
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Post Post { get; set; } = null!;
    public User User { get; set; } = null!;
    public List<ReplyLike> ReplyLikes { get; set; } = [];
    public List<ReplyReport> ReplyReports { get; set; } = [];
}
