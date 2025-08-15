using System.Security.Claims;
using backend.Domains.Entities;
using backend.Domains.Interfaces;
using backend.Dtos;
using backend.PDFs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using QuestPDF.Fluent;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TimeRegistrationController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly ILogger<TimeRegistrationController> _logger;
        private readonly ITimeRegistrationService _timeRegistrationService;

        public TimeRegistrationController(
            ILogger<TimeRegistrationController> logger,
            UserManager<AppUser> userManager,
            ITimeRegistrationService timeRegistrationService)
        {
            _userManager = userManager;
            _logger = logger;
            _timeRegistrationService = timeRegistrationService;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllTimeRegistrationsAdmin()
        {
            var dtos = await _timeRegistrationService.GetAllTimeRegistrationDtos();
            return Ok(dtos);
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetTimeRegistrationsForUser()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var dtos = await _timeRegistrationService.GetAllTimeRegistrations(userId);
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Couldn't find the time registration you were looking for");
                return StatusCode(500, "Couldn't fetch time registration");
            }

        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTimeRegistrationById(string id)
        {
            try
            {
                var timeRegistration = await _timeRegistrationService.GetTimeRegistrationById(id);
                if (timeRegistration == null)
                    return NotFound();

                return Ok(timeRegistration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Couldn't find the time registration you were looking for");
                return StatusCode(500, "Couldn't fetch time registration");
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateTimeRegistration([FromBody] CreateTimeRegistrationDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _timeRegistrationService.CreateTimeRegistrationAsync(dto, userId);
            return Ok(result);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTimeRegistration(int id)
        {
            var success = await _timeRegistrationService.DeleteTimeRegistrationAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateTimeStatusDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Status))
                return BadRequest("Status is required");

            var ok = await _timeRegistrationService.UpdateTimeRegistrationStatusAsync(id, dto.Status);
            if (!ok) return NotFound();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("overview.pdf")]
        public async Task<IActionResult> ExportOverviewPdf([FromQuery] string? status = null)
        {
            var rows = await _timeRegistrationService.GetAllTimeRegistrationDtos();

            if (!string.IsNullOrWhiteSpace(status))
            rows = rows.Where(r => string.Equals(r.Status, status, StringComparison.OrdinalIgnoreCase));
            rows = rows.OrderBy(r => r.ProjectName).ThenBy(r => r.Date).ThenBy(r => r.StartTime);

            var title = $"Time Registrations — {(string.IsNullOrWhiteSpace(status) ? "All" : status)}";
            var doc = new UserOverviewPDF(rows, title);
            var bytes = doc.GeneratePdf();
            var fileName = $"time-registrations-overview-{(status ?? "all").ToLowerInvariant()}-{DateTime.UtcNow:yyyyMMdd-HHmm}.pdf";

            return File(bytes, "application/pdf", fileName);
        }
    }
}
