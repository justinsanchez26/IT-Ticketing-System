using System.ComponentModel.DataAnnotations;

namespace HelpDesk.Api.Models;

public class Ticket
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(30)]
    public string TicketNumber { get; set; } = string.Empty; // e.g. TCK-2026-000001

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(4000)]
    public string Description { get; set; } = string.Empty;

    public Guid DepartmentId { get; set; }
    public Department? Department { get; set; }

    public Guid CategoryId { get; set; }
    public Category? Category { get; set; }

    public TicketPriority Priority { get; set; } = TicketPriority.Low;
    public TicketStatus Status { get; set; } = TicketStatus.Open;

    public Guid RequesterId { get; set; }
    public User? Requester { get; set; }

    public Guid? AssignedToId { get; set; }
    public User? AssignedTo { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ClosedAt { get; set; }

    public List<TicketComment> Comments { get; set; } = new();
    public List<TicketAuditLog> AuditLogs { get; set; } = new();
}
