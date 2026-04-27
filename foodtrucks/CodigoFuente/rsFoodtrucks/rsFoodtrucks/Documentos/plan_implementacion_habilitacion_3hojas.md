# Plan de Implementación: Desdoble de `Habilitacion` en 3 Hojas

## 1. Análisis Técnico
El requerimiento solicita reemplazar el campo único `Habilitacion` (que guarda un archivo en la base de datos) por tres campos separados: `HabHoja1`, `HabHoja2`, y `HabHoja3`. Además, se debe restringir el tipo de archivo permitido para que estos tres nuevos campos acepten únicamente imágenes (`jpg`, `jpeg`, `bmp`, `png`) y se rechace explícitamente la extensión `pdf`.

Gracias a cómo está estructurado el proyecto, la lógica de guardado de imágenes mediante el servicio `GenericImageMapperService` no requerirá modificaciones. Este servicio opera mediante Reflexión mapeando los campos `IFormFile` del DTO (`FT_FoodtrucksDTO`) a los `byte[]` correspondientes del modelo base (`FT_Foodtrucks`). Con sólo renombrar/crear los campos en ambas clases, el mapeo de los archivos funcionará transparentemente.

---

## 2. Script de Migración de Base de Datos
Se ha creado el script `Script_Migracion_Habilitacion.sql` en la carpeta `Documentos`. Este script se debe ejecutar manualmente en la base de datos PostgreSQL.

```sql
-- 1. Eliminar columna original (CUIDADO: Esto borra los datos actuales de Habilitacion)
ALTER TABLE public."FT_Foodtrucks" DROP COLUMN IF EXISTS "Habilitacion";

-- 2. Agregar las tres columnas nuevas
ALTER TABLE public."FT_Foodtrucks"
    ADD COLUMN IF NOT EXISTS "HabHoja1" bytea,
    ADD COLUMN IF NOT EXISTS "HabHoja2" bytea,
    ADD COLUMN IF NOT EXISTS "HabHoja3" bytea;
```

---

## 3. Modificaciones en el Código

### 3.1 Entidad `FT_Foodtrucks` (Models/FT_Foodtrucks.cs)
- **Eliminar**: `public byte[] Habilitacion { get; set; }`
- **Agregar**: 
  ```csharp
  public byte[]? HabHoja1 { get; set; }
  public byte[]? HabHoja2 { get; set; }
  public byte[]? HabHoja3 { get; set; }
  ```

### 3.2 DTO `FT_FoodtrucksDTO` (DTOs/FT_FoodtrucksDTO.cs)
- **Eliminar**: `public IFormFile Habilitacion { get; set; }`
- **Agregar**:
  ```csharp
  public IFormFile HabHoja1 { get; set; }
  public IFormFile HabHoja2 { get; set; }
  public IFormFile HabHoja3 { get; set; }
  ```

### 3.3 Contexto de Base de Datos `ApplicationDbContext` (Models/ApplicationDbContext.cs)
- **Eliminar** la configuración correspondiente a `Habilitacion`:
  ```csharp
  entity.Property(e => e.Habilitacion)
      .HasColumnName("Habilitacion")
      .HasColumnType("bytea")
      .IsRequired(false);
  ```
- **Agregar** la configuración de las 3 nuevas columnas:
  ```csharp
  entity.Property(e => e.HabHoja1).HasColumnName("HabHoja1").HasColumnType("bytea").IsRequired(false);
  entity.Property(e => e.HabHoja2).HasColumnName("HabHoja2").HasColumnType("bytea").IsRequired(false);
  entity.Property(e => e.HabHoja3).HasColumnName("HabHoja3").HasColumnType("bytea").IsRequired(false);
  ```

### 3.4 AutoMapper Profile `FoodtruckProfile` (Mapping/AutoMapperProfiles/FoodtruckProfile.cs)
- **Reemplazar** el `.ForMember` que ignora el mapeo directo de `Habilitacion`:
  ```csharp
  // Reemplazar: .ForMember(dest => dest.Habilitacion, opt => opt.Ignore())
  .ForMember(dest => dest.HabHoja1, opt => opt.Ignore())
  .ForMember(dest => dest.HabHoja2, opt => opt.Ignore())
  .ForMember(dest => dest.HabHoja3, opt => opt.Ignore())
  ```

---

## 4. Lógica de Tratamiento y Validación de Imágenes

El tratamiento de conversión a binario se seguirá haciendo a través del `_imageMapperService.MapImagesToEntityAsync`. 
La validación del formato (imágenes sí, PDF no) se implementará en el **Controlador** `FoodtruckController` interceptando la creación o edición del recurso.

### Cambios en `FoodtruckController.cs`:
Agregaremos una función privada para validar los archivos y la invocaremos en los endpoints `Create` y `Update`.

```csharp
private IActionResult ValidarImagenesHabilitacion(FT_FoodtrucksDTO dto)
{
    var extensionesPermitidas = new[] { ".jpg", ".jpeg", ".png", ".bmp" };
    var hojas = new[] { dto.HabHoja1, dto.HabHoja2, dto.HabHoja3 };
    var nombres = new[] { "HabHoja1", "HabHoja2", "HabHoja3" };

    for (int i = 0; i < hojas.Length; i++)
    {
        var archivo = hojas[i];
        if (archivo != null && archivo.Length > 0)
        {
            var extension = System.IO.Path.GetExtension(archivo.FileName).ToLowerInvariant();
            if (!extensionesPermitidas.Contains(extension))
            {
                return BadRequest($"El archivo para {nombres[i]} no tiene un formato permitido. Solo se aceptan jpg, jpeg, png y bmp. PDF no está permitido.");
            }
        }
    }
    
    return null; // Todo OK
}
```

En los métodos `Create` y `Update` del `FoodtruckController`, se agregará la validación antes de mapear la entidad:

```csharp
[HttpPost]
public async Task<ActionResult<FT_Foodtrucks>> Create([FromForm] FT_FoodtrucksDTO foodtruckdto)
{
    // 1. Validar imágenes de habilitación
    var validacionHojas = ValidarImagenesHabilitacion(foodtruckdto);
    if (validacionHojas != null) return validacionHojas;

    // ... código restante ...
}

[HttpPut]
public async Task<ActionResult<FT_Foodtrucks>> Update([FromForm] FT_FoodtrucksDTO foodtruckdto)
{
    // 1. Validar imágenes de habilitación
    var validacionHojas = ValidarImagenesHabilitacion(foodtruckdto);
    if (validacionHojas != null) return validacionHojas;

    // ... código restante ...
}
```

Con estos cambios, garantizamos que las tres hojas se guardarán correctamente utilizando la arquitectura reflexiva actual, y al mismo tiempo prevenimos que se carguen archivos PDF u otros formatos indeseados, asegurando que se trate netamente de imágenes.
