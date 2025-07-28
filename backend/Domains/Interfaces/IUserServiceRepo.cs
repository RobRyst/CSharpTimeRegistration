using backend.Dtos;
using Microsoft.AspNetCore.Identity;

namespace backend.Domains.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<AppUserDto>> GetAllUsers();
        Task<AppUserDto?> GetUserById(string id);
        Task<IdentityResult> CreateUserAsync(CreateUserDto dto);
    }
}