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
                StartTime = result.StartTime,
                EndTime = result.EndTime,
                Hours = result.Hours,
                Comment = result.Comment,
                Status = result.Status
            };
        }

        public async Task<TimeRegistrationDto?> CreateTimeRegistrationAsync(CreateTimeRegistrationDto dto, string userId)
        {
            var entity = new TimeRegistration
            {
                UserId = userId,
                Date = dto.Date,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Hours = dto.Hours,
                Comment = dto.Comment,
                Status = dto.Status
            };

            _context.TimeRegistrations.Add(entity);
            await _context.SaveChangesAsync();

            return new TimeRegistrationDto
            {
                Id = entity.Id,
                UserId = entity.UserId,
                Date = entity.Date,
                StartTime = entity.StartTime,
                EndTime = entity.EndTime,
                Hours = entity.Hours,
                Comment = entity.Comment,
                Status = entity.Status
            };
        }

        public async Task<IEnumerable<TimeRegistrationDto>> GetAllTimeRegistrations(string userId)
        {
            var records = await _context.TimeRegistrations
                                        .Where(tr => tr.UserId == userId)
                                        .ToListAsync();

            return records.Select(timeRegistration => new TimeRegistrationDto
            {
                Id = timeRegistration.Id,
                UserId = timeRegistration.UserId,
                Date = timeRegistration.Date,
                StartTime = timeRegistration.StartTime,
                EndTime = timeRegistration.EndTime,
                Hours = timeRegistration.Hours,
                Comment = timeRegistration.Comment,
                Status = timeRegistration.Status
            });
        }

        public async Task<IEnumerable<TimeRegistrationDto>> GetAllTimeRegistrationDtos()
        {
            var registrations = await _context.TimeRegistrations.ToListAsync();

            return registrations.Select(timeRegistration => new TimeRegistrationDto
            {
                Id = timeRegistration.Id,
                UserId = timeRegistration.UserId,
                Date = timeRegistration.Date,
                StartTime = timeRegistration.StartTime,
                EndTime = timeRegistration.EndTime,
                Hours = timeRegistration.Hours,
                Comment = timeRegistration.Comment,
                Status = timeRegistration.Status
            });
        }

        public async Task<bool> DeleteTimeRegistrationAsync(int id)
        {
            var entity = await _context.TimeRegistrations.FindAsync(id);
            if (entity == null) return false;

            _context.TimeRegistrations.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}