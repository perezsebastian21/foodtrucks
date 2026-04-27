using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using rsFoodtrucks.Models;
using rsFoodtrucks.Services.TokenService;
using rsFoodtrucks.Services.UsuarioService;
using rsFoodtrucks.Utility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace rsFoodtrucks.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class Account : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly ApplicationDbContext _context;
        private readonly IUsuarioService _service;
        private readonly ITokenService _tokenService;

        public Account(IConfiguration config, ApplicationDbContext context, IUsuarioService service, ITokenService tokenService)
        {
            _config = config;
            _context = context;
            _service = service;
            _tokenService = tokenService;
        }

        [HttpPost("Login")]
        public async Task<ActionResult> Index([FromBody] UserInfo userinfo)
        {
            string domain = _config.GetValue<string>("Ldap:Dominio");
            int port = int.Parse(_config.GetValue<string>("Ldap:Puerto"));
            string user = userinfo.Usuario;
            string password = userinfo.Password;
            bool isValied = new LdapManager(_config).Validate(user, password);// HABILITAR PARA VALIDAR
            if (isValied){ 
                IEnumerable<Object> usuarios = await _service.FindBy(user);
                if (usuarios.Count() > 0 )
                {
                    string token = _tokenService.GenerateAdminToken(user);
                    return Ok(new
                    {
                        token = token,
                        expiration = DateTime.UtcNow.AddHours(1)
                    });
                }
                else
                    return BadRequest();
            }
            else
                return BadRequest();
        }
    }
}
