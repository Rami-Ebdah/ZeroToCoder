using System.Net;
using System.Net.Http.Json;
using ZeroToCoder.Api.Common;
using ZeroToCoder.Api.Dtos;
using ZeroToCoder.Api.Tests.Infrastructure;

namespace ZeroToCoder.Api.Tests;

public class CommunityTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task Posting_RequiresAuthentication()
    {
        var response = await factory.CreateClient().PostAsJsonAsync("/api/community/posts", new { content = "hi" });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public async Task Posting_RejectsEmptyContent(string? content)
    {
        var client = await factory.CreateClientAsync();
        var response = await client.PostAsJsonAsync("/api/community/posts", new { content });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Posting_RejectsContentOver500Chars()
    {
        var client = await factory.CreateClientAsync();
        var response = await client.PostAsJsonAsync("/api/community/posts", new { content = new string('a', 501) });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task LikeToggle_ReturnsCountAndState()
    {
        var client = await factory.CreateClientAsync();
        var post = await CreatePostAsync(client);

        var liked = await (await client.PostAsync($"/api/community/posts/{post.Id}/like", null)).Content.ReadFromJsonAsync<PostLikeResult>();
        var unliked = await (await client.PostAsync($"/api/community/posts/{post.Id}/like", null)).Content.ReadFromJsonAsync<PostLikeResult>();

        Assert.Equal((1, true), (liked!.Likes, liked.IsLiked));
        Assert.Equal((0, false), (unliked!.Likes, unliked.IsLiked));
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsync("/api/community/posts/999999/like", null)).StatusCode);
    }

    [Fact]
    public async Task Users_CannotDeleteOthersPosts_ButAdminsCan()
    {
        var author = await factory.CreateClientAsync();
        var stranger = await factory.CreateClientAsync();
        var admin = await factory.CreateClientAsync(Roles.Admin);
        var post = await CreatePostAsync(author);

        Assert.Equal(HttpStatusCode.Forbidden, (await stranger.DeleteAsync($"/api/community/posts/{post.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await admin.DeleteAsync($"/api/community/posts/{post.Id}")).StatusCode);
    }

    [Fact]
    public async Task DeletingPost_RemovesRepliesWithTheirLikesAndReports()
    {
        // Regression: the old implementation left reply likes/reports behind and hit an FK violation.
        var author = await factory.CreateClientAsync();
        var other = await factory.CreateClientAsync();
        var post = await CreatePostAsync(author);

        var reply = await (await other.PostAsJsonAsync($"/api/community/posts/{post.Id}/replies", new { content = "reply" }))
            .Content.ReadFromJsonAsync<ReplyDto>();
        await author.PostAsync($"/api/community/posts/{post.Id}/replies/{reply!.Id}/like", null);
        await author.PostAsJsonAsync($"/api/community/posts/{post.Id}/replies/{reply.Id}/report", new { reason = "spam" });
        await other.PostAsync($"/api/community/posts/{post.Id}/like", null);
        await other.PostAsJsonAsync($"/api/community/posts/{post.Id}/report", new { reason = "spam" });

        var delete = await author.DeleteAsync($"/api/community/posts/{post.Id}");

        Assert.Equal(HttpStatusCode.OK, delete.StatusCode);
        var posts = await author.GetFromJsonAsync<List<PostDto>>("/api/community/posts");
        Assert.DoesNotContain(posts!, p => p.Id == post.Id);
    }

    [Fact]
    public async Task GetPosts_ReflectsCallerLikeStateAndAuthorIds()
    {
        var client = await factory.CreateClientAsync();
        var post = await CreatePostAsync(client);
        await client.PostAsync($"/api/community/posts/{post.Id}/like", null);

        var mine = (await client.GetFromJsonAsync<List<PostDto>>("/api/community/posts"))!.Single(p => p.Id == post.Id);
        var anonymous = (await factory.CreateClient().GetFromJsonAsync<List<PostDto>>("/api/community/posts"))!.Single(p => p.Id == post.Id);

        Assert.True(mine.IsLiked);
        Assert.False(anonymous.IsLiked);
        Assert.Equal(post.UserId, mine.UserId);
    }

    [Fact]
    public async Task Reporting_IsIdempotentPerUser()
    {
        var client = await factory.CreateClientAsync();
        var post = await CreatePostAsync(client);

        var first = await client.PostAsJsonAsync($"/api/community/posts/{post.Id}/report", new { reason = "spam" });
        var second = await client.PostAsync($"/api/community/posts/{post.Id}/report", null);

        Assert.Contains("reported successfully", await first.Content.ReadAsStringAsync());
        Assert.Contains("already reported", await second.Content.ReadAsStringAsync());
    }

    private static async Task<PostDto> CreatePostAsync(HttpClient client)
    {
        var response = await client.PostAsJsonAsync("/api/community/posts", new { content = "Hello community" });
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<PostDto>())!;
    }
}
