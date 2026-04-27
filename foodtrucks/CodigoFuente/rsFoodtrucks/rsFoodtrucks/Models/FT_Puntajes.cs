using Newtonsoft.Json;
using System;

namespace rsFoodtrucks.Models
{
    public class FT_Puntajes
    {
        public int IdResenia { get; set; }
        public int IdPregunta { get; set; }
        public short Score { get; set; }

        [JsonIgnore]
        public virtual FT_Resenias Resenia { get; set; }
        [JsonIgnore]
        public virtual FT_Preguntas Pregunta { get; set; }
    }
}
