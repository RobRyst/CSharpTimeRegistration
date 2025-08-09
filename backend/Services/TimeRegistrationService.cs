using backend.Domains.Entities;
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
                Status = dto.Status,
                ProjectId = dto.ProjectId
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
                .Include(timeRegistrations => timeRegistrations.User)
                .Include(timeRegistrations => timeRegistrations.Project)
                .Where(timeRegistrations => timeRegistrations.UserId == userId)
                .ToListAsync();

            return records.Select(timeRegistrations => new TimeRegistrationDto
            {
                Id = timeRegistrations.Id,
                UserId = timeRegistrations.UserId,
                Date = timeRegistrations.Date,
                StartTime = timeRegistrations.StartTime,
                EndTime = timeRegistrations.EndTime,
                Hours = timeRegistrations.Hours,
                Comment = timeRegistrations.Comment,
                Status = timeRegistrations.Status,
                FirstName = timeRegistrations.User?.FirstName,
                LastName = timeRegistrations.User?.LastName,
                ProjectName = timeRegistrations.Project?.Name
            });
        }


        public async Task<IEnumerable<TimeRegistrationDto>> GetAllTimeRegistrationDtos()
        {
            var registrations = await _context.TimeRegistrations
                .Include(timeRegistrations => timeRegistrations.User)
                .Include(TimeRegistrations => TimeRegistrations.Project)
                .ToListAsync();

            return registrations.Select(timeRegistrations => new TimeRegistrationDto
            {
                Id = timeRegistrations.Id,
                UserId = timeRegistrations.UserId,
                Date = timeRegistrations.Date,
                StartTime = timeRegistrations.StartTime,
                EndTime = timeRegistrations.EndTime,
                Hours = timeRegistrations.Hours,
                Comment = timeRegistrations.Comment,
                Status = timeRegistrations.Status,
                FirstName = timeRegistrations.User?.FirstName,
                LastName = timeRegistrations.User?.LastName,
                ProjectName = timeRegistrations.Project?.Name
            });
        }

public async Task<IEnumerable<ProjectHoursDto>> GetTotalHoursPerProjectAsync()
{
    return await _context.TimeRegistrations
        .AsNoTracking()
        .Include(timeRegistrations => timeRegistrations.Project)
        .Where(timeRegistrations => timeRegistrations.ProjectId != null)
        .GroupBy(timeRegistrations => new { timeRegistrations.ProjectId, Name = timeRegistrations.Project!.Name })
        .Select(g => new ProjectHoursDto
        {
            ProjectId = g.Key.ProjectId!.Value,
            ProjectName = g.Key.Name ?? "Unknown",
            TotalHours = g.Sum(x => x.Hours)
        })
        .OrderByDescending(x => x.TotalHours)
        .ToListAsync();
}

        public async Task<IEnumerable<UserProjectHoursDto>> GetHoursPerUserForProjectAsync(int projectId)
        {
            return await _context.TimeRegistrations
                .AsNoTracking()
                .Include(timeRegistrations => timeRegistrations.User)
                .Include(timeRegistrations => timeRegistrations.Project)
                .Where(timeRegistrations => timeRegistrations.ProjectId == projectId)
                .GroupBy(timeRegistrations => new
                {
                    timeRegistrations.UserId,
                    FirstName = timeRegistrations.User!.FirstName,
                    LastName = timeRegistrations.User!.LastName,
                    timeRegistrations.ProjectId,
                    ProjectName = timeRegistrations.Project!.Name
                })
                .Select(g => new UserProjectHoursDto
                {
                    UserId = g.Key.UserId!,
                    FirstName = g.Key.FirstName,
                    LastName = g.Key.LastName,
                    ProjectId = g.Key.ProjectId!.Value,
                    ProjectName = g.Key.ProjectName ?? "Unknown",
                    TotalHours = g.Sum(x => x.Hours)
                })
                .OrderByDescending(x => x.TotalHours)
                .ToListAsync();
        }


        public async Task<double> GetHoursForUserOnProjectAsync(int projectId, string userId)
        {
            return await _context.TimeRegistrations
                .Where(timeRegistrations => timeRegistrations.ProjectId == projectId && timeRegistrations.UserId == userId)
                .SumAsync(timeRegistrations => timeRegistrations.Hours);
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