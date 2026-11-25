using System.ComponentModel.DataAnnotations;

namespace ZeroToCoder.Api.Models;

public class CourseReview
{
    [Key]
    public int ReviewID { get; set; }

    public int UserID { get; set; }
    public int CourseID { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime ReviewDate { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Course Course { get; set; } = null!;
}
