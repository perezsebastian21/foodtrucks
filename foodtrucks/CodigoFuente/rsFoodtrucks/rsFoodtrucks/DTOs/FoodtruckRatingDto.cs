using System;

namespace rsFoodtrucks.DTOs
{
    public class FoodtruckRatingDto
    {
        public int IdFT { get; set; }
        public string NombreFantasia { get; set; }
        public string Titular { get; set; }
        public string EmailContacto { get; set; }
        public string Emplazado { get; set; }
        public string Menu { get; set; }
        public DateTime FechaVencimiento { get; set; }
        public byte[] Logo { get; set; }
        public double CalificacionMedia { get; set; }
        public int CantidadResenias { get; set; }
    }
}
