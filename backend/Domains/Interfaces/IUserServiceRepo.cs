using backend.Dtos;

namespace backend.Domains.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllUsers();
    }
}