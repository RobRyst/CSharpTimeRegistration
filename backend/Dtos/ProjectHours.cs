namespace backend.Dtos
{
    public class ProjectHoursDto
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public double TotalHours { get; set; }
    }
}
