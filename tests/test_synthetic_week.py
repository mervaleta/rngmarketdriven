import copy
from decimal import Decimal
import json
from pathlib import Path
import unittest

from core.synthetic_week import build_week, percentage, select_segment, variations, verify_week


class SyntheticWeekTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.config = json.loads((Path(__file__).resolve().parents[1] / "config/synthetic_week.example.json").read_text())
        cls.small = copy.deepcopy(cls.config)
        cls.small["instruments"] = [cls.config["instruments"][0], cls.config["instruments"][10], cls.config["instruments"][20]]
        cls.week = build_week(cls.small, "2026-10-05", "fixture-test-v1")

    def test_exact_crypto_and_session_counts(self):
        counts = {}
        for row in self.week["records"]:
            counts[row["instrument_id"]] = counts.get(row["instrument_id"], 0) + 1
        self.assertEqual(counts[self.small["instruments"][0]["id"]], 10080)
        self.assertEqual(counts[self.small["instruments"][1]["id"]], 5 * 390)
        self.assertEqual(counts[self.small["instruments"][2]["id"]], 5 * 360)

    def test_reproducible_and_tamper_detected(self):
        self.assertTrue(verify_week(self.week))
        tampered = copy.deepcopy(self.week)
        tampered["records"][0]["price"] = "0.1000000000"
        with self.assertRaises(ValueError):
            verify_week(tampered)

    def test_changed_seed_changes_dataset(self):
        alternate = build_week(self.small, "2026-10-05", "different")
        self.assertNotEqual(alternate["content_hash"], self.week["content_hash"])

    def test_holiday_and_early_close(self):
        config = copy.deepcopy(self.small)
        config["instruments"] = [config["instruments"][1]]
        config["markets"]["us_equities"]["closed_dates"] = ["2026-10-06"]
        config["markets"]["us_equities"]["early_closes"] = {"2026-10-07": "13:00"}
        week = build_week(config, "2026-10-05", "holiday-test")
        self.assertEqual(len(week["records"]), 3 * 390 + 210)
        self.assertNotIn("2026-10-06", {r["session_date"] for r in week["records"]})

    def test_new_york_dst_uses_local_session(self):
        config = copy.deepcopy(self.small)
        config["instruments"] = [config["instruments"][1]]
        summer = build_week(config, "2026-10-05", "dst-test")
        winter = build_week(config, "2026-11-09", "dst-test")
        self.assertTrue(summer["records"][0]["timestamp_utc"].endswith("13:30:00Z"))
        self.assertTrue(winter["records"][0]["timestamp_utc"].endswith("14:30:00Z"))

    def test_selection_does_not_cross_closure(self):
        instrument = self.small["instruments"][1]["id"]
        selected = select_segment(self.week, instrument, 390, "run-1")
        self.assertEqual(selected, select_segment(self.week, instrument, 390, "run-1"))
        self.assertEqual(len({r["session_date"] for r in selected["records"]}), 1)
        with self.assertRaises(ValueError):
            select_segment(self.week, instrument, 391, "run-1")

    def test_variation_and_opening_gap(self):
        rows = [{"instrument_id": "x", "minute_index": 0, "session_date": "2026-10-05", "price": "100"},
                {"instrument_id": "x", "minute_index": 1, "session_date": "2026-10-05", "price": "110"},
                {"instrument_id": "x", "minute_index": 1440, "session_date": "2026-10-06", "price": "121"}]
        result = variations(rows)
        self.assertIsNone(result[0]["minute_change_pct"])
        self.assertEqual(result[1]["minute_change_pct"], Decimal("10"))
        self.assertIsNone(result[2]["minute_change_pct"])
        self.assertEqual(result[2]["opening_gap_pct"], Decimal("10"))
        self.assertEqual(result[2]["session_change_pct"], 0)

    def test_invalid_prices(self):
        for price in ["0", "-1", "NaN", "Infinity"]:
            with self.assertRaises(ValueError):
                percentage(price, "100")

    def test_duplicate_identity_and_invalid_week(self):
        config = copy.deepcopy(self.small)
        config["instruments"].append(config["instruments"][0])
        with self.assertRaises(ValueError):
            build_week(config, "2026-10-05", "x")
        with self.assertRaises(ValueError):
            build_week(self.small, "2026-10-06", "x")

    def test_selection_unknown_asset_and_invalid_length(self):
        for length in [0, -1, True]:
            with self.assertRaises(ValueError):
                select_segment(self.week, "unknown", length, "x")
        with self.assertRaises(ValueError):
            select_segment(self.week, "unknown", 1, "x")


if __name__ == "__main__":
    unittest.main()
