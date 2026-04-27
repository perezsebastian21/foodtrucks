using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Runtime.ConstrainedExecution;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace rsFoodtrucks.Models
{
    public class FT_Foodtrucks
    {
        
        public int IdFT { get; set; }
        public string NombreFantasia { get; set; }//varchar 2000
        public byte[]? Logo { get; set; }
        public string Titular { get; set; }//varchar 2000
        public string EmailContacto { get; set; }//este campo pasa a llamarse emailContanto pero en base de datos(ajustado en dbContext) por el momento sera Email 
        public string Menu { get; set; }//text
        public string Vegano { get; set; }
        public string Vegetariano { get; set; }
        public string SinTACC { get; set; }
        public string Emplazado { get; set; }
        public string Celiaco { get; set; }
        public string? Estado { get; set; }
        public string CelContacto { get; set; }
        //campos nuevos
        public string CuitCuil { get; set; }
        public string DomicilioLegal { get; set; }
        public string Telefono { get; set; }
        public string EmailTitular { get; set; }
        public string NumeroRegistro { get; set; }
        public DateTime? FechaVencimiento { get; set; }
        public string? SolicitudIngreso { get; set; }
        public string? Consumo { get; set; }
        public string Observaciones { get; set; }
        public byte[]? CartaMenu { get; set; }
        public byte[]? DniFrente { get; set; }
        public byte[]? DniDorso { get; set; }
        public byte[]? FtFrente { get; set; }
        public byte[]? HabHoja1 { get; set; }
        public byte[]? HabHoja2 { get; set; }
        public byte[]? HabHoja3 { get; set; }
        public byte[]? ManipulacionAlimentos { get; set; }
        public byte[]? QrCode { get; set; }
        
        public virtual ICollection<FT_FoodtruckFT_Categoria> FoodtrucksCategorias { get; set; }
        public virtual ICollection<FT_Resenias> Resenias { get; set; }
    }
}
