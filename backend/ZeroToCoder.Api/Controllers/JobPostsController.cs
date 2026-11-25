using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZeroToCoder.Api.Common;
using ZeroToCoder.Api.Data;
using ZeroToCoder.Api.Dtos;
using ZeroToCoder.Api.Models;

namespace ZeroToCoder.Api.Controllers;

public class JobPostsController(AppDbContext db, TimeProvider clock) : ApiControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<JobPostDto>>> GetAll(CancellationToken ct) =>
        Ok(await db.JobPosts.AsNoTracking().OrderByDescending(j => j.CreatedAt).Select(j => ToDto(j)).ToListAsync(ct));

    [AllowAnonymous]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<JobPostDto>> GetById(int id, CancellationToken ct)
    {
        var job = await db.JobPosts.AsNoTracking().FirstOrDefaultAsync(j => j.JobID == id, ct);
        return job is null ? NotFound() : Ok(ToDto(job));
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPost]
    public async Task<ActionResult<JobPostDto>> Create(JobPostDto request, CancellationToken ct)
    {
        var job = new JobPost { CreatedAt = clock.GetUtcNow().UtcDateTime };
        Apply(job, request);
        db.JobPosts.Add(job);
        await db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetById), new { id = job.JobID }, ToDto(job));
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<JobPostDto>> Update(int id, JobPostDto request, CancellationToken ct)
    {
        var job = await db.JobPosts.FindAsync([id], ct);
        if (job is null)
            return NotFound();

        Apply(job, request);
        await db.SaveChangesAsync(ct);
        return Ok(ToDto(job));
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var job = await db.JobPosts.FindAsync([id], ct);
        if (job is null)
            return NotFound();

        if (await db.JobApplications.AnyAsync(a => a.JobID == id, ct))
            return Message(StatusCodes.Status409Conflict, "This job has applications; delete them first.");

        db.JobPosts.Remove(job);
        await db.SaveChangesAsync(ct);
        return Ok(new { message = "Job post deleted successfully." });
    }

    private static JobPostDto ToDto(JobPost j) => new()
    {
        JobID = j.JobID,
        Title = j.Title,
        Company = j.Company,
        Location = j.Location,
        Type = j.Type,
        EmploymentType = j.EmploymentType,
        Description = j.Description,
        AboutJob = j.AboutJob,
        AboutCompany = j.AboutCompany,
        Skills = j.Skills,
    };

    private static void Apply(JobPost job, JobPostDto dto)
    {
        job.Title = dto.Title?.Trim();
        job.Company = dto.Company?.Trim();
        job.Location = dto.Location?.Trim();
        job.Type = dto.Type;
        job.EmploymentType = dto.EmploymentType;
        job.Description = dto.Description;
        job.AboutJob = dto.AboutJob;
        job.AboutCompany = dto.AboutCompany;
        job.Skills = dto.Skills;
    }
}
