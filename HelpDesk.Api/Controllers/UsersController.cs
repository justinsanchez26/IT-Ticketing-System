using HelpDesk.Api.Data;
using HelpDesk.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Master,ITAdmin,HRAdmin")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    public UsersController(AppDbContext db) => _db = db;

    [HttpGet("agents")]
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
