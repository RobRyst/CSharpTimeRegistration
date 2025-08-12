namespace backend.Domains.Entities
{
    public class Project
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; } = "Pending";
        public ICollection<TimeRegistration> TimeRegistrations { get; set; } = new List<TimeRegistration>();
    }
}