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
        out += "${";
        i += 2;
        state = "templateExpr";
        // Keep the expression indentation in normal code mode.
        continue;
      }

      if (c === "\n") lineStart = true;
      i++;
      continue;
    }

    // --- CODE / TEMPLATE EXPRESSION STATES ---
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
      // Keep interior spacing, but never preserve leading indentation whitespace.
      if (!lineStart) out += c;
      i++;
      continue;
    }

    // Line comment
    if (c === "/" && n === "/") {
      writeIndentIfNeeded();
      out += "//";
      i += 2;
      state = "lineComment";
      continue;
    }

    // Block comment
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

    // Regex literal (heuristic)
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

    // Identifier / keyword
    if (/[A-Za-z_$]/.test(c)) {
      writeIndentIfNeeded();
      const word = readWord(i);
      out += word;
      i += word.length;
      lastWord = word;
      lastSig = word[word.length - 1];
      continue;
    }

    // Opening brace
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

    // Closing brace
    if (c === "}") {
      if (inExpr) {
        // In template expression: a top-level } closes ${...}
        // Nested braces inside the expression are still formatted normally.
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
      document.querySelectorAll("#tree .copy-one").forEach((btn) => {
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

      document.querySelectorAll("#resources [data-open]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.selectedId = btn.dataset.open;
          renderTree();
          renderViewer();
        });
      });

      document.querySelectorAll("#resources [data-copy]").forEach((btn) => {
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