using backend.Dtos;

namespace backend.Domains.Interfaces
{
    public interface IProjectService
    {
        Task<IEnumerable<ProjectDto>> GetAllProjects();
        Task<ProjectDto?> GetProjectsById(string id);
        Task<ProjectDto?> CreateProjectAsync(CreateProjectDto dto);
    }
}