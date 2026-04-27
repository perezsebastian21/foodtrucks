using Microsoft.AspNetCore.Mvc.Formatters;
using System.Threading.Tasks;

namespace rsFoodtrucks
{
    internal class FormFileFormatter : IInputFormatter
    {
        public bool CanRead(InputFormatterContext context)
        {
            throw new System.NotImplementedException();
        }

        public Task<InputFormatterResult> ReadAsync(InputFormatterContext context)
        {
            throw new System.NotImplementedException();
        }
    }
}