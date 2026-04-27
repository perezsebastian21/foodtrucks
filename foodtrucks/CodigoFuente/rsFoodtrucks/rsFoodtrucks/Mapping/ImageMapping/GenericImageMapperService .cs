using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace rsFoodtrucks.Mapping.ImageMapping
{
    public class GenericImageMapperService : IGenericImageMapperService
    {
        public async Task<TDestination> MapImagesToDtoAsync<TSource, TDestination>(TSource source, TDestination destination = null)
        where TSource : class
        where TDestination : class, new()
        {
            if (source == null)
            {
                return null;
            }

            destination ??= new TDestination();

            var sourceType = typeof(TSource);
            var destinationType = typeof(TDestination);

            // Obtener todas las propiedades públicas de la entidad de origen que son de tipo byte[]
            var sourceImageProperties = sourceType.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                                                .Where(p => p.PropertyType == typeof(byte[]))
                                                .ToList();

            var conversionTasks = new List<Task>();

            foreach (var sourceProp in sourceImageProperties)
            {
                var destinationProp = destinationType.GetProperty(sourceProp.Name, BindingFlags.Public | BindingFlags.Instance);

                // Verificar si la propiedad existe en el destino y es de tipo IFormFile
                if (destinationProp != null && destinationProp.PropertyType == typeof(IFormFile))
                {
                    var bytes = (byte[])sourceProp.GetValue(source);

                    if (bytes != null && bytes.Length > 0)
                    {
                        // Capturar la referencia a sourceProp.Name para usarla en el Task.Run
                        string fileName = sourceProp.Name; // Usar el nombre de la propiedad como nombre del archivo
                        string contentType = FormFileConverter.InferContentType(fileName + ".jpeg"); // Suponemos .jpeg si no tenemos más info

                        conversionTasks.Add(Task.Run(async () =>
                        {
                            var formFile = await FormFileConverter.ConvertBytesToIFormFileAsync(bytes, fileName, contentType);
                            destinationProp.SetValue(destination, formFile);
                        }));
                    }
                    else
                    {
                        // Si los bytes son nulos o vacíos, asegurar que la propiedad IFormFile en el DTO también sea nula
                        destinationProp.SetValue(destination, null);
                    }
                }
            }

            await Task.WhenAll(conversionTasks);

            return destination;
        }

        public async Task<TDestination> MapImagesToEntityAsync<TSource, TDestination>(TSource source, TDestination destination = null, bool clearExistingIfNull = false)
            where TSource : class
            where TDestination : class, new()
        {
            if (source == null)
            {
                return null;
            }

            destination ??= new TDestination();

            var sourceType = typeof(TSource);
            var destinationType = typeof(TDestination);

            // Obtener todas las propiedades públicas del DTO de origen que son de tipo IFormFile
            var sourceImageProperties = sourceType.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                                                .Where(p => p.PropertyType == typeof(IFormFile))
                                                .ToList();

            var conversionTasks = new List<Task>();

            foreach (var sourceProp in sourceImageProperties)
            {
                var destinationProp = destinationType.GetProperty(sourceProp.Name, BindingFlags.Public | BindingFlags.Instance);

                // Verificar si la propiedad existe en el destino y es de tipo byte[]
                if (destinationProp != null && destinationProp.PropertyType == typeof(byte[]))
                {
                    var formFile = (IFormFile)sourceProp.GetValue(source);

                    if (formFile != null && formFile.Length > 0)
                    {
                        conversionTasks.Add(Task.Run(async () =>
                        {
                            var bytes = await FormFileConverter.ConvertIFormFileToBytesAsync(formFile);
                            destinationProp.SetValue(destination, bytes);
                        }));
                    }
                    else
                    {
                        // Si IFormFile es null/vacío y se especifica borrar, o si la propiedad ya era nula
                        if (clearExistingIfNull || destinationProp.GetValue(destination) != null)
                        {
                            // Se establece a null solo si se desea borrar explícitamente o si ya no tiene valor
                            destinationProp.SetValue(destination, null);
                        }
                    }
                }
            }
            await Task.WhenAll(conversionTasks);
            return destination;
        }
    }
}
