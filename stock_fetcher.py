#!/usr/bin/env python3
import argparse
import csv
import os
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path


ALPHA_VANTAGE_URL = "https://www.alphavantage.co/query"
DEFAULT_TICKERS_FILE = "tickers.txt"
DEFAULT_OUTPUT_FILE = "data/daily_prices.csv"


def read_tickers(path: Path) -> list[str]:
    if not path.exists():
        raise FileNotFoundError(f"Ticker file not found: {path}")

    tickers: list[str] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        value = line.strip().upper()
        if value and not value.startswith("#"):
            tickers.append(value)
    return tickers


def fetch_daily_csv(symbol: str, api_key: str, outputsize: str) -> list[dict[str, str]]:
    params = {
        "function": "TIME_SERIES_DAILY",
        "symbol": symbol,
        "apikey": api_key,
        "datatype": "csv",
        "outputsize": outputsize,
    }
    url = f"{ALPHA_VANTAGE_URL}?{urllib.parse.urlencode(params)}"

    with urllib.request.urlopen(url, timeout=30) as response:
        body = response.read().decode("utf-8")

    if body.lstrip().startswith("{"):
        raise RuntimeError(f"{symbol}: API returned an error or rate-limit response: {body[:300]}")

    rows = list(csv.DictReader(body.splitlines()))
    if not rows or "timestamp" not in rows[0]:
        raise RuntimeError(f"{symbol}: unexpected response: {body[:300]}")

    for row in rows:
        row["symbol"] = symbol
    return rows


def load_existing(path: Path) -> dict[tuple[str, str], dict[str, str]]:
    if not path.exists():
        return {}

    with path.open("r", encoding="utf-8", newline="") as file:
        rows = csv.DictReader(file)
        return {
            (row["symbol"], row["timestamp"]): row
            for row in rows
            if row.get("symbol") and row.get("timestamp")
        }


def write_rows(path: Path, rows_by_key: dict[tuple[str, str], dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = ["symbol", "timestamp", "open", "high", "low", "close", "volume"]
    rows = sorted(rows_by_key.values(), key=lambda row: (row["symbol"], row["timestamp"]))

    with path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fetch daily stock OHLCV data from Alpha Vantage.")
    parser.add_argument("--tickers", default=DEFAULT_TICKERS_FILE, help="Path to ticker list.")
    parser.add_argument("--output", default=DEFAULT_OUTPUT_FILE, help="CSV output path.")
    parser.add_argument(
        "--outputsize",
        choices=["compact", "full"],
        default="compact",
        help="compact returns recent data; full may require a premium Alpha Vantage plan.",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=15.0,
        help="Seconds to wait between symbols to avoid API rate limits.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    api_key = os.getenv("ALPHA_VANTAGE_API_KEY")
    if not api_key:
        print("Missing ALPHA_VANTAGE_API_KEY environment variable.", file=sys.stderr)
        return 2

    tickers = read_tickers(Path(args.tickers))
    if not tickers:
        print("No tickers found.", file=sys.stderr)
        return 2

    output_path = Path(args.output)
    rows_by_key = load_existing(output_path)

    for index, symbol in enumerate(tickers, start=1):
        print(f"[{index}/{len(tickers)}] Fetching {symbol}...")
        try:
            rows = fetch_daily_csv(symbol, api_key, args.outputsize)
        except Exception as exc:
            print(f"  skipped: {exc}", file=sys.stderr)
            continue

        for row in rows:
            rows_by_key[(symbol, row["timestamp"])] = {
                "symbol": symbol,
                "timestamp": row["timestamp"],
                "open": row["open"],
                "high": row["high"],
                "low": row["low"],
                "close": row["close"],
                "volume": row["volume"],
            }

        if index < len(tickers):
            time.sleep(args.delay)

    write_rows(output_path, rows_by_key)
    print(f"Saved {len(rows_by_key)} rows to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
