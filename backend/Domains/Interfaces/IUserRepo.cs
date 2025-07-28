using backend.Domains.Entities;
using backend.Domains.Models;

namespace backend.Domains.Interfaces
{
    public interface IUserRepo
    {
        Task<IEnumerable<AppUser>> GetAllUsers();
        //Task<IEnumerable<User>> GetUsersFromDatabase(string userId);
        //Task AddUser{User users}
    }
}