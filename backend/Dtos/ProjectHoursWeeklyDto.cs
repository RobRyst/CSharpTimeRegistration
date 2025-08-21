namespace backend.Dtos
{
    public class ProjectHoursWeeklyDto
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public DateTime WeekStart { get; set; }
        public double TotalHours { get; set; }
    }
}