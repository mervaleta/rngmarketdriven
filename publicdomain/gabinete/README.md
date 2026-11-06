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


## Curación cronológica y estructura física — v0.4.0 (6 de noviembre de 2026)

- El archivo `libro.json` tiene **60 páginas** de composición y **12 fotografías históricas distintas** en el banco visual, cinco más que en la versión inicial. Las incorporaciones se cotejaron en fichas del Metropolitan Museum y reproducciones CC0 de Wikimedia Commons; todas las imágenes siguen siendo enlaces remotos y **no se han subido másteres a este repositorio**.
- Orden físico: **1 tapa (recto impar), 2 retiración de tapa, 3 dedicatorias en blanco, 4 verso en blanco, 5 portadilla**. El prólogo dispone de una página reservada en **7**; el epílogo, en **57**. Ambas carecen de texto definitivo.
- Aperturas de los seis capítulos en folios **11, 17, 25, 39, 47 y 53**, todos impares. Las páginas de ajuste se generan como páginas verdaderamente vacías.
- El visor de pliegos coloca la **tapa a la derecha sin enfrentada**. A partir del folio 2, el verso par queda a la izquierda y el recto impar a la derecha.
- La narración se organiza cronológicamente en las etapas 1839–1849, 1850–1852, 1851–1855 y 1856–1859, más informes sobre circulación, censura y conservación. La **curación fotográfica todavía está concentrada en 1840–1859**; el horizonte hasta 1900 no está cubierto con imágenes suficientes.
- Los textos dirigidos al equipo de producción se retiraron del manuscrito; las tareas, exclusiones, metas y el banco de fuentes pendientes están en `produccion.json`, **fuera de las páginas del libro**.
- `editor.css` y `editor.js` incluyen los nuevos tipos de página (`blank`, `reserved`, `credits`) y `index.html` muestra el marcador **GABINETE · V0.4.0 · ROSA/BORDÓ**.
- El editor guarda su nueva versión en una clave local distinta de la anterior; las ediciones locales previas quedan conservadas en el navegador y no se vuelcan automáticamente sobre este manuscrito estructuralmente diferente. Exportar JSON antes de cambiar entre versiones.
- Para ver la v0.4.0, publicar juntos `index.html`, `editor.js`, `editor.css`, `libro.json` y `produccion.json`. La escritura en GitHub no acredita el despliegue en Hostinger.

### Fuentes añadidas y verificadas

- [Vallou, *Reclining Nude*, 1851–1853](https://www.metmuseum.org/art/collection/search/283114) — [Archivo Commons](https://commons.wikimedia.org/wiki/File:-Reclining_Nude-_MET_DP147946.jpg).
- [Vallou, *Standing Female Nude*, ca. 1853](https://www.metmuseum.org/art/collection/search/266981) — [Archivo Commons](https://commons.wikimedia.org/wiki/File:-Standing_Female_Nude-_MET_DT6994.jpg).
- [Durieu, *Nude Study*, 1853–1854](https://www.metmuseum.org/art/collection/search/286255) — [Archivo Commons](https://commons.wikimedia.org/wiki/File:-Nude_Study-_MET_DP139566.jpg).
- [Chauvassaignes, *Female Nude in Studio*, 1856–1859](https://www.metmuseum.org/art/collection/search/282602) — [Archivo Commons](https://commons.wikimedia.org/wiki/File:-Female_Nude_in_Studio-_MET_DT1168.jpg).
- [Atribuido a Braquehais, *Nude Before a Mirror*, ca. 1857](https://www.metmuseum.org/art/collection/search/286294) — [Archivo Commons](https://commons.wikimedia.org/wiki/File:-Nude_Before_a_Mirror-_MET_DP343654.jpg).

**Control pendiente:** documentar la edad adulta de todas las personas representadas en imágenes sensibles, cotejar las demás fichas, almacenar archivos maestras y revisar requisitos legales por país antes de autorizar la edición.


## Avance v0.5.0 — Nueva cronología y pliegos físicos (6 de noviembre de 2026)

- **82 folios, 18 reproducciones fotográficas y 8 aperturas de capítulo**. Los ocho capítulos comienzan en folios impares: 11, 17, 25, 39, 47, 55, 67, 73.
- El laboratorio agrupa ahora las miniaturas de «Libro completo» en **pliegos físicos**, iniciando con una casilla totalmente vacía a la izquierda de la tapa (folio 1, recto a la derecha). La vista de «Pliego» utiliza la misma lógica.
- **La paridad se recalcula automáticamente** después de insertar, duplicar, eliminar o mover páginas. Los blancos automáticos de ajuste se consideran parte del plan de paginación y no deben confundirse con contenido narrativo.
- Se sumaron dos capítulos cronológicos: **1860–1879** (anonimato, máscaras, circuitos de impresión) y **1880–1900** (Eakins, Muybridge y de Meyer, fotografía artística y científica).
- Se incorporaron seis fotografías identificadas y documentadas del Metropolitan Museum y USC: máscara ca. 1870, sombrero 1870s–90s, Eakins (dos piezas), Muybridge (1887), de Meyer (1890s). Los archivos son enlaces externos a fotos de archivo; no están almacenados en el servidor de Siglo23.
- Los ensayos ahora abarcan sucesivamente 1839–1900. **La selección de fotografías sigue siendo provisional**, sobre todo en el material cuyas personas retratadas no están identificadas o tienen edad adulta sin documentación suficiente.
- Las tareas de preproducción, verificación de identidad/edad y licencia se alojan en `produccion.json`, fuera del cuerpo narrativo.
- Los cambios confirmados en GitHub no implican despliegue automático en Hostinger; para ver la versión en el dominio, el encabezado debe indicar `GABINETE · V0.5.0` y `version.json` debe devolver `SIGLO23-GABINETE-20261106-V0.5.0`.
