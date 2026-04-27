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
using rsFoodtrucks.DTOs;

namespace rsFoodtrucks.Services.FoodtruckService
{
    public  interface IFoodtruckService
    {
        Task<IEnumerable<FT_Foodtrucks>> GetAll();

        Task<FT_Foodtrucks> GetByID(int? id);

        Task  Create(FT_Foodtrucks foodtruck);

        Task Delete(int IdFT);

        Task Update(FT_Foodtrucks foodtruck);

        Task<IEnumerable<Object>> FindBy(int? IdFT, string searchString, string vegano, string vegetariano, string sintacc, string emplazado,PageInfo? pageInfo ,bool? activo);

        Task<IEnumerable<Object>> FindBy(QueryParams qp);

        Task<IEnumerable<FoodtruckRatingDto>> FindByWithRating(QueryParams qp);

        public int Count(int? IdFT, string searchString);

        public int Count(QueryParams qp);


    }
}
