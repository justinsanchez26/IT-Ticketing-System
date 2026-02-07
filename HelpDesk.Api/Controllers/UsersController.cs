using HelpDesk.Api.Data;
using HelpDesk.Api.Dtos;
using HelpDesk.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    public UsersController(AppDbContext db) => _db = db;

    [HttpGet]
    [Authorize(Roles = "Master")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _db.Users
            .AsNoTracking()
            .OrderBy(u => u.FullName)
            .Select(u => new { u.Id, u.FullName, u.Email, Role = u.Role.ToString(), u.IsActive })
            .ToListAsync();

        return Ok(users);
    }

    [HttpPut("{id:guid}/role")]
    [Authorize(Roles = "Master")]
    public async Task<IActionResult> UpdateRole(Guid id, UpdateUserRoleDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Role))
            return BadRequest("Role is required.");

        if (!Enum.TryParse<UserRole>(dto.Role, true, out var newRole))
            return BadRequest("Invalid role.");

        if (newRole == UserRole.Master)
            return BadRequest("Cannot assign Master role.");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return NotFound();

        user.Role = newRole;
        await _db.SaveChangesAsync();

        return Ok(new { user.Id, Role = user.Role.ToString() });
    }

    // Keep your agents endpoint (admins) here too if you want:
    [HttpGet("agents")]
    [Authorize(Roles = "Master,ITAdmin,HRAdmin")]
    public async Task<IActionResult> Agents()
    {
        var roles = new[] { UserRole.Master, UserRole.ITAdmin, UserRole.HRAdmin };

        var users = await _db.Users
            .Where(u => u.IsActive && roles.Contains(u.Role))
            .OrderBy(u => u.FullName)
            .Select(u => new { u.Id, u.FullName, u.Email, Role = u.Role.ToString() })
            .ToListAsync();

        return Ok(users);
    }
}
