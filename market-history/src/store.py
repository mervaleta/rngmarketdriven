import sqlite3
from pathlib import Path

SCHEMA = """
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS assets (
    asset_id TEXT PRIMARY KEY,
    ticker TEXT NOT NULL,
    market TEXT NOT NULL,
    name TEXT NOT NULL,
    currency TEXT NOT NULL,
    scale INTEGER NOT NULL CHECK(scale >= 0)
);
CREATE TABLE IF NOT EXISTS sources (
    source_id INTEGER PRIMARY KEY,
    provider TEXT NOT NULL,
    source_url TEXT NOT NULL,
    interval TEXT NOT NULL,
    session_timezone TEXT NOT NULL,
    raw_sha256 TEXT NOT NULL CHECK(length(raw_sha256) = 64),
    fetched_at TEXT NOT NULL,
    UNIQUE(provider, source_url, interval, raw_sha256)
);
CREATE TABLE IF NOT EXISTS prices (
    asset_id TEXT NOT NULL REFERENCES assets(asset_id),
    minute INTEGER NOT NULL,
    price_decimal TEXT NOT NULL,
    source_id INTEGER NOT NULL REFERENCES sources(source_id),
    source_timestamp_utc TEXT NOT NULL,
    PRIMARY KEY(asset_id, minute)
) WITHOUT ROWID;
CREATE TABLE IF NOT EXISTS revisions (
    revision_id INTEGER PRIMARY KEY,
    asset_id TEXT NOT NULL,
    minute INTEGER NOT NULL,
    old_price_decimal TEXT NOT NULL,
    new_price_decimal TEXT NOT NULL,
    old_source_id INTEGER NOT NULL,
    new_source_id INTEGER NOT NULL,
    recorded_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_prices_asset_minute ON prices(asset_id, minute);
"""


class HistoryStore:
    def __init__(self, path):
        self.path = Path(path)

    def initialize(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(self.path) as conn:
            conn.executescript(SCHEMA)

    def count_price(self, asset_id, minute):
        with sqlite3.connect(self.path) as conn:
            return conn.execute("SELECT count(*) FROM prices WHERE asset_id=? AND minute=?", (asset_id, minute)).fetchone()[0]

    def append(self, asset, row):
        with sqlite3.connect(self.path) as conn:
            conn.execute(
                "INSERT INTO assets(asset_id,ticker,market,name,currency,scale) VALUES(?,?,?,?,?,?) "
                "ON CONFLICT(asset_id) DO NOTHING",
                tuple(asset[k] for k in ("asset_id", "ticker", "market", "name", "currency", "scale")),
            )
            conn.execute(
                "INSERT INTO sources(provider,source_url,interval,session_timezone,raw_sha256,fetched_at) VALUES(?,?,?,?,?,?) "
                "ON CONFLICT(provider,source_url,interval,raw_sha256) DO NOTHING",
                tuple(row[k] for k in ("provider", "source_url", "interval", "session_timezone", "raw_sha256", "fetched_at")),
            )
            source_id = conn.execute(
                "SELECT source_id FROM sources WHERE provider=? AND source_url=? AND interval=? AND raw_sha256=?",
                tuple(row[k] for k in ("provider", "source_url", "interval", "raw_sha256")),
            ).fetchone()[0]
            existing = conn.execute(
                "SELECT price_decimal, source_id FROM prices WHERE asset_id=? AND minute=?",
                (row["asset_id"], row["minute"]),
            ).fetchone()
            if existing is None:
                conn.execute(
                    "INSERT INTO prices(asset_id,minute,price_decimal,source_id,source_timestamp_utc) VALUES(?,?,?,?,?)",
                    (row["asset_id"], row["minute"], row["price_decimal"], source_id, row["source_timestamp_utc"]),
                )
            elif existing[0] != row["price_decimal"] or existing[1] != source_id:
                conn.execute(
                    "INSERT INTO revisions(asset_id,minute,old_price_decimal,new_price_decimal,old_source_id,new_source_id,recorded_at) VALUES(?,?,?,?,?,?,?)",
                    (row["asset_id"], row["minute"], existing[0], row["price_decimal"], existing[1], source_id, row["fetched_at"]),
                )
