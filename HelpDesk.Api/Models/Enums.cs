namespace HelpDesk.Api.Models;

public enum UserRole
{
    Master = 0,
    ITAdmin = 1,
    HRAdmin = 2,
    EndUser = 3
}

public enum TicketPriority
{
    Low = 0,
    Medium = 1,
    High = 2,
    Urgent = 3
}

public enum TicketStatus
{
    Open = 0,
    InProgress = 1,
    Resolved = 2,
    Closed = 3
}
