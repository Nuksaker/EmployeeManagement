using System.Text.Json.Serialization;

namespace EmployeeManagement.Api.DTOs;

public class ApiErrorResponseDto
{
    [JsonPropertyName("statusCode")]
    public int StatusCode { get; set; }

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("errors")]
    public object? Errors { get; set; }
}
