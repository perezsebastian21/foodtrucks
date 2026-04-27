# Refactorizacion del Sistema de Tokens JWT

## 1. Problema Original

La generacion de tokens JWT estaba acoplada dentro de `AccountController` (metodo privado `BuildToken()`) y el flujo de votacion (`AuthController`) no generaba un JWT local, lo que impedia tener tokens diferenciados para **administracion** y **votacion**.

### 1.1. Estado Anterior

```csharp
// AccountController.cs - ANTES
private IActionResult BuildToken()
{
    var claims = new[]
    {
        new Claim(ClaimTypes.Role, "Admin") // Rol hardcodeado
    };
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.GetValue<string>("Ldap:Key")));
    // ... generacion acoplada al controlador
}
```

- `BuildToken()` era un metodo privado, no reutilizable
- El flujo OIDC de votacion no generaba JWT local: el vecino no tenia token para operar en la API
- Una sola clave y un solo esquema JWT para todo el sistema

---

## 2. Solucion Implementada

### 2.1. Servicio centralizado de Tokens (`Services/TokenService/`)

Se creo `ITokenService` / `TokenService` que centraliza la generacion de tokens JWT y soporta dos flujos independientes:

```csharp
public interface ITokenService
{
    // JWT para administradores, firmado con Jwt:Admin:Key, expira en 1 hora
    string GenerateAdminToken(string username);

    // JWT para vecinos (votos/resenias), firmado con Jwt:Votacion:Key, expira en 30 minutos
    string GenerateVotacionToken(int idFT, string userIdentifier, string nombreUsuario);
}
```

**Claims por tipo de token:**

| Token | Claims incluidos |
|---|---|
| Admin | `Name: <username>` |
| Votacion | `IdFoodtruck: <idFT>`, `NameIdentifier: <userIdentifier>`, `Name: <nombreUsuario>` |

### 2.2. Configuracion (`appsettings.json`)

Se agrego la seccion `Jwt` con subsecciones independientes para cada esquema:

```json
"Jwt": {
    "Admin": {
        "Key": "<clave de 128+ bits para admin>",
        "Issuer": "mardelplata.gov.ar",
        "Audience": "mardelplata.gov.ar",
        "ExpirationHours": 1
    },
    "Votacion": {
        "Key": "<clave DIFERENTE de 128+ bits para votacion>",
        "Issuer": "foodtrucks-votacion",
        "Audience": "foodtrucks-votacion",
        "ExpirationMinutes": 30
    }
},
"Frontend": {
    "BaseUrl": "http://localhost:3005"
},
"Oidc": {
    "AuthorizeUrl": "https://localhost:7017/connect/authorize",
    "TokenUrl": "https://localhost:7017/connect/token",
    "UserInfoUrl": "https://localhost:7017/connect/userinfo",
    "ClientId": "foodtrucks",
    "ClientSecret": "secreto_municipal"
}
```

> **Importante:** Las claves son **diferentes** para que un token de votacion no pueda autenticar como admin y viceversa.

### 2.3. Doble Esquema JWT (`Startup.cs`)

Se configuraron dos esquemas de autenticacion JWT en el pipeline de ASP.NET Core:

```csharp
// Esquema default "Bearer" - para Administradores
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidIssuer = _config["Jwt:Admin:Issuer"],
            ValidAudience = _config["Jwt:Admin:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Admin:Key"])),
            // ...
        };
    })
    // Esquema "Votacion" - para Vecinos
    .AddJwtBearer("Votacion", options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidIssuer = _config["Jwt:Votacion:Issuer"],
            ValidAudience = _config["Jwt:Votacion:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Votacion:Key"])),
            // ...
        };
    });
```

### 2.4. Politicas de Autorizacion

| Politica | Esquemas Aceptados | Requisito | Uso |
|---|---|---|---|
| `AdminPolicy` | Bearer (Default) | Usuario autenticado | Gestion de usuarios, eliminacion de resenias |
| `VotacionPolicy` | Votacion | Usuario autenticado | Crear/editar resenias |

---

## 3. Flujos de Autenticacion

### 3.1. Flujo Admin (LDAP + JWT)

```
1. POST /Account/Login  { usuario, password }
2. AccountController valida credenciales contra Active Directory (LDAP)
3. Si es valido, llama a _tokenService.GenerateAdminToken(user)
4. Retorna: { token: "eyJ...", expiration: "2026-03-26T..." }
5. El frontend guarda el token y lo envia como: Authorization: Bearer <token>
```

### 3.2. Flujo Votacion (OIDC → JWT local)

```
1. GET /api/auth/login?idFT=56  (el vecino escanea el QR)
2. AuthController redirige al proveedor OIDC (MDQ Digital)
3. El vecino se autentica en MDQ Digital
4. MDQ Digital redirige a GET /api/auth/callback?code=xxx&state=yyy
5. AuthController intercambia el code por un access_token OIDC (server-to-server)
6. AuthController obtiene los datos del vecino (UserInfo)
7. AuthController llama a _tokenService.GenerateVotacionToken(idFT, userIdentifier, nombreUsuario)
8. AuthController redirige al frontend: GET /VotacionFT/56?token=eyJ...
9. El frontend lee el token del query parameter, lo guarda y lo envia como: Authorization: Bearer <token>
```

---

## 4. Cambios en Controladores

### 4.1. `AccountController.cs` — ANTES / DESPUES

```diff
- private IActionResult BuildToken()
- {
-     var claims = new[] { new Claim(ClaimTypes.Role, "Admin") };
-     var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.GetValue<string>("Ldap:Key")));
-     // ... 15 lineas de generacion
- }
+ // Inyeccion de dependencia
+ private readonly ITokenService _tokenService;
+
+ // Uso simplificado:
+ string token = _tokenService.GenerateAdminToken(user);
+ return Ok(new { token = token, expiration = DateTime.UtcNow.AddHours(1) });
```

### 4.2. `AuthController.cs` — Nuevo JWT local

```csharp
// Despues de validar identidad OIDC y generar token local:
string frontendBaseUrl = _config["Frontend:BaseUrl"] ?? "http://localhost:3005";
string redirectUrl = $"{frontendBaseUrl}/VotacionFT/{idFT}?token={votacionToken}";
return Redirect(redirectUrl);

// Todas las URLs de OIDC y el secreto se leen de _config["Oidc:..."]
// Ejemplo: var url = $"{_config["Oidc:AuthorizeUrl"]}?...";
```

### 4.3. `ReseniasController.cs` — Autorizacion granular

```csharp
[AllowAnonymous]                          // Lectura publica (GET)
[HttpGet("GetAll")]
public async Task<...> Get() { ... }

[Authorize(Policy = "VotacionPolicy")]    // Escritura: Solo Vecinos (Escaneo QR)
[HttpPost]
public async Task<...> Create([FromBody] FT_Resenias resenia) { ... }

[Authorize(Policy = "AdminPolicy")]       // Moderacion: Solo Admin (Login LDAP)
[HttpDelete("{IdResenia}")]
public async Task<IActionResult> Delete(int IdResenia) { ... }
```

---

## 5. Registro en Inyeccion de Dependencias (`Startup.cs`)

```csharp
services.AddScoped<ITokenService, TokenService>();
```

---

## 6. Tabla resumen de archivos

| Archivo | Cambio |
|---|---|
| `Services/TokenService/ITokenService.cs` | **[NUEVO]** Interfaz del servicio |
| `Services/TokenService/TokenService.cs` | **[NUEVO]** Implementacion con dos flujos |
| `appsettings.json` | Secciones `Jwt`, `Frontend` y `Oidc` (Parametrizacion) |
| `Startup.cs` | Doble esquema JWT + 2 politicas + registro DI |
| `Controllers/AccountController.cs` | Inyecta `ITokenService`, elimina `BuildToken()` |
| `Controllers/AuthController.cs` | Inyecta `ITokenService`, URLs parametrizadas |
| `Controllers/ReseniasController.cs` | Autorizacion granular por endpoint |

---

## 7. Ejemplo de uso desde el Frontend

### 7.1. Login Admin
```javascript
// POST a /Account/Login
const resp = await fetch('/Account/Login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario: 'jperez', password: '****' })
});
const { token } = await resp.json();
// Guardar token para futuras peticiones
localStorage.setItem('adminToken', token);
```

### 7.2. Crear Resenia (con token de votacion)
```javascript
// POST a /Resenias con el token obtenido del callback OIDC
const resp = await fetch('/Resenias', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${votacionToken}`
    },
    body: JSON.stringify({
        idFT: 56,
        idUsuario: 4,
        createdAt: new Date().toISOString(),
        comment: "Excelente atencion!",
        puntajes: [
            { idPregunta: 1, score: 5 },
            { idPregunta: 2, score: 4 }
        ]
    })
});
```

---
*Documentacion actualizada el 26 de marzo de 2026.*

### Mejora en la arquitectura: Separacion Estricta de Tokens
Se eliminaron los `RoleClaims` ("Admin", "Vecino") para simplificar los tokens. Ahora, la autorizacion se basa **exclusivamente en el esquema de autenticacion**:
- Un token generado para **Admin** (`Bearer`) **NO** puede usarse para votar (ya que `VotacionPolicy` solo acepta el esquema `Votacion`).
- Un token generado para **Vecino** (`Votacion`) **NO** puede usarse para administracion (ya que `AdminPolicy` solo acepta el esquema `Bearer`).

Esta separacion estricta mejora la seguridad al evitar que un token de un tipo sea mal utilizado en el otro flujo, sin depender de claims de rol que podrian solaparse.

> **Nota:** La politica `PoliticaAutorizacion` fue eliminada por ser redundante con `VotacionPolicy` (misma configuracion, sin uso en ningun controlador).
