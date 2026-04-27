# Plan de Implementación: Envío de Correo por Suspensión de Foodtruck

## Descripción

Implementar el envío de correo electrónico cuando un foodtruck es **suspendido** (Estado = `"S"`), notificando al titular las observaciones de la baja. Se sigue el patrón documentado del `MailService` de APISalud, que inserta en una cola de emails mediante el stored procedure `dbo.ADD_ColaEmails` en la base de datos `MGP015`.

## Decisiones de Diseño Confirmadas

| Punto | Decisión |
|-------|----------|
| Condición línea 140 | Se corrige a `== "S"` (enviar cuando el estado ES Suspendido) |
| Conexión a BD | **ODBC obligatorio** — SQL Server 2005, Entity Framework no funciona dentro del Docker |
| Connection string (TEST) | `Driver={ODBC Driver 17 for SQL Server};Server=192.168.254.151,1433;Database=MGP015DataBaseTEST;Uid=udesa;Pwd=r16UCXnj14;TrustServerCertificate=Yes;Encrypt=No;` |
| Connection string (PROD) | `Driver={ODBC Driver 17 for SQL Server};Server=192.168.0.151,1433;Database=MGP015DataBase;Uid=uappsvarias;Pwd=apps2013;Encrypt=No;TrustServerCertificate=Yes;` |
| Paquete NuGet | Se requiere agregar `System.Data.Odbc` al `.csproj` |

## Cambios Propuestos

### Componente: Utility (Nuevos archivos reutilizables)

---

#### [NEW] [MailModel.cs](file:///c:/DesarrolloGIT/foodtrucks/CodigoFuente/rsFoodtrucks/rsFoodtrucks/Utility/MailModel.cs)

DTO para los datos del correo electrónico:

```csharp
namespace rsFoodtrucks.Utility
{
    public class MailModel
    {
        public string Origen { get; set; }
        public string OrigenNombre { get; set; }
        public string Destinatario { get; set; }
        public string Asunto { get; set; }
        public string Cuerpo { get; set; }
    }
}
```

---

#### [NEW] [IMailService.cs](file:///c:/DesarrolloGIT/foodtrucks/CodigoFuente/rsFoodtrucks/rsFoodtrucks/Utility/IMailService.cs)

Interfaz del servicio de correo:

```csharp
using System.Threading.Tasks;

namespace rsFoodtrucks.Utility
{
    public interface IMailService
    {
        Task SendAsync(MailModel mail);
    }
}
```

---

#### [NEW] [MailService.cs](file:///c:/DesarrolloGIT/foodtrucks/CodigoFuente/rsFoodtrucks/rsFoodtrucks/Utility/MailService.cs)

Implementación que ejecuta `dbo.ADD_ColaEmails` via **ODBC** (requerido por compatibilidad con SQL Server 2005 en Docker):

```csharp
using System.Data.Odbc;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace rsFoodtrucks.Utility
{
    public class MailService : IMailService
    {
        private readonly string _connectionString;
        private readonly ILogger<MailService> _logger;

        public MailService(IConfiguration configuration, ILogger<MailService> logger)
        {
            _connectionString = configuration.GetConnectionString("MGP015");
            _logger = logger;
        }

        public async Task SendAsync(MailModel mail)
        {
            using OdbcConnection conn = new(_connectionString);
            await conn.OpenAsync();

            string sql = "EXEC dbo.ADD_ColaEmails ?, ?, ?, ?, ?";
            using OdbcCommand cmd = new(sql, conn);

            cmd.Parameters.Add(new OdbcParameter { Value = mail.Origen });
            cmd.Parameters.Add(new OdbcParameter { Value = mail.OrigenNombre });
            cmd.Parameters.Add(new OdbcParameter { Value = mail.Destinatario });
            cmd.Parameters.Add(new OdbcParameter { Value = mail.Asunto });
            cmd.Parameters.Add(new OdbcParameter { Value = mail.Cuerpo });

            await cmd.ExecuteNonQueryAsync();
            _logger.LogInformation("Email encolado para: {Destinatario}", mail.Destinatario);
        }
    }
}
```

---

### Componente: Dependencias NuGet

---

#### [MODIFY] [rsFoodtrucks.csproj](file:///c:/DesarrolloGIT/foodtrucks/CodigoFuente/rsFoodtrucks/rsFoodtrucks/rsFoodtrucks.csproj)

Agregar paquete `System.Data.Odbc`:

```diff
 <PackageReference Include="System.Text.Json" Version="6.0.7" />
+<PackageReference Include="System.Data.Odbc" Version="4.7.0" />
```

> Se usa versión `4.7.0` por compatibilidad con `.NET Core 3.1`.

---

### Componente: Configuración

---

#### [MODIFY] [appsettings.json](file:///c:/DesarrolloGIT/foodtrucks/CodigoFuente/rsFoodtrucks/rsFoodtrucks/appsettings.json)

Agregar connection string `MGP015` (ODBC) para el servicio de correo. Entorno de **test**:

```diff
 "ConnectionStrings": {
     "MGP015DataBase": "server=MGP026....",
-    "PLSQL": "User ID=..."
+    "PLSQL": "User ID=...",
+    "MGP015": "Driver={ODBC Driver 17 for SQL Server};Server=192.168.254.151,1433;Database=MGP015DataBaseTEST;Uid=udesa;Pwd=r16UCXnj14;TrustServerCertificate=Yes;Encrypt=No;"
 }
```

---

### Componente: Registro de Dependencias

---

#### [MODIFY] [Startup.cs](file:///c:/DesarrolloGIT/foodtrucks/CodigoFuente/rsFoodtrucks/rsFoodtrucks/Startup.cs)

1. Agregar `using rsFoodtrucks.Utility;`
2. Registrar `IMailService` como servicio Scoped:

```diff
 services.AddScoped<ICategoriaService, CategoriaService>();
+services.AddScoped<IMailService, MailService>();
```

---

### Componente: FoodtruckService (Integración)

---

#### [MODIFY] [FoodtruckService .cs](file:///c:/DesarrolloGIT/foodtrucks/CodigoFuente/rsFoodtrucks/rsFoodtrucks/Services/FoodtruckService/FoodtruckService%20.cs)

1. Inyectar `IMailService` e `ILogger` via constructor
2. Corregir la condición de la línea 140 a `== "S"`
3. Implementar el envío de correo con manejo de errores (sin afectar la transacción principal)

```diff
-public FoodtruckService(ApplicationDbContext context, IRepositoryAsync<FT_Foodtrucks> repository)
+public FoodtruckService(ApplicationDbContext context, IRepositoryAsync<FT_Foodtrucks> repository, 
+    IMailService mailService, ILogger<FoodtruckService> logger)
 {
     _context = context;
     _repository = repository;
+    _mailService = mailService;
+    _logger = logger;
 }
```

```diff
-if(foodtruck.Estado != "S")
+if(foodtruck.Estado == "S" && !string.IsNullOrEmpty(foodtruck.EmailContacto))
 {
-    //Enviar correo con observaciones por baja
+    try
+    {
+        await _mailService.SendAsync(new MailModel
+        {
+            Origen = "no-responder@mardelplata.gov.ar",
+            OrigenNombre = "FoodtrucksMGP",
+            Destinatario = foodtruck.EmailContacto,
+            Asunto = $"Suspensión de Foodtruck - {foodtruck.NombreFantasia}",
+            Cuerpo = $"Estimado/a {foodtruck.Titular},\n\n"
+                   + $"Le informamos que su foodtruck \"{foodtruck.NombreFantasia}\" "
+                   + $"ha sido suspendido.\n\n"
+                   + $"Observaciones: {foodtruck.Observaciones ?? "Sin observaciones"}\n\n"
+                   + "Saludos,\nFoodtrucks MGP"
+        });
+    }
+    catch (Exception ex)
+    {
+        _logger.LogError("Error al enviar correo de suspensión para FT {Id}: {Error}",
+            foodtruck.IdFT, ex.Message);
+        // No relanzar — el fallo del correo no debe afectar la transacción
+    }
 }
```

> La lógica de blanqueo de `Observaciones` (líneas 76-79) se mantiene intacta: solo limpia cuando el estado NO es "S".

---

## Plan de Verificación

### Compilación
- Ejecutar `dotnet build` para verificar que no hay errores de compilación

### Verificación Manual
1. Iniciar la aplicación y confirmar que arranca sin errores de DI
2. Cambiar estado de un foodtruck a `"S"` con observaciones → verificar que se inserta registro en cola de emails
3. Actualizar un foodtruck sin `EmailContacto` → verificar que no se intenta enviar correo
4. Actualizar un foodtruck con estado distinto a `"S"` → verificar que NO se envía correo

---

## Refactoring: Reorganización de Archivos (Post-Implementación)

> Mover los archivos del servicio de correo desde `Utility/` hacia las carpetas que respetan la arquitectura existente del proyecto.

### Justificación

El proyecto sigue un patrón claro:
- **`Models/`** → Entidades y DTOs (`FT_Foodtrucks`, `FT_Categorias`, etc.)
- **`Services/[NombreServicio]/`** → Interfaz + Implementación (`FoodtruckService/`, `CategoriaService/`, `UsuarioService/`)

Los archivos del mail service deben seguir esta misma convención.

### Movimientos de Archivos

| Archivo | Ubicación Actual | Nueva Ubicación | Nuevo Namespace |
|---------|-----------------|-----------------|-----------------|
| `MailModel.cs` | `Utility/` | `Models/` | `rsFoodtrucks.Models` |
| `IMailService.cs` | `Utility/` | `Services/MailService/` | `rsFoodtrucks.Services.MailService` |
| `MailService.cs` | `Utility/` | `Services/MailService/` | `rsFoodtrucks.Services.MailService` |

### Archivos que Requieren Actualización de `using`

| Archivo | Cambio |
|---------|--------|
| `Startup.cs` | `IMailService` → `using rsFoodtrucks.Services.MailService` |
| `FoodtruckService.cs` | `IMailService` y `MailModel` → `using rsFoodtrucks.Services.MailService` + `using rsFoodtrucks.Models` |

### Archivos que se Eliminan (ubicación original)

- `Utility/MailModel.cs`
- `Utility/IMailService.cs`
- `Utility/MailService.cs`

