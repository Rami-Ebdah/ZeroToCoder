namespace ZeroToCoder.Api.Models;

public class JobApplication
{
    public int ApplicationID { get; set; }
    public int UserId { get; set; }
    public int JobID { get; set; }

    /// <summary>Path of the stored CV relative to the private storage root, e.g. <c>CVs/&lt;guid&gt;_name.pdf</c>.</summary>
    public string CV { get; set; } = string.Empty;

    public DateTime AppliedAt { get; set; }

    public JobPost Job { get; set; } = null!;
}
