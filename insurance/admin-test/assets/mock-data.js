/* ============================================================
   빌리지점 배서 보드 — 목업용 시드 데이터
   - 모든 이름·이메일·번호·증권번호는 가공된 가짜 데이터입니다.
   - 실제 운영 시 이 파일은 제거되고, 데이터는 시트/DB에서 옵니다.
   ============================================================ */

const MOCK_USERS = [
  { email: 'kim.jw@example.villagebaby.kr',  name: '김지원', role: '상담사', team: '서울1팀', active: true },
  { email: 'park.sy@example.villagebaby.kr', name: '박서연', role: '상담사', team: '서울1팀', active: true },
  { email: 'lee.mh@example.villagebaby.kr',  name: '이민호', role: '상담사', team: '서울2팀', active: true },
  { email: 'choi.yr@example.villagebaby.kr', name: '최예린', role: '상담사', team: '부산팀',  active: true },
  { email: 'jung.hn@example.villagebaby.kr', name: '정하늘', role: '상담사', team: '대구팀',  active: true },
  { email: 'han.dy@example.villagebaby.kr',  name: '한도윤', role: '총무',   team: '본사',    active: true },
  { email: 'yoon.ge@example.villagebaby.kr', name: '윤가은', role: '총무',   team: '본사',    active: true },
  { email: 'lim.hs@example.villagebaby.kr',  name: '임화수', role: '관리자', team: '본사',    active: true },
];

const WORK_TYPES = [
  '태아등재',
  '자동이체변경 또는 카드변경',
  '담보삭제 및 추가',
  '이관고객관리',
  '육아 휴직 및 출산 할인',
  '계약자변경',
  '기타',
];

const STATUSES = ['접수', '진행중', '완료', '반려', '보류'];

/* 오늘 = 2026-05-14 기준, 최근 14일에 분산 */
function _d(daysAgo, hour = 10, min = 30) {
  const base = new Date('2026-05-14T00:00:00+09:00');
  base.setDate(base.getDate() - daysAgo);
  base.setHours(hour, min, 0, 0);
  return base.toISOString();
}

const MOCK_REQUESTS = [
  /* === 태아등재 (3건) === */
  {
    id: 'VBE-260512-0001', submittedAt: _d(2, 14, 20),
    team: '서울1팀', advisorEmail: 'kim.jw@example.villagebaby.kr', advisorName: '김지원',
    customerName: '윤민서', phone: '010-2XXX-XXXX',
    workType: '태아등재', policyNumber: 'MOCK-A001-2024',
    attachments: ['등본_윤민서.pdf', '동의서_윤민서.pdf'],
    details: { due_date: '2026-09-20', attached_family_register: true, attached_consent: true },
    status: '접수', assigneeEmail: '', completedAt: '', memo: '',
  },
  {
    id: 'VBE-260509-0002', submittedAt: _d(5, 11, 5),
    team: '서울2팀', advisorEmail: 'lee.mh@example.villagebaby.kr', advisorName: '이민호',
    customerName: '강서윤', phone: '010-3XXX-XXXX',
    workType: '태아등재', policyNumber: 'MOCK-A002-2023',
    attachments: ['등본.pdf', '동의서.pdf'],
    details: { due_date: '2026-10-05', attached_family_register: true, attached_consent: true },
    status: '완료', assigneeEmail: 'han.dy@example.villagebaby.kr', completedAt: _d(4, 16, 40),
    memo: '태아 등재 완료, 보험사 전자서명 발송 확인.',
  },
  {
    id: 'VBE-260506-0003', submittedAt: _d(8, 9, 15),
    team: '부산팀', advisorEmail: 'choi.yr@example.villagebaby.kr', advisorName: '최예린',
    customerName: '오지안', phone: '010-4XXX-XXXX',
    workType: '태아등재', policyNumber: 'MOCK-A003-2025',
    attachments: ['family_register.pdf'],
    details: { due_date: '2026-07-30', attached_family_register: true, attached_consent: false },
    status: '보류', assigneeEmail: 'yoon.ge@example.villagebaby.kr', completedAt: '',
    memo: '동의서 미첨부. 상담사에게 동의서 추가 요청드렸습니다.',
  },

  /* === 자동이체변경 또는 카드변경 (3건) === */
  {
    id: 'VBE-260513-0004', submittedAt: _d(1, 9, 50),
    team: '서울1팀', advisorEmail: 'park.sy@example.villagebaby.kr', advisorName: '박서연',
    customerName: '한지호', phone: '010-5XXX-XXXX',
    workType: '자동이체변경 또는 카드변경', policyNumber: 'MOCK-B001-2022',
    attachments: [],
    details: { change_type: 'card', card_company: '현대카드', card_last4: '1234', reason: '기존 카드 만료로 신규 발급' },
    status: '진행중', assigneeEmail: 'han.dy@example.villagebaby.kr', completedAt: '',
    memo: '보험사 시스템 접속 처리 중.',
  },
  {
    id: 'VBE-260510-0005', submittedAt: _d(4, 13, 30),
    team: '서울1팀', advisorEmail: 'kim.jw@example.villagebaby.kr', advisorName: '김지원',
    customerName: '신유나', phone: '010-6XXX-XXXX',
    workType: '자동이체변경 또는 카드변경', policyNumber: 'MOCK-B002-2024',
    attachments: ['통장사본.jpg'],
    details: { change_type: 'bank_transfer', bank: '국민은행', account_holder: '신유나', account_number: '123456-78-XXXXXX', reason: '자동이체 계좌 변경' },
    status: '완료', assigneeEmail: 'yoon.ge@example.villagebaby.kr', completedAt: _d(3, 11, 20),
    memo: '자동이체 계좌 변경 완료. 다음 출금일부터 적용.',
  },
  {
    id: 'VBE-260504-0006', submittedAt: _d(10, 16, 0),
    team: '대구팀', advisorEmail: 'jung.hn@example.villagebaby.kr', advisorName: '정하늘',
    customerName: '문아린', phone: '010-7XXX-XXXX',
    workType: '자동이체변경 또는 카드변경', policyNumber: 'MOCK-B003-2021',
    attachments: [],
    details: { change_type: 'card', card_company: '신한카드', card_last4: '5678', reason: '카드 분실 후 재발급' },
    status: '완료', assigneeEmail: 'han.dy@example.villagebaby.kr', completedAt: _d(9, 14, 10),
    memo: '카드정보 변경 완료. 전자서명 회신 확인.',
  },

  /* === 담보삭제 및 추가 (3건) === */
  {
    id: 'VBE-260512-0007', submittedAt: _d(2, 17, 45),
    team: '서울2팀', advisorEmail: 'lee.mh@example.villagebaby.kr', advisorName: '이민호',
    customerName: '서도윤', phone: '010-8XXX-XXXX',
    workType: '담보삭제 및 추가', policyNumber: 'MOCK-C001-2020',
    attachments: ['보장강화_상담기록.pdf'],
    details: { add_coverages: ['암 진단비 5천만원 추가', '뇌혈관질환 진단비'], remove_coverages: [], reason: '가족력 반영 보장 강화' },
    status: '진행중', assigneeEmail: 'han.dy@example.villagebaby.kr', completedAt: '',
    memo: '심사 진행 중 (보험사 회신 대기).',
  },
  {
    id: 'VBE-260507-0008', submittedAt: _d(7, 10, 25),
    team: '서울1팀', advisorEmail: 'park.sy@example.villagebaby.kr', advisorName: '박서연',
    customerName: '권지윤', phone: '010-9XXX-XXXX',
    workType: '담보삭제 및 추가', policyNumber: 'MOCK-C002-2019',
    attachments: [],
    details: { add_coverages: [], remove_coverages: ['치과 특약'], reason: '보장 정리 요청' },
    status: '완료', assigneeEmail: 'yoon.ge@example.villagebaby.kr', completedAt: _d(6, 15, 0),
    memo: '치과 특약 삭제 완료. 익월부터 보험료 인하 적용.',
  },
  {
    id: 'VBE-260503-0009', submittedAt: _d(11, 13, 50),
    team: '부산팀', advisorEmail: 'choi.yr@example.villagebaby.kr', advisorName: '최예린',
    customerName: '배하준', phone: '010-1XXX-XXXX',
    workType: '담보삭제 및 추가', policyNumber: 'MOCK-C003-2023',
    attachments: ['요청서.pdf'],
    details: { add_coverages: ['수술비 특약'], remove_coverages: ['상해 입원일당'], reason: '보장 재구성' },
    status: '반려', assigneeEmail: 'han.dy@example.villagebaby.kr', completedAt: '',
    memo: '재가입 심사 부적격 통보. 다른 특약으로 재제안 부탁드립니다.',
  },

  /* === 이관고객관리 (3건) === */
  {
    id: 'VBE-260513-0010', submittedAt: _d(1, 15, 10),
    team: '서울1팀', advisorEmail: 'kim.jw@example.villagebaby.kr', advisorName: '김지원',
    customerName: '조은서', phone: '010-2XXX-XXXX',
    workType: '이관고객관리', policyNumber: 'MOCK-D001-2022',
    attachments: ['이관동의서.pdf'],
    details: { transfer_reason: '담당자 퇴사로 인한 재배정', previous_advisor: '박지훈(퇴사)', new_advisor: '김지원' },
    status: '접수', assigneeEmail: '', completedAt: '', memo: '',
  },
  {
    id: 'VBE-260511-0011', submittedAt: _d(3, 11, 30),
    team: '서울2팀', advisorEmail: 'lee.mh@example.villagebaby.kr', advisorName: '이민호',
    customerName: '임주원', phone: '010-3XXX-XXXX',
    workType: '이관고객관리', policyNumber: 'MOCK-D002-2021',
    attachments: ['이관동의서.pdf', '인계서.pdf'],
    details: { transfer_reason: '고객 요청 (거주지 이전)', previous_advisor: '최예린', new_advisor: '이민호' },
    status: '완료', assigneeEmail: 'yoon.ge@example.villagebaby.kr', completedAt: _d(2, 10, 50),
    memo: '이관 처리 완료. 신/구 담당자 모두 안내 발송.',
  },
  {
    id: 'VBE-260505-0012', submittedAt: _d(9, 16, 20),
    team: '대구팀', advisorEmail: 'jung.hn@example.villagebaby.kr', advisorName: '정하늘',
    customerName: '남시아', phone: '010-4XXX-XXXX',
    workType: '이관고객관리', policyNumber: 'MOCK-D003-2020',
    attachments: ['이관동의서.pdf'],
    details: { transfer_reason: '담당자 변경 희망', previous_advisor: '김지원', new_advisor: '정하늘' },
    status: '완료', assigneeEmail: 'han.dy@example.villagebaby.kr', completedAt: _d(8, 14, 30),
    memo: '이관 완료.',
  },

  /* === 육아 휴직 및 출산 할인 (3건) === */
  {
    id: 'VBE-260512-0013', submittedAt: _d(2, 10, 0),
    team: '서울1팀', advisorEmail: 'park.sy@example.villagebaby.kr', advisorName: '박서연',
    customerName: '구하린', phone: '010-5XXX-XXXX',
    workType: '육아 휴직 및 출산 할인', policyNumber: 'MOCK-E001-2023',
    attachments: ['육아휴직증명서.pdf'],
    details: { type: 'parental_leave', start_date: '2026-06-01', end_date: '2027-05-31', attached_proof: true },
    status: '접수', assigneeEmail: '', completedAt: '', memo: '',
  },
  {
    id: 'VBE-260508-0014', submittedAt: _d(6, 14, 45),
    team: '부산팀', advisorEmail: 'choi.yr@example.villagebaby.kr', advisorName: '최예린',
    customerName: '도예준', phone: '010-6XXX-XXXX',
    workType: '육아 휴직 및 출산 할인', policyNumber: 'MOCK-E002-2024',
    attachments: ['출산증명서.pdf'],
    details: { type: 'childbirth', start_date: '2026-04-15', end_date: '2026-04-15', attached_proof: true },
    status: '완료', assigneeEmail: 'han.dy@example.villagebaby.kr', completedAt: _d(5, 11, 10),
    memo: '출산 할인 적용 완료. 12개월간 보험료 5% 할인.',
  },
  {
    id: 'VBE-260502-0015', submittedAt: _d(12, 9, 30),
    team: '서울2팀', advisorEmail: 'lee.mh@example.villagebaby.kr', advisorName: '이민호',
    customerName: '백서아', phone: '010-7XXX-XXXX',
    workType: '육아 휴직 및 출산 할인', policyNumber: 'MOCK-E003-2022',
    attachments: ['육아휴직증명서.pdf'],
    details: { type: 'parental_leave', start_date: '2026-03-01', end_date: '2027-02-28', attached_proof: true },
    status: '완료', assigneeEmail: 'yoon.ge@example.villagebaby.kr', completedAt: _d(11, 13, 20),
    memo: '육아휴직 할인 적용. 다음 자동이체분부터 인하 반영.',
  },

  /* === 계약자변경 (3건) === */
  {
    id: 'VBE-260513-0016', submittedAt: _d(1, 16, 0),
    team: '서울1팀', advisorEmail: 'kim.jw@example.villagebaby.kr', advisorName: '김지원',
    customerName: '천하영', phone: '010-8XXX-XXXX',
    workType: '계약자변경', policyNumber: 'MOCK-F001-2018',
    attachments: ['신분증사본.jpg', '동의서.pdf'],
    details: {
      previous: { name: '천민준', relation_to_insured: '부', birth_date: '1975-04-10' },
      new:      { name: '천하영', relation_to_insured: '본인', birth_date: '2000-09-22' },
    },
    status: '진행중', assigneeEmail: 'han.dy@example.villagebaby.kr', completedAt: '',
    memo: '보험사 심사 진행 중.',
  },
  {
    id: 'VBE-260510-0017', submittedAt: _d(4, 11, 15),
    team: '서울1팀', advisorEmail: 'park.sy@example.villagebaby.kr', advisorName: '박서연',
    customerName: '편서윤', phone: '010-9XXX-XXXX',
    workType: '계약자변경', policyNumber: 'MOCK-F002-2017',
    attachments: ['동의서.pdf'],
    details: {
      previous: { name: '편민호', relation_to_insured: '부', birth_date: '1970-12-05' },
      new:      { name: '편수진', relation_to_insured: '모', birth_date: '1973-02-18' },
    },
    status: '완료', assigneeEmail: 'yoon.ge@example.villagebaby.kr', completedAt: _d(3, 16, 0),
    memo: '계약자 변경 처리 완료.',
  },
  {
    id: 'VBE-260506-0018', submittedAt: _d(8, 14, 10),
    team: '대구팀', advisorEmail: 'jung.hn@example.villagebaby.kr', advisorName: '정하늘',
    customerName: '여지안', phone: '010-1XXX-XXXX',
    workType: '계약자변경', policyNumber: 'MOCK-F003-2019',
    attachments: ['신분증사본.jpg'],
    details: {
      previous: { name: '여태호', relation_to_insured: '배우자', birth_date: '1985-07-30' },
      new:      { name: '여지안', relation_to_insured: '본인', birth_date: '1988-11-14' },
    },
    status: '반려', assigneeEmail: 'han.dy@example.villagebaby.kr', completedAt: '',
    memo: '동의서 누락. 양식에 맞춰 동의서 보완 후 재접수 부탁드립니다.',
  },

  /* === 기타 (3건) === */
  {
    id: 'VBE-260513-0019', submittedAt: _d(1, 17, 30),
    team: '부산팀', advisorEmail: 'choi.yr@example.villagebaby.kr', advisorName: '최예린',
    customerName: '진우빈', phone: '010-2XXX-XXXX',
    workType: '기타', policyNumber: 'MOCK-G001-2025',
    attachments: [],
    details: { description: '약관대출 신청 절차 문의. 가능 한도 및 이율 안내 부탁드립니다.' },
    status: '접수', assigneeEmail: '', completedAt: '', memo: '',
  },
  {
    id: 'VBE-260511-0020', submittedAt: _d(3, 13, 0),
    team: '서울1팀', advisorEmail: 'kim.jw@example.villagebaby.kr', advisorName: '김지원',
    customerName: '유민찬', phone: '010-3XXX-XXXX',
    workType: '기타', policyNumber: 'MOCK-G002-2023',
    attachments: ['요청서.pdf'],
    details: { description: '주소 변경 및 우편물 수신처 변경 요청. 신주소: 서울 OO구 OO동 OOO.' },
    status: '완료', assigneeEmail: 'han.dy@example.villagebaby.kr', completedAt: _d(2, 11, 30),
    memo: '주소 변경 완료. 익월 우편물부터 신주소로 발송.',
  },
  {
    id: 'VBE-260507-0021', submittedAt: _d(7, 11, 45),
    team: '서울2팀', advisorEmail: 'lee.mh@example.villagebaby.kr', advisorName: '이민호',
    customerName: '강시우', phone: '010-4XXX-XXXX',
    workType: '기타', policyNumber: 'MOCK-G003-2020',
    attachments: [],
    details: { description: '보험료 자동이체 일자 변경 (매월 5일 → 25일).' },
    status: '접수', assigneeEmail: '', completedAt: '', memo: '',
  },
];

/* === 상태 변경 로그 (각 요청별로 1~3 이벤트) === */
const MOCK_LOGS = (() => {
  const logs = [];
  let logId = 1;
  for (const r of MOCK_REQUESTS) {
    /* 생성 이벤트 */
    logs.push({
      id: logId++,
      timestamp: r.submittedAt,
      requestId: r.id,
      actorEmail: r.advisorEmail,
      action: '생성',
      from: '',
      to: '접수',
    });
    /* 픽업 + 상태 이동 이벤트 */
    if (r.assigneeEmail) {
      const t = new Date(new Date(r.submittedAt).getTime() + 1000 * 60 * 60 * 2).toISOString();
      logs.push({
        id: logId++, timestamp: t, requestId: r.id,
        actorEmail: r.assigneeEmail, action: '픽업', from: '', to: '진행중',
      });
    }
    /* 최종 상태 이벤트 */
    if (['완료', '반려', '보류'].includes(r.status)) {
      logs.push({
        id: logId++,
        timestamp: r.completedAt || r.submittedAt,
        requestId: r.id,
        actorEmail: r.assigneeEmail || 'han.dy@example.villagebaby.kr',
        action: '상태변경',
        from: '진행중',
        to: r.status,
      });
    }
  }
  return logs;
})();

window.MOCK_SEED = { users: MOCK_USERS, requests: MOCK_REQUESTS, logs: MOCK_LOGS, workTypes: WORK_TYPES, statuses: STATUSES };
