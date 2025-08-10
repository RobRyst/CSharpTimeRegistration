using System.Security.Claims;
using backend.Domains.Entities;
using backend.Domains.Interfaces;
using backend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ProjectController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IProjectService _projectService;
        private readonly ILogger<ProjectController> _logger;

        public ProjectController(
            UserManager<AppUser> userManager, IProjectService projectService, ILogger<ProjectController> logger)
        {
            _logger = logger;
            _projectService = projectService;
            _userManager = userManager;
        }

        [Authorize]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllProjects()
        {
            try
            {
                var projects = await _projectService.GetAllProjects();
                return Ok(projects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Couldn't find projexct");
                return StatusCode(500, "Couldn't find project");
            }
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProjectsById(string id)
        {
            try
            {
                var projects = await _projectService.GetProjectsById(id);
                if (projects == null) return NotFound();

                return Ok(projects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Couldn't find projexct");
                return StatusCode(500, "Couldn't find project");
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] CreateProjectDto projectDto)
        {
            try
            {
                var result = await _projectService.CreateProjectAsync(projectDto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating project");
                return StatusCode(500, "Failed to create project");
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(int id, [FromBody] UpdateProjectDto dto)
        {
            try
            {
                var updated = await _projectService.UpdateProjectAsync(id, dto);
                if (updated == null) return NotFound();
                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating project");
                return StatusCode(500, "Failed to update project");
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            try
            {
                var ok = await _projectService.DeleteProjectById(id);
                if (!ok) return NotFound();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting project");
                return StatusCode(500, "Failed to delete project");
            }
        }
    }
}