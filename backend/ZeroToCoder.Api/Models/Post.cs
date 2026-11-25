using System.ComponentModel.DataAnnotations;

namespace ZeroToCoder.Api.Models;

public class Post
{
    [Key]
    public int PostID { get; set; }

    public int UserID { get; set; }

    [Required, MaxLength(500)]
    public string Content { get; set; } = string.Empty;

    public bool IsApproved { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public List<Reply> Replies { get; set; } = [];
    public List<PostLike> PostLikes { get; set; } = [];
    public List<PostReport> PostReports { get; set; } = [];
}
