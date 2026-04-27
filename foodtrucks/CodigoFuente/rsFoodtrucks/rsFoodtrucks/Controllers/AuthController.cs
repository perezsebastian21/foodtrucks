using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using rsFoodtrucks.Services.TokenService;
using rsFoodtrucks.Utility;
using rsFoodtrucks.DTOs;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;

namespace rsFoodtrucks.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : Controller
    {
        private readonly IMemoryCache _cache;
        private readonly IConfiguration _config;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ITokenService _tokenService;

        public AuthController(IMemoryCache cache, IHttpClientFactory httpClientFactory, ITokenService tokenService, IConfiguration config)
        {
            _cache = cache;
            _httpClientFactory = httpClientFactory;
            _tokenService = tokenService;
            _config = config;
        }

        // Paso 0 y 1: El punto de entrada del QR
        // Ejemplo: api/auth/login?r=YTph...
        [HttpGet("login")]
        public IActionResult Login([FromQuery] string r)
        {
            int idFT;
            try
            {
                string key = _config["Obfuscation:Key"];
                idFT = IdObfuscator.Decode(r, key);
            }
            catch
            {
                return BadRequest("URL de votación inválida.");
            }
            // 1. Generamos los valores PKCE y Seguridad
            string verifier = PkceHelper.GenerateVerifier();
            string challenge = PkceHelper.GenerateChallenge(verifier);
            string state = Guid.NewGuid().ToString("N");
            string nonce = Guid.NewGuid().ToString("N");

            // 2. Guardamos TODO en cache por 10 minutos
            var authData = new
            {
                Verifier = verifier,
                IdFoodtruck = idFT,
                Nonce = nonce
            };

            _cache.Set(state, authData, TimeSpan.FromMinutes(10));

            // 3. Construimos la URL de MDQ Digital / Simulador
            var url = $"{_config["Oidc:AuthorizeUrl"]}?" +
                      $"client_id={_config["Oidc:ClientId"]}&" +
                      $"response_type=code&" +
                      $"scope=openid%20profile%20email&" +
                      $"redirect_uri={Uri.EscapeDataString(_config["Oidc:CallbackUrl"])}&" +
                      $"state={state}&" +
                      $"nonce={nonce}&" +
                      $"code_challenge={challenge}&" +
                      $"code_challenge_method=S256";

            return Redirect(url);
        }

        // Paso 2: El retorno desde el OIDC
        [HttpGet("callback")]
        public async Task<IActionResult> Callback([FromQuery] string code, [FromQuery] string state)
        {
            // 1. Validar seguridad (State)
            if (!_cache.TryGetValue(state, out dynamic authData))
            {
                return BadRequest("La sesión expiró. Escaneá el QR de nuevo.");
            }

            string verifier = authData.Verifier;
            int idFT = authData.IdFoodtruck;

            // 2. Intercambio de CODE por TOKEN (Server-to-Server)
            var client = _httpClientFactory.CreateClient();
            var tokenRequestParams = new Dictionary<string, string>
            {
                { "grant_type", "authorization_code" },
                { "code", code },
                { "redirect_uri", Url.Action("Callback", "Auth", null, Request.Scheme) },
                { "client_id", _config["Oidc:ClientId"] },
                { "client_secret", _config["Oidc:ClientSecret"] }, 
                { "code_verifier", verifier }
            };

            var tokenResponse = await client.PostAsync(_config["Oidc:TokenUrl"],
                                                       new FormUrlEncodedContent(tokenRequestParams));

            if (!tokenResponse.IsSuccessStatusCode)
                return BadRequest("Error al canjear el código por un token.");

            var tokenContent = await tokenResponse.Content.ReadAsStringAsync();

            // Deserializamos para obtener el access_token
            var tokenData = System.Text.Json.JsonSerializer.Deserialize<TokenResponseModel>(tokenContent);

            // 3. Obtener datos del vecino (UserInfo)
            client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenData.access_token);

            var userResponse = await client.GetAsync(_config["Oidc:UserInfoUrl"]);

            if (!userResponse.IsSuccessStatusCode)
                return BadRequest("Error al obtener datos del vecino.");

            var userJson = await userResponse.Content.ReadAsStringAsync();
            var userInfo = System.Text.Json.JsonSerializer.Deserialize<UserInfoModel>(userJson);

            // 4. Limpieza
            _cache.Remove(state);

            // 5. Generar JWT local de votación para el vecino con el CUIT
            string cuit = userInfo?.cuit;
            string nombreUsuario = userInfo?.given_name;
            string votacionToken = _tokenService.GenerateVotacionToken(idFT, cuit, nombreUsuario);

            // 6. Redirigir al frontend de votación con el token
            string frontendBaseUrl = _config["Frontend:BaseUrl"] ?? "http://localhost:3005";
            string redirectUrl = $"{frontendBaseUrl}/VotacionFT/{idFT}?token={votacionToken}";
            return Redirect(redirectUrl);
        }

        // Clase auxiliar para el JSON del Token OIDC
        public class TokenResponseModel
        {
            public string access_token { get; set; }
        }

        public class UserInfoModel
        {
            public string sub { get; set; }
            public string cuit { get; set; }
            
            public string given_name{ get; set; }
        }
    }
}
