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
  <title>𝑾𝒆𝒃 𝑨𝒏𝒂𝒍𝒚𝒔𝒊𝒔 𝑷𝒓𝒐𝒕𝒐𝒄𝒐𝒍</title>
<link rel="stylesheet" href="/appmain.css">
</head>
<body>
  <div class="wrap">
    <div class="hero">
      <h1>𝑾𝒆𝒃 𝑨𝒏𝒂𝒍𝒚𝒔𝒊𝒔 𝑷𝒓𝒐𝒕𝒐𝒄𝒐𝒍</h1>
      <p class="sub">𝚃𝚑𝚒𝚜 𝚒𝚜 𝚊𝚗 𝙰𝙿𝙸 𝚋𝚊𝚜𝚎𝚍 𝙰𝚗𝚊𝚕𝚢𝚝𝚒𝚌𝚊𝚕 𝙴𝚗𝚐𝚒𝚗𝚎 𝙳𝚎𝚜𝚒𝚐𝚗𝚎𝚍 𝚋𝚢 [𝙳𝚎𝚐𝚛𝚎𝚎𝚕𝚎𝚜𝚜 𝙴𝚗𝚐𝚒𝚗𝚎𝚎𝚛 𝑳.𝑨𝒓𝒂𝒔𝒉𝒊 𝙻𝚘𝙻..]𝚝𝚘 𝚎𝚡𝚝𝚛𝚊𝚌𝚝 𝚖𝚘𝚜𝚝 𝚊𝚌𝚌𝚞𝚛𝚊𝚝𝚎 𝚍𝚊𝚝𝚊 𝚜𝚝𝚛𝚞𝚌𝚝𝚞𝚛𝚎 𝚏𝚛𝚘𝚖 𝚊𝚗𝚢 𝙷𝚃𝚃𝙿/𝙷𝚃𝚃𝙿𝚂 𝚜𝚒𝚝𝚎. 𝙱𝚎𝚜𝚝 𝚊𝚕𝚝𝚎𝚛𝚗𝚊𝚝𝚒𝚟𝚎 𝚘𝚏 𝙳𝚎𝚟𝚃𝚘𝚘𝚕𝚜. </p>

      <form id="form" class="toolbar">
        <input id="url" type="url" placeholder="ℎ𝑡𝑡𝑝𝑠://𝑒𝑥𝑎𝑚𝑝𝑙𝑒.𝑐𝑜𝑚" autocomplete="off" spellcheck="false" />
        <input id="term" type="text" placeholder="Search across collected source" autocomplete="off" spellcheck="false" />
        <select id="depth">
          <option value="1">𝐄𝐱𝐭𝐫𝐚𝐜𝐭𝐢𝐨𝐧 𝐋𝐯𝐋:Ⅰ</option>
          <option value="2" selected>𝐄𝐱𝐭𝐫𝐚𝐜𝐭𝐢𝐨𝐧 𝐋𝐯𝐋:Ⅱ</option>
          <option value="3">𝐄𝐱𝐭𝐫𝐚𝐜𝐭𝐢𝐨𝐧 𝐋𝐯𝐋:Ⅲ</option>
          <option value="4">𝐄𝐱𝐭𝐫𝐚𝐜𝐭𝐢𝐨𝐧 𝐋𝐯𝐋:Ⅳ</option>
        </select>
        <button type="submit">𝗦𝘁𝗮𝗿𝘁 𝗘𝗻𝗴𝗶𝗻𝗲</button>
        <button type="button" class="secondary" id="reset">𝗥𝗲𝘀𝗲𝘁</button>
      </form>

      <div class="meta" id="meta"></div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="terminal-shell">
          <div class="terminal-head">
            <span>Terminal</span>
            <button type="button" class="secondary" id="copyTreeText">Copy tree</button>
          </div>
          <pre class="terminal" id="terminalTree">No site loaded yet.</pre>
        </div>

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
<script src="/appmain.js" defer></script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/analyze") {
      return handleAnalyze(request);
    }
    if (env?.ASSETS) {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) return asset;
    }
    if (url.pathname === "/" || url.pathname === "") {
      return new Response(UI_HTML, {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
          "x-content-type-options": "nosniff",
          "referrer-policy": "no-referrer",
        },
      });
    }
    return new Response("Not found", {
      status: 404,
      headers: {
        "content-type": "text/plain; charset=utf-8",
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
      treeText: renderTerminalTree(crawl.entries, crawl.rootUrl),
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

    const res = await fetchText(normalized, textLimitForUrl(normalized), rootOrigin);
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
  const u = String(url || "");
  if (/\.(html?|php|asp|aspx|jsp)(\?|#|$)/i.test(u)) return CONFIG.MAX_HTML;
  if (/\.css(\?|#|$)/i.test(u)) return CONFIG.MAX_CSS;
  if (/\.m?js(\?|#|$)/i.test(u)) return CONFIG.MAX_JS;
  return CONFIG.MAX_TEXT_PER_FILE;
}
async function fetchText(url, limit, rootOrigin = null) {
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

    const finalUrl = res.url || url;
    if (rootOrigin && new URL(finalUrl).origin !== rootOrigin) {
      return {
        status: 403,
        finalUrl,
        contentType: "text/plain; charset=utf-8",
        content: "/* blocked off-origin redirect */",
      };
    }

    const contentType = res.headers.get("content-type") || "";
    let text = "";
    if (isTextLike(contentType) || likelyTextUrl(finalUrl)) {
      text = await res.text();
      if (text.length > limit) text = text.slice(0, limit) + "\n\n/* truncated */";
    }

    return {
      status: res.status,
      finalUrl,
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
    })
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
function renderTerminalTree(entries, rootUrl) {
  const siteLabel = siteLabelFromUrl(rootUrl);
  const rows = [];
  const seen = new Set();

  for (const entry of entries || []) {
    const path = terminalPathLabel(entry?.path || entry?.url || "");
    if (!path || seen.has(path)) continue;
    seen.add(path);
    rows.push({ path, group: terminalGroupKey(path) });
  }

  if (!rows.length) return `(${siteLabel})\n|`;

  const out = [`(${siteLabel})`];
  let lastGroup = null;
  for (const row of rows) {
    if (lastGroup !== null && row.group !== lastGroup) out.push("|");
    out.push(`|---${row.path}`);
    lastGroup = row.group;
  }
  out.push("|");
  return out.join("\n");
}

function terminalPathLabel(path) {
  let p = String(path || "").trim().replace(/\\/g, "/");
  if (!p) return "";
  if (!p.startsWith("/")) p = "/" + p;
  if (/^\/index\.html(?:[?#]|$)/i.test(p)) return "index.html";
  return p;
}

function terminalGroupKey(path) {
  const p = String(path || "").trim();
  if (p === "index.html") return "__root__";
  const body = p.startsWith("/") ? p.slice(1) : p;
  return (body.split("/")[0] || "__root__").toLowerCase();
}

function siteLabelFromUrl(rootUrl) {
  try {
    const u = new URL(rootUrl);
    return u.host || u.hostname || u.origin || "Site";
  } catch {
    return String(rootUrl || "Site");
  }
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
  return s.trim();
}
