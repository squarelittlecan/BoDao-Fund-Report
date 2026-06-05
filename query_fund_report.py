#!/usr/bin/env python3
import argparse
import csv
import html
import re
import sys
import time
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import date, datetime
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import URLError


API_URL = "https://fundf10.eastmoney.com/F10DataApi.aspx"
DEFAULT_PRODUCTS = "fund_products.csv"
DEFAULT_OUTPUT_DIR = "output"
DEFAULT_METRICS = ["inception_date", "今年来"]
METRIC_LABELS = {
    "今年来": "今年以来",
    "近1周": "近一周",
    "近1月": "近一个月",
    "近3月": "近三个月",
    "近1年": "近一年",
    "近2年": "近两年",
    "近3年": "近三年",
    "近5年": "近五年",
}


@dataclass(frozen=True)
class FundProduct:
    name: str
    code: str
    show_ytd: bool


@dataclass(frozen=True)
class NavRecord:
    nav_date: date
    unit_nav: float
    accum_nav: float
    daily_return: float


class TableParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.rows: list[list[str]] = []
        self._current_row: list[str] | None = None
        self._current_cell: list[str] | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "tr":
            self._current_row = []
        elif tag == "td" and self._current_row is not None:
            self._current_cell = []

    def handle_data(self, data: str) -> None:
        if self._current_cell is not None:
            self._current_cell.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "td" and self._current_row is not None and self._current_cell is not None:
            self._current_row.append("".join(self._current_cell).strip())
            self._current_cell = None
        elif tag == "tr" and self._current_row is not None:
            if self._current_row:
                self.rows.append(self._current_row)
            self._current_row = None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Query real fund NAV data and generate a daily fund performance report."
    )
    parser.add_argument(
        "date",
        nargs="?",
        default="latest",
        help="Report date, for example 2026-06-04. Use latest or omit it to query the latest common NAV date.",
    )
    parser.add_argument("--products", default=DEFAULT_PRODUCTS, help="Fund product config CSV.")
    parser.add_argument("--output-dir", default=DEFAULT_OUTPUT_DIR, help="Directory for report and raw CSV.")
    parser.add_argument("--source", default="天天基金/东方财富", help="Source label used in the disclaimer.")
    parser.add_argument("--delay", type=float, default=0.6, help="Seconds to wait between API requests.")
    parser.add_argument(
        "--wind-csv",
        help=(
            "Read strict Wind-sourced data from a CSV export instead of querying public sources. "
            "Required columns: date, code, daily_return, inception_return. Optional: name, ytd_return."
        ),
    )
    return parser.parse_args()


def parse_date(value: str) -> date:
    for fmt in ("%Y-%m-%d", "%Y.%m.%d", "%Y/%m/%d"):
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            pass
    raise ValueError(f"Unsupported date format: {value}")


def parse_percent(value: str) -> float:
    return float(value.strip().replace("%", "").replace("+", ""))


def format_percent(value: float) -> str:
    return f"{value:+.2f}%"


def daily_icon(value: str) -> str:
    return "📉" if parse_percent(value) < 0 else "📈"


def normalize_percent(value: str | None) -> str:
    value = (value or "").strip()
    if not value:
        return ""
    if value.endswith("%"):
        value = value[:-1]
    return format_percent(parse_percent(value))


def should_show_ytd(inception_date: date, target_date: date) -> bool:
    return inception_date.year < target_date.year


def urlopen_with_retry(request: urllib.request.Request, attempts: int = 3) -> bytes:
    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return response.read()
        except (TimeoutError, URLError, OSError) as exc:
            last_error = exc
            if attempt < attempts:
                time.sleep(1.5 * attempt)
    raise RuntimeError(f"network request failed after {attempts} attempts: {last_error}")


def read_products(path: Path) -> list[FundProduct]:
    with path.open("r", encoding="utf-8-sig", newline="") as file:
        rows = list(csv.DictReader(file))

    products: list[FundProduct] = []
    for row in rows:
        products.append(
            FundProduct(
                name=row["name"].strip(),
                code=row["code"].strip().zfill(6),
                show_ytd=row.get("show_ytd", "").strip().lower() in {"1", "true", "yes", "y"},
            )
        )
    return products


def resolve_target_date(date_arg: str, products: list[FundProduct]) -> date:
    if date_arg.lower() not in {"latest", "today", "current"}:
        return parse_date(date_arg)

    latest_by_code: dict[str, date] = {}
    for index, product in enumerate(products, start=1):
        print(f"[{index}/{len(products)}] Checking latest NAV date for {product.name} ({product.code})...")
        latest_by_code[product.code] = latest_available_record(product.code, date.today()).nav_date

    latest_dates = set(latest_by_code.values())
    if len(latest_dates) != 1:
        details = ", ".join(f"{code}: {value.isoformat()}" for code, value in sorted(latest_by_code.items()))
        raise RuntimeError(f"Funds do not share one latest NAV date: {details}")

    return latest_dates.pop()


def read_wind_csv(path: Path, target_date: date, products: list[FundProduct]) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as file:
        rows = list(csv.DictReader(file))

    required = {"date", "code", "daily_return", "inception_return"}
    columns = set(rows[0].keys() if rows else [])
    missing = required - columns
    if missing:
        raise ValueError(f"Wind CSV missing required columns: {', '.join(sorted(missing))}")

    by_code: dict[str, dict[str, str]] = {}
    for row in rows:
        code = row["code"].strip().zfill(6)
        row_date = parse_date(row["date"].strip())
        if row_date == target_date:
            by_code[code] = row

    report_rows: list[dict[str, str]] = []
    failures: list[str] = []
    for product in products:
        row = by_code.get(product.code)
        if row is None:
            failures.append(f"{product.code}: no Wind CSV row for {target_date.isoformat()}")
            continue

        daily_return = normalize_percent(row.get("daily_return", ""))
        inception_return_value = normalize_percent(row.get("inception_return", ""))
        ytd_return_value = normalize_percent(row.get("ytd_return", "")) if product.show_ytd else ""
        if not daily_return:
            failures.append(f"{product.code}: missing daily_return")
        if not inception_return_value:
            failures.append(f"{product.code}: missing inception_return")
        if product.show_ytd and not ytd_return_value:
            failures.append(f"{product.code}: missing ytd_return")

        report_rows.append(
            {
                "name": (row.get("name") or "").strip() or product.name,
                "code": product.code,
                "date": target_date.isoformat(),
                "unit_nav": (row.get("unit_nav") or "").strip(),
                "accum_nav": (row.get("accum_nav") or "").strip(),
                "daily_return": daily_return,
                "ytd_return": ytd_return_value,
                "inception_return": inception_return_value,
            }
        )

    if failures:
        raise RuntimeError("\n".join(failures))

    return report_rows


def query_nav_rows(code: str, start: date, end: date, per: int = 200) -> list[NavRecord]:
    params = {
        "type": "lsjz",
        "code": code,
        "page": "1",
        "per": str(per),
        "sdate": start.isoformat(),
        "edate": end.isoformat(),
    }
    url = f"{API_URL}?{urllib.parse.urlencode(params)}"
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Referer": f"https://fundf10.eastmoney.com/jjjz_{code}.html",
        },
    )

    body = urlopen_with_retry(request).decode("utf-8")

    match = re.search(r'content:"(.*?)",records:', body, flags=re.S)
    if not match:
        raise RuntimeError(f"{code}: unexpected API response")

    parser = TableParser()
    parser.feed(html.unescape(match.group(1)))

    records: list[NavRecord] = []
    for cells in parser.rows:
        if len(cells) < 4 or cells[1] in {"", "--"} or cells[2] in {"", "--"} or cells[3] in {"", "--"}:
            continue
        records.append(
            NavRecord(
                nav_date=parse_date(cells[0]),
                unit_nav=float(cells[1]),
                accum_nav=float(cells[2]),
                daily_return=parse_percent(cells[3]),
            )
        )
    return records


def latest_record_on_or_before(code: str, target: date, start: date) -> NavRecord:
    records = query_nav_rows(code, start, target)
    valid = [record for record in records if record.nav_date <= target]
    if not valid:
        raise RuntimeError(f"{code}: no NAV data on or before {target.isoformat()}")
    return max(valid, key=lambda record: record.nav_date)


def latest_available_record(code: str, target: date) -> NavRecord:
    return latest_record_on_or_before(code, target, date(target.year - 1, 12, 1))


def exact_record_for_date(code: str, target: date) -> NavRecord:
    records = query_nav_rows(code, target, target, per=20)
    matches = [record for record in records if record.nav_date == target]
    if not matches:
        raise RuntimeError(f"{code}: no NAV data for {target.isoformat()}")
    return matches[0]


def query_stage_returns(code: str) -> dict[str, float]:
    params = {"type": "jdzf", "code": code}
    url = f"https://fundf10.eastmoney.com/FundArchivesDatas.aspx?{urllib.parse.urlencode(params)}"
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Referer": f"https://fundf10.eastmoney.com/jdzf_{code}.html",
        },
    )

    body = urlopen_with_retry(request).decode("utf-8")

    match = re.search(r'content:"(.*?)"};', body, flags=re.S)
    if not match:
        raise RuntimeError(f"{code}: unexpected stage-return response")

    content = html.unescape(match.group(1))
    returns: dict[str, float] = {}
    for label in ("今年来", "近1周", "近1月", "近3月", "近1年", "近2年", "近3年", "近5年", "成立来"):
        item = re.search(
            rf"<ul[^>]*>\s*<li class='title'>{label}</li>\s*<li[^>]*>([-+]?\d+(?:\.\d+)?|---)%?</li>",
            content,
        )
        if item and item.group(1) != "---":
            returns[label] = float(item.group(1))
    return returns


def query_inception_date(code: str) -> date:
    request = urllib.request.Request(
        f"https://fund.eastmoney.com/pingzhongdata/{code}.js",
        headers={
            "User-Agent": "Mozilla/5.0",
            "Referer": f"https://fund.eastmoney.com/{code}.html",
        },
    )
    body = urlopen_with_retry(request).decode("utf-8-sig", errors="ignore")
    match = re.search(r"Data_netWorthTrend\s*=\s*\[\{\"x\":(\d+),", body)
    if not match:
        raise RuntimeError(f"{code}: no inception date found")
    timestamp_ms = int(match.group(1))
    return datetime.fromtimestamp(timestamp_ms / 1000).date()


def inception_return(target: NavRecord) -> float:
    return (target.accum_nav - 1) * 100


def build_report(rows: list[dict[str, str]], as_of: date, source: str, metrics: list[str] | None = None) -> str:
    metrics = metrics or DEFAULT_METRICS
    heading_date = as_of.strftime("%m%d")
    disclaimer_date = f"{as_of.year}.{as_of.month}.{as_of.day}"
    lines = [f"🌟重点产品净值播报【{heading_date}】", ""]

    for row in rows:
        lines.extend([row["name"], f"🔸代码：{row['code']}"])
        if "inception_date" in metrics and row.get("inception_date"):
            lines.append(f"📅成立日期：{row['inception_date']}")
        lines.append(f"{daily_icon(row['daily_return'])}单日涨跌: {row['daily_return']}")
        stage_returns = row.get("stage_returns", {})
        if isinstance(stage_returns, str):
            stage_returns = {}
        for metric in metrics:
            if metric == "inception_date":
                continue
            if metric == "今年来" and not row.get("show_ytd", True):
                continue
            value = stage_returns.get(metric) or row.get("ytd_return" if metric == "今年来" else "")
            if value:
                lines.append(f"{daily_icon(value)}{METRIC_LABELS.get(metric, metric)}: {value}")
        lines.extend([f"📈成立以来: {row['inception_return']}", ""])

    lines.append(
        f"（数据来源{source}，截至{disclaimer_date}，历史收益不代表未来，产品由博道基金发行，"
        "银行为代销渠道，不承担产品的兑付、投资和风险责任。基金有风险，投资须谨慎。）"
    )
    return "\n".join(lines)


def main() -> int:
    args = parse_args()
    products = read_products(Path(args.products))
    try:
        target_date = parse_date(args.date) if args.wind_csv else resolve_target_date(args.date, products)
    except Exception as exc:
        print(f"Could not resolve report date: {exc}", file=sys.stderr)
        return 1
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    report_rows: list[dict[str, str]] = []
    failures: list[str] = []

    if args.wind_csv:
        try:
            report_rows = read_wind_csv(Path(args.wind_csv), target_date, products)
            args.source = "wind"
        except Exception as exc:
            failures.extend(str(exc).splitlines())
    else:
        for index, product in enumerate(products, start=1):
            try:
                print(f"[{index}/{len(products)}] Querying {product.name} ({product.code})...")
                record = exact_record_for_date(product.code, target_date)
                latest = latest_available_record(product.code, date.today())
                if latest.nav_date != target_date:
                    raise RuntimeError(
                        f"{product.code}: public stage returns are only available for latest NAV date "
                        f"{latest.nav_date.isoformat()}, not {target_date.isoformat()}"
                    )
                stage_returns = query_stage_returns(product.code)
                inception_date_value = query_inception_date(product.code)
                show_ytd = should_show_ytd(inception_date_value, target_date)
                if show_ytd and "今年来" not in stage_returns:
                    raise RuntimeError(f"{product.code}: no year-to-date stage return found")
                formatted_stage_returns = {
                    label: format_percent(value)
                    for label, value in stage_returns.items()
                }
                row = {
                    "name": product.name,
                    "code": product.code,
                    "date": record.nav_date.isoformat(),
                    "unit_nav": f"{record.unit_nav:.4f}",
                    "accum_nav": f"{record.accum_nav:.4f}",
                    "daily_return": format_percent(record.daily_return),
                    "ytd_return": format_percent(stage_returns["今年来"]) if show_ytd and "今年来" in stage_returns else "",
                    "inception_return": format_percent(stage_returns["成立来"]),
                    "inception_date": inception_date_value.isoformat(),
                    "show_ytd": show_ytd,
                    "stage_returns": formatted_stage_returns,
                }
                report_rows.append(row)
            except Exception as exc:
                failures.append(str(exc))
            time.sleep(args.delay)

    if failures:
        print("Refusing to generate a partial report because some real data was unavailable:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    raw_path = output_dir / f"fund_data_{target_date.isoformat()}.csv"
    with raw_path.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(
            file,
            extrasaction="ignore",
            fieldnames=[
                "name",
                "code",
                "date",
                "unit_nav",
                "accum_nav",
                "daily_return",
                "ytd_return",
                "inception_return",
                "inception_date",
            ],
        )
        writer.writeheader()
        writer.writerows(report_rows)

    report = build_report(report_rows, target_date, args.source)
    report_path = output_dir / f"fund_report_{target_date.isoformat()}.txt"
    report_path.write_text(report, encoding="utf-8")
    print(report)
    print(f"\nSaved raw data to {raw_path}")
    print(f"Saved report to {report_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
