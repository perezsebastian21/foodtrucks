# 🚀 Plan de Implementación de Mejoras — rsFoodtrucks

Este plan detalla los pasos concretos para mitigar los cuellos de botella y vulnerabilidades de escalabilidad de la API actual. 

## Fases de Implementación

---

## 1. Fase Uno: Desacoplar Archivos de la Base de Datos (Prioridad Crítica)

Guardar arrays de bytes pesados (`bytea`) en la base de datos es la amenaza más grande para la escalabilidad. Moveremos esos archivos a un sistema de File System (FS) distribuido o a un Object Storage S3 compatible (como AWS S3 o MinIO).

### Cambios Propuestos

### Cambios Propuestos

Para garantizar la **coherencia transaccional** (evitar archivos físicos huérfanos) y preservar la **pureza genérica** de la arquitectura, usaremos el **Patrón Decorador (Decorator Pattern)** a través de un orquestador que envolverá las operaciones de guardado para cualquier entidad que requiera imágenes, sin contaminar a los servicios que no las necesitan.

#### [NEW] `rsFoodtrucks/Services/StorageService/IFileStorageService.cs` y `FileStorageService.cs`
- Encargado exclusivo de interactuar con el File System o S3:
  - `Task<string> UploadFileAsync(IFormFile file)`: Devuelve la URL relativa o absoluta.
  - `Task DeleteFileAsync(string fileUrl)`: Elimina el archivo físico (usado para rollbacks).

#### [MODIFY] `rsFoodtrucks/Models/FT_Foodtrucks.cs` (y demás entidades con imágenes)
- Reemplazar todas las propiedades `byte[]` (`Logo`, `DniFrente`, etc.) por `string`. Estos campos ahora almacenarán la **URL** del archivo subido.

#### [NEW] `rsFoodtrucks/Services/GenericFileOrchestrator/FilePersistenceOrchestrator.cs`
- Crearemos un servicio genérico avanzado `IFilePersistenceOrchestrator<TEntity, TDto>` que actúa como **Decorador**. Este orquestador recibe el DTO, el repositorio y un delegado u objeto de unidad de trabajo.
- **Flujo interno del Decorador (Transacción Compensatoria/Saga):**
  1. Usa reflexión sobre `TDto` para buscar propiedades `IFormFile`.
  2. Sube los archivos 1 a 1 a través de `IFileStorageService` y almacena temporalmente las URLs resultantes.
  3. Mapea la entidad e inyecta las URLs en las propiedades `string` correspondientes (exactamente como lo hacía _GenericImageMapperService_ antes).
  4. Ejecuta el llamado al almacenamiento de la base de datos (`await _repository.Add(entity)`).
  5. **Si la base de datos falla**, un bloque `catch` iterará sobre las URLs temporales subidas e invocará `await _fileStorageService.DeleteFileAsync(url)` para borrar físicamente los archivos y mantener la consistencia.

```csharp
// Fragmento conceptual del Orchestrator genérico:
public async Task<TEntity> ExecuteWithFilesAsync(TDto dto, Func<TEntity, Task> addEntityAction)
{
    var uploadedUrls = new List<string>();
    try 
    {
        // 1. Reflexión: Extraer IFormFiles, subir y mapear a entity...
        // [Lógica para mapear DTO -> TEntity con URLs]
        
        // 2. Ejecutar la acción contra la BD (Ej: Repository.Add)
        await addEntityAction(entity);
        return entity;
    } 
    catch (Exception) 
    {
        // 3. Rollback Físico Transaccional
        foreach(var url in uploadedUrls) {
            await _fileStorageService.DeleteFileAsync(url);
        }
        throw;
    }
}
```

#### [MODIFY] `rsFoodtrucks/Services/FoodtruckService/FoodtruckService.cs`
- En lugar de ensuciarse con manejo manual de archivos, solo inyectará el `IFilePersistenceOrchestrator` y lo llamará enviándole el DTO y el puntero hacia la función de guardado:
  `await _fileOrchestrator.ExecuteWithFilesAsync(dto, entity => _repository.Add(entity));`

#### [DELETE] `rsFoodtrucks/Mapping/ImageMapping/GenericImageMapperService.cs`
- Reemplazado por el Orchestrator genérico completo.

#### [MODIFY] `rsFoodtrucks/DataAccess/Servicios/RepositoryAsync.cs`
- Eliminar métodos anticuados como `AddWithImage()`. El repositorio queda 100% agnóstico de IFormFile.

---

## 2. Fase Dos: Eliminar "Lazy Loading" (Prioridad Alta)

El uso de *Lazy Loading Proxies* (`UseLazyLoadingProxies()`) fuerza a Entity Framework a traer datos por goteo silencioso. Esto explota los queries concurrentes en PostgreSQL. Debemos usar *Eager Loading* (`.Include()`).

### Cambios Propuestos

#### [MODIFY] `rsFoodtrucks/Startup.cs`
- Eliminar de la configuración `services.AddDbContext`:
  `options.UseLazyLoadingProxies()`
- Eliminar en `rsFoodtrucks.csproj`:
  `<PackageReference Include="Microsoft.EntityFrameworkCore.Proxies" />`

#### [MODIFY] `rsFoodtrucks/DataAccess/Interfaces/IRepositoryAsync.cs` y `RepositoryAsync.cs`
- Modificar todos los métodos de lectura `Find()`, `GetById()`, y los `GetAllDTO` para recibir opcionalmente un arreglo de expresiones de inclusión `params Expression<Func<T, object>>[] includes`.
- El repositorio aplicará la expresión `.Include()` de EF Core, por ejemplo:
  ```csharp
  public async Task<T> GetByID(int? id, params Expression<Func<T, object>>[] includes) { ... }
  ```

#### [MODIFY] `rsFoodtrucks/Services/FoodtruckService.cs`
- Asegurarse de que toda query o iteración que mapee `x.FoodtrucksCategorias` reciba explícitamente el llamado `.Include(x => x.FoodtrucksCategorias)` a través de la firma ajustada del repositorio.

---

## 3. Fase Tres: Robustecer la Capa de Servicios (Unit of Work)

El servicio de Foodtruck (`FoodtruckService.cs`) inyecta directamente `ApplicationDbContext` para poder abrir transacciones base de datos al actualizar la entidad `.Update()`. Esto "rompe" el principio del Repositorio.

### Cambios Propuestos

#### [NEW] `rsFoodtrucks/DataAccess/Interfaces/IUnitOfWork.cs` y `UnitOfWork.cs`
- Centralizar Entity Framework Core detrás de un contexto de Unit Of Work manejando `CommitAsync()` y `RollbackAsync()`.

#### [MODIFY] `rsFoodtrucks/Services/FoodtruckService.cs`
- Eliminar la inyección de `ApplicationDbContext`.
- Inyectar la interfaz `IUnitOfWork` que contendrá todos los repositorios (incluyendo Foodtruck y Categoria). La transacción en `Update()` orquestará a su vez a `UnitOfWork.BeginTransactionAsync()`.

---

## 4. Fase Cuatro: Observabilidad y Fortalecimiento

Mejoras finales para que la API sea lista para producción.

### Cambios Propuestos

#### [MODIFY] `rsFoodtrucks/Utility/LdapManager.cs`
- **Error Swallowing Log**: Agregar el servicio de bitácoras de consola estándar `ILogger<LdapManager>` a la inyección. Reemplazar el bloque `catch (LdapException ex)` silenciado para que loguee la traza en la consola, facilitando la auditoría de caídas de LDAP.

#### [MODIFY] `rsFoodtrucks/Startup.cs`
- **CORS Estricto**: Restringir app.UseCors(). Cambiar `SetIsOriginAllowed(origin => true)` para que la API únicamente responda al Endpoint HTTP/HTTPS del "frontend" oficial alojado en la Municipalidad de Mar del Plata, por ejemplo `WithOrigins("https://registro.mardelplata.gov.ar")`.

--- 
## Resumen del Esfuerzo 

1. **Migración DB y APIs:** Implicará la generación de una migración `dotnet ef migrations add RemoveImages`.
2. **Volcado de FS:** Implicará escribir un script único que extraiga los bytes ya en tabla a un bucket.
3. Este plan requiere la modificación de un volumen mediano de código, pero mantendrá la API libre de caídas durante eventos picos.
