# El gabinete prohibido — estudio de maquetación Siglo23

**Ruta objetivo:** https://rngmarketdriven.com/publicdomain/gabinete/index.html  
**Repositorio:** `mervaleta/rngmarketdriven`, carpeta `publicdomain/gabinete/`.  
**Versión:** 0.2.1 · 6 de noviembre de 2026.  
**Estado:** maqueta editorial; NO es PDF final ni obra aprobada para publicación comercial.

## Archivos

- `index.html`: interfaz del taller.
- `editor.css`: composición de páginas 166 × 236 mm, cubierta, capítulos, láminas, pliegos y grilla.
- `editor.js`: previsualización, edición, importación/exportación JSON, persistencia local, prueba de impresión.
- `libro.json`: 28 páginas de muestra y 7 fichas de imágenes vinculadas a museos y Wikimedia Commons.

Los cuatro archivos deben estar en el **mismo directorio** del servidor. El sitio usa Google Fonts (Montserrat, Cormorant Garamond); con fuentes de sustitución sigue siendo legible.

## Funciones

1. **Libro completo:** miniatura visual de todas las páginas, incluida cada lámina con imagen real.
2. **Pliego:** dos páginas enfrentadas; clic en una para seleccionarla.
3. **Banco de imágenes:** fichas con título, fotógrafo, fecha, técnica, tamaño, museo, número de inventario, derechos y enlaces a imagen original y ficha institucional.
4. **Ensayo integral:** lectura continua de todos los textos contextuales de la maqueta.
5. **Inspector:** modificar portada, capítulo, títulos, texto, pie, asignación y URL de fotografía.
6. **Composición:** formato, márgenes, cuerpo, interlínea, tipografía, escala de miniaturas y encuadre.
7. **Reorganización:** añadir, duplicar, eliminar y mover páginas.
8. **Persistencia:** guardado local del navegador, respaldo JSON e importación del proyecto.
9. **Prueba de impresión:** impresión desde navegador a PDF, solo orientativa, sin especificaciones PDF/X ni validación de color.

## Fotografías

Las siete fotografías son referencias reales a imágenes del **Metropolitan Museum of Art**, con reproducciones en Wikimedia Commons declaradas como CC0 o de dominio público. En esta etapa, el HTML **enlaza** los JPG originales remotos; no se han almacenado archivos JPG en el repositorio y no se debe presentar la maqueta como un paquete offline ni como PDF final con másteres incrustados.

Enlaces de imágenes, tamaños y licencias documentados individualmente en `libro.json`.

### Selección responsable

Se excluyeron de esta versión dos fotografías inicialmente consideradas de Félix-Jacques Moulin porque las fuentes históricas mencionan modelos adolescentes en algunas de sus series, sin permitir identificar con seguridad la edad de los modelos de esas piezas concretas. El episodio judicial de Moulin sigue analizado **sin reproducir esas imágenes**. Antes de ampliar la colección o imprimir, verificar la edad adulta de todas las personas fotografiadas, procedencia, dominio público aplicable y reglas de comercialización.

## Fuentes históricas de contexto

- Met: [Daguerre and the Invention of Photography](https://www.metmuseum.org/es/essays/daguerre-1787-1851-and-the-invention-of-photography).
- Library of Congress: [The Daguerreotype Medium](https://www.loc.gov/collections/daguerreotypes/articles-and-essays/the-daguerreotype-medium/).
- Met: [Two Standing Female Nudes, Moulin](https://www.metmuseum.org/art/collection/search/282051) — caso judicial y distinción entre arte y erotismo.
- Online Archive of California: [Felix Moulin archive](https://oac.cdlib.org/findaid/ark:/13030/c87m0c7k) — historia del estudio y problemas de edad de los modelos.
- Met: [Stereographic View of Two Nude Women](https://www.metmuseum.org/art/collection/search/282209).
- Met: [Reclining Female Nude, Vallou](https://www.metmuseum.org/art/collection/search/266980).
- Cleveland: [Academic Nude, Reclining on a Sofa](https://www.clevelandart.org/art/1998.55).

## Estado de despliegue

Escritura y lectura **verificadas en GitHub**. No hay confirmación de que Hostinger sincronice automáticamente el repositorio; no asegurar que la URL objetivo esté online hasta verificar su respuesta y recursos `libro.json`, `editor.css`, `editor.js`.

## Próximas tareas de producción

Descargar los originales desde las fichas individuales, confirmar integridad y resolución en píxeles, cotejar la atribución con la ficha de museo, verificar derechos territoriales y edad, cerrar estructura, maquetar versión con archivos locales y exportar PDF definitivo. El precio, tirada y canal comercial no están definidos.


## Identidad visual del taller · v0.3.0 · 6 de noviembre de 2026

- Se reemplazó el cromatismo verde/petróleo del maquetador por una interfaz de **rosa, bordó, negro y blanco**, distinta de la del taller Spencer.
- Encabezado bordó, escenario de composición rosa oscuro/negro, paneles color vino, controles de contraste alto y acentos rosa claro.
- El cambio afecta solo la interfaz de pantalla. Las páginas del libro mantienen sus colores de maquetación y la salida de impresión conserva los estilos específicos de arte final.
- Nueva cadena visible `GABINETE · V0.3.0 · ROSA/BORDÓ` y URL de CSS con versión para evitar caché antigua.
- Cambio confirmado en GitHub. Despliegue al dominio sujeto a sincronización con Hostinger.
