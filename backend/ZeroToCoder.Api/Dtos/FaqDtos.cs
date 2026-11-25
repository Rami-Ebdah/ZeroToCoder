using System.ComponentModel.DataAnnotations;

namespace ZeroToCoder.Api.Dtos;

public class FaqDto
{
    public int FAQID { get; set; }
    public string? Question { get; set; }
    public string? Answer { get; set; }
}

public class FaqUpsertRequest
{
    [MaxLength(500)]
    public string? Question { get; set; }

    [MaxLength(500)]
    public string? Answer { get; set; }
}
