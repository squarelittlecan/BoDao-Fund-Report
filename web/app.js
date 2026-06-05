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

let mode = "latest";

const products = [
  { name: "博道成长智航", code: "013641", showYtd: true },
  { name: "博道星航", code: "026791", showYtd: false },
  { name: "博道惠泓", code: "025103", showYtd: false },
  { name: "博道盛享", code: "025874", showYtd: false },
  { name: "博道久航", code: "008318", showYtd: true },
  { name: "博道惠泰优选", code: "016840", showYtd: true },
  { name: "博道远航", code: "007126", showYtd: true },
  { name: "博道和裕多元稳健30天持有", code: "021323", showYtd: true },
  { name: "博道消费智航", code: "010998", showYtd: true },
];

function setMode(nextMode) {
  mode = nextMode;
  latestBtn.classList.toggle("active", mode === "latest");
  dateBtn.classList.toggle("active", mode === "date");
  dateField.classList.toggle("hidden", mode !== "date");
}

function setLoading(isLoading) {
  queryBtn.disabled = isLoading;
  queryBtn.textContent = isLoading ? "正在查询真实数据..." : "查询并生成文案";
}

function renderRows(rows) {
  dataRows.innerHTML = "";
  for (const row of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.name}</td>
      <td>${row.code}</td>
      <td>${row.daily_return}</td>
      <td>${row.ytd_return || "-"}</td>
      <td>${row.inception_return}</td>
    `;
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

function formatPercent(value) {
  const number = Number(value);
  return `${number >= 0 ? "+" : ""}${number.toFixed(2)}%`;
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
    .filter((cells) => cells.length >= 4 && cells[1] && cells[2] && cells[3] && cells[3] !== "--")
    .map((cells) => ({
      nav_date: cells[0],
      unit_nav: Number(cells[1]),
      accum_nav: Number(cells[2]),
      daily_return: Number(cells[3].replace("%", "").replace("+", "")),
    }));
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
  for (const label of ["今年来", "成立来"]) {
    const match = content.match(
      new RegExp(`<li class='title'>${label}</li>\\s*<li[^>]*>([-+]?\\d+(?:\\.\\d+)?)%</li>`),
    );
    if (match) {
      returns[label] = Number(match[1]);
    }
  }
  if (returns["成立来"] === undefined) {
    throw new Error(`${code}: 没有查到成立来阶段收益。`);
  }
  return returns;
}

async function resolveTargetDate(dateArg) {
  if (!["latest", "today", "current"].includes(dateArg)) {
    return dateArg;
  }
  const today = formatDate(new Date());
  const dates = [];
  for (const product of products) {
    const latest = await latestAvailableRecord(product.code, today);
    dates.push(latest.nav_date);
  }
  const unique = [...new Set(dates)];
  if (unique.length !== 1) {
    throw new Error(`各基金最新净值日不一致：${dates.join(", ")}`);
  }
  return unique[0];
}

function buildReport(rows, asOf) {
  const [year, month, day] = asOf.split("-");
  const headingDate = `${month}${day}`;
  const disclaimerDate = `${Number(year)}.${Number(month)}.${Number(day)}`;
  const lines = [`🌟重点产品净值播报【${headingDate}】`, ""];

  for (const row of rows) {
    lines.push(row.name);
    lines.push(`🔸代码：${row.code}`);
    lines.push(`📈单日涨跌: ${row.daily_return}`);
    if (row.ytd_return) {
      lines.push(`📈今年以来: ${row.ytd_return}`);
    }
    lines.push(`📈成立以来: ${row.inception_return}`);
    lines.push("");
  }

  lines.push(
    `（数据来源天天基金/东方财富，截至${disclaimerDate}，历史收益不代表未来，产品由博道基金发行，银行为代销渠道，不承担产品的兑付、投资和风险责任。基金有风险，投资须谨慎。）`,
  );
  return lines.join("\n");
}

async function generateStaticReport(dateArg) {
  const targetDate = await resolveTargetDate(dateArg);
  const today = formatDate(new Date());
  const rows = [];
  const failures = [];

  for (const product of products) {
    try {
      const record = await exactRecordForDate(product.code, targetDate);
      const latest = await latestAvailableRecord(product.code, today);
      if (latest.nav_date !== targetDate) {
        throw new Error(
          `${product.code}: 公开源阶段收益仅支持最新净值日 ${latest.nav_date}，不支持 ${targetDate}`,
        );
      }
      const stage = await queryStageReturns(product.code);
      rows.push({
        name: product.name,
        code: product.code,
        date: record.nav_date,
        unit_nav: record.unit_nav.toFixed(4),
        accum_nav: record.accum_nav.toFixed(4),
        daily_return: formatPercent(record.daily_return),
        ytd_return: product.showYtd ? formatPercent(stage["今年来"]) : "",
        inception_return: formatPercent(stage["成立来"]),
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
    report: buildReport(rows, targetDate),
    rows,
  };
}

async function fetchBackendReport(dateArg) {
  const response = await fetch(`api/report?date=${encodeURIComponent(dateArg)}`);
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

async function getReport(dateArg) {
  try {
    return await fetchBackendReport(dateArg);
  } catch (error) {
    if (error.message === "请先登录。" || error.message.includes("密码")) {
      throw error;
    }
    return generateStaticReport(dateArg);
  }
}

async function queryReport() {
  const dateArg = mode === "latest" ? "latest" : dateInput.value;
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
    const payload = await getReport(dateArg);

    statusTitle.textContent = `已生成 ${payload.date}`;
    reportOutput.textContent = payload.report;
    copyBtn.disabled = false;
    renderRows(payload.rows);
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

setMode("latest");
checkAuth();
