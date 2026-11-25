using System.ComponentModel.DataAnnotations;

namespace ZeroToCoder.Api.Models;

public class ReplyLike
{
    [Key]
    public int ReplyLikeID { get; set; }

    public int ReplyID { get; set; }

    public int UserID { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Reply Reply { get; set; } = null!;
    public User User { get; set; } = null!;
}
