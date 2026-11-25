using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using ZeroToCoder.Api.Common;
using ZeroToCoder.Api.Data;
using ZeroToCoder.Api.Helpers;
using ZeroToCoder.Api.Models;

namespace ZeroToCoder.Api.Tests.Infrastructure;

/// <summary>
/// Boots the real API against a private in-memory SQLite database (FK constraints enforced),
/// so tests never touch the developer's SQL Server.
/// </summary>
public sealed class ApiFactory : WebApplicationFactory<Program>
{
    public const string Password = "Passw0rd!";

    private readonly SqliteConnection _connection = new("DataSource=:memory:");

    public string StorageRoot { get; } = Path.Combine(Path.GetTempPath(), "z2c-tests-" + Guid.NewGuid().ToString("N"));

    public ApiFactory() => _connection.Open();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration(config => config.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "test-signing-key-that-is-definitely-long-enough-123456",
            ["Jwt:Issuer"] = "tests",
            ["Jwt:Audience"] = "tests",
            ["FileStorage:RootPath"] = StorageRoot,
            ["RateLimiting:AuthPermitPerMinute"] = "1000",
        }));

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<AppDbContext>>();
            services.AddDbContext<AppDbContext>(o => o.UseSqlite(_connection));

            using var scope = services.BuildServiceProvider().CreateScope();
            scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.EnsureCreated();
        });
    }

    public async Task<T> WithDbAsync<T>(Func<AppDbContext, Task<T>> action)
    {
        using var scope = Services.CreateScope();
        return await action(scope.ServiceProvider.GetRequiredService<AppDbContext>());
    }

    public Task WithDbAsync(Func<AppDbContext, Task> action) =>
        WithDbAsync(async db => { await action(db); return true; });

    public Task<User> CreateUserAsync(string role = Roles.User, string? passwordHash = null) =>
        WithDbAsync(async db =>
        {
            var user = new User
            {
                FullName = "Test " + role,
                Email = $"{Guid.NewGuid():N}@test.dev",
                PasswordHash = passwordHash ?? PasswordHasher.Hash(Password),
                Role = role,
                DateJoined = DateTime.UtcNow,
            };
            db.Users.Add(user);
            await db.SaveChangesAsync();
            return user;
        });

    public async Task<HttpClient> CreateClientForAsync(User user)
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync("/api/users/login", new { email = user.Email, password = Password });
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<LoginResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", body!.Token);
        return client;
    }

    public async Task<HttpClient> CreateClientAsync(string role = Roles.User) =>
        await CreateClientForAsync(await CreateUserAsync(role));

    public Task<Course> CreateCourseAsync(string title = "Course") =>
        WithDbAsync(async db =>
        {
            var course = new Course { CourseTitle = title + " " + Guid.NewGuid().ToString("N")[..6], Price = 10 };
            db.Courses.Add(course);
            await db.SaveChangesAsync();
            return course;
        });

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (!disposing) return;
        _connection.Dispose();
        if (Directory.Exists(StorageRoot))
            Directory.Delete(StorageRoot, recursive: true);
    }

    public sealed record LoginResponse(string Token, LoginUser User);

    public sealed record LoginUser(int UserID, string FullName, string Email, string Role);
}
