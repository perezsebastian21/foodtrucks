using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using rsFoodtrucks.DataAccess.Interfaces;
using rsFoodtrucks.Models;
using rsCPO.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace rsFoodtrucks.Services.PuntajesService
{
    public class PuntajesService : IPuntajesService
    {
        private readonly ApplicationDbContext _context;
        public IRepositoryAsync<FT_Puntajes> _repository;

        public PuntajesService(ApplicationDbContext context, IRepositoryAsync<FT_Puntajes> repository)
        {
            _context = context;
            _repository = repository;
        }

        public async Task<IEnumerable<FT_Puntajes>> GetAll()
        {
            return await _repository.GetAll();
        }

        public async Task<FT_Puntajes> GetByID(int idResenia, int idPregunta)
        {
            return await _repository.Find(x => x.IdResenia == idResenia && x.IdPregunta == idPregunta);
        }

        public async Task Create(FT_Puntajes puntaje)
        {
            await _repository.Insert(puntaje);
        }

        public async Task Delete(int idResenia, int idPregunta)
        {
            var entity = await _repository.Find(x => x.IdResenia == idResenia && x.IdPregunta == idPregunta);
            if (entity != null)
            {
                _context.FT_Puntajes.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        public async Task Update(FT_Puntajes puntaje)
        {
            await _repository.Update(puntaje);
        }

        public async Task<IEnumerable<Object>> FindBy(QueryParams qp)
        {
            return await _repository.GetAllDTO2<Object>(
              x => qp.searchString == null, 
              null, 
              true, qp.page, qp.limit, null);
        }

        public int Count(QueryParams qp)
        {
            int cant = _repository.Count(x => qp.searchString == null);
            return cant;
        }
    }
}
