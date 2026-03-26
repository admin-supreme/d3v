const state = {
  data: null,
  selectedId: null,
  tab: "raw",
  liveEvents: [],
  liveDom: "",
  liveUrl: "",
  refreshTimer: 0,
  loading: false,
};

const $ = (sel) => document.querySelector(sel);
const frame = () => $("#viewerFrame");

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[m]);
}

function clip(value, max = 180) {
  const s = String(value ?? "");
  return s.length > max ? s.slice(0, max) + "…" : s;
}

function setStatus(text, kind) {
  const node = $("#statusText");
  if (node) node.textContent = text;
  const dot = $("#status .dot");
  if (dot) dot.className = "dot" + (kind ? ` ${kind}` : "");
}

function summaryCard(label, value) {
  return `<div class="mini-card"><div class="label">${esc(label)}</div><div class="value">${esc(value || "—")}</div></div>`;
}

function getEntries() {
  return state.data?.entries || [];
}

function detectType(entry) {
  const t = String(entry?.type || entry?.kind || "").toLowerCase();
  if (t === "html") return "html";
  if (t === "css") return "css";
  if (t === "js" || t === "javascript") return "js";
  if (["json", "xml", "text", "svg", "txt", "map"].includes(t)) return "text";
  return "asset";
}

function formatHtml(source) {
  const s = String(source || "");
  if (!s.trim()) return "";
  const tokens = s.replace(/\r\n/g, "\n").split(/(<[^>]+>)/g).filter(Boolean);
  const out = [];
  let indent = 0;
  const inline = new Set(["a","abbr","b","br","code","em","i","img","input","label","small","span","strong","sub","sup","u","time"]);
  for (const token of tokens) {
    if (!token) continue;
    if (!token.startsWith("<")) {
      const t = token.trim();
      if (t) out.push("  ".repeat(Math.max(0, indent)) + t);
      continue;
    }
    const tag = token.match(/^<\/?\s*([a-zA-Z0-9:-]+)/);
    const name = tag ? tag[1].toLowerCase() : "";
    const closing = /^<\//.test(token);
    const selfClose = /\/>$/.test(token) || /^(?:<!|<\?)/.test(token) || ["meta","link","br","hr","img","input","source","area","col","embed","param","track","wbr"].includes(name);
    if (closing) indent = Math.max(0, indent - 1);
    out.push("  ".repeat(Math.max(0, indent)) + token.trim());
    if (!closing && !selfClose && !inline.has(name) && !/^<!doctype/i.test(token)) indent++;
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function formatCss(source) {
  const s = String(source || "");
  if (!s.trim()) return "";
  return s
    .replace(/\r\n/g, "\n")
    .replace(/\{/g, " {\n  ")
    .replace(/;\s*/g, ";\n  ")
    .replace(/\}/g, "\n}\n")
    .replace(/\n\s*\n+/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function formatJs(source) {
  const s = String(source || "");
  if (!s.trim()) return "";
  return s.trim();
}

function currentEntry() {
  const d = state.data;
  if (!d) return null;
  if (!state.selectedId) return d.rootPage || d.entries?.[0] || null;
  return d.entries?.find((x) => x.id === state.selectedId) || d.rootPage || d.entries?.[0] || null;
}

function getSource(entry, mode) {
  if (!entry) return "";
  const raw = String(entry.content || "");
  if (mode === "raw") return raw;
  if (mode === "pretty") {
    const type = detectType(entry);
    if (type === "html") return formatHtml(raw);
    if (type === "css") return formatCss(raw);
    if (type === "js") return formatJs(raw);
    return raw;
  }
  if (mode === "tree") return JSON.stringify(state.data?.tree || {}, null, 2);
  if (mode === "json") return JSON.stringify(state.data || {}, null, 2);
  return raw;
}

function renderTabs() {
  const tabs = [
    ["raw", "Raw"],
    ["pretty", "Pretty"],
    ["tree", "Tree JSON"],
    ["json", "Full JSON"],
  ];
  $("#tabs").innerHTML = tabs.map(([id, label]) => `<div class="tab ${state.tab === id ? "active" : ""}" data-tab="${id}">${label}</div>`).join("");
  document.querySelectorAll(".tab").forEach((el) => {
    el.addEventListener("click", () => {
      state.tab = el.dataset.tab;
      renderTabs();
      renderViewer();
    });
  });
}

function renderViewer() {
  const entry = currentEntry();
  if (!state.data || !entry) {
    $("#viewer").innerHTML = '<pre class="muted">Load a page to inspect it.</pre>';
    return;
  }
  const source = getSource(entry, state.tab);
  $("#viewer").innerHTML = `<pre>${esc(source || "No data for this section.")}</pre>`;
}

function renderMeta(d) {
  $("#meta").innerHTML = [
    summaryCard("Root", d.rootUrl),
    summaryCard("Final", d.finalUrl),
    summaryCard("Pages", String(d.stats?.pages || 0)),
    summaryCard("Assets", String(d.stats?.assets || 0)),
    summaryCard("Text", String(d.stats?.textFiles || 0)),
    summaryCard("Total", String(d.stats?.total || 0)),
  ].join("");
  $("#resourceCount").textContent = `${d.entries?.length || 0} collected`;
}

function renderTree() {
  const d = state.data;
  if (!d) {
    $("#tree").innerHTML = '<div class="muted">No site loaded yet.</div>';
    $("#terminalTree").textContent = "No site loaded yet.";
    return;
  }

  $("#terminalTree").textContent = d.treeText || "No tree.";
  const rows = (d.entries || []).map((e) => {
    const active = e.id === state.selectedId ? " active" : "";
    return `
      <div class="tree-item${active}" data-id="${esc(e.id)}">
        <div class="tree-left">
          <div class="path">${esc(e.path || e.url || "")}</div>
          <div class="small">${esc(e.method || "GET")} · ${esc(detectType(e))} · ${esc(String(e.status || ""))} · ${esc(String(e.size || 0))} bytes</div>
        </div>
        <div class="actions">
          <span class="pill">${esc(e.kind || "resource")}</span>
          <button type="button" class="secondary copy-tree-one" data-copy="${esc(e.id)}">Copy</button>
        </div>
      </div>`;
  }).join("");

  $("#tree").innerHTML = rows || '<div class="muted">No resources.</div>';

  document.querySelectorAll(".tree-item").forEach((el) => {
    el.addEventListener("click", (ev) => {
      if (ev.target && ev.target.classList.contains("copy-tree-one")) return;
      state.selectedId = el.dataset.id;
      renderTree();
      renderViewer();
    });
  });

  document.querySelectorAll(".copy-tree-one").forEach((btn) => {
    btn.addEventListener("click", async (ev) => {
      ev.stopPropagation();
      const entry = getEntries().find((x) => x.id === btn.dataset.copy);
      if (entry) await copyText(entry.content || "");
    });
  });
}

function bundleItems(items) {
  if (!items?.length) return '<div class="muted">No entries.</div>';
  return items.map((e) => `
    <div class="bundle-item">
      <div class="bundle-top">
        <div class="bundle-left">
          <div class="bundle-title">${esc(e.inline ? "inline" : e.kind || "resource")} · ${esc(e.type || detectType(e))}</div>
          <div class="bundle-url">${esc(e.path || e.url || "")}</div>
          <div class="small">${esc(String(e.status || ""))} · ${esc(String(e.size || 0))} bytes · depth ${esc(String(e.depth ?? 0))}</div>
        </div>
        <div class="actions">
          <button type="button" class="secondary open-one" data-open="${esc(e.id)}">Open</button>
          <button type="button" class="secondary copy-bundle-one" data-copy="${esc(e.id)}">Copy</button>
        </div>
      </div>
    </div>
  `).join("");
}

function renderBundles() {
  const d = state.data;
  if (!d) {
    $("#bundles").innerHTML = '<div class="muted">No resources yet.</div>';
    return;
  }

  const groups = d.bundles || {};
  const cards = [
    ["HTML", groups.html || []],
    ["CSS", groups.css || []],
    ["JS", groups.js || []],
    ["Text", groups.text || []],
    ["Assets", groups.assets || []],
  ];

  $("#bundles").innerHTML = cards.map(([label, items]) => `
    <div class="bundle-card">
      <div class="section-head tight">
        <h4>${esc(label)}</h4>
        <span class="muted">${esc(String(items.length))}</span>
      </div>
      <div class="bundle-items">${bundleItems(items)}</div>
    </div>
  `).join("");

  document.querySelectorAll(".open-one").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedId = btn.dataset.open;
      renderTree();
      renderViewer();
    });
  });

  document.querySelectorAll(".copy-bundle-one").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const entry = getEntries().find((x) => x.id === btn.dataset.copy);
      if (entry) await copyText(entry.content || "");
    });
  });
}

function renderSearch() {
  const d = state.data;
  const term = $("#term").value.trim();
  if (!d || !term) {
    $("#searchResults").textContent = d ? "Type a search term." : "No results yet.";
    return;
  }

  const hits = [];
  for (const e of getEntries()) {
    const content = String(e.content || "");
    const idx = content.toLowerCase().indexOf(term.toLowerCase());
    if (idx === -1) continue;
    const start = Math.max(0, idx - 140);
    const end = Math.min(content.length, idx + term.length + 220);
    hits.push({
      kind: e.kind,
      path: e.path,
      snippet: content.slice(start, end),
    });
  }

  if (!hits.length) {
    $("#searchResults").innerHTML = '<div class="muted">No matches found.</div>';
    return;
  }

  $("#searchResults").innerHTML = hits.slice(0, 40).map((h) => `
    <div class="search-hit">
      <div class="search-src"><strong>${esc(h.kind || "resource")}</strong> · ${esc(h.path || "")}</div>
      <div>${esc(h.snippet || "Match found.")}</div>
    </div>
  `).join("");
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(String(text || ""));
    setStatus("Copied", "good");
    setTimeout(() => setStatus(state.data ? "Loaded" : "Idle", "good"), 1000);
  } catch {
    alert("Copy failed");
  }
}

function renderLiveEvents() {
  if (!state.liveEvents.length) {
    $("#liveEvents").innerHTML = '<div class="muted">No iframe events yet.</div>';
    $("#eventCount").textContent = "0 events";
    $("#eventType").textContent = "idle";
    $("#eventNode").textContent = "no click yet";
    return;
  }

  $("#eventCount").textContent = `${state.liveEvents.length} events`;
  $("#eventType").textContent = state.liveEvents[0]?.type || "event";
  const firstDetail = state.liveEvents[0]?.detail || {};
  $("#eventNode").textContent = clip(firstDetail.text || firstDetail.tag || firstDetail.href || firstDetail.action || "event", 80);

  $("#liveEvents").innerHTML = state.liveEvents.map((evt) => {
    const d = evt.detail || {};
    const summary = clip(d.text || d.tag || d.href || d.action || d.url || "", 120);
    return `
      <div class="event-item">
        <div class="event-top">
          <strong>${esc(evt.type || "event")}</strong>
          <span class="muted">${esc(new Date(evt.ts || Date.now()).toLocaleTimeString())}</span>
        </div>
        <div class="small">${esc(summary)}</div>
      </div>
    `;
  }).join("");
}

function renderLiveDom(snapshot) {
  const text = String(snapshot || "").trim();
  $("#liveDom").textContent = text || "No live snapshot yet.";
}

function setLiveUrl(text) {
  $("#liveUrl").textContent = text || "No page loaded.";
}

function clearLiveState() {
  state.liveEvents = [];
  state.liveDom = "";
  renderLiveEvents();
  renderLiveDom("");
}

function resolveOriginalFromIframeUrl(viewerUrl) {
  try {
    const u = new URL(viewerUrl, location.href);
    if (u.pathname === "/browse") {
      const direct = u.searchParams.get("u");
      return direct ? new URL(direct, location.href).href : "";
    }
    const parts = u.pathname.slice("/browse/".length).split("/").filter(Boolean);
    if (parts.length < 2) return "";
    const scheme = parts.shift();
    const host = parts.shift();
    const original = new URL(`/${parts.map((p) => safeDecode(p)).join("/")}`, `${scheme}://${host}`);
    original.search = u.search;
    return original.href;
  } catch {
    return "";
  }
}

function safeDecode(v) {
  try { return decodeURIComponent(v); } catch { return v; }
}

function scheduleRefresh(reason = "") {
  clearTimeout(state.refreshTimer);
  state.refreshTimer = setTimeout(() => refreshSource(reason), 700);
}

async function refreshSource(reason = "") {
  const viewer = frame();
  const current = resolveCurrentOriginalUrl();
  if (!current) return;
  if (!state.data) return;

  if (current === state.data.rootUrl && reason === "snapshot") return;

  try {
    setStatus("Refreshing…", "");
    const res = await fetch(`/api/analyze?url=${encodeURIComponent(current)}&depth=${encodeURIComponent($("#depth").value || "2")}&q=${encodeURIComponent($("#term").value.trim())}`);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Request failed");
    state.data = data;
    state.selectedId = data.rootPage?.id || data.entries?.[0]?.id || null;
    state.liveUrl = viewer?.contentWindow?.location?.href || state.liveUrl;
    renderMeta(data);
    renderTree();
    renderBundles();
    renderViewer();
    renderSearch();
    setStatus("Loaded", "good");
  } catch (err) {
    setStatus("Refresh failed", "bad");
    console.error(err);
  }
}

function resolveCurrentOriginalUrl() {
  const f = frame();
  try {
    const href = f.contentWindow.location.href;
    return resolveOriginalFromIframeUrl(href);
  } catch {
    return state.data?.rootUrl || "";
  }
}

function onIframeMessage(event) {
  const f = frame();
  if (!f?.contentWindow || event.source !== f.contentWindow) return;
  const data = event.data || {};
  if (data.source !== "d3v-live") return;

  const detail = data.detail || {};
  state.liveUrl = data.href || state.liveUrl;
  setLiveUrl(data.href || data.originalUrl || state.liveUrl);

  state.liveEvents.unshift({
    type: data.type || "event",
    detail,
    href: data.href || "",
    ts: data.ts || Date.now(),
  });
  state.liveEvents = state.liveEvents.slice(0, 30);
  renderLiveEvents();

  if (data.type === "snapshot" && detail.html) {
    state.liveDom = detail.html;
    renderLiveDom(detail.html);
  }

  if (data.type === "load" || data.type === "navigate") {
    scheduleRefresh(data.type);
  } else if (data.type === "click" && (detail.href || detail.action || ["A", "FORM", "BUTTON"].includes(String(detail.tag || "").toUpperCase()))) {
    scheduleRefresh("click");
  } else if (data.type === "submit") {
    scheduleRefresh("submit");
  }
}

function setIframeUrl(url) {
  const iframe = frame();
  if (!iframe) return;
  iframe.src = url;
  setLiveUrl(url);
}

function requestFullscreen() {
  const shell = $("#iframeShell");
  if (!shell) return;
  const fn = shell.requestFullscreen || shell.webkitRequestFullscreen || shell.msRequestFullscreen;
  if (fn) fn.call(shell);
}

function renderAll() {
  renderTabs();
  renderViewer();
  renderTree();
  renderBundles();
  renderSearch();
  renderLiveEvents();
  renderLiveDom(state.liveDom);
}

async function loadTarget(url) {
  const depth = $("#depth").value || "2";
  const term = $("#term").value.trim();
  setStatus("Fetching…", "");
  $("#searchResults").textContent = "Working…";
  try {
    const res = await fetch(`/api/analyze?url=${encodeURIComponent(url)}&depth=${encodeURIComponent(depth)}&q=${encodeURIComponent(term)}`);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Request failed");
    state.data = data;
    state.selectedId = data.rootPage?.id || data.entries?.[0]?.id || null;
    state.tab = "raw";
    state.liveEvents = [];
    state.liveDom = "";
    renderMeta(data);
    renderAll();
    setIframeUrl(data.viewerUrl || "");
    setStatus("Loaded", "good");
  } catch (err) {
    setStatus("Failed", "bad");
    $("#viewer").innerHTML = `<pre>${esc(String(err.message || err))}</pre>`;
    $("#searchResults").innerHTML = '<div class="muted">No results.</div>';
  }
}

function init() {
  $("#form").addEventListener("submit", (e) => {
    e.preventDefault();
    const url = $("#url").value.trim();
    if (!url) {
      setStatus("Enter a URL", "bad");
      return;
    }
    loadTarget(url);
  });

  $("#reset").addEventListener("click", () => {
    state.data = null;
    state.selectedId = null;
    state.tab = "raw";
    state.liveEvents = [];
    state.liveDom = "";
    $("#url").value = "";
    $("#term").value = "";
    $("#depth").value = "2";
    $("#meta").innerHTML = "";
    $("#viewer").innerHTML = '<pre class="muted">Load a page to inspect it.</pre>';
    $("#bundles").innerHTML = "";
    $("#tree").innerHTML = "";
    $("#searchResults").textContent = "No results yet.";
    $("#liveEvents").textContent = "No iframe events yet.";
    $("#liveDom").textContent = "No live snapshot yet.";
    $("#viewerFrame").src = "about:blank";
    setLiveUrl("");
    setStatus("Idle", "");
    renderAll();
  });

  $("#searchBtn").addEventListener("click", renderSearch);
  $("#copyCurrent").addEventListener("click", () => {
    const entry = currentEntry();
    if (entry) copyText(getSource(entry, state.tab));
  });
  $("#copyRaw").addEventListener("click", () => {
    const entry = currentEntry();
    if (entry) copyText(getSource(entry, "raw"));
  });
  $("#copyPretty").addEventListener("click", () => {
    const entry = currentEntry();
    if (entry) copyText(getSource(entry, "pretty"));
  });
  $("#copyTreeText").addEventListener("click", () => {
    const d = state.data;
    copyText(d ? (d.treeText || "") : "No site loaded yet.");
  });
  $("#copyLiveDom").addEventListener("click", () => copyText(state.liveDom || ""));
  $("#clearEvents").addEventListener("click", () => {
    state.liveEvents = [];
    renderLiveEvents();
  });
  $("#refreshSource").addEventListener("click", () => refreshSource("manual"));
  $("#fullscreenBtn").addEventListener("click", requestFullscreen);

  $("#viewerFrame").addEventListener("load", () => {
    const href = resolveCurrentOriginalUrl();
    if (href) setLiveUrl(href);
  });

  window.addEventListener("message", onIframeMessage);
  makeInitialTabs();
  renderAll();
  setStatus("Idle", "");
}

function makeInitialTabs() {
  renderTabs();
}

init();
