using EmployeeManagement.Api.Data;
using EmployeeManagement.Api.DTOs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Console logging is enough for this test project and avoids Windows Event Log
// permission issues on local developer machines.
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Add controller support. This project uses controller-based APIs so each route
// is easy to find and explain during an interview. The metadata provider makes
// validation errors use the same JSON field names shown in Swagger.
builder.Services.AddControllers(options =>
{
    options.ModelMetadataDetailsProviders.Add(new SystemTextJsonValidationMetadataProvider());
});

// Return a consistent JSON shape when model validation fails.
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(item => item.Value?.Errors.Count > 0)
            .ToDictionary(
                item => item.Key,
                item => item.Value!.Errors.Select(error => error.ErrorMessage).ToArray());

        return new BadRequestObjectResult(new ApiErrorResponseDto
        {
            StatusCode = StatusCodes.Status400BadRequest,
            Message = "Validation failed. Please check the submitted data.",
            Errors = errors
        });
    };
});

// Connect Entity Framework Core to SQL Server. The connection string is stored
// in appsettings.json so it can be changed without touching C# code.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"]
    ?? throw new InvalidOperationException("Jwt:Key is missing from configuration.");

// JWT bearer authentication protects the API while keeping the setup simple
// enough to explain in a programming test.
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.FromMinutes(2)
        };

        options.Events = new JwtBearerEvents
        {
            OnChallenge = async context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";

                await context.Response.WriteAsJsonAsync(new ApiErrorResponseDto
                {
                    StatusCode = StatusCodes.Status401Unauthorized,
                    Message = "Unauthorized. Please login and send a valid bearer token."
                });
            },
            OnForbidden = async context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";

                await context.Response.WriteAsJsonAsync(new ApiErrorResponseDto
                {
                    StatusCode = StatusCodes.Status403Forbidden,
                    Message = "Forbidden. You do not have permission to access this resource."
                });
            }
        };
    });

builder.Services.AddAuthorization();

// Store ASP.NET Core data protection keys inside the project during local
// development so the API does not depend on machine-level protected keys.
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(
        Path.Combine(builder.Environment.ContentRootPath, "App_Data", "DataProtectionKeys")));

// Swagger/OpenAPI makes it easy to test the API in a browser during development.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Employee Management API",
        Version = "v1",
        Description = "RESTful API for managing departments and employees."
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Login with /api/auth/login, then paste the JWT token here."
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer", document, null),
            new List<string>()
        }
    });
});

// Allow the Next.js frontend to call this API during local development.
builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Convert unexpected server errors into clear JSON instead of an HTML error page.
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        await context.Response.WriteAsJsonAsync(new ApiErrorResponseDto
        {
            StatusCode = StatusCodes.Status500InternalServerError,
            Message = CreateServerErrorMessage(exception, app.Environment.IsDevelopment())
        });
    });
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Serve uploaded employee photos from wwwroot/uploads.
app.UseStaticFiles();

app.UseCors("LocalFrontend");
app.UseStatusCodePages(async context =>
{
    var response = context.HttpContext.Response;

    if (response.HasStarted || response.ContentType is not null)
    {
        return;
    }

    response.ContentType = "application/json";

    var statusCode = response.StatusCode;
    var message = statusCode switch
    {
        StatusCodes.Status400BadRequest => "Bad request. Please check the submitted data.",
        StatusCodes.Status401Unauthorized => "Unauthorized. Please sign in or provide valid credentials.",
        StatusCodes.Status403Forbidden => "Forbidden. You do not have permission to access this resource.",
        StatusCodes.Status404NotFound => "The requested API endpoint was not found.",
        StatusCodes.Status405MethodNotAllowed => "HTTP method is not allowed for this endpoint.",
        StatusCodes.Status413PayloadTooLarge => "Uploaded file is too large.",
        StatusCodes.Status415UnsupportedMediaType => "Unsupported media type. Please check the request content type.",
        StatusCodes.Status500InternalServerError => "Server error. Please contact the system administrator.",
        _ => "Request failed."
    };

    await response.WriteAsJsonAsync(new ApiErrorResponseDto
    {
        StatusCode = statusCode,
        Message = message
    });
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

static string CreateServerErrorMessage(Exception? exception, bool isDevelopment)
{
    if (!isDevelopment)
    {
        return "Server error. Please contact the system administrator.";
    }

    var sqlException = exception as SqlException ?? exception?.InnerException as SqlException;
    if (sqlException is not null)
    {
        return $"Database error: {sqlException.Message}";
    }

    return $"Server error: {exception?.Message}";
}
