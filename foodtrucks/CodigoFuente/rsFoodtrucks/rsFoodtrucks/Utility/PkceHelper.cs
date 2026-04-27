using System;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.WebUtilities;

namespace rsFoodtrucks.Utility
{
    public static class PkceHelper
    {
        public static string GenerateVerifier()
        {
            var bytes = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(bytes);
            return WebEncoders.Base64UrlEncode(bytes);
        }

        public static string GenerateChallenge(string verifier)
        {
            using var sha256 = SHA256.Create();
            var challengeBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(verifier));
            return WebEncoders.Base64UrlEncode(challengeBytes);
        }
    }
}
