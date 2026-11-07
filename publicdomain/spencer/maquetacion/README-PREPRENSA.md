# Siglo23 · Spencer — Preprensa experimental M10

Fecha: 7 de noviembre de 2026. Fuente: `publicdomain/spencer/maquetacion/`.
**Estado:** integrado en `main` como extensión experimental M10; publicación en Hostinger pendiente de verificación. No equivale a aprobación de PDF de imprenta ni a despliegue automático en Hostinger.

## Qué se incorpora

- `preprensa.html`, `preprensa.css`, `preprensa.js`: una segunda interfaz de composición, independiente de la grilla tradicional M09.
- Paged.js **0.4.3**, MIT, cargado desde CDN versionado para pruebas. No está almacenado localmente; requiere conexión. Antes de usar comercialmente, evaluar empaquetado local y fijación de integridad / política CSP.
- Texto real: seis partes originales de 1884 del JSON existente, con recuperación de los cambios que el usuario haya guardado en su navegador; biografía, estudio y epílogo desde las fuentes Markdown. Se conservan las secciones habilitadas en el plan M09.
- Aperturas independientes para los cuatro ensayos con página izquierda de reflexión y derecha de título, comienzo de lectura en recto y estilo tipográfico parametrizable. Las láminas de dos hojas son **pruebas de reparto visual**, no recortes aprobados de fotografía a sangre.
- Índices editoriales: se componen las 86 entradas onomásticas, 53 analíticas y 56 referencias de obras del JSON existente. Sus referencias muestran sección de procedencia; los **folios definitivos no están calculados**. El índice de contenidos se resuelve mediante `target-counter()`, sujeto a la validación del motor.
- Tamaño de corte, caja simétrica interior/exterior, cuerpo, interlínea y sangrado declarativo. `@page :left` y `@page :right`, `orphans`, `widows`, saltos de sección; el recuento mostrado viene de Paged.js, no de palabras/página estimadas.
- Zoom para revisión de pliegos y botón `Imprimir / guardar PDF` de prueba; exportación HTML y perfil JSON de preprensa.
- El perfil de preprensa se guarda en `localStorage('siglo23-spencer-preprensa-v1')` sin modificar `siglo23-spencer-maquetacion-v1` (M09).
- `estudio-audit.js`: diagnóstico legible dentro de M09 y exportación de un reporte JSON, sin alterar manuscritos, índices o la distribución existente.
- `estudio-theme.css`: identidad **azul editorial** aplicada exclusivamente a la interfaz del taller, no al papel.
- `../../estudio/`: landing multiproyecto, paleta de cinco libros y rutas con estado «previsto» cuando el despliegue no esté confirmado.

## Flujo editorial correcto

1. Abrir el taller M09; terminar de cargar los seis textos de 1884, biografía, estudio, epílogo e índices.
2. Exportar el respaldo JSON M09 antes de migraciones o restauraciones. Los datos pueden estar limitados por la cuota local del navegador.
3. Abrir `preprensa.html` **en el mismo origen web**; recupera el estado M09 del navegador. Si no hay estado local usa los originales del repositorio.
4. Ajustar las medidas de salida y ejecutar «Componer todo el interior». El navegador debe poder cargar Paged.js desde CDN. Un número de páginas solo se considera generado cuando aparece el estado «páginas compuestas».
5. Revisar capítulo por capítulo y láminas, imágenes que no cargaron, notas, desbordes, folios, páginas de cortesía, ortotipografía y márgenes de imprenta.
6. Descargar el HTML paginable si se requiere seguir trabajando en otra herramienta. No se deben imprimir los archivos sin control de color, fuentes, sangrado y PDF/X.

## Limitaciones expresas

- **No** existe un backend WeasyPrint configurado ni salida PDF/X-4 certificada.
- La preprensa no crea marcas de corte ni cajas PDF `TrimBox` / `BleedBox`; el sangrado es un dato de verificación, no corte efectivo a sangre.
- Paged.js no garantiza por sí mismo el cotejo textual, perfil ICC, CMYK, imposición, tipografías incrustadas ni calidad de archivo de imagen.
- Las notas no están enlazadas con un sistema completo de notas a pie; las llamadas y referencias bibliográficas deben corregirse.
- La distribución del índice temático / onomástico y folios de ocurrencia queda para la etapa de galeradas.
- Hay imágenes externas en el dossier de Spencer. El compositor puede fallar si el recurso no carga; verificar derecho de reproducción y descargar másteres a resolución suficiente antes de producir.
- El HTML exportado no incluye las fuentes o fotografías incrustadas y no debe considerarse paquete independiente.
- La combinación de Paged.js con imágenes de doble página y el visor de impresión necesita **pruebas visuales reales en navegador**; el check de sintaxis no equivale a aceptación visual.
- Los cambios en GitHub **no** confirman Hostinger.

## Próximas fases, una vez validado Spencer

1. Resolver PDF/X-4 mediante servicio de exportación (candidato WeasyPrint) y prueba contra imprenta.
2. Generar índice con folios reales y vínculos verificables a la página exacta.
3. Banco local de másteres gráficos y preflight de ppp efectivo, perfiles ICC y dimensiones de impresión.
4. Componentizar la lógica común (motor de paginación, perfiles, preflight, diseño) para Gabinete, Siglotímicos, Voyager y Camoatí, dejando adaptadores de contenido independientes.
5. Usuarios, permisos, almacenamiento del lado servidor, comentarios y control de versiones antes de habilitar trabajo colaborativo real.

## Licencias y fuentes

- Paged.js: https://github.com/pagedjs/pagedjs (MIT).
- Documentación de CSS Paged Media: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Paged_media
- Original inglés: `original-ingles-1884.json`; fuentes y pendientes registrados en `README.md` y en el propio JSON.
- Metadatos editoriales: `editorial-assets.js`, `chapter-notes.js`, `indices-editoriales.json`.


## Verificaciones ejecutadas el 7/11/2026

- GitHub Actions (smoke M10): **aprobado**; estructura, 45.792 palabras, seis partes, tres índices y sintaxis JavaScript.
- Publicación Hostinger vía GitHub Actions: **verificada** para el taller M10, compositor, JS/CSS y las dos rutas de landing en RNG Market Driven. La URL `santoroydonoso.com/siglo23/` sigue sirviendo un contenido anterior (publicación pendiente).
- Chromium/Puppeteer: **aprobado** al componer el prefacio real en tres páginas; fuente presente y botón de impresión habilitado. Esta prueba no verifica todo el libro ni prueba PDF/X.
- En la segunda ejecución del navegador se observó un **HTTP 403 en una petición inicial automatizada** a `preprensa.html`, antes de una carga posterior exitosa. Revisar si se reproduce en navegación humana y, en caso afirmativo, analizar reglas del alojamiento/CDN; no se diagnosticó su causa.
