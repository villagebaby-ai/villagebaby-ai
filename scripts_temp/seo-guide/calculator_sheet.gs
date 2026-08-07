/**
 * 태아보험료 계산기 → MKT_DB_SEO_2608 시트 적재 + 이메일 알림
 * A~H = 신전산 업로드 순서 그대로 / I~M = 참고용
 * 한글은 전부 \uXXXX 이스케이프 (붙여넣기 깨짐 방지)
 */
var SHEET_ID = '1fHft8rmGEuVzdPPrtXDwT6wtYotKV2WjJOjaDHzg9zM';
var SOURCE_LABEL = '\uD0DC\uC544\uBCF4\uD5D8\uB8CC \uACC4\uC0B0\uAE30';
var NOTIFY_TO = 'gonny.park@villagebaby.kr';   // 여러 명이면 쉼표로 구분

function doPost(e) {
  var d;
  try {
    d = JSON.parse(e.postData.contents);
    var sh = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    var now = new Date();
    var day = Utilities.formatDate(now, 'Asia/Seoul', 'yyyy-MM-dd');
    var ts  = Utilities.formatDate(now, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
    sh.appendRow([
      fmtPhone(d.phone),       // A \uC5F0\uB77D\uCC98
      d.name    || '',         // B \uC774\uB984
      d.weeks   || '',         // C \uC8FC\uCC28
      '',                      // D
      d.gender  || '',         // E \uC131\uBCC4
      day,                     // F
      SOURCE_LABEL,            // G
      d.pageUrl || '',         // H
      d.coverage|| '',         // I
      d.range   || '',         // J
      d.pref    || '',         // K
      d.referrer|| '',         // L
      ts                       // M
    ]);
    notify(d, ts);             // 적재 성공 뒤에만 · 실패해도 리드는 이미 저장됨
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/** 메일 실패가 리드 저장을 망치면 안 되므로 통째로 try 안에 둔다 */
function notify(d, ts) {
  try {
    var L = function (k, v) { return k + ': ' + (v || '(\uC5C6\uC74C)') + '\n'; };
    var body = '\uACC4\uC0B0\uAE30\uC5D0\uC11C \uC0C1\uB2F4 \uC2E0\uCCAD\uC774 \uB4E4\uC5B4\uC654\uC5B4\uC694.\n\n'
      + L('\uC774\uB984',   d.name)
      + L('\uC5F0\uB77D\uCC98',  fmtPhone(d.phone))
      + L('\uC8FC\uCC28',  d.weeks)
      + L('\uC131\uBCC4', d.gender)
      + L('\uBCF4\uC7A5\uBC94\uC704',    d.coverage)
      + L('\uC608\uC0C1\uBCF4\uD5D8\uB8CC',    d.range)
      + L('\uC120\uD638 \uC5F0\uB77D\uBC29\uBC95',   d.pref)
      + L('\uC9C1\uC804\uC5D0 \uBCF8 \uAE00',    d.referrer)
      + L('\uC811\uC218\uC2DC\uAC01',   ts)
      + '\n\uC2DC\uD2B8\uC5D0\uC11C \uBCF4\uAE30: https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit';
    MailApp.sendEmail(NOTIFY_TO, '[\uBCA0\uC774\uBE44\uBE4C\uB9AC] \uD0DC\uC544\uBCF4\uD5D8\uB8CC \uACC4\uC0B0\uAE30 \uC0C1\uB2F4\uC2E0\uCCAD 1\uAC74', body);
  } catch (err) { /* 알림 실패는 무시 */ }
}

/** 최초 1회 직접 실행해서 메일 권한을 승인해 두세요 */
function notifyTest() {
  notify({ name: 'TEST', phone: '01000000000', weeks: '12', gender: 'F',
           coverage: 'standard', range: '8-11', pref: 'kakao', referrer: 'manual' },
         Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'));
}

function fmtPhone(v) {
  var d = String(v || '').replace(/[^0-9]/g, '');
  if (d.length === 11) return d.slice(0,3) + '-' + d.slice(3,7) + '-' + d.slice(7);
  if (d.length === 10) return d.slice(0,3) + '-' + d.slice(3,6) + '-' + d.slice(6);
  return d;
}

function doGet() { return json({ ok: true, alive: true }); }

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
