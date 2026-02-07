using System.ComponentModel.DataAnnotations;

namespace HelpDesk.Api.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(120)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    // For Google login, you can keep PasswordHash null.
    public string? PasswordHash { get; set; }

    public UserRole Role { get; set; } = UserRole.EndUser;

    public Guid? DepartmentId { get; set; }
    public Department? Department { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
