namespace backend.Dtos
{
    public class UserRegisterDto
    {
        public int Id { get; set; }
        public string? UserId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public double Hours { get; set; }
        public string? Comment { get; set; }
        public string? Status { get; set; }
        public string? ProjectName { get; set; }
    }
}