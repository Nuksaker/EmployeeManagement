using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace EmployeeManagement.Api.DTOs;

public class DepartmentUpdateDto
{
    [Required(ErrorMessage = "Department_Name is required.")]
    [MaxLength(100)]
    [JsonPropertyName("Department_Name")]
    public string DepartmentName { get; set; } = string.Empty;

    [MaxLength(255)]
    [JsonPropertyName("Department_Address")]
    public string? DepartmentAddress { get; set; }
}
