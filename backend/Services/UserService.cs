using backend.Domains.Entities;
using backend.Domains.Interfaces;
using backend.Domains.Models;
using backend.Dtos;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class UserService : IUserService
    {
        private readonly UserService _userService;
        private readonly IUserRepo _repository;
        private readonly ApplicationDbContext _db;
        private readonly UserManager<AppUser> _userManager;


        public UserService(IUserRepo repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<UserDto>> GetAllUsers()
        {
            var users = await _userManager.Users.ToListAsync();

            var userDtos = new List<UserDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);

                userDtos.Add(new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Role = roles.FirstOrDefault() ?? "None"
                });
            }
            return userDtos;
        }
    }
}
