using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using rsFoodtrucks.DataAccess.Interfaces;
using rsFoodtrucks.Models;
using rsFoodtrucks.Exceptions;
using rsCPO.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace rsFoodtrucks.Services.ReseniasService
{
    public class ReseniasService : IReseniasService
    {
        private readonly ApplicationDbContext _context;
        public IRepositoryAsync<FT_Resenias> _repository;
        private readonly IConfiguration _config;

        public ReseniasService(ApplicationDbContext context, IRepositoryAsync<FT_Resenias> repository, IConfiguration config)
        {
            _context = context;
            _repository = repository;
            _config = config;
        }

        public async Task<IEnumerable<FT_Resenias>> GetAll()
        {
            return await _repository.GetAll();
        }

        public async Task<FT_Resenias> GetByID(int? IdResenia)
        {
            return await _repository.GetByID(IdResenia);
        }

        public async Task Create(FT_Resenias resenia)
        {
            // Set the creation date so that it's properly recorded in the database
            resenia.CreatedAt = DateTime.Now;

            int meses = _config.GetValue<int>("VotacionConfig:MesesBloqueo", 6);
            var desde = DateTime.Now.AddMonths(-meses);

            var votoExistente = await _context.Set<FT_Resenias>()
                .AnyAsync(r => r.IdFT == resenia.IdFT
                            && r.Cuil == resenia.Cuil
                            && r.CreatedAt >= desde);

            if (votoExistente)
                throw new BadRequestException(
                    $"El usuario ya ha votado este foodtruck en los últimos {meses} meses.");

            await _repository.Insert(resenia);
        }

        public async Task CambiarVisibilidad(int idResenia)
        {
            var resenia = await _repository.GetByID(idResenia);
            if (resenia == null)
                throw new NotFoundException($"Reseña con Id {idResenia} no encontrada.");

            resenia.Visible = (resenia.Visible == "S") ? "N" : "S";
            await _repository.Update(resenia);
        }

        public async Task Delete(int IdResenia)
        {
            await _repository.Delete(IdResenia);
        }

        public async Task Update(FT_Resenias resenia)
        {
            await _repository.Update(resenia);
        }

        public async Task<IEnumerable<Object>> FindBy(QueryParams qp)
        {
            return await _repository.GetAllDTO2<Object>(
              x => (x.Comment.Contains(qp.searchString) || qp.searchString == null)
                , null
                , true, qp.page, qp.limit, null);
        }

        public int Count(QueryParams qp)
        {
            int cant = _repository.Count(
                x => (x.Comment.Contains(qp.searchString) || qp.searchString == null));
            return cant;
        }

        public async Task<rsFoodtrucks.DTOs.FoodtruckResumenReseniasDto> GetResumenByFoodtruck(int idFt)
        {
            var resenias = await _context.Set<FT_Resenias>()
                .Include(r => r.Puntajes)
                    .ThenInclude(p => p.Pregunta)
                .Where(r => r.IdFT == idFt)
                .ToListAsync();

            var foodtruck = await _context.Set<FT_Foodtrucks>().FindAsync(idFt);
            var nombreFt = foodtruck?.NombreFantasia ?? "Desconocido";

            var comentarios = resenias
                .Where(r => !string.IsNullOrEmpty(r.Comment) && r.Visible == "S")
                .Select(r => new rsFoodtrucks.DTOs.ComentarioDto
                {
                    IdResenia = r.IdResenia,
                    Usuario = r.NombreUsuario ?? "Anónimo",
                    Comentario = r.Comment,
                    Fecha = r.CreatedAt,
                    Visible = r.Visible
                }).ToList();

            var promedios = resenias
                .SelectMany(r => r.Puntajes)
                .GroupBy(p => new { p.IdPregunta, p.Pregunta?.Name })
                .Select(g => new rsFoodtrucks.DTOs.PreguntaPromedioDto
                {
                    IdPregunta = g.Key.IdPregunta,
                    NombrePregunta = g.Key.Name,
                    Promedio = Math.Round(g.Average(x => x.Score), 1)
                }).ToList();

            return new rsFoodtrucks.DTOs.FoodtruckResumenReseniasDto
            {
                IdFT = idFt,
                NombreFT = nombreFt,
                Comentarios = comentarios,
                PromediosPorPregunta = promedios
            };
        }

        public async Task<rsFoodtrucks.DTOs.FoodtruckResumenReseniasDto> GetResumenAdminByFoodtruck(int idFt)
        {
            var resenias = await _context.Set<FT_Resenias>()
                .Include(r => r.Puntajes)
                    .ThenInclude(p => p.Pregunta)
                .Where(r => r.IdFT == idFt)
                .ToListAsync();

            var foodtruck = await _context.Set<FT_Foodtrucks>().FindAsync(idFt);
            var nombreFt = foodtruck?.NombreFantasia ?? "Desconocido";

            var comentarios = resenias
                .Where(r => !string.IsNullOrEmpty(r.Comment))
                .Select(r => new rsFoodtrucks.DTOs.ComentarioDto
                {
                    IdResenia = r.IdResenia,
                    Usuario = r.NombreUsuario ?? r.Cuil ?? "Anónimo",
                    Comentario = r.Comment,
                    Fecha = r.CreatedAt,
                    Visible = r.Visible
                }).ToList();

            var promedios = resenias
                .SelectMany(r => r.Puntajes)
                .GroupBy(p => new { p.IdPregunta, p.Pregunta?.Name })
                .Select(g => new rsFoodtrucks.DTOs.PreguntaPromedioDto
                {
                    IdPregunta = g.Key.IdPregunta,
                    NombrePregunta = g.Key.Name,
                    Promedio = Math.Round(g.Average(x => x.Score), 1)
                }).ToList();

            return new rsFoodtrucks.DTOs.FoodtruckResumenReseniasDto
            {
                IdFT = idFt,
                NombreFT = nombreFt,
                Comentarios = comentarios,
                PromediosPorPregunta = promedios
            };
        }
    }
}
