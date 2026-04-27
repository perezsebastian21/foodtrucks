using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using rsFoodtrucks.Models;
using rsFoodtrucks.Services.PuntajesService;
using rsCPO.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace rsFoodtrucks.Controllers
{
    [ApiController]
    [Authorize(Roles = "Admin")]
    [Route("[controller]")]
    public class PuntajesController : ControllerBase
    {
        private readonly IPuntajesService _service;

        public PuntajesController(IPuntajesService service)
        {
            _service = service;
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<FT_Puntajes>>> Get()
        {
            return Ok(await _service.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<FT_Puntajes>> Get(int idResenia, int idPregunta)
        {
            return Ok(await _service.GetByID(idResenia, idPregunta));
        }

        [HttpPost]
        public async Task<ActionResult<FT_Puntajes>> Create([FromBody] FT_Puntajes puntaje)
        {
            await _service.Create(puntaje);
            return Ok(puntaje);
        }

        [HttpDelete("{idResenia}/{idPregunta}")]
        public async Task<IActionResult> Delete(int idResenia, int idPregunta)
        {
            await _service.Delete(idResenia, idPregunta);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<FT_Puntajes>> Update([FromBody] FT_Puntajes puntaje)
        {
            await _service.Update(puntaje);
            return Ok(puntaje);
        }

        [HttpGet("FindQP")]
        public async Task<ActionResult<IEnumerable<FT_Puntajes>>> FindBy([FromQuery] QueryParams qp)
        {
            return Ok(await _service.FindBy(qp));
        }

        [HttpGet("CountQP")]
        public ActionResult<int> Count([FromQuery] QueryParams qp)
        {
            return Ok(_service.Count(qp));
        }
    }
}
