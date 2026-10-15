import sqlite3
import tempfile
import unittest
from pathlib import Path

from src.store import HistoryStore


class HistoryStoreTests(unittest.TestCase):
    def test_schema_isolated_and_append_only_idempotent(self):
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "history.sqlite"
            store = HistoryStore(db)
            store.initialize()
            asset = {
                "asset_id": "TEST:AAA",
                "ticker": "AAA",
                "market": "TEST",
                "name": "Test asset",
                "currency": "USD",
                "scale": 4,
            }
            row = {
                "asset_id": "TEST:AAA",
                "minute": 1700000000,
                "price_decimal": "12.3456",
                "provider": "fixture-provider",
                "source_url": "https://example.invalid/data",
                "interval": "1d",
                "source_timestamp_utc": "2023-11-14T22:13:20Z",
                "session_timezone": "UTC",
                "fetched_at": "2023-11-15T00:00:00Z",
                "raw_sha256": "a" * 64,
            }
            store.append(asset, row)
            store.append(asset, row)
            with sqlite3.connect(db) as conn:
                self.assertEqual(conn.execute("select count(*) from prices").fetchone()[0], 1)
                self.assertEqual(conn.execute("select count(*) from sources").fetchone()[0], 1)
                self.assertEqual(conn.execute("pragma integrity_check").fetchone()[0], "ok")
                self.assertEqual(conn.execute("select price_decimal from prices").fetchone()[0], "12.3456")

    def test_revisions_are_recorded_not_overwritten(self):
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "history.sqlite"
            store = HistoryStore(db)
            store.initialize()
            asset = {"asset_id": "TEST:AAA", "ticker": "AAA", "market": "TEST", "name": "Test", "currency": "USD", "scale": 4}
            base = {"asset_id": "TEST:AAA", "minute": 1700000000, "price_decimal": "12.3456", "provider": "p", "source_url": "u", "interval": "1d", "source_timestamp_utc": "2023-11-14T22:13:20Z", "session_timezone": "UTC", "fetched_at": "2023-11-15T00:00:00Z", "raw_sha256": "a" * 64}
            changed = dict(base, price_decimal="12.9999", raw_sha256="b" * 64)
            store.append(asset, base)
            store.append(asset, changed)
            with sqlite3.connect(db) as conn:
                self.assertEqual(conn.execute("select count(*) from prices").fetchone()[0], 1)
                self.assertEqual(conn.execute("select count(*) from revisions").fetchone()[0], 1)
                self.assertEqual(conn.execute("select price_decimal from prices").fetchone()[0], "12.3456")


if __name__ == "__main__":
    unittest.main()
