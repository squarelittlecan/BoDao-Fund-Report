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
  { name: "博道中证全指指数增强A", code: "025020", showYtd: true },
  { name: "博道上证科创板综合指数增强A", code: "023901", showYtd: true },
  { name: "博道中证A500指数增强A", code: "022745", showYtd: true },
  { name: "博道沪深300指数量化增强A", code: "022866", showYtd: true },
  { name: "博道中证800指数增强A", code: "023499", showYtd: true },
  { name: "博道大盘价值股票A", code: "021915", showYtd: true },
  { name: "博道大盘成长股票A", code: "022003", showYtd: true },
  { name: "博道中证500增强A", code: "006593", showYtd: true },
  { name: "博道中证500增强Y", code: "025038", showYtd: true },
  { name: "博道沪深300增强A", code: "007044", showYtd: true },
  { name: "博道沪深300增强Y", code: "025932", showYtd: true },
  { name: "博道叁佰智航A", code: "007470", showYtd: true },
  { name: "博道伍佰智航A", code: "007831", showYtd: true },
  { name: "博道消费智航A", code: "010998", showYtd: true },
  { name: "博道成长智航股票A", code: "013641", showYtd: true },
  { name: "博道中证1000指数增强A", code: "017644", showYtd: true },
  { name: "博道红利智航股票A", code: "019124", showYtd: true },
  { name: "博道衍晟混合A", code: "026351", showYtd: true, defaultSelected: false, note: "周披露 · 日涨跌暂无" },
  { name: "博道星航混合", code: "026791", showYtd: true },
  { name: "博道久航混合A", code: "008318", showYtd: true },
  { name: "博道中证同业存单AAA指数7天持有期", code: "019037", showYtd: true },
  { name: "博道安远6个月持有期", code: "008547", showYtd: true },
  { name: "博道盛兴一年持有期混合", code: "013693", showYtd: true },
  { name: "博道嘉泰回报混合", code: "008208", showYtd: true },
  { name: "博道启航混合A", code: "006160", showYtd: true },
  { name: "博道卓远混合A", code: "006511", showYtd: true },
  { name: "博道睿见一年持有期混合", code: "010755", showYtd: true },
  { name: "博道远航混合A", code: "007126", showYtd: true },
  { name: "博道志远混合A", code: "007825", showYtd: true },
  { name: "博道嘉瑞混合A", code: "008467", showYtd: true },
  { name: "博道盛利6个月持有期混合", code: "010404", showYtd: true },
  { name: "博道嘉元混合A", code: "008793", showYtd: true },
  { name: "博道嘉兴一年持有期混合", code: "010147", showYtd: true },
  { name: "博道嘉丰混合A", code: "010967", showYtd: true },
  { name: "博道盛彦混合A", code: "012124", showYtd: true },
  { name: "博道研究恒选混合A", code: "015104", showYtd: true },
  { name: "博道和瑞多元稳健6个月持有期混合A", code: "016637", showYtd: true },
  { name: "博道惠泰优选混合A", code: "016840", showYtd: true },
  { name: "博道明远混合A", code: "019497", showYtd: true },
  { name: "博道惠泓价值成长混合", code: "025103", showYtd: true },
  { name: "博道盛享品质成长混合", code: "025874", showYtd: true },
  { name: "博道衍和债券A", code: "027004", showYtd: true, defaultSelected: false, note: "周披露 · 日涨跌暂无" },
  { name: "博道和盈利率债A", code: "023356", showYtd: true },
  { name: "博道和祥多元稳健债券A", code: "017134", showYtd: true },
  { name: "博道和裕多元稳健30天持有期债券A", code: "021323", showYtd: true },
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
    { key: "name", label: "产品", value: (row) => row.name },
    { key: "code", label: "代码", value: (row) => row.code },
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

async function resolveTargetDate(dateArg, selectedFunds) {
  if (!["latest", "today", "current"].includes(dateArg)) {
    return dateArg;
  }
  const today = formatDate(new Date());
  const dates = [];
  for (const product of selectedFunds) {
    const latest = await latestAvailableRecord(product.code, today);
    dates.push(latest.nav_date);
  }
  const unique = [...new Set(dates)];
  if (unique.length !== 1) {
    throw new Error(`各基金最新净值日不一致：${dates.join(", ")}`);
  }
  return unique[0];
}

function buildReport(rows, asOf, metrics) {
  const [year, month, day] = asOf.split("-");
  const headingDate = `${month}${day}`;
  const disclaimerDate = `${Number(year)}.${Number(month)}.${Number(day)}`;
  const lines = [`🌟重点产品净值播报【${headingDate}】`, ""];

  for (const row of rows) {
    lines.push(row.name);
    lines.push(`🔸代码：${row.code}`);
    if (metrics.some((metric) => metric.key === "inception_date")) {
      lines.push(`📅成立日期：${row.inception_date}`);
    }
    lines.push(`${dailyIcon(row.daily_return)}单日涨跌: ${row.daily_return}`);
    for (const metric of metrics.filter((item) => item.type === "stage")) {
      if (metric.key === "今年来" && !row.show_ytd) {
        continue;
      }
      const value = row.stage_returns[metric.key];
      if (value) {
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

async function generateStaticReport(dateArg, selectedFunds, metrics) {
  const targetDate = await resolveTargetDate(dateArg, selectedFunds);
  const today = formatDate(new Date());
  const rows = [];
  const failures = [];

  for (const product of selectedFunds) {
    try {
      const record = await exactRecordForDate(product.code, targetDate);
      const latest = await latestAvailableRecord(product.code, today);
      if (latest.nav_date !== targetDate) {
        throw new Error(
          `${product.code}: 公开源阶段收益仅支持最新净值日 ${latest.nav_date}，不支持 ${targetDate}`,
        );
      }
      const inceptionDate = await queryInceptionDate(product.code);
      const showYtd = yearOf(inceptionDate) < yearOf(targetDate);
      const stage = await queryStageReturns(product.code);
      if (metrics.some((metric) => metric.key === "今年来") && showYtd && stage["今年来"] === undefined) {
        throw new Error(`${product.code}: 没有查到今年以来阶段收益。`);
      }
      const stageReturns = {};
      for (const [key, value] of Object.entries(stage)) {
        stageReturns[key] = formatPercent(value);
      }
      rows.push({
        name: product.name,
        code: product.code,
        date: record.nav_date,
        unit_nav: record.unit_nav.toFixed(4),
        accum_nav: record.accum_nav.toFixed(4),
        daily_return: record.daily_return === null ? "暂无" : formatPercent(record.daily_return),
        ytd_return: showYtd && stage["今年来"] !== undefined ? formatPercent(stage["今年来"]) : "",
        inception_return: formatPercent(stage["成立来"]),
        inception_date: inceptionDate,
        show_ytd: showYtd,
        stage_returns: stageReturns,
      });
    } catch (error) {
      failures.push(error.message || String(error));
    }
  }

  if (failures.length) {
    throw new Error(failures.join("\n"));
  }

  return {
    date: targetDate,
    report: buildReport(rows, targetDate, metrics),
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
  try {
    return await fetchBackendReport(dateArg, selectedFunds, metrics);
  } catch (error) {
    if (error.message === "请先登录。" || error.message.includes("密码")) {
      throw error;
    }
    return generateStaticReport(dateArg, selectedFunds, metrics);
  }
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
    const payload = await getReport(dateArg, funds, metrics);

    statusTitle.textContent = `已生成 ${payload.date}`;
    reportOutput.textContent = payload.report;
    copyBtn.disabled = false;
    renderRows(payload.rows, metrics);
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
