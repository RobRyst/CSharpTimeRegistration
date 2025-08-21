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
    public class ProjectController : ControllerBase
    {
        private readonly IProjectService _projectService;
        private readonly ILogger<ProjectController> _logger;

        public ProjectController(IProjectService projectService, ILogger<ProjectController> logger)
        {
            _logger = logger;
            _projectService = projectService;
        }

        // Users get only Ongoing projects
        [Authorize]
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailable()
        {
            var projects = await _projectService.GetAvailableProjects();
            return Ok(projects);
        }

        // Admins can see everything
        [Authorize(Roles = "Admin")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllProjects()
        {
            var projects = await _projectService.GetAllProjects();
            return Ok(projects);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetProjectsById(int id)
        {
            var dto = await _projectService.GetProjectsById(id);
            if (dto == null) return NotFound();
            return Ok(dto);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] CreateProjectDto dto)
        {
            var result = await _projectService.CreateProjectAsync(dto);
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(int id, [FromBody] UpdateProjectDto dto)
        {
            var updated = await _projectService.UpdateProjectAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var ok = await _projectService.DeleteProjectById(id);
            if (!ok) return NotFound();
            return NoContent();
        }
    }
}
