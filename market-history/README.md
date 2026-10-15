# CoinGecko validation (2026-10-15 UTC)

- The Cryptódromo source catalog was read for reference only; it remains untouched because it is synthetic and read-only.
- Requested 14 slots: BTC, ETH, SOL, IOTA, AVAX, DOT, ADA, CAKE, BNB, POL, MATIC, DOGE, SUSHI, XRP.
- CoinGecko `/coins/markets` returned live records for 14 requested IDs. `market_chart?vs_currency=usd&days=30&interval=daily` returned 31 observations for 13 assets: bitcoin, ethereum, solana, iota, avalanche-2, polkadot, cardano, pancakeswap-token, binancecoin, polygon-ecosystem-token, dogecoin, sushi, ripple.
- `matic-network` returned HTTP 200 but zero `prices` observations; CoinGecko identifies it as `MATIC (migrated to POL)`. It was excluded as legacy/non-useful and replaced by the current `polygon-ecosystem-token` → `CRYPTO:POL/USD` slot. MATIC and POL are not duplicated.
- No synthetic prices were inserted. The real run used CoinGecko keyless API, 2-second inter-asset pauses, and was idempotent.
- The existing DB now contains 18 live CoinGecko assets overall; this run loaded 13 requested replacement/current assets with 31 daily observations each, adding 13 rows because prior windows were already present. Crypto total is 603 rows.
- Manifest: `/data/var/rng-market-history/coingecko-manifest.json`.


This directory is isolated and is not deployed, not consumed by RNGMarketDriven or Cryptodromo, and does not touch the commercial RNG SQLite database.

## CoinGecko keyless crypto MVP

- Manual entrypoint: `scripts/collect_coingecko.py`; no cron and no production integration.
- Source: CoinGecko keyless public API, `GET /api/v3/coins/{id}/market_chart?vs_currency=usd&days=30&interval=daily`.
- Requested assets are capped at 15, with a 2-second pause between symbols and a 30-second request timeout; no credentials are used.
- Default IDs: `bitcoin`, `ethereum`, `binancecoin`, stored as `CRYPTO:BTC/USD`, `CRYPTO:ETH/USD`, `CRYPTO:BNB/USD`.
- Each price array timestamp is preserved as UTC `source_timestamp_utc`; captured-at UTC, source URL, and SHA-256 of the raw response are stored.
- CoinGecko is an aggregated market-data provider, not an exchange; values are not Binance-specific. Missing observations are not interpolated. API availability/rate limits apply.
- Use and attribution are subject to CoinGecko terms/licensing; official keyless API documentation: https://docs.coingecko.com/docs/keyless-public-api.
- Current catalog includes BTC, ETH, BNB, SOL, ADA, DOGE, AVAX, DOT, LINK, UNI, LTC, SHIB, and TRX. The current run returned 13 usable assets and 420 crypto price rows; XRP and Polygon IDs returned HTTP 404 and were recorded as blockers rather than synthesized.
- No other-market dataset was loaded: candidate sources were not accepted without a verified compatible license and machine-readable provenance.
- Manifest: `/data/var/rng-market-history/coingecko-manifest.json`.


This directory is isolated and is not deployed, not consumed by RNGMarketDriven or Cryptodromo, and does not touch the commercial RNG SQLite database.

- Runtime database: `/data/var/rng-market-history/market-history.sqlite`
- Manifest: `/data/var/rng-market-history/manifest.json`
- Scheduler entrypoint: `/data/projects/rngmarketdriven/market-history/scripts/monthly_collect.py`
- Provider: Binance public spot klines, daily interval (`1d`), UTC session timezone
- Explicit catalog: `BTCUSDT`, `ETHUSDT`, `BNBUSDT`; pass `--symbols` to select a subset
- Default window: previous closed UTC month; September 2026 is configurable with `--year 2026 --month 9`
- Close prices are stored as exact decimal text; raw response JSON is hashed with SHA-256
- Pagination, bounded retries/backoff, append-only idempotence, SQLite integrity check, and manifest coverage reporting are implemented
- Missing candles are reported, never interpolated

The first real September 2026 attempt was made for all three symbols. Binance returned HTTP 451 from this runtime, so no real rows were inserted; the manifest records the blocker and zero coverage. No credentials or scheduler changes were made.
