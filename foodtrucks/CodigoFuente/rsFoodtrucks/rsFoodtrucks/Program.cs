using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Authentication;
using System.Threading.Tasks;

namespace rsFoodtrucks
{
    public class Program
    {
        public static void Main(string[] args)
        {
            //ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls11;
            CreateHostBuilder(args).Build().Run();
        }

       
        public static IHostBuilder CreateHostBuilder(string[] args) =>
        /*
        Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseKestrel(kestrelOptions =>
                {
                    kestrelOptions.ConfigureHttpsDefaults(httpsOptions =>
                    {
                        httpsOptions.SslProtocols = SslProtocols.Tls11;
                    });
                });

                webBuilder.UseStartup<Startup>();
            });
    */
        Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder =>
            {
        webBuilder.UseStartup<Startup>();
         });
    }
}
