# BYMA catalog import

This importer stores the Caja de Valores CEDEAR catalog in a separate SQLite instrument database.

- Source: `https://cajadevalores.com.ar/Servicios/Cedears`
- Downloaded workbook: `Tablas - Caja de Valores (1-06-2026).xlsx`
- Database: `market-history/data/byma_instruments.sqlite`
- JSON export: `market-history/data/byma_instruments.json`
- Importer: `market-history/scripts/import_byma_catalog.py`

The first verified import contains 59 instruments: 35 CEDEARs of shares and 24 CEDEARs of ETFs. It is intentionally not yet claimed to be the complete BYMA universe: the workbook covers CEDEARs, while the requested local equities (Panel Líder/General) and fixed income (government bonds, letras and ONs) require the current BYMA master/instrument files or an authorized BYMADATA/IOL source. No prices were fabricated or inserted.
