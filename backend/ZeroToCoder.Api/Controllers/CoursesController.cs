using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZeroToCoder.Api.Common;
using ZeroToCoder.Api.Data;
using ZeroToCoder.Api.Dtos;
using ZeroToCoder.Api.Models;

namespace ZeroToCoder.Api.Controllers;

public class CoursesController(AppDbContext db, TimeProvider clock) : ApiControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CourseDto>>> GetCourses(CancellationToken ct)
    {
        // Nullable columns are projected as-is; the old code cast them to non-nullable
        // types and crashed whenever a course had no rating/students/price yet.
        var courses = await db.Courses
            .AsNoTracking()
            .Select(c => new CourseDto
            {
                Id = c.CourseID,
                CourseTitle = c.CourseTitle,
                CourseSubtitle = c.CourseSubtitle,
                ImgPath = c.ImgPath,
                Level = c.Level,
                Rating = c.AvgRating,
                Students = c.Students,
                Price = c.Price,
                Duration = c.Duration,
                Instructor = c.Instructor,
                Description = c.Description,
                Category = c.Categories.Select(cat => cat.Category!).ToList(),
            })
            .ToListAsync(ct);

        return Ok(courses);
    }

    [AllowAnonymous]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CourseDetailsDto>> GetCourseDetails(int id, CancellationToken ct)
    {
        var course = await db.Courses
            .AsNoTracking()
            .AsSplitQuery()
            .Include(c => c.Categories)
            .Include(c => c.SyllabusWeeks).ThenInclude(sw => sw.Lessons)
            .Include(c => c.Reviews).ThenInclude(r => r.User)
            .Include(c => c.LearningOutcomes)
            .FirstOrDefaultAsync(c => c.CourseID == id, ct);

        if (course is null)
            return Message(StatusCodes.Status404NotFound, "Course not found.");

        var instructor = string.IsNullOrEmpty(course.Instructor)
            ? null
            : await db.Instructors.AsNoTracking().FirstOrDefaultAsync(i => i.Name == course.Instructor, ct);

        return Ok(new CourseDetailsDto
        {
            Id = course.CourseID,
            CourseTitle = course.CourseTitle,
            CourseSubtitle = course.CourseSubtitle,
            Price = course.Price,
            Duration = course.Duration,
            Level = course.Level,
            ImgPath = course.ImgPath,
            Rating = course.AvgRating,
            Students = course.Students,
            Description = course.Description,
            Category = course.Categories.Select(c => c.Category ?? string.Empty).ToList(),
            LearningOutcomes = course.LearningOutcomes.Select(lo => lo.Text).ToList(),

            InstructorId = instructor?.InstructorID,
            Instructor = instructor?.Name ?? course.Instructor,
            InstructorTitle = instructor?.Title,
            InstructorBio = instructor?.Bio,
            InstructorImage = instructor?.ImagePath,
            InstructorRating = instructor?.Rating,
            InstructorStudents = instructor?.Students,
            InstructorCourses = instructor?.CoursesCount,

            Syllabus = course.SyllabusWeeks
                .OrderBy(sw => sw.Week)
                .Select(sw => new SyllabusWeekDto
                {
                    Week = sw.Week,
                    Title = sw.Title,
                    Lessons = sw.Lessons.OrderBy(l => l.Id).Select(l => new LessonDto
                    {
                        Id = l.Id,
                        Title = l.Title,
                        Type = l.Type,
                        Duration = l.Duration,
                        VideoUrl = l.VideoUrl,
                        Thumbnail = l.Thumbnail,
                        Description = l.Description,
                    }).ToList(),
                }).ToList(),

            Reviews = course.Reviews
                .OrderByDescending(r => r.ReviewDate)
                .Select(r => new CourseReviewDto
                {
                    ReviewID = r.ReviewID,
                    UserID = r.UserID,
                    UserName = r.User?.FullName,
                    UserImage = r.User?.Image,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    ReviewDate = r.ReviewDate,
                }).ToList(),
        });
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPost]
    public async Task<ActionResult<CourseDto>> CreateCourse(CourseDto request, CancellationToken ct)
    {
        var course = new Course();
        Apply(course, request);
        db.Courses.Add(course);
        await db.SaveChangesAsync(ct);

        request.Id = course.CourseID;
        return CreatedAtAction(nameof(GetCourseDetails), new { id = course.CourseID }, request);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCourse(int id, CourseDto request, CancellationToken ct)
    {
        var course = await db.Courses.Include(c => c.Categories).FirstOrDefaultAsync(c => c.CourseID == id, ct);
        if (course is null)
            return Message(StatusCodes.Status404NotFound, "Course not found.");

        db.CourseCategories.RemoveRange(course.Categories);
        Apply(course, request);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCourse(int id, CancellationToken ct)
    {
        var course = await db.Courses.Include(c => c.Categories).FirstOrDefaultAsync(c => c.CourseID == id, ct);
        if (course is null)
            return Message(StatusCodes.Status404NotFound, "Course not found.");

        if (await db.Enrollments.AnyAsync(e => e.CourseID == id, ct))
            return Message(StatusCodes.Status409Conflict, "This course has enrolled students and cannot be deleted.");

        db.CourseCategories.RemoveRange(course.Categories);
        db.Courses.Remove(course);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [Authorize]
    [HttpPost("review")]
    public async Task<IActionResult> PostReview(CreateCourseReviewRequest request, CancellationToken ct)
    {
        var userId = CurrentUserId;

        if (!await db.Courses.AnyAsync(c => c.CourseID == request.CourseID, ct))
            return Message(StatusCodes.Status404NotFound, "Course not found.");

        if (!await db.Enrollments.AnyAsync(e => e.UserID == userId && e.CourseID == request.CourseID, ct))
            return Message(StatusCodes.Status403Forbidden, "You can only review courses you are enrolled in.");

        if (await db.CourseReviews.AnyAsync(r => r.UserID == userId && r.CourseID == request.CourseID, ct))
            return Message(StatusCodes.Status409Conflict, "You have already reviewed this course.");

        db.CourseReviews.Add(new CourseReview
        {
            UserID = userId,
            CourseID = request.CourseID,
            Rating = request.Rating,
            Comment = request.Comment?.Trim(),
            ReviewDate = clock.GetUtcNow().UtcDateTime,
        });
        await db.SaveChangesAsync(ct);

        return Ok(new { message = "Review submitted successfully." });
    }

    private static void Apply(Course course, CourseDto dto)
    {
        course.CourseTitle = dto.CourseTitle?.Trim();
        course.CourseSubtitle = dto.CourseSubtitle;
        course.ImgPath = dto.ImgPath;
        course.Level = dto.Level;
        course.AvgRating = dto.Rating;
        course.Students = dto.Students;
        course.Price = dto.Price;
        course.Duration = dto.Duration;
        course.Instructor = dto.Instructor;
        course.Description = dto.Description; // previously dropped on create
        course.Categories = (dto.Category ?? [])
            .Where(c => !string.IsNullOrWhiteSpace(c))
            .Select(c => c.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Select(c => new CourseCategory { Category = c })
            .ToList();
    }
}
