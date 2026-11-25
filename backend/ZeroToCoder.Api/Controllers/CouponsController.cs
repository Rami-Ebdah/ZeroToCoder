using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZeroToCoder.Api.Common;
using ZeroToCoder.Api.Data;
using ZeroToCoder.Api.Dtos;
using ZeroToCoder.Api.Models;

namespace ZeroToCoder.Api.Controllers;

public class CouponsController(AppDbContext db) : ApiControllerBase
{
    /// <summary>Coupons are intentionally public: the site has a page that advertises them.</summary>
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CouponDto>>> GetAllCoupons(CancellationToken ct)
    {
        var coupons = await db.Coupons
            .AsNoTracking()
            .Select(c => new CouponDto
            {
                CouponID = c.CouponID,
                Code = c.Code,
                Discount = c.Discount,
                Description = c.Description,
                ValidUntil = c.ValidUntil,
            })
            .ToListAsync(ct);

        return Ok(coupons);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPost]
    public async Task<IActionResult> AddCoupon(CouponUpsertRequest request, CancellationToken ct)
    {
        var code = request.Code?.Trim();
        if (string.IsNullOrEmpty(code))
            return Message(StatusCodes.Status400BadRequest, "Coupon code is required.");

        if (await db.Coupons.AnyAsync(c => c.Code == code, ct))
            return Message(StatusCodes.Status409Conflict, "A coupon with this code already exists.");

        db.Coupons.Add(new Coupon
        {
            Code = code,
            Discount = request.Discount,
            Description = request.Description?.Trim(),
            ValidUntil = request.ValidUntil,
        });
        await db.SaveChangesAsync(ct);

        return Ok(new { message = "Coupon added successfully." });
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCoupon(int id, CouponUpsertRequest request, CancellationToken ct)
    {
        var coupon = await db.Coupons.FindAsync([id], ct);
        if (coupon is null)
            return Message(StatusCodes.Status404NotFound, "Coupon not found.");

        var code = request.Code?.Trim();
        if (!string.IsNullOrEmpty(code) && code != coupon.Code)
        {
            if (await db.Coupons.AnyAsync(c => c.Code == code && c.CouponID != id, ct))
                return Message(StatusCodes.Status409Conflict, "A coupon with this code already exists.");
            coupon.Code = code;
        }

        if (!string.IsNullOrWhiteSpace(request.Description)) coupon.Description = request.Description.Trim();
        if (request.Discount != 0) coupon.Discount = request.Discount;
        if (request.ValidUntil is not null) coupon.ValidUntil = request.ValidUntil;

        await db.SaveChangesAsync(ct);
        return Ok(new { message = "Coupon updated successfully." });
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpDelete("by-code")]
    public async Task<IActionResult> DeleteCouponByCode([FromQuery] string code, CancellationToken ct)
    {
        var coupon = await db.Coupons.FirstOrDefaultAsync(c => c.Code == code, ct);
        if (coupon is null)
            return Message(StatusCodes.Status404NotFound, "Coupon not found.");

        db.Coupons.Remove(coupon);
        await db.SaveChangesAsync(ct);
        return Ok(new { message = $"Coupon '{code}' deleted." });
    }
}
