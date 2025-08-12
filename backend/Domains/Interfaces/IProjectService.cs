using backend.Dtos;

namespace backend.Domains.Interfaces
{
    public interface IProjectService
    {
        Task<IEnumerable<ProjectDto>> GetAllProjects();
        Task<ProjectDto?> GetProjectsById(string id);
        Task<IEnumerable<ProjectDto>> GetAvailableProjects();
        Task<ProjectDto?> CreateProjectAsync(CreateProjectDto dto);
        Task<ProjectDto?> UpdateProjectAsync(int id, UpdateProjectDto dto);
        Task<bool> DeleteProjectById(int id);
    }
}