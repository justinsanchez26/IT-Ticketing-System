using System.ComponentModel.DataAnnotations;

namespace HelpDesk.Api.Models;

public class TicketComment
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TicketId { get; set; }
    public Ticket? Ticket { get; set; }

    public Guid UserId { get; set; }
    public User? User { get; set; }

    [Required, MaxLength(2000)]
    public string CommentText { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
