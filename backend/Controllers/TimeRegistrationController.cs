using backend.Domains.Entities;
using backend.Services;
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
        private readonly TimeRegistrationService _timeRegistrationService;

        public TimeRegistrationController(ILogger<TimeRegistrationController> logger, UserManager<AppUser> userManager, TimeRegistrationService timeRegistrationService)
        {
            _userManager = userManager;
            _logger = logger;
            _timeRegistrationService = timeRegistrationService;

        }

        [HttpGet]
        public async Task<IActionResult> GetAllTimeRegistrations()
        {
            try
            {
                var timeRegistrations = await _timeRegistrationService.GetAllTimeRegistrations();
                return Ok(timeRegistrations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Counldn't fetch all time registrations");
                return StatusCode(500, "Counldn't fetch all time registrations");
            }
        }

        [HttpPost]
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
    }

}