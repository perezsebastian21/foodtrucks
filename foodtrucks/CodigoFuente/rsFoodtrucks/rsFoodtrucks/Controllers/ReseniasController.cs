using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using rsFoodtrucks.Models;
using rsCPO.Models;
using rsFoodtrucks.Services.ReseniasService;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace rsFoodtrucks.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ReseniasController : ControllerBase
    {
        private readonly IReseniasService _service;

        public ReseniasController(IReseniasService service)
        {
            _service = service;
        }

        [AllowAnonymous]
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<FT_Resenias>>> Get()
        {
            return Ok(await _service.GetAll());
        }

        [AllowAnonymous]
        [HttpGet("GetById")]
        public async Task<ActionResult<FT_Resenias>> Get(int IdResenia)
        {
            return Ok(await _service.GetByID(IdResenia));
        }

        [AllowAnonymous]
        [HttpGet("ByFoodtruck/{idFt}/Summary")]
        public async Task<ActionResult<rsFoodtrucks.DTOs.FoodtruckResumenReseniasDto>> GetResumenByFoodtruck(int idFt)
        {
            var resumen = await _service.GetResumenByFoodtruck(idFt);
            return Ok(resumen);
        }

        [Authorize(Policy = "AdminPolicy")]
        [HttpGet("ByFoodtruck/{idFt}/SummaryAdmin")]
        public async Task<ActionResult<rsFoodtrucks.DTOs.FoodtruckResumenReseniasDto>> GetResumenAdminByFoodtruck(int idFt)
        {
            var resumen = await _service.GetResumenAdminByFoodtruck(idFt);
            return Ok(resumen);
        }

        [Authorize(Policy = "VotacionPolicy")]
        [HttpPost]
        public async Task<ActionResult<FT_Resenias>> Create([FromBody] FT_Resenias resenia)
        {
            await _service.Create(resenia);
            return Ok(resenia);
        }

        [HttpDelete("{IdResenia}")]
        public async Task<IActionResult> Delete(int IdResenia)
        {
            await _service.Delete(IdResenia);
            return Ok();
        }

        [Authorize(Policy = "AdminPolicy")]
        [HttpPatch("{IdResenia}/CambiarVisibilidad")]
        public async Task<IActionResult> CambiarVisibilidad(int IdResenia)
        {
            await _service.CambiarVisibilidad(IdResenia);
            return Ok();
        }

        [Authorize(Policy = "VotacionPolicy")]
        [HttpPut]
        public async Task<ActionResult<FT_Resenias>> Update([FromBody] FT_Resenias resenia)
        {
            await _service.Update(resenia);
            return Ok(resenia);
        }

        [AllowAnonymous]
        [HttpGet("FindQP")]
        public async Task<ActionResult<ServiceResponse<PagedResponse<Object>>>> Get([FromQuery] QueryParams qp)
        {
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
