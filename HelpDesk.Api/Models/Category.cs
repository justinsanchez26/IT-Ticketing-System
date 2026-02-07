using System.ComponentModel.DataAnnotations;

namespace HelpDesk.Api.Models;

public class Category
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}
