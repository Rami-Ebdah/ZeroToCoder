using System.ComponentModel.DataAnnotations;

namespace ZeroToCoder.Api.Dtos;

public class PostDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? Author { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? Timestamp { get; set; }
    public DateTime CreatedAt { get; set; }
    public int Likes { get; set; }
    public bool IsLiked { get; set; }
    public List<ReplyDto> Replies { get; set; } = [];
}

public class ReplyDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? Author { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? Timestamp { get; set; }
    public DateTime CreatedAt { get; set; }
    public int Likes { get; set; }
    public bool IsLiked { get; set; }
}

public class CreatePostRequest
{
    [Required, StringLength(500, MinimumLength = 1)]
    public string Content { get; set; } = string.Empty;
}

public class CreateReplyRequest
{
    [Required, StringLength(500, MinimumLength = 1)]
    public string Content { get; set; } = string.Empty;
}

public class ReportRequest
{
    [MaxLength(500)]
    public string? Reason { get; set; }
}

public record PostLikeResult(int PostId, int Likes, bool IsLiked);

public record ReplyLikeResult(int ReplyId, int Likes, bool IsLiked);
