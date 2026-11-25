using System.ComponentModel.DataAnnotations;

namespace ZeroToCoder.Api.Models;

public class PostLike
{
    [Key]
    public int PostLikeID { get; set; }

    public int PostID { get; set; }

    public int UserID { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Post Post { get; set; } = null!;
    public User User { get; set; } = null!;
}
