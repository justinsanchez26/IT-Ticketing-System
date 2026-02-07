using HelpDesk.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Api.Services;

public class TicketNumberService
{
    private readonly AppDbContext _db;

    public TicketNumberService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<string> GenerateAsync()
    {
        var year = DateTime.UtcNow.Year;
        var count = await _db.Tickets.CountAsync() + 1;

        return $"TCK-{year}-{count.ToString().PadLeft(6, '0')}";
    }
}
