namespace backend.Dtos
{
    public class TimeRegistrationDto
    {
        public int Id { get; set; }
        public string? UserId { get; set; }
        public DateTime Date { get; set; }
        public double Hours { get; set; }
        public string? Comment { get; set; }
        public string? Status { get; set; }
    }
}