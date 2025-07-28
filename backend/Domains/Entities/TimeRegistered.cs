using backend.Domains.Entities;

public class TimeRegistered
{
    public int Id { get; set; }

    public string UserId { get; set; } // FK to AppUser

    public AppUser User { get; set; } // Navigation

    public DateTime Date { get; set; }

    public double Hours { get; set; }

    public string? Comment { get; set; }

    public string Status { get; set; }
}
