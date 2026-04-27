using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System;

namespace rsFoodtrucks.DTOs
{
    public class FT_FoodtrucksDTO
    {
        // Campos principales
        public int IdFT { get; set; }
        public string NombreFantasia { get; set; }
        public string Titular { get; set; }
        public string EmailContacto { get; set; }

        // Lista de IDs de categorías (reemplaza a la relación con FT_Categorias)
        public List<int> CategoriasIds { get; set; } = new List<int>();

        // Campos opcionales
        public string Menu { get; set; }
        public string Vegano { get; set; }
        public string Vegetariano { get; set; }
        public string SinTACC { get; set; }
        public string Emplazado { get; set; }
        public string Celiaco { get; set; }
        public string? Estado { get; set; }
        public string CelContacto { get; set; }

        // Campos nuevos
        public string CuitCuil { get; set; }
        public string DomicilioLegal { get; set; }
        public string Telefono { get; set; }
        public string EmailTitular { get; set; }
        public string NumeroRegistro { get; set; }
        public DateTime? FechaVencimiento { get; set; }
        public string SolicitudIngreso { get; set; }
        public string Consumo { get; set; }
        public string Observaciones { get; set; }

        public IFormFile CartaMenu { get; set; }

        // Campos para imágenes (IFormFile)
        public IFormFile Logo { get; set; }
        public IFormFile DniFrente { get; set; }
        public IFormFile DniDorso { get; set; }
        public IFormFile FtFrente { get; set; }
        public IFormFile HabHoja1 { get; set; }
        public IFormFile HabHoja2 { get; set; }
        public IFormFile HabHoja3 { get; set; }
        public IFormFile ManipulacionAlimentos { get; set; }
        
    }
}
