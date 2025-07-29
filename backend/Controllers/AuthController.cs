using backend.Dtos;
using backend.Domains.Entities;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly TokenService TokenService;
        private readonly ILogger _logger;

        public AuthController(UserManager<AppUser> userManager, TokenService jwtTokenService)
        {
            _userManager = userManager;
            TokenService = jwtTokenService;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
        {
            try
            {
                if (string.IsNullOrEmpty(loginDto.Email) || string.IsNullOrEmpty(loginDto.Password))
                {
                    Console.WriteLine("❌ Email or password is null/empty");
                    return BadRequest("Email and password are required");
                }

                var user = await _userManager.FindByEmailAsync(loginDto.Email);
                if (user == null)
                {
                    Console.WriteLine($"No user found with email: '{loginDto.Email}'");

                    var userByNormalized = await _userManager.Users
                        .FirstOrDefaultAsync(u => u.NormalizedEmail == loginDto.Email.ToUpper());

                    if (userByNormalized != null)
                    {
                        Console.WriteLine($"✅ Found user by normalized email: {userByNormalized.Email}");
                        user = userByNormalized;
                    }
                    else
                    {
                        return Unauthorized("Invalid email or password");
                    }
                }

                var passwordValid = await _userManager.CheckPasswordAsync(user, loginDto.Password);
                if (!passwordValid)
                {
                    _logger.LogError("Invalid email or password");
                    return Unauthorized("Invalid email or password");
                }

                // Get roles
                var roles = await _userManager.GetRolesAsync(user);

                // Generate token
                var token = TokenService.CreateToken(user, roles);
                return Ok(new
                {
                    token,
                    user = new
                    {
                        user.Id,
                        user.Email,
                        user.UserName,
                        roles
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred during login");
                return StatusCode(500, "An error occurred during login");
            }
        }
    }
}
