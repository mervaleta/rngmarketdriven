# El humor de los mercados · Editorial Siglo23

**Estado:** edición de trabajo v0.1.0, 7 de noviembre de 2026. **Alojamiento confirmado:** rama `main` de `mervaleta/rngmarketdriven`. **Hostinger:** sincronización externa no confirmada.

## Objetivo

Una investigación y un libro físico ilustrado sobre cómo artistas plásticos de distintas épocas y regiones representaron la riqueza, la circulación, las acciones, la deuda, el crédito, las crisis, las instituciones y las desigualdades. La selección se amplía en el tiempo y en el espacio, sin presentar como «globalmente completa» una muestra en construcción.

## Contenidos disponibles

- `index.html`, `styles.css` y `app.js`: sitio editorial navegable con modo **pliegos / libro completo / lectura**, archivo filtrable, línea de tiempo, fuentes, ficha de cada obra, selección personal y notas editables guardadas en el navegador y exportables como JSON.
- `capitulos.json`: siete capítulos históricos con ensayos breves e interpretación artística. No son todavía los textos definitivos ni un libro terminado.
- `obras.json`: 18 fichas de obras seleccionadas y fuentes, con incertidumbres indicadas explícitamente. El caso brasileño es una candidata sin colación de ejemplar original. Se corrigió la fecha de *Floraes Gecks-Kap*: estampa de 1720 acerca de la burbuja de 1637.
- `imagenes/M001.jpg`, `imagenes/M008.jpg`: copias web Open Access del Metropolitan Museum realmente incorporadas.
- `imagenes/manifest.json`: estado verificable de imágenes propias, dimensiones y errores. Las fotografías no disponibles se muestran como pendientes; no se sustituyen por obras inventadas.
- `scripts/actualizar-imagenes.py`: recupera grabados Met / LOC con reintentos y registro de procedencia.
- `scripts/incorporar-commons.py`: selección de 22 láminas de *Het Groote Tafereel der Dwaasheid* desde Wikimedia Commons, con metadatos por pieza y licencia indicada por la fuente.
- `.github/workflows/mercados-imagenes.yml`: canal de automatización de la importación; verificar resultados en `laminas.json` e `imagenes/manifest.json` antes de afirmar que las imágenes están descargadas.

### Maqueta

El visor genera **61 páginas de contenido base** (portada, preliminares, siete aperturas de capítulo, ensayos, 18 pares lámina/lectura, cierre). El recuento aumenta cuando `laminas.json` incorpora imágenes del *Tafereel*. Nota: el conteo anterior de 61 páginas era para 17 obras; tras agregar Brasil son 63 páginas base (61 + 2). En cualquier caso, **el conteo es dinámico** y debe revisarse en el visor. Formato conceptual: 270 × 340 mm. La prueba PDF del navegador **no es PDF/X** ni tiene comprobación de rasterizado, color, fuentes o sangrado profesional.

### Derechos y contexto

- Una obra histórica y su **archivo digital** no comparten necesariamente la misma situación de licencia.
- Commons y museos proporcionan pistas precisas para verificar imagen, autor, fecha y procedencia. Su presencia no certifica permiso global para explotación comercial.
- Los maestros para libro de lujo se examinan uno a uno y se descargan desde el repositorio custodiante en la mayor resolución legítimamente disponible.
- El arte satírico reproduce en ocasiones prejuicios racistas, antisemitas o coloniales: debe contextualizarse. La sátira del siglo XVIII sobre Mississippi y South Sea se cruza con la historia colonial y de la esclavitud.
- Los ejemplos posteriores a 1920 y actuales requieren especial atención a la vigencia del derecho de autor y a los permisos de reproducción.

## Capítulos

1. **Cuando el dinero toma cuerpo**: grabado europeo, alegorías de la avaricia.
2. **La locura tiene precio**: tulipomanía, monos y el deseo de participar.
3. **1720: los papeles del viento**: John Law, Mississippi, South Sea, la producción holandesa y Hogarth.
4. **La Bolsa se convierte en teatro**: la prensa litográfica de Daumier.
5. **El pez gato del beneficio**: Japón, namazu-e, catástrofe y trabajo.
6. **El capital dibuja el poder**: Estados Unidos, Brasil y Argentina, monopolios y prensa satírica.
7. **La risa después del derrumbe**: investigación abierta del siglo XX y XXI.

## Nuevas áreas prioritarias

- Antes de 1500: alegorías medievales del dinero y la usura (identificación y derechos).
- 1850–1930: América Latina, África, India, China, mundo otomano, Europa oriental y Sudeste Asiático.
- 1910–2000: caricatura de crisis, inflación y propaganda política.
- 2000–2026: humor financiero digital y licencias.
- Conectar cada fuente a un máster web propio, una imagen de imprenta o una reserva editorial de resolución insuficiente.

## Cómo comprobar la edición

En GitHub, revisar si existen `laminas.json` con objetos y `imagenes/*.jpg` y controlar el manifiesto.
En la URL de Hostinger **no debe afirmarse publicación** hasta obtener HTTP 200 para `/publicdomain/mercados/`, `/publicdomain/mercados/app.js`, `/publicdomain/mercados/obras.json` y comprobar interacción y versiones. El repositorio y la carpeta pública pueden diferir.

Bibliografía activa: Met, Rijksmuseum, Harvard Baker Library, NGA, Library of Congress, Biblioteca Nacional de Argentina, Fundação Biblioteca Nacional Brasil, Universidad de Tokio, DBNL, NYPL y Wikimedia Commons.
