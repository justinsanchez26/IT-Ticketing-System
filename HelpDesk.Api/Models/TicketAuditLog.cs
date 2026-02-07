using System.ComponentModel.DataAnnotations;

namespace HelpDesk.Api.Models;

public class TicketAuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TicketId { get; set; }
    public Ticket? Ticket { get; set; }

    [Required, MaxLength(100)]
    public string Action { get; set; } = string.Empty; // StatusChanged, Assigned, etc.

    [MaxLength(400)]
    public string? OldValue { get; set; }

    [MaxLength(400)]
    public string? NewValue { get; set; }

    public Guid ActorUserId { get; set; }
    public User? ActorUser { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
