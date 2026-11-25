using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using ZeroToCoder.Api.Common;
using ZeroToCoder.Api.Tests.Infrastructure;

namespace ZeroToCoder.Api.Tests;

public class AuthAndUsersTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task Signup_ThenLogin_ReturnsTokenAndUser()
    {
        var client = factory.CreateClient();
        var email = $"{Guid.NewGuid():N}@Example.com";

        var signup = await client.PostAsJsonAsync("/api/users/signup", new { fullName = "Jane", email, password = "abcdef1" });
        Assert.Equal(HttpStatusCode.OK, signup.StatusCode);

        var duplicate = await client.PostAsJsonAsync("/api/users/signup", new { fullName = "Jane", email = email.ToUpperInvariant(), password = "abcdef1" });
        Assert.Equal(HttpStatusCode.Conflict, duplicate.StatusCode);

        var login = await client.PostAsJsonAsync("/api/users/login", new { email, password = "abcdef1" });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        var body = await login.Content.ReadFromJsonAsync<ApiFactory.LoginResponse>();
        Assert.False(string.IsNullOrEmpty(body!.Token));
        Assert.Equal(Roles.User, body.User.Role);

        var stored = await factory.WithDbAsync(db => db.Users.SingleAsync(u => u.Email == email.ToLowerInvariant()));
        Assert.StartsWith("pbkdf2$", stored.PasswordHash);
    }

    [Theory]
    [InlineData("", "a@b.com", "abcdef1")]
    [InlineData("Jane", "not-an-email", "abcdef1")]
    [InlineData("Jane", "a@b.com", "123")]
    public async Task Signup_ValidatesInput(string fullName, string email, string password)
    {
        var response = await factory.CreateClient().PostAsJsonAsync("/api/users/signup", new { fullName, email, password });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithWrongPassword_Returns401()
    {
        var user = await factory.CreateUserAsync();
        var response = await factory.CreateClient().PostAsJsonAsync("/api/users/login", new { email = user.Email, password = "wrong-password" });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_UpgradesLegacyHash()
    {
        var legacy = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(ApiFactory.Password)));
        var user = await factory.CreateUserAsync(passwordHash: legacy);

        await factory.CreateClientForAsync(user);

        var stored = await factory.WithDbAsync(db => db.Users.SingleAsync(u => u.UserID == user.UserID));
        Assert.StartsWith("pbkdf2$", stored.PasswordHash);
    }

    [Fact]
    public async Task Me_ReturnsOwnProfileWithoutPassword()
    {
        var user = await factory.CreateUserAsync();
        var client = await factory.CreateClientForAsync(user);

        var json = await client.GetStringAsync("/api/users/me");

        Assert.Contains(user.Email, json);
        Assert.DoesNotContain("password", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("pbkdf2", json);
    }

    [Fact]
    public async Task UpdateMe_ChangesOnlyTheCaller()
    {
        var user = await factory.CreateUserAsync();
        var other = await factory.CreateUserAsync();
        var client = await factory.CreateClientForAsync(user);

        var response = await client.PutAsJsonAsync("/api/users/me", new { fullName = "Renamed", password = "newpass1" });
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        var (updated, untouched) = await factory.WithDbAsync(async db =>
            (await db.Users.SingleAsync(u => u.UserID == user.UserID), await db.Users.SingleAsync(u => u.UserID == other.UserID)));
        Assert.Equal("Renamed", updated.FullName);
        Assert.Equal(other.FullName, untouched.FullName);
        Assert.Equal(other.PasswordHash, untouched.PasswordHash);
    }

    [Fact]
    public async Task UpdateMe_RejectsValuesLongerThanTheColumns()
    {
        var client = await factory.CreateClientAsync();
        var response = await client.PutAsJsonAsync("/api/users/me", new { address = new string('x', 51) });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task AdminUserLookup_IsForbiddenForRegularUsers()
    {
        var user = await factory.CreateUserAsync();
        var client = await factory.CreateClientForAsync(user);

        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync($"/api/users/by-email/{user.Email}")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PutAsync($"/api/users/block/{user.UserID}?block=true", null)).StatusCode);
    }

    [Fact]
    public async Task BlockedUser_IsLockedOutImmediately()
    {
        var admin = await factory.CreateClientAsync(Roles.Admin);
        var user = await factory.CreateUserAsync();
        var userClient = await factory.CreateClientForAsync(user);

        var lookup = await admin.GetFromJsonAsync<Dictionary<string, object>>($"/api/users/by-email/{user.Email}");
        Assert.NotNull(lookup);

        var block = await admin.PutAsync($"/api/users/block/{user.UserID}?block=true", null);
        Assert.Equal(HttpStatusCode.OK, block.StatusCode);

        // The token issued before the block must stop working...
        Assert.Equal(HttpStatusCode.Unauthorized, (await userClient.GetAsync("/api/users/me")).StatusCode);

        // ...and logging in again is refused.
        var login = await factory.CreateClient().PostAsJsonAsync("/api/users/login", new { email = user.Email, password = ApiFactory.Password });
        Assert.Equal(HttpStatusCode.Forbidden, login.StatusCode);
    }

    [Fact]
    public async Task PurchaseHistory_ReturnsCallersEnrollments()
    {
        var user = await factory.CreateUserAsync();
        var client = await factory.CreateClientForAsync(user);
        var course = await factory.CreateCourseAsync();
        await client.PostAsync($"/api/enrollments/{course.CourseID}", null);

        var history = await client.GetFromJsonAsync<List<Dictionary<string, object>>>("/api/users/purchase-history");

        Assert.Single(history!);
    }
}
