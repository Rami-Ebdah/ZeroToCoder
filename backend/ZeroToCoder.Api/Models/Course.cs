namespace ZeroToCoder.Api.Models;

public class Course
{
    public int CourseID { get; set; }
    public string? CourseTitle { get; set; }
    public string? CourseSubtitle { get; set; }
    public string? ImgPath { get; set; }
    public string? Level { get; set; }
    public int? Students { get; set; }
    public double? Price { get; set; }
    public string? Duration { get; set; }
    public string? Description { get; set; }

    /// <summary>Instructor display name (matched against <see cref="Models.Instructor.Name"/>).</summary>
    public string? Instructor { get; set; }

    public double? AvgRating { get; set; }

    // The column is NVARCHAR(500); it was previously mapped as double, which would
    // throw an InvalidCastException as soon as any row had a value.
    public string? Requirements { get; set; }

    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<CourseCategory> Categories { get; set; } = new List<CourseCategory>();
    public ICollection<SyllabusWeek> SyllabusWeeks { get; set; } = new List<SyllabusWeek>();
    public ICollection<CourseReview> Reviews { get; set; } = new List<CourseReview>();
    public ICollection<LearningOutcome> LearningOutcomes { get; set; } = new List<LearningOutcome>();
}
