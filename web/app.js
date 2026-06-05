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
    const response = await fetch(`/api/report?date=${encodeURIComponent(dateArg)}`);
    const payload = await response.json();
    if (response.status === 401) {
      loginOverlay.classList.remove("hidden");
      passwordInput.focus();
      throw new Error(payload.error || "请先登录。");
    }
    if (!payload.ok) {
      throw new Error(payload.error || "查询失败");
    }

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
    const response = await fetch("/api/auth");
    const payload = await response.json();
    if (payload.required) {
      loginOverlay.classList.remove("hidden");
      passwordInput.focus();
    }
  } catch {
    loginOverlay.classList.remove("hidden");
  }
}

async function login(event) {
  event.preventDefault();
  loginError.textContent = "";
  const response = await fetch("/api/login", {
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
