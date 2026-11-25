using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZeroToCoder.Api.Data;
using ZeroToCoder.Api.Dtos;

namespace ZeroToCoder.Api.Controllers;

[Authorize]
public class MyLearningController(AppDbContext db) : ApiControllerBase
{
    /// <summary>Courses the current user is enrolled in.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MyLearningCourseDto>>> GetMyLearning(CancellationToken ct)
    {
        var courses = await db.Enrollments
            .AsNoTracking()
            .Where(e => e.UserID == CurrentUserId)
            .OrderByDescending(e => e.DateEnrolled)
            .Select(e => new MyLearningCourseDto
            {
                Id = e.Course.CourseID,
                CourseTitle = e.Course.CourseTitle,
                ImgPath = e.Course.ImgPath,
                Instructor = e.Course.Instructor,
                DateEnrolled = e.DateEnrolled,
            })
            .ToListAsync(ct);

        return Ok(courses);
    }
}
