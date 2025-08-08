using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace backend.Domains.Entities
{
    public class AppUser : IdentityUser
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public int? ProjectId { get; set; }
        public ICollection<TimeRegistration> TimeRegistrations { get; set; } = new List<TimeRegistration>();
    }
}