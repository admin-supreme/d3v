const CONFIG = {
  MAX_PAGES: 40,
  MAX_ASSETS: 180,
  MAX_DEPTH: 4,
  MAX_TEXT_PER_FILE: 250000,
  MAX_HTML: 350000,
  MAX_CSS: 250000,
  MAX_JS: 250000,
  MAX_SEARCH_RESULTS: 80,
  REQUEST_TIMEOUT_MS: 15000,
  USER_AGENT: "Mozilla/5.0 (compatible; D3Vtools/3.0; +https://workers.dev)",
};
const UI_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>𝑾𝒆𝒃 𝑨𝒏𝒂𝒍𝒚𝒔𝒊𝒔 𝑷𝒓𝒐𝒕𝒐𝒄𝒐𝒍</title>
  <link rel="stylesheet" href="/appmain.css" />
</head>
<body>
  <div class="shell">
    <header class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Live worker inspector</p>
        <h1>𝑾𝒆𝒃 𝑨𝒏𝒂𝒍𝒚𝒔𝒊𝒔 𝑷𝒓𝒐𝒕𝒐𝒄𝒐𝒍</h1>
        <p class="sub">
          𝚃𝚑𝚒𝚜 𝚒𝚜 𝚊𝚗 𝙰𝙿𝙸 𝚋𝚊𝚜𝚎𝚍 𝙰𝚗𝚊𝚕𝚢𝚝𝚒𝚌𝚊𝚕 𝙴𝚗𝚐𝚒𝚗𝚎 𝙳𝚎𝚜𝚒𝚐𝚗𝚎𝚍 𝚋𝚢 [𝙳𝚎𝚐𝚛𝚎𝚎𝚕𝚎𝚜𝚜 𝙴𝚗𝚐𝚒𝚗𝚎𝚎𝚛 𝑳.𝑨𝒓𝒂𝒔𝒉𝒊 𝙻𝚘𝙻..]𝚝𝚘 𝚎𝚡𝚝𝚛𝚊𝚌𝚝 𝚖𝚘𝚜𝚝 𝚊𝚌𝚌𝚞𝚛𝚊𝚝𝚎 𝚍𝚊𝚝𝚊 𝚜𝚝𝚛𝚞𝚌𝚝𝚞𝚛𝚎 𝚏𝚛𝚘𝚖 𝚊𝚗𝚢 𝙷𝚃𝚃𝙿/𝙷𝚃𝚃𝙿𝚂 𝚜𝚒𝚝𝚎. 𝙱𝚎𝚜𝚝 𝚊𝚕𝚝𝚎𝚛𝚗𝚊𝚝𝚒𝚟𝚎 𝚘𝚏 𝙳𝚎𝚟𝚃𝚘𝚘𝚕𝚜
          </p>
      </div>
      <form id="form" class="toolbar">
        <input id="url" type="url" placeholder="https://example.com" autocomplete="off" spellcheck="false" />
        <input id="term" type="text" placeholder="Search across source" autocomplete="off" spellcheck="false" />
        <select id="depth">
          <option value="1" selected>𝐄𝐱𝐭𝐫𝐚𝐜𝐭𝐢𝐨𝐧 𝐋𝐯𝐋:Ⅰ</option>
          <option value="2">𝐄𝐱𝐭𝐫𝐚𝐜𝐭𝐢𝐨𝐧 𝐋𝐯𝐋:Ⅱ</option>
          <option value="3">𝐄𝐱𝐭𝐫𝐚𝐜𝐭𝐢𝐨𝐧 𝐋𝐯𝐋:Ⅲ</option>
          <option value="4">𝐄𝐱𝐭𝐫𝐚𝐜𝐭𝐢𝐨𝐧 𝐋𝐯𝐋:Ⅳ</option>
        </select>
        <button type="submit">𝐒𝐭𝐚𝐫𝐭 𝐄𝐧𝐠𝐢𝐧𝐞</button>
        <button type="button" class="secondary" id="reset">𝐑𝐞𝐬𝐞𝐭</button>
      </form>
      <div class="meta" id="meta"></div>
    </header>
    <main class="layout">
      <section class="panel live-panel">
        <div class="section-head">
          <div>
            <h2>𝐋𝐢𝐯𝐞 𝐏𝐚𝐠𝐞 𝐕𝐢𝐞𝐰</h2>
            <p class="muted" id="liveUrl">No page loaded.</p>
          </div>
          <div class="actions">
            <button type="button" class="secondary" id="refreshSource">Refresh source</button>
            <button type="button" class="secondary" id="fullscreenBtn">Full screen</button>
          </div>
        </div>
        <div class="iframe-shell" id="iframeShell">
          <iframe id="viewerFrame" title="Live preview" referrerpolicy="no-referrer" allow="fullscreen; clipboard-read; clipboard-write"></iframe>
          <div class="iframe-hint" id="iframeHint">Paste a URL and start the engine.</div>
        </div>
        <div class="event-strip">
          <span class="pill" id="eventCount">0 events</span>
          <span class="pill" id="eventType">idle</span>
          <span class="pill" id="eventNode">no click yet</span>
        </div>
       <div class="panel-block">
          <div class="section-head">
            <h3>Live event log</h3>
            <button type="button" class="secondary" id="clearEvents">Clear</button>
          </div>
          <div class="log" id="liveEvents">No iframe events yet.</div>
        </div>
        <div class="panel-block">
          <div class="section-head">
            <h3>Live DOM snapshot</h3>
            <button type="button" class="secondary" id="copyLiveDom">Copy</button>
          </div>
          <div class="codebox"><pre id="liveDom">No live snapshot yet.</pre></div>
        </div>
      </section>
      <section class="panel">
        <div class="section-head">
          <div>
            <h2>Response source</h2>
            <p class="muted">Exact fetched HTML, CSS, JS, and text assets are separated here.</p>
          </div>
          <div class="actions">
            <button type="button" class="secondary" id="copyCurrent">Copy current</button>
            <button type="button" class="secondary" id="copyRaw">Copy raw</button>
            <button type="button" class="secondary" id="copyPretty">Copy pretty</button>
          </div>
        </div>
        <div class="tabs" id="tabs"></div>
        <div class="codebox" id="viewer"><pre class="muted">Load a page to inspect it.</pre></div>
        <div class="split">
          <div class="card">
            <div class="section-head">
              <h3>Separated source bundles</h3>
              <span class="muted" id="resourceCount"></span>
            </div>
            <div class="bundle-list" id="bundles"></div>
          </div>
          <div class="card">
            <div class="section-head">
              <h3>Search matches</h3>
              <button type="button" class="secondary" id="searchBtn">Search</button>
            </div>
            <div class="codebox"><div class="text" id="searchResults">No results yet.</div></div>
          </div>
        </div>
        <div class="card">
          <div class="section-head">
            <h3>Tree</h3>
            <button type="button" class="secondary" id="copyTreeText">Copy tree</button>
          </div>
          <div class="codebox"><pre id="terminalTree">No site loaded yet.</pre></div>
          <div class="tree" id="tree"></div>
        </div>
      </section>
    </main>
    <footer class="footer">
      This worker can inspect fetched source and proxy a live iframe for interaction tracing. It cannot bypass browser-origin rules on arbitrary third-party pages without proxying them through the worker.
    </footer>
  </div>
  <script src="/appmain.js" defer></script>
</body>
</html>`;
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/api/analyze") {
      return handleAnalyze(request);
    }
    if (path === "/api/raw") {
      return handleRaw(request);
    }
    if (path === "/browse" || path.startsWith("/browse/")) {
      return handleBrowse(request);
    }

    if (env?.ASSETS) {
      const asset = await env.ASSETS.fetch(request);
      if (asset?.status && asset.status !== 404) return asset;
    }

    if (path === "/" || path === "") {
      return new Response(UI_HTML, {
        headers: baseHeaders("text/html; charset=utf-8"),
      });
    }

    return new Response("Not found", {
      status: 404,
      headers: baseHeaders("text/plain; charset=utf-8"),
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
    const proxyOrigin = new URL(request.url).origin;
    const rootPage = crawl.rootPage && crawl.rootPage.kind === "html" ? crawl.rootPage : null;
    const frameHtml = rootPage
      ? renderProxiedHtml({
          html: rootPage.content || "",
          pageUrl: rootPage.finalUrl || crawl.rootUrl,
          proxyOrigin,
        })
      : "";
    const search = query ? searchCorpus(crawl.entries, query) : [];

    return json({
      ok: true,
      viewerUrl: buildInitialViewerUrl(crawl.rootUrl),
      frameHtml,
      ...crawl,
      treeText: renderTerminalTree(crawl.tree, crawl.rootUrl),
      search,
      bundles: bundleByType(crawl.entries),
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
    headers: baseHeaders(res.contentType || "text/plain; charset=utf-8"),
  });
}
async function handleBrowse(request) {
  const reqUrl = new URL(request.url);
  const original = resolveOriginalFromBrowseUrl(reqUrl);
  if (!original) return new Response("Missing url", { status: 400, headers: baseHeaders("text/plain; charset=utf-8") });

  const res = await fetchText(original, textLimitForUrl(original), new URL(original).origin);
  const type = classifyContentType(res.contentType, original);
  if (type.kind !== "html") {
    return new Response(res.content || "", {
      status: res.status || 200,
      headers: baseHeaders(res.contentType || "text/plain; charset=utf-8"),
    });
  }

  const html = renderProxiedHtml({
    html: res.content || "",
    pageUrl: res.finalUrl || original,
    proxyOrigin: reqUrl.origin,
  });

  return new Response(html, {
    status: res.status || 200,
    headers: {
      ...baseHeaders("text/html; charset=utf-8"),
      "content-security-policy": "default-src * data: blob: 'unsafe-inline' 'unsafe-eval'; img-src * data: blob:; media-src * data: blob:; connect-src * data: blob:; frame-src * data: blob:;",
      "x-frame-options": "ALLOWALL",
      "permissions-policy": "fullscreen=*, clipboard-read=*, clipboard-write=*",
    },
  });
}
function baseHeaders(contentType) {
  return {
    "content-type": contentType,
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
  };
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: baseHeaders("application/json; charset=utf-8"),
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
  const tree = { children: {} };
  const groups = { html: [], css: [], js: [], text: [], assets: [] };
  let pages = 0;
  let assets = 0;
  let textFiles = 0;

  while (queue.length && entries.length < CONFIG.MAX_ASSETS + CONFIG.MAX_PAGES) {
    const job = queue.shift();
    const normalized = normalizeAndCanonicalize(job.url, rootOrigin);
    if (!normalized || visited.has(normalized)) continue;
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
      inline: false,
    };

    if (type.kind === "html") {
      pages += 1;
      entry.pretty = formatHtml(entry.content);
      entry.textContent = cleanText(stripTags(entry.content));
      const extracted = extractFromHtml(entry.content, entry.finalUrl, rootOrigin);
      entry.links = extracted.links;
      entry.assets = extracted.assets;
      entry.inlineBlocks = extracted.inlineBlocks;

      for (const block of extracted.inlineBlocks) {
        const virtualUrl = `${normalized}#inline-${block.kind}-${block.index}`;
        const virtualEntry = {
          id: stableId(virtualUrl),
          url: virtualUrl,
          path: `${path} [inline ${block.kind} ${block.index + 1}]`,
          origin: entry.origin,
          depth: job.depth,
          kind: block.kind,
          type: block.kind,
          method: "INLINE",
          status: 200,
          contentType: block.kind === "css" ? "text/css" : "application/javascript",
          size: block.content.length,
          content: block.content,
          finalUrl: normalized,
          referrer: normalized,
          discoveredFrom: "inline",
          textContent: block.content,
          inline: true,
          parentId: entry.id,
          pretty: block.kind === "css" ? formatCss(block.content) : formatJs(block.content),
        };
        entries.push(virtualEntry);
        groups[block.kind].push(virtualEntry);
      }

      if (job.depth < maxDepth) {
        for (const next of extracted.pages) {
          queue.push({ url: next, depth: job.depth + 1, kind: "html", referrer: normalized });
        }
        for (const next of extracted.assets) {
          queue.push({ url: next, depth: job.depth + 1, kind: "asset", referrer: normalized });
        }
      }
    } else if (type.kind === "css") {
      assets += 1;
      entry.pretty = formatCss(entry.content);
      const extracted = extractFromCss(entry.content, entry.finalUrl, rootOrigin);
      entry.assets = extracted.assets;
    } else if (type.kind === "js") {
      assets += 1;
      entry.pretty = formatJs(entry.content);
      const extracted = extractFromJs(entry.content, entry.finalUrl, rootOrigin);
      entry.assets = extracted.assets;
    } else if (type.kind === "text") {
      textFiles += 1;
      entry.textContent = cleanText(entry.content);
    } else {
      assets += 1;
    }
    entries.push(entry);
    insertTreeNode(tree, normalized, entry);

    if (type.kind === "html") groups.html.push(entry);
    else if (type.kind === "css") groups.css.push(entry);
    else if (type.kind === "js") groups.js.push(entry);
    else if (type.kind === "text") groups.text.push(entry);
    else groups.assets.push(entry);
  }

  return {
    ok: true,
    rootUrl: start.href,
    finalUrl: entries.find((e) => e.id === stableId(start.href))?.finalUrl || start.href,
    rootPage: entries.find((e) => e.id === stableId(start.href)) || entries[0] || null,
    stats: { pages, assets, textFiles, total: entries.length },
    entries,
    tree: treeToObject(tree),
    groups,
  };
}
function bundleByType(entries) {
  const out = { html: [], css: [], js: [], text: [], assets: [] };
  for (const e of entries || []) {
    if (e.kind === "html" && !e.inline) out.html.push(e);
    else if (e.kind === "css" || (e.inline && e.kind === "css")) out.css.push(e);
    else if (e.kind === "js" || (e.inline && e.kind === "js")) out.js.push(e);
    else if (e.kind === "text") out.text.push(e);
    else out.assets.push(e);
  }
  return out;
}
function resolveOriginalFromBrowseUrl(reqUrl) {
  if (reqUrl.pathname === "/browse") {
    const direct = reqUrl.searchParams.get("u");
    if (!direct) return null;
    const normalized = normalizeHttpUrl(direct);
    return normalized?.href || null;
  }

  const remainder = reqUrl.pathname.slice("/browse/".length);
  const parts = remainder.split("/").filter((p) => p.length > 0);
  if (parts.length < 2) return null;

  const scheme = parts.shift();
  const host = parts.shift();
  if (!scheme || !host) return null;

  const path = "/" + parts.map(decodePathSegment).join("/");
  try {
    const origin = `${scheme}://${host}`;
    const original = new URL(path || "/", origin);
    original.search = reqUrl.search;
    original.hash = "";
    return original.href;
  } catch {
    return null;
  }
}
function buildInitialViewerUrl(originalUrl) {
  const u = normalizeHttpUrl(originalUrl);
  if (!u) return "";
  return `/browse?u=${encodeURIComponent(u.href)}`;
}
function buildProxyBase(originalUrl, proxyOrigin) {
  const u = normalizeHttpUrl(originalUrl);
  if (!u) return "";
  const path = u.pathname && u.pathname.length ? u.pathname : "/";
  return `${proxyOrigin}/browse/${u.protocol.replace(":", "")}/${u.host}${path}`;
}
function renderProxiedHtml({ html, pageUrl, proxyOrigin }) {
  let out = String(html || "");

  out = out.replace(/<base\b[^>]*>/gi, "");
  out = out.replace(/<meta\b[^>]*http-equiv=["']?\s*content-security-policy\s*["']?[^>]*>/gi, "");
  out = out.replace(/<meta\b[^>]*http-equiv=["']?\s*x-frame-options\s*["']?[^>]*>/gi, "");

  out = rewriteHtmlUrls(out, pageUrl, proxyOrigin);

  const baseHref = buildProxyBase(pageUrl, proxyOrigin);
  const meta = {
    originalUrl: pageUrl,
    proxyBase: baseHref,
    proxiedAt: new Date().toISOString(),
  };

  const bridge = createBridgeScript(meta);
  const baseTag = `<base href="${escapeHtml(baseHref)}">`;
  const metaScript = `<script>window.__D3V_META__ = ${JSON.stringify(meta)};</script>`;
  const inject = `${baseTag}\n${metaScript}\n${bridge}`;

  if (/<head\b[^>]*>/i.test(out)) {
    out = out.replace(/<head\b([^>]*)>/i, (m, attrs) => `<head${attrs}>${inject}`);
  } else {
    out = inject + out;
  }

  return out;
}
function createBridgeScript(meta) {
  const data = JSON.stringify(meta || {});
  return `<script>
(() => {
  const META = ${data};
  const send = (type, detail = {}) => {
    try {
      parent.postMessage({
        source: "d3v-live",
        type,
        detail,
        href: location.href,
        title: document.title,
        originalUrl: META.originalUrl || "",
        proxyBase: META.proxyBase || "",
        ts: Date.now()
      }, "*");
    } catch {}
  };

  const LIMIT = 140000;
  let timer = 0;
  let lastKey = "";

  function clip(v, n = 180) {
    v = String(v ?? "");
    return v.length > n ? v.slice(0, n) + "…" : v;
  }

  function snapshot(reason) {
    try {
      const html = document.documentElement ? document.documentElement.outerHTML : "";
      const key = [location.href, document.title, html.length, reason].join("|");
      if (key === lastKey) return;
      lastKey = key;
      send("snapshot", {
        reason,
        readyState: document.readyState,
        html: html.slice(0, LIMIT),
        bodyText: clip(document.body ? document.body.innerText : "", 5000),
      });
    } catch (err) {
      send("snapshot-error", { message: String(err?.message || err) });
    }
  }

  function scheduleSnapshot(reason) {
    clearTimeout(timer);
    timer = setTimeout(() => snapshot(reason), 200);
  }

  function describeTarget(node) {
    const el = node && node.nodeType === 1 ? node : node?.closest?.("a,button,input,select,textarea,form,[role='button'],[onclick],img,video,audio");
    if (!el) return {};
    return {
      tag: el.tagName,
      id: el.id || "",
      className: typeof el.className === "string" ? el.className : "",
      text: clip((el.innerText || el.value || el.alt || el.getAttribute?.("aria-label") || ""), 240),
      href: el.href || el.getAttribute?.("href") || "",
      src: el.src || el.getAttribute?.("src") || "",
      action: el.action || el.getAttribute?.("action") || "",
      outerHTML: clip(el.outerHTML || "", 1200),
    };
  }

  document.addEventListener("click", (event) => {
    send("click", {
      ...describeTarget(event.target),
      x: event.clientX,
      y: event.clientY,
      button: event.button,
      metaKey: !!event.metaKey,
      ctrlKey: !!event.ctrlKey,
      shiftKey: !!event.shiftKey,
      altKey: !!event.altKey,
    });
    scheduleSnapshot("click");
  }, true);

  document.addEventListener("submit", (event) => {
    const form = event.target;
    send("submit", {
      action: form?.action || "",
      method: form?.method || "",
      outerHTML: clip(form?.outerHTML || "", 1200),
    });
    scheduleSnapshot("submit");
  }, true);

  document.addEventListener("change", (event) => {
    send("change", describeTarget(event.target));
    scheduleSnapshot("change");
  }, true);

  const pushState = history.pushState;
  history.pushState = function(...args) {
    const ret = pushState.apply(this, args);
    send("navigate", { kind: "pushState" });
    scheduleSnapshot("pushState");
    return ret;
  };

  const replaceState = history.replaceState;
  history.replaceState = function(...args) {
    const ret = replaceState.apply(this, args);
    send("navigate", { kind: "replaceState" });
    scheduleSnapshot("replaceState");
    return ret;
  };

  addEventListener("popstate", () => {
    send("navigate", { kind: "popstate" });
    scheduleSnapshot("popstate");
  });

  addEventListener("hashchange", () => {
    send("navigate", { kind: "hashchange" });
    scheduleSnapshot("hashchange");
  });

  addEventListener("load", () => {
    send("load", { readyState: document.readyState });
    scheduleSnapshot("load");
  });

  const mo = new MutationObserver(() => scheduleSnapshot("mutation"));
  try {
    mo.observe(document.documentElement || document, { subtree: true, childList: true, characterData: true, attributes: true });
  } catch {}

  const origFetch = window.fetch;
  if (origFetch) {
    window.fetch = function(input, init) {
      try {
        const url = typeof input === "string" ? input : (input && input.url) ? input.url : "";
        send("fetch", { url: String(url).slice(0, 500) });
      } catch {}
      return origFetch.apply(this, arguments);
    };
  }

  const XHR = window.XMLHttpRequest;
  if (XHR && XHR.prototype) {
    const open = XHR.prototype.open;
    XHR.prototype.open = function(method, url) {
      try { send("xhr", { method: String(method || ""), url: String(url || "").slice(0, 500) }); } catch {}
      return open.apply(this, arguments);
    };
  }

  send("boot", { href: location.href, title: document.title });
  scheduleSnapshot("boot");
})();
</script>`;
}
function rewriteHtmlUrls(html, pageUrl, proxyOrigin) {
  let out = String(html || "");

  const attrMap = [
    "src",
    "href",
    "action",
    "poster",
    "data",
    "xlink:href",
    "formaction",
    "manifest",
  ];

  for (const attr of attrMap) {
    const re = new RegExp(`\\b${escapeRegExp(attr)}=(["'])(.*?)\\1`, "gi");
    out = out.replace(re, (m, q, value) => {
      const next = proxifyUrl(value, pageUrl, proxyOrigin);
      return next ? `${attr}=${q}${escapeHtmlAttr(next)}${q}` : m;
    });
  }

  out = out.replace(/\bsrcset=(["'])(.*?)\1/gi, (m, q, value) => {
    const next = rewriteSrcset(value, pageUrl, proxyOrigin);
    return next ? `srcset=${q}${escapeHtmlAttr(next)}${q}` : m;
  });

  out = out.replace(/\bstyle=(["'])(.*?)\1/gi, (m, q, value) => {
    const next = rewriteCss(value, pageUrl, proxyOrigin);
    return next ? `style=${q}${escapeHtmlAttr(next)}${q}` : m;
  });

  out = out.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (m, attrs, body) => {
    return `<style${attrs}>${rewriteCss(body, pageUrl, proxyOrigin)}</style>`;
  });

  out = out.replace(/<meta\b([^>]*?)http-equiv=(["']?)refresh\2([^>]*)>/gi, (m, before, q, after) => {
    const contentMatch = m.match(/\bcontent=(["'])(.*?)\1/i);
    if (!contentMatch) return m;
    const content = contentMatch[2];
    const next = content.replace(/url\s*=\s*([^;]+)$/i, (mm, url) => {
      const proxied = proxifyUrl(url.trim(), pageUrl, proxyOrigin);
      return proxied ? `url=${proxied}` : mm;
    });
    return m.replace(contentMatch[0], `content="${escapeHtmlAttr(next)}"`);
  });

  return out;
}
function rewriteCss(css, pageUrl, proxyOrigin) {
  let out = String(css || "");
  out = out.replace(/@import\s+(?:url\()?['"]?([^'")\s]+)['"]?\)?/gi, (m, raw) => {
    const next = proxifyUrl(raw, pageUrl, proxyOrigin);
    return next ? m.replace(raw, next) : m;
  });
  out = out.replace(/url\(([^)]+)\)/gi, (m, raw) => {
    const cleaned = stripCssQuotes(raw).trim();
    if (!cleaned || cleaned.startsWith("data:") || cleaned.startsWith("blob:")) return m;
    const next = proxifyUrl(cleaned, pageUrl, proxyOrigin);
    return next ? `url("${next}")` : m;
  });
  return out;
}
function rewriteSrcset(value, pageUrl, proxyOrigin) {
  return String(value || "")
    .split(",")
    .map((part) => {
      const piece = part.trim();
      if (!piece) return piece;
      const [url, ...rest] = piece.split(/\s+/);
      const next = proxifyUrl(url, pageUrl, proxyOrigin);
      return next ? [next, ...rest].join(" ") : piece;
    })
    .join(", ");
}
function proxifyUrl(raw, pageUrl, proxyOrigin) {
  const input = String(raw || "").trim();
  if (!input) return "";
  if (/^(data:|javascript:|mailto:|tel:|about:|blob:|#)/i.test(input)) return input;
  if (/^\/browse\/|^https?:\/\/[^/]+\/browse\//i.test(input)) return input;

  try {
    const absolute = new URL(input, pageUrl);
    if (absolute.protocol !== "http:" && absolute.protocol !== "https:") return input;
    return buildProxyUrl(absolute.href, proxyOrigin);
  } catch {
    return input;
  }
}
function buildProxyUrl(originalUrl, proxyOrigin) {
  const u = normalizeHttpUrl(originalUrl);
  if (!u) return originalUrl;
  const path = u.pathname && u.pathname.length ? u.pathname : "/";
  return `${proxyOrigin}/browse/${u.protocol.replace(":", "")}/${u.host}${path}${u.search || ""}${u.hash || ""}`;
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[m]);
}
function escapeHtmlAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}
function escapeRegExp(value) {
  return String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function decodePathSegment(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
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
function textLimitForUrl(url) {
  const u = String(url || "");
  if (/\.(html?|php|asp|aspx|jsp)(\?|#|$)/i.test(u)) return CONFIG.MAX_HTML;
  if (/\.css(\?|#|$)/i.test(u)) return CONFIG.MAX_CSS;
  if (/\.m?js(\?|#|$)/i.test(u)) return CONFIG.MAX_JS;
  return CONFIG.MAX_TEXT_PER_FILE;
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
function likelyTextUrl(url) {
  return /\.(html?|php|asp|aspx|jsp|css|js|mjs|json|xml|txt|svg|map)(\?|#|$)/i.test(url);
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
    if (u.origin !== rootOrigin && !u.href.startsWith(rootOrigin)) return null;
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
  const text = String(s);
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
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
      const num = n.startsWith("x") || n.startsWith("X") ? parseInt(n.slice(1), 16) : parseInt(n, 10);
      return Number.isFinite(num) ? String.fromCodePoint(num) : "";
    })
    .replace(/&([a-zA-Z]+);/g, (_, n) => map[n] || _);
}
function extractInlineBlocks(html) {
  const blocks = [];
  const text = String(html || "");

  let styleIndex = 0;
  for (const m of text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    const content = String(m[1] || "").trim();
    if (content) blocks.push({ kind: "css", index: styleIndex++, content });
  }

  let scriptIndex = 0;
  for (const m of text.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
    const content = String(m[1] || "").trim();
    if (content) blocks.push({ kind: "js", index: scriptIndex++, content });
  }

  return blocks;
}
function extractFromHtml(html, baseUrl, rootOrigin) {
  const out = { pages: [], links: [], assets: [], inlineBlocks: [] };
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

  const inlineStyles = [...htmlText.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1] || "");
  for (const css of inlineStyles) {
    const extracted = extractFromCss(css, baseUrl, rootOrigin);
    out.assets.push(...extracted.assets);
  }

  out.inlineBlocks = extractInlineBlocks(htmlText);

  return {
    pages: unique(out.pages),
    links: unique(out.links),
    assets: unique(out.assets),
    inlineBlocks: out.inlineBlocks,
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
function renderTerminalTree(tree, rootUrl) {
  const siteLabel = siteLabelFromUrl(rootUrl);
  const lines = [`(${siteLabel})`];
  const rootEntries = sortTreeEntries(tree);
  if (!rootEntries.length) return `(${siteLabel})\n└──`;
  rootEntries.forEach(([key, node], index) => {
    renderTreeBranch(key, node, "", index === rootEntries.length - 1, lines);
  });
  return lines.join("\n");
}
function renderTreeBranch(label, node, prefix, isLast, lines) {
  const connector = isLast ? "└── " : "├── ";
  lines.push(`${prefix}${connector}${label}`);
  const children = sortTreeEntries(node?.children || {});
  if (!children.length) return;
  const nextPrefix = prefix + (isLast ? "    " : "│   ");
  children.forEach(([childLabel, childNode], index) => {
    renderTreeBranch(childLabel, childNode, nextPrefix, index === children.length - 1, lines);
  });
}
function sortTreeEntries(obj) {
  return Object.entries(obj || {}).sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
  );
}
function siteLabelFromUrl(rootUrl) {
  try {
    const u = new URL(rootUrl);
    return u.host || u.hostname || u.origin || "Site";
  } catch {
    return String(rootUrl || "Site");
  }
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
