//using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using rsCPO.Models;
using rsFoodtrucks;
using rsFoodtrucks.DataAccess.Interfaces;
using rsFoodtrucks.Models;
using rsFoodtrucks.Services.MailService;
using System;
using System.Collections.Generic;
using System.Linq;
//using System.Runtime.InteropServices;
//using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using rsFoodtrucks.DTOs;
using rsFoodtrucks.Services.QrCodeService;

namespace rsFoodtrucks.Services.FoodtruckService
{
    public class FoodtruckService : IFoodtruckService
    {
        private readonly ApplicationDbContext _context;
        public IRepositoryAsync<FT_Foodtrucks> _repository;
        private readonly IMailService _mailService;
        private readonly ILogger<FoodtruckService> _logger;
        private readonly IQrCodeService _qrCodeService;

        public FoodtruckService(ApplicationDbContext context, IRepositoryAsync<FT_Foodtrucks> repository, IMailService mailService, ILogger<FoodtruckService> logger, IQrCodeService qrCodeService)
        {
            _context = context;
            _repository = repository;
            _mailService = mailService;
            _logger = logger;
            _qrCodeService = qrCodeService;
        }

        public async Task<IEnumerable<FT_Foodtrucks>> GetAll()
        {
            List<Object> lista = new List<Object>();
            return await _repository.GetAll();
        }

        public async Task<FT_Foodtrucks> GetByID(int? IdFT)
        {
            return await _repository.GetByID(IdFT);
        }

        public async Task Create(FT_Foodtrucks foodtruck)
        {
            foodtruck.Estado = "R";
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Insertar foodtruck (EF Core asigna IdFT tras el SaveChanges interno del Add)
                await _repository.Add(foodtruck);

                // 2. Generar QR con el ID real ya asignado por la BD
                foodtruck.QrCode = _qrCodeService.GenerarQr(foodtruck.IdFT);

                // 3. Persistir el QR en el mismo registro
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError("Error al crear foodtruck con QR: {Error}", ex.Message);
                throw;
            }
        }

        /// <summary>
        /// Este es el metodo nuevo para el formulario de alta por parte del contribuyente
        /// </summary>
        /// <param name="foodtruck"></param>
        /// <param name="categoriasIds"></param>
        /// <returns></returns>
        public async Task Create(FT_Foodtrucks foodtruck, List<int> categoriasIds)
        {
            foodtruck.Estado = "R";
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Insertar foodtruck con imágenes (EF Core asigna IdFT)
                await _repository.AddWithImage(foodtruck);

                // 2. Generar QR con el ID real ya asignado por la BD
                foodtruck.QrCode = _qrCodeService.GenerarQr(foodtruck.IdFT);

                // 3. Persistir el QR
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError("Error al crear foodtruck (con categorías) con QR: {Error}", ex.Message);
                throw;
            }
        }

        public async Task Delete(int IdFT)
        {
            await _repository.Delete(IdFT);
        }

        public async Task Update(FT_Foodtrucks foodtruck)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                //evaluar si el estado no es suspendido o eliminado la observacion de baja se blanquea
                if (foodtruck.Estado != "S" && foodtruck.Estado != "E")
                {
                    foodtruck.Observaciones = null;
                }

                // 1️⃣ Obtener el original con categorías incluidas
                var original = await _context.FT_Foodtrucks
                    .Include(f => f.FoodtrucksCategorias)
                    .FirstOrDefaultAsync(f => f.IdFT == foodtruck.IdFT);

                if (original == null)
                    throw new Exception("Foodtruck no encontrado");

                // 2️⃣ Validar que todas las categorías existan
                var categoriasExistentes = await _context.FT_Categorias
                    .Where(c => foodtruck.FoodtrucksCategorias.Select(fc => fc.IdCategoria).Contains(c.IdCategoria))
                    .Select(c => c.IdCategoria)
                    .ToListAsync();

                var categoriasInvalidas = foodtruck.FoodtrucksCategorias
                    .Select(fc => fc.IdCategoria)
                    .Except(categoriasExistentes)
                    .ToList();

                if (categoriasInvalidas.Any())
                    throw new Exception($"Las siguientes categorías no existen: {string.Join(", ", categoriasInvalidas)}");

                // 3️⃣ Actualizar propiedades simples (sin tocar relaciones)
                _context.Entry(original).CurrentValues.SetValues(foodtruck);

                // 4️⃣ Actualizar categorías (comparar y aplicar diferencias)
                var nuevasCategoriasIds = foodtruck.FoodtrucksCategorias.Select(fc => fc.IdCategoria).ToHashSet();
                var actualesCategoriasIds = original.FoodtrucksCategorias.Select(fc => fc.IdCategoria).ToHashSet();

                // Eliminar relaciones que ya no están
                var paraEliminar = original.FoodtrucksCategorias
                    .Where(fc => !nuevasCategoriasIds.Contains(fc.IdCategoria))
                    .ToList();

                foreach (var fc in paraEliminar)
                {
                    _context.Remove(fc);
                }

                // Agregar nuevas relaciones
                var paraAgregar = nuevasCategoriasIds
                    .Where(id => !actualesCategoriasIds.Contains(id))
                    .Select(id => new FT_FoodtruckFT_Categoria
                    {
                        IdFT = foodtruck.IdFT,
                        IdCategoria = id
                    });

                foreach (var fc in paraAgregar)
                {
                    original.FoodtrucksCategorias.Add(fc);
                }

                // 5️⃣ (Opcional) Lógica para imágenes - POR EL MOMENTO SOLO SE PUEDE VISUALIZAR LAS IMAGENES. LO DEJAREMOS A DEMANDA O PARA CUANDO MEJOREMOS 
                // LA LOGICA DE LAS IMAGENES
                // TODO: Actualizar imagen si cambió. Ejemplo: 
                // if (foodtruck.ImagenUrl != original.ImagenUrl) { ... }
                
                await _context.SaveChangesAsync();
                if ((foodtruck.Estado == "S" || foodtruck.Estado == "E") && !string.IsNullOrEmpty(foodtruck.EmailContacto))
                {
                    try
                    {
                        string accion = foodtruck.Estado == "S" ? "Suspensión" : "Baja";
                        string verbo = foodtruck.Estado == "S" ? "suspendido" : "dado de baja";

                        await _mailService.SendAsync(new MailModel
                        {
                            Origen = "no-responder@mardelplata.gov.ar",
                            OrigenNombre = "FoodtrucksMGP",
                            Destinatario = foodtruck.EmailContacto,
                            Asunto = $"{accion} de Foodtruck - {foodtruck.NombreFantasia}",
                            Cuerpo = $"Estimado/a {foodtruck.Titular},\n\n"
                                   + $"Le informamos que su foodtruck \"{foodtruck.NombreFantasia}\" "
                                   + $"ha sido {verbo}.\n\n"
                                   + $"Observaciones: {foodtruck.Observaciones ?? "Sin observaciones"}\n\n"
                                   + "Saludos,\nFoodtrucks MGP"
                        });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Error al enviar correo de {Accion} para FT {Id}: {Error}",
                            foodtruck.Estado == "S" ? "suspensión" : "baja", foodtruck.IdFT, ex.Message);
                        // No relanzar — el fallo del correo no debe afectar la transacción
                    }
                }
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }


        public async Task<IEnumerable<Object>> FindBy(int? IdFT, string searchString, string vegano, string vegetariano, string sintacc, string emplazado, PageInfo pageInfo, bool? activo)
        {
            return await _repository.GetAllDTO<Object>(x => x.NombreFantasia.Contains(searchString) || x.EmailContacto.Contains(searchString), x => new { IdFT = x.IdFT, x.NombreFantasia, x.Titular }, true, pageInfo, x => x.NombreFantasia, x => x.IdFT, x => x.Titular);
        }

        public int Count(int? IdFT, string searchString)
        {
            int cant = _repository.Count(x => x.NombreFantasia.Contains(searchString) || x.EmailContacto.Contains(searchString));
            return cant;
        }
        public async Task<IEnumerable<Object>> FindBy(QueryParams qp)
        {
            return await _repository.GetAllDTO2<Object>(
              x => (qp.searchString == null || x.NombreFantasia.ToUpper().Contains(qp.searchString.ToUpper()) || x.Titular.ToUpper().Contains(qp.searchString.ToUpper()) || x.EmailContacto.ToUpper().Contains(qp.searchString.ToUpper()) || x.Menu.ToUpper().Contains(qp.searchString.ToUpper()))
                && (qp.emplazado == null ? true : x.Emplazado == qp.emplazado)
                && (qp.estado == null ? true : x.Estado == qp.estado)
                && (qp.CategoriasIds == null || qp.CategoriasIds.Count == 0 ? true : x.FoodtrucksCategorias.Any(fc => qp.CategoriasIds.Contains(fc.IdCategoria)))
                , x => new { IdFT = x.IdFT, x.NombreFantasia, x.FechaVencimiento, x.Titular, x.EmailContacto, x.Menu, x.Logo, } //selector aca podria no traer todo evaluarlo
                , false
                , qp.page
                , qp.limit, 
                x => x.IdFT, x => x.FechaVencimiento); 
        }

        public async Task<IEnumerable<FoodtruckRatingDto>> FindByWithRating(QueryParams qp)
        {
            return await _repository.GetAllDTO2<FoodtruckRatingDto>(
              x => (qp.searchString == null || x.NombreFantasia.ToUpper().Contains(qp.searchString.ToUpper()) || x.Titular.ToUpper().Contains(qp.searchString.ToUpper()) || x.EmailContacto.ToUpper().Contains(qp.searchString.ToUpper()) || x.Menu.ToUpper().Contains(qp.searchString.ToUpper()))
                && (qp.emplazado == null ? true : x.Emplazado == qp.emplazado)
                && (qp.estado == null ? true : x.Estado == qp.estado)
                && (qp.CategoriasIds == null || qp.CategoriasIds.Count == 0 ? true : x.FoodtrucksCategorias.Any(fc => qp.CategoriasIds.Contains(fc.IdCategoria)))
                , x => new FoodtruckRatingDto 
                { 
                    IdFT = x.IdFT, 
                    NombreFantasia = x.NombreFantasia, 
                    Titular = x.Titular, 
                    EmailContacto = x.EmailContacto, 
                    Emplazado = x.Emplazado, 
                    Menu = x.Menu, 
                    Logo = x.Logo,
                    FechaVencimiento = x.FechaVencimiento.Value,
                    CalificacionMedia = x.Resenias.SelectMany(r => r.Puntajes).Any() 
                        ? Math.Round(x.Resenias.SelectMany(r => r.Puntajes).Average(p => p.Score), 1) 
                        : 0,
                    CantidadResenias = x.Resenias.Count()
                }
                , false
                , qp.page
                , qp.limit,
                x => x.IdFT, x => x.FechaVencimiento);
        }

        public int Count(QueryParams qp)
        {
            int cant = _repository.Count(
               x => (qp.searchString == null || x.NombreFantasia.ToUpper().Contains(qp.searchString.ToUpper()) || x.Titular.ToUpper().Contains(qp.searchString.ToUpper()) || x.EmailContacto.ToUpper().Contains(qp.searchString.ToUpper()) || x.Menu.ToUpper().Contains(qp.searchString.ToUpper()))
                && (qp.emplazado == null ? true : x.Emplazado == qp.emplazado)
                && (qp.estado == null ? true : x.Estado == qp.estado)
                && (qp.CategoriasIds == null || qp.CategoriasIds.Count == 0 ? true : x.FoodtrucksCategorias.Any(fc => qp.CategoriasIds.Contains(fc.IdCategoria))));
            return cant;
        }
    }
}
