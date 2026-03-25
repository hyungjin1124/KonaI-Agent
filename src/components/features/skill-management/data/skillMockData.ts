import type {
  TeamSkill,
  TeamMember,
} from '@/types/skill-management.types';

// ── Current User & Team ──────────────────────────────────────────────────────
export const CURRENT_USER: TeamMember = {
  id: 'user-hong',
  name: '홍길동',
  email: 'admin@konai.com',
  isAdmin: true,
};

export const TEAM_MEMBERS: TeamMember[] = [
  CURRENT_USER,
  { id: 'user-kim', name: '김철수', email: 'chulsoo@konai.com', isAdmin: false },
  { id: 'user-park', name: '박영희', email: 'yh.park@konai.com', isAdmin: false },
  { id: 'user-lee', name: '이민수', email: 'minsu@konai.com', isAdmin: false },
  { id: 'user-choi', name: '최수진', email: 'sujin@konai.com', isAdmin: false },
];

// ── Team Skills (v7 Copy-Based Model) ────────────────────────────────────────
export const mockTeamSkills: TeamSkill[] = [
  // ── Activated by me (4) ────────────────────────────────────────────────────
  {
    id: 'skill-sales-report',
    name: '매출 분석 리포트',
    description: '월별 매출 추이를 분석하고 핵심 지표를 시각화합니다',
    fullDescription: '영림원 ERP의 매출 데이터를 조회하여 월별/분기별 매출 추이 분석, 전년 동기 대비 변화율, 상위 10개 제품 기여도, 지역별 매출 분포를 시각화합니다.',
    category: 'data-analysis',
    author: '홍길동',
    authorId: 'user-hong',
    createdAt: '2026.02.15',
    lastModifiedAt: '2026.03.20',
    version: 'v3',
    callCount: 47,
    activatedBy: ['user-hong', 'user-kim', 'user-park', 'user-lee', 'user-choi'],
    isActivatedByMe: true,
    status: 'active',
    creationSource: 'chat',
    instructionBody: `# 매출 분석 리포트

## 역할
영림원 ERP 매출 데이터를 분석하고 경영진이 즉시 활용할 수 있는 리포트를 작성하는 에이전트입니다.

## 사용 도구
- \`query_erp_sales(period, warehouse)\` — ERP 매출 데이터 조회
- \`render_recharts(spec)\` — 차트 컴포넌트 렌더링
- \`format_report(template, data)\` — 리포트 양식 자동 작성

## 분석 항목
1. **월별 매출 추이** — 꺾은선 차트, 전월 대비 증감율 포함
2. **전년 동기 비교** — \`comparison\` 파라미터가 \`true\`인 경우만 실행
3. **제품별 기여도** — 상위 10개 제품, 도넛 차트
4. **지역별 매출 분포** — 막대 차트, 가나다순 정렬

## 출력 형식
- 마크다운 보고서 (H1~H3 헤딩 구조)
- 핵심 수치는 **굵게**, 이상 항목은 ⚠️ 마킹
- 차트는 인라인 Recharts 컴포넌트로 렌더링`,
    parameters: [
      { key: 'period', type: 'string', value: '2026-Q1', defaultValue: 'current-quarter', description: '분석 대상 기간' },
      { key: 'comparison', type: 'boolean', value: 'true', defaultValue: 'true', description: '전년 동기 비교 포함 여부' },
    ],
    attachments: [
      {
        id: 'att-1',
        path: 'templates/report-template.md',
        fileName: 'report-template.md',
        fileType: 'text',
        content: '# {{period}} 매출 분석 리포트\n\n> 생성일: {{generated_at}}\n\n## 요약 지표\n...',
        size: 640,
      },
      {
        id: 'att-5',
        path: 'queries/sales_summary.sql',
        fileName: 'sales_summary.sql',
        fileType: 'script',
        content: '-- 기간별 매출 요약 조회\nSELECT DATE_FORMAT(o.order_date, \'%Y-%m\') AS month...',
        size: 760,
      },
    ],
    versionHistory: [
      {
        version: 'v3',
        modifiedAt: '2026.03.20',
        modifiedBy: '홍길동',
        changeEntries: [
          { tag: '추가', subject: '데이터 검증 단계', impact: '빈 셀 발견 시 기본값(0)으로 자동 채움. 입력 누락으로 인한 분석 오류 방지' },
          { tag: '변경', subject: '출력 형식: 표 → 차트', impact: '월별 추이를 시각적으로 비교 가능' },
          { tag: '추가', subject: '트리거 조건에 \'분기 보고서\' 추가' },
        ],
      },
      {
        version: 'v2',
        modifiedAt: '2026.03.15',
        modifiedBy: '홍길동',
        changeEntries: [
          { tag: '추가', subject: '전월 대비 증감률 컬럼' },
          { tag: '개선', subject: '차트 레이블 가독성 향상', impact: '축 레이블에 단위(원, 건) 자동 추가' },
        ],
      },
      {
        version: 'v1',
        modifiedAt: '2026.02.15',
        modifiedBy: '홍길동',
        changeEntries: [{ tag: '추가', subject: '최초 생성' }],
      },
    ],
  },
  {
    id: 'skill-weekly-report',
    name: '주간 보고서 생성',
    description: '팀 주간 업무 보고서를 자동으로 생성합니다',
    fullDescription: '팀원들의 주간 업무 내용을 입력받아 표준 양식의 주간 업무 보고서를 생성합니다.',
    category: 'document',
    author: '김철수',
    authorId: 'user-kim',
    createdAt: '2026.02.20',
    lastModifiedAt: '2026.03.18',
    version: 'v1',
    callCount: 23,
    activatedBy: ['user-hong', 'user-kim', 'user-park'],
    isActivatedByMe: true,
    status: 'active',
    creationSource: 'chat',
    instructionBody: '# 주간 보고서 생성\n\n## 역할\n팀 주간 보고서 작성 전문가입니다.\n\n## 지시사항\n1. 팀원별 업무 내용을 수집합니다.\n2. 완료/진행 중/다음 주 예정으로 분류합니다.\n3. 표준 양식에 맞춰 보고서를 생성합니다.',
    parameters: [
      { key: 'team', type: 'string', value: '개발팀', defaultValue: '', description: '대상 팀명' },
      { key: 'week', type: 'string', value: '2026-W12', defaultValue: 'current-week', description: '보고 주차' },
    ],
    attachments: [],
    versionHistory: [
      { version: 'v1', modifiedAt: '2026.02.20', modifiedBy: '김철수', changeEntries: [{ tag: '추가', subject: '최초 생성' }] },
    ],
  },
  {
    id: 'skill-inventory-check',
    name: '재고 정합성 점검',
    description: '자동으로 재고 데이터 정합성을 점검합니다',
    fullDescription: '영림원 ERP의 재고 데이터와 실물 재고 데이터를 비교하여 불일치 항목을 식별하고, 원인 분석 및 조치 방안을 제시합니다.',
    category: 'automation',
    author: '홍길동',
    authorId: 'user-hong',
    createdAt: '2026.01.10',
    lastModifiedAt: '2026.03.22',
    version: 'v3',
    callCount: 15,
    activatedBy: ['user-hong', 'user-lee'],
    isActivatedByMe: true,
    status: 'active',
    creationSource: 'chat',
    instructionBody: '# 재고 정합성 점검\n\n## 역할\n영림원 ERP와 WMS 실물 재고를 비교·분석하여 불일치를 탐지하고 원인을 추적하는 에이전트입니다.',
    parameters: [
      { key: 'warehouse', type: 'string', value: 'all', defaultValue: 'all', description: '점검 대상 창고' },
    ],
    attachments: [
      { id: 'att-2', path: 'scripts/inventory_check.py', fileName: 'inventory_check.py', fileType: 'script', content: 'import pandas as pd\n...', size: 1890 },
      { id: 'att-3', path: 'references/check-criteria.md', fileName: 'check-criteria.md', fileType: 'text', content: '# 재고 점검 기준 v1.2\n...', size: 512 },
    ],
    versionHistory: [
      {
        version: 'v3',
        modifiedAt: '2026.03.22',
        modifiedBy: '홍길동',
        changeEntries: [
          { tag: '추가', subject: '고가 품목 별도 허용 오차 기준 (±0.5%)', impact: '단가 100만원 이상 품목의 정합성 검증 강화' },
          { tag: '개선', subject: '점검 결과 리포트에 원인 추정 섹션 추가' },
        ],
      },
      {
        version: 'v2',
        modifiedAt: '2026.02.28',
        modifiedBy: '홍길동',
        changeEntries: [
          { tag: '추가', subject: '다중 창고 지원', impact: 'warehouse 파라미터로 특정 창고 또는 전체 선택 가능' },
        ],
      },
      { version: 'v1', modifiedAt: '2026.01.10', modifiedBy: '홍길동', changeEntries: [{ tag: '추가', subject: '최초 생성' }] },
    ],
  },
  // ── Copied skill (activated, copied from 홍길동's 매출 분석 리포트) ─────────
  {
    id: 'skill-sales-report-copy',
    name: '매출 분석 리포트',
    description: '분기별 매출 트렌드 중심으로 커스텀한 버전',
    fullDescription: '홍길동의 매출 분석 리포트를 복사하여 분기별 트렌드 분석에 특화한 버전입니다.',
    category: 'data-analysis',
    author: '나',
    authorId: 'user-hong',
    createdAt: '2026.03.22',
    lastModifiedAt: '2026.03.22',
    version: 'v2',
    callCount: 3,
    activatedBy: ['user-hong'],
    isActivatedByMe: true,
    status: 'active',
    creationSource: 'copied',
    copySource: {
      originalSkillId: 'skill-sales-report',
      originalSkillName: '매출 분석 리포트',
      originalAuthor: '홍길동',
    },
    instructionBody: '# 매출 분석 리포트 (분기별)\n\n## 역할\n분기 단위 매출 트렌드를 집중 분석하는 에이전트입니다.\n\n## 분석 항목\n1. 분기별 매출 추이\n2. 분기간 성장률\n3. 계절성 패턴 분석',
    parameters: [
      { key: 'period', type: 'string', value: '2026-Q1', defaultValue: 'current-quarter', description: '분석 대상 기간' },
    ],
    attachments: [],
    versionHistory: [
      {
        version: 'v2',
        modifiedAt: '2026.03.22',
        modifiedBy: '나',
        changeEntries: [
          { tag: '변경', subject: '분석 초점: 월별 → 분기별 트렌드', impact: '계절성 패턴을 더 명확하게 파악 가능' },
          { tag: '삭제', subject: '지역별 매출 분포 차트 제거' },
        ],
      },
      { version: 'v1', modifiedAt: '2026.03.22', modifiedBy: '나', changeEntries: [{ tag: '추가', subject: '홍길동의 \'매출 분석 리포트\' v3에서 복사' }] },
    ],
  },

  // ── Not activated by me (7) ────────────────────────────────────────────────
  {
    id: 'skill-meeting-minutes',
    name: '회의록 정리',
    description: '회의 녹취를 구조화된 회의록으로 자동 정리합니다',
    fullDescription: '회의 내용을 입력하면 핵심 결정사항, 액션 아이템, 담당자를 자동으로 식별하고 구조화된 회의록을 생성합니다.',
    category: 'communication',
    author: '박영희',
    authorId: 'user-park',
    createdAt: '2026.02.01',
    lastModifiedAt: '2026.03.15',
    version: 'v1',
    callCount: 12,
    activatedBy: ['user-park', 'user-hong', 'user-kim'],
    isActivatedByMe: false,
    status: 'active',
    creationSource: 'chat',
    instructionBody: '# 회의록 정리\n\n## 역할\n회의록 작성 전문가입니다.',
    parameters: [],
    attachments: [],
    versionHistory: [
      { version: 'v1', modifiedAt: '2026.02.01', modifiedBy: '박영희', changeEntries: [{ tag: '추가', subject: '최초 생성' }] },
    ],
  },
  {
    id: 'skill-data-cleansing',
    name: '데이터 정제',
    description: 'ERP 원시 데이터를 분석 가능한 형태로 정제합니다',
    fullDescription: '영림원 ERP에서 추출한 원시 데이터의 결측값 처리, 이상치 제거, 데이터 타입 변환, 중복 제거를 자동으로 수행합니다.',
    category: 'data-analysis',
    author: '이민수',
    authorId: 'user-lee',
    createdAt: '2026.01.20',
    lastModifiedAt: '2026.03.10',
    version: 'v2',
    callCount: 58,
    activatedBy: ['user-lee', 'user-kim', 'user-choi', 'user-park', 'user-hong'],
    isActivatedByMe: false,
    status: 'active',
    creationSource: 'chat',
    instructionBody: '# 데이터 정제\n\n## 역할\n데이터 정제 전문가입니다.',
    parameters: [
      { key: 'missing_strategy', type: 'string', value: 'interpolation', defaultValue: 'drop', description: '결측값 처리 전략' },
    ],
    attachments: [],
    versionHistory: [
      {
        version: 'v2',
        modifiedAt: '2026.03.10',
        modifiedBy: '이민수',
        changeEntries: [
          { tag: '개선', subject: '이상치 감지 알고리즘: IQR → Modified Z-Score', impact: '분포 왜곡이 있는 데이터에서도 안정적으로 이상치 탐지' },
          { tag: '추가', subject: '결측값 보간 전략 추가 (interpolation)' },
        ],
      },
      { version: 'v1', modifiedAt: '2026.01.20', modifiedBy: '이민수', changeEntries: [{ tag: '추가', subject: '최초 생성' }] },
    ],
  },
  {
    id: 'skill-ppt-creator',
    name: 'PPT 프레젠테이션 생성',
    description: '주제와 개요를 입력하면 전문적인 PPT 슬라이드를 생성합니다',
    fullDescription: '주제, 대상 청중, 핵심 메시지를 입력하면 표지부터 마무리까지 완성된 프레젠테이션 슬라이드를 자동 생성합니다.',
    category: 'document',
    author: '최수진',
    authorId: 'user-choi',
    createdAt: '2026.03.01',
    lastModifiedAt: '2026.03.19',
    version: 'v2',
    callCount: 31,
    activatedBy: ['user-choi', 'user-park'],
    isActivatedByMe: false,
    status: 'active',
    creationSource: 'chat',
    instructionBody: '# PPT 프레젠테이션 생성\n\n## 역할\n프레젠테이션 디자인 전문가입니다.',
    parameters: [
      { key: 'slide_count', type: 'number', value: '10', defaultValue: '10', description: '슬라이드 수' },
    ],
    attachments: [],
    versionHistory: [
      {
        version: 'v2',
        modifiedAt: '2026.03.19',
        modifiedBy: '최수진',
        changeEntries: [
          { tag: '추가', subject: '다크 테마 지원', impact: '프레젠테이션 환경에 맞는 테마 선택 가능' },
          { tag: '변경', subject: '기본 슬라이드 레이아웃 개선' },
        ],
      },
      { version: 'v1', modifiedAt: '2026.03.01', modifiedBy: '최수진', changeEntries: [{ tag: '추가', subject: '최초 생성' }] },
    ],
  },
  {
    id: 'skill-email-draft',
    name: '비즈니스 이메일 작성',
    description: '상황에 맞는 전문적인 비즈니스 이메일을 작성합니다',
    fullDescription: '이메일의 목적, 수신자, 핵심 내용을 입력하면 격식을 갖춘 비즈니스 이메일 초안을 작성합니다.',
    category: 'communication',
    author: '김철수',
    authorId: 'user-kim',
    createdAt: '2026.02.10',
    lastModifiedAt: '2026.03.05',
    version: 'v1',
    callCount: 42,
    activatedBy: ['user-kim', 'user-choi', 'user-lee', 'user-park'],
    isActivatedByMe: false,
    status: 'active',
    creationSource: 'chat',
    instructionBody: '# 비즈니스 이메일 작성\n\n## 역할\n비즈니스 커뮤니케이션 전문가입니다.',
    parameters: [],
    attachments: [],
    versionHistory: [
      { version: 'v1', modifiedAt: '2026.02.10', modifiedBy: '김철수', changeEntries: [{ tag: '추가', subject: '최초 생성' }] },
    ],
  },
  {
    id: 'skill-contract-review',
    name: '계약서 검토 보조',
    description: '계약서의 핵심 조항을 분석하고 리스크를 식별합니다',
    fullDescription: '업로드된 계약서를 분석하여 핵심 조항 요약, 불리한 조건 식별, 수정 제안을 제공합니다.',
    category: 'document',
    author: '박영희',
    authorId: 'user-park',
    createdAt: '2026.03.05',
    lastModifiedAt: '2026.03.16',
    version: 'v1',
    callCount: 9,
    activatedBy: ['user-park'],
    isActivatedByMe: false,
    status: 'active',
    creationSource: 'chat',
    instructionBody: '# 계약서 검토 보조\n\n## 역할\n법무 검토 보조 전문가입니다.',
    parameters: [],
    attachments: [
      { id: 'att-4', path: 'references/contract-checklist.md', fileName: 'contract-checklist.md', fileType: 'text', content: '# 계약서 검토 체크리스트\n...', size: 256 },
    ],
    versionHistory: [
      { version: 'v1', modifiedAt: '2026.03.05', modifiedBy: '박영희', changeEntries: [{ tag: '추가', subject: '최초 생성' }] },
    ],
  },
  {
    id: 'skill-slack-digest',
    name: 'Slack 채널 다이제스트',
    description: 'Slack 채널의 하루 대화를 핵심 요약으로 정리합니다',
    fullDescription: '지정된 Slack 채널의 대화를 수집하여 핵심 논의, 결정사항, 액션 아이템을 정리한 다이제스트를 생성합니다.',
    category: 'communication',
    author: '이민수',
    authorId: 'user-lee',
    createdAt: '2026.02.25',
    lastModifiedAt: '2026.03.12',
    version: 'v1',
    callCount: 19,
    activatedBy: ['user-lee', 'user-hong'],
    isActivatedByMe: false,
    status: 'active',
    creationSource: 'chat',
    instructionBody: '# Slack 채널 다이제스트\n\n## 역할\n커뮤니케이션 요약 전문가입니다.',
    parameters: [
      { key: 'channel', type: 'string', value: '#general', defaultValue: '', description: '대상 Slack 채널' },
    ],
    attachments: [],
    versionHistory: [
      { version: 'v1', modifiedAt: '2026.02.25', modifiedBy: '이민수', changeEntries: [{ tag: '추가', subject: '최초 생성' }] },
    ],
  },
  {
    id: 'skill-erp-query',
    name: 'ERP 데이터 질의',
    description: '자연어로 ERP 데이터를 조회하고 결과를 표로 정리합니다',
    fullDescription: '자연어 질의를 SQL로 변환하여 영림원 ERP 데이터를 조회하고, 결과를 보기 좋은 표로 정리합니다.',
    category: 'data-analysis',
    author: '이민수',
    authorId: 'user-lee',
    createdAt: '2026.01.15',
    lastModifiedAt: '2026.03.08',
    version: 'v2',
    callCount: 65,
    activatedBy: ['user-lee', 'user-kim', 'user-hong', 'user-choi'],
    isActivatedByMe: false,
    status: 'active',
    creationSource: 'chat',
    instructionBody: '# ERP 데이터 질의\n\n## 역할\nERP 데이터 조회 전문가입니다.',
    parameters: [
      { key: 'max_rows', type: 'number', value: '100', defaultValue: '50', description: '최대 결과 행 수' },
    ],
    attachments: [],
    versionHistory: [
      {
        version: 'v2',
        modifiedAt: '2026.03.08',
        modifiedBy: '이민수',
        changeEntries: [
          { tag: '개선', subject: 'JOIN 최적화 로직', impact: '복잡한 다중 테이블 조인 시 실행 속도 40% 향상' },
          { tag: '추가', subject: '쿼리 실행 계획 표시 옵션' },
        ],
      },
      { version: 'v1', modifiedAt: '2026.01.15', modifiedBy: '이민수', changeEntries: [{ tag: '추가', subject: '최초 생성' }] },
    ],
  },
  // ── Copied skill from 이민수's 데이터 정제 ──────────────────────────────────
  {
    id: 'skill-data-cleansing-copy',
    name: '데이터 정제 (재무팀)',
    description: '재무팀 데이터에 특화된 정제 스킬',
    fullDescription: '이민수의 데이터 정제 스킬을 기반으로 재무팀 특화 정제 로직을 추가한 버전입니다.',
    category: 'data-analysis',
    author: '최수진',
    authorId: 'user-choi',
    createdAt: '2026.03.15',
    lastModifiedAt: '2026.03.20',
    version: 'v1',
    callCount: 5,
    activatedBy: ['user-choi'],
    isActivatedByMe: false,
    status: 'active',
    creationSource: 'copied',
    copySource: {
      originalSkillId: 'skill-data-cleansing',
      originalSkillName: '데이터 정제',
      originalAuthor: '이민수',
    },
    instructionBody: '# 데이터 정제 (재무팀)\n\n## 역할\n재무팀 데이터 정제 전문가입니다.',
    parameters: [
      { key: 'missing_strategy', type: 'string', value: 'zero-fill', defaultValue: 'zero-fill', description: '결측값을 0으로 처리' },
    ],
    attachments: [],
    versionHistory: [
      {
        version: 'v1',
        modifiedAt: '2026.03.15',
        modifiedBy: '최수진',
        changeEntries: [{ tag: '추가', subject: '이민수의 \'데이터 정제\' v2에서 복사' }],
      },
    ],
  },
];
