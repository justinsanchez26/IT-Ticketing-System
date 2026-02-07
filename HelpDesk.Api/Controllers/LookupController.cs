using HelpDesk.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LookupController : ControllerBase
{
    private readonly AppDbContext _db;

    public LookupController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("departments")]
    public async Task<IActionResult> Departments()
    {
        var data = await _db.Departments
            .AsNoTracking()
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Select(d => new { d.Id, d.Name })
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("categories")]
    public async Task<IActionResult> Categories()
    {
        var data = await _db.Categories
            .AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .Select(c => new { c.Id, c.Name })
            .ToListAsync();

        return Ok(data);
    }
}
