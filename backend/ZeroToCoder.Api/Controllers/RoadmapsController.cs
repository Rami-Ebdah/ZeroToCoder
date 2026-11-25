using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZeroToCoder.Api.Common;
using ZeroToCoder.Api.Data;
using ZeroToCoder.Api.Dtos;
using ZeroToCoder.Api.Models;

namespace ZeroToCoder.Api.Controllers;

public class RoadmapsController(AppDbContext db) : ApiControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoadmapDto>>> GetAll(CancellationToken ct) =>
        Ok(await db.Roadmaps.AsNoTracking().Select(r => ToDto(r)).ToListAsync(ct));

    [AllowAnonymous]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<RoadmapDto>> GetById(int id, CancellationToken ct)
    {
        var roadmap = await db.Roadmaps.AsNoTracking().FirstOrDefaultAsync(r => r.RoadmapID == id, ct);
        return roadmap is null ? NotFound() : Ok(ToDto(roadmap));
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPost]
    public async Task<ActionResult<RoadmapDto>> Create(RoadmapUpsertRequest request, CancellationToken ct)
    {
        var roadmap = new Roadmap { ImagePath = request.ImagePath?.Trim(), Specialization = request.Specialization.Trim() };
        db.Roadmaps.Add(roadmap);
        await db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetById), new { id = roadmap.RoadmapID }, ToDto(roadmap));
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, RoadmapUpsertRequest request, CancellationToken ct)
    {
        var roadmap = await db.Roadmaps.FindAsync([id], ct);
        if (roadmap is null)
            return NotFound();

        roadmap.ImagePath = request.ImagePath?.Trim();
        roadmap.Specialization = request.Specialization.Trim();
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var roadmap = await db.Roadmaps.FindAsync([id], ct);
        if (roadmap is null)
            return NotFound();

        db.Roadmaps.Remove(roadmap);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static RoadmapDto ToDto(Roadmap r) =>
        new() { RoadmapID = r.RoadmapID, ImagePath = r.ImagePath?.Trim(), Specialization = r.Specialization.Trim() };
}
