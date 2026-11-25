using System.ComponentModel.DataAnnotations;

namespace ZeroToCoder.Api.Dtos;

public class BundleDto
{
    public int BundleID { get; set; }
    public string? Name { get; set; }
    public string? Courses { get; set; }
    public int OriginalPrice { get; set; }
    public int DiscountedPrice { get; set; }
}

public class BundleUpsertRequest
{
    [Required, MaxLength(250)]
    public string? Name { get; set; }

    /// <summary>Comma-separated course titles.</summary>
    [Required, MaxLength(500)]
    public string? Courses { get; set; }

    [Range(0, 1_000_000)]
    public int OriginalPrice { get; set; }

    [Range(0, 1_000_000)]
    public int DiscountedPrice { get; set; }
}

public class CouponDto
{
    public int CouponID { get; set; }
    public string? Code { get; set; }
    public int Discount { get; set; }
    public string? Description { get; set; }
    public DateTime? ValidUntil { get; set; }
}

public class CouponUpsertRequest
{
    [MaxLength(50)]
    public string? Code { get; set; }

    /// <summary>Discount percentage.</summary>
    [Range(0, 100)]
    public int Discount { get; set; }

    [MaxLength(150)]
    public string? Description { get; set; }

    public DateTime? ValidUntil { get; set; }
}
