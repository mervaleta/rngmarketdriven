import datetime
import json
import os
import sqlite3
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
SOURCE_URL = "https://cajadevalores.com.ar/Servicios/Cedears"
SOURCE_FILE = "/data/cache/scratch/cedears.xlsx"
ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "data" / "byma_instruments.sqlite"
EXPORT = ROOT / "data" / "byma_instruments.json"


def rows_from_xlsx(path):
    with zipfile.ZipFile(path) as book:
        shared_root = ET.fromstring(book.read("xl/sharedStrings.xml"))
        shared = ["".join(t.text or "" for t in si.iter("{%s}t" % NS["m"])) for si in shared_root.findall("m:si", NS)]
        sheet = ET.fromstring(book.read("xl/worksheets/sheet1.xml"))
        for row in sheet.findall(".//m:row", NS):
            values = []
            for cell in row.findall("m:c", NS):
                value = cell.find("m:v", NS)
                text = value.text if value is not None else ""
                if cell.attrib.get("t") == "s" and text:
                    text = shared[int(text)]
                values.append(text)
            yield values


def build_assets():
    section = None
    assets = {}
    for row in rows_from_xlsx(SOURCE_FILE):
        if not row:
            continue
        if row[0] == "CEDEAR de ETF":
            section = "cedear_etf"
            continue
        if row[0] == "CEDEAR de Acciones":
            section = "cedear_acciones"
            continue
        if section and len(row) >= 3 and row[1] and row[1] != "Símbolo BYMA":
            ticker = row[1]
            assets["BYMA:" + ticker] = {
                "asset_id": "BYMA:" + ticker,
                "ticker": ticker,
                "market": "BYMA",
                "panel": "cedears",
                "asset_type": section,
                "name": row[0],
                "origin_ticker": row[2],
                "source_url": SOURCE_URL,
                "source_file": Path(SOURCE_FILE).name,
            }
    return list(assets.values())


def main():
    assets = build_assets()
    captured_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    DB.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB) as conn:
        conn.execute("""CREATE TABLE IF NOT EXISTS instruments(
            asset_id TEXT PRIMARY KEY, ticker TEXT NOT NULL, market TEXT NOT NULL,
            panel TEXT NOT NULL, asset_type TEXT NOT NULL, name TEXT NOT NULL,
            origin_ticker TEXT, source_url TEXT NOT NULL, source_file TEXT NOT NULL,
            captured_at TEXT NOT NULL)""")
        conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS uq_instruments_ticker_panel ON instruments(ticker,panel)")
        conn.executemany("""INSERT INTO instruments VALUES(?,?,?,?,?,?,?,?,?,?)
            ON CONFLICT(asset_id) DO UPDATE SET ticker=excluded.ticker, panel=excluded.panel,
            asset_type=excluded.asset_type, name=excluded.name, origin_ticker=excluded.origin_ticker,
            source_url=excluded.source_url, source_file=excluded.source_file, captured_at=excluded.captured_at""",
            [(a["asset_id"], a["ticker"], a["market"], a["panel"], a["asset_type"], a["name"], a["origin_ticker"], a["source_url"], a["source_file"], captured_at) for a in assets])
        conn.commit()
        total = conn.execute("SELECT count(*) FROM instruments").fetchone()[0]
    EXPORT.write_text(json.dumps({"captured_at": captured_at, "source_url": SOURCE_URL, "source_file": SOURCE_FILE, "assets": assets}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"imported": len(assets), "db_total": total, "export": str(EXPORT)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
