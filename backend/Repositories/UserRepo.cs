using backend.Domains.Entities;
using backend.Domains.Interfaces;
using backend.Domains.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class UserRepo : IUserRepo
    {
        private readonly UserManager<AppUser> _userManager;

        public UserRepo(UserManager<AppUser> userManager)
        {
            _userManager = userManager;
        }
        public async Task<IEnumerable<AppUser>> GetAllUsers()
        {
            return await _userManager.Users.ToListAsync();
        }
    }
}