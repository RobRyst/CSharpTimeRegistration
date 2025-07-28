using System.ComponentModel.DataAnnotations;

namespace backend.Domains.Entities
{
    public class User
    {
        [Key]
        public string Id { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        [EmailAddress]
        public required string Email { get; set; }
        public required string Role { get; set; }
        public ICollection<TimeRegistered> TimeRegistrations { get; set; } = new List<TimeRegistered>();

    }
}