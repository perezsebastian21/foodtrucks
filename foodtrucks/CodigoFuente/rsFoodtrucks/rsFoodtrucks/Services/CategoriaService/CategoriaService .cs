//using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using rsCPO.Models;
using rsFoodtrucks;
using rsFoodtrucks.DataAccess.Interfaces;
using rsFoodtrucks.Models;
using System;
using System.Collections.Generic;
using System.Linq;
//using System.Runtime.InteropServices;
//using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;

namespace rsFoodtrucks.Services.CategoriaService
{
    public class CategoriaService : ICategoriaService
    {
        private readonly ApplicationDbContext _context;
        public IRepositoryAsync<FT_Categorias> _repository;
        //private readonly IMapper _mapper;

        public CategoriaService(ApplicationDbContext context, IRepositoryAsync<FT_Categorias> repository)
        {
            _context = context;
            _repository = repository;
            //_mapper = mapper;
        }

        public async Task<IEnumerable<FT_Categorias>> GetAll()
        {
            //el GetAllDTO pasara como parametro dentro del diamante el <Object> que declaramos arriba. Si por ejemplo pasamos <JurisdiccionDTO> deberemos devolver  new JurisdiccionDTO { Denominacion = x.Denominacion, Jurisdiccion = x.Jurisdiccion } porque no puede castear
            List<Object> lista = new List<Object>();
            //lista = (List<object>)_context.Jurisdicciones.Where(x => x.Seleccionable == "S").Select(x=> new { Denominacion = x.Denominacion,Jurisdiccion=x.Jurisdiccion }).AsQueryable();
            //return await _repository.GetAllDTO<Object>(x => x.Seleccionable == "S", x => new { Denominacion = x.Denominacion, Jurisdiccion = x.Jurisdiccion }, x => x.Denominacion,false); //si no hacemos la llamada explicita _repository.GetAllDTO<Object> asigna un tipo generico se puede obviar
            //return await _repository.GetAllDTO<Object>(x => x.Activo == true, null, null); //si no hacemos la llamada explicita _repository.GetAllDTO<Object> asigna un tipo generico se puede obviar
            return await _repository.GetAll();
        }

        public async Task<FT_Categorias> GetByID(int? IdCategoria)
        {
            return await _repository.GetByID(IdCategoria);
        }


        public async Task Create(FT_Categorias foodtruck)
        {
            await _repository.Insert(foodtruck);
        }

        public async Task Delete(int IdFT)
        {
            await _repository.Delete(IdFT);
        }

        public async Task Update(FT_Categorias foodtruck)
        {
            await _repository.Update(foodtruck);
        }


        public async Task<IEnumerable<Object>> FindBy(int? IdFT, string searchString, string vegano, string vegetariano, string sintacc, string emplazado, PageInfo pageInfo, bool? activo)
        {
            return await _repository.GetAllDTO<Object>(x => x.Nombre.Contains(searchString), null, true, pageInfo, null);
        }

        public int Count(int? IdFT, string searchString)
        {
            int cant = _repository.Count(x => x.Nombre.Contains(searchString));
            return cant;
        }

        /*
        public async Task<IEnumerable<Object>> FindBy(QueryParams qp)
        {
            PageInfo pi = new PageInfo();
            pi.Page = qp.page.Value;
            pi.Limit = qp.limit.Value;
            return await _repository.GetAllDTO<Object>(
              x => (x.NombreFantasia.Contains(qp.searchString) || x.Email.Contains(qp.searchString)||x.Menu.Contains(qp.searchString)) 
                && (qp.vegano == null ? true : x.Vegano == qp.vegano)
                && (qp.vegetariano == null ? true : x.Vegetariano == qp.vegetariano)
            , x => new { IdFT = x.IdFT, x.NombreFantasia, x.Titular, x.Vegano }, true, pi,x => x.NombreFantasia, x => x.IdFT, x => x.Titular);
        }
        
        public int Count(QueryParams qp)
        {
            int cant = _repository.Count(
                x => (x.NombreFantasia.Contains(qp.searchString) || x.Email.Contains(qp.searchString) || x.Menu.Contains(qp.searchString))
                && (qp.vegano == null ? true : x.Vegano == qp.vegano)
                && (qp.vegetariano == null ? true : x.Vegetariano == qp.vegetariano));
            return cant;
        }*/

        public async Task<IEnumerable<Object>> FindBy(QueryParams qp)
        {
            return await _repository.GetAllDTO2<Object>(
              x => (x.Nombre.Contains(qp.searchString) || qp.searchString == null)
                ,null
                , true, qp.page, qp.limit, null);
        }

        public int Count(QueryParams qp)
        {
            int cant = _repository.Count(
                x => (x.Nombre.Contains(qp.searchString) || qp.searchString == null));
            return cant;
        }
    }
}
