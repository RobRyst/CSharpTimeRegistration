using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Domains.Entities
{
    public class TimeRegistered
    {
        [Key]
        public int Id { get; set; }
        public required string UserId { get; set; }
        
        [ForeignKey(nameof(UserId))]
        public User User { get; set; }
        public required DateTime Date { get; set; }
        public required double Hours { get; set; }
        public string? Comment { get; set; }
        public string? Status { get; set; }
    }
}