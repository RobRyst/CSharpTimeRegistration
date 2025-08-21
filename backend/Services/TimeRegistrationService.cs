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

        public async Task<TimeRegistrationDto?> CreateTimeRegistrationAsync(
    CreateTimeRegistrationDto dto, string userId, bool isAdmin)
        {
            var project = await _context.Projects.FindAsync(dto.ProjectId);
            if (project == null)
                throw new InvalidOperationException("Project not found.");
            if (!string.Equals(project.Status, "Ongoing", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("You can only register time on ongoing projects.");

            if (!isAdmin)
            {
                var today = DateTime.UtcNow.Date;
                var target = dto.Date.Date;
                var days = Math.Abs((today - target).TotalDays);
                if (days > 30)
                    throw new InvalidOperationException("Only entries within ±30 days can be created.");
            }

            var duration = dto.EndTime - dto.StartTime;
            if (duration <= TimeSpan.Zero)
                throw new InvalidOperationException("End time must be after start time.");

            var entity = new TimeRegistration
            {
                UserId = userId,
                ProjectId = dto.ProjectId,
                Date = dto.Date,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Hours = Math.Round(duration.TotalHours, 2),
                Comment = dto.Comment,
                Status = isAdmin
                    ? (string.IsNullOrWhiteSpace(dto.Status) ? "Pending" : dto.Status)
                    : "Pending"
        
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
                Status = entity.Status,
                ProjectName = project.Name
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

        public async Task<IEnumerable<ProjectHoursDto>> GetTotalHoursPerProjectAsync(CancellationToken ct = default)
        {
            return await _context.TimeRegistrations
                .Include(timeRegistrations => timeRegistrations.Project)
                .Where(timeRegistrations => timeRegistrations.ProjectId != null && timeRegistrations.Status == "Accepted")
                .GroupBy(timeRegistrations => new { timeRegistrations.ProjectId, timeRegistrations.Project!.Name })
                .Select(g => new ProjectHoursDto
                {
                    ProjectId = g.Key.ProjectId!.Value,
                    ProjectName = g.Key.Name,
                    TotalHours = g.Sum(x => x.Hours)
                })
                .OrderByDescending(x => x.TotalHours)
                .ToListAsync(ct);
        }


        public async Task<IEnumerable<UserProjectHoursDto>> GetHoursPerUserForProjectAsync(int projectId, CancellationToken ct = default)
        {
            return await _context.TimeRegistrations
                .Include(timeRegistrations => timeRegistrations.User)
                .Include(timeRegistrations => timeRegistrations.Project)
                .Where(timeRegistrations => timeRegistrations.ProjectId == projectId && timeRegistrations.Status == "Accepted")
                .GroupBy(timeRegistrations => new { timeRegistrations.UserId, timeRegistrations.User!.FirstName, timeRegistrations.User!.LastName, timeRegistrations.ProjectId, timeRegistrations.Project!.Name })
                .Select(g => new UserProjectHoursDto
                {
                    UserId = g.Key.UserId!,
                    FirstName = g.Key.FirstName,
                    LastName = g.Key.LastName,
                    ProjectId = g.Key.ProjectId!.Value,
                    ProjectName = g.Key.Name,
                    TotalHours = g.Sum(x => x.Hours)
                })
                .OrderByDescending(x => x.TotalHours)
                .ToListAsync(ct);
        }

        public async Task<double> GetHoursForUserOnProjectAsync(int projectId, string userId, CancellationToken ct = default)
        {
            return await _context.TimeRegistrations
                .Where(timeRegistrations => timeRegistrations.ProjectId == projectId && timeRegistrations.UserId == userId && timeRegistrations.Status == "Accepted")  // <-- here
                .SumAsync(timeRegistrations => timeRegistrations.Hours, ct);
        }

        public async Task<bool> DeleteTimeRegistrationAsync(int id)
        {
            var entity = await _context.TimeRegistrations.FindAsync(id);
            if (entity == null) return false;

            _context.TimeRegistrations.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateTimeRegistrationStatusAsync(int id, string status)
        {
            var entity = await _context.TimeRegistrations.FindAsync(id);
            if (entity == null) return false;

            entity.Status = status;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<TimeRegistrationDto?> UpdateTimeRegistrationAsync(
    int id, UpdateTimeRegistrationDto dto, string userId, bool isAdmin)
        {
            var entity = await _context.TimeRegistrations
                .Include(x => x.Project)
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (entity == null) return null;

            var isOwner = entity.UserId == userId;
            if (!isAdmin && !isOwner) throw new UnauthorizedAccessException();

            var today = DateTime.UtcNow.Date;
            var targetDate = dto.Date.Date;
            var days = Math.Abs((today - targetDate).TotalDays);
            if (!isAdmin && days > 30) throw new InvalidOperationException("Only entries within ±30 days can be edited.");

            if (dto.ProjectId.HasValue)
            {
                var project = await _context.Projects.FindAsync(dto.ProjectId.Value);
                if (project == null || !string.Equals(project.Status, "Ongoing", StringComparison.OrdinalIgnoreCase))
                    throw new InvalidOperationException("Time can only be registered on ongoing projects.");
                entity.ProjectId = dto.ProjectId.Value;
            }

            entity.Date = dto.Date;
            entity.StartTime = dto.StartTime;
            entity.EndTime = dto.EndTime;

            var duration = dto.EndTime - dto.StartTime;
            if (duration <= TimeSpan.Zero) throw new InvalidOperationException("End time must be after start time.");
            entity.Hours = Math.Round(duration.TotalHours, 2);


            entity.Comment = dto.Comment;

            if (!isAdmin)
            {
                entity.Status = "Pending";
            }

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
                Status = entity.Status,
                FirstName = entity.User?.FirstName,
                LastName = entity.User?.LastName,
                ProjectName = entity.Project?.Name
            };
        }
        public async Task<TimeRegistration?> GetEntityByIdAsync(int id)
        {
            return await _context.TimeRegistrations
                .Include(x => x.Project)
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}