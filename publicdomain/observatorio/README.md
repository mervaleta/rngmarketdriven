# SIGLO23 — Observatorio de dominio público

Versión **0.1.0**, 2026-11-05. Área autónoma en `/publicdomain/observatorio/`.

## Contenido
- 9 fuentes estratégicas con HTML individual.
- 12 precandidatos de Duke 2025–2026 con HTML individual, índice con filtros, JSON y CSV.
- Calendario orientativo de EE. UU. 2025–2031 y guía de validación territorial.
- Metodología de seis controles.
- Sin autorizaciones comerciales, importadores automáticos ni cron activo.

## Actualización modular
Los registros y los HTML individuales se modifican sin reemplazar el resto del sitio. Conservar sincronizados `datos/candidatos.json` y el HTML de cada ficha; actualizar el índice cuando se agreguen fichas. Los CSS/JS están aislados en `assets/`.

## Fuentes
- https://cspd.law.duke.edu/publicdomainday/2026
- https://cspd.law.duke.edu/publicdomainday/2025
- https://guides.library.cornell.edu/copyright/publicdomain
- https://creativecommons.org/public-domain/
- https://www.argentina.gob.ar/servicio/tramitar-el-uso-de-obras-de-dominio-publico

## Pendiente
Verificar conexión entre GitHub y Hostinger. API importers, desduplicación y derechos por país requieren fase posterior.
