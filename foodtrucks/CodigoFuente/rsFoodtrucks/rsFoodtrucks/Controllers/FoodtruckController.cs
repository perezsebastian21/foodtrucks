using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using rsCPO.Models;
using rsFoodtrucks.Models;
using rsFoodtrucks.Services.FoodtruckService;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using OfficeOpenXml;
using System.IO;
using System.Linq;
using rsFoodtrucks.DTOs;
using AutoMapper;
using rsFoodtrucks.Mapping.ImageMapping;
using rsFoodtrucks.Services.QrCodeService;

namespace rsFoodtrucks.Controllers
{
    [ApiController]
    //[Authorize(Roles = "Admin")]
    [Route("[controller]")]
    public class FoodtruckController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IFoodtruckService _service;
        private readonly IMapper _mapper;
        private readonly IGenericImageMapperService _imageMapperService;
        private readonly IQrCodeService _qrCodeService;

        public FoodtruckController(ApplicationDbContext context, ILogger<FT_Foodtrucks> logger, IFoodtruckService service, IMapper mapper, IGenericImageMapperService imageMapperService, IQrCodeService qrCodeService)
        {
            _context = context;
            _service = service;
            _mapper = mapper;
            _imageMapperService = imageMapperService;
            _qrCodeService = qrCodeService;
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<FT_Foodtrucks>>> Get()
        {
            return Ok(await _service.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<FT_Foodtrucks>> Get(int IdFT)
        {
            return Ok(await _service.GetByID(IdFT));
        }
          
        [HttpPost]
        public async Task<ActionResult<FT_Foodtrucks>> Create([FromForm] FT_FoodtrucksDTO foodtruckdto)
        {
            //convertir el dto por el tema del listado de categorias
            FT_Foodtrucks foodtruck = _mapper.Map<FT_Foodtrucks>(foodtruckdto);
            //convertir las imagenes a partir del dto a la entidad
            foodtruck = await _imageMapperService.MapImagesToEntityAsync<FT_FoodtrucksDTO, FT_Foodtrucks>(foodtruckdto, foodtruck, clearExistingIfNull: true);
            //guardar
            await _service.Create(foodtruck);
            //return Ok();//esto es para que no me resetee en frontend por eso devuelva badrequest
            return BadRequest();//esto es para que no me resetee en frontend por eso devuelva badrequest
        }

        [HttpDelete("{IdFT}")]
        public async Task<IActionResult> Delete(int IdFT){
            await _service.Delete(IdFT);
            return Ok();
        }
        
        [HttpPut]
        public async Task<ActionResult<FT_Foodtrucks>> Update([FromForm] FT_FoodtrucksDTO foodtruckdto)
        {
            //convertir el dto por el tema del listado de categorias
            FT_Foodtrucks foodtruck = _mapper.Map<FT_Foodtrucks>(foodtruckdto);
            //convertir las imagenes a partir del dto a la entidad
            foodtruck = await _imageMapperService.MapImagesToEntityAsync<FT_FoodtrucksDTO, FT_Foodtrucks>(foodtruckdto, foodtruck, clearExistingIfNull: true);
            //guardar
            await _service.Update(foodtruck);
            return Ok(foodtruck);
        }

        [AllowAnonymous]
        [HttpGet("ExportXLS")]
        public async Task<ActionResult<ServiceResponse<Object>>> Export([FromQuery] QueryParams qp)
        {
            IEnumerable<object> data = await _service.FindBy(qp); // tus datos

            // Crear el archivo de Excel
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            using (ExcelPackage excelPackage = new ExcelPackage())
            {
                // Agregar una nueva hoja de cálculo
                ExcelWorksheet worksheet = excelPackage.Workbook.Worksheets.Add("Hoja1");

                // Escribir cabeceras en la hoja de cálculo
                int column = 1;
                //ATENCION LAS CELDAS SE DEBEN CORRESPONDE CON LOS CAMPOS QUE HAY EN data. LOS MISMOS DE DEFINIEN EN EL USO DE await _service.FindBy(qp);
                worksheet.Cells[1, column++].Value = "IdFT";
                worksheet.Cells[1, column++].Value = "NombreFantasia";
                worksheet.Cells[1, column++].Value = "FechaVencimiento";
                worksheet.Cells[1, column++].Value = "Titular";
                worksheet.Cells[1, column++].Value = "Email";
                worksheet.Cells[1, column++].Value = "Menu";
                // Escribir datos en la hoja de cálculo
                int row = 2;
                foreach (var item in data)
                {
                    var properties = item.GetType().GetProperties();
                    column = 1;
                    foreach (var property in properties)
                    {
                        if(property.Name != "Logo" && property.Name != "_Logo")
                        {
                            worksheet.Cells[row, column].Value = property.GetValue(item);
                            if (property.Name == "FechaVencimiento" || property.PropertyType == typeof(DateTime) || property.PropertyType == typeof(DateTime?))
                            {
                                worksheet.Cells[row, column].Style.Numberformat.Format = "dd/MM/yyyy";
                            }
                            column++;
                        }
                    }
                    row++;
                }

                // Guardar el archivo de Excel en un stream
                MemoryStream stream = new MemoryStream();
                excelPackage.SaveAs(stream);

                // Devolver el archivo Excel como un FileContentResult
                byte[] content = stream.ToArray();
                return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "foodtrucks.xlsx");
            }
        }

        [Authorize(Policy = "AdminPolicy")]
        [HttpGet("{IdFT}/QR")]
        public async Task<IActionResult> DescargarQR(int IdFT)
        {
            byte[] qr = await _qrCodeService.GenerarYGuardarQr(IdFT);
            return File(qr, "image/png", $"qr_foodtruck_{IdFT}.png");
        }

        [AllowAnonymous]
        [HttpGet("FindQP")]
        public async Task<ActionResult<ServiceResponse<PagedResponse<FoodtruckRatingDto>>>> Get([FromQuery] QueryParams qp)
        {
            ServiceResponse<PagedResponse<FoodtruckRatingDto>> respuesta = new ServiceResponse<PagedResponse<FoodtruckRatingDto>>(new PagedResponse<FoodtruckRatingDto>((List<FoodtruckRatingDto>)await _service.FindByWithRating(qp), qp.page.Value, qp.limit.Value, _service.Count(qp)));
            return Ok(respuesta);
        }
    }
}
