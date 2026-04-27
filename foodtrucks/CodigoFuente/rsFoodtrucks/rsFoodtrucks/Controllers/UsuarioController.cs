using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using rsFoodtrucks.Models;
using rsFoodtrucks.Services.UsuarioService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace rsFoodtrucks.Controllers
{
    [ApiController]
    [Authorize(Roles = "Admin")]
    [Route("[controller]")]
    public class UsuarioController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IUsuarioService _service;

        public UsuarioController(ApplicationDbContext context, ILogger<FT_Usuarios> logger, IUsuarioService service)
        {
            _context = context;
            _service = service;
        }
        
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<FT_Usuarios>>> Get()
        {
            return Ok(await _service.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<FT_Usuarios>> Get(int Id)
        {
            return Ok(await _service.GetByID(Id));
        }

        [HttpGet("Find")]
        public async Task<ActionResult<FT_Usuarios>> Get(int? Id, string searchString)
        {
            return Ok(await _service.FindBy(Id, searchString, null));
        }

        [HttpPost]
        public async Task<ActionResult<FT_Usuarios>> Create([FromBody] FT_Usuarios usuario)
        {
            await _service.Create(usuario);
            return Ok(usuario);
        }

        [HttpDelete("{Id}")]
        public async Task<IActionResult> Delete(int Id)
        {
            await _service.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<FT_Usuarios>> Update([FromBody] FT_Usuarios usuario)
        {
            await _service.Update(usuario);
            return Ok(usuario);
        }

    }
}
