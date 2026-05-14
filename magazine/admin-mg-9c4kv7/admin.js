// 매거진 글 관리 admin — GitHub PAT 기반 (서버리스)
// 외부 JS로 분리한 이유: Astro `<script is:inline>` 가 JS 템플릿 리터럴 `${...}` 를
// Astro 표현식으로 잘못 파싱하는 이슈 우회.
(function () {
  const REPO = 'villagebaby-ai/villagebaby-ai';
  const BRANCH = 'main';
  const ARTICLE_DIR = 'magazine-src/src/content/articles';
  const TOKEN_KEY = 'vb_magazine_admin_token';

  const $ = (id) => document.getElementById(id);
  const tokenInput = $('token-input');
  const tokenStatus = $('token-status');
  const listPanel = $('list-panel');
  const articleList = $('article-list');
  const editorPanel = $('editor-panel');
  const saveStatus = $('save-status');
  const saveError = $('save-error');
  const faqList = $('faq-list');

  let editingSha = null;
  let editingPath = null;

  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
  function clearToken() { localStorage.removeItem(TOKEN_KEY); }

  async function gh(path, opts = {}) {
    const token = getToken();
    if (!token) throw new Error('No token');
    const res = await fetch('https://api.github.com' + path, {
      ...opts,
      headers: Object.assign({
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      }, opts.headers || {}),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error('GitHub ' + res.status + ': ' + body.slice(0, 200));
    }
    return res.json();
  }

  async function verifyToken() {
    try {
      await gh('/repos/' + REPO);
      tokenStatus.textContent = '✓ 토큰 인증 성공 — 글 목록을 불러오는 중…';
      tokenStatus.className = 'adm-status adm-status-ok';
      listPanel.hidden = false;
      await loadList();
    } catch (e) {
      tokenStatus.textContent = '✗ 인증 실패: ' + e.message;
      tokenStatus.className = 'adm-status adm-status-err';
      listPanel.hidden = true;
    }
  }

  $('token-save').onclick = function () {
    const v = tokenInput.value.trim();
    if (!v) return;
    setToken(v);
    tokenInput.value = '••••••••';
    verifyToken();
  };
  $('token-clear').onclick = function () {
    clearToken();
    tokenInput.value = '';
    tokenStatus.textContent = '';
    listPanel.hidden = true;
    editorPanel.hidden = true;
  };

  async function loadList() {
    const pillarFilter = $('filter-pillar').value;
    articleList.innerHTML = '<li>불러오는 중…</li>';
    try {
      const pillars = pillarFilter ? [pillarFilter] : ['pregnancy', 'newborn', 'toddler', 'school', 'teen', 'case'];
      const all = [];
      for (const p of pillars) {
        try {
          const items = await gh('/repos/' + REPO + '/contents/' + ARTICLE_DIR + '/' + p + '?ref=' + BRANCH);
          if (Array.isArray(items)) {
            for (const it of items) {
              if (it.type === 'file' && it.name.endsWith('.mdx')) {
                all.push({ pillar: p, name: it.name, path: it.path, sha: it.sha, size: it.size });
              }
            }
          }
        } catch (e) { /* pillar dir 없을 수 있음 */ }
      }
      if (all.length === 0) {
        articleList.innerHTML = '<li class="adm-empty">아직 글이 없습니다.</li>';
        return;
      }
      articleList.innerHTML = '';
      for (const a of all) {
        const li = document.createElement('li');
        li.className = 'adm-list-item';
        const slug = a.name.replace(/\.mdx$/, '');
        const meta = document.createElement('div');
        meta.className = 'adm-li-meta';
        const pillarTag = document.createElement('span');
        pillarTag.className = 'adm-li-pillar';
        pillarTag.textContent = a.pillar;
        const slugSpan = document.createElement('span');
        slugSpan.className = 'adm-li-slug';
        slugSpan.textContent = slug;
        meta.appendChild(pillarTag);
        meta.appendChild(slugSpan);

        const actions = document.createElement('div');
        actions.className = 'adm-li-actions';
        const preview = document.createElement('a');
        preview.href = '/magazine/' + a.pillar + '/' + encodeURIComponent(slug) + '/';
        preview.target = '_blank';
        preview.className = 'adm-btn adm-btn-ghost';
        preview.textContent = '미리보기';
        const editBtn = document.createElement('button');
        editBtn.className = 'adm-btn edit-btn';
        editBtn.textContent = '편집';
        editBtn.onclick = function () { editArticle(a.path, a.sha); };
        actions.appendChild(preview);
        actions.appendChild(editBtn);

        li.appendChild(meta);
        li.appendChild(actions);
        articleList.appendChild(li);
      }
    } catch (e) {
      articleList.innerHTML = '<li class="adm-error">' + e.message + '</li>';
    }
  }
  $('reload-list').onclick = loadList;
  $('filter-pillar').onchange = loadList;

  function openEditor(title) {
    editorPanel.hidden = false;
    $('editor-title').textContent = title;
    editorPanel.scrollIntoView({ behavior: 'smooth' });
  }
  function clearEditor() {
    ['f-title', 'f-slug', 'f-intent', 'f-keywords', 'f-description', 'f-cover', 'f-body'].forEach(function (id) { $(id).value = ''; });
    $('f-pillar').value = 'pregnancy';
    $('f-type').value = 'cluster';
    $('f-publishedAt').value = new Date().toISOString().slice(0, 10);
    faqList.innerHTML = '';
    addFaqRow();
    editingSha = null;
    editingPath = null;
    saveStatus.textContent = '';
    saveError.hidden = true;
  }

  function addFaqRow(q, a) {
    q = q || '';
    a = a || '';
    const div = document.createElement('div');
    div.className = 'adm-faq-row';
    const qInput = document.createElement('input');
    qInput.className = 'faq-q';
    qInput.type = 'text';
    qInput.placeholder = '질문';
    qInput.value = q;
    const aInput = document.createElement('textarea');
    aInput.className = 'faq-a';
    aInput.rows = 2;
    aInput.placeholder = '답변';
    aInput.value = a;
    const rm = document.createElement('button');
    rm.type = 'button';
    rm.className = 'adm-btn adm-btn-ghost remove-faq';
    rm.textContent = '삭제';
    rm.onclick = function () { div.remove(); };
    div.appendChild(qInput);
    div.appendChild(aInput);
    div.appendChild(rm);
    faqList.appendChild(div);
  }
  $('add-faq').onclick = function () { addFaqRow(); };

  $('new-article').onclick = function () {
    clearEditor();
    openEditor('③ 새 글 작성');
  };
  $('cancel-edit').onclick = function () { editorPanel.hidden = true; };

  async function editArticle(path, sha) {
    clearEditor();
    editingSha = sha;
    editingPath = path;
    const data = await gh('/repos/' + REPO + '/contents/' + path + '?ref=' + BRANCH);
    const raw = atob(data.content.replace(/\n/g, ''));
    const decoded = new TextDecoder('utf-8').decode(Uint8Array.from(raw, function (c) { return c.charCodeAt(0); }));
    const parsed = parseMdx(decoded);
    $('f-title').value = parsed.fm.title || '';
    $('f-slug').value = path.split('/').pop().replace(/\.mdx$/, '');
    $('f-pillar').value = parsed.fm.pillar || 'pregnancy';
    $('f-type').value = parsed.fm.type || 'cluster';
    $('f-intent').value = (parsed.fm.intent || []).join(', ');
    $('f-keywords').value = (parsed.fm.keywords || []).join(', ');
    $('f-description').value = parsed.fm.description || '';
    $('f-publishedAt').value = (parsed.fm.publishedAt || '').slice(0, 10);
    $('f-cover').value = parsed.fm.cover || '';
    $('f-body').value = parsed.body;
    faqList.innerHTML = '';
    const faqs = parsed.fm.faq || [];
    for (let i = 0; i < faqs.length; i++) addFaqRow(faqs[i].q, faqs[i].a);
    if (faqs.length === 0) addFaqRow();
    openEditor('③ 수정: ' + (parsed.fm.title || ''));
  }

  function parseMdx(text) {
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!m) return { fm: {}, body: text };
    const fm = {};
    let curKey = null;
    let curArr = null;
    let inFaq = false;
    let faqs = [];
    let curFaq = null;
    const lines = m[1].split(/\r?\n/);
    for (const line of lines) {
      if (/^[a-zA-Z]+:/.test(line)) {
        const idx = line.indexOf(':');
        const k = line.slice(0, idx);
        const v = line.slice(idx + 1).trim();
        curKey = k;
        inFaq = (k === 'faq');
        if (inFaq) { faqs = []; curFaq = null; }
        else if (v === '') { curArr = []; fm[k] = curArr; }
        else { fm[k] = stripQuotes(v); curArr = null; }
      } else if (inFaq) {
        if (/^\s*-\s+q:/.test(line)) {
          curFaq = { q: stripQuotes(line.replace(/^\s*-\s+q:\s*/, '')), a: '' };
          faqs.push(curFaq);
        } else if (/^\s+a:/.test(line) && curFaq) {
          curFaq.a = stripQuotes(line.replace(/^\s+a:\s*/, ''));
        }
      } else if (curArr && /^\s*-\s+/.test(line)) {
        curArr.push(stripQuotes(line.replace(/^\s*-\s+/, '')));
      }
    }
    if (faqs.length) fm.faq = faqs;
    return { fm: fm, body: m[2] };
  }
  function stripQuotes(s) { return s.replace(/^['"]|['"]$/g, ''); }
  function yamlString(s) {
    if (!s) return '""';
    if (/[:'"#\n\[\]{}|>*&!%@`?]/.test(s)) {
      return "'" + s.replace(/'/g, "''") + "'";
    }
    return s;
  }

  function buildMdx(fields, draft) {
    const faqs = [];
    const rows = faqList.querySelectorAll('.adm-faq-row');
    for (let i = 0; i < rows.length; i++) {
      const q = rows[i].querySelector('.faq-q').value.trim();
      const a = rows[i].querySelector('.faq-a').value.trim();
      if (q && a) faqs.push({ q: q, a: a });
    }
    const intent = fields.intent.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    const keywords = fields.keywords.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    let fm = '---\n';
    fm += 'title: ' + yamlString(fields.title) + '\n';
    fm += 'description: ' + yamlString(fields.description) + '\n';
    fm += 'pillar: ' + fields.pillar + '\n';
    fm += 'type: ' + fields.type + '\n';
    if (intent.length) {
      fm += 'intent:\n';
      intent.forEach(function (i) { fm += '  - ' + i + '\n'; });
    }
    if (keywords.length) {
      fm += 'keywords:\n';
      keywords.forEach(function (k) { fm += '  - ' + yamlString(k) + '\n'; });
    }
    fm += 'publishedAt: ' + fields.publishedAt + '\n';
    fm += 'reviewedBy: 베이비빌리 보험 자문단\n';
    fm += 'author: 베이비빌리 매거진 편집팀\n';
    fm += 'leadTool: fit-check\n';
    if (fields.cover) fm += 'cover: ' + yamlString(fields.cover) + '\n';
    fm += 'draft: ' + draft + '\n';
    if (faqs.length) {
      fm += 'faq:\n';
      faqs.forEach(function (f) {
        fm += '  - q: ' + yamlString(f.q) + '\n';
        fm += '    a: ' + yamlString(f.a) + '\n';
      });
    }
    fm += '---\n\n';
    return fm + fields.body.trim() + '\n';
  }

  async function save(draft) {
    saveStatus.textContent = '저장 중…';
    saveStatus.className = 'adm-status';
    saveError.hidden = true;
    try {
      const fields = {
        title: $('f-title').value.trim(),
        slug: $('f-slug').value.trim(),
        pillar: $('f-pillar').value,
        type: $('f-type').value,
        intent: $('f-intent').value,
        keywords: $('f-keywords').value,
        description: $('f-description').value.trim(),
        publishedAt: $('f-publishedAt').value,
        cover: $('f-cover').value.trim(),
        body: $('f-body').value,
      };
      if (!fields.title || !fields.slug || !fields.description || !fields.publishedAt || !fields.body) {
        throw new Error('필수 항목이 비어 있어요 (제목/슬러그/설명/발행일/본문).');
      }
      const mdx = buildMdx(fields, draft);
      const path = editingPath || (ARTICLE_DIR + '/' + fields.pillar + '/' + fields.slug + '.mdx');
      const bytes = new TextEncoder().encode(mdx);
      const b64 = btoa(String.fromCharCode.apply(null, bytes));
      const body = {
        message: (editingSha ? 'edit' : 'feat') + '(magazine): ' + (editingSha ? '수정' : '작성') + ' — ' + fields.title,
        content: b64,
        branch: BRANCH,
      };
      if (editingSha) body.sha = editingSha;
      const res = await gh('/repos/' + REPO + '/contents/' + path, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      editingSha = res.content.sha;
      editingPath = res.content.path;
      saveStatus.textContent = '✓ 저장 완료 (' + res.commit.sha.slice(0, 7) + ') — GitHub Actions가 매거진을 재빌드해요. 1~2분 후 라이브 반영.';
      saveStatus.className = 'adm-status adm-status-ok';
      loadList();
    } catch (e) {
      saveStatus.textContent = '✗ 저장 실패';
      saveStatus.className = 'adm-status adm-status-err';
      saveError.hidden = false;
      saveError.textContent = e.message;
    }
  }
  $('save-draft').onclick = function () { save(true); };
  $('save-publish').onclick = function () { save(false); };

  const saved = getToken();
  if (saved) {
    tokenInput.value = '••••••••';
    verifyToken();
  }
})();
