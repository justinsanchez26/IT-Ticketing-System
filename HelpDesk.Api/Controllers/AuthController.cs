using Google.Apis.Auth;
using HelpDesk.Api.Data;
using HelpDesk.Api.Dtos;
using HelpDesk.Api.Models;
using HelpDesk.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly JwtService _jwt;

    public AuthController(AppDbContext db, IConfiguration config, JwtService jwt)
    {
        _db = db;
        _config = config;
        _jwt = jwt;
    }

    [HttpPost("google")]
    public async Task<ActionResult<AuthResponse>> GoogleLogin([FromBody] GoogleAuthRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.IdToken))
            return BadRequest("Missing idToken.");

        var googleClientId = _config["Authentication:Google:ClientId"];
        if (string.IsNullOrWhiteSpace(googleClientId))
            return BadRequest("Google ClientId not configured in appsettings.json.");


        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(req.IdToken, new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { googleClientId }
            });
        }
        catch
        {
            return Unauthorized("Invalid Google token.");
        }

        // payload.Email is the main identity
        var email = payload.Email?.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email))
            return Unauthorized("Google token has no email.");

        var fullName = payload.Name ?? payload.GivenName ?? "User";

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);

        // Create user if not existing (MVP behavior)
        if (user == null)
        {
            user = new User
            {
                Email = email,
                FullName = fullName,
                Role = UserRole.EndUser,
                IsActive = true
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();
        }

        if (!user.IsActive)
            return Unauthorized("Account is disabled.");

        var token = _jwt.CreateToken(user);

        return Ok(new AuthResponse
        {
            Token = token,
            Profile = new UserProfile
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.ToString()
            }
        });
    }
}
