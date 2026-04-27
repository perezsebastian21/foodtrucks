using Newtonsoft.Json;

namespace rsFoodtrucks.Models
{
    public class FT_FoodtruckFT_Categoria
    {
        public FT_FoodtruckFT_Categoria() { 
        }
        public int Id_FT_FoodtruckFT_Categoria { get; set; }
        public int IdFT{ get; set; }
        public int IdCategoria { get; set; }
        [JsonIgnore]
        public virtual FT_Foodtrucks foodtruck { get; set; }
        public virtual FT_Categorias categoria { get; set; }   
    }
}
