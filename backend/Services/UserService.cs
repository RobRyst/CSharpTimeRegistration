using System.Diagnostics.Tracing;
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


        public UserService(UserManager<AppUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<IEnumerable<AppUserDto>> GetAllUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var appUserDtos = new List<AppUserDto>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                appUserDtos.Add(new AppUserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Role = roles.FirstOrDefault() ?? "None"
                });
            }
            return appUserDtos;
        }
        public async Task<AppUserDto?> GetUserById(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return null;

            var roles = await _userManager.GetRolesAsync(user);

            return new AppUserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = roles.FirstOrDefault() ?? "None"
            };
        }

        public async Task<IdentityResult> CreateUserAsync(CreateUserDto dto)
        {
            var user = new AppUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName
            };

            var createUser = await _userManager.CreateAsync(user, dto.Password);
            if (createUser.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, "User");
            }
            return createUser;
        }
    }
}
