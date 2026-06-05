using EmployeeManagement.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.Api.Data;

/// <summary>
/// AppDbContext is the bridge between C# classes and SQL Server tables.
/// Entity Framework Core uses this class to query and save Departments and Employees.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Employee> Employees => Set<Employee>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Department>(entity =>
        {
            entity.ToTable("Departments");
            entity.HasKey(department => department.DepartmentId);

            entity.Property(department => department.DepartmentId)
                .HasColumnName("Department_ID");

            entity.Property(department => department.DepartmentName)
                .HasColumnName("Department_Name")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(department => department.DepartmentAddress)
                .HasColumnName("Department_Address")
                .HasMaxLength(255);

            entity.Property(department => department.CreatedAt)
                .HasColumnName("Created_At")
                .HasDefaultValueSql("sysdatetime()");

            entity.Property(department => department.UpdatedAt)
                .HasColumnName("Updated_At");
        });

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.ToTable("Employees");
            entity.HasKey(employee => employee.EmployeeId);

            entity.Property(employee => employee.EmployeeId)
                .HasColumnName("Employee_ID");

            entity.Property(employee => employee.EmployeeFirstName)
                .HasColumnName("Employee_First_Name")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(employee => employee.EmployeeLastName)
                .HasColumnName("Employee_Last_Name")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(employee => employee.Gender)
                .HasMaxLength(20);

            entity.Property(employee => employee.DateOfBirth)
                .HasColumnName("Date_of_Birth")
                .HasColumnType("date");

            entity.Property(employee => employee.DateJoined)
                .HasColumnName("Date_Joined")
                .HasColumnType("date");

            entity.Property(employee => employee.EmployeeAddress)
                .HasColumnName("Employee_Address")
                .HasMaxLength(255);

            entity.Property(employee => employee.Photo)
                .HasMaxLength(255);

            entity.Property(employee => employee.DepartmentId)
                .HasColumnName("Department_ID");

            entity.Property(employee => employee.CreatedAt)
                .HasColumnName("Created_At")
                .HasDefaultValueSql("sysdatetime()");

            entity.Property(employee => employee.UpdatedAt)
                .HasColumnName("Updated_At");

            entity.HasOne(employee => employee.Department)
                .WithMany(department => department.Employees)
                .HasForeignKey(employee => employee.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
