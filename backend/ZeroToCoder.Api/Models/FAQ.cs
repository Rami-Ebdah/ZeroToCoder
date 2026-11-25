using System.ComponentModel.DataAnnotations;

namespace ZeroToCoder.Api.Models;

public class FAQ
{
    [Key]
    public int FAQID { get; set; }

    [MaxLength(500)]
    public string? Question { get; set; }

    [MaxLength(500)]
    public string? Answer { get; set; }
}
