using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace rsFoodtrucks.Models
{
    public class FT_Resenias
    {
        public int IdResenia { get; set; }
        public int IdFT { get; set; }
        [Column(TypeName = "char(11)")]
        public string Cuil { get; set; }
        public string NombreUsuario { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Comment { get; set; }

        [Column(TypeName = "char(1)")]
        public string Visible { get; set; } = "S";

        [JsonIgnore]
        public virtual FT_Foodtrucks Foodtruck { get; set; }

        public virtual ICollection<FT_Puntajes> Puntajes { get; set; }

        [JsonExtensionData]
        private IDictionary<string, JToken> _additionalData;
    }
}
