# Studio: enlaces de referidos del glosario y el ropero

El catálogo del glosario está en `cross/includes/glossary-referrals.json`, por slug. Cada ficha contiene sugerencias editoriales y una lista `offers` inicialmente vacía. El ropero usa `offers` de cada ficha en `wardrobe.json`.

Para publicar una opción, agregar a la lista correspondiente:
```json
{"type":"product","label":"Nombre real del producto","merchant":"Comercio real","description":"Detalle opcional","url":"https://..."}
```
Para servicios usar `"type":"service"`. Sustituir la URL de ejemplo por el enlace HTTPS real del proveedor con el identificador de referido, sin modificar sus parámetros. No publicar URLs de ejemplo. El módulo admite varias ofertas, omite URLs inválidas, incluye aviso de afiliación y usa rel="sponsored nofollow noreferrer noopener". No hace seguimiento ni solicita datos del visitante. Las sugerencias editoriales no son ofertas verificadas. En conceptos abstractos no se recomienda una compra por defecto.

Las imágenes editoriales siguen separadas de los productos: no implican que el comercio venda exactamente el artículo fotografiado ni que el autor de la imagen respalde una oferta.
