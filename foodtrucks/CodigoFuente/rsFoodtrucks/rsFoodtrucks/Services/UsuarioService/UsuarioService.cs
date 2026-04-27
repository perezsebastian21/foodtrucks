using rsFoodtrucks.DataAccess.Interfaces;
using rsFoodtrucks.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace rsFoodtrucks.Services.UsuarioService
{
    public class UsuarioService : IUsuarioService
    {
        private readonly ApplicationDbContext _context;
        public IRepositoryAsync<FT_Usuarios> _repository;
        

        public UsuarioService(ApplicationDbContext context, IRepositoryAsync<FT_Usuarios> repository)
        {
            _context = context;
            _repository = repository;
        
        }
        public async Task Create(FT_Usuarios usuario)
        {
            await _repository.Insert(usuario);
        }

        public async Task Delete(int Id)
        {
            await _repository.Delete(Id);
        }

        public async Task<IEnumerable<object>> FindBy(int? IdUsuario, string searchString, bool? activo)
        {
            return await _repository.GetAllDTO<Object>(x => x.Usuario.Contains(searchString) || x.Email.Contains(searchString), x => new { x.IdUsuario, x.Usuario}, null, null);
        }

        public async Task<IEnumerable<object>> FindBy(string nombreUsuario)
        {
            return await _repository.GetAllDTO2<Object>(
              x => (x.Usuario.ToUpper().Equals(nombreUsuario.ToUpper())),
              null,
              null,
              null,
              null,
              null);
        }


        public async Task<IEnumerable<object>> GetAll()
        {
            return await _repository.GetAll();
        }

        public async Task<FT_Usuarios> GetByID(int? id)
        {
            return await _repository.GetByID(id);
        }

        public async Task Update(FT_Usuarios usuario)
        {
            await _repository.Update(usuario);
        }
    }
}
