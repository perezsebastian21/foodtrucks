//using rsArm.Dtos.Infraccion;
//using rsArm.Models;
using Microsoft.AspNetCore.Mvc;
using rsCPO.Models;
using rsFoodtrucks.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace rsFoodtrucks.Services.CategoriaService
{
    public  interface ICategoriaService
    {
        Task<IEnumerable<FT_Categorias>> GetAll();

        Task<FT_Categorias> GetByID(int? id);

        Task  Create(FT_Categorias foodtruck);

        Task Delete(int IdFT);

        Task Update(FT_Categorias foodtruck);

        Task<IEnumerable<Object>> FindBy(int? IdFT, string searchString, string vegano, string vegetariano, string sintacc, string emplazado,PageInfo? pageInfo ,bool? activo);

        Task<IEnumerable<Object>> FindBy(QueryParams qp);

        public int Count(int? IdFT, string searchString);

        public int Count(QueryParams qp);


    }
}
