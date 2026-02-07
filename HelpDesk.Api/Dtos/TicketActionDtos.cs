using HelpDesk.Api.Models;

namespace HelpDesk.Api.Dtos;

public class UpdateTicketStatusDto
{
    public TicketStatus Status { get; set; }
}

public class AssignTicketDto
{
    public Guid AssignedToId { get; set; }
}

public class AddCommentDto
{
    public string CommentText { get; set; } = string.Empty;
}
