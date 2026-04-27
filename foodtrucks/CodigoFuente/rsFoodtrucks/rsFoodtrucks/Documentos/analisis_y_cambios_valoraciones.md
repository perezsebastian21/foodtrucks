# Análisis y Cambios: Valoraciones de Foodtrucks

## 1. Análisis Técnico

Se identificó la necesidad de exponer la calificación promedio de cada foodtruck en los listados de búsqueda (`FindQP`) y de ofrecer un detalle de reseñas por foodtruck, incluyendo control de visibilidad de comentarios.

### Estructura de Datos Involucrada
- **FT_Foodtrucks**: Entidad principal.
- **FT_Resenias**: Colección de reseñas asociadas al foodtruck. Incluye `Comment`, `Visible`, `Cuil`, `NombreUsuario` y referencias a `FT_Puntajes`.
- **FT_Puntajes**: Puntuaciones por pregunta asociadas a cada reseña (`IdResenia`, `IdPregunta`, `Score`).
- **FT_Preguntas**: Catálogo de preguntas de evaluación (`IdPregunta`, `Name`, `IsActive`).

---

## 2. Calificación Promedio en el Listado de Foodtrucks

### Objetivo
Exponer `CalificacionMedia` y `CantidadResenias` en el endpoint de búsqueda paginada `FindQP`, calculando el promedio directamente en la proyección LINQ para eficiencia en base de datos.

### Cambios
- **`DTOs/FoodtruckRatingDto.cs`** *(nuevo)*: DTO con campos `IdFT`, `NombreFantasia`, `Logo`, `CalificacionMedia` y `CantidadResenias`.
- **`IFoodtruckService`**: Se añadió `Task<IEnumerable<FoodtruckRatingDto>> FindByWithRating(QueryParams qp)`.
- **`FoodtruckService`**: Implementación con proyección LINQ:
  ```csharp
  CalificacionMedia = x.Resenias.SelectMany(r => r.Puntajes).Any()
      ? Math.Round(x.Resenias.SelectMany(r => r.Puntajes).Average(p => p.Score), 1)
      : 0
  ```
- **`FoodtruckController`**: El endpoint `GET /Foodtruck/FindQP` ahora usa `FindByWithRating`.

---

## 3. Resumen de Reseñas por Foodtruck

### Objetivo
Permitir que el frontend muestre, dado un ID de Foodtruck, la lista de comentarios visibles y el promedio agrupado por cada pregunta evaluada.

> **Regla de negocio clave**: Los comentarios con `Visible = "N"` no se muestran, pero sus puntajes **sí se incluyen** en el cálculo del promedio.

### Cambios
- **`ComentarioDto`**: Enriquecido con `IdResenia` y `Visible` para que el endpoint admin exponga el estado de cada comentario y permita disparar acciones de gestión.
- **`DTOs/FoodtruckResumenReseniasDto.cs`** *(nuevo)*: Contiene:
  - `NombreFT` (nombre de fantasía del foodtruck).
  - `List<ComentarioDto>` (idResenia, usuario, comentario, fecha, visible).
  - `List<PreguntaPromedioDto>` (idPregunta, nombre, promedio) — sobre **todas** las reseñas.
- **`IReseniasService` & `ReseniasService`**:
  - `GetResumenByFoodtruck(int idFt)`: Filtra comentarios con `Visible = "S"`. Puntajes sin filtro.
  - `GetResumenAdminByFoodtruck(int idFt)`: Sin filtro de visibilidad en comentarios — devuelve todos con `IdResenia` y `Visible`.
- **`ReseniasController`**:

| Endpoint | Auth | Descripción |
|---|---|---|
| `GET /Resenias/ByFoodtruck/{idFt}/Summary` | Anónimo | Solo comentarios visibles (`Visible = "S"`) |
| `GET /Resenias/ByFoodtruck/{idFt}/SummaryAdmin` | `AdminPolicy` | Todos los comentarios con estado `Visible` e `IdResenia` |

---

## 4. Campo "Visible" en Reseñas

### Objetivo
Permitir que el administrador oculte comentarios inapropiados sin afectar los puntajes ni el promedio del Foodtruck.

### Cambios en el Modelo
- **`FT_Resenias`**: Se añadió `[Column(TypeName = "char(1)")] public string Visible { get; set; } = "S";`
- **Script de migración manual**: `Documentos/Script_Migracion_Resenia_Visible.sql`

### Endpoint para Alternar Visibilidad (CambiarVisibilidad)
Se eligió `PATCH` (modificación parcial) sobre `PUT` porque solo se altera la visibilidad. El endpoint actúa como un interruptor ("S" a "N" y viceversa).

> **Patrón respetado**: La implementación va exclusivamente a través del `IRepositoryAsync<FT_Resenias>`.

- **`IReseniasService`**: Firma `Task CambiarVisibilidad(int idResenia);`
- **`ReseniasService`**: Busca con `_repository.GetByID()`, alterna el valor de `Visible`, persiste con `_repository.Update()`.
- **`ReseniasController`**: `PATCH /Resenias/{IdResenia}/CambiarVisibilidad` protegido por `AdminPolicy`.

```
PATCH /Resenias/{IdResenia}/CambiarVisibilidad
Authorization: Bearer {admin_token}
```

### Nota Técnica: Persistencia Genérica (`RepositoryAsync.Update`)
Durante la implementación y pruebas de esta función, evaluamos el funcionamiento del método base `Update` en `RepositoryAsync`. 
Se confirmó que el repositorio se mantiene con su versión simple: `context.Entry(entity).State = EntityState.Modified;`, siendo esto la decisión arquitectónica correcta. Los intentos de usar Reflection con LINQ introducidos de forma experimental en versiones del 3 de Julio de 2025 resultaban en código incompatible con la traducción de consultas SQL y por lo tanto fueron revertidos de forma definitiva. La lógica compleja de las relaciones se maneja individualmente en cada Servicio (p.ej. `FoodtruckService`), dejando al repositorio genérico solo operaciones escalares atómicas como alternar un valor "Visible".

---

## 5. Inclusión del CUIT y Nombre de Usuario en Token de Votación

Se modificó el flujo de autenticación OIDC para incluir tanto el CUIT como el nombre del usuario en el token JWT de votación:
- **`AuthController`**: Las propiedades `cuit` y `nombreUsuario` se extraen del endpoint `/userinfo` vía `UserInfoModel` y se pasan al servicio de tokens:
  ```csharp
  string votacionToken = _tokenService.GenerateVotacionToken(idFT, cuit, nombreUsuario);
  ```
- **`TokenService`**: Recibe `cuit` y `nombreUsuario`, incluyéndolos como Claims en el JWT del vecino:
    `IdFoodtruck` ← `idFT` (identificador único del foodtruck)
  - `cuit` ← `cuit` (identificador único del vecino)
  - `nombreUsuario` ← `nombreUsuario` (nombre para mostrar en la UI / reseña)

  esto se envia luego en los claims

---

## 6. Limitador de Votos por Foodtruck y Usuario

### Objetivo
Evitar que un mismo usuario pueda emitir múltiples reseñas para el mismo Foodtruck dentro de un período configurable (por defecto: **6 meses**).

### Diseño
La validación se intercepta en la **capa de servicio** (`ReseniasService.Create`) antes de persistir. Si existe un voto previo del mismo `Cuil` para el mismo `IdFT` dentro del período, se lanza `BadRequestException` → HTTP 400. El controlador y el repositorio no requieren cambios.

El período es parametrizable sin necesidad de redespliegue modificando `appsettings.json`.

### Cambios realizados

| Archivo | Cambio |
|---|---|
| `appsettings.json` | Nueva sección `"VotacionConfig": { "MesesBloqueo": 6 }` |
| `Models/VotacionConfig.cs` | *(nuevo)* Clase POCO para strongly-typed config |
| `Startup.cs` | `services.Configure<VotacionConfig>(_config.GetSection("VotacionConfig"))` |
| `ReseniasService.cs` | Inyección de `IOptions<VotacionConfig>` + consulta `AnyAsync` previa al `Insert` |

### Lógica de validación
```csharp
int meses = _config.GetValue<int>("VotacionConfig:MesesBloqueo", 6);
var desde = DateTime.UtcNow.AddMonths(-meses);

var votoExistente = await _context.Set<FT_Resenias>()
    .AnyAsync(r => r.IdFT == resenia.IdFT
                && r.Cuil == resenia.Cuil
                && r.CreatedAt >= desde);

if (votoExistente)
    throw new BadRequestException(
        $"El usuario ya ha votado este foodtruck en los últimos {meses} meses.");
```

> **Nota:** Se usa `_context.AnyAsync()` directamente porque el repositorio genérico no expone un método `AnyAsync`. Al ser una consulta de solo lectura sin navegaciones complejas, es coherente con el patrón ya establecido en el servicio.

---

## 7. Formateo de Fecha en Exportación Excel

### Objetivo
Garantizar que el campo `FechaVencimiento` y cualquier otro campo de fecha se visualicen con el formato de fecha correcto (`dd/mm/yyyy`) al generar el archivo Excel de Foodtrucks (`/Foodtruck/ExportXLS`), evitando que se exporten con la hora o como texto genérico, lo que dificulta su uso posterior en Excel.

### Cambios en Controlador
- **`FoodtruckController`**: Se actualizó el método `ExportXLS` para aplicar el formato nativo de celdas que provee la librería **EPPlus**:
  ```csharp
  if (property.Name == "FechaVencimiento" || property.PropertyType == typeof(DateTime) || property.PropertyType == typeof(DateTime?))
  {
      worksheet.Cells[row, column].Style.Numberformat.Format = "dd/MM/yyyy";
  }
  ```
  Esto aplica la configuración a nivel de libro electrónico (celda) permitiendo un ordenamiento natural de fechas y estandarizada la visualización del listado para los usuarios.

---

## 8. Generación, Guardado y Descarga de Código QR

### Objetivo
Generar automáticamente un código QR (imagen PNG) para cada foodtruck al momento de su alta, almacenarlo en base de datos, y exponer endpoints para su generación manual y descarga. El QR codifica la URL de inicio del flujo de votación OIDC: `{BaseUrl}/api/auth/login?idFT={idFT}`.

### Dependencia
- **Paquete NuGet**: `QRCoder` v1.4.3 — se utiliza `PngByteQRCode` (cross-platform, sin dependencia de `System.Drawing.Common`).

### Cambios en el Modelo
- **`FT_Foodtrucks`**: Se añadió `public byte[]? QrCode { get; set; }`.
- **`ApplicationDbContext`**: Configuración Fluent API: `HasColumnType("bytea")`, `IsRequired(false)`.
- **Script de migración manual**: `Documentos/Script_Migracion_QrCode.sql`
  ```sql
  ALTER TABLE public."FT_Foodtrucks" ADD COLUMN IF NOT EXISTS "QrCode" bytea;
  ```

### Servicio (`Services/QrCodeService/`)

| Método | Descripción |
|---|---|
| `GenerarQr(int idFT)` | Genera el QR como `byte[]` PNG a partir de la URL ofuscada del flujo de votación |
| `GenerarYGuardarQr(int idFT)` | Obtiene el QR de la base de datos si existe, sino lo genera, lo guarda en la columna `QrCode` y lo devuelve |

La URL base se lee de `Backend:BaseUrl` en `appsettings.json`. Y se codifica el parámetro `idFT` convirtiéndolo en `r` ofuscado.

### Generación Automática en el Alta
Ambas sobrecargas de `FoodtruckService.Create` generan el QR dentro de una **transacción explícita**:

1. Se inserta el foodtruck (`_repository.Add` / `AddWithImage`) — EF Core asigna el `IdFT` tras el `SaveChanges` interno.
2. Se genera el QR en memoria con el ID real: `foodtruck.QrCode = _qrCodeService.GenerarQr(foodtruck.IdFT)`.
3. Se persiste el QR con `_context.SaveChangesAsync()`.
4. Se confirma la transacción.

```csharp
using var transaction = await _context.Database.BeginTransactionAsync();
try
{
    await _repository.Add(foodtruck);
    foodtruck.QrCode = _qrCodeService.GenerarQr(foodtruck.IdFT);
    await _context.SaveChangesAsync();
    await transaction.CommitAsync();
}
catch (Exception ex)
{
    await transaction.RollbackAsync();
    throw;
}
```

> **Nota**: `GenerarQr(int idFT)` es una función pura que solo genera el `byte[]` PNG sin tocar la BD. `GenerarYGuardarQr` se mantiene únicamente para el endpoint manual `POST /Foodtruck/{id}/GenerarQR` (foodtrucks preexistentes sin QR).

### Endpoints Nuevos

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/Foodtruck/{IdFT}/QR` | Admin | Devuelve el archivo PNG de QR a administradores (si el foodtruck no tiene uno, lo autogenera y persiste en BD transparente) |

### Registro DI (`Startup.cs`)
```csharp
services.AddScoped<IQrCodeService, QrCodeService>();
```

### Archivos involucrados

| Archivo | Cambio |
|---|---|
| `rsFoodtrucks.csproj` | Paquete `QRCoder` v1.4.3 |
| `Models/FT_Foodtrucks.cs` | Propiedad `byte[]? QrCode` |
| `Models/ApplicationDbContext.cs` | Config Fluent API columna `QrCode` |
| `Documentos/Script_Migracion_QrCode.sql` | **[NUEVO]** Script DDL |
| `Services/QrCodeService/IQrCodeService.cs` | **[NUEVO]** Interfaz |
| `Services/QrCodeService/QrCodeService.cs` | **[NUEVO]** Implementación + ofuscación de ID en URL |
| `Controllers/FoodtruckController.cs` | 1 endpoint (`/QR`) con `[Authorize(Policy = "AdminPolicy")]` + inyección `IQrCodeService` |
| `Services/FoodtruckService/FoodtruckService.cs` | Auto-generación QR en `Create` (transaccional) |
| `Startup.cs` | Registro DI + `using` |

### Ejemplos de uso

**Descargar/Generar QR del foodtruck con ID 56:**
```
GET http://localhost:40930/Foodtruck/56/QR
Authorization: Bearer {admin_token}
```
→ Retorna un archivo `qr_foodtruck_56.png` con content-type `image/png`.

---

## 9. Ofuscación de URL de Votación

### Objetivo
Ocultar el identificador numérico interno (`idFT`) del foodtruck en la URL pública que se incluye en el QR de votación y renombrarlo como un parámetro genérico `r`, dificultando la manipulación de IDs y enmascarando que se trata del ID central del objecto en la base de datos.
La URL resultante del QR pasará de ser:
`http://localhost:40930/api/auth/login?idFT=8`
a algo como:
`http://localhost:40930/api/auth/login?r=YTph...`

### Implementación
- **`Utility/IdObfuscator.cs`**: Clase estática nueva encargada de codificar (`Encode`) y decodificar (`Decode`) utilizando una operación XOR bit a bit combinada con la representación Base64Url-safe.
- **`appsettings.json`**: Se agregó una seccion `Obfuscation:Key` con una clave secreta que se usa para alterar los bytes del identificador aplicando XOR.
- **`Controllers/AuthController.cs`**: 
  - Se modificó la acción `[HttpGet("login")]`. 
  - El parámetro original `[FromQuery] int idFT` fue reemplazado por `[FromQuery] string r`.
  - Se implementó la desencriptación del ID utilizando `IdObfuscator.Decode(r, key)` envuelto en un bloque `try-catch`. Si la URL ha sido adulterada, se retorna un `BadRequest`.
- **`Services/QrCodeService/QrCodeService.cs`**: Se actualizó la manera de construir la URL que codifica el QR llamando a `IdObfuscator.Encode(idFT, key)` e insertándolo en el parámetro `?r=`.

---

## 10. Eliminación de Campos de Fotos Espaciales

### Objetivo
Simplificar el modelo de datos de la gestión de Foodtrucks quitando los campos `FtTrasera`, `FtIzquierda` y `FtDerecha` desde la capa de exposición (DTOs) hasta la base de datos, manteniéndose únicamente `FtFrente`.

### Cambios Aplicados
- **`Models/FT_Foodtrucks.cs`**: Se removieron las propiedades `byte[]` de fotos (trasera e inferiores).
- **`DTOs/FT_FoodtrucksDTO.cs`**: Se removieron las propiedades de tipo `IFormFile` asociadas.
- **`Mapping/AutoMapperProfiles/FoodtruckProfile.cs`**: Se eliminó la configuración que ignoraba el mapeo de estas propiedades.
- **`Models/ApplicationDbContext.cs`**: Se removió la configuración de Entity Framework para estas columnas.
- **Script SQL generado**: `Documentos/Drop_FtFotos_Columns.sql` provisto para eliminar las columnas de la BD productiva sin usar un migration automático.

---

## 11. Estado Inicial de Foodtruck ("R")
---

## 5. Inclusión del CUIT y Nombre de Usuario en Token de Votación

Se modificó el flujo de autenticación OIDC para incluir tanto el CUIT como el nombre del usuario en el token JWT de votación:
- **`AuthController`**: Las propiedades `cuit` y `nombreUsuario` se extraen del endpoint `/userinfo` vía `UserInfoModel` y se pasan al servicio de tokens:
  ```csharp
  string votacionToken = _tokenService.GenerateVotacionToken(idFT, cuit, nombreUsuario);
  ```
- **`TokenService`**: Recibe `cuit` y `nombreUsuario`, incluyéndolos como Claims en el JWT del vecino:
    `IdFoodtruck` ← `idFT` (identificador único del foodtruck)
  - `cuit` ← `cuit` (identificador único del vecino)
  - `nombreUsuario` ← `nombreUsuario` (nombre para mostrar en la UI / reseña)

  esto se envia luego en los claims

---

## 6. Limitador de Votos por Foodtruck y Usuario

### Objetivo
Evitar que un mismo usuario pueda emitir múltiples reseñas para el mismo Foodtruck dentro de un período configurable (por defecto: **6 meses**).

### Diseño
La validación se intercepta en la **capa de servicio** (`ReseniasService.Create`) antes de persistir. Si existe un voto previo del mismo `Cuil` para el mismo `IdFT` dentro del período, se lanza `BadRequestException` → HTTP 400. El controlador y el repositorio no requieren cambios.

El período es parametrizable sin necesidad de redespliegue modificando `appsettings.json`.

### Cambios realizados

| Archivo | Cambio |
|---|---|
| `appsettings.json` | Nueva sección `"VotacionConfig": { "MesesBloqueo": 6 }` |
| `Models/VotacionConfig.cs` | *(nuevo)* Clase POCO para strongly-typed config |
| `Startup.cs` | `services.Configure<VotacionConfig>(_config.GetSection("VotacionConfig"))` |
| `ReseniasService.cs` | Inyección de `IOptions<VotacionConfig>` + consulta `AnyAsync` previa al `Insert` |

### Lógica de validación
```csharp
int meses = _config.GetValue<int>("VotacionConfig:MesesBloqueo", 6);
var desde = DateTime.UtcNow.AddMonths(-meses);

var votoExistente = await _context.Set<FT_Resenias>()
    .AnyAsync(r => r.IdFT == resenia.IdFT
                && r.Cuil == resenia.Cuil
                && r.CreatedAt >= desde);

if (votoExistente)
    throw new BadRequestException(
        $"El usuario ya ha votado este foodtruck en los últimos {meses} meses.");
```

> **Nota:** Se usa `_context.AnyAsync()` directamente porque el repositorio genérico no expone un método `AnyAsync`. Al ser una consulta de solo lectura sin navegaciones complejas, es coherente con el patrón ya establecido en el servicio.

---

## 7. Formateo de Fecha en Exportación Excel

### Objetivo
Garantizar que el campo `FechaVencimiento` y cualquier otro campo de fecha se visualicen con el formato de fecha correcto (`dd/mm/yyyy`) al generar el archivo Excel de Foodtrucks (`/Foodtruck/ExportXLS`), evitando que se exporten con la hora o como texto genérico, lo que dificulta su uso posterior en Excel.

### Cambios en Controlador
- **`FoodtruckController`**: Se actualizó el método `ExportXLS` para aplicar el formato nativo de celdas que provee la librería **EPPlus**:
  ```csharp
  if (property.Name == "FechaVencimiento" || property.PropertyType == typeof(DateTime) || property.PropertyType == typeof(DateTime?))
  {
      worksheet.Cells[row, column].Style.Numberformat.Format = "dd/MM/yyyy";
  }
  ```
  Esto aplica la configuración a nivel de libro electrónico (celda) permitiendo un ordenamiento natural de fechas y estandarizada la visualización del listado para los usuarios.

---

## 8. Generación, Guardado y Descarga de Código QR

### Objetivo
Generar automáticamente un código QR (imagen PNG) para cada foodtruck al momento de su alta, almacenarlo en base de datos, y exponer endpoints para su generación manual y descarga. El QR codifica la URL de inicio del flujo de votación OIDC: `{BaseUrl}/api/auth/login?idFT={idFT}`.

### Dependencia
- **Paquete NuGet**: `QRCoder` v1.4.3 — se utiliza `PngByteQRCode` (cross-platform, sin dependencia de `System.Drawing.Common`).

### Cambios en el Modelo
- **`FT_Foodtrucks`**: Se añadió `public byte[]? QrCode { get; set; }`.
- **`ApplicationDbContext`**: Configuración Fluent API: `HasColumnType("bytea")`, `IsRequired(false)`.
- **Script de migración manual**: `Documentos/Script_Migracion_QrCode.sql`
  ```sql
  ALTER TABLE public."FT_Foodtrucks" ADD COLUMN IF NOT EXISTS "QrCode" bytea;
  ```

### Servicio (`Services/QrCodeService/`)

| Método | Descripción |
|---|---|
| `GenerarQr(int idFT)` | Genera el QR como `byte[]` PNG a partir de la URL ofuscada del flujo de votación |
| `GenerarYGuardarQr(int idFT)` | Obtiene el QR de la base de datos si existe, sino lo genera, lo guarda en la columna `QrCode` y lo devuelve |

La URL base se lee de `Backend:BaseUrl` en `appsettings.json`. Y se codifica el parámetro `idFT` convirtiéndolo en `r` ofuscado.

### Generación Automática en el Alta
Ambas sobrecargas de `FoodtruckService.Create` generan el QR dentro de una **transacción explícita**:

1. Se inserta el foodtruck (`_repository.Add` / `AddWithImage`) — EF Core asigna el `IdFT` tras el `SaveChanges` interno.
2. Se genera el QR en memoria con el ID real: `foodtruck.QrCode = _qrCodeService.GenerarQr(foodtruck.IdFT)`.
3. Se persiste el QR con `_context.SaveChangesAsync()`.
4. Se confirma la transacción.

```csharp
using var transaction = await _context.Database.BeginTransactionAsync();
try
{
    await _repository.Add(foodtruck);
    foodtruck.QrCode = _qrCodeService.GenerarQr(foodtruck.IdFT);
    await _context.SaveChangesAsync();
    await transaction.CommitAsync();
}
catch (Exception ex)
{
    await transaction.RollbackAsync();
    throw;
}
```

> **Nota**: `GenerarQr(int idFT)` es una función pura que solo genera el `byte[]` PNG sin tocar la BD. `GenerarYGuardarQr` se mantiene únicamente para el endpoint manual `POST /Foodtruck/{id}/GenerarQR` (foodtrucks preexistentes sin QR).

### Endpoints Nuevos

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/Foodtruck/{IdFT}/QR` | Admin | Devuelve el archivo PNG de QR a administradores (si el foodtruck no tiene uno, lo autogenera y persiste en BD transparente) |

### Registro DI (`Startup.cs`)
```csharp
services.AddScoped<IQrCodeService, QrCodeService>();
```

### Archivos involucrados

| Archivo | Cambio |
|---|---|
| `rsFoodtrucks.csproj` | Paquete `QRCoder` v1.4.3 |
| `Models/FT_Foodtrucks.cs` | Propiedad `byte[]? QrCode` |
| `Models/ApplicationDbContext.cs` | Config Fluent API columna `QrCode` |
| `Documentos/Script_Migracion_QrCode.sql` | **[NUEVO]** Script DDL |
| `Services/QrCodeService/IQrCodeService.cs` | **[NUEVO]** Interfaz |
| `Services/QrCodeService/QrCodeService.cs` | **[NUEVO]** Implementación + ofuscación de ID en URL |
| `Controllers/FoodtruckController.cs` | 1 endpoint (`/QR`) con `[Authorize(Policy = "AdminPolicy")]` + inyección `IQrCodeService` |
| `Services/FoodtruckService/FoodtruckService.cs` | Auto-generación QR en `Create` (transaccional) |
| `Startup.cs` | Registro DI + `using` |

### Ejemplos de uso

**Descargar/Generar QR del foodtruck con ID 56:**
```
GET http://localhost:40930/Foodtruck/56/QR
Authorization: Bearer {admin_token}
```
→ Retorna un archivo `qr_foodtruck_56.png` con content-type `image/png`.

---

## 9. Ofuscación de URL de Votación

### Objetivo
Ocultar el identificador numérico interno (`idFT`) del foodtruck en la URL pública que se incluye en el QR de votación y renombrarlo como un parámetro genérico `r`, dificultando la manipulación de IDs y enmascarando que se trata del ID central del objecto en la base de datos.
La URL resultante del QR pasará de ser:
`http://localhost:40930/api/auth/login?idFT=8`
a algo como:
`http://localhost:40930/api/auth/login?r=YTph...`

### Implementación
- **`Utility/IdObfuscator.cs`**: Clase estática nueva encargada de codificar (`Encode`) y decodificar (`Decode`) utilizando una operación XOR bit a bit combinada con la representación Base64Url-safe.
- **`appsettings.json`**: Se agregó una seccion `Obfuscation:Key` con una clave secreta que se usa para alterar los bytes del identificador aplicando XOR.
- **`Controllers/AuthController.cs`**: 
  - Se modificó la acción `[HttpGet("login")]`. 
  - El parámetro original `[FromQuery] int idFT` fue reemplazado por `[FromQuery] string r`.
  - Se implementó la desencriptación del ID utilizando `IdObfuscator.Decode(r, key)` envuelto en un bloque `try-catch`. Si la URL ha sido adulterada, se retorna un `BadRequest`.
- **`Services/QrCodeService/QrCodeService.cs`**: Se actualizó la manera de construir la URL que codifica el QR llamando a `IdObfuscator.Encode(idFT, key)` e insertándolo en el parámetro `?r=`.

---

## 10. Eliminación de Campos de Fotos Espaciales

### Objetivo
Simplificar el modelo de datos de la gestión de Foodtrucks quitando los campos `FtTrasera`, `FtIzquierda` y `FtDerecha` desde la capa de exposición (DTOs) hasta la base de datos, manteniéndose únicamente `FtFrente`.

### Cambios Aplicados
- **`Models/FT_Foodtrucks.cs`**: Se removieron las propiedades `byte[]` de fotos (trasera e inferiores).
- **`DTOs/FT_FoodtrucksDTO.cs`**: Se removieron las propiedades de tipo `IFormFile` asociadas.
- **`Mapping/AutoMapperProfiles/FoodtruckProfile.cs`**: Se eliminó la configuración que ignoraba el mapeo de estas propiedades.
- **`Models/ApplicationDbContext.cs`**: Se removió la configuración de Entity Framework para estas columnas.
- **Script SQL generado**: `Documentos/Drop_FtFotos_Columns.sql` provisto para eliminar las columnas de la BD productiva sin usar un migration automático.

---

## 11. Estado Inicial de Foodtruck ("R")

### Objetivo
Asegurar que cada vez que se crea un nuevo registro de Foodtruck dentro del sistema (sin importar desde qué cliente o interfaz provenga), el estado del mismo inicie como Pendiente de Revisión (`"R"`), bloqueando valores por defecto inesperados u opcionales enviados desde el front.

### Cambios Aplicados
- **`Services/FoodtruckService/FoodtruckService .cs`**:
  - Se agregó la sentencia de forzado de estado `foodtruck.Estado = "R";` al comienzo de las dos sobrecargas del método principal `Create` (`Create(foodtruck)` y `Create(foodtruck, categoriasIds)`). De esta manera, el estado queda estandarizado del lado del backend sin requerir cambios en el esquema de base de datos o migraciones de Entity Framework.

---

## 12. Replicación de la Lógica de Correo y Observaciones para Estado "Eliminado" ("E")

### Objetivo
Extender el comportamiento de notificación automática y carga de motivos (observaciones) reservada inicialmente para Foodtrucks suspendidos, para que soporte también a los Foodtrucks dados de baja definitivamente (estado `"E"`).

### Cambios Aplicados
- **`Services/FoodtruckService/FoodtruckService .cs`**:
  - Se ajustó el reseteo de la propiedad `Observaciones` durante las ediciones. Si el estado es `"S"` o `"E"`, ya no se vacían las observaciones `(if (foodtruck.Estado != "S" && foodtruck.Estado != "E"))`.
  - Se expandió la validación de envío de e-mail usando interpolación para ajustar dinámicamente tanto la acción como el verbo utilizado en el Asunto y el Cuerpo del correo (informando "suspendido" vs "dado de baja") basado en el código resultante para ese Foodtruck.
