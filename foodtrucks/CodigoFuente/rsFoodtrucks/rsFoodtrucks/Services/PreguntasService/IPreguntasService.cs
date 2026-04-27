using rsFoodtrucks.Models;
using rsCPO.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace rsFoodtrucks.Services.PreguntasService
{
    public interface IPreguntasService
    {
        Task<IEnumerable<FT_Preguntas>> GetAll();
        Task<FT_Preguntas> GetByID(int? IdPregunta);
        Task Create(FT_Preguntas pregunta);
        Task Update(FT_Preguntas pregunta);
        Task Delete(int IdPregunta);
        Task<IEnumerable<Object>> FindBy(QueryParams qp);
        int Count(QueryParams qp);
    }
}
