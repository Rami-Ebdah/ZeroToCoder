using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZeroToCoder.Api.Data;
using ZeroToCoder.Api.Models;

namespace ZeroToCoder.Api.Controllers;

[Authorize]
public class EnrollmentsController(AppDbContext db, TimeProvider clock) : ApiControllerBase
{
    /// <remarks>
    /// Payment is simulated on the client; no card data is accepted or stored here.
    /// Plug a real payment provider in before this endpoint if the platform goes live.
    /// </remarks>
    [HttpPost("{courseId:int}")]
    public async Task<IActionResult> Enroll(int courseId, CancellationToken ct)
    {
        var userId = CurrentUserId;

        if (!await db.Courses.AnyAsync(c => c.CourseID == courseId, ct))
            return Message(StatusCodes.Status404NotFound, "Course not found.");

        if (await db.Enrollments.AnyAsync(e => e.UserID == userId && e.CourseID == courseId, ct))
            return Message(StatusCodes.Status409Conflict, "You are already enrolled in this course.");

        db.Enrollments.Add(new Enrollment
        {
            UserID = userId,
            CourseID = courseId,
            DateEnrolled = clock.GetUtcNow().UtcDateTime,
        });
        await db.SaveChangesAsync(ct);

        return Ok(new { message = "Enrolled successfully" });
    }
}
