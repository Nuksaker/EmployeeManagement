using System.Text.Json.Serialization;

namespace EmployeeManagement.Api.DTOs;

public class EmployeeResponseDto
{
    [JsonPropertyName("Employee_ID")]
    public int EmployeeId { get; set; }

    [JsonPropertyName("Employee_First_Name")]
    public string EmployeeFirstName { get; set; } = string.Empty;

    [JsonPropertyName("Employee_Last_Name")]
    public string EmployeeLastName { get; set; } = string.Empty;

    [JsonPropertyName("Gender")]
    public string? Gender { get; set; }

    [JsonPropertyName("Date_of_Birth")]
    public DateOnly? DateOfBirth { get; set; }

    [JsonPropertyName("Date_Joined")]
    public DateOnly? DateJoined { get; set; }

    [JsonPropertyName("Employee_Address")]
    public string? EmployeeAddress { get; set; }

    [JsonPropertyName("Photo")]
    public string? Photo { get; set; }

    [JsonPropertyName("Department_ID")]
    public int DepartmentId { get; set; }

    [JsonPropertyName("Department_Name")]
    public string DepartmentName { get; set; } = string.Empty;

    [JsonPropertyName("Created_At")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("Updated_At")]
    public DateTime? UpdatedAt { get; set; }
}
