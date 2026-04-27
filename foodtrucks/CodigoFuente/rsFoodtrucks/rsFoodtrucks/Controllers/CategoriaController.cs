using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using rsCPO.Models;

using rsFoodtrucks.Models;
using rsFoodtrucks.Services.CategoriaService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace rsFoodtrucks.Controllers
{
    [ApiController]
    //[Authorize(Roles = "Admin")]
    [Route("[controller]")]
    public class CategoriaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ICategoriaService _service;

        public CategoriaController(ApplicationDbContext context, ILogger<FT_Categorias> logger, ICategoriaService service)
        {
            _context = context;
            _service = service;
        }


        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<FT_Categorias>>> Get()
        {
            return Ok(await _service.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<FT_Categorias>> Get(int IdFT)
        {
            return Ok(await _service.GetByID(IdFT));
        }

        [HttpGet("Find")]
        public async Task<IActionResult> Get(int? IdFT, string searchString, int page, int limit)
        {
            return Ok();

        }

        [HttpPost]
        public async Task<ActionResult<FT_Categorias>> Create([FromBody] FT_Categorias foodtruck)
        {
            await _service.Create(foodtruck);
            return Ok(foodtruck);
        }
        
        [HttpDelete("{IdFT}")]
        public async Task<IActionResult> Delete(int IdFT){
            await _service.Delete(IdFT);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<FT_Categorias>> Update([FromBody] FT_Categorias foodtruck)
        {
            await _service.Update(foodtruck);
            return Ok(foodtruck);
        }

        [HttpGet("FindFinal")]
        public async Task<IActionResult> Get(int? IdFT, string searchString, int page, int limit, int IdCategoria)
        {
            PageInfo pi = new PageInfo();
            pi.Page = page;
            pi.Limit = limit;
            ServiceResponse<PagedResponse<Object>> respuesta = new ServiceResponse<PagedResponse<Object>>(new PagedResponse<Object>((List<Object>)await _service.FindBy(IdFT, searchString, null, null, null, null, pi, null),page,limit,_service.Count(IdFT, searchString)));
            return Ok(respuesta);
        }

        [HttpGet("FindQP")]
        public async Task<ActionResult<ServiceResponse<PagedResponse<Object>>>> Get([FromQuery]QueryParams qp)
        {
            if (qp.page == 0)
                qp.page = qp.page + 1;
            ServiceResponse<PagedResponse<Object>> respuesta = new ServiceResponse<PagedResponse<Object>>(new PagedResponse<Object>((List<Object>)await _service.FindBy(qp), qp.page.Value, qp.limit.Value, _service.Count(qp)));
            return Ok(respuesta);
        }
    }
}
