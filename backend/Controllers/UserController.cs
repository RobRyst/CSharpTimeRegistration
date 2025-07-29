using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;
using backend.Domains.Entities;
using backend.Domains.Interfaces;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly ILogger<UserController> _logger;
        private readonly IUserService _userService;
        private readonly UserManager<AppUser> _userManager;

        public UserController(UserManager<AppUser> userManager, ILogger<UserController> logger, IUserService userService)
        {
            _logger = logger;
            _userService = userService;
            _userManager = userManager;
        }

        [Authorize]
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _userService.GetAllUsers();
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Counldn't fetch all users");
                return StatusCode(500, "Counldn't fetch all users");
            }
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            try
            {
                var user = await _userService.GetUserById(id);
                if (user == null) return NotFound();
                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Couldn't find the user you were looking for");
                return StatusCode(500, "Counldn't fetch user");
            }
        }

/*
        [Authorize]
        [HttpPost("add-users")]
        public async Task<IActionResult> AddUser([FromBody] CreateUserDto dto)
        {
            try
            {
                var result = await _userService.CreateUserAsync(dto);
                if (!result.Succeeded) return BadRequest(result.Errors);
                return Ok("User created successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Couldn't Create User");
                return StatusCode(500, "Couldn't Create User");
            }
        }
*/

        [Authorize]
        [HttpGet("profile")]
        public IActionResult GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            var roles = User.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList();

            return Ok(new
            {
                UserId = userId,
                Email = userEmail,
                Roles = roles
            });
        }
    }
}