using System.ComponentModel.DataAnnotations.Schema;
using backend.Domains.Entities;

namespace backend.Domains.Entities
{
    public class TimeRegistration
    {
        public int Id { get; set; }
        public string? UserId { get; set; }
        public AppUser? User { get; set; }

        public int? ProjectId { get; set; }
        public Project? Project { get; set; }

        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public double Hours { get; set; }

        public string? Comment { get; set; }
        public string? Status { get; set; }
    }
}
