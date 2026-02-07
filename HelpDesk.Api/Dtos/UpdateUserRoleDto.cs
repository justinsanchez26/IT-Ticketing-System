namespace HelpDesk.Api.Dtos;

public class UpdateUserRoleDto
{
    public string Role { get; set; } = string.Empty; // "ITAdmin" | "HRAdmin" | "EndUser"
}
