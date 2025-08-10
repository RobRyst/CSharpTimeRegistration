using System.IO.Compression;
using backend.Domains.Entities;
using backend.Domains.Interfaces;
using backend.Dtos;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class ProjectService : IProjectService
    {
        private readonly ApplicationDbContext _context;

        public ProjectService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProjectDto>> GetAllProjects()
        {
            var projects = await _context.Projects.ToListAsync();
            return projects.Select(project => new ProjectDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description
            });
        }

        public async Task<ProjectDto?> GetProjectsById(string id)
        {
            var result = await _context.Projects
                .FirstOrDefaultAsync(project => project.Id.ToString() == id);

            if (result == null) return null;

            return new ProjectDto
            {
                Id = result.Id,
                Name = result.Name,
                Description = result.Description
            };
        }
        public async Task<ProjectDto?> CreateProjectAsync(CreateProjectDto projectDto)
        {
            var project = new Project
            {
                Name = projectDto.Name,
                Description = projectDto.Description
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return new ProjectDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description
            };
        }
        public async Task<ProjectDto?> UpdateProjectAsync(int id, UpdateProjectDto dto)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return null;

            if (!string.IsNullOrWhiteSpace(dto.Name)) project.Name = dto.Name;
            if (dto.Description != null) project.Description = dto.Description;
            if (dto.Status != null) project.Status = dto.Status;

            await _context.SaveChangesAsync();

            return new ProjectDto
            {
                Id = project.Id,
                Name = project.Name ?? string.Empty,
                Description = project.Description
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