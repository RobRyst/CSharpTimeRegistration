using backend.Domains.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
[Route("[controller]")]
public class StatisticsController : ControllerBase
{
    private readonly ITimeRegistrationService _service;

    public StatisticsController(ITimeRegistrationService service)
    {
        _service = service;
    }

    [Authorize(Roles ="Admin")]
    [HttpGet("project-hours")]
    public async Task<IActionResult> GetProjectTotals()
        => Ok(await _service.GetTotalHoursPerProjectAsync());

    [Authorize(Roles ="Admin")]
    [HttpGet("project/{projectId}/user-hours")]
    public async Task<IActionResult> GetUserTotalsForProject(int projectId)
        => Ok(await _service.GetHoursPerUserForProjectAsync(projectId));

    [Authorize(Roles ="Admin")]
    [HttpGet("project/{projectId}/user/{userId}/hours")]
    public async Task<IActionResult> GetSingleUserProjectHours(int projectId, string userId)
        => Ok(await _service.GetHoursForUserOnProjectAsync(projectId, userId));
}
}

