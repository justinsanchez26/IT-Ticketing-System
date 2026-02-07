using System.Security.Claims;
using HelpDesk.Api.Data;
using HelpDesk.Api.Dtos;
using HelpDesk.Api.Models;
using HelpDesk.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TicketNumberService _ticketNumber;

    public TicketsController(AppDbContext db, TicketNumberService ticketNumber)
    {
        _db = db;
        _ticketNumber = ticketNumber;
    }

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub")!);

    private string CurrentRole =>
        User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

    private bool IsAdminRole =>
        CurrentRole == UserRole.Master.ToString()
        || CurrentRole == UserRole.ITAdmin.ToString()
        || CurrentRole == UserRole.HRAdmin.ToString();

    // -----------------------------
    // Tickets
    // -----------------------------

    // CREATE TICKET (any authenticated user)
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTicketDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest("Title is required.");

        // Validate foreign keys early (avoid 500 FK crash)
        var deptExists = await _db.Departments.AnyAsync(d => d.Id == dto.DepartmentId && d.IsActive);
        if (!deptExists) return BadRequest("Invalid DepartmentId.");

        var catExists = await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId && c.IsActive);
        if (!catExists) return BadRequest("Invalid CategoryId.");

        var ticket = new Ticket
        {
            TicketNumber = await _ticketNumber.GenerateAsync(),
            Title = dto.Title.Trim(),
            Description = (dto.Description ?? string.Empty).Trim(),
            DepartmentId = dto.DepartmentId,
            CategoryId = dto.CategoryId,
            Priority = dto.Priority,
            Status = TicketStatus.Open,
            RequesterId = CurrentUserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Tickets.Add(ticket);

        _db.TicketAuditLogs.Add(new TicketAuditLog
        {
            TicketId = ticket.Id,
            Action = "Created",
            OldValue = null,
            NewValue = ticket.TicketNumber,
            ActorUserId = CurrentUserId,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        return Ok(new { ticket.Id, ticket.TicketNumber });
    }

    // LIST TICKETS
    // Admin: all tickets
    // EndUser: own tickets only
    [HttpGet]
    public async Task<ActionResult<List<TicketListDto>>> GetAll()
    {
        var query = _db.Tickets.AsNoTracking();

        if (!IsAdminRole)
            query = query.Where(t => t.RequesterId == CurrentUserId);

        var tickets = await query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TicketListDto
            {
                Id = t.Id,
                TicketNumber = t.TicketNumber,
                Title = t.Title,
                Status = t.Status,
                Priority = t.Priority,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();

        return Ok(tickets);
    }

    // TICKET DETAILS
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TicketDetailsDto>> Get(Guid id)
    {
        var ticket = await _db.Tickets
            .AsNoTracking()
            .Include(t => t.Department)
            .Include(t => t.Category)
            .Include(t => t.Requester)
            .Include(t => t.AssignedTo)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null)
            return NotFound();

        if (!IsAdminRole && ticket.RequesterId != CurrentUserId)
            return Forbid();

        return Ok(new TicketDetailsDto
        {
            Id = ticket.Id,
            TicketNumber = ticket.TicketNumber,
            Title = ticket.Title,
            Description = ticket.Description,
            Status = ticket.Status,
            Priority = ticket.Priority,
            Department = ticket.Department?.Name ?? "",
            Category = ticket.Category?.Name ?? "",
            Requester = ticket.Requester?.FullName ?? "",
            AssignedTo = ticket.AssignedTo?.FullName,
            CreatedAt = ticket.CreatedAt
        });
    }

    // -----------------------------
    // Admin actions
    // -----------------------------

    // UPDATE STATUS (Admins only)
    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "Master,ITAdmin,HRAdmin")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTicketStatusDto dto)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.Id == id);
        if (ticket == null) return NotFound();

        var old = ticket.Status;
        if (old == dto.Status) return Ok(); // no-op

        ticket.Status = dto.Status;
        ticket.UpdatedAt = DateTime.UtcNow;

        if (dto.Status == TicketStatus.Closed)
            ticket.ClosedAt = DateTime.UtcNow;

        _db.TicketAuditLogs.Add(new TicketAuditLog
        {
            TicketId = ticket.Id,
            Action = "StatusChanged",
            OldValue = old.ToString(),
            NewValue = dto.Status.ToString(),
            ActorUserId = CurrentUserId,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return Ok();
    }

    // ASSIGN TICKET (Admins only)
    [HttpPut("{id:guid}/assign")]
    [Authorize(Roles = "Master,ITAdmin,HRAdmin")]
    public async Task<IActionResult> Assign(Guid id, [FromBody] AssignTicketDto dto)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.Id == id);
        if (ticket == null) return NotFound();

        var assignee = await _db.Users.FirstOrDefaultAsync(u => u.Id == dto.AssignedToId && u.IsActive);
        if (assignee == null) return BadRequest("AssignedToId user not found or inactive.");

        var old = ticket.AssignedToId;
        if (old == dto.AssignedToId) return Ok(); // no-op

        ticket.AssignedToId = dto.AssignedToId;
        ticket.UpdatedAt = DateTime.UtcNow;

        _db.TicketAuditLogs.Add(new TicketAuditLog
        {
            TicketId = ticket.Id,
            Action = "Assigned",
            OldValue = old?.ToString(),
            NewValue = dto.AssignedToId.ToString(),
            ActorUserId = CurrentUserId,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return Ok();
    }

    // -----------------------------
    // Comments
    // -----------------------------

    // ADD COMMENT
    // EndUser: own ticket only
    // Admin: any ticket
    [HttpPost("{id:guid}/comments")]
    public async Task<IActionResult> AddComment(Guid id, [FromBody] AddCommentDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.CommentText))
            return BadRequest("CommentText is required.");

        var ticket = await _db.Tickets.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);
        if (ticket == null) return NotFound();

        if (!IsAdminRole && ticket.RequesterId != CurrentUserId)
            return Forbid();

        var comment = new TicketComment
        {
            TicketId = id,
            UserId = CurrentUserId,
            CommentText = dto.CommentText.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.TicketComments.Add(comment);

        _db.TicketAuditLogs.Add(new TicketAuditLog
        {
            TicketId = id,
            Action = "CommentAdded",
            OldValue = null,
            NewValue = null,
            ActorUserId = CurrentUserId,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return Ok();
    }

    // GET COMMENTS
    [HttpGet("{id:guid}/comments")]
    public async Task<IActionResult> GetComments(Guid id)
    {
        var ticket = await _db.Tickets.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);
        if (ticket == null) return NotFound();

        if (!IsAdminRole && ticket.RequesterId != CurrentUserId)
            return Forbid();

        var comments = await _db.TicketComments
            .AsNoTracking()
            .Include(c => c.User)
            .Where(c => c.TicketId == id)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.CommentText,
                c.CreatedAt,
                User = new
                {
                    c.UserId,
                    FullName = c.User!.FullName,
                    Email = c.User.Email
                }
            })
            .ToListAsync();

        return Ok(comments);
    }

    // -----------------------------
    // Audit Logs (optional but useful)
    // -----------------------------

    [HttpGet("{id:guid}/audit")]
    [Authorize(Roles = "Master,ITAdmin,HRAdmin")]
    public async Task<IActionResult> GetAudit(Guid id)
    {
        var exists = await _db.Tickets.AsNoTracking().AnyAsync(t => t.Id == id);
        if (!exists) return NotFound();

        var logs = await _db.TicketAuditLogs
            .AsNoTracking()
            .Where(a => a.TicketId == id)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new
            {
                a.Id,
                a.Action,
                a.OldValue,
                a.NewValue,
                a.ActorUserId,
                a.CreatedAt
            })
            .ToListAsync();

        return Ok(logs);
    }
}
