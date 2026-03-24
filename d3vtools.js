const CONFIG = {
  MAX_PAGES: 40,
  MAX_ASSETS: 160,
  MAX_DEPTH: 4,
  MAX_TEXT_PER_FILE: 250000,
  MAX_HTML: 300000,
  MAX_CSS: 220000,
  MAX_JS: 220000,
  MAX_SEARCH_RESULTS: 80,
  REQUEST_TIMEOUT_MS: 15000,
  USER_AGENT: "Mozilla/5.0 (compatible; SiteStructureInspector/2.0)",
};

const UI_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Site Structure Inspector</title>
  <style>
    :root{
      --bg:#08101f;
      --panel:#101a31;
      --panel2:#0d1528;
      --line:rgba(255,255,255,.08);
      --text:#e8edff;
      --muted:#9ba8d4;
      --accent:#7ba3ff;
      --good:#6ee7b7;
      --warn:#fbbf24;
      --bad:#fb7185;
      --shadow:0 20px 60px rgba(0,0,0,.34);
      --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      --sans: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      --r:18px;
    }
    *{box-sizing:border-box}
    body{
      margin:0;
      font-family:var(--sans);
      color:var(--text);
      background:
        radial-gradient(1000px 700px at 10% 0%, rgba(123,163,255,.18), transparent 45%),
        radial-gradient(900px 700px at 90% 15%, rgba(110,231,183,.08), transparent 45%),
        var(--bg);
    }
    .wrap{max-width:1600px;margin:0 auto;padding:20px}
    .hero{
      border:1px solid var(--line);
      background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
      border-radius:28px;
      padding:20px;
      box-shadow:var(--shadow);
      backdrop-filter: blur(10px);
    }
    h1{margin:0 0 8px;font-size:clamp(28px,4vw,44px);letter-spacing:-.03em}
    .sub{margin:0;color:var(--muted);line-height:1.6}
    .toolbar{
      display:grid;
      grid-template-columns: 1.5fr .5fr .5fr .4fr .4fr;
      gap:10px;
      margin-top:16px;
    }
    @media (max-width: 1100px){ .toolbar{grid-template-columns:1fr 1fr} }
    @media (max-width: 620px){ .toolbar{grid-template-columns:1fr} }

    input, select, button, textarea{
      width:100%;
      border:1px solid var(--line);
      background:rgba(8,14,27,.75);
      color:var(--text);
      border-radius:14px;
      padding:13px 14px;
      font:inherit;
      outline:none;
    }
    button{
      cursor:pointer;
      font-weight:800;
      border:none;
      background:linear-gradient(135deg, rgba(123,163,255,.96), rgba(110,231,183,.90));
      color:#06101d;
    }
    button.secondary{
      background:rgba(255,255,255,.06);
      border:1px solid var(--line);
      color:var(--text);
      font-weight:700;
    }

    .meta{
      display:grid;
      grid-template-columns: repeat(5, minmax(0,1fr));
      gap:12px;
      margin-top:16px;
    }
    @media (max-width: 1120px){ .meta{grid-template-columns:repeat(3,minmax(0,1fr))} }
    @media (max-width: 720px){ .meta{grid-template-columns:repeat(2,minmax(0,1fr))} }
    @media (max-width: 520px){ .meta{grid-template-columns:1fr} }

    .card{
      background:rgba(16,26,49,.86);
      border:1px solid var(--line);
      border-radius:var(--r);
      box-shadow:var(--shadow);
      padding:16px;
    }
    .label{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted)}
    .value{margin-top:7px;word-break:break-word}

    .grid{
      display:grid;
      grid-template-columns: .9fr 1.1fr;
      gap:14px;
      margin-top:16px;
      align-items:start;
    }
    @media (max-width: 1180px){ .grid{grid-template-columns:1fr} }

    .grid2{
      display:grid;
      grid-template-columns: 1fr 1fr;
      gap:14px;
      margin-top:14px;
    }
    @media (max-width: 1180px){ .grid2{grid-template-columns:1fr} }

    .section{
      display:flex;align-items:center;justify-content:space-between;gap:10px;
      margin-bottom:12px;
    }
    .section h2{margin:0;font-size:18px}
    .status{
      display:inline-flex;align-items:center;gap:8px;
      padding:8px 12px;border-radius:999px;
      background:rgba(255,255,255,.06);
      border:1px solid var(--line);
      font-size:13px;
    }
    .dot{width:10px;height:10px;border-radius:50%;background:var(--warn)}
    .dot.good{background:var(--good)}
    .dot.bad{background:var(--bad)}

    .tabs{
      display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;
    }
    .tab{
      padding:10px 14px;
      border-radius:999px;
      background:rgba(255,255,255,.05);
      border:1px solid var(--line);
      cursor:pointer;
      user-select:none;
      font-size:14px;
    }
    .tab.active{
      background:rgba(123,163,255,.18);
      border-color:rgba(123,163,255,.45);
    }

    .panel{
      background:rgba(7,12,24,.78);
      border:1px solid var(--line);
      border-radius:18px;
      overflow:hidden;
    }
    .panel pre, .panel .text{
      margin:0;
      padding:16px;
      max-height:72vh;
      overflow:auto;
      white-space:pre-wrap;
      word-break:break-word;
      overflow-wrap:anywhere;
      font-size:13px;
      line-height:1.6;
      font-family:var(--mono);
    }
    .panel .text{font-family:var(--sans)}
    mark{
      background:rgba(251,191,36,.33);
      color:inherit;
      padding:0 2px;
      border-radius:3px;
    }

    .tree{
      display:grid;
      gap:8px;
      max-height:72vh;
      overflow:auto;
      padding:2px;
    }
    .tree-item{
      border:1px solid var(--line);
      background:rgba(255,255,255,.03);
      border-radius:14px;
      padding:10px 12px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
    }
    .tree-left{min-width:0}
    .path{
      font-family:var(--mono);
      font-size:12px;
      color:#cbd5ff;
      word-break:break-all;
    }
    .small{
      color:var(--muted);
      font-size:12px;
      margin-top:4px;
    }
    .pill{
      display:inline-block;
      padding:5px 9px;
      border-radius:999px;
      background:rgba(255,255,255,.06);
      border:1px solid var(--line);
      font-size:12px;
      white-space:nowrap;
    }
    .resource-btns{display:flex;gap:8px;flex-wrap:wrap}
    .resource-btns button{padding:9px 12px;font-size:12px;width:auto}

    .list{
      display:grid;
      gap:10px;
      max-height:72vh;
      overflow:auto;
    }
    .item{
      border:1px solid var(--line);
      background:rgba(255,255,255,.03);
      border-radius:14px;
      padding:12px;
    }
    .item-top{
      display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;
    }
    .item-title{
      font-weight:800;
      margin-bottom:4px;
    }
    .item-url{
      font-family:var(--mono);
      font-size:12px;
      color:#cbd5ff;
      word-break:break-all;
    }
    .muted{color:var(--muted)}
    .footer{
      margin-top:16px;
      color:var(--muted);
      font-size:13px;
      line-height:1.6;
    }

    .search-hit{
      padding:10px 12px;
      border-radius:14px;
      border:1px solid var(--line);
      background:rgba(255,255,255,.03);
      margin-bottom:10px;
    }
    .search-src{
      color:var(--muted);
      font-size:12px;
      margin-bottom:6px;
      word-break:break-word;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hero">
      <h1>Site Structure Inspector</h1>
      <p class="sub">Paste a URL. The worker crawls the same site, collects linked HTML/CSS/JS and text assets, formats them for reading, and lets you copy the exact source.</p>

      <form id="form" class="toolbar">
        <input id="url" type="url" placeholder="https://example.com" autocomplete="off" spellcheck="false" />
        <input id="term" type="text" placeholder="Search across collected source" autocomplete="off" spellcheck="false" />
        <select id="depth">
          <option value="1">Depth 1</option>
          <option value="2" selected>Depth 2</option>
          <option value="3">Depth 3</option>
          <option value="4">Depth 4</option>
        </select>
        <button type="submit">Inspect</button>
        <button type="button" class="secondary" id="reset">Reset</button>
      </form>

      <div class="meta" id="meta"></div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="section">
          <h2>Site tree</h2>
          <span class="status" id="status"><span class="dot"></span><span id="statusText">Idle</span></span>
        </div>
        <div class="tree" id="tree"></div>
      </div>

      <div class="card">
        <div class="section">
          <h2>Source viewer</h2>
          <div class="resource-btns">
            <button type="button" class="secondary" id="copyCurrent">Copy current</button>
            <button type="button" class="secondary" id="copyRaw">Copy raw</button>
            <button type="button" class="secondary" id="copyPretty">Copy pretty</button>
          </div>
        </div>

        <div class="tabs" id="tabs"></div>
        <div class="panel" id="viewer"><pre class="muted">Paste a link and inspect it.</pre></div>

        <div class="grid2">
          <div class="card" style="margin-top:14px;">
            <div class="section">
              <h2>Search matches</h2>
              <button type="button" class="secondary" id="searchBtn" style="width:auto;padding:10px 14px;">Search</button>
            </div>
            <div class="panel"><div class="text" id="searchResults">No results yet.</div></div>
          </div>

          <div class="card" style="margin-top:14px;">
            <div class="section">
              <h2>Resources</h2>
              <span class="muted" id="resourceCount"></span>
            </div>
            <div class="list" id="resources"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      This crawls discoverable same-origin resources only. It will not reveal private server files, login-protected routes, or assets never linked from the site. For SPAs, the output is source-level inspection, not a live DOM snapshot.
    </div>
  </div>

  <script>
    const state = {
      data: null,
      tab: "raw",
      selectedId: null,
    };

    const $ = (s) => document.querySelector(s);
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
      dot.className = "dot" + (kind ? " " + kind : "");
      $("#statusText").textContent = text;
    }

    function summaryCard(label, value) {
      return '<div class="card"><div class="label">' + esc(label) + '</div><div class="value">' + esc(value || "—") + '</div></div>';
    }

    function makeTabs() {
      const items = [
        ["raw", "Raw"],
        ["pretty", "Pretty"],
        ["html", "HTML"],
        ["css", "CSS"],
        ["js", "JS"],
        ["text", "Text"],
        ["tree", "Tree JSON"]
      ];
      $("#tabs").innerHTML = items.map(([id, label]) => '<div class="tab' + (state.tab === id ? " active" : "") + '" data-tab="' + id + '">' + label + '</div>').join("");
      document.querySelectorAll(".tab").forEach((el) => {
        el.addEventListener("click", () => {
          state.tab = el.dataset.tab;
          makeTabs();
          renderViewer();
        });
      });
    }

    function formatHtml(source) {
      const s = String(source || "");
      if (!s.trim()) return "";
      const out = [];
      let indent = 0;
      const tokens = s
        .replace(/\r\n/g, "\n")
        .replace(/>\s+</g, "><")
        .split(/(<[^>]+>)/g)
        .filter(Boolean);

      const inlineTags = new Set(["a","abbr","b","br","code","em","i","img","input","label","small","span","strong","sub","sup","u","time"]);
      for (let token of tokens) {
        if (!token) continue;
        if (!token.startsWith("<")) {
          const text = token.trim();
          if (text) out.push("  ".repeat(Math.max(0, indent)) + text);
          continue;
        }

        const tag = token.match(/^<\/?\s*([a-zA-Z0-9:-]+)/);
        const name = tag ? tag[1].toLowerCase() : "";
        const closing = /^<\//.test(token);
        const selfClose = /\/>$/.test(token) || /^(?:<\!|<\?)/.test(token) || ["meta","link","br","hr","img","input","source","area","col","embed","param","track","wbr"].includes(name);

        if (closing) indent = Math.max(0, indent - 1);
        const line = "  ".repeat(Math.max(0, indent)) + token.trim();
        out.push(line);

        if (!closing && !selfClose && !inlineTags.has(name) && !/^<!doctype/i.test(token)) {
          indent += 1;
        }
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
        .replace(/\/\*/g, "\n/*")
        .replace(/\n\s*\n+/g, "\n")
        .replace(/\n\s+\}/g, "\n}")
        .trim();
    }

 function formatJs(source) {
  const s = String(source ?? "");
  if (!s.trim()) return "";

  const INDENT = "  ";
  const KEYWORDS_ALLOW_REGEX = new Set([
    "return",
    "case",
    "throw",
    "delete",
    "void",
    "typeof",
    "new",
    "in",
    "instanceof",
    "do",
    "else",
    "await",
    "yield",
    "of",
  ]);

  let out = "";
  let i = 0;
  let indent = 0;

  let state = "code"; // code | lineComment | blockComment | string | regex | template
  let quote = "";
  let escape = false;

  let regexInClass = false;
  let lineStart = true;

  let parenDepth = 0;
  let bracketDepth = 0;

  let lastWord = "";
  let lastSig = "";

  function trimRight() {
    out = out.replace(/[ \t]+$/g, "");
  }

  function writeIndentIfNeeded() {
    if (lineStart) {
      out += INDENT.repeat(Math.max(0, indent));
      lineStart = false;
    }
  }

  function newline() {
    trimRight();
    if (!out.endsWith("\n")) out += "\n";
    lineStart = true;
  }

  function readWord(from) {
    let j = from;
    while (j < s.length && /[A-Za-z0-9_$]/.test(s[j])) j++;
    return s.slice(from, j);
  }

  function peekNextWord(from) {
    let j = from;
    while (j < s.length && /\s/.test(s[j])) j++;
    return readWord(j);
  }

  function canStartRegex() {
    if (!lastSig) return true;
    if ("([{:;,=!?&|+-*%^~<>".includes(lastSig)) return true;
    return KEYWORDS_ALLOW_REGEX.has(lastWord);
  }

  function pushSig(ch) {
    if (!/\s/.test(ch)) lastSig = ch;
  }

  while (i < s.length) {
    const c = s[i];
    const n = s[i + 1];

    // --- COMMENT / STRING / REGEX / TEMPLATE STATES ---
    if (state === "lineComment") {
      out += c;
      if (c === "\n") {
        state = "code";
        lineStart = true;
      }
      i++;
      continue;
    }

    if (state === "blockComment") {
      out += c;
      if (c === "\n") {
        lineStart = true;
      }
      if (c === "*" && n === "/") {
        out += "/";
        i += 2;
        state = "code";
        continue;
      }
      i++;
      continue;
    }

    if (state === "string") {
      out += c;
      if (escape) {
        escape = false;
      } else if (c === "\\") {
        escape = true;
      } else if (c === quote) {
        state = "code";
      } else if (c === "\n") {
        // Preserve broken/multiline strings exactly as written.
        lineStart = true;
      }
      i++;
      continue;
    }

    if (state === "regex") {
      out += c;

      if (escape) {
        escape = false;
      } else if (c === "\\") {
        escape = true;
      } else if (c === "[") {
        regexInClass = true;
      } else if (c === "]") {
        regexInClass = false;
      } else if (c === "/" && !regexInClass) {
        // consume flags
        i++;
        while (i < s.length && /[a-z]/i.test(s[i])) {
          out += s[i];
          i++;
        }
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

      if (escape) {
        escape = false;
        i++;
        continue;
      }

      if (c === "\\") {
        escape = true;
        i++;
        continue;
      }

      if (c === "$" && n === "{") {
        out += "{";
        i += 2;
        state = "templateExpr";
        // Keep the expression indentation in normal code mode.
        continue;
      }

      if (c === "\n") lineStart = true;
      i++;
      continue;
    }

      const inExpr = state === "templateExpr";

    if (c === "\r") {
      i++;
      continue;
    }

    if (c === "\n") {
      newline();
      i++;
      continue;
    }

    if (c === " " || c === "\t" || c === "\f") {
    if (!lineStart) out += c;
      i++;
      continue;
    }

 if (c === "/" && n === "/") {
      writeIndentIfNeeded();
      out += "//";
      i += 2;
      state = "lineComment";
      continue;
    }

    if (c === "/" && n === "*") {
      writeIndentIfNeeded();
      out += "/*";
      i += 2;
      state = "blockComment";
      continue;
    }

    if (c === '"' || c === "'" ) {
      writeIndentIfNeeded();
      quote = c;
      escape = false;
      state = "string";
      out += c;
      i++;
      pushSig(c);
      continue;
    }

    if (c === "`") {
      writeIndentIfNeeded();
      escape = false;
      state = "template";
      out += c;
      i++;
      pushSig(c);
      continue;
    }

    if (c === "/" && canStartRegex()) {
      writeIndentIfNeeded();
      state = "regex";
      regexInClass = false;
      escape = false;
      out += "/";
      i++;
      lastSig = "/";
      continue;
    }

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
      if (!out.endsWith("\n") && out.length && !/\s$/.test(out)) {
        out += " ";
      }
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

        // If the line already has code, move the brace to a fresh line.
        if (!lineStart && !out.endsWith("\n")) out += "\n";

        out += INDENT.repeat(Math.max(0, indent)) + "}";
        i++;

        // End of template expression.
        const nextWord = peekNextWord(i);
        state = "template";

        // Do not force a newline here; template text continues immediately.
        lineStart = false;
        lastSig = "}";
        if (nextWord) lastWord = nextWord;
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

    // Semicolon: keep syntax-safe, but do not break for-loop headers.
    if (c === ";") {
      writeIndentIfNeeded();
      out += ";";
      i++;

      if (parenDepth === 0 && bracketDepth === 0) {
        out += "\n";
        lineStart = true;
      } else {
        out += " ";
        lineStart = false;
      }

      lastSig = ";";
      continue;
    }

    // Parentheses / brackets tracking
    if (c === "(") {
      writeIndentIfNeeded();
      out += c;
      i++;
      parenDepth++;
      lastSig = "(";
      continue;
    }

    if (c === ")") {
      writeIndentIfNeeded();
      out += c;
      i++;
      parenDepth = Math.max(0, parenDepth - 1);
      lastSig = ")";
      continue;
    }

    if (c === "[") {
      writeIndentIfNeeded();
      out += c;
      i++;
      bracketDepth++;
      lastSig = "[";
      continue;
    }

    if (c === "]") {
      writeIndentIfNeeded();
      out += c;
      i++;
      bracketDepth = Math.max(0, bracketDepth - 1);
      lastSig = "]";
      continue;
    }

    // Default: any other character/token
    writeIndentIfNeeded();
    out += c;
    i++;
    pushSig(c);
  }

  return out
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

    function detectType(entry) {
      const t = (entry.type || "").toLowerCase();
      if (t === "html" || t === "page") return "html";
      if (t === "css") return "css";
      if (t === "js" || t === "javascript") return "js";
      if (["json","xml","text","svg","txt","map"].includes(t)) return "text";
      if (entry.contentType && /json|xml|svg|text|javascript|css/i.test(entry.contentType)) return "text";
      return "other";
    }

    function currentEntry() {
      const d = state.data;
      if (!d) return null;
      if (!state.selectedId) return d.rootPage || d.entries?.[0] || null;
      return (d.entries || []).find(x => x.id === state.selectedId) || d.rootPage || d.entries?.[0] || null;
    }

    function getSource(entry, mode) {
      if (!entry) return "";
      const raw = String(entry.content || "");
      if (mode === "raw") return raw;
      const type = detectType(entry);
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

    function renderViewer() {
      const entry = currentEntry();
      if (!state.data || !entry) {
        $("#viewer").innerHTML = '<pre class="muted">Paste a URL and inspect it.</pre>';
        return;
      }

      const source = getSource(entry, state.tab);
      $("#viewer").innerHTML = '<pre>' + esc(source || "No data for this section.") + '</pre>';
    }

    function renderMeta(d) {
      $("#meta").innerHTML = [
        summaryCard("Root", d.rootUrl),
        summaryCard("Final URL", d.finalUrl),
        summaryCard("Pages", String(d.stats?.pages || 0)),
        summaryCard("Assets", String(d.stats?.assets || 0)),
        summaryCard("Text files", String(d.stats?.textFiles || 0))
      ].join("");
      $("#resourceCount").textContent = (d.entries || []).length + " collected";
    }

    function treeRows(entries) {
      return (entries || []).map((e) => {
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
      }).join("");
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
      document.querySelectorAll(".copy-one").forEach((btn) => {
        btn.addEventListener("click", async (ev) => {
          ev.stopPropagation();
          const id = btn.dataset.copy;
          const e = (state.data?.entries || []).find(x => x.id === id);
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

      $("#resources").innerHTML = (d.entries || []).slice(0, 400).map((r) => {
        return ""
          + '<div class="item">'
          + '<div class="item-top">'
          + '<div style="min-width:0;flex:1">'
          + '<div class="item-title">' + esc(r.kind || "resource") + " · " + esc(r.type || detectType(r)) + "</div>"
          + '<div class="item-url">' + esc(r.url) + "</div>"
          + '<div class="muted" style="margin-top:6px">'
          + esc(String(r.status || "")) + " · "
          + esc(String(r.size || 0)) + " bytes · depth "
          + esc(String(r.depth ?? 0))
          + "</div>"
          + "</div>"
          + '<div class="resource-btns">'
          + '<button type="button" class="secondary" data-open="' + esc(r.id) + '">Open</button>'
          + '<button type="button" class="secondary" data-copy="' + esc(r.id) + '">Copy</button>'
          + "</div>"
          + "</div>"
          + "</div>";
      }).join("");

      document.querySelectorAll("[data-open]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.selectedId = btn.dataset.open;
          renderTree();
          renderViewer();
        });
      });

      document.querySelectorAll("[data-copy]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const e = (state.data?.entries || []).find(x => x.id === btn.dataset.copy);
          if (e) await copyText(e.content || "");
        });
      });
    }

    function escRegex(s) {
      return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
      for (const e of (d.entries || [])) {
        const content = String(e.content || "");
        if (content.toLowerCase().includes(term.toLowerCase())) {
          hits.push({
            kind: e.kind,
            url: e.url,
            label: e.path || e.url,
            snippet: snippet(content, term)
          });
        }
      }

      if (!hits.length) {
        $("#searchResults").innerHTML = '<div class="muted">No matches found.</div>';
        return;
      }

      $("#searchResults").innerHTML = hits.slice(0, 40).map((h) => {
        return ""
          + '<div class="search-hit">'
          + '<div class="search-src"><strong>' + esc(h.kind || "resource") + "</strong> · " + esc(h.label) + "</div>"
          + "<div>" + (h.snippet || "Match found.") + "</div>"
          + "</div>";
      }).join("");
    }

    async function copyText(text) {
      try {
        await navigator.clipboard.writeText(String(text || ""));
        setStatus("Copied", "good");
        setTimeout(() => setStatus("Loaded", "good"), 1000);
      } catch (e) {
        alert("Copy failed");
      }
    }

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

    $("#reset").addEventListener("click", () => {
      state.data = null;
      state.tab = "raw";
      state.selectedId = null;
      $("#url").value = "";
      $("#term").value = "";
      $("#depth").value = "2";
      $("#meta").innerHTML = "";
      $("#tree").innerHTML = "";
      $("#resources").innerHTML = "";
      $("#searchResults").textContent = "No results yet.";
      setStatus("Idle", "");
      renderViewer();
      makeTabs();
    });

    $("#form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const url = $("#url").value.trim();
      const depth = $("#depth").value || "2";
      const term = $("#term").value.trim();
      if (!url) {
        setStatus("Enter a URL", "bad");
        return;
      }

      setStatus("Fetching…", "");
      $("#searchResults").textContent = "Working…";
      try {
        const res = await fetch("/api/analyze?url=" + encodeURIComponent(url) + "&depth=" + encodeURIComponent(depth) + "&q=" + encodeURIComponent(term));
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || "Request failed");
        state.data = data;
        state.selectedId = data.rootPage?.id || data.entries?.[0]?.id || null;
        state.tab = "raw";
        renderMeta(data);
        makeTabs();
        renderTree();
        renderResources();
        renderViewer();
        runSearch();
        setStatus("Loaded", "good");
      } catch (err) {
        setStatus("Failed", "bad");
        $("#viewer").innerHTML = '<pre>' + esc(String(err.message || err)) + '</pre>';
        $("#searchResults").innerHTML = '<div class="muted">No results.</div>';
      }
    });

    makeTabs();
    renderViewer();
  </script>
</body>
</html>`;

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/api/analyze") {
      return handleAnalyze(request);
    }

    if (url.pathname === "/api/raw") {
      return handleRaw(request);
    }

    return new Response(UI_HTML, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  },
};

async function handleAnalyze(request) {
  try {
    const url = new URL(request.url);
    const target = url.searchParams.get("url") || (request.method === "POST" ? await readUrlFromBody(request) : "");
    const depth = clampInt(url.searchParams.get("depth"), 1, 4, CONFIG.MAX_DEPTH);
    const query = url.searchParams.get("q") || "";

    if (!target) return json({ ok: false, error: "Missing url" }, 400);

    const crawl = await crawlSite(target, { maxDepth: depth });
    const search = query ? searchCorpus(crawl.entries, query) : [];

    return json({
      ok: true,
      ...crawl,
      search,
    });
  } catch (err) {
    return json({ ok: false, error: String(err?.message || err) }, 500);
  }
}

async function handleRaw(request) {
  const url = new URL(request.url);
  const target = url.searchParams.get("url");
  if (!target) return json({ ok: false, error: "Missing url" }, 400);
  const res = await fetchText(target, CONFIG.MAX_TEXT_PER_FILE);
  return new Response(res.content || "", {
    status: res.status || 200,
    headers: {
      "content-type": res.contentType || "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

async function readUrlFromBody(request) {
  const ct = request.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const body = await request.json();
    return body?.url || "";
  }
  const text = await request.text();
  try {
    const body = JSON.parse(text);
    return body?.url || "";
  } catch {
    return text.trim();
  }
}

async function crawlSite(target, opts = {}) {
  const start = normalizeHttpUrl(target);
  if (!start) throw new Error("Only http and https URLs are allowed");
  if (isBlockedHost(start.hostname)) throw new Error("That host is not allowed");

  const maxDepth = clampInt(opts.maxDepth, 1, 4, CONFIG.MAX_DEPTH);
  const rootOrigin = start.origin;

  const queue = [{ url: start.href, depth: 0, kind: "html", referrer: null }];
  const visited = new Set();
  const entries = [];
  const byUrl = new Map();
  const tree = new Map();

  let pages = 0;
  let assets = 0;
  let textFiles = 0;

  while (queue.length && entries.length < CONFIG.MAX_ASSETS + CONFIG.MAX_PAGES) {
    const job = queue.shift();
    const normalized = normalizeAndCanonicalize(job.url, rootOrigin);
    if (!normalized) continue;
    if (visited.has(normalized)) continue;
    if (isBlockedHost(new URL(normalized).hostname)) continue;
    visited.add(normalized);

    const res = await fetchText(normalized, textLimitForUrl(normalized));
    const type = classifyContentType(res.contentType, normalized);
    const path = pathFromUrl(normalized, rootOrigin);

    const entry = {
      id: stableId(normalized),
      url: normalized,
      path,
      origin: new URL(normalized).origin,
      depth: job.depth,
      kind: type.kind,
      type: type.type,
      method: "GET",
      status: res.status,
      contentType: res.contentType,
      size: (res.content || "").length,
      content: res.content || "",
      finalUrl: res.finalUrl || normalized,
      referrer: job.referrer,
      discoveredFrom: job.kind,
      textContent: "",
    };

    if (type.kind === "html") pages++;
    else if (type.kind === "asset") assets++;
    else if (type.kind === "text") textFiles++;

    if (type.kind === "html") {
      const raw = entry.content;
      entry.pretty = formatHtml(raw);
      const extracted = extractFromHtml(raw, entry.finalUrl, rootOrigin);
      addToQueue(queue, extracted.links, normalized, job.depth + 1, maxDepth);
      addToQueue(queue, extracted.assets, normalized, job.depth + 1, maxDepth);
      if (job.depth + 1 <= maxDepth) {
        for (const u of extracted.pages) {
          if (entries.length + queue.length >= CONFIG.MAX_ASSETS + CONFIG.MAX_PAGES) break;
          queue.push({ url: u, depth: job.depth + 1, kind: "html", referrer: normalized });
        }
      }
      entry.textContent = cleanText(stripTags(raw)).slice(0, CONFIG.MAX_TEXT_PER_FILE);
    } else if (type.kind === "css") {
      entry.pretty = formatCss(entry.content);
      const extracted = extractFromCss(entry.content, entry.finalUrl, rootOrigin);
      addToQueue(queue, extracted.assets, normalized, job.depth + 1, maxDepth);
    } else if (type.kind === "js") {
      entry.pretty = formatJs(entry.content);
      const extracted = extractFromJs(entry.content, entry.finalUrl, rootOrigin);
      addToQueue(queue, extracted.assets, normalized, job.depth + 1, maxDepth);
    } else {
      entry.pretty = entry.content;
      entry.textContent = entry.content.slice(0, CONFIG.MAX_TEXT_PER_FILE);
    }

    entries.push(entry);
    byUrl.set(normalized, entry);
    insertTreeNode(tree, normalized, entry);
  }

  return {
    ok: true,
    rootUrl: start.href,
    finalUrl: entries.find((e) => e.id === stableId(start.href))?.finalUrl || start.href,
    rootPage: entries.find((e) => e.id === stableId(start.href)) || entries[0] || null,
    stats: {
      pages,
      assets,
      textFiles,
      total: entries.length,
    },
    entries,
    tree: treeToObject(tree),
  };
}

function textLimitForUrl(url) {
  if (/\.(html?|php|asp|aspx|jsp|txt|xml|json|svg|js|css)(\?|#|$)/i.test(url)) return CONFIG.MAX_TEXT_PER_FILE;
  return CONFIG.MAX_TEXT_PER_FILE;
}

function addToQueue(queue, items, referrer, depth, maxDepth) {
  if (depth > maxDepth) return;
  for (const item of items) {
    queue.push({ url: item, depth, kind: "asset", referrer });
  }
}

function classifyContentType(contentType, url) {
  const ct = String(contentType || "").toLowerCase();
  const path = String(url || "").toLowerCase();

  if (ct.includes("text/html") || path.match(/\.(html?|php|asp|aspx|jsp)(\?|#|$)/)) return { kind: "html", type: "html" };
  if (ct.includes("text/css") || path.match(/\.css(\?|#|$)/)) return { kind: "css", type: "css" };
  if (ct.includes("javascript") || path.match(/\.m?js(\?|#|$)/)) return { kind: "js", type: "js" };
  if (ct.includes("json") || path.match(/\.json(\?|#|$)/)) return { kind: "text", type: "json" };
  if (ct.includes("xml") || path.match(/\.xml(\?|#|$)/)) return { kind: "text", type: "xml" };
  if (ct.includes("svg") || path.match(/\.svg(\?|#|$)/)) return { kind: "text", type: "svg" };
  if (ct.startsWith("text/")) return { kind: "text", type: "text" };
  return { kind: "asset", type: "other" };
}

async function fetchText(url, limit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("timeout"), CONFIG.REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": CONFIG.USER_AGENT,
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,text/css,*/*;q=0.8",
      },
    });

    const contentType = res.headers.get("content-type") || "";
    let text = "";
    if (isTextLike(contentType) || likelyTextUrl(url)) {
      text = await res.text();
      if (text.length > limit) text = text.slice(0, limit) + "\n\n/* truncated */";
    }

    return {
      status: res.status,
      finalUrl: res.url,
      contentType,
      content: text,
    };
  } catch (err) {
    return {
      status: 0,
      finalUrl: url,
      contentType: "",
      content: `/* fetch failed: ${String(err?.message || err)} */`,
    };
  } finally {
    clearTimeout(timer);
  }
}

function likelyTextUrl(url) {
  return /\.(html?|php|asp|aspx|jsp|css|js|mjs|json|xml|txt|svg|map)(\?|#|$)/i.test(url);
}

function isTextLike(contentType) {
  const ct = String(contentType || "").toLowerCase();
  return (
    ct.includes("text/") ||
    ct.includes("javascript") ||
    ct.includes("json") ||
    ct.includes("xml") ||
    ct.includes("svg") ||
    ct.includes("x-www-form-urlencoded")
  );
}

function normalizeHttpUrl(input) {
  try {
    const u = new URL(String(input).trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u;
  } catch {
    return null;
  }
}

function normalizeAndCanonicalize(raw, rootOrigin) {
  try {
    const u = new URL(String(raw), rootOrigin);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    u.hash = "";
    return u.href;
  } catch {
    return null;
  }
}

function isBlockedHost(hostname) {
  const h = String(hostname || "").toLowerCase();
  if (!h) return true;
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (h === "::1" || h === "[::1]") return true;
  if (/^127\./.test(h)) return true;
  if (/^10\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true;
  const m = h.match(/^172\.(\d+)\./);
  if (m) {
    const n = Number(m[1]);
    if (n >= 16 && n <= 31) return true;
  }
  return false;
}

function clampInt(value, min, max, fallback) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function stableId(s) {
  let h = 2166136261;
  for (let i = 0; i < String(s).length; i++) {
    h ^= String(s).charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return "f_" + (h >>> 0).toString(16);
}

function pathFromUrl(url, rootOrigin) {
  try {
    const u = new URL(url);
    if (u.origin !== rootOrigin) return u.href;
    let p = u.pathname || "/";
    if (p === "/") p = "/index.html";
    return p + (u.search || "");
  } catch {
    return url;
  }
}

function stripTags(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\u00A0/g, " ");
}

function cleanText(text) {
  return decodeEntities(String(text || ""))
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function decodeEntities(s) {
  const map = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
  };
  return String(s)
    .replace(/&#(x?[0-9a-fA-F]+);/g, (_, n) => {
      const num = n.startsWith("x") || n.startsWith("X")
        ? parseInt(n.slice(1), 16)
        : parseInt(n, 10);
      return Number.isFinite(num) ? String.fromCodePoint(num) : "";
    .replace(/&([a-zA-Z]+);/g, (_, n) => map[n] || _);
}

function extractFromHtml(html, baseUrl, rootOrigin) {
  const out = { pages: [], links: [], assets: [] };
  const htmlText = String(html || "");

  const selectors = [
    /<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi,
    /<link\b[^>]*href=["']([^"']+)["'][^>]*>/gi,
    /<script\b[^>]*src=["']([^"']+)["'][^>]*>/gi,
    /<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi,
    /<source\b[^>]*src=["']([^"']+)["'][^>]*>/gi,
    /<iframe\b[^>]*src=["']([^"']+)["'][^>]*>/gi,
    /<video\b[^>]*src=["']([^"']+)["'][^>]*>/gi,
    /<audio\b[^>]*src=["']([^"']+)["'][^>]*>/gi,
    /<embed\b[^>]*src=["']([^"']+)["'][^>]*>/gi,
    /<object\b[^>]*data=["']([^"']+)["'][^>]*>/gi,
    /<form\b[^>]*action=["']([^"']+)["'][^>]*>/gi,
  ];

  for (const re of selectors) {
    let m;
    while ((m = re.exec(htmlText)) !== null) {
      const raw = m[1];
      const abs = canonicalizeSameOrigin(raw, baseUrl, rootOrigin);
      if (!abs) continue;
      if (looksLikeHtmlPage(abs)) out.pages.push(abs);
      else out.assets.push(abs);
      out.links.push(abs);
    }
  }

  const inlineStyles = [...htmlText.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1] || "");
  for (const css of inlineStyles) {
    const extracted = extractFromCss(css, baseUrl, rootOrigin);
    out.assets.push(...extracted.assets);
  }

  return {
    pages: unique(out.pages),
    links: unique(out.links),
    assets: unique(out.assets),
  };
}

function extractFromCss(css, baseUrl, rootOrigin) {
  const assets = [];
  const text = String(css || "");
  const importRe = /@import\s+(?:url\()?["']?([^"')\s]+)["']?\)?/gi;
  const urlRe = /url\(([^)]+)\)/gi;

  let m;
  while ((m = importRe.exec(text)) !== null) {
    const raw = stripCssQuotes(m[1]);
    const abs = canonicalizeSameOrigin(raw, baseUrl, rootOrigin);
    if (abs) assets.push(abs);
  }
  while ((m = urlRe.exec(text)) !== null) {
    const raw = stripCssQuotes(m[1]);
    if (!raw || raw.startsWith("data:")) continue;
    const abs = canonicalizeSameOrigin(raw, baseUrl, rootOrigin);
    if (abs) assets.push(abs);
  }

  return { assets: unique(assets) };
}

function extractFromJs(js, baseUrl, rootOrigin) {
  const assets = [];
  const text = String(js || "");
  const mapRe = /sourceMappingURL=([^\s*]+)/gi;
  let m;
  while ((m = mapRe.exec(text)) !== null) {
    const raw = m[1].trim();
    const abs = canonicalizeSameOrigin(raw, baseUrl, rootOrigin);
    if (abs) assets.push(abs);
  }
  return { assets: unique(assets) };
}

function canonicalizeSameOrigin(raw, baseUrl, rootOrigin) {
  try {
    const u = new URL(String(raw).trim(), baseUrl);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (u.origin !== rootOrigin) return null;
    u.hash = "";
    return u.href;
  } catch {
    return null;
  }
}

function looksLikeHtmlPage(url) {
  return /\/$|\.html?(?:\?|#|$)|\.php(?:\?|#|$)|\.aspx?(?:\?|#|$)|\.jsp(?:\?|#|$)|\?/.test(url);
}

function stripCssQuotes(s) {
  return String(s || "").trim().replace(/^['"]|['"]$/g, "");
}

function unique(arr) {
  return [...new Set((arr || []).filter(Boolean))];
}

function searchCorpus(entries, term) {
  const q = String(term || "").trim().toLowerCase();
  if (!q) return [];
  const hits = [];
  for (const e of entries || []) {
    const content = String(e.content || "");
    const idx = content.toLowerCase().indexOf(q);
    if (idx !== -1) {
      const start = Math.max(0, idx - 140);
      const end = Math.min(content.length, idx + q.length + 220);
      hits.push({
        id: e.id,
        kind: e.kind,
        url: e.url,
        path: e.path,
        snippet: content.slice(start, end),
      });
    }
  }
  return hits.slice(0, CONFIG.MAX_SEARCH_RESULTS);
}

function insertTreeNode(tree, url, entry) {
  const u = new URL(url);
  const parts = u.pathname.split("/").filter(Boolean);
  let node = tree;

  if (!node.children) node.children = {};

  const rootKey = u.origin;
  if (!node.children[rootKey]) {
    node.children[rootKey] = { label: rootKey, children: {}, entry: null };
  }
  node = node.children[rootKey];

  const fullParts = parts.length ? parts : ["index.html"];
  for (let i = 0; i < fullParts.length; i++) {
    const part = fullParts[i];
    if (!node.children) node.children = {};
    if (!node.children[part]) {
      node.children[part] = { label: part, children: {}, entry: null };
    }
    node = node.children[part];
  }
  node.entry = entry;
}

function treeToObject(node) {
  if (!node || !node.children) return {};
  const out = {};
  for (const [k, v] of Object.entries(node.children)) {
    out[k] = treeNodeToObject(v);
  }
  return out;
}

function treeNodeToObject(n) {
  return {
    label: n.label,
    entry: n.entry ? { id: n.entry.id, url: n.entry.url, path: n.entry.path, kind: n.entry.kind } : null,
    children: n.children ? Object.fromEntries(Object.entries(n.children).map(([k, v]) => [k, treeNodeToObject(v)])) : {},
  };
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
    const selfClose =
      /\/>$/.test(token) ||
      /^(?:<!|<\?)/.test(token) ||
      ["meta","link","br","hr","img","input","source","area","col","embed","param","track","wbr"].includes(name);
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
  let out = "";
  let indent = 0;
  let inStr = false;
  let strQ = "";
  let escp = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const n = s[i + 1];

    if (lineComment) {
      out += c;
      if (c === "\n") {
        lineComment = false;
        out += "  ".repeat(indent);
      }
      continue;
    }

    if (blockComment) {
      out += c;
      if (c === "*" && n === "/") {
        out += "/";
        i++;
        blockComment = false;
      }
      continue;
    }

    if (inStr) {
      out += c;
      if (escp) {
        escp = false;
      } else if (c === "\\") {
        escp = true;
      } else if (c === strQ) {
        inStr = false;
      }
      continue;
    }

    if (c === "/" && n === "/") {
      out += "//";
      i++;
      lineComment = true;
      continue;
    }

    if (c === "/" && n === "*") {
      out += "/*";
      i++;
      blockComment = true;
      continue;
    }

    if (c === '"' || c === "'" || c === "`") {
      inStr = true;
      strQ = c;
      out += c;
      continue;
    }

    if (c === "{") {
      out += " {\n";
      indent++;
      out += "  ".repeat(indent);
      continue;
    }
    if (c === "}") {
      out = out.replace(/[ \t]+$/g, "");
      if (!out.endsWith("\n")) out += "\n";
      indent = Math.max(0, indent - 1);
      out += "  ".repeat(indent) + "}\n" + "  ".repeat(indent);
      continue;
    }
    if (c === ";") {
      out += ";\n" + "  ".repeat(indent);
      continue;
    }
    if (c === "\n") {
      out = out.replace(/[ \t]+$/g, "");
      out += "\n" + "  ".repeat(indent);
      continue;
    }

    out   += c;
  }
  return out.replace(/\n{3,}/g, "\n\n").trim();
}
