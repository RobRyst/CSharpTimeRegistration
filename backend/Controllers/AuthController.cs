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
        private readonly ILogger<AuthController> _logger;

        public AuthController(UserManager<AppUser> userManager, TokenService jwtTokenService, ILogger<AuthController> logger)
        {
            _userManager = userManager;
            TokenService = jwtTokenService;
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
        {
            try
            {
                if (string.IsNullOrEmpty(loginDto.Email) || string.IsNullOrEmpty(loginDto.Password))
                {
                    return BadRequest("Email and password are required");
                }

                var user = await _userManager.FindByEmailAsync(loginDto.Email);
                if (user == null)
                {
                    var userByNormalized = await _userManager.Users
                        .FirstOrDefaultAsync(u => u.NormalizedEmail == loginDto.Email.ToUpper());

                    if (userByNormalized != null)
                    {
                        Console.WriteLine($"Found user by normalized email: {userByNormalized.Email}");
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
        
        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] CreateUserDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest("Email and password are required");

            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
                return Conflict("A user with this email already exists");

            var user = new AppUser
            {
                Email = dto.Email,
                UserName = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            await _userManager.AddToRoleAsync(user, "User");

            var roles = await _userManager.GetRolesAsync(user);
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
    }
}
