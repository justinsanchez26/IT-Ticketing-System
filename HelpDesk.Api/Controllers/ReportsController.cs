using HelpDesk.Api.Data;
using HelpDesk.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HelpDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Master,ITAdmin,HRAdmin")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ReportsController(AppDbContext db) => _db = db;

    [HttpGet("tickets-summary")]
    public async Task<IActionResult> TicketsSummary()
    {
        var total = await _db.Tickets.CountAsync();

        var byStatus = await _db.Tickets
            .GroupBy(t => t.Status)
            .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
            .ToListAsync();

        return Ok(new
        {
            Total = total,
            ByStatus = byStatus
        });
    }
}
