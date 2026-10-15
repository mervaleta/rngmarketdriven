# Base de datos semanal del MVP

Este módulo nuevo es una base aislada para implementación futura. No está conectado
a los juegos, no migra datos y no ejecuta consultas MySQL ni despliegues al importarse.
Precios y catálogo son fixtures inventados; no son cotizaciones actuales.

## Decisiones

- 30 instrumentos: diez cripto, diez acciones EE. UU. y diez BYMA; conserva CRES y EDN de Prode.
- Semana de siete días UTC comenzando lunes. Cripto: 10.080 filas por activo.
- Acciones: solo sesiones configuradas en hora local; intervalos [apertura, cierre).
  La fila de 15:59 representa el último minuto previo al cierre de las 16:00.
- Identidad incluye mercado, símbolo y moneda. YPFD local no equivale a ADR YPF.
- DECIMAL(24,10), sin redondear porcentajes antes de aplicar reglas.
- Apertura: cambio minuto NULL, cambio desde apertura 0 y gap de cierre previo separado.
- Hash canónico incluye catálogo, horarios, semilla y todos los precios. Es una
  huella reproducible de bytes; no una garantía de imparcialidad o imprevisibilidad.
- Selección de tramos con semilla explícita, sin sesgo de módulo, preservando orden
  y sesión. Repetir la semana es elegir otra ejecución, nunca unir el cierre a apertura.
- La generación ocurre una vez; lecturas futuras no regeneran datos.

## Calendarios pendientes

`config/synthetic_week.example.json` es un ejemplo, NO un calendario oficial.
EE. UU. usa 09:30–16:00 America/New_York (sesión regular NYSE); BYMA usa un horario
de ejemplo 11:00–17:00 pendiente de validación por instrumento y plazo de liquidación.
Los días cerrados y cierres reducidos se suministran explícitamente; listas vacías
no significan que no haya feriados. Antes de cargar un dataset aprobado, confirmar
horarios, feriados, fechas y versión del calendario. Las subastas no están modeladas.
Fuentes para validación: https://www.nyse.com/trade/hours-calendars y
https://www.byma.com.ar/comunicados/com19024-horarios (PDF no recuperado en esta sesión).

El ejemplo produce 138.300 filas: 100.800 cripto + 19.500 EE. UU. + 18.000 BYMA,
en una semana sin excepciones de calendario. Este recuento no describe una semana bursátil oficial.

## Ejecución local

Python 3.9+ con base de zonas horarias del sistema. No requiere dependencias de pip.

```sh
python3 -m unittest discover -s tests -p test_synthetic_week.py -v
python3 -m tools.export_synthetic_week --config config/synthetic_week.example.json --start 2026-10-05 --seed demo-week-v1 --output /tmp/rng-demo-week
```

El exportador rechaza un directorio existente y escribe JSON/CSV local. No importa
la semana en MySQL. La semilla de fixtures es pública y explícita, no un secreto.
`verify_week` reconstruye el contenido para detectar manipulación; no ejecutarlo
por cada consulta de precio (hacerlo al aprobar/cargar y conservar hash verificado).

## MySQL y siguientes pasos

`sql/market_dataset_mysql.sql` propone tablas nuevas para datasets, instrumentos,
precios y ejecuciones. No fue aplicado ni probado contra una instancia MySQL.
No ejecutar el DDL en producción. Para congelar un dataset se necesita un importador
transaccional que valide hash, conteos, unicidad, precisión y calendario, y marque
estado frozen solo al completar. Usar privilegios de lectura para el runtime.

Después implementar repositorio MySQL con consultas parametrizadas por dataset,
instrumento y minuto; adapter común para GamesEngine, EaaS, Prode, Mochi y Lava.
Migrar gradualmente con comparación de resultados. No conectar este generador a
un sistema de pagos; autenticación, ledger e idempotencia siguen pendientes.

La selección actual es por instrumento y una sesión. Si un juego compara varios
activos, necesita un selector sobre intersección de timestamps y un manifest común;
no elegir tiempos distintos por activo. No transportar fechas del fixture como si
fueran fechas actuales: separar fecha de simulación de fecha de ejecución.
