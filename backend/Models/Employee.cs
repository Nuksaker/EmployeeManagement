namespace EmployeeManagement.Api.Models;

public class Employee
{
    public int EmployeeId { get; set; }
    public string EmployeeFirstName { get; set; } = string.Empty;
    public string EmployeeLastName { get; set; } = string.Empty;
    public string? Gender { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public DateOnly? DateJoined { get; set; }
    public string? EmployeeAddress { get; set; }
    public string? Photo { get; set; }
    public int DepartmentId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public Department? Department { get; set; }
}
