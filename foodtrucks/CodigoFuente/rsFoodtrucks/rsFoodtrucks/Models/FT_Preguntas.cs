using System;
using System.Collections.Generic;

namespace rsFoodtrucks.Models
{
    public class FT_Preguntas
    {
        public int IdPregunta { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }

        public virtual ICollection<FT_Puntajes> Puntajes { get; set; }
    }
}
