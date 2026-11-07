# El gabinete prohibido — estudio de maquetación Siglo23

**Ruta objetivo:** https://rngmarketdriven.com/publicdomain/gabinete/index.html  
**Repositorio:** `mervaleta/rngmarketdriven`, carpeta `publicdomain/gabinete/`.  
**Versión actual:** 0.9.0 · 7 de noviembre de 2026.  
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


## V0.6.0 — El libro pasa a ser un fotolibro (6/11/2026)

- **102 páginas**, **25 fotografías distintas** y **1 dibujo documental de Delacroix**. El contador de piezas distintas no incluye las repeticiones de láminas en los dípticos/mosaicos.
- **79 páginas tienen al menos una imagen (77.5 %)**: el cambio responde a la orientación fotográfica solicitada. Hay 26 láminas individuales, 5 dípticos, 9 mosaicos y 16 fotoensayos. Los análisis con fotografía también aumentaron sustancialmente su superficie visual.
- Siete fotos nuevas documentadas mediante Commons/MET: [Nude] (atribución a Durieu, ca. 1851), [Standing Female Nude] de Nadar (1860–61, modelo identificada adulta Marie-Christine Leroux), [Nude Men in the Garden] de Eakins, Bill Duckett fotografiado por Eakins (ca. 1889), y tres fotografías adicionales de la clase de pintura de Adolf de Meyer (1890s). El dibujo de Delacroix (1855) queda expresamente identificado como dibujo, no fotografía.
- El panel incluye editor de IDs de hasta cuatro imágenes por página, y campos de análisis asociados. Los folios siguen respetando tapa en impar y aperturas en recto.
- Objetivo a largo plazo: **80–100 fotografías diferentes**, con licencia, calidad y documentación individual. La actual relación entre páginas fotográficas y fotografías distintas muestra por qué hay que seguir ampliando el corpus.
- Fuentes detalladas en `libro.json`; tareas y limitaciones de producción en `produccion.json`. Imágenes por URL externa, aún no copiadas como archivos maestros al servidor.
- Versión esperada en la cabecera: `GABINETE · V0.6.0 · ROSA/BORDÓ`. Manifestación: `SIGLO23-GABINETE-20261106-V0.6.0`. No hay confirmación de despliegue automático de GitHub a Hostinger.


## v0.7.0 — Una foto, una lámina; excepción para tapa y capítulos (6/11/2026)

- **72 páginas**, **25 fotografías distintas + 1 dibujo de Delacroix**. Los 26 objetos aparecen exactamente **una vez en el interior**: duplicados interiores comprobados = **0**.
- Se permiten las reutilizaciones en **tapa y aperturas de capítulo**, por su función visual: actualmente 9 portadas y aperturas muestran fotografías que también pueden aparecer en las láminas.
- **15 páginas de hechos históricos**, **1 cronología** y **26 láminas acompañadas por una curiosidad/documentación breve**. Las fuentes históricas se incluyen como URLs en las fichas y las páginas de datos.
- Se eliminaron del cuerpo los dípticos y mosaicos que repetían fotografías ya publicadas como láminas individuales; sus textos completos quedan preservados en `contextos-investigacion-v06.json`, fuera de las páginas del libro.
- La interfaz muestra un contador de duplicaciones interiores y **bloquea la asignación accidental** de una fotografía ya usada fuera de tapa/apertura. Al duplicar una página interior, se copian sus textos pero no su imagen.
- Los capítulos continúan en recto impar: folios **11, 15, 21, 33, 37, 45, 57, 61**; la tapa sigue sola a la derecha en la grilla y la vista de pliegos.
- **Pendiente importante:** ampliar de 25 fotografías únicas a una colección más rica. La depuración reduce el número de páginas, no representa un incremento del corpus visual. También siguen pendientes la descarga y archivo de los originales, la verificación de procedencia/edad/derechos y el despliegue en Hostinger.
- Marcador de publicación esperado: `GABINETE · V0.7.0 · ROSA/BORDÓ` y `SIGLO23-GABINETE-20261106-V0.7.0` en `version.json`.


## Edición de lujo v0.8.0 — Una sola línea visual

- **Fotolibro de arte sensual/erótico del siglo XIX**, no historia general de aparatos ni tecnología ilustrada. El objetivo es honrar a fotógrafos, modelos y la belleza del original.
- Formato preliminar **270 × 340 mm**, **tapa dura** y **papel mate/semimate premium**; cuadernillos cosidos y pruebas de reproducción antes del arte final.
- La maqueta de curaduría tiene **62 páginas y 19 fotografías distintas**, una aparición interior por obra. La reducción es producto de retirar **7 materiales ajenos a la línea visual**, archivados en `fuera-de-coleccion-v08.json`.
- Aperturas en impar: **11, 15, 21, 31, 35, 43, 49, 53**; la tapa sigue sola a la derecha.
- La pestaña **Curaduría premium** lista **12 nuevas fotografías de desnudo candidatas** con enlaces directos a sus fichas museísticas, guardadas en `seleccion-erotica-lujo.json`. No se cuentan como incorporadas mientras falte el máster o la revisión.
- El documento `direccion-editorial-lujo.md` fija la propuesta estética, la impresión y el criterio de respeto a las modelos y a sus autores.
- Extensión y corpus objetivo: **144–176 páginas** y **70–95 fotografías únicas** si la calidad y las fuentes lo permiten; no inflar el libro con repeticiones ni con objetos.
- Identificador de fuente: `SIGLO23-GABINETE-20261107-V0.8.0`. Estado de Hostinger: no verificado.


## v0.9.0 · Primera integración efectiva de la curaduría premium

- **66 páginas**, **22 fotografías diferentes** y **22 láminas individuales**; no hay ninguna imagen repetida en el interior. Repeticiones solo permitidas en tapa/aperturas.
- Se integraron como láminas reales, con análisis breve y ficha museística: **Eduard Isaac Asser, ca. 1855** (folio 31); **Auguste Belloc, ca. 1855** (folio 32); **Nadar, 1856–1859** (folio 37).
- El banco previo de 12 candidatas se divide en **3 incorporadas y 9 todavía en investigación**. Las fichas conservan URLs y estado de aprobación en `seleccion-erotica-lujo.json`.
- El archivo Belloc es una **miniatura JPEG derivada del TIFF de Commons**, enlazada desde Cleveland, **no es la imagen apta para imprenta**. Su TIFF de 5106×3780 px está identificado en Wikimedia Commons, pendiente de descarga y comprobación. Nadar y Asser se muestran con JPG originales remotos, pero tampoco están alojados en el repositorio.
- El formato base del editor es 270×340 mm; se corrigieron límites de los controles que impedían introducir 270 mm. También el CSS de impresión se actualizó a este tamaño de estudio.
- Aperturas de capítulo en los folios: **11, 15, 21, 33, 39, 47, 53, 57**. Tapa en recto impar sola a la derecha.
- Para servir la última edición, publicar juntos `index.html`, `editor.css`, `editor.js`, `libro.json`, `seleccion-erotica-lujo.json` y `version.json` en la ruta `/publicdomain/gabinete/`. En GitHub están verificados; el despliegue por Hostinger aún no se ha confirmado.
- Identificador esperado `GABINETE · V0.9.0 · ROSA/BORDÓ` / `SIGLO23-GABINETE-20261107-V0.9.0`.
