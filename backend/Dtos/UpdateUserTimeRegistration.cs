namespace backend.Dtos
{
    public class UpdateTimeRegistrationDto
    {
        public int? ProjectId { get; set; }
        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string? Comment { get; set; }
    }
}