# Editorial Siglo23 — Dominio público

Repositorio de trabajo: `mervaleta/rngmarketdriven`  
Ruta: `/publicdomain/`  
Fecha del inventario: 2026-11-05

## Contenidos ya incorporados

| Archivo | Contenido | Estado |
|---|---|---|
| `index.html` | Panel editorial integral: 5.228 fichas de autores, filtros, secciones de fuentes, archivo visual y derechos | En GitHub |
| `screener.js` | Filtros multivariables de libros y exportación CSV | En GitHub |
| `catalogo-global.json` | 307 obras candidatas, 31 ámbitos/mercados, temáticas por obra y 30 ediciones con ficha editorial documentada | En GitHub |
| `autores.json` | Los 5.228 autores del índice, separados en datos reutilizables | En GitHub |
| `autores.csv` | Exportación descargable de los 5.228 autores | En GitHub |
| `autores-1945.csv` | Subconjunto de 153 autores con fallecimiento 1945 | En GitHub |
| `coleccion/index.html` | Consulta modular filtrable de las 307 obras internacionales | En GitHub |
| `recursos/index.html` | Clasificación de 12 familias de materiales reutilizables e instituciones fuente | En GitHub |
| `spencer/index.html` | Expediente editorial y tareas pendientes de *El individuo contra el Estado* | En GitHub |

## Archivos de origen disponibles en esta conversación pero no publicados en el repositorio

- `DominioPublico_1900_1945.xlsx` (aprox. 2,6 MB).
- `DominioPublico1945-web.xlsx` (aprox. 61 KB).
- `Spencer_Siglo23_paquete_preproduccion.zip` (aprox. 189 KB): contiene DOCX, PDF y fuentes de una **preproducción no terminada**.
- Archivos DOCX y PDF individuales de Spencer.

**Limitación de esta entrega:** la conexión GitHub disponible permite crear/modificar archivos de texto. Los binarios Excel/Word/PDF/ZIP de la conversación no se han transferido, y sería incorrecto afirmar que están alojados o descargables desde `/publicdomain/`. Los datos de autores y libros, en cambio, sí están disponibles en JSON/CSV.

## Estado de publicación y privacidad

- Confirmada escritura en GitHub y lectura de los archivos.
- **No confirmada** sincronización automática con `rngmarketdriven.com` ni con Hostinger.
- Este repositorio es **público**. `noindex` no sustituye una contraseña ni un control de acceso. No subir documentos privados ni material con restricciones sin autorización.
- Las anotaciones de la Mesa de ediciones del panel se guardan en `localStorage` del navegador: no se guardan automáticamente en GitHub.
- Verificar derechos de autor, traducción, edición, imagen, territorio y licencias antes de comercializar.
- Seis registros de autores carecen de fecha de fallecimiento normalizada según el inventario fuente, y requieren inspección.
- La coincidencia nominal de un autor con una autoridad bibliográfica no equivale a identificación jurídica confirmada.

## Cómo desplegar

Se deben copiar `index.html`, `screener.js`, `catalogo-global.json` y el resto de archivos respetando rutas relativas al DocumentRoot efectivo del sitio. Si se utiliza un servidor estático, visitar `/publicdomain/`. Verificar HTTP 200, carga del JSON y JavaScript, funcionamiento de filtros y descarga de CSV. **El enlace no está certificado como publicado en un dominio.**

## Fuentes principales

- Bibliotecas: Project Gutenberg, Biblioteca Nacional de España, Wikisource, Internet Archive, Cervantes Virtual.
- Internacional: Aozora Bunko, Open Library, HathiTrust, WIPO y fuentes locales, según las URL guardadas en `catalogo-global.json`.
- Spencer original: https://oll.libertyfund.org/titles/spencer-the-man-versus-the-state-1885-ed
- Traducción histórica: https://es.wikisource.org/wiki/Archivo:El_individuo_contra_el_Estado.pdf

**Criterio editorial:** los 132 títulos son **candidatos**, no una lista de obras certificadas como dominio público mundial. Los indicadores de ventas, consultas y rankings no son equivalentes.

## Versión 0.2.0 — 5 de noviembre de 2026

- El número de versión se muestra en la barra superior y al pie de la navegación lateral del panel.
- El archivo `version.json` permite distinguir el contenido del repositorio del publicado por el servidor. Buscá la cadena `SIGLO23-20261105-V0.2.0`.
- En **Screener del libro**, seleccionar varias opciones dentro de un mismo grupo aplica **OR**; combinar grupos distintos aplica **AND**. Hay casillas para mercado, idioma, género, prioridad y calidad. Los campos avanzados (evidencia, años y cruce BNE) permanecen disponibles.
- Orden disponible por prioridad, evidencia, títulos A–Z/Z–A, autor, mercado, fechas de publicación y fallecimiento en ambos sentidos.
- Vistas **Lista** y **Tarjetas**. La imagen se muestra solo cuando hay metadato real en `image_url`, `cover_url`, `thumbnail_url`, `image`, `cover`, `thumbnail` o `images[0]`. La opción **Solo obras con imagen** filtra imágenes documentadas en el catálogo.
- La carga de nuevos registros continúa desde `catalogo-global.json`; las casillas se reconstruyen a partir de los nuevos valores automáticamente al recargar.
- **Aviso:** los 132 registros actuales no contienen URL de imagen. Que el filtro muestre 0 imágenes al principio es correcto. No se generaron portadas ficticias.

### Agregar obras

Editar `publicdomain/catalogo-global.json` y agregar objetos a la colección `works`, con un `id` nuevo por obra. Ejemplo **ficticio de estructura (no obra incorporada al catálogo)**:

```json
{
  "id": "S23-0133",
  "title_original": "Título original",
  "title_es": "Título para el screener",
  "author": "Autor",
  "market": "País o mercado estudiado",
  "language": "Idioma",
  "genre": "Ensayo",
  "priority": "Media",
  "published": "1901",
  "death": "1925",
  "quality": "C",
  "indicator_type": "Dato pendiente",
  "indicator_value": null,
  "evidence_url": "https://ejemplo.org/ficha",
  "image_url": "https://ejemplo.org/imagen.jpg",
  "image_rights_note": "Fuente, autor y licencia documentados; verificar antes de usar"
}
```

El ejemplo muestra nombres de campos, no URLs ni permisos verificados. Si no existe una imagen legítima, **omití `image_url`**, en vez de inventarla. Los campos de derechos y evidencia deben comprobarse antes de la publicación comercial. No confundir una imagen de cubierta editorial moderna con una imagen de dominio público.

### Prueba de despliegue

Abrir `/publicdomain/` y comprobar que arriba se lea `v0.2.0`. Si no aparece, comparar `/publicdomain/version.json`, `/publicdomain/screener.js?v=0.2.0` y `/publicdomain/screener-v2.css?v=0.2.0` con el repositorio. Si el dominio no sincroniza, ver el repositorio no equivale a haber desplegado. Un navegador con caché puede retener una versión anterior.

## Ampliación editorial v0.3.0 (2026-11-05)

- Se añadieron **175 obras** a las 132 iniciales (307 en total), procedentes de literatura, filosofía, ensayo, narrativa infantil y tradiciones de Asia, África, América Latina y Europa.
- Cada ficha contiene título original, denominación castellana de trabajo, autor/atribución, fallecimiento, primera publicación orientativa, género y etiquetas temáticas. Datos preliminares sujetos a cotejo bibliográfico, especialmente fechas antiguas y autorías tradicionales.
- Hay **30 registros con ediciones editoriales identificadas** por editor, año, idioma, ISBN y URL de ficha. La evidencia acredita que se ha editado una versión catalogada, no disponibilidad de stock ni libertad del contenido añadido.
- La función de búsqueda de ediciones de Open Library genera una consulta; el enlace **no** confirma la existencia de resultados para esa obra.
- Nuevos filtros por casillas para temáticas y estado de edición; se preservan filtros múltiples, lista/tarjetas, búsqueda, ordenación, imágenes opcionales y CSV.
- Las cifras de ventas o descargas no se han extrapolado a los títulos añadidos. Su indicador queda como **no disponible** hasta que exista una fuente específica.
- `version.json` identifica esta edición como **v0.3.0**, pero el despliegue en Hostinger sigue sin estar confirmado.

## Explicación de prioridades — v0.3.1 (2026-11-05)

El screener añade un panel metodológico y un desplegable **«¿Por qué figura como prioridad alta/muy alta?»** en cada obra de prioridad Alta o Muy alta. La prioridad viene de una **decisión previa del catálogo**, no de un algoritmo de ranking reproducible. No se simula una justificación que no esté documentada.

La explicación enumera: indicadores cuantitativos con unidades y períodos (cuando existen), información comercial o cultural contextual, edición comercial documentada, prioridad de mercado y línea editorial. También enumera lo **pendiente de demostrar**: métricas específicas de demanda, ediciones y derechos por territorio. Una obra muy alta sin indicador ni otras evidencias aparece explícitamente como hipótesis editorial sin respaldo de demanda.

Para **nuevas obras**, además de los campos habituales de `catalogo-global.json`, se admite opcionalmente `priority_reason` o `priority_rationale`: texto breve que documente el *motivo editorial real* de la clasificación; idealmente debe complementarse con `evidence_url`, `indicator_type`, `indicator_value`, `indicator_period` y la fuente correspondiente. No agregar razones inventadas ni confundir notoriedad, ediciones, rankings, descargas y ventas. Ninguna ficha cambió de prioridad automáticamente.

Archivos nuevos: `priority-rationale.js`, `priority-rationale.css`. Verificación: barra superior **v0.3.1** y `version.json` con identificador `SIGLO23-20261105-V0.3.1`. Es una verificación de archivos publicados, no un acceso autenticado a Hostinger.

## Taller de maquetación Spencer — M02

Se incorporó `spencer/maquetacion/` con tres archivos **obligatorios**: `index.html`, `editor.css`, `editor.js` y un `README.md` explicativo. La página principal `spencer/index.html` enlaza la nueva sección desde el menú, una acción destacada y su propio bloque temático.

La herramienta permite vista previa de cubierta con lomo, páginas enfrentadas, tipografía y márgenes en mm/pt, guía de sangrado, texto de muestra editable, extras, páginas blancas automáticas al iniciar en recto, estimación de lomo por calibre, guardar/importar JSON y abrir prueba PDF mediante el navegador. Es una **simulación** sin el manuscrito final; sus cálculos no constituyen un archivo listo para imprenta. La imagen de portada seleccionada solo se conserva temporalmente en el navegador.

Ruta prevista: `https://rngmarketdriven.com/publicdomain/spencer/maquetacion/`. **No está confirmada la publicación automática en Hostinger**; además de `spencer/index.html`, deben transferirse los tres archivos del módulo manteniendo la estructura de directorios.


## M02 — Vista del libro completo

- Nueva grilla navegable de **todas las páginas interiores calculadas**, con miniaturas y búsqueda por página, sección y texto importado.
- Cada miniatura abre su **pliego** (páginas par/impar) con zoom y un inspector de texto completo sin recortes.
- Los archivos TXT/Markdown se importan **por sección**, sin subirlos automáticamente a ningún servidor; el mapa muestra fragmentos reales solo después de esa carga.
- **Montserrat** para texto y títulos, pesos 100–900 y estilos redonda/cursiva, servida mediante Google Fonts (OFL).
- Sin máximos arbitrarios en los controles de márgenes, sangría, separación entre párrafos y sangrado; aviso de diseño inviable si se agota la caja de texto.
- Para publicar deben transferirse juntos `spencer/maquetacion/index.html`, `editor.css`, `editor.js` y `overview.js`. `version.json` contiene el marcador M02.
- **Los cambios están confirmados en GitHub; no hay comprobación del despliegue efectivo en Hostinger.**

## Spencer — Maquetación M03: transcripción inglesa de 1884

- Archivo `spencer/maquetacion/original-ingles-1884.json`: **45.792 palabras** en seis partes (prefacio, *The New Toryism*, *The Coming Slavery*, *The Sins of Legislators*, *The Great Political Superstition*, *Postscript*).
- `spencer/maquetacion/original-loader.js` precarga el texto desde el propio repositorio, comprueba sus seis partes y su recuento y reemplaza las páginas ficticias del núcleo del libro en la grilla.
- **Texto original:** extensión verbal real del archivo fuente, sujeta a cotejo con facsímil de 1884–1885 para corregir variantes y erratas. **Páginas:** estimadas geométricamente según el formato, cuerpo y márgenes. **Extras:** mantienen estimaciones de páginas editables.
- Configuración inicial de prueba (A5, Georgia 10,5 pt): aproximadamente 195 páginas de texto inglés, 372 páginas interiores totales y 7 blancos; no confundir con paginación definitiva.
- Se mantuvo la importación de futuros textos traducidos por sección. El texto original se conserva de forma independiente y la grilla se actualiza según el texto activo.
- Para publicar el módulo hacen falta los seis archivos de código/datos `index.html`, `editor.css`, `editor.js`, `overview.js`, `original-loader.js`, `original-ingles-1884.json` en el mismo directorio.
- Cambios en GitHub confirmados. **Sin comprobación de despliegue Hostinger**.
