/**
 * 태아보험료 계산기 → MKT_DB_SEO_2608 시트 적재
 * A~H = 신전산 업로드 순서 그대로 / I~M = 참고용
 * 한글은 전부 \uXXXX 이스케이프 (붙여넣기 깨짐 방지)
 */
var SHEET_ID = '1fHft8rmGEuVzdPPrtXDwT6wtYotKV2WjJOjaDHzg9zM';
var SOURCE_LABEL = '\uD0DC\uC544\uBCF4\uD5D8\uB8CC \uACC4\uC0B0\uAE30';

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var sh = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    var now = new Date();
    var day = Utilities.formatDate(now, 'Asia/Seoul', 'yyyy-MM-dd');
    var ts  = Utilities.formatDate(now, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
    sh.appendRow([
      String(d.phone || ''),   // A 휴대폰
      d.name    || '',         // B 이름
      d.weeks   || '',         // C 주차
      '',                      // D 상담사은품 (이 페이지는 사은품 없음)
      d.gender  || '',         // E 성별
      day,                     // F 신청일 (KST)
      SOURCE_LABEL,            // G 유입페이지
      d.pageUrl || '',         // H 유입페이지 URL
      d.coverage|| '',         // I 보장범위
      d.range   || '',         // J 예상보험료
      d.pref    || '',         // K 선호연락방법
      d.referrer|| '',         // L 직전 페이지
      ts                       // M 접수시각(KST)
    ]);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() { return json({ ok: true, alive: true }); }

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
