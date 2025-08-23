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
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var isAdmin = User.IsInRole("Admin");

            var result = await _timeRegistrationService.CreateTimeRegistrationAsync(dto, userId, isAdmin);
            return Ok(result);
        }


        [Authorize]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteTimeRegistration(int id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var isAdmin = User.IsInRole("Admin");

                var entity = await _timeRegistrationService.GetEntityByIdAsync(id);
                if (entity is null)
                    return NotFound();

                if (!isAdmin && entity.UserId != userId)
                    return Forbid();

                var success = await _timeRegistrationService.DeleteTimeRegistrationAsync(id);
                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting TimeRegistration with id {Id}", id);
                return StatusCode(500, "An error occurred while deleting the time registration.");
            }
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
        public async Task<IActionResult> ExportOverviewPdf(
            DateTime? from = null,
            DateTime? to = null,
            string? userId = null,
            string? status = null)
        {
            var rows = await _timeRegistrationService.GetAllTimeRegistrationDtos();

            if (!string.IsNullOrWhiteSpace(userId))
                rows = rows.Where(r => r.UserId == userId);

            if (!string.IsNullOrWhiteSpace(status))
                rows = rows.Where(r => string.Equals(r.Status, status, StringComparison.OrdinalIgnoreCase));

            if (from.HasValue)
                rows = rows.Where(r => r.Date.Date >= from.Value.Date);

            if (to.HasValue)
                rows = rows.Where(r => r.Date.Date <= to.Value.Date);

            rows = rows
                .OrderBy(r => r.ProjectName)
                .ThenBy(r => r.Date)
                .ThenBy(r => r.StartTime);

            var title = "Time Registrations — Export";
            var doc = new UserOverviewPDF(rows, title);
            var bytes = doc.GeneratePdf();
            var fileName = $"time-registrations-{DateTime.UtcNow:yyyyMMdd-HHmm}.pdf";

            return File(bytes, "application/pdf", fileName);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTimeRegistration(int id, [FromBody] UpdateTimeRegistrationDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var isAdmin = User.IsInRole("Admin");

            try
            {
                var result = await _timeRegistrationService.UpdateTimeRegistrationAsync(id, dto, userId, isAdmin);
                if (result is null) return NotFound();
                return Ok(result);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
