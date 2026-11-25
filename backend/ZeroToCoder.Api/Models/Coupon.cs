using System.ComponentModel.DataAnnotations;

namespace ZeroToCoder.Api.Models;

public class Coupon
{
    [Key]
    public int CouponID { get; set; }

    [MaxLength(50)]
    public string? Code { get; set; }

    /// <summary>Discount percentage (0-100).</summary>
    public int Discount { get; set; }

    [MaxLength(150)]
    public string? Description { get; set; }

    public DateTime? ValidUntil { get; set; }
}
