using HelpDesk.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, IConfiguration config)
    {
        await db.Database.MigrateAsync();

        // Basic Departments/Categories
        if (!await db.Departments.AnyAsync())
        {
            db.Departments.AddRange(
                new Department { Name = "IT" },
                new Department { Name = "HR" },
                new Department { Name = "Finance" },
                new Department { Name = "Operations" }
            );
        }

        if (!await db.Categories.AnyAsync())
        {
            db.Categories.AddRange(
                new Category { Name = "Hardware" },
                new Category { Name = "Software" },
                new Category { Name = "Network" },
                new Category { Name = "Access" },
                new Category { Name = "Others" }
            );
        }

        var masterEmail = config["Seed:MasterEmail"]?.Trim().ToLowerInvariant();
        if (!string.IsNullOrWhiteSpace(masterEmail))
        {
            var master = await db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == masterEmail);
            if (master == null)
            {
                db.Users.Add(new User
                {
                    Email = masterEmail,
                    FullName = "Master Account",
                    Role = UserRole.Master,
                    IsActive = true
                });
            }
            else
            {
                master.Role = UserRole.Master;
            }
        }

        await db.SaveChangesAsync();
    }
}
