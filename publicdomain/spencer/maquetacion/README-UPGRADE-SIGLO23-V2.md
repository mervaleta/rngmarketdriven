# Herbert Spencer · Upgrade Siglo23 Studio Kit v2

**Fecha:** 2026-11-07. **Estado:** en rama de integración, pendiente de validación completa.

**Color de fondo:** #172d49 · azul editorial. Solo la interfaz, sin afectar colores del papel.

## Cambios específicos del maquetador

Se conserva la grilla M09, la transcripción original de 1884, los índices y el material editorial. La preprensa Paged.js añade tapa como primera hoja y contratapa como última hoja del documento paginado; ambas se consideran bocetos editoriales, no cubierta de imprenta. La grilla tradicional continúa contando páginas interiores y no debe confundirse con el conteo físico ampliado.

## Riesgos y pendientes

Paginación y textos originales requieren cotejo con facsímil; PDF/X, perfiles ICC, imágenes y galeradas pendientes.

## Herramientas compartidas · Siglo23 Studio Kit 2.0

El mismo archivo `estudio-comun.js` se instala en los cinco maquetadores. Se carga desde `index.html` con el atributo `data-project`, que define el color de fondo y la identificación del taller.

**Controles disponibles:** Libro completo; Pliego; Tapa; Contratapa; Revisar desbordes; Informe JSON; Guardar proyecto; Importar proyecto; Prueba PDF; enlace a Siglo23.

El diagnóstico utiliza medidas de caja del navegador, marca desbordes visibles y comprueba imágenes mostradas. Es una auditoría **parcial**, no certifica todas las páginas si el visor no las renderiza.

Los botones de archivo y PDF utilizan los métodos propios del editor: **no existe aún un formato JSON unificado, ni trabajo multiusuario o sincronización con Hostinger**.

**Validación para cada proyecto:** probar grilla y pliegos, primeras y últimas hojas, todas las continuaciones de texto, desbordes, exportación/importación, impresión, color y tipografías. No se genera PDF/X-4 certificado ni imposición.

Los archivos de edición están en GitHub. Un commit no confirma la publicación en Hostinger. Proteger manuscritos no publicados antes de habilitar enlaces públicos.
