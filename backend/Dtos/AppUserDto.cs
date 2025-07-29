namespace backend.Dtos
{
    public class AppUserDto
    {
        public string Id { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string Role { get; set; } = string.Empty;
    }
}
