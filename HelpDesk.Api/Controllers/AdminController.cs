using HelpDesk.Api.Data;
using HelpDesk.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Master")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;
    public AdminController(AppDbContext db) => _db = db;

    // ---- Departments ----
    [HttpGet("departments")]
    public async Task<IActionResult> GetDepartments()
        => Ok(await _db.Departments.AsNoTracking().OrderBy(d => d.Name).ToListAsync());

    [HttpPost("departments")]
    public async Task<IActionResult> CreateDepartment([FromBody] Department dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name)) return BadRequest("Name required.");
        var dep = new Department { Name = dto.Name.Trim(), IsActive = true };
        _db.Departments.Add(dep);
        await _db.SaveChangesAsync();
        return Ok(dep);
    }

    [HttpPut("departments/{id:guid}")]
    public async Task<IActionResult> UpdateDepartment(Guid id, [FromBody] Department dto)
    {
        var dep = await _db.Departments.FirstOrDefaultAsync(d => d.Id == id);
        if (dep == null) return NotFound();
        dep.Name = dto.Name.Trim();
        dep.IsActive = dto.IsActive;
        await _db.SaveChangesAsync();
        return Ok(dep);
    }

    [HttpDelete("departments/{id:guid}")]
    public async Task<IActionResult> DisableDepartment(Guid id)
    {
        var dep = await _db.Departments.FirstOrDefaultAsync(d => d.Id == id);
        if (dep == null) return NotFound();
        dep.IsActive = false;
        await _db.SaveChangesAsync();
        return Ok();
    }

    // ---- Categories ----
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
        => Ok(await _db.Categories.AsNoTracking().OrderBy(c => c.Name).ToListAsync());

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] Category dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name)) return BadRequest("Name required.");
        var cat = new Category { Name = dto.Name.Trim(), IsActive = true };
        _db.Categories.Add(cat);
        await _db.SaveChangesAsync();
        return Ok(cat);
    }

    [HttpPut("categories/{id:guid}")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] Category dto)
    {
        var cat = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (cat == null) return NotFound();
        cat.Name = dto.Name.Trim();
        cat.IsActive = dto.IsActive;
        await _db.SaveChangesAsync();
        return Ok(cat);
    }

    [HttpDelete("categories/{id:guid}")]
    public async Task<IActionResult> DisableCategory(Guid id)
    {
        var cat = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (cat == null) return NotFound();
        cat.IsActive = false;
        await _db.SaveChangesAsync();
        return Ok();
    }
}
