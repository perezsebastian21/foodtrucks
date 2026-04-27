using Microsoft.AspNetCore.Http;
using System.IO;
using System.Threading.Tasks;

namespace rsFoodtrucks.Mapping.ImageMapping
{
    public static class FormFileConverter
    {
        /// <summary>
        /// Convierte un array de bytes en una instancia de IFormFile asíncronamente.
        /// </summary>
        /// <param name="bytes">El array de bytes que representa el contenido del archivo.</param>
        /// <param name="fileName">El nombre deseado para el archivo (ej. "imagen.jpg").</param>
        /// <param name="contentType">El tipo de contenido (MIME type) del archivo (ej. "image/jpeg").</param>
        /// <returns>Una tarea que devuelve una instancia de IFormFile.</returns>
        public static async Task<IFormFile> ConvertBytesToIFormFileAsync(byte[] bytes, string fileName, string contentType)
        {
            if (bytes == null || bytes.Length == 0)
            {
                return null;
            }

            using (var stream = new MemoryStream(bytes))
            {
                // fileName se usa tanto para el 'name' del campo como para el nombre del archivo.
                var formFile = new FormFile(stream, 0, bytes.Length, fileName, fileName)
                {
                    Headers = new HeaderDictionary(),
                    ContentType = contentType
                };

                return await Task.FromResult(formFile);
            }
        }

        /// <summary>
        /// Convierte un IFormFile a un array de bytes asíncronamente.
        /// </summary>
        /// <param name="file">El IFormFile a convertir.</param>
        /// <returns>Una tarea que devuelve un array de bytes.</returns>
        public static async Task<byte[]> ConvertIFormFileToBytesAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return null;
            }

            using (var memoryStream = new MemoryStream())
            {
                await file.CopyToAsync(memoryStream);
                return memoryStream.ToArray();
            }
        }

        /// <summary>
        /// Infiera el tipo de contenido (MIME type) basado en el nombre del archivo o extensión.
        /// Esta es una implementación básica. Para mayor robustez, considera librerías externas.
        /// </summary>
        /// <param name="fileName">El nombre del archivo, idealmente con extensión.</param>
        /// <returns>El MIME type inferido.</returns>
        public static string InferContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName)?.ToLowerInvariant();

            // Opción A: Usando if/else if
            if (extension == ".jpg" || extension == ".jpeg")
            {
                return "image/jpeg";
            }
            else if (extension == ".png")
            {
                return "image/png";
            }
            else if (extension == ".gif")
            {
                return "image/gif";
            }
            else if (extension == ".bmp")
            {
                return "image/bmp";
            }
            else if (extension == ".pdf")
            {
                return "application/pdf";
            }
            else
            {
                return "application/octet-stream";
            }

            /*
            // Opción B: Usando un switch tradicional (menos conciso pero válido en C# 8.0)
            switch (extension)
            {
                case ".jpg":
                case ".jpeg":
                    return "image/jpeg";
                case ".png":
                    return "image/png";
                case ".gif":
                    return "image/gif";
                case ".bmp":
                    return "image/bmp";
                case ".pdf":
                    return "application/pdf";
                default:
                    return "application/octet-stream";
            }
            */
        }

    }
}
