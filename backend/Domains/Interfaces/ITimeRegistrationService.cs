using backend.Dtos;

public interface ITimeRegistrationService
{
    Task<IEnumerable<TimeRegistration>> GetAllTimeRegistrations();
    Task<IEnumerable<TimeRegistration>> GetAllTimeRegistrations(string userId);
    Task<TimeRegistrationDto?> GetTimeRegistrationById(string id);
    Task<TimeRegistrationDto?> CreateTimeRegistrationAsync(CreateTimeRegistrationDto dto, string userId);
}
