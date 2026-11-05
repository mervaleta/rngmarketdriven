# Registro de versiones — Editorial Siglo23 /publicdomain

## v0.3.1 — 2026-11-05

- Explicación desplegable **«¿Por qué figura como prioridad alta/muy alta?»** en cada obra marcada con esas etiquetas.
- Se distingue la **prioridad editorial preasignada** del respaldo observado: indicadores medidos por título, información cualitativa, edición comercial catalogada, contexto de mercado y línea editorial.
- Al no existir fórmula original de puntuación ni motivos guardados en el catálogo, se evita atribuir causalidad a indicios post hoc.
- Se marca explícitamente cuándo **no hay evidencia suficiente** para justificar una prioridad elevada, y qué falta auditar.
- Panel metodológico con recuento de prioridades y de obras que carecen de respaldo.
- Admite en obras nuevas el campo opcional `priority_reason` para consignar una justificación editorial explícita (debe ser comprobable).
- Novedades implementadas en `priority-rationale.js` y `priority-rationale.css`, sin cambiar las 307 prioridades originales.

## v0.3.0 — 2026-11-05

- Catálogo ampliado de 132 a 307 fichas de obras (175 nuevas) y 31 mercados o ámbitos de investigación.
- Temáticas estructuradas por obra, autor, año de publicación y género; conservar faltantes como pendientes de investigación.
- 30 ediciones comerciales documentadas mediante ficha editorial, año, ISBN, idioma y enlace. Esto no comprueba existencias ni derechos de la traducción.
- Filtros adicionales múltiples por temáticas y estado editorial, manteniendo las casillas, imágenes y ordenamientos de v0.2.0.
- Exportación CSV enriquecida con temáticas y atributos de edición, incluyendo enlaces a los editores.
- Separación metodológica entre popularidad, mera relevancia cultural, estado editorial y viabilidad jurídica.
- La nueva versión solo está confirmada en GitHub; la actualización de Hostinger sigue sin verificarse.

## v0.2.0 — 2026-11-05

- Número de versión visible y verificable desde `version.json`.
- Screener con casillas de selección múltiple por prioridad, mercado, idioma, género y calidad.
- Combinación OR dentro del mismo grupo y AND entre grupos distintos.
- Ordenación por prioridad, evidencia, nombre A–Z / Z–A, autor, mercado, publicación y fallecimiento en ambos sentidos.
- Modos de visualización Lista / Tarjetas.
- Visualización de portadas o imágenes cuando una obra incluye metadatos de URL; filtro "Solo obras con imagen".
- Valores de las casillas generados desde el JSON: preparados para recibir nuevas obras.
- Carga de JS y CSS con parámetro de versión para evitar reutilizar recursos de una publicación anterior.
- Sin cambios en el número de obras (132) ni autores (5.228). Ninguna imagen añadida porque las fuentes actuales no tienen campos de imagen.

## v0.1 — 2026-11-05

- Panel, base de autores y screener internacional inicial.
- 132 obras / 5.228 autores / 21 mercados / 16 fuentes.
- Secciones modulares de colección, recursos y Spencer.

## Verificación

Comprobar en el dominio la insignia `v0.2.0` y la cadena `SIGLO23-20261105-V0.2.0` en `/publicdomain/version.json`.
El repositorio de GitHub no constituye por sí solo prueba de despliegue en Hostinger.
