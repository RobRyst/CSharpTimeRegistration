using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;
using backend.Domains.Interfaces;
using backend.Services;
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

        public UserController(ILogger<UserController> logger, IUserService userService)
        {
            _logger = logger;
            _userService = userService;
        }

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
    }
}