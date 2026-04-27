using System;
using System.Collections.Generic;

namespace rsFoodtrucks.DTOs
{
    public class FoodtruckResumenReseniasDto
    {
        public int IdFT { get; set; }
        public string NombreFT { get; set; }
        public IEnumerable<ComentarioDto> Comentarios { get; set; }
        public IEnumerable<PreguntaPromedioDto> PromediosPorPregunta { get; set; }
    }

    public class ComentarioDto
    {
        public int IdResenia { get; set; }
        public string Usuario { get; set; }
        public string Comentario { get; set; }
        public DateTime Fecha { get; set; }
        public string Visible { get; set; }
    }

    public class PreguntaPromedioDto
    {
        public int IdPregunta { get; set; }
        public string NombrePregunta { get; set; }
        public double Promedio { get; set; }
    }
}
