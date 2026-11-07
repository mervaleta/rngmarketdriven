# El gabinete prohibido · Upgrade Siglo23 Studio Kit v2

**Fecha:** 2026-11-07. **Estado:** en rama de integración, pendiente de validación completa.

**Color de fondo:** #4a203a · bordó fotográfico. Solo la interfaz, sin afectar colores del papel.

## Cambios específicos del maquetador

Se preservan las 146 páginas anteriores y el banco fotográfico. Se añaden la retiración final (147) y contratapa (148), con el tipo de página `cover` en rol `back`, sin reutilizar fotografías del cuerpo. La tapa original sigue siendo la página 1. Se actualizan los rótulos y la identidad visual de la interfaz. La contratapa es provisional.

## Riesgos y pendientes

El cambio de versión en libro.json provoca copia local de respaldo de la edición anterior; recuperarla antes de migrar cambios personales. Verificar todos los recursos gráficos y los derechos.

## Herramientas compartidas · Siglo23 Studio Kit 2.0

El mismo archivo `estudio-comun.js` se instala en los cinco maquetadores. Se carga desde `index.html` con el atributo `data-project`, que define el color de fondo y la identificación del taller.

**Controles disponibles:** Libro completo; Pliego; Tapa; Contratapa; Revisar desbordes; Informe JSON; Guardar proyecto; Importar proyecto; Prueba PDF; enlace a Siglo23.

El diagnóstico utiliza medidas de caja del navegador, marca desbordes visibles y comprueba imágenes mostradas. Es una auditoría **parcial**, no certifica todas las páginas si el visor no las renderiza.

Los botones de archivo y PDF utilizan los métodos propios del editor: **no existe aún un formato JSON unificado, ni trabajo multiusuario o sincronización con Hostinger**.

**Validación para cada proyecto:** probar grilla y pliegos, primeras y últimas hojas, todas las continuaciones de texto, desbordes, exportación/importación, impresión, color y tipografías. No se genera PDF/X-4 certificado ni imposición.

Los archivos de edición están en GitHub. Un commit no confirma la publicación en Hostinger. Proteger manuscritos no publicados antes de habilitar enlaces públicos.
