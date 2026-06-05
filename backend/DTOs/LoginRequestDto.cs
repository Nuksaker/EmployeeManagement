using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace EmployeeManagement.Api.DTOs;

public class LoginRequestDto
{
    [Required]
    [JsonPropertyName("Username")]
    public string Username { get; set; } = string.Empty;

    [Required]
    [JsonPropertyName("Password")]
    public string Password { get; set; } = string.Empty;
}
