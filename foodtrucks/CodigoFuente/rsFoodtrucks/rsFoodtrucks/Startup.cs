using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using rsFoodtrucks.Models;
using rsFoodtrucks.DataAccess.Interfaces;
using rsFoodtrucks.Utility;
using rsFoodtrucks.DataAccess.Servicios;
using rsFoodtrucks.Services.FoodtruckService;
using rsFoodtrucks.Services.MailService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using rsFoodtrucks.Services.UsuarioService;
using rsFoodtrucks.Services.CategoriaService;
using rsFoodtrucks.Services.PreguntasService;
using rsFoodtrucks.Services.ReseniasService;
using rsFoodtrucks.Services.PuntajesService;
using rsFoodtrucks.Mapping.ImageMapping;
using rsFoodtrucks.Services.TokenService;
using rsFoodtrucks.Services.QrCodeService;
using Microsoft.AspNetCore.HttpOverrides; // Agregado
using Microsoft.AspNetCore.Http.Features; // Agregado
using System;

namespace rsFoodtrucks
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            _config = configuration;
        }

        public IConfiguration _config { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            // --- 1. CONFIGURACIÓN DE LÍMITES DE CARGA (Para Error 413) ---
            services.Configure<FormOptions>(options =>
            {
                options.ValueLengthLimit = int.MaxValue;
                options.MultipartBodyLengthLimit = 52428800; // 50MB
                options.MultipartHeadersLengthLimit = int.MaxValue;
            });

            // --- 2. CONFIGURACIÓN DE HEADERS PARA PROXY (Para OIDC/HTTPS) ---
            services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
                // Como es una red municipal interna, limpiamos proxies conocidos para confiar en el Nginx
                options.KnownNetworks.Clear();
                options.KnownProxies.Clear();
            });

            services.AddControllers().AddNewtonsoftJson(x => x.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);
            services.AddControllersWithViews().AddNewtonsoftJson(x => x.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);

            services.AddDbContext<ApplicationDbContext>(options => options.UseLazyLoadingProxies().UseNpgsql(_config.GetConnectionString("PLSQL")));

            // Registro de Servicios
            services.AddScoped<IFoodtruckService, FoodtruckService>();
            services.AddScoped<IUsuarioService, UsuarioService>();
            services.AddScoped<ICategoriaService, CategoriaService>();
            services.AddScoped<IPreguntasService, PreguntasService>();
            services.AddScoped<IReseniasService, ReseniasService>();
            services.AddScoped<IPuntajesService, PuntajesService>();
            services.AddScoped<IMailService, MailService>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IQrCodeService, QrCodeService>();
            services.AddScoped<IRepositoryAsync<FT_Foodtrucks>, RepositoryAsync<FT_Foodtrucks>>();
            services.AddScoped<IRepositoryAsync<FT_Usuarios>, RepositoryAsync<FT_Usuarios>>();
            services.AddScoped<IRepositoryAsync<FT_Categorias>, RepositoryAsync<FT_Categorias>>();
            services.AddScoped<IRepositoryAsync<FT_FoodtruckFT_Categoria>, RepositoryAsync<FT_FoodtruckFT_Categoria>>();
            services.AddScoped<IRepositoryAsync<FT_Resenias>, RepositoryAsync<FT_Resenias>>();
            services.AddScoped<IRepositoryAsync<FT_Preguntas>, RepositoryAsync<FT_Preguntas>>();
            services.AddScoped<IRepositoryAsync<FT_Puntajes>, RepositoryAsync<FT_Puntajes>>();

            services.AddHttpClient();

            // Autenticación JWT
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = _config["Jwt:Admin:Issuer"],
                        ValidAudience = _config["Jwt:Admin:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Admin:Key"])),
                        ClockSkew = TimeSpan.Zero
                    };
                })
                .AddJwtBearer("Votacion", options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = _config["Jwt:Votacion:Issuer"],
                        ValidAudience = _config["Jwt:Votacion:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Votacion:Key"])),
                        ClockSkew = TimeSpan.Zero
                    };
                });

            services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminPolicy", policy =>
                {
                    policy.AuthenticationSchemes.Add(JwtBearerDefaults.AuthenticationScheme);
                    policy.RequireAuthenticatedUser();
                });
                options.AddPolicy("VotacionPolicy", policy =>
                {
                    policy.AuthenticationSchemes.Add("Votacion");
                    policy.RequireAuthenticatedUser();
                });
            });

            services.Configure<IISServerOptions>(options =>
            {
                options.MaxRequestBodySize = int.MaxValue;
            });

            services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
            services.AddScoped<IGenericImageMapperService, GenericImageMapperService>();
            services.AddMemoryCache();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            // IMPORTANTE: ForwardedHeaders debe ir ANTES de UseAuthentication y UseRouting
            app.UseForwardedHeaders();

            app.UseMiddleware(typeof(GlobalErrorHandlingMiddleware));

            // Si no estamos en desarrollo, forzamos HTTPS para evitar el problema de OIDC
            if (!env.IsDevelopment())
            {
                app.UseHttpsRedirection();
            }

            app.UseAuthentication();
            app.UseRouting();

            app.UseCors(x => x
                .AllowAnyMethod()
                .AllowAnyHeader()
                .SetIsOriginAllowed(origin => true)
                .AllowCredentials());

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}