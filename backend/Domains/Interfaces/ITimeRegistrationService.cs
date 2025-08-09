using backend.Dtos;

namespace backend.Domains.Interfaces
{
    public interface ITimeRegistrationService
    {
        Task<IEnumerable<TimeRegistrationDto>> GetAllTimeRegistrationDtos();
        Task<IEnumerable<TimeRegistrationDto>> GetAllTimeRegistrations(string userId);
        Task<TimeRegistrationDto?> GetTimeRegistrationById(string id);
        Task<TimeRegistrationDto?> CreateTimeRegistrationAsync(CreateTimeRegistrationDto dto, string userId);
        Task<bool> DeleteTimeRegistrationAsync(int id);

        // ------------------ Stats ----------------------
        Task<IEnumerable<ProjectHoursDto>> GetTotalHoursPerProjectAsync();
        Task<IEnumerable<UserProjectHoursDto>> GetHoursPerUserForProjectAsync(int projectId);
        Task<double> GetHoursForUserOnProjectAsync(int projectId, string userId);
    }
}
