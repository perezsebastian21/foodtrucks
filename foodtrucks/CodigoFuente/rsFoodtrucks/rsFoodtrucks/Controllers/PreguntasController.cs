using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using rsFoodtrucks.Models;
using rsCPO.Models;
using rsFoodtrucks.Services.PreguntasService;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace rsFoodtrucks.Controllers
{
    [ApiController]
    //[Authorize(Roles = "Admin")]
    [AllowAnonymous]
    [Route("[controller]")]
    public class PreguntasController : ControllerBase
    {
        private readonly IPreguntasService _service;

        public PreguntasController(IPreguntasService service)
        {
            _service = service;
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<FT_Preguntas>>> Get()
        {
            return Ok(await _service.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<FT_Preguntas>> Get(int IdPregunta)
        {
            return Ok(await _service.GetByID(IdPregunta));
        }

        [HttpPost]
        public async Task<ActionResult<FT_Preguntas>> Create([FromBody] FT_Preguntas pregunta)
        {
            await _service.Create(pregunta);
            return Ok(pregunta);
        }

        [HttpDelete("{IdPregunta}")]
        public async Task<IActionResult> Delete(int IdPregunta)
        {
            await _service.Delete(IdPregunta);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<FT_Preguntas>> Update([FromBody] FT_Preguntas pregunta)
        {
            await _service.Update(pregunta);
            return Ok(pregunta);
        }

        [HttpGet("FindQP")]
        public async Task<ActionResult<ServiceResponse<PagedResponse<Object>>>> Get([FromQuery] QueryParams qp)
        {
            if (!qp.page.HasValue || qp.page.Value == 0)
                qp.page = (qp.page ?? 0) + 1;
                
            if (!qp.limit.HasValue)
                qp.limit = 10;
                
            ServiceResponse<PagedResponse<Object>> respuesta = new ServiceResponse<PagedResponse<Object>>(
                new PagedResponse<Object>(
                    (List<Object>)await _service.FindBy(qp), 
                    qp.page.Value, 
                    qp.limit.Value, 
                    _service.Count(qp)
                )
            );
            return Ok(respuesta);
        }
    }
}
