#!/usr/bin/env python3
"""CoinGecko keyless public API adapter for a bounded crypto history MVP."""
import hashlib
import json
import time
from datetime import datetime, timezone
from decimal import Decimal
from urllib.parse import urlencode
from urllib.request import Request, urlopen

BASE_URL = 'https://api.coingecko.com/api/v3/coins'
MAX_SYMBOLS = 14
ASSETS = {
    'bitcoin': {'asset_id': 'CRYPTO:BTC/USD', 'ticker': 'BTC', 'name': 'Bitcoin', 'scale': 8},
    'ethereum': {'asset_id': 'CRYPTO:ETH/USD', 'ticker': 'ETH', 'name': 'Ethereum', 'scale': 8},
    'solana': {'asset_id': 'CRYPTO:SOL/USD', 'ticker': 'SOL', 'name': 'Solana', 'scale': 8},
    'iota': {'asset_id': 'CRYPTO:IOTA/USD', 'ticker': 'IOTA', 'name': 'IOTA', 'scale': 8},
    'avalanche-2': {'asset_id': 'CRYPTO:AVAX/USD', 'ticker': 'AVAX', 'name': 'Avalanche', 'scale': 8},
    'polkadot': {'asset_id': 'CRYPTO:DOT/USD', 'ticker': 'DOT', 'name': 'Polkadot', 'scale': 8},
    'cardano': {'asset_id': 'CRYPTO:ADA/USD', 'ticker': 'ADA', 'name': 'Cardano', 'scale': 8},
    'pancakeswap-token': {'asset_id': 'CRYPTO:CAKE/USD', 'ticker': 'CAKE', 'name': 'PancakeSwap', 'scale': 8},
    'binancecoin': {'asset_id': 'CRYPTO:BNB/USD', 'ticker': 'BNB', 'name': 'BNB', 'scale': 8},
    # POL is the current Polygon token; MATIC remains a separate legacy catalog asset.
    'polygon-ecosystem-token': {'asset_id': 'CRYPTO:POL/USD', 'ticker': 'POL', 'name': 'Polygon POL', 'scale': 8},
    'matic-network': {'asset_id': 'CRYPTO:MATIC/USD', 'ticker': 'MATIC', 'name': 'Polygon legacy MATIC', 'scale': 8},
    'dogecoin': {'asset_id': 'CRYPTO:DOGE/USD', 'ticker': 'DOGE', 'name': 'Dogecoin', 'scale': 8},
    'sushi': {'asset_id': 'CRYPTO:SUSHI/USD', 'ticker': 'SUSHI', 'name': 'Sushi', 'scale': 8},
    'ripple': {'asset_id': 'CRYPTO:XRP/USD', 'ticker': 'XRP', 'name': 'XRP', 'scale': 8},
}


def iso_utc(ms):
    return datetime.fromtimestamp(int(ms) / 1000, timezone.utc).isoformat().replace('+00:00', 'Z')


def parse_market_chart(coin_id, payload, fetched_at):
    if coin_id not in ASSETS:
        raise ValueError(f'unsupported CoinGecko coin: {coin_id}')
    prices = payload.get('prices') if isinstance(payload, dict) else None
    if not isinstance(prices, list):
        raise ValueError('CoinGecko response has no prices array')
    meta = ASSETS[coin_id]
    raw_hash = hashlib.sha256(json.dumps(payload, separators=(',', ':'), ensure_ascii=True).encode()).hexdigest()
    source_url = f'{BASE_URL}/{coin_id}/market_chart?{urlencode({"vs_currency": "usd", "days": "30", "interval": "daily"})}'
    rows = []
    for point in prices:
        if not isinstance(point, list) or len(point) < 2:
            raise ValueError('invalid CoinGecko price point')
        timestamp_ms, price = point[:2]
        minute = int(timestamp_ms) // 1000
        rows.append({'asset_id': meta['asset_id'], 'minute': minute, 'price_decimal': str(Decimal(str(price))), 'provider': 'coingecko', 'source_url': source_url, 'interval': 'daily', 'source_timestamp_utc': iso_utc(timestamp_ms), 'session_timezone': 'UTC', 'fetched_at': fetched_at, 'raw_sha256': raw_hash})
    return rows


class CoinGeckoCollector:
    def __init__(self, store, opener=None, timeout=30, sleep=time.sleep, pause_seconds=2):
        self.store = store
        self.opener = opener or self._open
        self.timeout = timeout
        self.sleep = sleep
        self.pause_seconds = pause_seconds

    @staticmethod
    def _open(url, timeout):
        with urlopen(Request(url, headers={'User-Agent': 'rngmarketdriven-market-history/1'}), timeout=timeout) as response:
            return json.loads(response.read())

    def collect(self, coin_ids):
        coin_ids = list(coin_ids)
        if not coin_ids or len(coin_ids) > MAX_SYMBOLS:
            raise ValueError(f'CoinGecko collector accepts 1 to {MAX_SYMBOLS} symbols')
        unsupported = sorted(set(coin_ids) - set(ASSETS))
        if unsupported:
            raise ValueError('unsupported symbols: ' + ','.join(unsupported))
        fetched_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')
        result = {}
        for index, coin_id in enumerate(coin_ids):
            if index:
                self.sleep(self.pause_seconds)
            url = f'{BASE_URL}/{coin_id}/market_chart?{urlencode({"vs_currency": "usd", "days": "30", "interval": "daily"})}'
            try:
                payload = self.opener(url, self.timeout)
            except Exception as exc:
                result[coin_id] = {'rows_fetched': 0, 'rows_added': 0, 'source_url': url, 'error': f'{type(exc).__name__}: {exc}'}
                continue
            rows = parse_market_chart(coin_id, payload, fetched_at)
            meta = ASSETS[coin_id]
            added = 0
            for row in rows:
                before = self.store.count_price(row['asset_id'], row['minute'])
                self.store.append({'asset_id': meta['asset_id'], 'ticker': meta['ticker'], 'market': 'COINGECKO_AGGREGATOR', 'name': meta['name'], 'currency': 'USD', 'scale': meta['scale']}, row)
                added += int(before == 0)
            result[coin_id] = {'rows_fetched': len(rows), 'rows_added': added, 'source_url': url}
        return result
