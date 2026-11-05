# Editorial Siglo23 — Dominio público

Repositorio de trabajo: `mervaleta/rngmarketdriven`  
Ruta: `/publicdomain/`  
Fecha del inventario: 2026-11-05

## Contenidos ya incorporados

| Archivo | Contenido | Estado |
|---|---|---|
| `index.html` | Panel editorial integral: 5.228 fichas de autores, filtros, secciones de fuentes, archivo visual y derechos | En GitHub |
| `screener.js` | Filtros multivariables de libros y exportación CSV | En GitHub |
| `catalogo-global.json` | 132 obras internacionales, 21 mercados y 16 fuentes | En GitHub |
| `autores.json` | Los 5.228 autores del índice, separados en datos reutilizables | En GitHub |
| `autores.csv` | Exportación descargable de los 5.228 autores | En GitHub |
| `autores-1945.csv` | Subconjunto de 153 autores con fallecimiento 1945 | En GitHub |
| `coleccion/index.html` | Consulta modular filtrable de las 132 obras internacionales | En GitHub |
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
