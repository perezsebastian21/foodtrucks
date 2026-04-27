using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace rsFoodtrucks.Mapping.ImageMapping
{
    public interface IGenericImageMapperService
    {
        /// <summary>
        /// Mapea propiedades de imagen de tipo byte[] en una entidad de origen a propiedades de tipo IFormFile en un DTO de destino.
        /// </summary>
        /// <typeparam name="TSource">El tipo de la entidad de origen (con propiedades byte[]).</typeparam>
        /// <typeparam name="TDestination">El tipo del DTO de destino (con propiedades IFormFile).</typeparam>
        /// <param name="source">La instancia de la entidad de origen.</param>
        /// <param name="destination">La instancia del DTO de destino donde se mapearán las imágenes. Si es null, se creará una nueva instancia.</param>
        /// <returns>Una tarea que devuelve la instancia del DTO de destino con las imágenes mapeadas.</returns>
        Task<TDestination> MapImagesToDtoAsync<TSource, TDestination>(TSource source, TDestination destination = null)
            where TSource : class
            where TDestination : class, new();

        /// <summary>
        /// Mapea propiedades de imagen de tipo IFormFile en un DTO de origen a propiedades de tipo byte[] en una entidad de destino.
        /// </summary>
        /// <typeparam name="TSource">El tipo del DTO de origen (con propiedades IFormFile).</typeparam>
        /// <typeparam name="TDestination">El tipo de la entidad de destino (con propiedades byte[]).</typeparam>
        /// <param name="source">La instancia del DTO de origen.</param>
        /// <param name="destination">La instancia de la entidad de destino donde se mapearán las imágenes. Si es null, se creará una nueva instancia.</param>
        /// <param name="clearExistingIfNull">Si es true, las propiedades byte[] en el destino se establecerán a null si el IFormFile correspondiente en el origen es null.</param>
        /// <returns>Una tarea que devuelve la instancia de la entidad de destino con las imágenes mapeadas.</returns>
        Task<TDestination> MapImagesToEntityAsync<TSource, TDestination>(TSource source, TDestination destination = null, bool clearExistingIfNull = false)
            where TSource : class
            where TDestination : class, new();
    }
}
