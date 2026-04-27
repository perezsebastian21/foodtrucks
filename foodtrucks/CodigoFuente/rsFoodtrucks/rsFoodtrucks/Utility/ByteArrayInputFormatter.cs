using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Net.Http.Headers;
using System.IO;
using System.Threading.Tasks;

namespace rsFoodtrucks.Utility
{
    public class ByteArrayInputFormatter : InputFormatter
    {
        public ByteArrayInputFormatter()
        {
            SupportedMediaTypes.Add(MediaTypeHeaderValue.Parse("application/octet-stream"));
        }

        public override bool CanRead(InputFormatterContext context)
        {
            return context.ModelType == typeof(byte[]);
        }

        public override async Task<InputFormatterResult> ReadRequestBodyAsync(InputFormatterContext context)
        {
            var request = context.HttpContext.Request;

            if (request.ContentLength == 0)
            {
                return InputFormatterResult.Success(new byte[0]);
            }

            using var memoryStream = new MemoryStream();
            await request.Body.CopyToAsync(memoryStream);
            var data = memoryStream.ToArray();

            return InputFormatterResult.Success(data);
        }
    }
}
