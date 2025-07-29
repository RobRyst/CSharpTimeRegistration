using System.Security.Claims;
using backend.Domains.Entities;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;


namespace backend.Services
{
    public class TokenService
    {
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public string CreateToken(AppUser user, IList<string> roles)
        {
            Console.WriteLine($"Creating token for user: {user.Email}");

            var claims = new List<Claim>
    {
        new(ClaimTypes.NameIdentifier, user.Id),
        new(ClaimTypes.Name, user.UserName ?? user.Email),
        new(ClaimTypes.Email, user.Email)
    };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
                Console.WriteLine($"Added role claim: {role}");
            }

            Console.WriteLine($"Total claims: {claims.Count}");

            var jwtKey = _config["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey))
            {
                Console.WriteLine("JWT Key is missing from configuration");
                throw new InvalidOperationException("JWT Key is not configured");
            }

            Console.WriteLine($"JWT Key length: {jwtKey.Length}");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var expires = DateTime.UtcNow.AddHours(4);
            Console.WriteLine($"Token expires at: {expires}");

            var token = new JwtSecurityToken(
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
            Console.WriteLine($"Token generated with length: {tokenString.Length}");

            return tokenString;
        }
    }
}

