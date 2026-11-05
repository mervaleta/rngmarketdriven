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
