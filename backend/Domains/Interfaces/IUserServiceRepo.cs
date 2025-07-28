using backend.Dtos;

namespace backend.Domains.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<AppUserDto>> GetAllUsers();
    }
}