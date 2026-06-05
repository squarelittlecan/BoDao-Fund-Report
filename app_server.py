#!/usr/bin/env python3
import argparse
import hmac
import json
import os
import secrets
from datetime import date
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import query_fund_report as fund_report


ROOT = Path(__file__).parent
PUBLIC_DIR = ROOT / "web"
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8765
SESSION_COOKIE = "fund_report_session"
SESSION_TOKEN = secrets.token_urlsafe(32)


def generate_report(
    date_arg: str,
    selected_codes: set[str] | None = None,
    metrics: list[str] | None = None,
) -> dict[str, object]:
    metrics = metrics or fund_report.DEFAULT_METRICS
    products = fund_report.read_products(ROOT / fund_report.DEFAULT_PRODUCTS)
    if selected_codes:
        products = [product for product in products if product.code in selected_codes]
    if not products:
        raise RuntimeError("请至少选择一只基金。")

    if (date_arg or "latest").lower() in {"latest", "today", "current"}:
        latest_by_code = {
            product.code: fund_report.latest_available_record(product.code, date.today()).nav_date
            for product in products
        }
        target_date = max(latest_by_code.values())
        warnings = [
            {
                "code": product.code,
                "name": product.name,
                "date": latest_by_code[product.code].isoformat(),
            }
            for product in products
            if latest_by_code[product.code] != target_date
        ]
    else:
        target_date = fund_report.parse_date(date_arg)
        latest_by_code = {product.code: target_date for product in products}
        warnings = []

    report_rows: list[dict[str, str]] = []
    failures: list[str] = []

    for product in products:
        try:
            product_date = latest_by_code[product.code]
            record = fund_report.exact_record_for_date(product.code, product_date)
            inception_date = fund_report.query_inception_date(product.code)
            show_ytd = fund_report.should_show_ytd(inception_date, product_date)
            stage_returns = fund_report.query_stage_returns(product.code)
            if "今年来" in metrics and show_ytd and "今年来" not in stage_returns:
                raise RuntimeError(f"{product.code}: no year-to-date stage return found")
            formatted_stage_returns = {
                label: fund_report.format_percent(value)
                for label, value in stage_returns.items()
            }
            report_rows.append(
                {
                    "name": product.name,
                    "code": product.code,
                    "date": record.nav_date.isoformat(),
                    "unit_nav": f"{record.unit_nav:.4f}",
                    "accum_nav": f"{record.accum_nav:.4f}",
                    "daily_return": "暂无" if record.daily_return is None else fund_report.format_percent(record.daily_return),
                    "ytd_return": (
                        fund_report.format_percent(stage_returns["今年来"])
                        if show_ytd and "今年来" in stage_returns
                        else ""
                    ),
                    "inception_return": fund_report.format_percent(stage_returns["成立来"]),
                    "inception_date": inception_date.isoformat(),
                    "show_ytd": show_ytd,
                    "stage_returns": formatted_stage_returns,
                    "is_stale_date": product_date != target_date,
                }
            )
        except Exception as exc:
            failures.append(str(exc))

    if failures:
        raise RuntimeError("\n".join(failures))

    report = fund_report.build_report(report_rows, target_date, "天天基金/东方财富", metrics)
    return {
        "date": target_date.isoformat(),
        "warnings": warnings,
        "report": report,
        "rows": report_rows,
    }


class Handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/report":
            if not self.is_authorized():
                self.send_json(HTTPStatus.UNAUTHORIZED, {"ok": False, "error": "请先登录。"})
                return
            self.handle_report(parsed.query)
            return

        if parsed.path == "/api/auth":
            self.send_json(HTTPStatus.OK, {"ok": True, "required": bool(app_password())})
            return

        path = "index.html" if parsed.path in {"/", ""} else parsed.path.lstrip("/")
        self.serve_file(PUBLIC_DIR / path)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path != "/api/login":
            self.send_error(HTTPStatus.NOT_FOUND)
            return

        expected = app_password()
        if not expected:
            self.send_json(HTTPStatus.OK, {"ok": True})
            return

        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length).decode("utf-8") if length else "{}"
        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            payload = {}

        password = str(payload.get("password", ""))
        if not hmac.compare_digest(password, expected):
            self.send_json(HTTPStatus.UNAUTHORIZED, {"ok": False, "error": "密码不正确。"})
            return

        self.send_json(
            HTTPStatus.OK,
            {"ok": True},
            extra_headers={
                "Set-Cookie": (
                    f"{SESSION_COOKIE}={SESSION_TOKEN}; Path=/; HttpOnly; SameSite=Lax"
                )
            },
        )

    def handle_report(self, query: str) -> None:
        params = parse_qs(query)
        date_arg = params.get("date", ["latest"])[0].strip() or "latest"
        codes_value = params.get("codes", [""])[0]
        metrics_value = params.get("metrics", [""])[0]
        selected_codes = {
            code.strip().zfill(6)
            for code in codes_value.split(",")
            if code.strip()
        }
        metrics = [
            metric.strip()
            for metric in metrics_value.split(",")
            if metric.strip()
        ] or None

        try:
            payload = {"ok": True, **generate_report(date_arg, selected_codes or None, metrics)}
            self.send_json(HTTPStatus.OK, payload)
        except Exception as exc:
            self.send_json(
                HTTPStatus.BAD_REQUEST,
                {
                    "ok": False,
                    "error": str(exc),
                },
            )

    def serve_file(self, path: Path) -> None:
        if not path.resolve().is_relative_to(PUBLIC_DIR.resolve()) or not path.exists():
            self.send_error(HTTPStatus.NOT_FOUND)
            return

        content_type = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "application/javascript; charset=utf-8",
        }.get(path.suffix, "application/octet-stream")

        body = path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def is_authorized(self) -> bool:
        if not app_password():
            return True
        cookies = self.headers.get("Cookie", "")
        for item in cookies.split(";"):
            name, _, value = item.strip().partition("=")
            if name == SESSION_COOKIE and hmac.compare_digest(value, SESSION_TOKEN):
                return True
        return False

    def send_json(
        self,
        status: HTTPStatus,
        payload: dict[str, object],
        extra_headers: dict[str, str] | None = None,
    ) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        for key, value in (extra_headers or {}).items():
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args: object) -> None:
        return


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the fund report web app.")
    parser.add_argument("--host", default=DEFAULT_HOST, help="Use 127.0.0.1 for local only, 0.0.0.0 for LAN.")
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.getenv("PORT", str(DEFAULT_PORT))),
        help="Port to listen on. Cloud platforms usually set PORT automatically.",
    )
    return parser.parse_args()


def app_password() -> str:
    return os.getenv("APP_PASSWORD", "").strip()


def main() -> int:
    args = parse_args()
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    shown_host = "127.0.0.1" if args.host == "0.0.0.0" else args.host
    print(f"Fund report app running at http://{shown_host}:{args.port}")
    if args.host == "0.0.0.0":
        print("LAN mode enabled. Other devices can use your Mac's local IP address.")
    print("Press Ctrl+C to stop.")
    server.serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
