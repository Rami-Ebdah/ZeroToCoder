using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using ZeroToCoder.Api.Common;
using ZeroToCoder.Api.Data;
using ZeroToCoder.Api.Dtos;
using ZeroToCoder.Api.Helpers;
using ZeroToCoder.Api.Models;
using ZeroToCoder.Api.Services;

namespace ZeroToCoder.Api.Controllers;

public class UsersController(AppDbContext db, ITokenService tokens, TimeProvider clock) : ApiControllerBase
{
    private const string InvalidCredentials = "Invalid email or password.";

    [AllowAnonymous]
    [EnableRateLimiting(RateLimitPolicies.Auth)]
    [HttpPost("signup")]
    public async Task<IActionResult> Signup(SignupRequest request, CancellationToken ct)
    {
        var email = NormalizeEmail(request.Email);
        if (await db.Users.AnyAsync(u => u.Email == email, ct))
            return Message(StatusCodes.Status409Conflict, "Email is already registered.");

        db.Users.Add(new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            PasswordHash = PasswordHasher.Hash(request.Password),
            DateJoined = clock.GetUtcNow().UtcDateTime,
            IsBlocked = false,
            Role = Roles.User,
        });
        await db.SaveChangesAsync(ct);

        return Ok(new { message = "User registered successfully." });
    }

    [AllowAnonymous]
    [EnableRateLimiting(RateLimitPolicies.Auth)]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken ct)
    {
        var email = NormalizeEmail(request.Email);
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

        if (user is null || !PasswordHasher.Verify(request.Password, user.PasswordHash, out var needsRehash))
            return Message(StatusCodes.Status401Unauthorized, InvalidCredentials);

        if (user.IsBlocked)
            return Message(StatusCodes.Status403Forbidden, "Your account has been blocked. Please contact support.");

        if (needsRehash)
        {
            // Transparently upgrade legacy unsalted SHA-256 hashes to PBKDF2.
            user.PasswordHash = PasswordHasher.Hash(request.Password);
            await db.SaveChangesAsync(ct);
        }

        return Ok(new
        {
            message = "Login successful",
            token = tokens.CreateToken(user),
            user = new
            {
                userID = user.UserID,
                fullName = user.FullName,
                email = user.Email,
                dateJoined = user.DateJoined,
                role = Roles.Normalize(user.Role),
            },
        });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserProfileDto>> GetMyProfile(CancellationToken ct)
    {
        var profile = await db.Users
            .AsNoTracking()
            .Where(u => u.UserID == CurrentUserId)
            .Select(u => new UserProfileDto
            {
                FullName = u.FullName,
                Email = u.Email,
                Phone = u.Phone,
                Address = u.Address,
                DateOfBirth = u.DateOfBirth,
                Expertise = u.Expertise,
                Bio = u.Bio,
                Image = u.Image,
            })
            .FirstOrDefaultAsync(ct);

        return profile is null ? NotFound() : Ok(profile);
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMyProfile(UpdateProfileRequest request, CancellationToken ct)
    {
        var user = await db.Users.FindAsync([CurrentUserId], ct);
        if (user is null)
            return NotFound();

        if (!string.IsNullOrWhiteSpace(request.FullName)) user.FullName = request.FullName.Trim();
        if (!string.IsNullOrWhiteSpace(request.Phone)) user.Phone = request.Phone.Trim();
        if (!string.IsNullOrWhiteSpace(request.Image)) user.Image = request.Image.Trim();
        if (!string.IsNullOrWhiteSpace(request.Address)) user.Address = request.Address.Trim();
        if (request.DateOfBirth.HasValue) user.DateOfBirth = request.DateOfBirth.Value.Date;
        if (!string.IsNullOrWhiteSpace(request.Expertise)) user.Expertise = request.Expertise.Trim();
        if (!string.IsNullOrWhiteSpace(request.Bio)) user.Bio = request.Bio.Trim();
        if (!string.IsNullOrWhiteSpace(request.Password)) user.PasswordHash = PasswordHasher.Hash(request.Password);

        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [Authorize]
    [HttpGet("purchase-history")]
    public async Task<ActionResult<IEnumerable<PurchaseHistoryDto>>> GetPurchaseHistory(CancellationToken ct)
    {
        var history = await db.Enrollments
            .AsNoTracking()
            .Where(e => e.UserID == CurrentUserId)
            .OrderByDescending(e => e.DateEnrolled)
            .Select(e => new PurchaseHistoryDto
            {
                CourseTitle = e.Course.CourseTitle,
                DateEnrolled = e.DateEnrolled,
                Price = e.Course.Price,
            })
            .ToListAsync(ct);

        return Ok(history);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpGet("{id:int}")]
    public Task<ActionResult<UserSummaryDto>> GetUserById(int id, CancellationToken ct) =>
        FindSummaryAsync(u => u.UserID == id, ct);

    [Authorize(Roles = Roles.Admin)]
    [HttpGet("by-email/{email}")]
    public Task<ActionResult<UserSummaryDto>> GetUserByEmail(string email, CancellationToken ct)
    {
        var normalized = NormalizeEmail(email);
        return FindSummaryAsync(u => u.Email == normalized, ct);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPut("block/{userId:int}")]
    public async Task<IActionResult> BlockUser(int userId, [FromQuery] bool block, CancellationToken ct)
    {
        if (userId == CurrentUserId)
            return Message(StatusCodes.Status400BadRequest, "You cannot block your own account.");

        var user = await db.Users.FindAsync([userId], ct);
        if (user is null)
            return Message(StatusCodes.Status404NotFound, "User not found.");

        user.IsBlocked = block;
        await db.SaveChangesAsync(ct);

        return Ok(new { message = block ? "User blocked successfully." : "User unblocked successfully." });
    }

    private async Task<ActionResult<UserSummaryDto>> FindSummaryAsync(
        System.Linq.Expressions.Expression<Func<User, bool>> predicate, CancellationToken ct)
    {
        var user = await db.Users
            .AsNoTracking()
            .Where(predicate)
            .Select(u => new UserSummaryDto { Id = u.UserID, FullName = u.FullName, Email = u.Email, IsBlocked = u.IsBlocked })
            .FirstOrDefaultAsync(ct);

        return user is null ? Message(StatusCodes.Status404NotFound, "User not found.") : Ok(user);
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
