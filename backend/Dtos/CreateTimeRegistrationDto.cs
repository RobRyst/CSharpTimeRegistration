namespace backend.Dtos
{
    public class CreateTimeRegistrationDto
    {
        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public double Hours { get; set; }
        public string? Comment { get; set; }
        public string? Status { get; set; }
    }
}