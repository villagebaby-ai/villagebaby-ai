/* ============================================================
   빌리지점 배서 보드 — 공통 앱 로직
   - 역할 전환 (헤더 드롭다운)
   - localStorage 기반 데이터 (seed + 사용자 변경분)
   - 공통 유틸 (포맷·검증·토스트·모달)
   ============================================================ */
(function () {
  'use strict';

  const LS_KEY_USER = 'vbe.currentUser';
  const LS_KEY_REQ = 'vbe.requests';
  const LS_KEY_LOG = 'vbe.logs';
  const LS_KEY_SEEDED = 'vbe.seeded.v1';

  /* ---------- 시드 부트스트랩 ---------- */
  function bootstrap() {
    if (!localStorage.getItem(LS_KEY_SEEDED)) {
      localStorage.setItem(LS_KEY_REQ, JSON.stringify(window.MOCK_SEED.requests));
      localStorage.setItem(LS_KEY_LOG, JSON.stringify(window.MOCK_SEED.logs));
      localStorage.setItem(LS_KEY_SEEDED, '1');
    }
    if (!localStorage.getItem(LS_KEY_USER)) {
      /* 기본은 상담사 김지원 */
      localStorage.setItem(LS_KEY_USER, 'kim.jw@example.villagebaby.kr');
    }
  }

  /* ---------- 데이터 접근 ---------- */
  const DB = {
    users() { return window.MOCK_SEED.users; },
    requests() { return JSON.parse(localStorage.getItem(LS_KEY_REQ) || '[]'); },
    saveRequests(arr) { localStorage.setItem(LS_KEY_REQ, JSON.stringify(arr)); },
    logs() { return JSON.parse(localStorage.getItem(LS_KEY_LOG) || '[]'); },
    saveLogs(arr) { localStorage.setItem(LS_KEY_LOG, JSON.stringify(arr)); },
    currentUserEmail() { return localStorage.getItem(LS_KEY_USER); },
    setCurrentUser(email) { localStorage.setItem(LS_KEY_USER, email); },
    currentUser() {
      const email = this.currentUserEmail();
      return this.users().find(u => u.email === email) || this.users()[0];
    },
    userByEmail(email) {
      return this.users().find(u => u.email === email);
    },
    reset() {
      localStorage.removeItem(LS_KEY_REQ);
      localStorage.removeItem(LS_KEY_LOG);
      localStorage.removeItem(LS_KEY_SEEDED);
      bootstrap();
    },
  };

  /* ---------- 유틸 ---------- */
  function fmtDate(iso, opts = {}) {
    if (!iso) return '-';
    const d = new Date(iso);
    const pad = n => String(n).padStart(2, '0');
    const Y = d.getFullYear(), M = pad(d.getMonth() + 1), D = pad(d.getDate());
    const h = pad(d.getHours()), m = pad(d.getMinutes());
    if (opts.dateOnly) return `${Y}-${M}-${D}`;
    return `${Y}-${M}-${D} ${h}:${m}`;
  }

  function fmtRelative(iso) {
    if (!iso) return '-';
    const now = new Date('2026-05-14T18:00:00+09:00').getTime();
    const t = new Date(iso).getTime();
    const diff = (now - t) / 1000;
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 86400 * 14) return `${Math.floor(diff / 86400)}일 전`;
    return fmtDate(iso, { dateOnly: true });
  }

  function generateRequestId(submittedAt = new Date().toISOString()) {
    const d = new Date(submittedAt);
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const seq = String(DB.requests().length + 1).padStart(4, '0');
    return `VBE-${yy}${mm}${dd}-${seq}`;
  }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- 헤더 (역할 전환) ---------- */
  function renderHeader(activePage) {
    const user = DB.currentUser();
    const users = DB.users();
    const role = user.role;
    const navItems = [
      { key: 'submit', label: '제출', href: 'submit.html', roles: ['상담사', '총무', '관리자'] },
      { key: 'my',     label: '내 요청', href: 'my.html',  roles: ['상담사', '총무', '관리자'] },
      { key: 'board',  label: '처리 보드', href: 'board.html', roles: ['총무', '관리자'] },
      { key: 'admin',  label: '관리자',  href: 'admin.html', roles: ['관리자'] },
    ];

    const navHtml = navItems
      .filter(item => item.roles.includes(role))
      .map(item => `<a class="nav-item ${activePage === item.key ? 'active' : ''}" href="${item.href}">${item.label}</a>`)
      .join('');

    const userOptions = users
      .map(u => `<option value="${u.email}" ${u.email === user.email ? 'selected' : ''}>${escapeHtml(u.name)} (${u.role})</option>`)
      .join('');

    const header = document.createElement('header');
    header.className = 'app-header';
    header.innerHTML = `
      <div class="app-header-inner">
        <a class="brand" href="index.html">
          <span class="brand-mark">VBE</span>
          <span class="brand-text">빌리지점 배서 보드 <span class="brand-tag">목업 v0.1</span></span>
        </a>
        <nav class="app-nav">${navHtml}</nav>
        <div class="role-switch">
          <label class="role-switch-label">테스트 모드</label>
          <select id="vbe-role-switch" class="role-switch-select" aria-label="현재 사용자 전환">
            ${userOptions}
          </select>
        </div>
      </div>
      <div class="mockup-banner" role="note">
        ⚠️ 이 페이지는 사양 검토용 목업입니다. 모든 데이터는 가공된 가짜 데이터이며, 어떤 정보도 저장·전송되지 않습니다.
      </div>
    `;
    document.body.insertBefore(header, document.body.firstChild);

    document.getElementById('vbe-role-switch').addEventListener('change', e => {
      DB.setCurrentUser(e.target.value);
      location.reload();
    });
  }

  /* ---------- 권한 가드 ---------- */
  function requireRole(allowedRoles) {
    const user = DB.currentUser();
    if (!allowedRoles.includes(user.role)) {
      document.body.innerHTML = '';
      renderHeader(null);
      const wrap = document.createElement('div');
      wrap.className = 'page';
      wrap.innerHTML = `
        <div class="card error-card">
          <h2>접근 권한 없음</h2>
          <p>현재 로그인 사용자(<strong>${escapeHtml(user.name)} · ${user.role}</strong>)는 이 페이지에 접근할 수 없습니다.</p>
          <p>필요 권한: ${allowedRoles.join(' 또는 ')}</p>
          <p><a class="btn" href="index.html">처음으로</a></p>
        </div>`;
      document.body.appendChild(wrap);
      return false;
    }
    return true;
  }

  /* ---------- 토스트 ---------- */
  function toast(msg, type = 'info', durationMs = 3500) {
    let host = document.getElementById('vbe-toast-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'vbe-toast-host';
      host.className = 'toast-host';
      document.body.appendChild(host);
    }
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = msg;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 300);
    }, durationMs);
  }

  /* ---------- 모달 ---------- */
  function modal(contentHtml) {
    const back = document.createElement('div');
    back.className = 'modal-backdrop';
    back.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <button class="modal-close" aria-label="닫기">×</button>
        ${contentHtml}
      </div>`;
    document.body.appendChild(back);
    const close = () => back.remove();
    back.addEventListener('click', e => { if (e.target === back) close(); });
    back.querySelector('.modal-close').addEventListener('click', close);
    document.addEventListener('keydown', function esc(ev) {
      if (ev.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });
    return { close };
  }

  /* ---------- 상태 배지 ---------- */
  function statusBadge(status) {
    const map = {
      '접수':   { cls: 'badge-neutral', label: '접수' },
      '진행중': { cls: 'badge-info',    label: '진행중' },
      '완료':   { cls: 'badge-success', label: '완료' },
      '반려':   { cls: 'badge-danger',  label: '반려' },
      '보류':   { cls: 'badge-warning', label: '보류' },
    };
    const m = map[status] || { cls: 'badge-neutral', label: status };
    return `<span class="badge ${m.cls}">${m.label}</span>`;
  }

  /* ---------- 업무구분별 동적 필드 렌더 (상세 표시용) ---------- */
  function renderDetails(workType, details) {
    if (!details) return '<em>(상세 없음)</em>';
    const rows = [];
    const row = (k, v) => rows.push(`<div class="kv"><dt>${escapeHtml(k)}</dt><dd>${v == null || v === '' ? '<em>-</em>' : escapeHtml(String(v))}</dd></div>`);

    switch (workType) {
      case '태아등재':
        row('출산예정일', details.due_date);
        row('등본 첨부', details.attached_family_register ? '✓' : '✗');
        row('동의서 첨부', details.attached_consent ? '✓' : '✗');
        break;
      case '자동이체변경 또는 카드변경':
        row('변경유형', details.change_type === 'card' ? '카드 변경' : '자동이체 변경');
        if (details.change_type === 'card') {
          row('카드사', details.card_company);
          row('카드 끝 4자리', '**** **** **** ' + (details.card_last4 || '----'));
        } else {
          row('은행', details.bank);
          row('예금주', details.account_holder);
          row('계좌번호', details.account_number);
        }
        row('변경사유', details.reason);
        break;
      case '담보삭제 및 추가':
        row('추가 담보', (details.add_coverages || []).join(', ') || '(없음)');
        row('삭제 담보', (details.remove_coverages || []).join(', ') || '(없음)');
        row('사유', details.reason);
        break;
      case '이관고객관리':
        row('이관 사유', details.transfer_reason);
        row('이관 전 담당자', details.previous_advisor);
        row('이관 후 담당자', details.new_advisor);
        break;
      case '육아 휴직 및 출산 할인':
        row('구분', details.type === 'parental_leave' ? '육아 휴직' : '출산');
        row('시작일', details.start_date);
        row('종료일', details.end_date);
        row('증빙서류 첨부', details.attached_proof ? '✓' : '✗');
        break;
      case '계약자변경':
        rows.push('<div class="kv-block"><h4>변경 전</h4>');
        row('성명', details.previous && details.previous.name);
        row('관계', details.previous && details.previous.relation_to_insured);
        row('생년월일', details.previous && details.previous.birth_date);
        rows.push('</div><div class="kv-block"><h4>변경 후</h4>');
        row('성명', details.new && details.new.name);
        row('관계', details.new && details.new.relation_to_insured);
        row('생년월일', details.new && details.new.birth_date);
        rows.push('</div>');
        break;
      case '기타':
        row('내용', details.description);
        break;
    }
    return `<dl class="kv-list">${rows.join('')}</dl>`;
  }

  /* ---------- 요청 상세 모달 ---------- */
  function showRequestDetail(req, opts = {}) {
    const me = DB.currentUser();
    const canEditStatus = (me.role === '총무' || me.role === '관리자');
    const logs = DB.logs().filter(l => l.requestId === req.id).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const assignee = req.assigneeEmail ? (DB.userByEmail(req.assigneeEmail) || { name: req.assigneeEmail }) : null;
    const attachmentsHtml = (req.attachments && req.attachments.length)
      ? req.attachments.map(f => `<li>📎 ${escapeHtml(f)} <span class="muted">(목업 — 실제 파일 미연결)</span></li>`).join('')
      : '<li class="muted">첨부 없음</li>';
    const timelineHtml = logs.map(l => `
      <li>
        <span class="timeline-time">${fmtDate(l.timestamp)}</span>
        <span class="timeline-actor">${escapeHtml((DB.userByEmail(l.actorEmail) || {}).name || l.actorEmail)}</span>
        <span class="timeline-action">${escapeHtml(l.action)}</span>
        ${l.to ? `<span class="timeline-to">→ ${statusBadge(l.to)}</span>` : ''}
      </li>`).join('');

    const statusSelectHtml = canEditStatus ? `
      <div class="form-row">
        <label>상태 변경</label>
        <select id="vbe-status-select">
          ${window.MOCK_SEED.statuses.map(s => `<option value="${s}" ${s === req.status ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-row">
        <label>총무 메모</label>
        <textarea id="vbe-memo" rows="3" placeholder="처리 결과·반려사유·보류사유 등">${escapeHtml(req.memo || '')}</textarea>
      </div>
      <div class="form-row">
        <button class="btn btn-primary" id="vbe-save-status">변경 저장</button>
        ${!req.assigneeEmail ? '<button class="btn" id="vbe-pickup">내가 잡기</button>' : ''}
      </div>
    ` : '';

    const m = modal(`
      <div class="modal-head">
        <h3>${statusBadge(req.status)} <span class="mono">${escapeHtml(req.id)}</span></h3>
        <p class="muted">제출: ${fmtDate(req.submittedAt)} · ${escapeHtml(req.advisorName)}(${escapeHtml(req.team)})</p>
      </div>
      <div class="modal-body">
        <section class="detail-section">
          <h4>기본 정보</h4>
          <dl class="kv-list">
            <div class="kv"><dt>고객명</dt><dd>${escapeHtml(req.customerName)}</dd></div>
            <div class="kv"><dt>연락처</dt><dd>${escapeHtml(req.phone)}</dd></div>
            <div class="kv"><dt>업무구분</dt><dd>${escapeHtml(req.workType)}</dd></div>
            <div class="kv"><dt>증권번호</dt><dd class="mono">${escapeHtml(req.policyNumber)}</dd></div>
            <div class="kv"><dt>담당총무</dt><dd>${assignee ? escapeHtml(assignee.name) : '<em class="muted">미지정</em>'}</dd></div>
            ${req.completedAt ? `<div class="kv"><dt>완료일시</dt><dd>${fmtDate(req.completedAt)}</dd></div>` : ''}
          </dl>
        </section>
        <section class="detail-section">
          <h4>업무 상세</h4>
          ${renderDetails(req.workType, req.details)}
        </section>
        <section class="detail-section">
          <h4>첨부파일</h4>
          <ul class="attachment-list">${attachmentsHtml}</ul>
        </section>
        <section class="detail-section">
          <h4>총무 메모</h4>
          <p class="memo-box">${req.memo ? escapeHtml(req.memo) : '<em class="muted">(작성된 메모 없음)</em>'}</p>
        </section>
        <section class="detail-section">
          <h4>처리 이력</h4>
          <ul class="timeline">${timelineHtml || '<li class="muted">이력 없음</li>'}</ul>
        </section>
        ${statusSelectHtml ? `<section class="detail-section">${statusSelectHtml}</section>` : ''}
      </div>
    `);

    if (canEditStatus) {
      m.close = m.close; /* keep ref */
      const saveBtn = document.getElementById('vbe-save-status');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const newStatus = document.getElementById('vbe-status-select').value;
          const newMemo = document.getElementById('vbe-memo').value;
          updateRequest(req.id, { status: newStatus, memo: newMemo }, me.email);
          m.close();
          if (opts.onUpdate) opts.onUpdate();
          const target = DB.userByEmail(req.advisorEmail);
          toast(`<strong>${target ? target.name : '상담사'}</strong>에게 처리 안내 이메일이 발송되었습니다. <span class="muted">(목업 — 실제 발송되지 않음)</span>`, 'success');
        });
      }
      const pickupBtn = document.getElementById('vbe-pickup');
      if (pickupBtn) {
        pickupBtn.addEventListener('click', () => {
          updateRequest(req.id, { assigneeEmail: me.email, status: req.status === '접수' ? '진행중' : req.status }, me.email);
          m.close();
          if (opts.onUpdate) opts.onUpdate();
          toast('이 건을 내 처리 목록으로 가져왔습니다.', 'info');
        });
      }
    }
    return m;
  }

  /* ---------- 요청 업데이트 + 로그 ---------- */
  function updateRequest(reqId, patch, actorEmail) {
    const reqs = DB.requests();
    const idx = reqs.findIndex(r => r.id === reqId);
    if (idx === -1) return null;
    const before = { ...reqs[idx] };
    const after = { ...before, ...patch };
    /* 완료 시 완료일시 자동 채움 */
    if (patch.status === '완료' && before.status !== '완료') {
      after.completedAt = new Date().toISOString();
    }
    /* 진행중으로 가는데 담당자 없으면 actor 지정 */
    if (after.status !== '접수' && !after.assigneeEmail) {
      after.assigneeEmail = actorEmail;
    }
    reqs[idx] = after;
    DB.saveRequests(reqs);

    const logs = DB.logs();
    if (patch.status && patch.status !== before.status) {
      logs.push({
        id: logs.length + 1,
        timestamp: new Date().toISOString(),
        requestId: reqId,
        actorEmail,
        action: '상태변경',
        from: before.status,
        to: after.status,
      });
    }
    if (patch.memo != null && patch.memo !== before.memo) {
      logs.push({
        id: logs.length + 1,
        timestamp: new Date().toISOString(),
        requestId: reqId,
        actorEmail,
        action: '메모수정',
        from: before.memo || '',
        to: after.memo || '',
      });
    }
    if (patch.assigneeEmail && patch.assigneeEmail !== before.assigneeEmail) {
      logs.push({
        id: logs.length + 1,
        timestamp: new Date().toISOString(),
        requestId: reqId,
        actorEmail,
        action: '픽업',
        from: before.assigneeEmail || '',
        to: after.assigneeEmail || '',
      });
    }
    DB.saveLogs(logs);
    return after;
  }

  function createRequest(data) {
    const reqs = DB.requests();
    const id = generateRequestId();
    const submittedAt = new Date().toISOString();
    const newReq = {
      id, submittedAt,
      team: data.team,
      advisorEmail: data.advisorEmail,
      advisorName: data.advisorName,
      customerName: data.customerName,
      phone: data.phone,
      workType: data.workType,
      policyNumber: data.policyNumber,
      attachments: data.attachments || [],
      details: data.details || {},
      status: '접수',
      assigneeEmail: '',
      completedAt: '',
      memo: '',
    };
    reqs.unshift(newReq);
    DB.saveRequests(reqs);

    const logs = DB.logs();
    logs.push({
      id: logs.length + 1,
      timestamp: submittedAt,
      requestId: id,
      actorEmail: data.advisorEmail,
      action: '생성',
      from: '',
      to: '접수',
    });
    DB.saveLogs(logs);
    return newReq;
  }

  /* ---------- 노출 ---------- */
  bootstrap();
  window.VBE = {
    DB,
    fmtDate,
    fmtRelative,
    escapeHtml,
    renderHeader,
    requireRole,
    toast,
    modal,
    statusBadge,
    renderDetails,
    showRequestDetail,
    updateRequest,
    createRequest,
  };
})();
