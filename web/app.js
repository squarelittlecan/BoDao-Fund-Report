const latestBtn = document.querySelector("#latestBtn");
const dateBtn = document.querySelector("#dateBtn");
const dateField = document.querySelector("#dateField");
const dateInput = document.querySelector("#dateInput");
const queryBtn = document.querySelector("#queryBtn");
const copyBtn = document.querySelector("#copyBtn");
const statusTitle = document.querySelector("#statusTitle");
const reportOutput = document.querySelector("#reportOutput");
const dataTableWrap = document.querySelector("#dataTableWrap");
const dataRows = document.querySelector("#dataRows");
const loginOverlay = document.querySelector("#loginOverlay");
const loginForm = document.querySelector("#loginForm");
const passwordInput = document.querySelector("#passwordInput");
const loginError = document.querySelector("#loginError");
const fundList = document.querySelector("#fundList");
const fundSearchInput = document.querySelector("#fundSearchInput");
const selectAllBtn = document.querySelector("#selectAllBtn");
const clearAllBtn = document.querySelector("#clearAllBtn");
const metricList = document.querySelector("#metricList");
const selectAllMetricsBtn = document.querySelector("#selectAllMetricsBtn");
const clearAllMetricsBtn = document.querySelector("#clearAllMetricsBtn");
const dataHead = document.querySelector("#dataHead");

let mode = "latest";

const products = [
  { name: "博道成长智航", code: "013641", showYtd: true },
  { name: "博道星航", code: "026791", showYtd: true },
  { name: "博道惠泓", code: "025103", showYtd: true },
  { name: "博道盛享", code: "025874", showYtd: true },
  { name: "博道久航", code: "008318", showYtd: true },
  { name: "博道惠泰优选", code: "016840", showYtd: true },
  { name: "博道远航", code: "007126", showYtd: true },
  { name: "博道和裕多元稳健30天持有", code: "021323", showYtd: true },
  { name: "博道中证全指指数增强", code: "025020", showYtd: true, defaultSelected: false },
  { name: "博道上证科创板综合指数增强", code: "023901", showYtd: true, defaultSelected: false },
  { name: "博道中证A500指数增强", code: "022745", showYtd: true, defaultSelected: false },
  { name: "博道沪深300指数量化增强", code: "022866", showYtd: true, defaultSelected: false },
  { name: "博道中证800指数增强", code: "023499", showYtd: true, defaultSelected: false },
  { name: "博道大盘价值股票", code: "021915", showYtd: true, defaultSelected: false },
  { name: "博道大盘成长股票", code: "022003", showYtd: true, defaultSelected: false },
  { name: "博道中证500增强", code: "006593", showYtd: true, defaultSelected: false },
  { name: "博道中证500增强Y", code: "025038", showYtd: true, defaultSelected: false },
  { name: "博道沪深300增强", code: "007044", showYtd: true, defaultSelected: false },
  { name: "博道沪深300增强Y", code: "025932", showYtd: true, defaultSelected: false },
  { name: "博道叁佰智航", code: "007470", showYtd: true, defaultSelected: false },
  { name: "博道伍佰智航", code: "007831", showYtd: true, defaultSelected: false },
  { name: "博道消费智航", code: "010998", showYtd: true, defaultSelected: false },
  { name: "博道中证1000指数增强", code: "017644", showYtd: true, defaultSelected: false },
  { name: "博道红利智航股票", code: "019124", showYtd: true, defaultSelected: false },
  { name: "博道衍晟混合", code: "026351", showYtd: true, defaultSelected: false, note: "周披露 · 日涨跌暂无" },
  { name: "博道中证同业存单AAA指数7天持有期", code: "019037", showYtd: true, defaultSelected: false },
  { name: "博道安远6个月持有期", code: "008547", showYtd: true, defaultSelected: false },
  { name: "博道盛兴一年持有期混合", code: "013693", showYtd: true, defaultSelected: false },
  { name: "博道嘉泰回报混合", code: "008208", showYtd: true, defaultSelected: false },
  { name: "博道启航混合", code: "006160", showYtd: true, defaultSelected: false },
  { name: "博道卓远混合", code: "006511", showYtd: true, defaultSelected: false },
  { name: "博道睿见一年持有期混合", code: "010755", showYtd: true, defaultSelected: false },
  { name: "博道志远混合", code: "007825", showYtd: true, defaultSelected: false },
  { name: "博道嘉瑞混合", code: "008467", showYtd: true, defaultSelected: false },
  { name: "博道盛利6个月持有期混合", code: "010404", showYtd: true, defaultSelected: false },
  { name: "博道嘉元混合", code: "008793", showYtd: true, defaultSelected: false },
  { name: "博道嘉兴一年持有期混合", code: "010147", showYtd: true, defaultSelected: false },
  { name: "博道嘉丰混合", code: "010967", showYtd: true, defaultSelected: false },
  { name: "博道盛彦混合", code: "012124", showYtd: true, defaultSelected: false },
  { name: "博道研究恒选混合", code: "015104", showYtd: true, defaultSelected: false },
  { name: "博道和瑞多元稳健6个月持有期混合", code: "016637", showYtd: true, defaultSelected: false },
  { name: "博道明远混合", code: "019497", showYtd: true, defaultSelected: false },
  { name: "博道衍和债券", code: "027004", showYtd: true, defaultSelected: false, note: "周披露 · 日涨跌暂无" },
  { name: "博道和盈利率债", code: "023356", showYtd: true, defaultSelected: false },
  { name: "博道和祥多元稳健债券", code: "017134", showYtd: true, defaultSelected: false },
];

const metricOptions = [
  { key: "inception_date", label: "成立日期", type: "field", defaultChecked: true },
  { key: "今年来", label: "今年以来", type: "stage", defaultChecked: true },
  { key: "近1周", label: "近一周", type: "stage", defaultChecked: false },
  { key: "近1月", label: "近一个月", type: "stage", defaultChecked: false },
  { key: "近3月", label: "近三个月", type: "stage", defaultChecked: false },
  { key: "近1年", label: "近一年", type: "stage", defaultChecked: false },
  { key: "近2年", label: "近两年", type: "stage", defaultChecked: false },
  { key: "近3年", label: "近三年", type: "stage", defaultChecked: false },
  { key: "近5年", label: "近五年", type: "stage", defaultChecked: false },
];

function setMode(nextMode) {
  mode = nextMode;
  latestBtn.classList.toggle("active", mode === "latest");
  dateBtn.classList.toggle("active", mode === "date");
  dateField.classList.toggle("hidden", mode !== "date");
}

function renderFundPicker() {
  fundList.innerHTML = "";
  for (const product of products) {
    const label = document.createElement("label");
    label.className = `fundOption${product.disabled ? " disabled" : ""}`;
    label.dataset.search = `${product.name} ${product.code}`.toLowerCase();
    label.innerHTML = `
      <input type="checkbox" name="fund" value="${product.code}" ${product.disabled ? "disabled" : product.defaultSelected === false ? "" : "checked"} />
      <span>
        <span class="fundName">${product.name}</span>
        <span class="fundCode">${product.code}${product.disabled ? " · 暂无净值" : product.note ? ` · ${product.note}` : ""}</span>
      </span>
    `;
    fundList.appendChild(label);
  }
}

function filterFunds() {
  const keyword = fundSearchInput.value.trim().toLowerCase();
  for (const option of fundList.querySelectorAll(".fundOption")) {
    option.classList.toggle("filtered", Boolean(keyword) && !option.dataset.search.includes(keyword));
  }
}

function renderMetricPicker() {
  metricList.innerHTML = "";
  for (const metric of metricOptions) {
    const label = document.createElement("label");
    label.className = "fundOption metricOption";
    label.innerHTML = `
      <input type="checkbox" name="metric" value="${metric.key}" ${metric.defaultChecked ? "checked" : ""} />
      <span>
        <span class="fundName">${metric.label}</span>
      </span>
    `;
    metricList.appendChild(label);
  }
}

function setAllInputs(container, name, checked) {
  for (const input of container.querySelectorAll(`input[name='${name}']`)) {
    if (!input.disabled) {
      input.checked = checked;
    }
  }
}

function setAllFunds(checked) {
  setAllInputs(fundList, "fund", checked);
}

function setAllMetrics(checked) {
  setAllInputs(metricList, "metric", checked);
}

function selectedProducts() {
  const selectedCodes = new Set(
    [...fundList.querySelectorAll("input[name='fund']:checked")].map((input) => input.value),
  );
  return products.filter((product) => selectedCodes.has(product.code));
}

function selectedMetrics() {
  const selectedKeys = new Set(
    [...metricList.querySelectorAll("input[name='metric']:checked")].map((input) => input.value),
  );
  return metricOptions.filter((metric) => selectedKeys.has(metric.key));
}

function setLoading(isLoading) {
  queryBtn.disabled = isLoading;
  queryBtn.textContent = isLoading ? "正在查询真实数据..." : "查询并生成文案";
}

function tableColumns(metrics) {
  const columns = [
    {
      key: "name",
      label: "产品",
      value: (row) => (row.is_stale_date ? `${row.name}（最新净值日：${row.date}）` : row.name),
    },
    { key: "code", label: "代码", value: (row) => row.code },
    { key: "data_source", label: "数据来源", value: (row) => row.data_source || "天天基金/东方财富" },
    { key: "updated_at", label: "更新时间", value: (row) => row.updated_at || row.date || "-" },
  ];
  if (metrics.some((metric) => metric.key === "inception_date")) {
    columns.push({ key: "inception_date", label: "成立日期", value: (row) => row.inception_date || "-" });
  }
  columns.push({ key: "daily_return", label: "单日", value: (row) => row.daily_return });
  for (const metric of metrics.filter((item) => item.type === "stage")) {
    columns.push({
      key: metric.key,
      label: metric.label,
      value: (row) => {
        if (metric.key === "今年来" && !row.show_ytd) {
          return "-";
        }
        return row.stage_returns?.[metric.key] || (metric.key === "今年来" ? row.ytd_return : "") || "-";
      },
    });
  }
  columns.push({ key: "inception_return", label: "成立来", value: (row) => row.inception_return });
  return columns;
}

function renderRows(rows, metrics) {
  const columns = tableColumns(metrics);
  dataHead.innerHTML = columns.map((column) => `<th>${column.label}</th>`).join("");
  dataRows.innerHTML = "";
  for (const row of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = columns.map((column) => `<td>${column.value(row)}</td>`).join("");
    dataRows.appendChild(tr);
  }
  dataTableWrap.classList.remove("hidden");
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(value, days) {
  const date = parseDate(value);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

function addMonths(value, months) {
  const date = parseDate(value);
  date.setMonth(date.getMonth() + months);
  return formatDate(date);
}

function addYears(value, years) {
  const date = parseDate(value);
  date.setFullYear(date.getFullYear() + years);
  return formatDate(date);
}

function yearOf(value) {
  return parseDate(value).getFullYear();
}

function formatPercent(value) {
  const number = Number(value);
  return `${number >= 0 ? "+" : ""}${number.toFixed(2)}%`;
}

function dailyIcon(value) {
  const number = Number(String(value).replace("%", ""));
  if (Number.isNaN(number)) {
    return "📊";
  }
  return number < 0 ? "📉" : "📈";
}

function loadEastmoneyScript(url) {
  return new Promise((resolve, reject) => {
    window.apidata = undefined;
    const script = document.createElement("script");
    const separator = url.includes("?") ? "&" : "?";
    script.src = `${url}${separator}_=${Date.now()}`;
    script.async = true;
    script.onload = () => {
      const data = window.apidata;
      script.remove();
      if (!data) {
        reject(new Error("公开数据接口没有返回有效数据。"));
        return;
      }
      resolve(data);
    };
    script.onerror = () => {
      script.remove();
      reject(new Error("公开数据接口加载失败。"));
    };
    document.body.appendChild(script);
  });
}

function parseNavRecords(content) {
  const doc = new DOMParser().parseFromString(content, "text/html");
  return [...doc.querySelectorAll("tbody tr")]
    .map((tr) => [...tr.querySelectorAll("td")].map((td) => td.textContent.trim()))
    .filter((cells) => cells.length >= 4 && cells[1] && cells[2])
    .map((cells) => ({
      nav_date: cells[0],
      unit_nav: Number(cells[1]),
      accum_nav: Number(cells[2]),
      daily_return: cells[3] && cells[3] !== "--" ? Number(cells[3].replace("%", "").replace("+", "")) : null,
    }));
}

async function queryInceptionDate(code) {
  return new Promise((resolve, reject) => {
    window.Data_netWorthTrend = undefined;
    const script = document.createElement("script");
    script.src = `https://fund.eastmoney.com/pingzhongdata/${code}.js?_=${Date.now()}`;
    script.async = true;
    script.onload = () => {
      const trend = window.Data_netWorthTrend;
      script.remove();
      if (!Array.isArray(trend) || !trend.length || !trend[0].x) {
        reject(new Error(`${code}: 没有查到成立日期。`));
        return;
      }
      resolve(formatDate(new Date(Number(trend[0].x))));
    };
    script.onerror = () => {
      script.remove();
      reject(new Error(`${code}: 成立日期数据加载失败。`));
    };
    document.body.appendChild(script);
  });
}

async function queryNavRows(code, start, end, per = 200) {
  const params = new URLSearchParams({
    type: "lsjz",
    code,
    page: "1",
    per: String(per),
    sdate: start,
    edate: end,
  });
  const data = await loadEastmoneyScript(`https://fundf10.eastmoney.com/F10DataApi.aspx?${params}`);
  return parseNavRecords(data.content || "");
}

async function latestRecordOnOrBefore(code, target, start) {
  const rows = await queryNavRows(code, start, target);
  const valid = rows.filter((row) => row.nav_date <= target);
  if (!valid.length) {
    throw new Error(`${code}: 没有 ${target} 或之前的净值数据。`);
  }
  valid.sort((a, b) => a.nav_date.localeCompare(b.nav_date));
  return valid[valid.length - 1];
}

async function recordOnOrBefore(code, target, lookbackDays = 120) {
  return latestRecordOnOrBefore(code, target, addDays(target, -lookbackDays));
}

async function latestAvailableRecord(code, target) {
  const year = parseDate(target).getFullYear();
  return latestRecordOnOrBefore(code, target, `${year - 1}-12-01`);
}

async function exactRecordForDate(code, target) {
  const rows = await queryNavRows(code, target, target, 20);
  const match = rows.find((row) => row.nav_date === target);
  if (!match) {
    throw new Error(`${code}: 没有 ${target} 当天的净值数据。`);
  }
  return match;
}

async function queryStageReturns(code) {
  const params = new URLSearchParams({ type: "jdzf", code });
  const data = await loadEastmoneyScript(
    `https://fundf10.eastmoney.com/FundArchivesDatas.aspx?${params}`,
  );
  const content = data.content || "";
  const returns = {};
  for (const label of ["今年来", "近1周", "近1月", "近3月", "近1年", "近2年", "近3年", "近5年", "成立来"]) {
    const match = content.match(
      new RegExp(`<li class='title'>${label}</li>\\s*<li[^>]*>([-+]?\\d+(?:\\.\\d+)?|---)%?</li>`),
    );
    if (match && match[1] !== "---") {
      returns[label] = Number(match[1]);
    }
  }
  if (returns["成立来"] === undefined) {
    throw new Error(`${code}: 没有查到成立来阶段收益。`);
  }
  return returns;
}

async function resolveTargetDates(dateArg, selectedFunds) {
  if (!["latest", "today", "current"].includes(dateArg)) {
    const datesByCode = {};
    const adjusted = [];
    const skipped = [];
    for (const product of selectedFunds) {
      try {
        const record = await recordOnOrBefore(product.code, dateArg);
        datesByCode[product.code] = record.nav_date;
        if (record.nav_date !== dateArg) {
          adjusted.push({
            code: product.code,
            name: product.name,
            date: record.nav_date,
            requestedDate: dateArg,
            reason: "adjusted",
          });
        }
      } catch (error) {
        let inceptionDate = "";
        try {
          inceptionDate = await queryInceptionDate(product.code);
        } catch {
          inceptionDate = "";
        }
        const reason = inceptionDate && dateArg < inceptionDate ? "before_inception" : "no_history";
        adjusted.push({
          code: product.code,
          name: product.name,
          date: inceptionDate,
          requestedDate: dateArg,
          reason,
          message: error.message || String(error),
        });
        skipped.push(product.code);
      }
    }
    const reportDate = Object.values(datesByCode).slice().sort().at(-1);
    if (!reportDate) {
      throw new Error(
        adjusted
          .map((item) =>
            item.reason === "before_inception"
              ? `${item.name}：查询日期 ${item.requestedDate} 早于成立日期 ${item.date}，没有历史净值。`
              : `${item.name}：没有查到 ${item.requestedDate} 或之前的历史净值。`,
          )
          .join("\n"),
      );
    }
    const stale = selectedFunds
      .filter((product) => datesByCode[product.code] && datesByCode[product.code] !== reportDate)
      .map((product) => ({
        code: product.code,
        name: product.name,
        date: datesByCode[product.code],
        requestedDate: dateArg,
        reason: "stale",
      }));
    return {
      reportDate,
      datesByCode,
      warnings: [...adjusted, ...stale],
      skipped,
    };
  }
  const today = formatDate(new Date());
  const datesByCode = {};
  for (const product of selectedFunds) {
    const latest = await latestAvailableRecord(product.code, today);
    datesByCode[product.code] = latest.nav_date;
  }
  const dates = Object.values(datesByCode);
  const reportDate = dates.slice().sort().at(-1);
  const warnings = selectedFunds
    .filter((product) => datesByCode[product.code] !== reportDate)
    .map((product) => ({
      code: product.code,
      name: product.name,
      date: datesByCode[product.code],
      reason: "stale",
    }));
  return { reportDate, datesByCode, warnings, skipped: [] };
}

function stageMetrics(metrics) {
  return metrics.filter((metric) => metric.type === "stage");
}

function targetDateForMetric(targetDate, key) {
  if (key === "今年来") {
    return `${yearOf(targetDate) - 1}-12-31`;
  }
  const offsets = {
    近1周: addDays(targetDate, -7),
    近1月: addMonths(targetDate, -1),
    近3月: addMonths(targetDate, -3),
    近1年: addYears(targetDate, -1),
    近2年: addYears(targetDate, -2),
    近3年: addYears(targetDate, -3),
    近5年: addYears(targetDate, -5),
  };
  return offsets[key];
}

async function calculateStageReturnFromNav(code, targetRecord, key) {
  if (key === "成立来") {
    return (targetRecord.accum_nav - 1) * 100;
  }
  const anchor = targetDateForMetric(targetRecord.nav_date, key);
  if (!anchor) {
    return undefined;
  }
  const lookbackDays = key === "近5年" ? 2300 : key === "近3年" ? 1400 : key === "近2年" ? 1000 : 420;
  let baseline;
  try {
    baseline = await recordOnOrBefore(code, anchor, lookbackDays);
  } catch {
    return undefined;
  }
  if (!baseline?.accum_nav || baseline.nav_date >= targetRecord.nav_date) {
    return undefined;
  }
  return (targetRecord.accum_nav / baseline.accum_nav - 1) * 100;
}

async function calculateStageReturnsFromNav(code, targetRecord, keys) {
  const returns = {};
  for (const key of keys) {
    const value = await calculateStageReturnFromNav(code, targetRecord, key);
    if (value !== undefined && Number.isFinite(value)) {
      returns[key] = value;
    }
  }
  return returns;
}

function buildReport(rows, asOf, metrics, hasMixedDates = false) {
  const [year, month, day] = asOf.split("-");
  const headingDate = `${month}${day}`;
  const disclaimerDate = hasMixedDates ? "各产品最新净值日" : `${Number(year)}.${Number(month)}.${Number(day)}`;
  const lines = [`🌟重点产品净值播报【${headingDate}】`, ""];

  for (const row of rows) {
    lines.push(row.is_stale_date ? `${row.name}（最新净值日：${row.date}）` : row.name);
    lines.push(`🔸代码：${row.code}`);
    if (metrics.some((metric) => metric.key === "inception_date")) {
      lines.push(`📅成立日期：${row.inception_date}`);
    }
    lines.push(`${dailyIcon(row.daily_return)}单日涨跌: ${row.daily_return}`);
    for (const metric of stageMetrics(metrics)) {
      if (metric.key === "今年来" && !row.show_ytd) {
        continue;
      }
      const value = row.stage_returns[metric.key];
      if (value !== undefined && value !== "") {
        lines.push(`${dailyIcon(value)}${metric.label}: ${value}`);
      }
    }
    lines.push(`📈成立以来: ${row.inception_return}`);
    lines.push("");
  }

  lines.push(
    `（数据来源天天基金/东方财富，截至${disclaimerDate}，历史收益不代表未来，产品由博道基金发行，银行为代销渠道，不承担产品的兑付、投资和风险责任。基金有风险，投资须谨慎。）`,
  );
  return lines.join("\n");
}

async function generateStaticReport(dateArg, selectedFunds, metrics, options = {}) {
  const allowNavCalculation = Boolean(options.allowNavCalculation);
  const isLatestMode = ["latest", "today", "current"].includes(dateArg);
  const { reportDate, datesByCode, warnings, skipped = [] } = await resolveTargetDates(dateArg, selectedFunds);
  const skippedCodes = new Set(skipped);
  const rows = [];
  const failures = [];
  const calculationNeeded = [];

  for (const product of selectedFunds) {
    if (skippedCodes.has(product.code)) {
      continue;
    }
    try {
      const targetDate = datesByCode[product.code];
      const record = await exactRecordForDate(product.code, targetDate);
      const inceptionDate = await queryInceptionDate(product.code);
      const showYtd = yearOf(inceptionDate) < yearOf(targetDate);
      const requiredKeys = ["成立来", ...stageMetrics(metrics).map((metric) => metric.key)];
      let stage = {};
      if (isLatestMode) {
        stage = await queryStageReturns(product.code);
        if (metrics.some((metric) => metric.key === "今年来") && showYtd && stage["今年来"] === undefined) {
          throw new Error(`${product.code}: 没有查到今年以来阶段收益。`);
        }
      } else if (allowNavCalculation) {
        stage = await calculateStageReturnsFromNav(product.code, record, requiredKeys);
      }
      const missingKeys = requiredKeys.filter((key) => {
        if (key === "今年来" && !showYtd) {
          return false;
        }
        return stage[key] === undefined;
      });
      if (!isLatestMode && missingKeys.length) {
        calculationNeeded.push({
          name: product.name,
          code: product.code,
          keys: missingKeys,
        });
      }
      const stageReturns = {};
      for (const [key, value] of Object.entries(stage)) {
        stageReturns[key] = formatPercent(value);
      }
      rows.push({
        name: product.name,
        code: product.code,
        date: record.nav_date,
        data_source: "天天基金/东方财富",
        updated_at: record.nav_date,
        unit_nav: record.unit_nav.toFixed(4),
        accum_nav: record.accum_nav.toFixed(4),
        daily_return: record.daily_return === null ? "暂无" : formatPercent(record.daily_return),
        ytd_return: showYtd && stage["今年来"] !== undefined ? formatPercent(stage["今年来"]) : "",
        inception_return: stage["成立来"] === undefined ? "暂无" : formatPercent(stage["成立来"]),
        inception_date: inceptionDate,
        show_ytd: showYtd,
        stage_returns: stageReturns,
        is_stale_date: targetDate !== reportDate,
      });
    } catch (error) {
      failures.push(error.message || String(error));
    }
  }

  if (failures.length) {
    throw new Error(failures.join("\n"));
  }

  return {
    date: reportDate,
    warnings,
    needsCalculation: !isLatestMode && !allowNavCalculation && calculationNeeded.length > 0,
    calculationNeeded,
    report: buildReport(rows, reportDate, metrics, new Set(rows.map((row) => row.date)).size > 1),
    rows,
  };
}

async function fetchBackendReport(dateArg, selectedFunds, metrics) {
  const params = new URLSearchParams({
    date: dateArg,
    codes: selectedFunds.map((product) => product.code).join(","),
    metrics: metrics.map((metric) => metric.key).join(","),
  });
  const response = await fetch(`api/report?${params}`);
  const payload = await response.json();
  if (response.status === 401) {
    loginOverlay.classList.remove("hidden");
    passwordInput.focus();
    throw new Error(payload.error || "请先登录。");
  }
  if (!payload.ok) {
    throw new Error(payload.error || "查询失败");
  }
  return payload;
}

async function getReport(dateArg, selectedFunds, metrics) {
  return getReportWithOptions(dateArg, selectedFunds, metrics);
}

async function getReportWithOptions(dateArg, selectedFunds, metrics, options = {}) {
  if (!["latest", "today", "current"].includes(dateArg)) {
    return generateStaticReport(dateArg, selectedFunds, metrics, options);
  }
  try {
    return await fetchBackendReport(dateArg, selectedFunds, metrics);
  } catch (error) {
    if (error.message === "请先登录。" || error.message.includes("密码")) {
      throw error;
    }
    return generateStaticReport(dateArg, selectedFunds, metrics, options);
  }
}

function calculationConfirmMessage(payload) {
  const lines = payload.calculationNeeded
    .slice(0, 12)
    .map((item) => `${item.name}：${item.keys.map((key) => (key === "成立来" ? "成立以来" : key)).join("、")}`);
  const more = payload.calculationNeeded.length > 12 ? `\n还有 ${payload.calculationNeeded.length - 12} 支基金也有缺失。` : "";
  return (
    "指定日期的历史阶段收益在公开接口中没有直接披露，已先按严格口径显示为“暂无”。\n\n" +
    "是否需要改按东方财富历史净值表里的累计净值计算这些缺失项？\n\n" +
    lines.join("\n") +
    more
  );
}

function warningMessage(payload) {
  if (!payload.warnings?.length) {
    return "";
  }
  const seen = new Set();
  const lines = [];
  for (const item of payload.warnings) {
    const key = `${item.code}-${item.reason}-${item.date || ""}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    if (item.reason === "adjusted") {
      lines.push(`${item.name}：${item.requestedDate} 无净值，已自动取之前最近净值日【${item.date}】`);
    } else if (item.reason === "before_inception") {
      lines.push(`${item.name}：查询日期 ${item.requestedDate} 早于成立日期【${item.date}】，已跳过该基金`);
    } else if (item.reason === "no_history") {
      lines.push(`${item.name}：没有查到 ${item.requestedDate} 或之前的历史净值，已跳过该基金`);
    } else {
      lines.push(`${item.name} 最新净值日是【${item.date}】`);
    }
  }
  return `请注意：\n${lines.join("\n")}`;
}

async function queryReport() {
  const dateArg = mode === "latest" ? "latest" : dateInput.value;
  const funds = selectedProducts();
  const metrics = selectedMetrics();
  if (!funds.length) {
    statusTitle.textContent = "请选择基金";
    reportOutput.textContent = "请至少选择一只基金。";
    reportOutput.classList.add("error");
    dataTableWrap.classList.add("hidden");
    copyBtn.disabled = true;
    return;
  }
  if (mode === "date" && !dateArg) {
    statusTitle.textContent = "请选择日期";
    reportOutput.textContent = "请先选择一个净值日期。";
    reportOutput.classList.add("error");
    return;
  }

  setLoading(true);
  copyBtn.disabled = true;
  dataTableWrap.classList.add("hidden");
  statusTitle.textContent = "查询中";
  reportOutput.classList.remove("error");
  reportOutput.textContent = "正在联网查询公开基金数据，请稍等。";

  try {
    let payload = await getReport(dateArg, funds, metrics);
    statusTitle.textContent = `已生成 ${payload.date}`;
    reportOutput.textContent = payload.report;
    copyBtn.disabled = false;
    renderRows(payload.rows, metrics);
    if (payload.needsCalculation && confirm(calculationConfirmMessage(payload))) {
      setLoading(true);
      reportOutput.textContent = "正在按历史累计净值计算缺失阶段收益，请稍等。";
      payload = await getReportWithOptions(dateArg, funds, metrics, { allowNavCalculation: true });
      statusTitle.textContent = `已生成 ${payload.date}`;
      reportOutput.textContent = payload.report;
      copyBtn.disabled = false;
      renderRows(payload.rows, metrics);
    }

    const warning = warningMessage(payload);
    if (warning) {
      alert(warning);
    }
  } catch (error) {
    statusTitle.textContent = "未生成";
    reportOutput.classList.add("error");
    reportOutput.textContent = String(error.message || error);
  } finally {
    setLoading(false);
  }
}

async function copyReport() {
  await navigator.clipboard.writeText(reportOutput.textContent);
  copyBtn.textContent = "已复制";
  setTimeout(() => {
    copyBtn.textContent = "复制";
  }, 1200);
}

async function checkAuth() {
  try {
    const response = await fetch("api/auth");
    if (!response.ok) {
      return;
    }
    const payload = await response.json();
    if (payload.required) {
      loginOverlay.classList.remove("hidden");
      passwordInput.focus();
    }
  } catch {
    return;
  }
}

async function login(event) {
  event.preventDefault();
  loginError.textContent = "";
  const response = await fetch("api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: passwordInput.value }),
  });
  const payload = await response.json();
  if (!payload.ok) {
    loginError.textContent = payload.error || "登录失败。";
    return;
  }
  passwordInput.value = "";
  loginOverlay.classList.add("hidden");
}

latestBtn.addEventListener("click", () => setMode("latest"));
dateBtn.addEventListener("click", () => setMode("date"));
queryBtn.addEventListener("click", queryReport);
copyBtn.addEventListener("click", copyReport);
loginForm.addEventListener("submit", login);
selectAllBtn.addEventListener("click", () => setAllFunds(true));
clearAllBtn.addEventListener("click", () => setAllFunds(false));
selectAllMetricsBtn.addEventListener("click", () => setAllMetrics(true));
clearAllMetricsBtn.addEventListener("click", () => setAllMetrics(false));
fundSearchInput.addEventListener("input", filterFunds);

renderFundPicker();
renderMetricPicker();
setMode("latest");
checkAuth();
