using backend.Domains.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize(Roles = "Admin")] // apply once at controller level
    public class StatisticsController : ControllerBase
    {
        private readonly ITimeRegistrationService _service;

        public StatisticsController(ITimeRegistrationService service)
        {
            _service = service;
        }

        [HttpGet("project-hours")]
        public async Task<IActionResult> GetProjectTotals()
            => Ok(await _service.GetTotalHoursPerProjectAsync());

        [HttpGet("project/{projectId:int}/user-hours")]
        public async Task<IActionResult> GetUserTotalsForProject([FromRoute] int projectId)
            => Ok(await _service.GetHoursPerUserForProjectAsync(projectId));

        [HttpGet("project/{projectId:int}/user/{userId}/hours")]
        public async Task<IActionResult> GetSingleUserProjectHours([FromRoute] int projectId, [FromRoute] string userId)
            => Ok(await _service.GetHoursForUserOnProjectAsync(projectId, userId));
    }
}
