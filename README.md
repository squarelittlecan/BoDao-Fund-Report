# Market Data Tools

Small no-AI tools for fetching or formatting market/fund data.

## Web app

Start the local web app:

```bash
python3 app_server.py
```

Open:

```text
http://127.0.0.1:8765
```

Use `查最新` for daily operation. The page queries the internet, generates the report, and shows a copy button.

For Alibaba Cloud deployment, see `ALIYUN_DEPLOY.md`.

To let people on the same local network access it:

```bash
python3 app_server.py --host 0.0.0.0
```

Then share your Mac's local IP address with the port, for example:

```text
http://192.168.1.23:8765
```

## Fund daily report

Edit `fund_daily_data.csv`, then run:

```bash
python3 fund_report_generator.py --date 2026-06-04
```

The report is printed and saved to `output/fund_report.txt`.

CSV columns:

- `name`: fund product name
- `code`: fund code
- `daily_return`: single-day return, without or with `%`
- `ytd_return`: year-to-date return; leave blank to omit
- `inception_return`: return since inception

For a Wind-backed workflow, export or fetch these same columns from Wind, then feed the CSV into the generator.

## Query real fund data

To query historical NAV data from 天天基金/东方财富 and generate the report for a specific date:

```bash
python3 query_fund_report.py 2026-06-04
```

To query the latest common NAV date automatically:

```bash
python3 query_fund_report.py
```

Outputs:

- `output/fund_data_YYYY-MM-DD.csv`: raw queried data and calculated returns
- `output/fund_report_YYYY-MM-DD.txt`: final text report

The tool refuses to generate a partial report if any product has no real NAV record for the input date.

Important:

- Daily return comes from the fund historical NAV record.
- Year-to-date and since-inception returns come from the public stage-return endpoint, so dividend-adjusted funds are not understated by a simple accumulated-NAV formula.
- The public stage-return endpoint exposes the latest stage returns only. For older historical dates, use WindPy or a Wind export.
- If the published report must say `数据来源wind`, connect WindPy or use a Wind export instead of the public-source query tool.

## Strict Wind CSV mode

For any historical date with strict Wind wording and Wind return calculations, export a CSV from Wind using this format:

```csv
date,name,code,daily_return,ytd_return,inception_return,unit_nav,accum_nav
2026-06-03,博道成长智航,013641,+0.00,+0.00,+0.00,,
```

Required columns:

- `date`
- `code`
- `daily_return`
- `inception_return`

Required only when the product has `show_ytd=yes` in `fund_products.csv`:

- `ytd_return`

Optional columns:

- `name`
- `unit_nav`
- `accum_nav`

Then run:

```bash
python3 query_fund_report.py 2026-06-03 --wind-csv wind_fund_data_template.csv
```

In this mode the tool does not query public sources. It reads the Wind export, validates every configured fund for the requested date, and labels the report as `数据来源wind`.

## Stock daily fetcher

Get an API key from Alpha Vantage, put the symbols you want in `tickers.txt`, then run:

```bash
export ALPHA_VANTAGE_API_KEY="your_api_key_here"
python3 stock_fetcher.py
```

The output is written to `data/daily_prices.csv`.

Notes:

- Use `--outputsize compact` for daily updates.
- Use `--outputsize full` only when you need historical backfill and your API plan supports it.
- Increase `--delay` if your API plan has stricter rate limits.
