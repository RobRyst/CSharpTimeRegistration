using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using backend.Domains.Models;
using backend.Domains.Entities;

public class ApplicationDbContext : IdentityDbContext<AppUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Project> Projects { get; set; }
    public DbSet<TimeRegistration> TimeRegistrations { get; set; }
}
