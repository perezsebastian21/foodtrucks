using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using rsFoodtrucks.DataAccess.Interfaces;
using rsFoodtrucks.Models;
using rsCPO.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace rsFoodtrucks.Services.PreguntasService
{
    public class PreguntasService : IPreguntasService
    {
        private readonly ApplicationDbContext _context;
        public IRepositoryAsync<FT_Preguntas> _repository;

        public PreguntasService(ApplicationDbContext context, IRepositoryAsync<FT_Preguntas> repository)
        {
            _context = context;
            _repository = repository;
        }

        public async Task<IEnumerable<FT_Preguntas>> GetAll()
        {
            return await _repository.GetAll();
        }

        public async Task<FT_Preguntas> GetByID(int? IdPregunta)
        {
            return await _repository.GetByID(IdPregunta);
        }

        public async Task Create(FT_Preguntas pregunta)
        {
            await _repository.Insert(pregunta);
        }

        public async Task Delete(int IdPregunta)
        {
            await _repository.Delete(IdPregunta);
        }

        public async Task Update(FT_Preguntas pregunta)
        {
            await _repository.Update(pregunta);
        }

        public async Task<IEnumerable<Object>> FindBy(QueryParams qp)
        {
            return await _repository.GetAllDTO2<Object>(
              x => (x.Name.Contains(qp.searchString) || qp.searchString == null)
                , null
                , true, qp.page, qp.limit, null);
        }

        public int Count(QueryParams qp)
        {
            int cant = _repository.Count(
                x => (x.Name.Contains(qp.searchString) || qp.searchString == null));
            return cant;
        }
    }
}
