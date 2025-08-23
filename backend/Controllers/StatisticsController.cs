using backend.Domains.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize(Roles = "Admin")]
    public class StatisticsController : ControllerBase
    {
        private readonly ITimeRegistrationService _service;
        private readonly ILogger<StatisticsController> _logger;

        public StatisticsController(ITimeRegistrationService service, ILogger<StatisticsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet("project/{projectId:int}/user-hours")]
        public async Task<IActionResult> GetUserTotalsForProject(int projectId, DateTime? from, DateTime? to)
        {
            try
            {
                var rows = await _service.GetHoursPerUserForProjectAsync(projectId, from, to, HttpContext.RequestAborted);
                return Ok(rows);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetUserTotalsForProject");
                return StatusCode(500, "Failed to get user totals for project");
            }
        }

        [HttpGet("project/{projectId:int}/user/{userId}/hours")]
        public async Task<IActionResult> GetSingleUserProjectHours(int projectId, string userId, DateTime? from, DateTime? to)
        {
            try
            {
                var total = await _service.GetHoursForUserOnProjectAsync(projectId, userId, from, to, HttpContext.RequestAborted);
                return Ok(total);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetSingleUserProjectHours");
                return StatusCode(500, "Failed to get single user hours for project");
            }
        }

        [HttpGet("project-hours")]
        public async Task<IActionResult> GetProjectTotals(DateTime? from, DateTime? to)
        {
            try
            {
                var rows = await _service.GetTotalHoursPerProjectAsync(from, to, HttpContext.RequestAborted);
                return Ok(rows);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetProjectTotals");
                return StatusCode(500, "Failed to get project totals");
            }
        }

        [HttpGet("project-hours/monthly")]
        public async Task<IActionResult> GetProjectTotalsMonthly(DateTime? from, DateTime? to)
        {
            try
            {
                var rows = await _service.GetMonthlyHoursPerProjectAsync(from, to, HttpContext.RequestAborted);
                return Ok(rows);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetProjectTotalsMonthly");
                return StatusCode(500, "Failed to get monthly project totals");
            }
        }

        [HttpGet("project-hours/weekly")]
        public async Task<IActionResult> GetProjectTotalsWeekly(DateTime? from, DateTime? to)
        {
            try
            {
                var rows = await _service.GetWeeklyHoursPerProjectAsync(from, to, HttpContext.RequestAborted);
                return Ok(rows);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetProjectTotalsWeekly");
                return StatusCode(500, "Failed to get weekly project totals");
            }
        }
    }
}
