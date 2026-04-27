using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace rsFoodtrucks.Models
{
    public class FT_Categorias
    {
        public int IdCategoria { get; set; }
        public string Nombre { get; set; }//varchar 2000

        [JsonIgnore]
        public virtual ICollection<FT_FoodtruckFT_Categoria> FoodtrucksCategorias { get; set; }

        //falta el constructor por las dudas
    }
}
