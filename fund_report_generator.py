#!/usr/bin/env python3
import argparse
import csv
from datetime import date, datetime
from pathlib import Path


DEFAULT_INPUT = "fund_daily_data.csv"
DEFAULT_OUTPUT = "output/fund_report.txt"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate a daily fund NAV performance report.")
    parser.add_argument("--input", default=DEFAULT_INPUT, help="CSV file with fund performance data.")
    parser.add_argument("--output", default=DEFAULT_OUTPUT, help="Text file to write the report.")
    parser.add_argument(
        "--date",
        default=date.today().isoformat(),
        help="Data as-of date, for example 2026-06-04.",
    )
    parser.add_argument("--source", default="wind", help="Data source label used in the disclaimer.")
    return parser.parse_args()


def parse_date(value: str) -> date:
    for fmt in ("%Y-%m-%d", "%Y.%m.%d", "%Y/%m/%d"):
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            pass
    raise ValueError(f"Unsupported date format: {value}")


def format_percent(value: str) -> str | None:
    value = value.strip()
    if not value:
        return None

    if value.endswith("%"):
        number = float(value[:-1])
    else:
        number = float(value)

    return f"{number:+.2f}%"


def read_rows(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as file:
        rows = list(csv.DictReader(file))

    required = {"name", "code", "daily_return", "inception_return"}
    missing = required - set(rows[0].keys() if rows else [])
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(sorted(missing))}")

    return rows


def build_report(rows: list[dict[str, str]], as_of: date, source: str) -> str:
    heading_date = as_of.strftime("%m%d")
    disclaimer_date = f"{as_of.year}.{as_of.month}.{as_of.day}"
    lines = [f"🌟重点产品净值播报【{heading_date}】", ""]

    for row in rows:
        name = row["name"].strip()
        code = row["code"].strip()
        daily_return = format_percent(row["daily_return"])
        ytd_return = format_percent(row.get("ytd_return", ""))
        inception_return = format_percent(row["inception_return"])

        lines.extend(
            [
                name,
                f"🔸代码：{code}",
                f"📈单日涨跌: {daily_return}",
            ]
        )
        if ytd_return is not None:
            lines.append(f"📈今年以来: {ytd_return}")
        lines.extend([f"📈成立以来: {inception_return}", ""])

    lines.append(
        f"（数据来源{source}，截至{disclaimer_date}，历史收益不代表未来，产品由博道基金发行，"
        "银行为代销渠道，不承担产品的兑付、投资和风险责任。基金有风险，投资须谨慎。）"
    )
    return "\n".join(lines)


def main() -> int:
    args = parse_args()
    as_of = parse_date(args.date)
    rows = read_rows(Path(args.input))
    report = build_report(rows, as_of, args.source)

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(report, encoding="utf-8")
    print(report)
    print(f"\nSaved report to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
