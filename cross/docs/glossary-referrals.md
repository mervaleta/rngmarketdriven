# Biblioteca común de Studio

- `cross/includes/glossary.json`: catálogo único y fuente editorial. Incluye todas las antiguas prendas, conceptos y servicios. `views` controla en qué vistas temáticas aparece cada ficha; el glosario incluye todas.
- `slug` identifica una ficha; `slug_aliases` conserva enlaces antiguos. `aliases` son sinónimos para búsqueda. `parent`, `service_parent` y `related` enlazan variantes y conceptos.
- `cross/includes/glossary-images.json`: imágenes por slug canónico. `image_slug` permite reutilizar una galería editorial pertinente sin copiar metadatos.
- `cross/includes/glossary-referrals.json`: sugerencias y ofertas por slug canónico. Añadir objetos a `offers` con `type` (product/service), `label`, `merchant`, `description` opcional y `url` HTTPS real con referido. No inventar ofertas; se indica la posible comisión.
- Ropero y Servicios son vistas filtradas, no catálogos independientes. Todas las tarjetas enlazan a `glosario/index.php?f=SLUG`; las antiguas rutas de detalle redirigen allí.
- Mary Jane/Mercedita, Block heel/Taco bloque y Wide leg/Pantalón wide leg se fusionaron. Conceptos amplios (culotte, evasé, fishnet, halter, bodycon) conservan su ficha conceptual y las variantes específicas relacionadas. Coffin (uñas) no es el zapato ballerina.
- El antiguo `wardrobe.json` se retira del código activo; su contenido original se conserva en el historial de Git. No volver a editar dos catálogos.
