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

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProjectsById(string id)
        {
            var project = await _projectService.GetProjectsById(id);
            if (project == null) return NotFound();
            return Ok(project);
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

        [Authorize(Roles = "Admin")]
        [HttpGet("overview.pdf")]
        public async Task<IActionResult> ExportProjectsOverviewPdf([FromQuery] string? status = null)
        {
            var projects = await _projectService.GetAllProjects();
            if (!string.IsNullOrWhiteSpace(status))
                projects = projects.Where(p => string.Equals(p.Status, status, StringComparison.OrdinalIgnoreCase));

            var doc = new UserOverviewPDF(projects, 
                string.IsNullOrWhiteSpace(status) ? "Projects Overview" : $"Projects Overview — {status}");

            var bytes = doc.GeneratePdf();
            var fileName = $"projects-overview-{(status ?? "all")}-{DateTime.UtcNow:yyyyMMdd-HHmm}.pdf";

            return File(bytes, "application/pdf", fileName);
        }
    }
}
