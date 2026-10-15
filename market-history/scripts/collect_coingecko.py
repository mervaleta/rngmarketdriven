#!/usr/bin/env python3
"""Manual bounded CoinGecko keyless collector; no cron or production integration."""
import argparse
import json
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from src.coingecko import CoinGeckoCollector, ASSETS
from src.store import HistoryStore

DEFAULT_DB = Path('/data/var/rng-market-history/market-history.sqlite')
DEFAULT_MANIFEST = Path('/data/var/rng-market-history/coingecko-manifest.json')
DEFAULT_COINS = list(ASSETS)


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument('--db', type=Path, default=DEFAULT_DB)
    parser.add_argument('--manifest', type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument('--coins', default=','.join(DEFAULT_COINS))
    args = parser.parse_args(argv)
    coins = [x.strip().lower() for x in args.coins.split(',') if x.strip()]
    store = HistoryStore(args.db)
    store.initialize()
    errors = []
    coverage = {}
    rows_added = 0
    try:
        coverage = CoinGeckoCollector(store).collect(coins)
        rows_added = sum(v['rows_added'] for v in coverage.values())
        errors.extend(f'{coin}: {data["error"]}' for coin, data in coverage.items() if 'error' in data)
    except Exception as exc:
        errors.append(f'{type(exc).__name__}: {exc}')
    with sqlite3.connect(args.db) as conn:
        integrity = conn.execute('pragma integrity_check').fetchone()[0]
        assets = conn.execute('select count(*) from assets').fetchone()[0]
        prices = conn.execute('select count(*) from prices').fetchone()[0]
        source_count = conn.execute("select count(*) from sources where provider='coingecko'").fetchone()[0]
        bounds = conn.execute("select min(minute), max(minute) from prices where asset_id like 'CRYPTO:%'").fetchone()
    manifest = {'provider': 'coingecko', 'api': 'keyless public API', 'market': 'aggregated crypto market data', 'interval': 'daily', 'requested_days': 30, 'coins': coins, 'coverage': coverage, 'rows_added': rows_added, 'assets_total': assets, 'prices_total': prices, 'coingecko_sources': source_count, 'crypto_min_timestamp_utc': datetime.fromtimestamp(bounds[0], timezone.utc).isoformat().replace('+00:00', 'Z') if bounds[0] else None, 'crypto_max_timestamp_utc': datetime.fromtimestamp(bounds[1], timezone.utc).isoformat().replace('+00:00', 'Z') if bounds[1] else None, 'integrity_check': integrity, 'errors': errors, 'captured_at_utc': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'), 'source_documentation': 'https://docs.coingecko.com/docs/keyless-public-api', 'limitations': 'CoinGecko aggregated market data, not exchange-specific prices; keyless public API availability/rate limits apply; attribution required under CoinGecko terms; no interpolation.'}
    args.manifest.parent.mkdir(parents=True, exist_ok=True)
    args.manifest.write_text(json.dumps(manifest, indent=2, sort_keys=True) + '\n')
    print(json.dumps(manifest, sort_keys=True))
    return 1 if errors else 0

if __name__ == '__main__':
    raise SystemExit(main())
