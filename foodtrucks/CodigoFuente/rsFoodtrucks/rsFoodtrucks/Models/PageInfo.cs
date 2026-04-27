using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace rsFoodtrucks.Models
{
    public class PageInfo
    {
        public PageInfo(string search_query, int page, int limit, int paginaDesde, int paginaHasta, int totalFilas, int totalPaginas)
        {
            Search_Query = search_query;
            Page = page;
            Limit = limit;
            PaginaDesde = paginaDesde;
            PaginaHasta = paginaHasta;
            TotalFilas = totalFilas;
            TotalPaginas = totalPaginas;
        }
        public PageInfo()
        {
        }

        public string Search_Query { get; set; }
        public int Page { get; set; }
        public int Limit { get; set; }
        public int PaginaDesde { get; set; }
        public int PaginaHasta { get; set; }
        public int TotalFilas { get; set; }
        public int TotalPaginas { get; set; }
    }
}
