using System.Security.Claims;
using backend.Domains.Entities;
using backend.Domains.Interfaces;
using backend.Dtos;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TimeRegistrationController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly ILogger<TimeRegistrationController> _logger;
        private readonly ITimeRegistrationService _timeRegistrationService;
        private readonly ApplicationDbContext _context;

        public TimeRegistrationController(ILogger<TimeRegistrationController> logger, UserManager<AppUser> userManager, ITimeRegistrationService timeRegistrationService, ApplicationDbContext context)
        {
            _userManager = userManager;
            _logger = logger;
            _timeRegistrationService = timeRegistrationService;
            _context = context;

        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllTimeRegistrations()
        {
            try
            {
                Console.WriteLine("User authenticated? " + User.Identity?.IsAuthenticated);
                foreach (var claim in User.Claims)
                {
                    Console.WriteLine($"CLAIM: {claim.Type} = {claim.Value}");
                }
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var timeRegistrations = await _timeRegistrationService.GetAllTimeRegistrations(userId);
                return Ok(timeRegistrations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Couldn't fetch all time registrations");
                return StatusCode(500, "Couldn't fetch all time registrations");
            }
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTimeRegistrationById(string id)
        {
            try
            {
                var timeRegistration = await _timeRegistrationService.GetTimeRegistrationById(id);
                if (timeRegistration == null) return NotFound();
                return Ok(timeRegistration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Couldn't find the time registration you were looking for");
                return StatusCode(500, "Counldn't fetch time registration");
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateTimeRegistration([FromBody] CreateTimeRegistrationDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            Console.WriteLine("User Identity: " + User.Identity?.Name);
            Console.WriteLine("User Claims: " + string.Join(", ", User.Claims.Select(c => $"{c.Type}:{c.Value}")));
            Console.WriteLine("IsAuthenticated: " + User.Identity?.IsAuthenticated);
            Console.WriteLine("Claims: " + string.Join(", ", User.Claims.Select(c => $"{c.Type} = {c.Value}")));



            var result = await _timeRegistrationService.CreateTimeRegistrationAsync(dto, userId);
            return Ok(result);

        }
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTimeRegistration(int id)
        {
            var entity = await _context.TimeRegistrations.FindAsync(id);
            if (entity == null) return NotFound();

            _context.TimeRegistrations.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}