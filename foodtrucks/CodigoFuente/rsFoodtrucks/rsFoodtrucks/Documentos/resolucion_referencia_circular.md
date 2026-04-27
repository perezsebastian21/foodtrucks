# 🛠️ Resolución de Referencia Circular y Optimización de Rendimiento

## 1. Problema Identificado
Se detectó que el endpoint `GET /preguntas/getall` (y otros relacionados con el modelo de valoraciones) presentaba tiempos de respuesta extremadamente elevados ("tarda muchísimo").

### Causa Raíz
La lentitud se debía a una **Referencia Circular** masiva combinada con el uso de **Lazy Loading Proxies**:
1. `FT_Preguntas` contiene una colección de `FT_Puntajes`.
2. Cada `FT_Puntajes` tiene una referencia de navegación hacia su `FT_Preguntas` padre.
3. Al serializar a JSON, el serializador intentaba navegar este ciclo infinitamente.
4. Aunque `Newtonsoft.Json` estaba configurado para ignorar ciclos (`ReferenceLoopHandling.Ignore`), el comportamiento de *Lazy Loading* forzaba a Entity Framework a realizar consultas adicionales a la base de datos para cargar cada propiedad de navegación antes de que el serializador decidiera ignorarla.

## 2. Solución Implementada
Se optó por romper los ciclos de serialización de forma explícita utilizando el atributo `[JsonIgnore]` de **Newtonsoft.Json** en las propiedades de navegación "hacia atrás" (back-references).

### Cambios en Modelos (`rsFoodtrucks.Models`)

#### 2.1. `FT_Puntajes.cs`
Se agregaron atributos para evitar que el puntaje intente serializar la pregunta o la reseña a la que pertenece:
- `[JsonIgnore] public virtual FT_Resenias Resenia { get; set; }`
- `[JsonIgnore] public virtual FT_Preguntas Pregunta { get; set; }`

#### 2.2. `FT_Resenias.cs`
Se agregaron atributos para evitar que la reseña serialice el objeto completo del Foodtruck o del Usuario (lo cual disparaba una carga masiva de datos relacionados):
- `[JsonIgnore] public virtual FT_Foodtrucks Foodtruck { get; set; }`
- `[JsonIgnore] public virtual FT_Usuarios Usuario { get; set; }`

## 3. Resultado y Beneficios
- **Eliminación de Recursión Infinita:** El serializador ahora se detiene en las hojas del objeto (los puntajes) sin intentar volver a subir en la jerarquía.
- **Reducción de Consultas (Lazy Loading):** Se evita que el Proxy de EF Core dispare consultas `SELECT` innecesarias para propiedades que no serán incluidas en el JSON final.
- **Mejora de Rendimiento:** El tiempo de respuesta de `/preguntas/getall` se reduce drásticamente al procesar una fracción del grafo de objetos original.
- **Consistencia:** Se mantiene la compatibilidad con el patrón ya utilizado en `FT_Categorias.cs`.

---
## 4. Anexo: ¿Qué pasa en .NET 8?

El problema de las referencias circulares es intrínseco a cualquier ORM que use navegación bidireccional, por lo que **sigue ocurriendo en .NET 8**. Sin embargo, las herramientas para resolverlo han evolucionado:

### 4.1. `ReferenceHandler.IgnoreCycles` (La Opción "Fluent")
En .NET 6/7/8, utilizando el serializador por defecto (`System.Text.Json`), se puede configurar una solución global en `Program.cs` que actúa de forma similar a una "Fluent API" para JSON:

```csharp
builder.Services.AddControllers()
    .AddJsonOptions(options => {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
```
Esto resuelve el bucle infinito de forma automática, pero **no detiene el Lazy Loading**. Sigue siendo recomendable usar `[JsonIgnore]` o mejor aún, **DTOs**, para evitar que Entity Framework dispare cientos de consultas `SELECT` innecesarias antes de que el serializador ignore el ciclo.

### 4.2. ¿Se puede desde Fluent API de EF Core?
La Fluent API de EF Core (`OnModelCreating`) sirve para mapear la base de datos, no la serialización. Si usas `.Ignore(p => p.Pregunta)` en el `DbContext`, la propiedad dejará de existir para Entity Framework y no se cargará nunca, lo cual puede romper tu lógica de negocio si necesitas esa navegación en el servidor.

### 4.3. Conclusión para el futuro
Aunque `[JsonIgnore]` sigue siendo una técnica válida y eficiente en .NET 8, la **mejor práctica** recomendada es migrar hacia el uso sistemático de **DTOs** (Data Transfer Objects) y proyecciones explícitas (`.Select()`), lo cual desacopla totalmente tu esquema de base de datos de tu API pública y garantiza el máximo rendimiento.

---
*Documentación actualizada el 19 de marzo de 2026.*
