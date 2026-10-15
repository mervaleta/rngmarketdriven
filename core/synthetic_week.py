"""Versioned synthetic market fixtures. No network, DB writes or import effects."""
from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal, localcontext
from hashlib import sha256
import json
from zoneinfo import ZoneInfo

VERSION = "synthetic-week-v1"
PRICE_QUANTUM = Decimal("0.0000000001")


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True)


def digest(value):
    return sha256(canonical(value).encode("utf-8")).hexdigest()


def percentage(current, reference):
    current, reference = Decimal(str(current)), Decimal(str(reference))
    if not current.is_finite() or not reference.is_finite() or min(current, reference) <= 0:
        raise ValueError("Prices must be finite and positive")
    with localcontext() as ctx:
        ctx.prec = 40
        return (current - reference) * 100 / reference


def _minutes(clock):
    parsed = time.fromisoformat(clock)
    if parsed.second or parsed.microsecond:
        raise ValueError("Sessions use whole minutes")
    return parsed.hour * 60 + parsed.minute


def validate_config(config):
    if config.get("source_kind") != "synthetic":
        raise ValueError("Only explicit synthetic datasets are supported")
    ids = set()
    for market in config["markets"].values():
        ZoneInfo(market["timezone"])
        if market["mode"] == "continuous":
            if market["timezone"] != "UTC":
                raise ValueError("Continuous fixtures use UTC days")
        elif market["mode"] == "session":
            if not 0 <= _minutes(market["open"]) < _minutes(market["close"]) <= 1439:
                raise ValueError("Session must open and close within one local day")
            if not market["weekdays"] or any(d not in range(7) for d in market["weekdays"]):
                raise ValueError("Invalid weekdays")
            for day in market.get("closed_dates", []):
                date.fromisoformat(day)
            for day, close in market.get("early_closes", {}).items():
                date.fromisoformat(day)
                if not _minutes(market["open"]) < _minutes(close) <= _minutes(market["close"]):
                    raise ValueError("Invalid early close")
        else:
            raise ValueError("Unknown market mode")
    for asset in config["instruments"]:
        if asset["id"] in ids:
            raise ValueError("Duplicate instrument identity")
        ids.add(asset["id"])
        if asset["market"] not in config["markets"] or not asset["currency"]:
            raise ValueError("Instrument needs market and currency")
        price = Decimal(asset["base_price"])
        if not price.is_finite() or not Decimal("0.0000000001") <= price < Decimal("100000000000000"):
            raise ValueError("Price outside DECIMAL(24,10) range")
        if not isinstance(asset["volatility_ppm"], int) or not 0 <= asset["volatility_ppm"] <= 10000:
            raise ValueError("Invalid minute volatility")
    if not ids:
        raise ValueError("No instruments")


def session_at(timestamp, market):
    local = timestamp.astimezone(ZoneInfo(market["timezone"]))
    day = local.date().isoformat()
    if market["mode"] == "continuous":
        return day
    if local.weekday() not in market["weekdays"] or day in market.get("closed_dates", []):
        return None
    close = market.get("early_closes", {}).get(day, market["close"])
    minute = local.hour * 60 + local.minute
    return day if _minutes(market["open"]) <= minute < _minutes(close) else None


def build_week(config, start_date, seed):
    """Seven UTC days; only open-session rows. Same inputs produce identical bytes."""
    validate_config(config)
    start = datetime.combine(date.fromisoformat(start_date), time(), timezone.utc)
    if start.weekday() != 0:
        raise ValueError("Week must start on a Monday")
    if not isinstance(seed, str) or not seed:
        raise ValueError("An explicit nonempty simulation seed is required")
    records = []
    with localcontext() as ctx:
        ctx.prec = 40
        for asset in sorted(config["instruments"], key=lambda a: a["id"]):
            market = config["markets"][asset["market"]]
            price = Decimal(asset["base_price"]).quantize(PRICE_QUANTUM)
            for index in range(10080):
                timestamp = start + timedelta(minutes=index)
                session = session_at(timestamp, market)
                if session is None:
                    continue
                # Fixed hash expansion is for fixture generation, not a fairness claim.
                value = int(digest([VERSION, seed, asset["id"], index])[:16], 16)
                noise = Decimal(value) / Decimal(2**64 - 1) * 2 - 1
                price = (price * (1 + noise * Decimal(asset["volatility_ppm"]) / 1000000)).quantize(PRICE_QUANTUM)
                if not Decimal("0.0000000001") <= price < Decimal("100000000000000"):
                    raise ValueError("Generated price outside storage range")
                records.append({"instrument_id": asset["id"], "minute_index": index,
                                "timestamp_utc": timestamp.isoformat().replace("+00:00", "Z"),
                                "session_date": session, "price": format(price, "f")})
    payload = {"generator_version": VERSION, "source_kind": "synthetic", "week_start_utc": start_date,
               "generation_seed": seed, "config": config, "records": records}
    return dict(payload, content_hash=digest(payload))


def verify_week(dataset):
    """Rebuild from manifest to detect modified rows, gaps or altered metadata."""
    expected = build_week(dataset["config"], dataset["week_start_utc"], dataset["generation_seed"])
    if canonical(expected) != canonical(dataset):
        raise ValueError("Dataset differs from the versioned fixture manifest")
    return True


def variations(rows):
    """No invented predecessor on session opening; overnight change is separate."""
    result, previous, opening = [], None, None
    instrument = None
    for row in rows:
        if instrument is None:
            instrument = row["instrument_id"]
        if row["instrument_id"] != instrument:
            raise ValueError("One instrument series required")
        if previous and row["minute_index"] <= previous["minute_index"]:
            raise ValueError("Rows must be strictly ordered")
        new_session = previous is None or row["session_date"] != previous["session_date"]
        if new_session:
            opening = row["price"]
        contiguous = previous is not None and row["minute_index"] == previous["minute_index"] + 1
        result.append(dict(row,
                           minute_change_pct=percentage(row["price"], previous["price"]) if contiguous and not new_session else None,
                           session_change_pct=percentage(row["price"], opening),
                           opening_gap_pct=percentage(row["price"], previous["price"]) if new_session and previous else None))
        previous = row
    return result


def select_segment(dataset, instrument_id, length, selection_seed):
    """Select a contiguous segment inside one session. No wrapping closed markets."""
    if not isinstance(length, int) or isinstance(length, bool) or length <= 0 or not selection_seed:
        raise ValueError("Positive length and selection seed required")
    rows = [r for r in dataset["records"] if r["instrument_id"] == instrument_id]
    candidates, run = [], 0
    previous = None
    for index, row in enumerate(rows):
        same = previous and row["session_date"] == previous["session_date"] and row["minute_index"] == previous["minute_index"] + 1
        run = run + 1 if same else 1
        if run >= length:
            candidates.append(index - length + 1)
        previous = row
    if not candidates:
        raise ValueError("No contiguous segment fits the requested instrument and length")
    # Rejection sampling avoids modulo bias in segment selection.
    count, counter = len(candidates), 0
    limit = 2**256 - 2**256 % count
    while True:
        value = int(digest(["segment-v1", dataset["content_hash"], instrument_id, length, selection_seed, counter]), 16)
        if value < limit:
            break
        counter += 1
    start = candidates[value % count]
    manifest = {"algorithm_version": "segment-v1", "dataset_hash": dataset["content_hash"],
                "instrument_id": instrument_id, "length": length, "selection_seed": selection_seed,
                "start_minute_index": rows[start]["minute_index"]}
    return {"manifest": manifest, "records": rows[start:start + length]}
