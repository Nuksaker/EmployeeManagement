# Backend README

ASP.NET Core Web API backend for the Employee Management test project.

## Requirements

- .NET SDK 10 or later
- SQL Server or SQL Server Express
- A database named `EmployeeManagementDb`

## Backend Structure

```text
backend/
|-- Controllers/
|   |-- AuthController.cs
|   |-- DepartmentsController.cs
|   `-- EmployeesController.cs
|-- Data/
|   `-- AppDbContext.cs
|-- DTOs/
|-- Models/
|-- Program.cs
|-- appsettings.json
`-- README.md
```

## Setup

1. Create the database schema:

   ```powershell
   sqlcmd -S localhost -E -i ..\database\01_create_database.sql
   ```

2. Check the connection string in `appsettings.json`:

   ```json
   "DefaultConnection": "Server=.\\SQLEXPRESS;Database=EmployeeManagementDb;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=True;"
   ```

   If you use another SQL Server instance, change the `Server` value. For example:

   ```json
   "DefaultConnection": "Server=localhost;Database=EmployeeManagementDb;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=True;"
   ```

   You can also override the connection string without editing the file:

   ```powershell
   $env:ConnectionStrings__DefaultConnection="Server=.\SQLEXPRESS;Database=EmployeeManagementDb;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=True;"
   dotnet run
   ```

3. Restore and run the API:

   ```powershell
   dotnet restore
   dotnet run
   ```

4. Open Swagger:

   ```text
   http://localhost:5000/swagger
   ```

5. Login in Swagger with `POST /api/auth/login`, then click `Authorize` and paste the returned JWT token.

Default test account:

```text
Username: admin
Password: Admin@12345
```

Change `ApiUser` and `Jwt:Key` in `appsettings.json` before using this outside a local test.

## Database Connection Settings

The backend connects to SQL Server through `ConnectionStrings:DefaultConnection` in `appsettings.json`.

Default local SQL Server:

```json
"DefaultConnection": "Server=.\\SQLEXPRESS;Database=EmployeeManagementDb;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=True;"
```

Local default instance:

```json
"DefaultConnection": "Server=localhost;Database=EmployeeManagementDb;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=True;"
```

SQL Server login:

```json
"DefaultConnection": "Server=localhost;Database=EmployeeManagementDb;User Id=sa;Password=YourStrongPassword;Encrypt=False;TrustServerCertificate=True;"
```

After changing the connection string, restart the backend with `dotnet run`.

## API Endpoints

Authentication:

- `POST /api/auth/login`

Departments:

- `GET /api/departments?pageNumber=1&pageSize=10`
- `GET /api/departments/{id}`
- `POST /api/departments`
- `PUT /api/departments/{id}`
- `DELETE /api/departments/{id}`

Employees:

- `GET /api/employees?pageNumber=1&pageSize=10`
- `GET /api/employees/{id}`
- `POST /api/employees`
- `PUT /api/employees/{id}`
- `DELETE /api/employees/{id}`
- `POST /api/employees/upload-photo`

List endpoints support server-side pagination. Use `pageNumber` and `pageSize` query string values; invalid values are normalized and the maximum page size is 50. Employee responses include `Department_ID` and `Department_Name`.

## Photo Upload

Employee photos are uploaded to the backend and stored under:

```text
backend/wwwroot/uploads/employees
```

The API returns a photo path such as:

```json
{
  "Photo": "/uploads/employees/example-file-name.png",
  "File_Name": "example-file-name.png"
}
```

Allowed file types:

- `.jpg`
- `.jpeg`
- `.png`
- `.webp`

Maximum file size: 2 MB.

## Error Response Format

API errors return clear JSON so the frontend can show useful messages.

Example:

```json
{
  "statusCode": 400,
  "message": "Validation failed. Please check the submitted data.",
  "errors": {
    "Employee_First_Name": ["Employee_First_Name is required."]
  }
}
```

Common HTTP status codes:

- `200 OK` - Data was read or updated successfully.
- `201 Created` - New data or uploaded file was created successfully.
- `204 No Content` - Data was deleted successfully.
- `400 Bad Request` - Submitted data is invalid.
- `401 Unauthorized` - Authentication is required.
- `403 Forbidden` - The authenticated user cannot access the resource.
- `404 Not Found` - The requested record or endpoint was not found.
- `415 Unsupported Media Type` - Uploaded file request is not multipart form data.
- `500 Internal Server Error` - Unexpected server error.

## Notes

- Controllers handle HTTP requests.
- DTOs define the request and response shapes.
- Models map to database tables.
- `AppDbContext` configures Entity Framework Core and SQL Server.
- Swagger is enabled only in the Development environment.
