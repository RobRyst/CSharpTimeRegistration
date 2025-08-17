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
        Task<bool> UpdateTimeRegistrationStatusAsync(int id, string status);
        Task<TimeRegistrationDto?> UpdateTimeRegistrationAsync(int id, UpdateTimeRegistrationDto dto, string userId, bool isAdmin);
        //Task<TimeRegistrationDto?> UpdateOwnTimeRegistrationAsync(int id, string userId, UpdateTimeRegistrationDto dto);
        // ------------------ Stats ----------------------
        Task<IEnumerable<ProjectHoursDto>> GetTotalHoursPerProjectAsync(CancellationToken ct = default);
        Task<IEnumerable<UserProjectHoursDto>> GetHoursPerUserForProjectAsync(int projectId, CancellationToken ct = default);
        Task<double> GetHoursForUserOnProjectAsync(int projectId, string userId, CancellationToken ct = default);
    }
}
