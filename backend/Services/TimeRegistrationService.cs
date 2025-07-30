using backend.Domains.Interfaces;
using backend.Dtos;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class TimeRegistrationService : ITimeRegistrationService
    {
    private readonly ApplicationDbContext _context;

    public TimeRegistrationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TimeRegistration>> GetAllTimeRegistrations()
    {
        return await _context.TimeRegistrations.Include(TimeRegistrations => TimeRegistrations.User).ToListAsync();
    }

    public async Task<TimeRegistrationDto?> GetTimeRegistrationById(string id)
    {
        var result = await _context.TimeRegistrations
            .Include(TimeRegistrations => TimeRegistrations.User)
            .FirstOrDefaultAsync(TimeRegistrations => TimeRegistrations.Id.ToString() == id);

        if (result == null) return null;

        return new TimeRegistrationDto
        {
            Id = result.Id,
            UserId = result.UserId,
            Date = result.Date,
            Hours = result.Hours,
            Comment = result.Comment,
            Status = result.Status
        };
    }

    public async Task<TimeRegistrationDto?> CreateTimeRegistrationAsync(TimeRegistrationDto dto)
    {
        var entity = new TimeRegistration
        {
            UserId = dto.UserId,
            Date = dto.Date,
            Hours = dto.Hours,
            Comment = dto.Comment,
            Status = dto.Status
        };

        _context.TimeRegistrations.Add(entity);
        await _context.SaveChangesAsync();

        dto.Id = entity.Id;
        return dto;
    }
}
}