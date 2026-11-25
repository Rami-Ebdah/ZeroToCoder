using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZeroToCoder.Api.Dtos;
using ZeroToCoder.Api.Extensions;
using ZeroToCoder.Api.Services;

namespace ZeroToCoder.Api.Controllers;

[Route("api/[controller]/posts")]
public class CommunityController(ICommunityService community) : ApiControllerBase
{
    /// <summary>All posts with replies. If a token is sent, <c>isLiked</c> reflects the caller.</summary>
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PostDto>>> GetPosts(CancellationToken ct) =>
        Ok(await community.GetPostsAsync(User.GetUserId(), ct));

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<PostDto>> CreatePost(CreatePostRequest request, CancellationToken ct) =>
        Ok(await community.CreatePostAsync(CurrentUserId, request.Content, ct));

    [Authorize]
    [HttpPost("{postId:int}/like")]
    public async Task<IActionResult> TogglePostLike(int postId, CancellationToken ct)
    {
        var result = await community.TogglePostLikeAsync(CurrentUserId, postId, ct);
        return result is null ? Message(StatusCodes.Status404NotFound, "Post not found.") : Ok(result);
    }

    [Authorize]
    [HttpPost("{postId:int}/report")]
    public async Task<IActionResult> ReportPost(int postId, ReportRequest? request, CancellationToken ct) =>
        ReportResult(await community.ReportPostAsync(CurrentUserId, postId, request?.Reason, ct), "Post");

    [Authorize]
    [HttpDelete("{postId:int}")]
    public async Task<IActionResult> DeletePost(int postId, CancellationToken ct) =>
        DeleteResult(await community.DeletePostAsync(CurrentUserId, IsAdmin, postId, ct), "Post");

    [Authorize]
    [HttpPost("{postId:int}/replies")]
    public async Task<IActionResult> CreateReply(int postId, CreateReplyRequest request, CancellationToken ct)
    {
        var reply = await community.CreateReplyAsync(CurrentUserId, postId, request.Content, ct);
        return reply is null ? Message(StatusCodes.Status404NotFound, "Post not found.") : Ok(reply);
    }

    [Authorize]
    [HttpPost("{postId:int}/replies/{replyId:int}/like")]
    public async Task<IActionResult> ToggleReplyLike(int postId, int replyId, CancellationToken ct)
    {
        var result = await community.ToggleReplyLikeAsync(CurrentUserId, postId, replyId, ct);
        return result is null ? Message(StatusCodes.Status404NotFound, "Reply not found.") : Ok(result);
    }

    [Authorize]
    [HttpPost("{postId:int}/replies/{replyId:int}/report")]
    public async Task<IActionResult> ReportReply(int postId, int replyId, ReportRequest? request, CancellationToken ct) =>
        ReportResult(await community.ReportReplyAsync(CurrentUserId, postId, replyId, request?.Reason, ct), "Reply");

    [Authorize]
    [HttpDelete("{postId:int}/replies/{replyId:int}")]
    public async Task<IActionResult> DeleteReply(int postId, int replyId, CancellationToken ct) =>
        DeleteResult(await community.DeleteReplyAsync(CurrentUserId, IsAdmin, postId, replyId, ct), "Reply");

    private IActionResult ReportResult(ReportOutcome outcome, string what) => outcome switch
    {
        ReportOutcome.NotFound => Message(StatusCodes.Status404NotFound, $"{what} not found."),
        ReportOutcome.AlreadyReported => Ok(new { message = $"You have already reported this {what.ToLowerInvariant()}." }),
        _ => Ok(new { message = $"{what} reported successfully" }),
    };

    private IActionResult DeleteResult(DeleteOutcome outcome, string what) => outcome switch
    {
        DeleteOutcome.NotFound => Message(StatusCodes.Status404NotFound, $"{what} not found."),
        DeleteOutcome.Forbidden => Message(StatusCodes.Status403Forbidden, $"You can only delete your own {what.ToLowerInvariant()}s."),
        _ => Ok(new { message = $"{what} deleted successfully" }),
    };
}
