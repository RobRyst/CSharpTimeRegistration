using Microsoft.AspNetCore.Identity;

namespace backend.Domains.Models
{
    public class AppUserModel : IdentityUser
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }
}