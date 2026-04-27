using rsFoodtrucks.DataAccess.Interfaces;
using System;
using System.Collections.Generic;

namespace rsFoodtrucks.Models
{
    public class PagedResponse<T>
    {
        public List<T> data { get; set; }
        public int Page { get; set; }
        public decimal Limit { get; set; }
        public int TotalRows { get; set; }
        public int TotalPage { get; set; }

        public PagedResponse(List<T> _data,int page, int  limit, int totalrows)
        //public PagedResponse(List<T> _data)
        {
            data = _data;
            Limit = limit;
            //page = page - 1;//RECONTRA ATENTOS CON ESTE CABLE 
            Page = page;//RECONTRA ATENTOS CON ESTE CABLE 
            TotalRows = totalrows;
            TotalPage = (int)Math.Ceiling((double)totalrows / limit);
        }

        //aca para pulir el modelo se podria agragar una lista de errores de diferentes tipos, podria ser un clave valor 
        //cod_error description resta definirlo
    }
}
