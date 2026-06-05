using EmployeeManagement.Api.Data;
using EmployeeManagement.Api.DTOs;
using EmployeeManagement.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.Api.Controllers;

/// <summary>
/// Handles CRUD operations for departments.
/// </summary>
[ApiController]
[Route("api/departments")]
[Authorize]
public class DepartmentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public DepartmentsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets departments with server-side pagination.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponseDto<DepartmentResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedResponseDto<DepartmentResponseDto>>> GetDepartments(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var pagination = NormalizePagination(pageNumber, pageSize);

        var query = _context.Departments
            .OrderBy(department => department.DepartmentName)
            .Select(department => new DepartmentResponseDto
            {
                DepartmentId = department.DepartmentId,
                DepartmentName = department.DepartmentName,
                DepartmentAddress = department.DepartmentAddress,
                CreatedAt = department.CreatedAt,
                UpdatedAt = department.UpdatedAt
            });

        var totalCount = await query.CountAsync();
        var departments = await query
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync();

        return Ok(CreatePagedResponse(departments, pagination.PageNumber, pagination.PageSize, totalCount));
    }

    /// <summary>
    /// Gets one department by id.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(DepartmentResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DepartmentResponseDto>> GetDepartment(int id)
    {
        var department = await _context.Departments.FindAsync(id);

        if (department is null)
        {
            return NotFound(CreateError(StatusCodes.Status404NotFound, $"Department with id {id} was not found."));
        }

        return Ok(ToResponseDto(department));
    }

    /// <summary>
    /// Creates a new department.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(DepartmentResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DepartmentResponseDto>> CreateDepartment(DepartmentCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.DepartmentName))
        {
            return BadRequest(CreateError(StatusCodes.Status400BadRequest, "Department_Name is required."));
        }

        var department = new Department
        {
            DepartmentName = dto.DepartmentName.Trim(),
            DepartmentAddress = string.IsNullOrWhiteSpace(dto.DepartmentAddress)
                ? null
                : dto.DepartmentAddress.Trim()
        };

        _context.Departments.Add(department);
        await _context.SaveChangesAsync();

        var response = ToResponseDto(department);

        return CreatedAtAction(nameof(GetDepartment), new { id = response.DepartmentId }, response);
    }

    /// <summary>
    /// Updates an existing department.
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(DepartmentResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateDepartment(int id, DepartmentUpdateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.DepartmentName))
        {
            return BadRequest(CreateError(StatusCodes.Status400BadRequest, "Department_Name is required."));
        }

        var department = await _context.Departments.FindAsync(id);

        if (department is null)
        {
            return NotFound(CreateError(StatusCodes.Status404NotFound, $"Department with id {id} was not found."));
        }

        department.DepartmentName = dto.DepartmentName.Trim();
        department.DepartmentAddress = string.IsNullOrWhiteSpace(dto.DepartmentAddress)
            ? null
            : dto.DepartmentAddress.Trim();
        department.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(department));
    }

    /// <summary>
    /// Deletes a department if it does not have employees.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteDepartment(int id)
    {
        var department = await _context.Departments.FindAsync(id);

        if (department is null)
        {
            return NotFound(CreateError(StatusCodes.Status404NotFound, $"Department with id {id} was not found."));
        }

        var hasEmployees = await _context.Employees.AnyAsync(employee => employee.DepartmentId == id);
        if (hasEmployees)
        {
            return BadRequest(CreateError(
                StatusCodes.Status400BadRequest,
                "This department cannot be deleted because employees are assigned to it."));
        }

        _context.Departments.Remove(department);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static DepartmentResponseDto ToResponseDto(Department department)
    {
        return new DepartmentResponseDto
        {
            DepartmentId = department.DepartmentId,
            DepartmentName = department.DepartmentName,
            DepartmentAddress = department.DepartmentAddress,
            CreatedAt = department.CreatedAt,
            UpdatedAt = department.UpdatedAt
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
