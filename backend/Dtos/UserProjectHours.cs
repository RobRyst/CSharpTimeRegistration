namespace backend.Dtos
{
    public class UserProjectHoursDto
    {
        public string UserId { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public double TotalHours { get; set; }
    }
}