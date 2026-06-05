using System.Text.Json.Serialization;

namespace EmployeeManagement.Api.DTOs;

public class DepartmentResponseDto
{
    [JsonPropertyName("Department_ID")]
    public int DepartmentId { get; set; }

    [JsonPropertyName("Department_Name")]
    public string DepartmentName { get; set; } = string.Empty;

    [JsonPropertyName("Department_Address")]
    public string? DepartmentAddress { get; set; }

    [JsonPropertyName("Created_At")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("Updated_At")]
    public DateTime? UpdatedAt { get; set; }
}
