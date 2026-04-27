# Ejemplos de Invocación y Prueba (OIDC/PKCE Mock)

A continuación se incluyen los pasos técnicos detallados para probar manualmente o mediante herramientas tipo **Postman**/**cURL** la API Mock implementada localmente para replicar el comportamiento de "MDQ Digital".

## Paso 1: Inicializar la Autenticación y Ver el Login (GET `/connect/authorize`)
La aplicación cliente (SPA o Backend) construirá una URL hacia el IdP.
Si lo probáramos en el navegador directamente para ver el formulario HTML de inicitación, sería con la siguiente URL:

```http
http://localhost:5000/connect/authorize?client_id=foodtrucks_frontend&redirect_uri=http://localhost:3000/callback&response_type=code&scope=openid profile email&state=estado_sesion_123&nonce=12345&code_challenge=xyz789&code_challenge_method=S256
```

## Paso 2: Ejecutar Login (POST `/login`)
Una vez en la pantalla de login (paso 1), el navegador envía un `POST` cuando envías el formulario que impacta localmente. Los valores se envían como `x-www-form-urlencoded`.
Ejemplo con **cURL**:

```bash
curl -X POST http://localhost:5000/login \
  -d "cuil=20345678901" \
  -d "password=password123" \
  -d "client_id=foodtrucks_frontend" \
  -d "redirect_uri=http://localhost:3000/callback" \
  -d "state=estado_sesion_123" \
  -d "nonce=12345" \
  -d "code_challenge=xyz789" \
  -d "code_challenge_method=S256"
```
**Respuesta:** En la cabecera recibirás la cookie `MDQMock.Session` persistente y un `Location` 302 que te envía al Redirect URI devolviendo el Code aleatorio emitido. Ej: `http://localhost:3000/callback?code=AUTH-ABC123DEF4&state=estado_sesion_123()`


## Paso 3: Retirar Access Token con el Authorization Code (POST `/connect/token`)
Con el código efímero obtenido en la redirección, el backend que recibe el callback debe canjearlo enviándolo rápidamente en un POST al endpoint de Token.
Ejemplo con **cURL**:

```bash
curl -X POST http://localhost:5000/connect/token \
  -d "grant_type=authorization_code" \
  -d "client_id=foodtrucks_frontend" \
  -d "client_secret=secret" \
  -d "code=AUTH-ABC123DEF4" \
  -d "redirect_uri=http://localhost:3000/callback" \
  -d "code_verifier=xyz789_verificador_desencriptado_aca"
```
**Respuesta esperada (JSON):**
```json
{
  "access_token": "mock_access_028bc94...",
  "token_type": "Bearer",
  "expires_in": 18000,
  "id_token": "eyJhbG..signature"
}
```

## Paso 4: Obtener los Datos del Perfil (GET `/connect/userinfo`)
Finalmente, con el Access Token extraído del paso 3, envías una petición con clave Bearer para pedir el perfil del vecino logueado.
Ejemplo con **cURL**:

```bash
curl -X GET http://localhost:5000/connect/userinfo \
  -H "Authorization: Bearer mock_access_028bc94..."
```
**Respuesta esperada (JSON):**
```json
{
  "sub": "23fa...",
  "name": "Sebastian Sistemas",
  "given_name": "Sebastian",
  "family_name": "Sistemas",
  "email": "seba@example.com",
  "email_verified": true,
  "cuit": "20345678901"
}
```
