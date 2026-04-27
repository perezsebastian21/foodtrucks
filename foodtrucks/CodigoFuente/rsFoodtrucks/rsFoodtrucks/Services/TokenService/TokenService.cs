using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace rsFoodtrucks.Services.TokenService
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateAdminToken(string username)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, username)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Admin:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            int expirationHours = int.Parse(_config["Jwt:Admin:ExpirationHours"] ?? "1");

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Admin:Issuer"],
                audience: _config["Jwt:Admin:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(expirationHours),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateVotacionToken(int idFT, string cuit, string nombreUsuario)
        {
            var claims = new List<Claim>
            {
                new Claim("IdFoodtruck", idFT.ToString()),
                new Claim("cuit", cuit ?? ""),
                new Claim("nombreUsuario", nombreUsuario ?? "")
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Votacion:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            int expirationMinutes = int.Parse(_config["Jwt:Votacion:ExpirationMinutes"] ?? "30");

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Votacion:Issuer"],
                audience: _config["Jwt:Votacion:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
