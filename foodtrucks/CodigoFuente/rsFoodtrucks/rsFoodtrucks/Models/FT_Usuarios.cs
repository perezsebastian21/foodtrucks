using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace rsFoodtrucks.Models
{
    public class FT_Usuarios
    {
        public int IdUsuario { get; set; }
        public string Usuario { get; set; }
        public string Email { get; set; }
        public bool? Activo { get; set; }

    }
}
