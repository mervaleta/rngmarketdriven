import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from src.collector import BinanceCollector, month_bounds_utc, write_manifest
from src.store import HistoryStore


class CollectorTests(unittest.TestCase):
    def test_month_bounds_are_utc_and_closed(self):
        self.assertEqual(month_bounds_utc(2026, 9), (1788220800000, 1790812800000))

    def test_collect_klines_maps_close_and_is_idempotent(self):
        payload = [[1788220800000, "100.00", "101", "99", "100.50", "1", 1788307199999, "100", 1, "1", "1", "0"]]
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "history.sqlite"
            store = HistoryStore(db)
            store.initialize()
            collector = BinanceCollector(store, opener=lambda url, timeout: payload)
            self.assertEqual(collector.collect_pair("BTCUSDT", 2026, 9)[0], 1)
            self.assertEqual(collector.collect_pair("BTCUSDT", 2026, 9)[0], 0)
            import sqlite3
            with sqlite3.connect(db) as conn:
                self.assertEqual(conn.execute("select price_decimal from prices").fetchone()[0], "100.50")
                self.assertEqual(conn.execute("select count(*) from prices").fetchone()[0], 1)

    def test_manifest_is_written(self):
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "manifest.json"
            write_manifest(target, {"coverage": {"BTCUSDT": {"rows": 1}}})
            self.assertEqual(json.loads(target.read_text())["coverage"]["BTCUSDT"]["rows"], 1)


if __name__ == "__main__":
    unittest.main()
