namespace ZeroToCoder.Api.Models;

public class Enrollment
{
    public int Id { get; set; }
    public int UserID { get; set; }
    public int CourseID { get; set; }
    public DateTime DateEnrolled { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Course Course { get; set; } = null!;
}
