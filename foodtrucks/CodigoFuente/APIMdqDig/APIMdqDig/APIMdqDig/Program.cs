using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// --- CONFIGURACION DE CORS ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirTodo", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configuracion para que el JSON sea legible
builder.Services.Configure<JsonOptions>(options => {
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- CONFIGURACION DE COOKIE PARA LA SESION SIMULADA ---
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options => {
        options.Cookie.Name = "MDQMock.Session";
        options.ExpireTimeSpan = TimeSpan.FromHours(2);
    });
builder.Services.AddAuthorization();

var app = builder.Build();

// --- ACTIVAR CORS ---
app.UseCors("PermitirTodo");

app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Almacen en memoria
var MockSessionStore = new Dictionary<string, Dictionary<string, string>>();
var MockTokenStore = new Dictionary<string, MockUser>();

// --- 1. ENDPOINT DE AUTORIZACIN (GET - PANTALLA LOGIN O AUTO-REDIRECT) ---
app.MapGet("/connect/authorize", (
    HttpContext context,
    [FromQuery] string? client_id,
    [FromQuery] string? redirect_uri,
    [FromQuery] string? state,
    [FromQuery] string? nonce,
    [FromQuery] string? code_challenge,
    [FromQuery] string? code_challenge_method) =>
{
    if (code_challenge_method != "S256")
        return Results.BadRequest(new { error = "invalid_request", description = "PKCE method S256 required" });

    // Si ya esta logueado, generamos auth code inmediatamente y redirigimos sin pedir login manual
    if (context.User.Identity?.IsAuthenticated == true)
    {
        var userCuil = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
        var authCode = "AUTH-" + Guid.NewGuid().ToString("N").Substring(0, 10).ToUpper();

        MockSessionStore[authCode] = new Dictionary<string, string>
        {
            { "state", state ?? "" },
            { "nonce", nonce ?? "" },
            { "code_challenge", code_challenge ?? "" },
            { "redirect_uri", redirect_uri ?? "" },
            { "user_cuil", userCuil }
        };

        var autoRedirect = $"{redirect_uri}?code={authCode}&state={state}";
        return Results.Redirect(autoRedirect);
    }

    // En lugar de redirigir directamente, mostramos pantalla html
    var html = $@"<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <title>Login - MDQ Digital (MOCK)</title>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f4f4f9; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }}
        .login-box {{ background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }}
        h2 {{ text-align: center; color: #333; }}
        .form-group {{ margin-bottom: 15px; }}
        label {{ display: block; margin-bottom: 5px; color: #666; font-size: 14px;}}
        input[type='text'], input[type='password'] {{ width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }}
        button {{ width: 100%; padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; transition: 0.2s; }}
        button:hover {{ background-color: #0056b3; }}
    </style>
</head>
<body>
    <div class='login-box'>
        <h2>MDQ Digital</h2>
        <form method='POST' action='/login'>
            <input type='hidden' name='client_id' value='{client_id}' />
            <input type='hidden' name='redirect_uri' value='{redirect_uri}' />
            <input type='hidden' name='state' value='{state}' />
            <input type='hidden' name='nonce' value='{nonce}' />
            <input type='hidden' name='code_challenge' value='{code_challenge}' />
            <input type='hidden' name='code_challenge_method' value='{code_challenge_method}' />

            <div class='form-group'>
                <label>CUIL / DNI:</label>
                <input type='text' name='cuil' required />
            </div>
            <div class='form-group'>
                <label>Contrase&ntilde;a:</label>
                <input type='password' name='password' required />
            </div>
            <button type='submit'>Ingresar</button>
        </form>
    </div>
</body>
</html>";
    return Results.Content(html, "text/html");
});

// --- 1.b POST DE LOGIN ---
app.MapPost("/login", async (HttpContext context, [FromForm] string client_id, [FromForm] string redirect_uri, [FromForm] string state, [FromForm] string nonce, [FromForm] string code_challenge, [FromForm] string code_challenge_method, [FromForm] string cuil, [FromForm] string password) =>
{
    var user = MockDatabase.Vecinos.FirstOrDefault(u => u.Cuil == cuil && u.Password == password);
    if (user == null)
    {
        return Results.Content("<h1>Error de login</h1><p>Credenciales incorrectas.</p><a href='javascript:history.back()'>Volver</a>", "text/html");
    }

    // Almacenamos la sesin del mockup de MDQ digital usando cookies nativas de ASP.NET Core
    var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Cuil),
        new Claim(ClaimTypes.Name, user.Nombre)
    };
    var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
    await context.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));

    var authCode = "AUTH-" + Guid.NewGuid().ToString("N").Substring(0, 10).ToUpper();

    MockSessionStore[authCode] = new Dictionary<string, string>
    {
        { "state", state },
        { "nonce", nonce },
        { "code_challenge", code_challenge },
        { "redirect_uri", redirect_uri },
        { "user_cuil", user.Cuil }
    };

    var finalRedirect = $"{redirect_uri}?code={authCode}&state={state}";
    return Results.Redirect(finalRedirect);
}).DisableAntiforgery();


// --- 2. ENDPOINT DE TOKEN (POST) ---
app.MapPost("/connect/token", ([FromForm] string grant_type, [FromForm] string code, [FromForm] string code_verifier, [FromForm] string client_id, [FromForm] string client_secret, [FromForm] string redirect_uri) =>
{
    if (!MockSessionStore.TryGetValue(code, out var session))
        return Results.BadRequest(new { error = "invalid_grant" });

    // Obtenemos el usuario que se logueo
    var sessionCuil = session["user_cuil"];
    var user = MockDatabase.Vecinos.First(u => u.Cuil == sessionCuil);

    // Limpiamos el codigo ya que es de un solo uso
    MockSessionStore.Remove(code);

    var accessToken = "mock_access_" + Guid.NewGuid().ToString("N");
    MockTokenStore[accessToken] = user;

    return Results.Ok(new
    {
        access_token = accessToken,
        token_type = "Bearer",
        expires_in = 18000,
        id_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZmE4NWY2NC01NzE3LTQ1NjItYjNmYy0yYzk2M2Y2NmFmYTYiLCJub25jZSI6InNpbXVsYWRvIn0.signature"
    });
}).DisableAntiforgery();

// --- 3. ENDPOINT USERINFO (GET) ---
app.MapGet("/connect/userinfo", (HttpRequest request) =>
{
    var authHeader = request.Headers.Authorization.ToString();
    if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer mock_access_"))
        return Results.Unauthorized();

    var token = authHeader.Replace("Bearer ", "").Trim();
    if (!MockTokenStore.TryGetValue(token, out var user))
        return Results.Unauthorized();

    return Results.Ok(new
    {
        sub = Guid.NewGuid().ToString(),
        name = $"{user.Nombre} {user.Apellido}",
        given_name = user.Nombre,
        family_name = user.Apellido,
        email = user.Email,
        email_verified = true,
        cuit = user.Cuil
    });
});

app.Run();

// --- MOCK DATABASE ---
public record MockUser(string Cuil, string Password, string Nombre, string Apellido, string Email);

public static class MockDatabase
{
    public static List<MockUser> Vecinos = new()
    {
        new("20301962526", "aaa", "Sebastian", "Sistemas", "seba@example.com"),
        new("27998887776", "admin123", "Maria", "Gomez", "maria@example.com"),
        new("20123456789", "user123", "Juan", "Perez", "juan@perez.com"),
        new("12345678912", "aaa", "Juan", "Perez", "juan@perez.com")
    };
}
