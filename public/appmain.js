const state = {
  data: null,
  tab: "raw",
  selectedId: null,
  previewUrl: "",
  previewToken: 0,
  lastEvent: "",
};

const $ = (sel) => document.querySelector(sel);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[m]);

function setStatus(text, kind) {
  const dot = $("#status .dot");
  if (dot) dot.className = "dot" + (kind ? " " + kind : "");
  const el = $("#statusText");
  if (el) el.textContent = text;
}

function summaryCard(label, value) {
  return '<div class="card"><div class="label">' + esc(label) + '</div><div class="value">' + esc(value || "—") + '</div></div>';
}

function detectType(entry) {
  const t = String(entry?.type || "").toLowerCase();
  if (t === "html" || t === "page") return "html";
  if (t === "css") return "css";
  if (t === "js" || t === "javascript") return "js";
  if (["json", "xml", "text", "svg", "txt", "map"].includes(t)) return "text";
  if (entry?.contentType && /json|xml|svg|text|javascript|css/i.test(entry.contentType)) return "text";
  return "other";
}

function formatHtml(source) {
  const s = String(source || "");
  if (!s.trim()) return "";
  const out = [];
  let indent = 0;
  const tokens = s.replace(/\r\n/g, "\n").replace(/>\s+</g, "><").split(/(<[^>]+>)/g).filter(Boolean);
  const inlineTags = new Set(["a","abbr","b","br","code","em","i","img","input","label","small","span","strong","sub","sup","u","time"]);
  for (const token of tokens) {
    if (!token) continue;
    if (!token.startsWith("<")) {
      const text = token.trim();
      if (text) out.push("  ".repeat(Math.max(0, indent)) + text);
      continue;
    }
    const tag = token.match(/^<\/?\s*([a-zA-Z0-9:-]+)/);
    const name = tag ? tag[1].toLowerCase() : "";
    const closing = /^<\//.test(token);
    const selfClose = /\/>$/.test(token) || /^(?:<!|<\?)/.test(token) || ["meta","link","br","hr","img","input","source","area","col","embed","param","track","wbr"].includes(name);
    if (closing) indent = Math.max(0, indent - 1);
    out.push("  ".repeat(Math.max(0, indent)) + token.trim());
    if (!closing && !selfClose && !inlineTags.has(name) && !/^<!doctype/i.test(token)) indent += 1;
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
  const INDENT = "  ";
  const KEYWORDS_ALLOW_REGEX = new Set(["return","case","throw","delete","void","typeof","new","in","instanceof","do","else","await","yield","of"]);
  let out = "";
  let i = 0;
  let indent = 0;
  let state = "code"; // code | lineComment | blockComment | string | regex | template | templateExpr
  let quote = "";
  let escape = false;
  let regexInClass = false;
  let lineStart = true;
  let parenDepth = 0;
  let bracketDepth = 0;
  let lastWord = "";
  let lastSig = "";

  const trimRight = () => { out = out.replace(/[ \t]+$/g, ""); };
  const writeIndentIfNeeded = () => { if (lineStart) { out += INDENT.repeat(Math.max(0, indent)); lineStart = false; } };
  const newline = () => { trimRight(); if (!out.endsWith("\n")) out += "\n"; lineStart = true; };
  const readWord = (from) => {
    let j = from;
    while (j < s.length && /[A-Za-z0-9_$]/.test(s[j])) j++;
    return s.slice(from, j);
  };
  const peekNextWord = (from) => {
    let j = from;
    while (j < s.length && /\s/.test(s[j])) j++;
    return readWord(j);
  };
  const canStartRegex = () => {
    if (!lastSig) return true;
    if ("([{:;,=!?&|+-*%^~<>".includes(lastSig)) return true;
    return KEYWORDS_ALLOW_REGEX.has(lastWord);
  };
  const pushSig = (ch) => { if (!/\s/.test(ch)) lastSig = ch; };

  while (i < s.length) {
    const c = s[i];
    const n = s[i + 1];

    if (state === "lineComment") {
      out += c;
      if (c === "\n") { state = "code"; lineStart = true; }
      i++;
      continue;
    }
    if (state === "blockComment") {
      out += c;
      if (c === "\n") lineStart = true;
      if (c === "*" && n === "/") { out += "/"; i += 2; state = "code"; continue; }
      i++;
      continue;
    }
    if (state === "string") {
      out += c;
      if (escape) escape = false;
      else if (c === "\\") escape = true;
      else if (c === quote) state = "code";
      else if (c === "\n") lineStart = true;
      i++;
      continue;
    }
    if (state === "regex") {
      out += c;
      if (escape) escape = false;
      else if (c === "\\") escape = true;
      else if (c === "[") regexInClass = true;
      else if (c === "]") regexInClass = false;
      else if (c === "/" && !regexInClass) {
        i++;
        while (i < s.length && /[a-z]/i.test(s[i])) { out += s[i]; i++; }
        state = "code";
        lastSig = "/";
        continue;
      }
      if (c === "\n") lineStart = true;
      i++;
      continue;
    }
    if (state === "template") {
      out += c;
      if (escape) { escape = false; i++; continue; }
      if (c === "\\") { escape = true; i++; continue; }
      if (c === "$" && n === "{") {
        out += "{";
        i += 2;
        state = "templateExpr";
        continue;
      }
      if (c === "\n") lineStart = true;
      i++;
      continue;
    }

    const inExpr = state === "templateExpr";

    if (c === "\r") { i++; continue; }
    if (c === "\n") { newline(); i++; continue; }
    if (c === " " || c === "\t" || c === "\f") { if (!lineStart) out += c; i++; continue; }

    if (c === "/" && n === "/") { writeIndentIfNeeded(); out += "//"; i += 2; state = "lineComment"; continue; }
    if (c === "/" && n === "*") { writeIndentIfNeeded(); out += "/*"; i += 2; state = "blockComment"; continue; }

    if (c === '"' || c === "'") { writeIndentIfNeeded(); quote = c; escape = false; state = "string"; out += c; i++; pushSig(c); continue; }
    if (c === "`") { writeIndentIfNeeded(); escape = false; state = "template"; out += c; i++; pushSig(c); continue; }

    if (c === "/" && canStartRegex()) { writeIndentIfNeeded(); state = "regex"; regexInClass = false; escape = false; out += "/"; i++; lastSig = "/"; continue; }

    if (/[A-Za-z_$]/.test(c)) {
      writeIndentIfNeeded();
      const word = readWord(i);
      out += word;
      i += word.length;
      lastWord = word;
      lastSig = word[word.length - 1];
      continue;
    }

    if (c === "{") {
      writeIndentIfNeeded();
      if (!out.endsWith("\n") && out.length && !/\s$/.test(out)) out += " ";
      out += "{";
      indent++;
      out += "\n";
      lineStart = true;
      i++;
      lastSig = "{";
      continue;
    }

    if (c === "}") {
      if (inExpr) {
        if (indent > 0) indent--;
        trimRight();
        if (!lineStart && !out.endsWith("\n")) out += "\n";
        out += INDENT.repeat(Math.max(0, indent)) + "}";
        i++;
        state = "template";
        lineStart = false;
        lastSig = "}";
        continue;
      }
      trimRight();
      if (indent > 0) indent--;
      if (!lineStart && !out.endsWith("\n")) out += "\n";
      out += INDENT.repeat(Math.max(0, indent)) + "}";
      i++;
      const nextWord = peekNextWord(i);
      if (nextWord === "else" || nextWord === "catch" || nextWord === "finally") {
        out += " ";
        lineStart = false;
      } else {
        out += "\n";
        lineStart = true;
      }
      lastSig = "}";
      continue;
    }

    if (c === ";") {
      writeIndentIfNeeded();
      out += ";";
      i++;
      if (parenDepth === 0 && bracketDepth === 0) { out += "\n"; lineStart = true; }
      else { out += " "; lineStart = false; }
      lastSig = ";";
      continue;
    }

    if (c === "(") { writeIndentIfNeeded(); out += c; i++; parenDepth++; lastSig = "("; continue; }
    if (c === ")") { writeIndentIfNeeded(); out += c; i++; parenDepth = Math.max(0, parenDepth - 1); lastSig = ")"; continue; }
    if (c === "[") { writeIndentIfNeeded(); out += c; i++; bracketDepth++; lastSig = "["; continue; }
    if (c === "]") { writeIndentIfNeeded(); out += c; i++; bracketDepth = Math.max(0, bracketDepth - 1); lastSig = "]"; continue; }

    writeIndentIfNeeded();
    out += c;
    i++;
    pushSig(c);
  }

  return out.replace(/\n{3,}/g, "\n\n").replace(/[ \t]+\n/g, "\n").trim();
}

function currentEntry() {
  const d = state.data;
  if (!d) return null;
  if (!state.selectedId) return d.rootPage || d.entries?.[0] || null;
  return (d.entries || []).find((x) => x.id === state.selectedId) || d.rootPage || d.entries?.[0] || null;
}

function getSource(entry, mode) {
  if (!entry) return "";
  const raw = String(entry.content || "");
  const type = detectType(entry);
  if (mode === "raw") return raw;
  if (mode === "pretty") {
    if (type === "html") return formatHtml(raw);
    if (type === "css") return formatCss(raw);
    if (type === "js") return formatJs(raw);
    return raw;
  }
  if (mode === "html") return type === "html" ? raw : "";
  if (mode === "css") return type === "css" ? raw : "";
  if (mode === "js") return type === "js" ? raw : "";
  if (mode === "text") return entry.textContent || raw;
  if (mode === "tree") return JSON.stringify(state.data?.tree || {}, null, 2);
  return raw;
}

function makeTabs() {
  const items = [
    ["raw", "Raw"],
    ["pretty", "Pretty"],
    ["html", "HTML"],
    ["css", "CSS"],
    ["js", "JS"],
    ["text", "Text"],
    ["tree", "Tree JSON"],
  ];
  $("#tabs").innerHTML = items
    .map(([id, label]) => '<div class="tab' + (state.tab === id ? " active" : "") + '" data-tab="' + id + '">' + label + "</div>")
    .join("");
  document.querySelectorAll(".tab").forEach((el) => {
    el.addEventListener("click", () => {
      state.tab = el.dataset.tab;
      makeTabs();
      renderViewer();
    });
  });
}

function renderViewer() {
  const entry = currentEntry();
  if (!state.data || !entry) {
    $("#viewer").innerHTML = '<pre class="muted">Paste a URL and inspect it.</pre>';
    return;
  }
  const source = getSource(entry, state.tab);
  $("#viewer").innerHTML = '<pre>' + esc(source || "No data for this section.") + "</pre>";
}

function renderMeta(d) {
  $("#meta").innerHTML = [
    summaryCard("Root", d.rootUrl),
    summaryCard("Final URL", d.finalUrl),
    summaryCard("Pages", String(d.stats?.pages || 0)),
    summaryCard("Assets", String(d.stats?.assets || 0)),
    summaryCard("Text files", String(d.stats?.textFiles || 0)),
  ].join("");
  $("#resourceCount").textContent = (d.entries || []).length + " collected";
}

function treeRows(entries) {
  return (entries || [])
    .map((e) => {
      const type = detectType(e);
      const active = e.id === state.selectedId;
      const rowStyle = active ? ' style="outline:1px solid rgba(123,163,255,.5)"' : "";
      return ""
        + '<div class="tree-item" data-id="' + esc(e.id) + '"' + rowStyle + ">"
        + '<div class="tree-left">'
        + '<div class="path">' + esc(e.path || e.url || "") + "</div>"
        + '<div class="small">'
        + esc(e.method || "GET") + " · "
        + esc(type) + " · "
        + esc(String(e.status || "")) + " · "
        + esc(String(e.size || 0)) + " bytes"
        + "</div>"
        + "</div>"
        + '<div class="resource-btns">'
        + '<span class="pill">' + esc(e.kind || "resource") + "</span>"
        + '<button type="button" class="secondary copy-one" data-copy="' + esc(e.id) + '">Copy</button>'
        + "</div>"
        + "</div>";
    })
    .join("");
}

function renderTree() {
  const d = state.data;
  if (!d) {
    $("#tree").innerHTML = '<div class="muted">No site loaded yet.</div>';
    return;
  }
  $("#tree").innerHTML = treeRows(d.entries || []);
  document.querySelectorAll(".tree-item").forEach((el) => {
    el.addEventListener("click", (ev) => {
      if (ev.target && ev.target.classList.contains("copy-one")) return;
      state.selectedId = el.dataset.id;
      renderTree();
      renderViewer();
    });
  });
  document.querySelectorAll("#tree .copy-one").forEach((btn) => {
    btn.addEventListener("click", async (ev) => {
      ev.stopPropagation();
      const id = btn.dataset.copy;
      const e = (state.data?.entries || []).find((x) => x.id === id);
      if (e) await copyText(e.content || "");
    });
  });
}

function renderResources() {
  const d = state.data;
  if (!d) {
    $("#resources").innerHTML = '<div class="muted">No resources yet.</div>';
    return;
  }

  const groups = { html: [], css: [], js: [], text: [], other: [] };
  for (const r of d.entries || []) {
    groups[detectType(r)]?.push(r) ?? groups.other.push(r);
  }

  const order = [
    ["html", "HTML"],
    ["css", "CSS"],
    ["js", "JS"],
    ["text", "Text"],
    ["other", "Other"],
  ];

  $("#resources").innerHTML = order
    .map(([key, label]) => {
      const items = groups[key] || [];
      if (!items.length) return "";
      return ""
        + '<div class="item">'
        + '<div class="item-title">' + esc(label) + ' (' + esc(String(items.length)) + ')</div>'
        + '<div class="list" style="max-height:none;overflow:visible;margin-top:10px">'
        + items.map((r) => ""
            + '<div class="item">'
            + '<div class="item-top">'
            + '<div style="min-width:0;flex:1">'
            + '<div class="item-title">' + esc(r.kind || "resource") + ' · ' + esc(r.type || detectType(r)) + '</div>'
            + '<div class="item-url">' + esc(r.url) + '</div>'
            + '<div class="muted" style="margin-top:6px">'
            + esc(String(r.status || "")) + ' · '
            + esc(String(r.size || 0)) + ' bytes · depth '
            + esc(String(r.depth ?? 0))
            + '</div>'
            + '</div>'
            + '<div class="resource-btns">'
            + '<button type="button" class="secondary" data-open="' + esc(r.id) + '">Open</button>'
            + '<button type="button" class="secondary" data-copy="' + esc(r.id) + '">Copy</button>'
            + '</div>'
            + '</div>'
            + '</div>')
          .join("")
        + '</div>'
        + '</div>';
    })
    .join("");

  document.querySelectorAll("#resources [data-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedId = btn.dataset.open;
      renderTree();
      renderViewer();
    });
  });

  document.querySelectorAll("#resources [data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const e = (state.data?.entries || []).find((x) => x.id === btn.dataset.copy);
      if (e) await copyText(e.content || "");
    });
  });
}

function escRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function snippet(text, term) {
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return "";
  const start = Math.max(0, idx - 160);
  const end = Math.min(text.length, idx + term.length + 220);
  return esc(text.slice(start, end)).replace(new RegExp(escRegex(term), "ig"), "<mark>$&</mark>");
}

function runSearch() {
  const d = state.data;
  const term = $("#term").value.trim();
  if (!d || !term) {
    $("#searchResults").textContent = d ? "Type a search term." : "No results yet.";
    return;
  }

  const hits = [];
  for (const e of d.entries || []) {
    const content = String(e.content || "");
    if (content.toLowerCase().includes(term.toLowerCase())) {
      hits.push({
        kind: e.kind,
        url: e.url,
        label: e.path || e.url,
        snippet: snippet(content, term),
      });
    }
  }

  if (!hits.length) {
    $("#searchResults").innerHTML = '<div class="muted">No matches found.</div>';
    return;
  }

  $("#searchResults").innerHTML = hits.slice(0, 40).map((h) => ""
    + '<div class="search-hit">'
    + '<div class="search-src"><strong>' + esc(h.kind || "resource") + '</strong> · ' + esc(h.label) + '</div>'
    + '<div>' + (h.snippet || "Match found.") + '</div>'
    + '</div>').join("");
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(String(text || ""));
    setStatus("Copied", "good");
    setTimeout(() => setStatus("Loaded", "good"), 1000);
  } catch {
    alert("Copy failed");
  }
}

function attrEscape(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function buildPreviewDoc(rawHtml, baseUrl) {
  const html = String(rawHtml || "");
  const base = '<base href="' + attrEscape(baseUrl || "about:blank") + '">';
  const bridge = `
<script>
(() => {
  const send = (type, detail = {}) => parent.postMessage({ __d3v_live__: true, type, detail, url: location.href, title: document.title }, "*");
  const wrap = (fn, type) => function(...args) {
    const result = fn.apply(this, args);
    send(type, { url: location.href });
    return result;
  };

  const anchors = () => Array.from(document.querySelectorAll("a[href], form[action]"));

  document.addEventListener("click", (ev) => {
    const a = ev.target.closest && ev.target.closest("a[href]");
    const form = ev.target.closest && ev.target.closest("form");
    const target = ev.target.closest && ev.target.closest("[data-href],[data-url]");
    let nav = "";
    if (a && a.href && a.target !== "_blank") nav = a.href;
    else if (target) nav = target.getAttribute("data-href") || target.getAttribute("data-url") || "";
    if (a) {
      send("click", {
        tag: a.tagName,
        text: (a.innerText || a.textContent || "").slice(0, 180),
        href: a.href
      });
      if (nav) {
        ev.preventDefault();
        send("navigate", { url: nav, reason: "click" });
      }
    } else if (form) {
      const action = form.action || location.href;
      send("submit", {
        action,
        method: (form.method || "get").toUpperCase()
      });
      ev.preventDefault();
      send("navigate", { url: action, reason: "submit" });
    } else if (target && nav) {
      ev.preventDefault();
      send("navigate", { url: nav, reason: "data-href" });
    }
  }, true);

  const push = history.pushState;
  const replace = history.replaceState;
  history.pushState = wrap(push, "navigate");
  history.replaceState = wrap(replace, "navigate");

  addEventListener("hashchange", () => send("navigate", { url: location.href, reason: "hashchange" }));
  addEventListener("popstate", () => send("navigate", { url: location.href, reason: "popstate" }));
  addEventListener("load", () => send("load", { url: location.href }));
  new MutationObserver(() => send("mutate", { url: location.href })).observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true
  });

  send("ready", { url: location.href, title: document.title, links: anchors().length });
})();
</script>`;

  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, "<head$1>" + base + bridge);
  }

  if (/<html[^>]*>/i.test(html)) {
    return html.replace(/<html([^>]*)>/i, "<html$1><head>" + base + bridge + "</head>");
  }

  return "<!doctype html><html><head>" + base + bridge + "</head><body>" + html + "</body></html>";
}

function setPreviewNote(text) {
  const el = $("#previewNote");
  if (el) el.textContent = text;
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function loadPreview(url, opts = {}) {
  const previewFrame = $("#previewFrame");
  if (!previewFrame) return;

  const target = String(url || "").trim();
  if (!target) return;

  const token = ++state.previewToken;
  state.previewUrl = target;
  $("#url").value = target;

  if (!opts.silent) setStatus("Fetching live snapshot…", "");
  setPreviewNote("Loading snapshot for " + target + " …");

  try {
    const [analysis, raw] = await Promise.all([
      fetchJson("/api/analyze?url=" + encodeURIComponent(target) + "&depth=" + encodeURIComponent($("#depth").value || "2") + "&q=" + encodeURIComponent($("#term").value.trim())),
      fetchJson("/api/raw?url=" + encodeURIComponent(target)),
    ]);

    if (token !== state.previewToken) return;

    state.data = analysis;
    state.selectedId = analysis.rootPage?.id || analysis.entries?.[0]?.id || null;
    state.tab = "raw";

    renderMeta(analysis);
    makeTabs();
    renderTree();
    renderResources();
    renderViewer();
    runSearch();

    const doc = buildPreviewDoc(raw.content || "", raw.finalUrl || target);
    previewFrame.srcdoc = doc;

    setStatus("Loaded", "good");
    setPreviewNote("Preview ready. Clicks and in-frame navigation are tracked, then re-snapshotted here.");
  } catch (err) {
    if (token !== state.previewToken) return;
    setStatus("Failed", "bad");
    setPreviewNote(String(err?.message || err));
    $("#viewer").innerHTML = '<pre>' + esc(String(err?.message || err)) + '</pre>';
  }
}

function makeFullscreen() {
  const shell = $("#previewShell");
  if (!shell) return;
  const isFull = shell.classList.toggle("is-fullscreen");
  if (isFull && shell.requestFullscreen) {
    shell.requestFullscreen().catch(() => {});
  } else if (!isFull && document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

function bindPreviewMessageBridge() {
  window.addEventListener("message", async (ev) => {
    const msg = ev.data && ev.data.__d3v_live__;
    if (!msg) return;

    state.lastEvent = msg.type + " @ " + (msg.url || "");
    if (msg.type === "ready") {
      setPreviewNote("Preview ready at " + (msg.url || state.previewUrl) + ".");
      return;
    }
    if (msg.type === "click") {
      const href = msg.detail?.href || msg.detail?.url || "";
      setPreviewNote("Click detected: " + (msg.detail?.text || msg.detail?.tag || "element") + (href ? " → " + href : ""));
      return;
    }
    if (msg.type === "mutate") {
      setPreviewNote("DOM changed inside preview. Awaiting navigation or user action.");
      return;
    }
    if (msg.type === "navigate") {
      const next = msg.detail?.url || msg.url || "";
      if (!next || next === state.previewUrl) return;
      await loadPreview(next, { silent: false });
    }
  });
}

function bindUI() {
  $("#copyCurrent").addEventListener("click", () => {
    const e = currentEntry();
    if (e) copyText(getSource(e, state.tab));
  });
  $("#copyRaw").addEventListener("click", () => {
    const e = currentEntry();
    if (e) copyText(getSource(e, "raw"));
  });
  $("#copyPretty").addEventListener("click", () => {
    const e = currentEntry();
    if (e) copyText(getSource(e, "pretty"));
  });
  $("#searchBtn").addEventListener("click", runSearch);
  $("#previewFullscreen").addEventListener("click", makeFullscreen);
  $("#previewReload").addEventListener("click", () => {
    if (state.previewUrl) loadPreview(state.previewUrl);
  });

  $("#reset").addEventListener("click", () => {
    state.data = null;
    state.tab = "raw";
    state.selectedId = null;
    state.previewUrl = "";
    state.previewToken++;
    $("#url").value = "";
    $("#term").value = "";
    $("#depth").value = "2";
    $("#meta").innerHTML = "";
    $("#tree").innerHTML = "";
    $("#resources").innerHTML = "";
    $("#searchResults").textContent = "No results yet.";
    $("#viewer").innerHTML = '<pre class="muted">Paste a URL and inspect it.</pre>';
    $("#previewFrame").srcdoc = "";
    setPreviewNote("Start the engine to load a live snapshot here.");
    setStatus("Idle", "");
    makeTabs();
  });

  $("#form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = $("#url").value.trim();
    if (!url) {
      setStatus("Enter a URL", "bad");
      return;
    }
    await loadPreview(url);
  });
}

bindPreviewMessageBridge();
bindUI();
makeTabs();
renderViewer();
setStatus("Idle", "");
