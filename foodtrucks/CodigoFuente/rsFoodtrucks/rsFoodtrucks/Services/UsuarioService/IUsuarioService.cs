using rsFoodtrucks.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace rsFoodtrucks.Services.UsuarioService
{
    public interface IUsuarioService
    {
        Task<IEnumerable<Object>> GetAll();

        Task<FT_Usuarios> GetByID(int? id);

        Task Create(FT_Usuarios usuario);

        Task Delete(int IdUsuario);

        Task Update(FT_Usuarios usuario);

        Task<IEnumerable<Object>> FindBy(int? IdUsuario, string searchString, bool? activo);

        Task<IEnumerable<Object>> FindBy(string nombreUsuario);
    }
}
