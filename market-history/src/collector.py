#!/usr/bin/env python3
"""Minimal Binance spot daily collector for the isolated history store."""
import argparse
import hashlib
import json
import sqlite3
import time
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
import sys
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from src.store import HistoryStore

DEFAULT_DB = Path('/data/var/rng-market-history/market-history.sqlite')
DEFAULT_MANIFEST = Path('/data/var/rng-market-history/manifest.json')
BINANCE_URL = 'https://api.binance.com/api/v3/klines'
ASSETS = {
    'BTCUSDT': {'asset_id': 'BINANCE:BTCUSDT', 'ticker': 'BTCUSDT', 'name': 'Bitcoin / Tether spot', 'scale': 8},
    'ETHUSDT': {'asset_id': 'BINANCE:ETHUSDT', 'ticker': 'ETHUSDT', 'name': 'Ether / Tether spot', 'scale': 8},
    'BNBUSDT': {'asset_id': 'BINANCE:BNBUSDT', 'ticker': 'BNBUSDT', 'name': 'BNB / Tether spot', 'scale': 8},
}


def month_bounds_utc(year, month):
    start = datetime(year, month, 1, tzinfo=timezone.utc)
    if month == 12:
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(year, month + 1, 1, tzinfo=timezone.utc)
    return int(start.timestamp() * 1000), int(end.timestamp() * 1000)


def days_in_month(year, month):
    start, end = month_bounds_utc(year, month)
    return (end - start) // 86400000


def previous_closed_month(now=None):
    now = now or datetime.now(timezone.utc)
    return (now.year - 1, 12) if now.month == 1 else (now.year, now.month - 1)


def write_manifest(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, sort_keys=True) + '\n')


class BinanceCollector:
    def __init__(self, store, opener=None, timeout=20, retries=3, sleep=time.sleep):
        self.store = store
        self.opener = opener or self._open
        self.timeout = timeout
        self.retries = retries
        self.sleep = sleep

    @staticmethod
    def _open(url, timeout):
        with urlopen(Request(url, headers={'User-Agent': 'rngmarketdriven-market-history/1'}), timeout=timeout) as response:
            return json.loads(response.read())

    def fetch(self, symbol, start_ms, end_ms):
        rows, cursor = [], start_ms
        while cursor < end_ms:
            query = urlencode({'symbol': symbol, 'interval': '1d', 'startTime': cursor, 'endTime': end_ms - 1, 'limit': 1000})
            url = BINANCE_URL + '?' + query
            last = None
            for attempt in range(self.retries):
                try:
                    last = self.opener(url, self.timeout)
                    break
                except Exception:
                    if attempt + 1 == self.retries:
                        raise
                    self.sleep(2 ** attempt)
            if not isinstance(last, list):
                raise RuntimeError(f'Binance response for {symbol} was not a kline list')
            if not last:
                break
            rows.extend(last)
            next_cursor = int(last[-1][0]) + 86400000
            if next_cursor <= cursor:
                raise RuntimeError('Binance pagination did not advance')
            cursor = next_cursor
            if len(last) < 1000:
                break
        return rows

    def collect_pair(self, symbol, year, month):
        start_ms, end_ms = month_bounds_utc(year, month)
        raw = self.fetch(symbol, start_ms, end_ms)
        fetched = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')
        source_url = BINANCE_URL + '?' + urlencode({'symbol': symbol, 'interval': '1d', 'startTime': start_ms, 'endTime': end_ms - 1, 'limit': 1000})
        raw_hash = hashlib.sha256(json.dumps(raw, separators=(',', ':'), ensure_ascii=True).encode()).hexdigest()
        meta = ASSETS[symbol]
        asset = {'asset_id': meta['asset_id'], 'ticker': symbol, 'market': 'BINANCE_SPOT', 'name': meta['name'], 'currency': 'USDT', 'scale': meta['scale']}
        added = 0
        for kline in raw:
            minute = int(kline[0]) // 1000
            row = {'asset_id': meta['asset_id'], 'minute': minute, 'price_decimal': str(Decimal(kline[4])), 'provider': 'binance', 'source_url': source_url, 'interval': '1d', 'source_timestamp_utc': datetime.fromtimestamp(minute, timezone.utc).isoformat().replace('+00:00', 'Z'), 'session_timezone': 'UTC', 'fetched_at': fetched, 'raw_sha256': raw_hash}
            with sqlite3.connect(self.store.path) as conn:
                before = conn.execute('select count(*) from prices where asset_id=? and minute=?', (row['asset_id'], row['minute'])).fetchone()[0]
            self.store.append(asset, row)
            added += int(before == 0)
        return added, len(raw)


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument('--db', type=Path, default=DEFAULT_DB)
    parser.add_argument('--manifest', type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument('--year', type=int)
    parser.add_argument('--month', type=int)
    parser.add_argument('--symbols', default=','.join(ASSETS))
    args = parser.parse_args(argv)
    year, month = (args.year, args.month) if args.year and args.month else previous_closed_month()
    symbols = [s.strip().upper() for s in args.symbols.split(',') if s.strip()]
    unknown = sorted(set(symbols) - set(ASSETS))
    if unknown:
        parser.error('unsupported symbols: ' + ','.join(unknown))
    store = HistoryStore(args.db)
    store.initialize()
    collector = BinanceCollector(store)
    coverage, errors, rows_added = {}, [], 0
    for symbol in symbols:
        try:
            added, fetched = collector.collect_pair(symbol, year, month)
            coverage[symbol] = {'rows_fetched': fetched, 'rows_added': added, 'complete': fetched == days_in_month(year, month)}
            rows_added += added
        except Exception as exc:
            coverage[symbol] = {'rows_fetched': 0, 'rows_added': 0, 'complete': False}
            errors.append(f'{symbol}: {type(exc).__name__}: {exc}')
    with sqlite3.connect(args.db) as conn:
        integrity = conn.execute('pragma integrity_check').fetchone()[0]
        assets = conn.execute('select count(*) from assets').fetchone()[0]
        prices = conn.execute('select count(*) from prices').fetchone()[0]
    manifest = {'provider': 'binance', 'market': 'spot', 'interval': '1d', 'session_timezone': 'UTC', 'window': f'{year:04d}-{month:02d}', 'coverage': coverage, 'rows_added': rows_added, 'assets': assets, 'prices': prices, 'integrity_check': integrity, 'errors': errors, 'generated_at': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')}
    write_manifest(args.manifest, manifest)
    print(json.dumps(manifest, sort_keys=True))
    return 1 if errors else 0


if __name__ == '__main__':
    raise SystemExit(main())
