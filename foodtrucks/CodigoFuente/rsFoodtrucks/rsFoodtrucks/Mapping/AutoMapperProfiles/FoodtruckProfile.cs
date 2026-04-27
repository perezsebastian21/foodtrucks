using AutoMapper;
using Microsoft.AspNetCore.Http;
using rsFoodtrucks.DTOs;
using rsFoodtrucks.Models;
using System.IO;
using System.Linq;

namespace rsFoodtrucks.Mapping.AutoMapperProfiles
{
    public class FoodtruckProfile : Profile
    {
        public FoodtruckProfile()
        {


            CreateMap<FT_FoodtrucksDTO, FT_Foodtrucks>()
                .ForMember(dest => dest.Logo, opt => opt.Ignore()) // ignorar imágenes
                .ForMember(dest => dest.DniFrente, opt => opt.Ignore())
                .ForMember(dest => dest.DniDorso, opt => opt.Ignore())
                .ForMember(dest => dest.FtFrente, opt => opt.Ignore())
                .ForMember(dest => dest.HabHoja1, opt => opt.Ignore())
                .ForMember(dest => dest.HabHoja2, opt => opt.Ignore())
                .ForMember(dest => dest.HabHoja3, opt => opt.Ignore())
                .ForMember(dest => dest.CartaMenu, opt => opt.Ignore())
                .ForMember(dest => dest.ManipulacionAlimentos, opt => opt.Ignore())
                .AfterMap((dto, entity) =>
                {
                    if (dto.CategoriasIds != null)
                    {
                        entity.FoodtrucksCategorias = dto.CategoriasIds.Select(id => new FT_FoodtruckFT_Categoria { IdCategoria = id }).ToList();
                    }
                });
        }
    }
}


