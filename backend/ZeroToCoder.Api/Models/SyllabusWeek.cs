namespace ZeroToCoder.Api.Models;

public class SyllabusWeek
{
    public int Id { get; set; }
    public int CourseID { get; set; }
    public int Week { get; set; }
    public string Title { get; set; } = string.Empty;

    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
    public Course Course { get; set; } = null!;
}
