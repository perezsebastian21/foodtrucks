using rsFoodtrucks.Models;
using rsCPO.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace rsFoodtrucks.Services.PuntajesService
{
    public interface IPuntajesService
    {
        Task<IEnumerable<FT_Puntajes>> GetAll();
        Task<FT_Puntajes> GetByID(int idResenia, int idPregunta);
        Task Create(FT_Puntajes puntaje);
        Task Update(FT_Puntajes puntaje);
        Task Delete(int idResenia, int idPregunta);
        Task<IEnumerable<Object>> FindBy(QueryParams qp);
        int Count(QueryParams qp);
    }
}
