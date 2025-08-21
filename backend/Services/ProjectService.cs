using System.IO.Compression;
using backend.Domains.Entities;
using backend.Domains.Interfaces;
using backend.Dtos;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class ProjectService : IProjectService
    {
        private static readonly HashSet<string> AllowedStatuses =
            new(StringComparer.OrdinalIgnoreCase) { "Pending", "Ongoing", "Completed", "Cancelled" };

        private readonly ApplicationDbContext _context;
        public ProjectService(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<ProjectDto>> GetAllProjects()
        {
            var projects = await _context.Projects.AsNoTracking().ToListAsync();
            return projects.Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Status = p.Status
            });
        }

        // Only projects users can pick — Ongoing
        public async Task<IEnumerable<ProjectDto>> GetAvailableProjects()
        {
            var projects = await _context.Projects
                .AsNoTracking()
                .Where(p => p.Status == "Ongoing")
                .ToListAsync();

            return projects.Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Status = p.Status
            });
        }

        public async Task<ProjectDto?> GetProjectsById(int id)
        {
            var project = await _context.Projects
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null) return null;

            return new ProjectDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                Status = project.Status
            };
        }

        public async Task<ProjectDto?> CreateProjectAsync(CreateProjectDto dto)
        {
            var project = new Project
            {
                Name = dto.Name,
                Description = dto.Description,
                Status = "Pending" // default
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return new ProjectDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                Status = project.Status
            };
        }

        public async Task<ProjectDto?> UpdateProjectAsync(int id, UpdateProjectDto dto)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return null;

            if (!string.IsNullOrWhiteSpace(dto.Name)) project.Name = dto.Name;
            if (dto.Description != null) project.Description = dto.Description;

            if (!string.IsNullOrWhiteSpace(dto.Status))
            {
                if (!AllowedStatuses.Contains(dto.Status))
                    throw new ArgumentException("Invalid status. Allowed: Pending, Ongoing, Completed, Cancelled.");

                project.Status = dto.Status;
            }

            await _context.SaveChangesAsync();

            return new ProjectDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                Status = project.Status
            };
        }

        public async Task<bool> DeleteProjectById(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return false;
            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}