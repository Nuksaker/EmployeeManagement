using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EmployeeManagement.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace EmployeeManagement.Api.Controllers;

/// <summary>
/// Handles user login and returns a JWT token for secured API requests.
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    /// <summary>
    /// Logs in with the configured API user and returns a bearer token.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public ActionResult<AuthResponseDto> Login(LoginRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(CreateError(
                StatusCodes.Status400BadRequest,
                "Username and Password are required."));
        }

        var configuredUsername = _configuration["ApiUser:Username"];
        var configuredPassword = _configuration["ApiUser:Password"];

        // For this test project, credentials are read from configuration.
        // In production, use a user table with hashed passwords instead.
        if (!string.Equals(dto.Username, configuredUsername, StringComparison.Ordinal)
            || !string.Equals(dto.Password, configuredPassword, StringComparison.Ordinal))
        {
            return Unauthorized(CreateError(
                StatusCodes.Status401Unauthorized,
                "Invalid username or password."));
        }

        var expiresAt = DateTime.UtcNow.AddMinutes(_configuration.GetValue("Jwt:ExpiresInMinutes", 120));
        var token = CreateJwtToken(dto.Username.Trim(), expiresAt);

        return Ok(new AuthResponseDto
        {
            Token = token,
            ExpiresAt = expiresAt,
            Username = dto.Username.Trim()
        });
    }

    private string CreateJwtToken(string username, DateTime expiresAt)
    {
        var jwtKey = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Jwt:Key is missing from configuration.");
        var issuer = _configuration["Jwt:Issuer"];
        var audience = _configuration["Jwt:Audience"];

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Name, username)
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static ApiErrorResponseDto CreateError(int statusCode, string message)
    {
        return new ApiErrorResponseDto
        {
            StatusCode = statusCode,
            Message = message
        };
    }
}
