namespace backend.Dtos
{
    public class ProjectHoursMonthlyDto
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public int Year { get; set; }
        public int Month { get; set; }        // 1-12
        public double TotalHours { get; set; }
    }
}