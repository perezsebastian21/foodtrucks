using rsFoodtrucks.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace rsCPO.Models
{
    public class QueryParams
    {
        public int? IdFT { get; set; }
        public int? IdCategoria { get; set; }
        public string searchString { get; set; }
        public string emplazado { get; set; }
        public string? estado { get; set; }
        public int? page { get; set; }
        public int? limit { get; set; }
        public List<int>? CategoriasIds { get; set; } = new List<int>();
        
    }
}
