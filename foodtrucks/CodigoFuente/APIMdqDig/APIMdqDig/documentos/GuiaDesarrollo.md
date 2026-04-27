# Desarrollo de Aplicación: API Mock OIDC (MDQ Digital)

Este documento detalla el desarrollo de la API simulada (`APIMdqDig`) creada en ASP.NET Core (Minimal API) orientada a suplantar la autenticación del proveedor oficial mediante flujos OIDC/PKCE.

## 1. Arquitectura Base
El proyecto se construyó utilizando las características de **Minimal APIs** introducidas en .NET 6+.
Todo el ruteo, inyección de dependencias y configuración (CORS, Swagger y Autenticación) ocurre directamente en `Program.cs`.

## 2. Base de Datos en Memoria (`MockDatabase`)
Para no depender de un conector a una base de datos real (SQL Server u Oracle) en el ambiente de desarrollo, se implementó el uso de los *records* nativos de C# almacenados en una lista estática en memoria.

```csharp
public record MockUser(string Cuil, string Password, string Nombre, string Apellido, string Email);

public static class MockDatabase
{
    public static List<MockUser> Vecinos = new()
    {
        // Usuarios iniciales de prueba
        new("20345678901", "password123", "Sebastian", "Sistemas", "seba@example.com"),
        ...
    };
}
```

## 3. Flujo de Autenticación Principal

El ciclo de la autenticación sigue de cerca el estándar OIDC utilizado por "MDQ Digital":

1. **`GET /connect/authorize`**: Valida los requerimientos de la especificación OIDC (ej. `S256` para `code_challenge_method`).
   - Muestra una pantalla de Login *HTML* estática al usuario. 
   - Si el usuario **ya se encuentra autenticado** (posee la sesión Cookie nativa), entonces saltea el formulario y auto-redirige al callback registrado devolviendo un `code`.

2. **`POST /login`**: Recibe las credenciales cargadas vía formulario HTML. 
   - Verifica que el usuario exista y la contraseña sea correcta en la `MockDatabase`.
   - Crea un **Code** criptográfico aleatorio y lo ata al `CUIL` del usuario de la sesión (`MockSessionStore`).
   - Usa `HttpContext.SignInAsync` para depositar la **cookie persistente de SSO** (Single Sign-On) en el navegador del usuario para futuras interacciones.
   - Redirige al `redirect_uri` de la SPA (Frontend) portando el `code` efímero.

3. **`POST /connect/token`**: El backend OIDC valida que el Code recibido no haya sido utilizado previamente, lo extrae de almacén `MockSessionStore` y efectiviza el canje por un nuevo Access Token. El sistema de prueba lo guarda nuevamente en su almacén `MockTokenStore` y vincula a dicho Access Token al CUIL real para consultas posteriores.

4. **`GET /connect/userinfo`**: Recibe internamente el Access Token depositado en las cabeceras (`Authorization: Bearer mock_access_...`). El método determina a qué usuario le pertenece mediante `MockTokenStore` y devuelve todos los "Claims" y datos requeridos por la SPA para considerarlo Logueado exitosamente.
