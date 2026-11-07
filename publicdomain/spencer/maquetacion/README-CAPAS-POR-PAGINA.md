# Siglo23 · Spencer — Fondos y cajas por página · M11

Módulos: preprensa.html, page-designer.js y page-designer.css.

## Experiencia
La preprensa compone el texto y presenta **tapa como primera página**, **contratapa como última página**, y las dos caras interiores de cubierta. La planilla visual incluye cubiertas, pero los folios editoriales del interior siguen siendo independientes.

Cada hoja dispone de los botones **Cargar fondo** y **Editar página**. Solo una hoja puede editarse a la vez. Al activarla, se pueden añadir cajas de texto, moverlas desde su barra superior y redimensionarlas desde ocho tiradores. La caja seleccionada tiene edición de texto y cuerpo tipográfico desde el inspector, y puede eliminarse.

Tapa y contratapa se inicializan con cajas editoriales independientes, redimensionables. Las páginas interiores conservan el texto de Paged.js; el botón **Convertir texto paginado en caja** permite crear una copia editable. La copia no se repagina automáticamente: debe revisarse manualmente tras cualquier ajuste del libro. Se marca en rojo el desbordamiento detectado en cajas.

## Fondos y originales
- Se admiten JPG, PNG, WebP y AVIF de hasta 80 MB, con encuadre cubrir o contener.
- Se detectan nombre del archivo, dimensiones en píxeles y ppp aproximados según formato de corte. No se validan automáticamente perfiles ICC ni derechos de autor.
- Importación múltiple por convención de nombres: tapa.jpg, contratapa.png, p001.jpg, pagina023.webp. El número corresponde al **folio visual**. Los archivos no reconocidos quedan sin asignar.
- Las imágenes originales se guardan como Blob en IndexedDB del navegador y la geometría de las cajas también se conserva. **No se envían al servidor** ni a GitHub. Para trabajar en otro equipo se permite importar/exportar respaldo JSON con imágenes (límite preventivo 120 MB de originales).
- No existe detección automática de archivos en carpetas no seleccionadas: el usuario debe autorizar explícitamente la elección.

## Límites y preprensa
La modificación de una caja independiente no obliga a Paged.js a redistribuir el texto en las páginas siguientes. Una corrección en el manuscrito maestro y una recomposición general siguen siendo la manera de garantizar el flujo tipográfico. Los PDF creados desde el navegador son pruebas; no equivalen a PDF/X, ICC o imposición de imprenta. Se conserva la grilla M09 y sus manuscritos.

## Pruebas
Prueba E2E con Chromium: correspondencia de tapa/contratapa, botones por página, edición aislada, redimensionamiento desde el lateral, importación de imagen y recuperación por IndexedDB tras recomponer, y exclusión de controles en impresión. Se deben aprobar estas pruebas antes de publicar M11.
