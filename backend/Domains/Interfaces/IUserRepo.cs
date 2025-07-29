using backend.Domains.Entities;
using backend.Domains.Models;

namespace backend.Domains.Interfaces
{
    public interface IUserRepo
    {
        Task<IEnumerable<AppUser>> GetAllUsers();
    }
}