using Microsoft.EntityFrameworkCore;
//using rsFoodtrucks.Data.Context;
using rsFoodtrucks.DataAccess.Interfaces;
using rsFoodtrucks.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;


namespace rsFoodtrucks.DataAccess.Servicios
{
    using Microsoft.AspNetCore.Http;
    using Microsoft.EntityFrameworkCore;
    using rsCPO.Models;
    using System.IO;
    using System.Reflection;

    public class RepositoryAsync<T> : IRepositoryAsync<T> where T : class
    {
        private readonly ApplicationDbContext context;
        public RepositoryAsync(ApplicationDbContext context)
        {
            this.context = context;
        }

        protected DbSet<T> EntitySet
        {
            get
            {
                return context.Set<T>();
            }
        }

        public async Task<IEnumerable<T>> GetAll()
        {
            return await EntitySet.ToListAsync(); 
        }

        public async Task<T> GetByID(int? id)
        {
            return await EntitySet.FindAsync(id);
        }

        public async Task<T> Insert(T entity)
        {
            EntitySet.Add(entity);
            await Save();
            return entity;
        }

        public async Task<T> Delete(int id)
        {
            T entity = await EntitySet.FindAsync(id);
            if (entity != null) { 
                EntitySet.Remove(entity);
                await Save();
            }
            return entity;
        }

        public async Task Update(T entity)
        {
            context.Entry(entity).State = EntityState.Modified;
            await Save();
        }

        public async Task Save()
        {
            await context.SaveChangesAsync();
        }

        private bool disposed = false;

        protected virtual void Dispose(bool disposing)
        {
            if (!this.disposed && disposing)
            {
                context.Dispose();
            }
            this.disposed = true;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        public async Task<T> Find(Expression<Func<T, bool>> expr)
        {
            return await EntitySet.AsNoTracking().FirstOrDefaultAsync(expr);
        }

        public async Task<IEnumerable<TResult>> GetAllDTO2<TResult>(Expression<Func<T, bool>>? criterio, Expression<Func<T, TResult>>? selector, bool? orderbydescending, int? page, int? limit, params Expression<Func<T, Object>>[]? order) where TResult : class
        {
            IQueryable<T> query = EntitySet.AsQueryable();
            if (criterio != null)
            {
                query = (IQueryable<T>)query.Where(criterio);
            }
            if (order != null)
            {
                if (orderbydescending == true)
                {
                    var ordenado = query.OrderByDescending(order[0]);
                    for (int i = 1; i < order.Length; i++)
                    {
                        ordenado = ((IOrderedQueryable<T>)ordenado).ThenByDescending(order[i]);
                    }
                    query = ordenado;
                }
                else
                {
                    var ordenado = query.OrderBy(order[0]);
                    for (int i = 1; i < order.Length; i++)
                    {
                        ordenado = ((IOrderedQueryable<T>)ordenado).ThenBy(order[i]);
                    }
                    query = ordenado;
                }
            }
            IQueryable<TResult> queryFinal = selector != null ? query.Select(selector) : (IQueryable<TResult>)query;
           
            if (page != null)
            {
                queryFinal = queryFinal.Skip((page.Value) * limit.Value).Take(limit.Value);
            }
            return (IEnumerable<TResult>)await queryFinal.ToListAsync();
        }

        public async Task<IEnumerable<TResult>> GetAllDTO<TResult>(Expression<Func<T, bool>>? criterio, Expression<Func<T, TResult>>? selector, bool? orderbydescending, PageInfo? pageInfo, params Expression<Func<T, Object>>[]? order) where TResult : class
        {
            IQueryable<T> query = EntitySet.AsQueryable();
            if (criterio != null)
            {
                query = (IQueryable<T>)query.Where(criterio);
            }
            if (order != null)
            {
                if (orderbydescending == true) { 
                    var ordenado = query.OrderByDescending(order[0]);
                    for (int i = 1; i < order.Length; i++)
                    {
                        ordenado = ((IOrderedQueryable<T>)ordenado).ThenByDescending(order[i]);
                    }
                    query = ordenado;
                }
                else
                {
                    var ordenado = query.OrderBy(order[0]);
                    for (int i = 1; i < order.Length; i++)
                    {
                        ordenado = ((IOrderedQueryable<T>)ordenado).ThenBy(order[i]);
                    }
                    query = ordenado;
                }
            }
            IQueryable<TResult> queryFinal = selector != null ? query.Select(selector) : (IQueryable<TResult>)query;
            if(pageInfo != null)
            {
                queryFinal = queryFinal.Skip((pageInfo.Page - 1) * pageInfo.Limit).Take(pageInfo.Limit);
            }
            return (IEnumerable<TResult>)await queryFinal.ToListAsync();
        }

        public int Count(Expression<Func<T, bool>>? criterio)
        {
            int cant = 0;
            if (criterio != null)
            {
                cant =  EntitySet.Where(criterio).Count();
            }
            else
            {
                cant= EntitySet.Count();
            }
            return cant;
        }


        public async Task Add(T entity)
        {
            await context.Set<T>().AddAsync(entity);
            await context.SaveChangesAsync();
        }

        /// <summary>
        /// esta rutina permite guardar imagenes en base de datos a partir de IformFile convirtiendolas en byte[]
        /// Para ello se necesita una propiedad [NotMapped] como esclavo que finalice con _ como un flag. Ejemplo escalvo logo_ se persiste en logo
        /// </summary>
        /// <param name="entity"></param>
        /// <returns></returns>
        public async Task AddWithImage(T entity)
        {
            var propiedadesArchivo = typeof(T).GetProperties()
                .Where(p => p.PropertyType == typeof(IFormFile) && p.Name.EndsWith("_"))
                .ToList();

            // Pre-generamos un diccionario para evitar búsquedas repetidas
            var propiedadesByteArray = typeof(T).GetProperties()
                .Where(p => p.PropertyType == typeof(byte[]))
                .ToDictionary(p => p.Name, p => p);

            foreach (var propiedadArchivo in propiedadesArchivo)
            {
                if (propiedadArchivo.GetValue(entity) is IFormFile archivo && archivo.Length > 0)
                {
                    string nombrePropiedadDatos = propiedadArchivo.Name.Replace("_", "");

                    // Buscar directamente en el diccionario
                    if (propiedadesByteArray.TryGetValue(nombrePropiedadDatos, out var propiedadDatosArchivo))
                    {
                        using var memoryStream = new MemoryStream();
                        await archivo.CopyToAsync(memoryStream);
                        propiedadDatosArchivo.SetValue(entity, memoryStream.ToArray());
                    }
                }
            }

            await context.Set<T>().AddAsync(entity);
            await context.SaveChangesAsync();
        }

        /// <summary>
        /// Esta rutina permite guardar imagenes el file system almacenando solo la ruta en base de datos
        /// /// Para ello se necesita una propiedad [NotMapped] como esclavo que finalice con _ como un flag. Ejemplo escalvo logo_ se persiste en logo
        /// esta rutina debe ser testeada ya que no se han definido espacios fisicos para guardar las imagenes 
        /// </summary>
        /// <param name="entity"></param>
        /// <returns></returns>
        public async Task AddWithImageFS(T entity)
        {
            string rutaBase = "wwwroot/uploads/";

            var propiedadesArchivo = typeof(T).GetProperties()
                .Where(p => p.PropertyType == typeof(IFormFile) && p.Name.EndsWith("_"))
                .ToList();

            var propiedadesString = typeof(T).GetProperties()
                .Where(p => p.PropertyType == typeof(string))
                .ToDictionary(p => p.Name, p => p);

            foreach (var propiedadArchivo in propiedadesArchivo)
            {
                if (propiedadArchivo.GetValue(entity) is IFormFile archivo && archivo.Length > 0)
                {
                    string nombrePropiedadRuta = propiedadArchivo.Name.Replace("_", "");

                    if (propiedadesString.TryGetValue(nombrePropiedadRuta, out var propiedadRuta))
                    {
                        // Crear nombre de archivo único
                        string fileName = $"{Guid.NewGuid()}_{archivo.FileName}";
                        string filePath = Path.Combine(rutaBase, fileName);

                        // Guardar archivo en el servidor
                        using var fileStream = new FileStream(filePath, FileMode.Create);
                        await archivo.CopyToAsync(fileStream);

                        // Guardar la ruta en la entidad
                        propiedadRuta.SetValue(entity, filePath);
                    }
                }
            }

            await context.Set<T>().AddAsync(entity);
            await context.SaveChangesAsync();
        }

    }
}