using Microsoft.EntityFrameworkCore;
using ZeroToCoder.Api.Data;
using ZeroToCoder.Api.Dtos;
using ZeroToCoder.Api.Models;

namespace ZeroToCoder.Api.Services;

public enum ReportOutcome { NotFound, AlreadyReported, Reported }

public enum DeleteOutcome { NotFound, Forbidden, Deleted }

public interface ICommunityService
{
    Task<List<PostDto>> GetPostsAsync(int? currentUserId, CancellationToken ct = default);
    Task<PostDto> CreatePostAsync(int userId, string content, CancellationToken ct = default);
    Task<PostLikeResult?> TogglePostLikeAsync(int userId, int postId, CancellationToken ct = default);
    Task<ReportOutcome> ReportPostAsync(int userId, int postId, string? reason, CancellationToken ct = default);
    Task<DeleteOutcome> DeletePostAsync(int userId, bool isAdmin, int postId, CancellationToken ct = default);

    Task<ReplyDto?> CreateReplyAsync(int userId, int postId, string content, CancellationToken ct = default);
    Task<ReplyLikeResult?> ToggleReplyLikeAsync(int userId, int postId, int replyId, CancellationToken ct = default);
    Task<ReportOutcome> ReportReplyAsync(int userId, int postId, int replyId, string? reason, CancellationToken ct = default);
    Task<DeleteOutcome> DeleteReplyAsync(int userId, bool isAdmin, int postId, int replyId, CancellationToken ct = default);
}

public sealed class CommunityService(AppDbContext db, TimeProvider clock) : ICommunityService
{
    private DateTime UtcNow => clock.GetUtcNow().UtcDateTime;

    public async Task<List<PostDto>> GetPostsAsync(int? currentUserId, CancellationToken ct = default)
    {
        var uid = currentUserId ?? 0;

        var posts = await db.Posts
            .AsNoTracking()
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new PostDto
            {
                Id = p.PostID,
                UserId = p.UserID,
                Author = p.User.FullName,
                Content = p.Content,
                CreatedAt = p.CreatedAt,
                Likes = p.PostLikes.Count,
                IsLiked = p.PostLikes.Any(l => l.UserID == uid),
                Replies = p.Replies
                    .OrderBy(r => r.CreatedAt)
                    .Select(r => new ReplyDto
                    {
                        Id = r.ReplyID,
                        UserId = r.UserID,
                        Author = r.User.FullName,
                        Content = r.Content,
                        CreatedAt = r.CreatedAt,
                        Likes = r.ReplyLikes.Count,
                        IsLiked = r.ReplyLikes.Any(l => l.UserID == uid),
                    })
                    .ToList(),
            })
            .AsSplitQuery()
            .ToListAsync(ct);

        foreach (var post in posts)
        {
            post.Timestamp = TimeAgo(post.CreatedAt);
            foreach (var reply in post.Replies)
                reply.Timestamp = TimeAgo(reply.CreatedAt);
        }

        return posts;
    }

    public async Task<PostDto> CreatePostAsync(int userId, string content, CancellationToken ct = default)
    {
        var author = await db.Users.Where(u => u.UserID == userId).Select(u => u.FullName).FirstAsync(ct);

        var post = new Post { UserID = userId, Content = content.Trim(), CreatedAt = UtcNow };
        db.Posts.Add(post);
        await db.SaveChangesAsync(ct);

        return new PostDto
        {
            Id = post.PostID,
            UserId = userId,
            Author = author,
            Content = post.Content,
            CreatedAt = post.CreatedAt,
            Timestamp = TimeAgo(post.CreatedAt),
        };
    }

    public async Task<PostLikeResult?> TogglePostLikeAsync(int userId, int postId, CancellationToken ct = default)
    {
        if (!await db.Posts.AnyAsync(p => p.PostID == postId, ct))
            return null;

        var existing = await db.PostLikes.FirstOrDefaultAsync(l => l.PostID == postId && l.UserID == userId, ct);
        if (existing is not null)
            db.PostLikes.Remove(existing);
        else
            db.PostLikes.Add(new PostLike { PostID = postId, UserID = userId, CreatedAt = UtcNow });

        await db.SaveChangesAsync(ct);

        var likes = await db.PostLikes.CountAsync(l => l.PostID == postId, ct);
        return new PostLikeResult(postId, likes, existing is null);
    }

    public async Task<ReportOutcome> ReportPostAsync(int userId, int postId, string? reason, CancellationToken ct = default)
    {
        if (!await db.Posts.AnyAsync(p => p.PostID == postId, ct))
            return ReportOutcome.NotFound;

        if (await db.PostReports.AnyAsync(r => r.PostID == postId && r.UserID == userId, ct))
            return ReportOutcome.AlreadyReported;

        db.PostReports.Add(new PostReport { PostID = postId, UserID = userId, Reason = reason?.Trim(), CreatedAt = UtcNow });
        await db.SaveChangesAsync(ct);
        return ReportOutcome.Reported;
    }

    public async Task<DeleteOutcome> DeletePostAsync(int userId, bool isAdmin, int postId, CancellationToken ct = default)
    {
        var post = await db.Posts.FirstOrDefaultAsync(p => p.PostID == postId, ct);
        if (post is null)
            return DeleteOutcome.NotFound;
        if (post.UserID != userId && !isAdmin)
            return DeleteOutcome.Forbidden;

        await using var tx = await BeginTransactionAsync(ct);

        // Children first: reply likes/reports would otherwise violate FK constraints
        // (the previous implementation forgot these and failed with a 500).
        var replyIds = db.Replies.Where(r => r.PostID == postId).Select(r => r.ReplyID);
        db.ReplyLikes.RemoveRange(db.ReplyLikes.Where(l => replyIds.Contains(l.ReplyID)));
        db.ReplyReports.RemoveRange(db.ReplyReports.Where(r => replyIds.Contains(r.ReplyID)));
        db.Replies.RemoveRange(db.Replies.Where(r => r.PostID == postId));
        db.PostLikes.RemoveRange(db.PostLikes.Where(l => l.PostID == postId));
        db.PostReports.RemoveRange(db.PostReports.Where(r => r.PostID == postId));
        db.Posts.Remove(post);

        await db.SaveChangesAsync(ct);
        if (tx is not null) await tx.CommitAsync(ct);
        return DeleteOutcome.Deleted;
    }

    public async Task<ReplyDto?> CreateReplyAsync(int userId, int postId, string content, CancellationToken ct = default)
    {
        if (!await db.Posts.AnyAsync(p => p.PostID == postId, ct))
            return null;

        var author = await db.Users.Where(u => u.UserID == userId).Select(u => u.FullName).FirstAsync(ct);

        var reply = new Reply { PostID = postId, UserID = userId, Content = content.Trim(), CreatedAt = UtcNow };
        db.Replies.Add(reply);
        await db.SaveChangesAsync(ct);

        return new ReplyDto
        {
            Id = reply.ReplyID,
            UserId = userId,
            Author = author,
            Content = reply.Content,
            CreatedAt = reply.CreatedAt,
            Timestamp = TimeAgo(reply.CreatedAt),
        };
    }

    public async Task<ReplyLikeResult?> ToggleReplyLikeAsync(int userId, int postId, int replyId, CancellationToken ct = default)
    {
        if (!await db.Replies.AnyAsync(r => r.ReplyID == replyId && r.PostID == postId, ct))
            return null;

        var existing = await db.ReplyLikes.FirstOrDefaultAsync(l => l.ReplyID == replyId && l.UserID == userId, ct);
        if (existing is not null)
            db.ReplyLikes.Remove(existing);
        else
            db.ReplyLikes.Add(new ReplyLike { ReplyID = replyId, UserID = userId, CreatedAt = UtcNow });

        await db.SaveChangesAsync(ct);

        var likes = await db.ReplyLikes.CountAsync(l => l.ReplyID == replyId, ct);
        return new ReplyLikeResult(replyId, likes, existing is null);
    }

    public async Task<ReportOutcome> ReportReplyAsync(int userId, int postId, int replyId, string? reason, CancellationToken ct = default)
    {
        if (!await db.Replies.AnyAsync(r => r.ReplyID == replyId && r.PostID == postId, ct))
            return ReportOutcome.NotFound;

        if (await db.ReplyReports.AnyAsync(r => r.ReplyID == replyId && r.UserID == userId, ct))
            return ReportOutcome.AlreadyReported;

        db.ReplyReports.Add(new ReplyReport { ReplyID = replyId, UserID = userId, Reason = reason?.Trim(), CreatedAt = UtcNow });
        await db.SaveChangesAsync(ct);
        return ReportOutcome.Reported;
    }

    public async Task<DeleteOutcome> DeleteReplyAsync(int userId, bool isAdmin, int postId, int replyId, CancellationToken ct = default)
    {
        var reply = await db.Replies.FirstOrDefaultAsync(r => r.ReplyID == replyId && r.PostID == postId, ct);
        if (reply is null)
            return DeleteOutcome.NotFound;
        if (reply.UserID != userId && !isAdmin)
            return DeleteOutcome.Forbidden;

        db.ReplyLikes.RemoveRange(db.ReplyLikes.Where(l => l.ReplyID == replyId));
        db.ReplyReports.RemoveRange(db.ReplyReports.Where(r => r.ReplyID == replyId));
        db.Replies.Remove(reply);
        await db.SaveChangesAsync(ct);
        return DeleteOutcome.Deleted;
    }

    private async Task<Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction?> BeginTransactionAsync(CancellationToken ct) =>
        db.Database.IsRelational() ? await db.Database.BeginTransactionAsync(ct) : null;

    private string TimeAgo(DateTime createdAtUtc)
    {
        var span = UtcNow - createdAtUtc;

        if (span.TotalMinutes < 1) return "just now";
        if (span.TotalMinutes < 60) return Plural((int)span.TotalMinutes, "minute");
        if (span.TotalHours < 24) return Plural((int)span.TotalHours, "hour");
        if (span.TotalDays < 30) return Plural((int)span.TotalDays, "day");
        return createdAtUtc.ToString("yyyy-MM-dd");

        static string Plural(int n, string unit) => n == 1 ? $"1 {unit} ago" : $"{n} {unit}s ago";
    }
}
