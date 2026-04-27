using System.Collections.Generic;
using System.Security.Claims;

namespace rsFoodtrucks.Services.TokenService
{
    public interface ITokenService
    {
        /// <summary>
        /// Genera un JWT para administradores autenticados via LDAP.
        /// </summary>
        string GenerateAdminToken(string username);

        /// <summary>
        /// Genera un JWT para vecinos autenticados via OIDC (votación/reseñas).
        /// </summary>
        string GenerateVotacionToken(int idFT, string cuit, string nombreUsuario);
    }
}
