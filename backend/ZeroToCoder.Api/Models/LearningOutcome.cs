namespace ZeroToCoder.Api.Models;

public class LearningOutcome
{
    public int Id { get; set; }
    public int CourseID { get; set; }
    public string Text { get; set; } = string.Empty;

    public Course Course { get; set; } = null!;
}
