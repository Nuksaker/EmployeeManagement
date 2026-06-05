using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace EmployeeManagement.Api.DTOs;

public class EmployeeCreateDto : IValidatableObject
{
    [Required(ErrorMessage = "Employee_First_Name is required.")]
    [MaxLength(100)]
    [JsonPropertyName("Employee_First_Name")]
    public string EmployeeFirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Employee_Last_Name is required.")]
    [MaxLength(100)]
    [JsonPropertyName("Employee_Last_Name")]
    public string EmployeeLastName { get; set; } = string.Empty;

    [MaxLength(20)]
    [JsonPropertyName("Gender")]
    public string? Gender { get; set; }

    [JsonPropertyName("Date_of_Birth")]
    public DateOnly? DateOfBirth { get; set; }

    [JsonPropertyName("Date_Joined")]
    public DateOnly? DateJoined { get; set; }

    [MaxLength(255)]
    [JsonPropertyName("Employee_Address")]
    public string? EmployeeAddress { get; set; }

    [MaxLength(255)]
    [JsonPropertyName("Photo")]
    public string? Photo { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Department_ID is required.")]
    [JsonPropertyName("Department_ID")]
    public int DepartmentId { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (DateOfBirth.HasValue && DateJoined.HasValue && DateJoined.Value < DateOfBirth.Value)
        {
            yield return new ValidationResult(
                "Date_Joined should not be earlier than Date_of_Birth.",
                new[] { "Date_Joined" });
        }
    }
}
