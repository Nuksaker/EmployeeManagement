using EmployeeManagement.Api.Data;
using EmployeeManagement.Api.DTOs;
using EmployeeManagement.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.Api.Controllers;

/// <summary>
/// Handles CRUD operations for employees.
/// </summary>
[ApiController]
[Route("api/employees")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;

    private static readonly HashSet<string> AllowedPhotoExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    };

    private static readonly HashSet<string> AllowedPhotoContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp"
    };

    public EmployeesController(AppDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    /// <summary>
    /// Gets employees with server-side pagination, including department names.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponseDto<EmployeeResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedResponseDto<EmployeeResponseDto>>> GetEmployees(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var pagination = NormalizePagination(pageNumber, pageSize);

        var query = _context.Employees
            .Include(employee => employee.Department)
            .OrderByDescending(employee => employee.CreatedAt)
            .ThenByDescending(employee => employee.EmployeeFirstName)
            .Select(employee => new EmployeeResponseDto
            {
                EmployeeId = employee.EmployeeId,
                EmployeeFirstName = employee.EmployeeFirstName,
                EmployeeLastName = employee.EmployeeLastName,
                Gender = employee.Gender,
                DateOfBirth = employee.DateOfBirth,
                DateJoined = employee.DateJoined,
                EmployeeAddress = employee.EmployeeAddress,
                Photo = employee.Photo,
                DepartmentId = employee.DepartmentId,
                DepartmentName = employee.Department == null ? string.Empty : employee.Department.DepartmentName,
                CreatedAt = employee.CreatedAt,
                UpdatedAt = employee.UpdatedAt
            });

        var totalCount = await query.CountAsync();
        var employees = await query
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync();

        return Ok(CreatePagedResponse(employees, pagination.PageNumber, pagination.PageSize, totalCount));
    }

    /// <summary>
    /// Gets one employee by id.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(EmployeeResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<EmployeeResponseDto>> GetEmployee(int id)
    {
        var employee = await _context.Employees
            .Include(item => item.Department)
            .FirstOrDefaultAsync(item => item.EmployeeId == id);

        if (employee is null)
        {
            return NotFound(CreateError(StatusCodes.Status404NotFound, $"Employee with id {id} was not found."));
        }

        return Ok(ToResponseDto(employee));
    }

    /// <summary>
    /// Creates a new employee.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(EmployeeResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<EmployeeResponseDto>> CreateEmployee(EmployeeCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.EmployeeFirstName))
        {
            return BadRequest(CreateError(StatusCodes.Status400BadRequest, "Employee_First_Name is required."));
        }

        if (string.IsNullOrWhiteSpace(dto.EmployeeLastName))
        {
            return BadRequest(CreateError(StatusCodes.Status400BadRequest, "Employee_Last_Name is required."));
        }

        var departmentExists = await _context.Departments.AnyAsync(department => department.DepartmentId == dto.DepartmentId);
        if (!departmentExists)
        {
            return BadRequest(CreateError(StatusCodes.Status400BadRequest, $"Department with id {dto.DepartmentId} does not exist."));
        }

        var employee = new Employee
        {
            EmployeeFirstName = dto.EmployeeFirstName.Trim(),
            EmployeeLastName = dto.EmployeeLastName.Trim(),
            Gender = string.IsNullOrWhiteSpace(dto.Gender) ? null : dto.Gender.Trim(),
            DateOfBirth = dto.DateOfBirth,
            DateJoined = dto.DateJoined,
            EmployeeAddress = string.IsNullOrWhiteSpace(dto.EmployeeAddress) ? null : dto.EmployeeAddress.Trim(),
            Photo = string.IsNullOrWhiteSpace(dto.Photo) ? null : dto.Photo.Trim(),
            DepartmentId = dto.DepartmentId
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        await _context.Entry(employee).Reference(item => item.Department).LoadAsync();
        var response = ToResponseDto(employee);

        return CreatedAtAction(nameof(GetEmployee), new { id = response.EmployeeId }, response);
    }

    /// <summary>
    /// Updates an existing employee.
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(EmployeeResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateEmployee(int id, EmployeeUpdateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.EmployeeFirstName))
        {
            return BadRequest(CreateError(StatusCodes.Status400BadRequest, "Employee_First_Name is required."));
        }

        if (string.IsNullOrWhiteSpace(dto.EmployeeLastName))
        {
            return BadRequest(CreateError(StatusCodes.Status400BadRequest, "Employee_Last_Name is required."));
        }

        var employee = await _context.Employees
            .Include(item => item.Department)
            .FirstOrDefaultAsync(item => item.EmployeeId == id);

        if (employee is null)
        {
            return NotFound(CreateError(StatusCodes.Status404NotFound, $"Employee with id {id} was not found."));
        }

        var departmentExists = await _context.Departments.AnyAsync(department => department.DepartmentId == dto.DepartmentId);
        if (!departmentExists)
        {
            return BadRequest(CreateError(StatusCodes.Status400BadRequest, $"Department with id {dto.DepartmentId} does not exist."));
        }

        employee.EmployeeFirstName = dto.EmployeeFirstName.Trim();
        employee.EmployeeLastName = dto.EmployeeLastName.Trim();
        employee.Gender = string.IsNullOrWhiteSpace(dto.Gender) ? null : dto.Gender.Trim();
        employee.DateOfBirth = dto.DateOfBirth;
        employee.DateJoined = dto.DateJoined;
        employee.EmployeeAddress = string.IsNullOrWhiteSpace(dto.EmployeeAddress) ? null : dto.EmployeeAddress.Trim();
        employee.Photo = string.IsNullOrWhiteSpace(dto.Photo) ? null : dto.Photo.Trim();
        employee.DepartmentId = dto.DepartmentId;
        employee.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        await _context.Entry(employee).Reference(item => item.Department).LoadAsync();

        return Ok(ToResponseDto(employee));
    }

    /// <summary>
    /// Deletes one employee.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var employee = await _context.Employees.FindAsync(id);

        if (employee is null)
        {
            return NotFound(CreateError(StatusCodes.Status404NotFound, $"Employee with id {id} was not found."));
        }

        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Uploads an employee photo and returns a URL that can be saved in the Photo field.
    /// </summary>
    [HttpPost("upload-photo")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ImageUploadResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status415UnsupportedMediaType)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ImageUploadResponseDto>> UploadPhoto(IFormFile file)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest(CreateError(StatusCodes.Status400BadRequest, "Please select an image file."));
        }

        var extension = Path.GetExtension(file.FileName);
        if (!AllowedPhotoExtensions.Contains(extension))
        {
            return BadRequest(CreateError(
                StatusCodes.Status400BadRequest,
                "Invalid image type. Allowed types are .jpg, .jpeg, .png, and .webp."));
        }

        if (!AllowedPhotoContentTypes.Contains(file.ContentType))
        {
            return BadRequest(CreateError(
                StatusCodes.Status400BadRequest,
                "Invalid image content type. Allowed content types are image/jpeg, image/png, and image/webp."));
        }

        const long maxFileSize = 2 * 1024 * 1024;
        if (file.Length > maxFileSize)
        {
            return BadRequest(CreateError(StatusCodes.Status400BadRequest, "Image size must not be larger than 2 MB."));
        }

        var uploadsPath = Path.Combine(_environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot"), "uploads", "employees");
        Directory.CreateDirectory(uploadsPath);

        var fileName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        var filePath = Path.Combine(uploadsPath, fileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var photoUrl = $"/uploads/employees/{fileName}";
        return Created(photoUrl, new ImageUploadResponseDto
        {
            Photo = photoUrl,
            FileName = fileName
        });
    }

    private static EmployeeResponseDto ToResponseDto(Employee employee)
    {
        return new EmployeeResponseDto
        {
            EmployeeId = employee.EmployeeId,
            EmployeeFirstName = employee.EmployeeFirstName,
            EmployeeLastName = employee.EmployeeLastName,
            Gender = employee.Gender,
            DateOfBirth = employee.DateOfBirth,
            DateJoined = employee.DateJoined,
            EmployeeAddress = employee.EmployeeAddress,
            Photo = employee.Photo,
            DepartmentId = employee.DepartmentId,
            DepartmentName = employee.Department?.DepartmentName ?? string.Empty,
            CreatedAt = employee.CreatedAt,
            UpdatedAt = employee.UpdatedAt
        };
    }

    private static ApiErrorResponseDto CreateError(int statusCode, string message)
    {
        return new ApiErrorResponseDto
        {
            StatusCode = statusCode,
            Message = message
        };
    }

    private static (int PageNumber, int PageSize) NormalizePagination(int pageNumber, int pageSize)
    {
        const int defaultPageNumber = 1;
        const int defaultPageSize = 10;
        const int maxPageSize = 50;

        var safePageNumber = pageNumber < 1 ? defaultPageNumber : pageNumber;
        var safePageSize = pageSize < 1 ? defaultPageSize : Math.Min(pageSize, maxPageSize);

        return (safePageNumber, safePageSize);
    }

    private static PagedResponseDto<T> CreatePagedResponse<T>(
        List<T> items,
        int pageNumber,
        int pageSize,
        int totalCount)
    {
        return new PagedResponseDto<T>
        {
            Items = items,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }
}
