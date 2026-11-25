namespace ZeroToCoder.Api.Models;

/// <summary>Legacy review table. New reviews are stored in <see cref="CourseReview"/>.</summary>
public class Review
{
    public int Id { get; set; }
    public int CourseID { get; set; }
    public int UserId { get; set; }
    public string User { get; set; } = string.Empty;
    public string UserImage { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime Date { get; set; }

    public Course Course { get; set; } = null!;
}
