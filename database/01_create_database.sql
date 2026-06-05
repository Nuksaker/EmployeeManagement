IF DB_ID(N'EmployeeManagementDb') IS NULL
BEGIN
    CREATE DATABASE EmployeeManagementDb;
END
GO

USE EmployeeManagementDb;
GO

IF OBJECT_ID(N'dbo.Departments', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Departments
    (
        Department_ID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Departments PRIMARY KEY,
        Department_Name NVARCHAR(100) NOT NULL,
        Department_Address NVARCHAR(255) NULL,
        Created_At DATETIME2 NOT NULL CONSTRAINT DF_Departments_Created_At DEFAULT sysdatetime(),
        Updated_At DATETIME2 NULL
    );
END
GO

IF OBJECT_ID(N'dbo.Employees', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Employees
    (
        Employee_ID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Employees PRIMARY KEY,
        Employee_First_Name NVARCHAR(100) NOT NULL,
        Employee_Last_Name NVARCHAR(100) NOT NULL,
        Gender NVARCHAR(20) NULL,
        Date_of_Birth DATE NULL,
        Date_Joined DATE NULL,
        Employee_Address NVARCHAR(255) NULL,
        Photo NVARCHAR(255) NULL,
        Department_ID INT NOT NULL,
        Created_At DATETIME2 NOT NULL CONSTRAINT DF_Employees_Created_At DEFAULT sysdatetime(),
        Updated_At DATETIME2 NULL,
        CONSTRAINT FK_Employees_Departments_Department_ID
            FOREIGN KEY (Department_ID)
            REFERENCES dbo.Departments(Department_ID)
    );
END
GO

IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_Employees_Department_ID' AND object_id = OBJECT_ID('dbo.Employees'))
BEGIN
    CREATE INDEX IX_Employees_Department_ID
    ON dbo.Employees (Department_ID);
END
GO
