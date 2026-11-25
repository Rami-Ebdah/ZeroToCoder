using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZeroToCoder.Api.Common;
using ZeroToCoder.Api.Data;
using ZeroToCoder.Api.Dtos;
using ZeroToCoder.Api.Models;

namespace ZeroToCoder.Api.Controllers;

public class BundlesController(AppDbContext db, TimeProvider clock) : ApiControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BundleDto>>> GetBundles(CancellationToken ct) =>
        Ok(await db.Bundles.AsNoTracking().Select(b => ToDto(b)).ToListAsync(ct));

    [AllowAnonymous]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<BundleDto>> GetBundle(int id, CancellationToken ct)
    {
        var bundle = await db.Bundles.AsNoTracking().FirstOrDefaultAsync(b => b.BundleID == id, ct);
        return bundle is null ? Message(StatusCodes.Status404NotFound, "Bundle not found.") : Ok(ToDto(bundle));
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPost]
    public async Task<IActionResult> AddBundle(BundleUpsertRequest request, CancellationToken ct)
    {
        if (request.DiscountedPrice > request.OriginalPrice)
            return Message(StatusCodes.Status400BadRequest, "Discounted price cannot exceed the original price.");

        var bundle = new Bundle();
        Apply(bundle, request);
        db.Bundles.Add(bundle);
        await db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetBundle), new { id = bundle.BundleID }, ToDto(bundle));
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateBundle(int id, BundleUpsertRequest request, CancellationToken ct)
    {
        if (request.DiscountedPrice > request.OriginalPrice)
            return Message(StatusCodes.Status400BadRequest, "Discounted price cannot exceed the original price.");

        var bundle = await db.Bundles.FindAsync([id], ct);
        if (bundle is null)
            return Message(StatusCodes.Status404NotFound, "Bundle not found.");

        Apply(bundle, request);
        await db.SaveChangesAsync(ct);
        return Ok(new { message = "Bundle updated successfully." });
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteBundle(int id, CancellationToken ct)
    {
        var bundle = await db.Bundles.FindAsync([id], ct);
        if (bundle is null)
            return Message(StatusCodes.Status404NotFound, "Bundle not found.");

        db.Bundles.Remove(bundle);
        await db.SaveChangesAsync(ct);
        return Ok(new { message = $"Bundle '{bundle.Name}' deleted successfully." });
    }

    /// <summary>Kept for the admin UI, which deletes bundles by name.</summary>
    [Authorize(Roles = Roles.Admin)]
    [HttpDelete("by-name")]
    public async Task<IActionResult> DeleteBundleByName([FromQuery] string name, CancellationToken ct)
    {
        var bundle = await db.Bundles.FirstOrDefaultAsync(b => b.Name == name, ct);
        if (bundle is null)
            return Message(StatusCodes.Status404NotFound, "Bundle not found.");

        db.Bundles.Remove(bundle);
        await db.SaveChangesAsync(ct);
        return Ok(new { message = $"Bundle '{name}' deleted successfully." });
    }

    [Authorize]
    [HttpPost("enroll/{bundleId:int}")]
    public async Task<IActionResult> EnrollInBundle(int bundleId, CancellationToken ct)
    {
        var userId = CurrentUserId;

        var bundle = await db.Bundles.AsNoTracking().FirstOrDefaultAsync(b => b.BundleID == bundleId, ct);
        if (bundle is null)
            return Message(StatusCodes.Status404NotFound, "Bundle not found.");

        var courseNames = (bundle.Courses ?? string.Empty)
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (courseNames.Count == 0)
            return Message(StatusCodes.Status400BadRequest, "Bundle has no courses.");

        // Two queries instead of two per course.
        var courses = await db.Courses
            .Where(c => c.CourseTitle != null && courseNames.Contains(c.CourseTitle))
            .Select(c => new { c.CourseID, c.CourseTitle })
            .ToListAsync(ct);

        var courseIds = courses.Select(c => c.CourseID).ToList();
        var alreadyEnrolledIds = await db.Enrollments
            .Where(e => e.UserID == userId && courseIds.Contains(e.CourseID))
            .Select(e => e.CourseID)
            .ToListAsync(ct);

        var now = clock.GetUtcNow().UtcDateTime;
        var newlyEnrolled = new List<string>();
        var alreadyEnrolled = new List<string>();

        foreach (var course in courses)
        {
            if (alreadyEnrolledIds.Contains(course.CourseID))
            {
                alreadyEnrolled.Add(course.CourseTitle!);
                continue;
            }

            db.Enrollments.Add(new Enrollment { UserID = userId, CourseID = course.CourseID, DateEnrolled = now });
            newlyEnrolled.Add(course.CourseTitle!);
        }

        await db.SaveChangesAsync(ct);

        var found = courses.Select(c => c.CourseTitle!).ToHashSet(StringComparer.OrdinalIgnoreCase);
        return Ok(new
        {
            message = "Enrollment completed.",
            newlyEnrolledCourses = newlyEnrolled,
            alreadyEnrolledCourses = alreadyEnrolled,
            coursesNotFound = courseNames.Where(n => !found.Contains(n)).ToList(),
        });
    }

    private static BundleDto ToDto(Bundle b) => new()
    {
        BundleID = b.BundleID,
        Name = b.Name,
        Courses = b.Courses,
        OriginalPrice = b.OriginalPrice,
        DiscountedPrice = b.DiscountedPrice,
    };

    private static void Apply(Bundle bundle, BundleUpsertRequest request)
    {
        bundle.Name = request.Name?.Trim();
        bundle.Courses = request.Courses?.Trim();
        bundle.OriginalPrice = request.OriginalPrice;
        bundle.DiscountedPrice = request.DiscountedPrice;
    }
}
