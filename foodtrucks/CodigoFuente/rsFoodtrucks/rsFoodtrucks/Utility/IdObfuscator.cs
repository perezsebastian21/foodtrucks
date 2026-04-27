using System;
using System.Text;

namespace rsFoodtrucks.Utility
{
    public static class IdObfuscator
    {
        public static string Encode(int id, string key)
        {
            byte[] idBytes = BitConverter.GetBytes(id);
            byte[] keyBytes = Encoding.UTF8.GetBytes(key);
            byte[] result = new byte[idBytes.Length];
            for (int i = 0; i < idBytes.Length; i++)
                result[i] = (byte)(idBytes[i] ^ keyBytes[i % keyBytes.Length]);
            return Convert.ToBase64String(result)
                .Replace('+', '-').Replace('/', '_').TrimEnd('='); // Base64Url
        }

        public static int Decode(string encoded, string key)
        {
            // Restaurar Base64 estándar
            encoded = encoded.Replace('-', '+').Replace('_', '/');
            switch (encoded.Length % 4) { case 2: encoded += "=="; break; case 3: encoded += "="; break; }
            byte[] data = Convert.FromBase64String(encoded);
            byte[] keyBytes = Encoding.UTF8.GetBytes(key);
            byte[] result = new byte[data.Length];
            for (int i = 0; i < data.Length; i++)
                result[i] = (byte)(data[i] ^ keyBytes[i % keyBytes.Length]);
            return BitConverter.ToInt32(result, 0);
        }
    }
}
