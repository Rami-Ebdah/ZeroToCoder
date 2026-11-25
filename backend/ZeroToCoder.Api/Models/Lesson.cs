namespace ZeroToCoder.Api.Models;

public class Lesson
{
    public int Id { get; set; }
    public int SyllabusWeekId { get; set; }
    public string Title { get; set; } = string.Empty;

    /// <summary>"video" or "reading".</summary>
    public string Type { get; set; } = string.Empty;

    public string Duration { get; set; } = string.Empty;
    public string? VideoUrl { get; set; }
    public string? Thumbnail { get; set; }
    public string? Content { get; set; }
    public string? Description { get; set; }

    public SyllabusWeek SyllabusWeek { get; set; } = null!;
}
