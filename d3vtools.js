const MAX_ASSETS = 12;
const MAX_TEXT_PER_ASSET = 180000;
const MAX_HTML = 250000;
const MAX_VISIBLE_TEXT = 120000;
const USER_AGENT = 'Mozilla/5.0 (compatible; SourceInspector/1.0)';

const UI_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Source Inspector</title>
  <style>
    :root {
      --bg: #0b1020;
      --panel: #121a31;
      --panel-2: #0f162b;
      --line: rgba(255,255,255,.08);
      --text: #e8ecff;
      --muted: #9aa7d6;
      --accent: #7aa2ff;
      --good: #6ee7b7;
      --bad: #fb7185;
      --warn: #fbbf24;
      --shadow: 0 20px 60px rgba(0,0,0,.35);
      --radius: 18px;
      --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
      --sans: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: var(--sans);
      background: radial-gradient(1200px 800px at 20% 0%, rgba(122,162,255,.18), transparent 50%),
                  radial-gradient(900px 700px at 90% 20%, rgba(110,231,183,.09), transparent 45%),
                  var(--bg);
      color: var(--text);
    }
    .wrap { max-width: 1400px; margin: 0 auto; padding: 24px; }
    .hero {
      background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
      border: 1px solid var(--line);
      border-radius: 28px;
      padding: 22px;
      box-shadow: var(--shadow);
      backdrop-filter: blur(10px);
    }
    h1 { margin: 0 0 8px; font-size: clamp(28px, 4vw, 44px); letter-spacing: -0.03em; }
    .sub { color: var(--muted); margin: 0 0 18px; line-height: 1.55; }
    .toolbar {
      display: grid;
      grid-template-columns: 1fr 220px 160px 140px;
      gap: 12px;
    }
    @media (max-width: 980px) { .toolbar { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 640px) { .toolbar { grid-template-columns: 1fr; } }

    input, button, select, textarea {
      width: 100%;
      border: 1px solid var(--line);
      background: rgba(7,12,24,.72);
      color: var(--text);
      border-radius: 14px;
      padding: 14px 16px;
      font: inherit;
      outline: none;
    }
    input::placeholder, textarea::placeholder { color: #6f7aa8; }
    button {
      cursor: pointer;
      background: linear-gradient(135deg, rgba(122,162,255,.95), rgba(110,231,183,.88));
      color: #08111f;
      font-weight: 800;
      border: none;
    }
    button.secondary {
      background: rgba(255,255,255,.06);
      color: var(--text);
      border: 1px solid var(--line);
      font-weight: 700;
    }

    .meta {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin-top: 16px;
    }
    @media (max-width: 900px) { .meta { grid-template-columns: repeat(2, minmax(0,1fr)); } }
    @media (max-width: 520px) { .meta { grid-template-columns: 1fr; } }

    .card {
      background: rgba(16,24,47,.82);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 16px;
      box-shadow: var(--shadow);
    }
    .label { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .12em; }
    .value { margin-top: 6px; font-size: 15px; word-break: break-word; }

    .grid2 { display: grid; grid-template-columns: 1.2fr .8fr; gap: 16px; margin-top: 16px; }
    @media (max-width: 1100px) { .grid2 { grid-template-columns: 1fr; } }

    .section-title { display:flex; align-items:center; justify-content:space-between; gap: 10px; margin: 0 0 12px; }
    .section-title h2 { margin: 0; font-size: 18px; }

    .tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .tab {
      padding: 10px 14px;
      border-radius: 999px;
      background: rgba(255,255,255,.05);
      border: 1px solid var(--line);
      cursor: pointer;
      user-select: none;
      font-size: 14px;
    }
    .tab.active { background: rgba(122,162,255,.2); border-color: rgba(122,162,255,.45); }

    .panel {
      background: rgba(7,12,24,.8);
      border: 1px solid var(--line);
      border-radius: 18px;
      overflow: hidden;
    }
    .panel pre, .panel .text {
      margin: 0;
      padding: 16px;
      white-space: pre-wrap;
      word-break: break-word;
      overflow-wrap: anywhere;
      font-family: var(--mono);
      font-size: 13px;
      line-height: 1.55;
      max-height: 70vh;
      overflow: auto;
    }
    .panel .text { font-family: var(--sans); }

    .muted { color: var(--muted); }
    .status { display:inline-flex; align-items:center; gap: 8px; padding: 8px 12px; border-radius: 999px; background: rgba(255,255,255,.06); font-size: 13px; }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: var(--warn); }
    .dot.good { background: var(--good); }
    .dot.bad { background: var(--bad); }

    .resources { display: grid; gap: 10px; }
    .resource {
      background: rgba(255,255,255,.04);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 12px;
    }
    .resource .top { display:flex; justify-content:space-between; gap: 12px; flex-wrap: wrap; }
    .resource .url { word-break: break-all; font-family: var(--mono); font-size: 12px; color: #c7d2fe; margin-top: 6px; }
    .pill { display:inline-block; padding: 5px 9px; border-radius: 999px; background: rgba(255,255,255,.06); font-size: 12px; }

    mark { background: rgba(251,191,36,.35); color: inherit; padding: 0 2px; border-radius: 3px; }
    .search-hit { padding: 10px 12px; border-radius: 12px; border: 1px solid var(--line); background: rgba(255,255,255,.04); margin-bottom: 10px; }
    .search-hit .src { color: var(--muted); font-size: 12px; margin-bottom: 6px; word-break: break-word; }

    .footer-note { margin-top: 16px; color: var(--muted); font-size: 13px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hero">
      <h1>Source Inspector</h1>
      <p class="sub">Paste a URL, fetch its HTML plus linked CSS/JS, and search across the collected source text. This is source inspection, not a full browser engine.</p>

      <form id="form" class="toolbar">
        <input id="url" type="url" placeholder="https://example.com" autocomplete="off" spellcheck="false" />
        <input id="term" type="text" placeholder="Search text in source" autocomplete="off" spellcheck="false" />
        <button type="submit">Inspect</button>
        <button type="button" id="reset" class="secondary">Reset</button>
      </form>

      <div class="meta" id="meta"></div>
    </div>

    <div class="grid2">
      <div class="card">
        <div class="section-title">
          <h2>Source panels</h2>
          <span class="status" id="status"><span class="dot"></span><span id="statusText">Idle</span></span>
        </div>
        <div class="tabs" id="tabs"></div>
        <div class="panel" id="panel"><pre class="muted">Paste a link and inspect it.</pre></div>
      </div>

      <div class="card">
        <div class="section-title">
          <h2>Search matches</h2>
          <button id="searchBtn" type="button" class="secondary" style="width:auto; padding:10px 14px;">Search</button>
        </div>
        <div class="panel"><div class="text" id="searchResults">No results yet.</div></div>
      </div>
    </div>

    <div class="card" style="margin-top:16px;">
      <div class="section-title">
        <h2>Resources</h2>
        <span class="muted" id="resourceCount"></span>
      </div>
      <div class="resources" id="resources"></div>
    </div>

    <div class="footer-note">
      Runtime DOM, network calls made after load, and pages protected by anti-bot rules may differ from what this inspector fetches. A browser-level devtools clone needs a headless browser backend.
    </div>
  </div>

  <script>
    const state = { data: null, tab: 'html' };
    const $ = (s) => document.querySelector(s);
    const esc = (s) => String(s ?? '').replace(/[&<>\"']/g, (m) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#39;' }[m]));

    function setStatus(text, kind) {
      const dot = $('#status .dot');
      dot.className = 'dot' + (kind ? ' ' + kind : '');
      $('#statusText').textContent = text;
    }

    function summaryCard(label, value) {
      return '<div class="card"><div class="label">' + esc(label) + '</div><div class="value">' + esc(value || '—') + '</div></div>';
    }

    function makeTabs() {
      const items = [
        ['html', 'HTML'],
        ['visibleText', 'Visible text'],
        ['inlineStyles', 'Inline CSS'],
        ['fetchedStyles', 'Fetched CSS'],
        ['inlineScripts', 'Inline JS'],
        ['fetchedScripts', 'Fetched JS']
      ];
      $('#tabs').innerHTML = items.map(([id, label]) => '<div class="tab' + (state.tab === id ? ' active' : '') + '" data-tab="' + id + '">' + label + '</div>').join('');
      document.querySelectorAll('.tab').forEach((el) => {
        el.addEventListener('click', () => {
          state.tab = el.dataset.tab;
          makeTabs();
          renderPanel();
        });
      });
    }

    function renderPanel() {
      const d = state.data;
      if (!d) {
        $('#panel').innerHTML = '<pre class="muted">Paste a link and inspect it.</pre>';
        return;
      }
      const items = {
        html: d.html || '',
        visibleText: d.visibleText || '',
        inlineStyles: (d.inlineStyles || []).map((x, i) => '\\n/* inline style ' + (i + 1) + ' */\\n' + x).join('\\n\\n'),
        fetchedStyles: (d.fetchedStyles || []).map((x) => '\\n/* ' + x.url + ' */\\n' + (x.content || '')).join('\\n\\n'),
        inlineScripts: (d.inlineScripts || []).map((x, i) => '\\n// inline script ' + (i + 1) + '\\n' + x).join('\\n\\n'),
        fetchedScripts: (d.fetchedScripts || []).map((x) => '\\n// ' + x.url + '\\n' + (x.content || '')).join('\\n\\n')
      };
      const text = items[state.tab] || '';
      $('#panel').innerHTML = '<pre>' + esc(text || 'No data for this section.') + '</pre>';
    }

    function renderMeta(d) {
      $('#meta').innerHTML = [
        summaryCard('Title', d.title),
        summaryCard('Status', String(d.status || '—')),
        summaryCard('Final URL', d.finalUrl),
        summaryCard('Assets', String((d.resources || []).length))
      ].join('');
      $('#resourceCount').textContent = (d.resources || []).length + ' total';
    }

    function escapeRegExp(s) {
      return String(s)
        .replaceAll('\\\\', '\\\\\\\\')
        .replaceAll('.', '\\\\.')
        .replaceAll('*', '\\\\*')
        .replaceAll('+', '\\\\+')
        .replaceAll('?', '\\\\?')
        .replaceAll('^', '\\\\^')
        .replaceAll('$', '\\\\$')
        .replaceAll('{', '\\\\{')
        .replaceAll('}', '\\\\}')
        .replaceAll('(', '\\\\(')
        .replaceAll(')', '\\\\)')
        .replaceAll('|', '\\\\|')
        .replaceAll('[', '\\\\[')
        .replaceAll(']', '\\\\]');
    }

    function snippet(content, term) {
      const lower = content.toLowerCase();
      const t = term.toLowerCase().trim();
      const idx = lower.indexOf(t);
      if (idx === -1) return '';
      const start = Math.max(0, idx - 140);
      const end = Math.min(content.length, idx + t.length + 180);
      return esc(content.slice(start, end)).replace(new RegExp(escapeRegExp(term), 'ig'), '<mark>$&</mark>');
    }

    function runSearch() {
      const d = state.data;
      const term = $('#term').value.trim();
      if (!d || !term) {
        $('#searchResults').textContent = d ? 'Type a search term.' : 'No results yet.';
        return;
      }
      const corpus = [
        ['HTML source', d.html || '', d.finalUrl],
        ['Visible text', d.visibleText || '', d.finalUrl],
        ...((d.inlineStyles || []).map((x, i) => ['Inline CSS ' + (i + 1), x, 'inline'])),
        ...((d.fetchedStyles || []).map((x, i) => ['Fetched CSS ' + (i + 1), x.content || '', x.url])),
        ...((d.inlineScripts || []).map((x, i) => ['Inline JS ' + (i + 1), x, 'inline'])),
        ...((d.fetchedScripts || []).map((x, i) => ['Fetched JS ' + (i + 1), x.content || '', x.url]))
      ];
      const hits = [];
      corpus.forEach(([label, content, src]) => {
        const text = String(content || '');
        const idx = text.toLowerCase().indexOf(term.toLowerCase());
        if (idx !== -1) hits.push({ label, src, content: text });
      });
      if (!hits.length) {
        $('#searchResults').innerHTML = '<div class="muted">No matches found.</div>';
        return;
      }
      $('#searchResults').innerHTML = hits.slice(0, 25).map((hit) => {
        const snip = snippet(String(hit.content), term);
        return '<div class="search-hit"><div class="src"><strong>' + esc(hit.label) + '</strong> · ' + esc(hit.src || '') + '</div><div>' + (snip || 'Match found.') + '</div></div>';
      }).join('');
    }

    async function inspect() {
      const url = $('#url').value.trim();
      const term = $('#term').value.trim();
      if (!url) return setStatus('Enter a URL', 'bad');
      setStatus('Fetching…', '');
      $('#searchResults').textContent = 'Working…';
      try {
        const res = await fetch('/api/analyze?url=' + encodeURIComponent(url) + '&q=' + encodeURIComponent(term));
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || 'Request failed');
        state.data = data;
        state.tab = 'html';
        renderMeta(data);
        makeTabs();
        renderPanel();
        runSearch();
        $('#resources').innerHTML = (data.resources || []).map((r) => (
          '<div class="resource"><div class="top"><span class="pill">' + esc(r.kind || 'resource') + '</span><span class="pill">' + esc(String(r.status || '')) + '</span><span class="pill">' + esc(r.contentType || 'unknown') + '</span></div><div class="url">' + esc(r.url) + '</div></div>'
        )).join('') || '<div class="muted">No resources collected.</div>';
        setStatus('Loaded', 'good');
      } catch (err) {
        setStatus('Failed', 'bad');
        $('#panel').innerHTML = '<pre>' + esc(String(err.message || err)) + '</pre>';
        $('#searchResults').innerHTML = '<div class="muted">No results.</div>';
      }
    }

    $('#form').addEventListener('submit', (e) => { e.preventDefault(); inspect(); });
    $('#searchBtn').addEventListener('click', runSearch);
    $('#reset').addEventListener('click', () => {
      state.data = null;
      $('#url').value = '';
      $('#term').value = '';
      $('#meta').innerHTML = '';
      $('#resources').innerHTML = '';
      $('#searchResults').textContent = 'No results yet.';
      state.tab = 'html';
      makeTabs();
      renderPanel();
      setStatus('Idle', '');
    });
    makeTabs();
  </script>
</body>
</html>`;

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/api/analyze') {
      return handleAnalyze(request);
    }

    if (url.pathname === '/api/raw') {
      return handleRaw(request);
    }

    return new Response(UI_HTML, {
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }
    });
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

async function handleAnalyze(request) {
  try {
    const u = new URL(request.url);
    const target = u.searchParams.get('url') || (request.method === 'POST' ? await readUrlFromBody(request) : '');
    if (!target) return json({ ok: false, error: 'Missing url' }, 400);

    const query = u.searchParams.get('q') || '';
    const page = await collectSite(target);
    const search = query ? searchCorpus(page, query) : [];
    return json({ ok: true, ...page, search });
  } catch (err) {
    return json({ ok: false, error: String(err?.message || err) }, 500);
  }
}

async function handleRaw(request) {
  const u = new URL(request.url);
  const target = u.searchParams.get('url');
  if (!target) return json({ ok: false, error: 'Missing url' }, 400);
  const value = await fetchText(target, MAX_TEXT_PER_ASSET * 2);
  return new Response(value.content || '', {
    status: value.status,
    headers: {
      'content-type': value.contentType || 'text/plain; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

async function readUrlFromBody(request) {
  const ct = request.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const body = await request.json();
    return body?.url || '';
  }
  const text = await request.text();
  try {
    const body = JSON.parse(text);
    return body?.url || '';
  } catch {
    return text.trim();
  }
}

async function collectSite(target) {
  const start = normalizeHttpUrl(target);
  if (!start) throw new Error('Only http and https URLs are allowed');
  if (isBlockedHost(start.hostname)) throw new Error('That host is not allowed');

  const main = await fetchText(start.href, MAX_HTML);
  if (!main.content) throw new Error('Empty response');

  const html = main.content;
  const finalUrl = main.finalUrl || start.href;
  const base = finalUrl;

  const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description =
    firstMatch(html, /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
    firstMatch(html, /<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  const charset = firstMatch(html, /<meta[^>]+charset=["']?([^"'\s>]+)/i);

  const inlineStyles = extractMatches(html, /<style\b[^>]*>([\s\S]*?)<\/style>/gi, MAX_TEXT_PER_ASSET).map(cleanText);
  const inlineScripts = extractMatches(html, /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi, MAX_TEXT_PER_ASSET).map(cleanText);

  const styleUrls = uniqueUrls(
    extractAttrUrls(html, /<link\b[^>]*rel=["'][^"']*stylesheet[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>/gi, base)
  );
  const scriptUrls = uniqueUrls(
    extractAttrUrls(html, /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>|<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi, base)
  );

  const fetchedStyles = [];
  const fetchedScripts = [];
  const resources = [
    { url: finalUrl, kind: 'html', status: main.status, contentType: main.contentType, size: html.length }
  ];

  for (const url of styleUrls.slice(0, MAX_ASSETS)) {
    const item = await fetchText(url, MAX_TEXT_PER_ASSET);
    resources.push({ url, kind: 'css', status: item.status, contentType: item.contentType, size: item.content?.length || 0 });
    if (item.content) fetchedStyles.push({ url, content: cleanText(item.content), status: item.status });
  }

  for (const url of scriptUrls.slice(0, MAX_ASSETS)) {
    const item = await fetchText(url, MAX_TEXT_PER_ASSET);
    resources.push({ url, kind: 'js', status: item.status, contentType: item.contentType, size: item.content?.length || 0 });
    if (item.content) fetchedScripts.push({ url, content: cleanText(item.content), status: item.status });
  }

  const visibleText = cleanText(stripTags(html)).slice(0, MAX_VISIBLE_TEXT);

  return {
    targetUrl: start.href,
    finalUrl,
    status: main.status,
    title: cleanText(title),
    description: cleanText(description),
    charset: cleanText(charset),
    html: cleanText(html).slice(0, MAX_HTML),
    visibleText,
    inlineStyles,
    inlineScripts,
    fetchedStyles,
    fetchedScripts,
    resources
  };
}

async function fetchText(url, limit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), 12000);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': USER_AGENT,
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/css,*/*;q=0.8'
      }
    });
    const contentType = res.headers.get('content-type') || '';
    let text = '';
    if (isTextLike(contentType)) {
      text = await res.text();
      if (text.length > limit) text = text.slice(0, limit) + '\n\n/* truncated */';
    }
    return {
      status: res.status,
      finalUrl: res.url,
      contentType,
      content: text
    };
  } catch (err) {
    return {
      status: 0,
      finalUrl: url,
      contentType: '',
      content: `/* fetch failed: ${String(err?.message || err)} */`
    };
  } finally {
    clearTimeout(timer);
  }
}

function searchCorpus(page, term) {
  const q = term.trim().toLowerCase();
  if (!q) return [];
  const corpus = [
    { label: 'HTML source', source: page.finalUrl, content: page.html || '' },
    { label: 'Visible text', source: page.finalUrl, content: page.visibleText || '' },
    ...(page.inlineStyles || []).map((content, i) => ({ label: `Inline CSS ${i + 1}`, source: 'inline', content })),
    ...(page.fetchedStyles || []).map((x, i) => ({ label: `Fetched CSS ${i + 1}`, source: x.url, content: x.content || '' })),
    ...(page.inlineScripts || []).map((content, i) => ({ label: `Inline JS ${i + 1}`, source: 'inline', content })),
    ...(page.fetchedScripts || []).map((x, i) => ({ label: `Fetched JS ${i + 1}`, source: x.url, content: x.content || '' }))
  ];

  const hits = [];
  for (const item of corpus) {
    const text = String(item.content || '');
    const idx = text.toLowerCase().indexOf(q);
    if (idx !== -1) {
      const start = Math.max(0, idx - 160);
      const end = Math.min(text.length, idx + q.length + 220);
      hits.push({
        label: item.label,
        source: item.source,
        snippet: text.slice(start, end)
      });
    }
  }
  return hits.slice(0, 40);
}

function extractAttrUrls(html, regex, base) {
  const out = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const raw = match[1] || match[2] || '';
    if (!raw) continue;
    try {
      out.push(new URL(raw, base).href);
    } catch {}
  }
  return out;
}

function uniqueUrls(list) {
  return [...new Set(list.filter(Boolean))];
}

function extractMatches(html, regex, maxLen) {
  const out = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const s = match[1] || '';
    out.push(s.length > maxLen ? s.slice(0, maxLen) : s);
  }
  return out;
}

function firstMatch(text, regex) {
  const m = text.match(regex);
  return m ? m[1] || '' : '';
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ');
}

function cleanText(text) {
  return decodeEntities(String(text || ''))
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function decodeEntities(s) {
  const map = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' '
  };
  return String(s)
    .replace(/&#(x?[0-9a-fA-F]+);/g, (_, n) => {
      const num = n.startsWith('x') || n.startsWith('X') ? parseInt(n.slice(1), 16) : parseInt(n, 10);
      return Number.isFinite(num) ? String.fromCodePoint(num) : _;
    })
    .replace(/&([a-zA-Z]+);/g, (_, n) => map[n] || _);
}

function normalizeHttpUrl(input) {
  try {
    const u = new URL(String(input).trim());
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u;
  } catch {
    return null;
  }
}

function isTextLike(contentType) {
  const ct = String(contentType || '').toLowerCase();
  return ct.includes('text/') || ct.includes('javascript') || ct.includes('json') || ct.includes('xml') || ct.includes('svg') || ct.includes('x-www-form-urlencoded');
}

function isBlockedHost(hostname) {
  const h = String(hostname || '').toLowerCase();
  if (!h) return true;
  if (h === 'localhost' || h.endsWith('.localhost')) return true;
  if (h === '::1' || h === '[::1]') return true;
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