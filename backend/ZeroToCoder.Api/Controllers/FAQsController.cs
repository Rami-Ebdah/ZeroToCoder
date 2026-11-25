using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZeroToCoder.Api.Common;
using ZeroToCoder.Api.Data;
using ZeroToCoder.Api.Dtos;
using ZeroToCoder.Api.Models;

namespace ZeroToCoder.Api.Controllers;

public class FAQsController(AppDbContext db) : ApiControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<FaqDto>>> GetAllFAQs(CancellationToken ct)
    {
        var faqs = await db.FAQs
            .AsNoTracking()
            .Select(f => new FaqDto { FAQID = f.FAQID, Question = f.Question, Answer = f.Answer })
            .ToListAsync(ct);

        return Ok(faqs);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPost]
    public async Task<IActionResult> AddFAQ(FaqUpsertRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Question) || string.IsNullOrWhiteSpace(request.Answer))
            return Message(StatusCodes.Status400BadRequest, "Question and Answer are required.");

        var faq = new FAQ { Question = request.Question.Trim(), Answer = request.Answer.Trim() };
        db.FAQs.Add(faq);
        await db.SaveChangesAsync(ct);

        return Ok(new { message = "FAQ added successfully", faqid = faq.FAQID });
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateFAQ(int id, FaqUpsertRequest request, CancellationToken ct)
    {
        var faq = await db.FAQs.FindAsync([id], ct);
        if (faq is null)
            return Message(StatusCodes.Status404NotFound, $"No FAQ found with ID = {id}");

        if (!string.IsNullOrWhiteSpace(request.Question)) faq.Question = request.Question.Trim();
        if (!string.IsNullOrWhiteSpace(request.Answer)) faq.Answer = request.Answer.Trim();

        await db.SaveChangesAsync(ct);
        return Ok(new { message = "FAQ updated successfully." });
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteFAQ(int id, CancellationToken ct)
    {
        var faq = await db.FAQs.FindAsync([id], ct);
        if (faq is null)
            return Message(StatusCodes.Status404NotFound, $"No FAQ found with ID = {id}");

        db.FAQs.Remove(faq);
        await db.SaveChangesAsync(ct);
        return Ok(new { message = "FAQ deleted successfully." });
    }
}
