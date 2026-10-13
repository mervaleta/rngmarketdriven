"""Export fixtures to local JSON/CSV only. Never connects to MySQL."""
import argparse
import csv
import json
from pathlib import Path
from core.synthetic_week import build_week, canonical


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", required=True)
    parser.add_argument("--start", required=True, help="Monday, YYYY-MM-DD; UTC week")
    parser.add_argument("--seed", required=True)
    parser.add_argument("--output", required=True, help="New directory; existing paths rejected")
    args = parser.parse_args()
    dataset = build_week(json.loads(Path(args.config).read_text()), args.start, args.seed)
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=False)
    (output / "dataset.json").write_text(canonical(dataset) + "\n", encoding="utf-8")
    with (output / "prices.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=["instrument_id", "minute_index", "timestamp_utc", "session_date", "price"])
        writer.writeheader()
        writer.writerows(dataset["records"])
    print(json.dumps({"rows": len(dataset["records"]), "content_hash": dataset["content_hash"]}))


if __name__ == "__main__":
    main()
