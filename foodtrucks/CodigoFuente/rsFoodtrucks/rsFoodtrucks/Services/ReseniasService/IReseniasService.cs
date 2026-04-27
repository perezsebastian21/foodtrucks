using rsFoodtrucks.Models;
using rsCPO.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace rsFoodtrucks.Services.ReseniasService
{
    public interface IReseniasService
    {
        Task<IEnumerable<FT_Resenias>> GetAll();
        Task<FT_Resenias> GetByID(int? IdResenia);
        Task Create(FT_Resenias resenia);
        Task Update(FT_Resenias resenia);
        Task Delete(int IdResenia);
        Task<IEnumerable<Object>> FindBy(QueryParams qp);
        int Count(QueryParams qp);
        Task<rsFoodtrucks.DTOs.FoodtruckResumenReseniasDto> GetResumenByFoodtruck(int idFt);
        Task<rsFoodtrucks.DTOs.FoodtruckResumenReseniasDto> GetResumenAdminByFoodtruck(int idFt);
        Task CambiarVisibilidad(int idResenia);
    }
}
