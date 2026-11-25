using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using ZeroToCoder.Api.Common;
using ZeroToCoder.Api.Data;
using ZeroToCoder.Api.Dtos;
using ZeroToCoder.Api.Models;
using ZeroToCoder.Api.Services;

namespace ZeroToCoder.Api.Controllers;

public class JobApplicationsController(AppDbContext db, ICvStorage cvStorage, TimeProvider clock) : ApiControllerBase
{
    private static readonly FileExtensionContentTypeProvider ContentTypes = new();

    /// <summary>Apply to a job with a CV upload. The applicant is the authenticated user.</summary>
    [Authorize]
    [HttpPost]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> Apply([FromForm] JobApplicationRequest request, CancellationToken ct)
    {
        var userId = CurrentUserId;

        if (!await db.JobPosts.AnyAsync(j => j.JobID == request.JobID, ct))
            return Message(StatusCodes.Status404NotFound, "Job not found.");

        if (await db.JobApplications.AnyAsync(a => a.JobID == request.JobID && a.UserId == userId, ct))
            return Message(StatusCodes.Status409Conflict, "You have already applied to this job.");

        string cvPath;
        try
        {
            cvPath = await cvStorage.SaveAsync(request.CV!, ct);
        }
        catch (CvValidationException ex)
        {
            return Message(StatusCodes.Status400BadRequest, ex.Message);
        }

        var application = new JobApplication
        {
            UserId = userId,
            JobID = request.JobID,
            CV = cvPath,
            AppliedAt = clock.GetUtcNow().UtcDateTime,
        };

        db.JobApplications.Add(application);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch
        {
            cvStorage.Delete(cvPath); // don't leave orphaned files behind
            throw;
        }

        return Ok(ToDto(application));
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<JobApplicationDto>>> GetAll(CancellationToken ct) =>
        Ok(await db.JobApplications.AsNoTracking().OrderByDescending(a => a.AppliedAt).Select(a => ToDto(a)).ToListAsync(ct));

    [Authorize(Roles = Roles.Admin)]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<JobApplicationDto>> Get(int id, CancellationToken ct)
    {
        var application = await db.JobApplications.AsNoTracking().FirstOrDefaultAsync(a => a.ApplicationID == id, ct);
        return application is null ? NotFound() : Ok(ToDto(application));
    }

    /// <summary>Downloads the CV. CVs are private and only reachable through this admin endpoint.</summary>
    [Authorize(Roles = Roles.Admin)]
    [HttpGet("{id:int}/cv")]
    public async Task<IActionResult> DownloadCv(int id, CancellationToken ct)
    {
        var cv = await db.JobApplications.Where(a => a.ApplicationID == id).Select(a => a.CV).FirstOrDefaultAsync(ct);
        var path = cvStorage.Resolve(cv);
        if (path is null)
            return NotFound();

        if (!ContentTypes.TryGetContentType(path, out var contentType))
            contentType = "application/octet-stream";

        return PhysicalFile(path, contentType, Path.GetFileName(path));
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var application = await db.JobApplications.FindAsync([id], ct);
        if (application is null)
            return NotFound();

        db.JobApplications.Remove(application);
        await db.SaveChangesAsync(ct);
        cvStorage.Delete(application.CV);

        return Ok(new { message = "Deleted successfully" });
    }

    private static JobApplicationDto ToDto(JobApplication a) => new()
    {
        ApplicationID = a.ApplicationID,
        UserId = a.UserId,
        JobID = a.JobID,
        CV = a.CV,
        AppliedAt = a.AppliedAt,
    };
}
