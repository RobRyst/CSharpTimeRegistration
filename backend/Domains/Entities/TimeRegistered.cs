using System.ComponentModel.DataAnnotations.Schema;
using backend.Domains.Entities;

public class TimeRegistered
{
    public int Id { get; set; }

    public string UserId { get; set; }

    public AppUser User { get; set; }

    public DateTime Date { get; set; }

    public double Hours { get; set; }

    public string? Comment { get; set; }

    public string Status { get; set; }
}
