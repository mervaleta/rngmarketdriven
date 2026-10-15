import unittest
from src.coingecko import CoinGeckoCollector, parse_market_chart, ASSETS, MAX_SYMBOLS


class CoinGeckoTests(unittest.TestCase):
    def test_parse_market_chart_maps_prices_and_asset(self):
        payload = {'prices': [[1700000000000, 123.4500], [1700086400000, 124.5]]}
        rows = parse_market_chart('bitcoin', payload, '2026-10-15T00:00:00Z')
        self.assertEqual(len(rows), 2)
        self.assertEqual(rows[0]['asset_id'], 'CRYPTO:BTC/USD')
        self.assertEqual(rows[0]['price_decimal'], '123.45')
        self.assertEqual(rows[0]['source_timestamp_utc'], '2023-11-14T22:13:20Z')
        self.assertEqual(rows[0]['provider'], 'coingecko')

    def test_collector_limits_catalog_cap(self):
        collector = CoinGeckoCollector(store=None, opener=lambda url, timeout: {'prices': []}, sleep=lambda _: None)
        with self.assertRaises(ValueError):
            collector.collect(list(ASSETS) + ['unknown'] * (MAX_SYMBOLS - len(ASSETS) + 1))

    def test_catalog_has_useful_crypto_assets(self):
        self.assertGreaterEqual(len(ASSETS), 10)
        self.assertIn('solana', ASSETS)

    def test_cryptodromo_catalog_assets_have_unambiguous_ids(self):
        expected = {
            'iota': 'CRYPTO:IOTA/USD',
            'pancakeswap-token': 'CRYPTO:CAKE/USD',
            'polygon-ecosystem-token': 'CRYPTO:POL/USD',
            'sushi': 'CRYPTO:SUSHI/USD',
            'ripple': 'CRYPTO:XRP/USD',
        }
        for coin_id, asset_id in expected.items():
            self.assertEqual(ASSETS[coin_id]['asset_id'], asset_id)

    def test_polygon_pol_and_legacy_matic_are_distinct(self):
        self.assertNotEqual(ASSETS['polygon-ecosystem-token']['asset_id'], ASSETS['matic-network']['asset_id'])
        self.assertEqual(ASSETS['polygon-ecosystem-token']['ticker'], 'POL')
        self.assertEqual(ASSETS['matic-network']['ticker'], 'MATIC')


if __name__ == '__main__':
    unittest.main()
