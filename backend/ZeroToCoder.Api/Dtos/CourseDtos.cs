using System.ComponentModel.DataAnnotations;

namespace ZeroToCoder.Api.Dtos;

/// <summary>Course list item; also used as the admin create/update payload.</summary>
public class CourseDto
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string? CourseTitle { get; set; }

    [MaxLength(250)]
    public string? CourseSubtitle { get; set; }

    [MaxLength(250)]
    public string? ImgPath { get; set; }

    [MaxLength(15)]
    public string? Level { get; set; }

    [Range(0, 5)]
    public double? Rating { get; set; }

    [Range(0, int.MaxValue)]
    public int? Students { get; set; }

    [Range(0, 1_000_000)]
    public double? Price { get; set; }

    [MaxLength(50)]
    public string? Duration { get; set; }

    [MaxLength(50)]
    public string? Instructor { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public List<string>? Category { get; set; }
}

public class CourseDetailsDto
{
    public int Id { get; set; }
    public string? CourseTitle { get; set; }
    public string? CourseSubtitle { get; set; }
    public string? Description { get; set; }
    public double? Price { get; set; }
    public string? Duration { get; set; }
    public string? Level { get; set; }
    public string? ImgPath { get; set; }

    public int? InstructorId { get; set; }
    public string? Instructor { get; set; }
    public string? InstructorTitle { get; set; }
    public string? InstructorBio { get; set; }
    public string? InstructorImage { get; set; }
    public double? InstructorRating { get; set; }
    public int? InstructorStudents { get; set; }
    public int? InstructorCourses { get; set; }

    public double? Rating { get; set; }
    public int? Students { get; set; }
    public int? ArticlesCount { get; set; }
    public int? DownloadableResources { get; set; }

    public List<string> Category { get; set; } = [];
    public List<string> LearningOutcomes { get; set; } = [];
    public Dictionary<int, double> RatingsDistribution { get; set; } = [];
    public List<SyllabusWeekDto> Syllabus { get; set; } = [];
    public List<CourseReviewDto> Reviews { get; set; } = [];
}

public class SyllabusWeekDto
{
    public int Week { get; set; }
    public string? Title { get; set; }
    public List<LessonDto> Lessons { get; set; } = [];
}

public class LessonDto
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Type { get; set; }
    public string? Duration { get; set; }
    public string? VideoUrl { get; set; }
    public string? Thumbnail { get; set; }
    public string? Description { get; set; }
}

public class CourseReviewDto
{
    public int ReviewID { get; set; }
    public int UserID { get; set; }
    public string? UserName { get; set; }
    public string? UserImage { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime ReviewDate { get; set; }
}

/// <summary>The reviewing user is taken from the access token, never from the body.</summary>
public class CreateCourseReviewRequest
{
    [Range(1, int.MaxValue)]
    public int CourseID { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(2000)]
    public string? Comment { get; set; }
}

public class MyLearningCourseDto
{
    public int Id { get; set; }
    public string? CourseTitle { get; set; }
    public string? ImgPath { get; set; }
    public string? Instructor { get; set; }
    public DateTime DateEnrolled { get; set; }
}
