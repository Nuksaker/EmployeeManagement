using System.Text.Json.Serialization;

namespace EmployeeManagement.Api.DTOs;

public class AuthResponseDto
{
    [JsonPropertyName("token")]
    public string Token { get; set; } = string.Empty;

    [JsonPropertyName("expiresAt")]
    public DateTime ExpiresAt { get; set; }

    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;
}
