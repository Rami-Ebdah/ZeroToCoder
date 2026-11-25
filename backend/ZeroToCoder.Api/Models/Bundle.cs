using System.ComponentModel.DataAnnotations;

namespace ZeroToCoder.Api.Models;

public class Bundle
{
    [Key]
    public int BundleID { get; set; }

    [MaxLength(250)]
    public string? Name { get; set; }

    /// <summary>Comma-separated list of course titles included in the bundle.</summary>
    [MaxLength(500)]
    public string? Courses { get; set; }

    public int OriginalPrice { get; set; }

    public int DiscountedPrice { get; set; }
}
