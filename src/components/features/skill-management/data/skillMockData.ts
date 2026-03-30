import type {
  TeamSkill,
  TeamMember,
  DynamicComparisonEntry,
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
    evalResult: {
      evaluatedAt: '2026.03.20',
      qualityStatus: 'partial-failure',
      testPrompts: [
        {
          prompt: '지난 6개월간 월별 매출 추이를 꺾은선 차트로 분석해줘',
          passed: true,
          expectations: [
            { id: 'chart_format', label: '차트 형식', passed: true, evidence: '꺾은선 차트 형태로 출력됨' },
            { id: 'period_accuracy', label: '기간 정확성', passed: true, evidence: '최근 6개월(2025.10~2026.03) 데이터 포함' },
            { id: 'data_labels', label: '데이터 레이블', passed: true, evidence: '월별 수치 레이블 표시됨' },
            { id: 'trend_analysis', label: '추세 설명', passed: true, evidence: '전월 대비 증감 추세에 대한 해석 포함' },
          ],
        },
        {
          prompt: '1분기 매출을 전년 동기와 비교해서 증감 원인 분석해줘',
          passed: true,
          expectations: [
            { id: 'yoy_comparison', label: '전년 비교', passed: true, evidence: '2025 Q1 vs 2026 Q1 비교 테이블 포함' },
            { id: 'cause_analysis', label: '원인 분석', passed: true, evidence: '제품군별 증감 원인 3가지 도출' },
          ],
        },
        {
          prompt: '매출 데이터에 3월이 비어있는데 그래도 분석 가능해?',
          passed: true,
          expectations: [
            { id: 'missing_detect', label: '결측 감지', passed: true, evidence: '3월 데이터 누락을 감지하고 사용자에게 알림' },
            { id: 'missing_handling', label: '결측 처리', passed: true, evidence: '누락 월을 보간 처리하여 차트 생성' },
            { id: 'caveat_display', label: '주의사항 명시', passed: true, evidence: '보간 데이터임을 범례에 표시' },
          ],
        },
        {
          prompt: 'Export the quarterly revenue report in English',
          passed: false,
          expectations: [
            { id: 'data_retrieval', label: '데이터 조회', passed: true, evidence: '분기 매출 데이터 정상 조회' },
            { id: 'report_structure', label: '보고서 구조', passed: true, evidence: '분기별 섹션으로 구성됨' },
            { id: 'multilang_output', label: '다국어 출력', passed: false, evidence: '영어 요청이나 한국어로 생성됨' },
            { id: 'lang_detection', label: '언어 감지', passed: false, evidence: '입력 언어에 따른 출력 언어 전환 실패' },
          ],
        },
      ],
      analysisNote: '월별·분기별 집계 데이터에 최적화되어 있습니다. 일별 트랜잭션 로우 데이터를 직접 넣으면 집계 과정에서 정확도가 떨어질 수 있습니다. 사전에 월별로 집계된 뷰 테이블 사용을 권장합니다.',
    },
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
        promptSnapshot: `# 매출 분석 리포트

## 역할
영림원 ERP 매출 데이터를 분석하고 경영진이 즉시 활용할 수 있는 리포트를 작성하는 에이전트입니다.

## 데이터 검증
- 빈 셀 발견 시 기본값(0)으로 자동 채움
- 숫자 형식 검증 후 비정상 값 경고 표시

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
- 차트는 인라인 Recharts 컴포넌트로 렌더링

## 트리거 조건
- "매출 분석", "매출 리포트", "분기 보고서"`,
      },
      {
        version: 'v2',
        modifiedAt: '2026.03.15',
        modifiedBy: '홍길동',
        changeEntries: [
          { tag: '추가', subject: '전월 대비 증감률 컬럼' },
          { tag: '개선', subject: '차트 레이블 가독성 향상', impact: '축 레이블에 단위(원, 건) 자동 추가' },
        ],
        promptSnapshot: `# 매출 분석 리포트

## 역할
영림원 ERP 매출 데이터를 분석하고 경영진이 즉시 활용할 수 있는 리포트를 작성하는 에이전트입니다.

## 사용 도구
- \`query_erp_sales(period, warehouse)\` — ERP 매출 데이터 조회
- \`render_recharts(spec)\` — 차트 컴포넌트 렌더링
- \`format_report(template, data)\` — 리포트 양식 자동 작성

## 분석 항목
1. **월별 매출 추이** — 표 형식, 전월 대비 증감율 포함
2. **전년 동기 비교** — \`comparison\` 파라미터가 \`true\`인 경우만 실행
3. **제품별 기여도** — 상위 10개 제품, 도넛 차트
4. **지역별 매출 분포** — 막대 차트, 가나다순 정렬

## 출력 형식
- 마크다운 보고서 (H1~H3 헤딩 구조)
- 핵심 수치는 **굵게**, 이상 항목은 ⚠️ 마킹
- 차트 축 레이블에 단위(원, 건) 자동 추가

## 트리거 조건
- "매출 분석", "매출 리포트"`,
      },
      {
        version: 'v1',
        modifiedAt: '2026.02.15',
        modifiedBy: '홍길동',
        changeEntries: [{ tag: '추가', subject: '최초 생성' }],
        promptSnapshot: `# 매출 분석 리포트

## 역할
영림원 ERP 매출 데이터를 분석하고 리포트를 작성하는 에이전트입니다.

## 사용 도구
- \`query_erp_sales(period, warehouse)\` — ERP 매출 데이터 조회

## 분석 항목
1. **월별 매출 추이** — 표 형식
2. **전년 동기 비교** — \`comparison\` 파라미터가 \`true\`인 경우만 실행
3. **제품별 기여도** — 상위 10개 제품, 도넛 차트
4. **지역별 매출 분포** — 막대 차트, 가나다순 정렬

## 출력 형식
- 마크다운 보고서 (H1~H3 헤딩 구조)
- 핵심 수치는 **굵게**, 이상 항목은 ⚠️ 마킹

## 트리거 조건
- "매출 분석", "매출 리포트"`,
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
    evalResult: {
      evaluatedAt: '2026.03.18',
      qualityStatus: 'verified',
      testPrompts: [
        {
          prompt: '개발팀 이번 주 업무 보고서 만들어줘',
          passed: true,
          expectations: [
            { id: 'team_sections', label: '팀원별 구분', passed: true, evidence: '팀원 5명 각각의 업무 섹션이 분리되어 있음' },
            { id: 'status_classification', label: '상태 분류', passed: true, evidence: '완료/진행 중/예정으로 올바르게 분류됨' },
            { id: 'format_standard', label: '양식 준수', passed: true, evidence: '표준 보고서 양식(헤딩, 표, 요약)을 따름' },
          ],
        },
        {
          prompt: '김철수만 빼고 나머지 팀원 업무 보고서 작성해줘',
          passed: true,
          expectations: [
            { id: 'member_filter', label: '멤버 필터링', passed: true, evidence: '김철수를 제외한 4명의 업무만 포함됨' },
            { id: 'completeness', label: '정보 완전성', passed: true, evidence: '제외된 멤버 외 모든 팀원의 업무가 누락 없이 포함' },
          ],
        },
        {
          prompt: '지난 주 보고서를 올해 목표 대비 진척률과 함께 정리해줘',
          passed: true,
          expectations: [
            { id: 'progress_rate', label: '진척률 포함', passed: true, evidence: '각 프로젝트별 목표 대비 진척률(%) 표시됨' },
            { id: 'week_reference', label: '주차 정확성', passed: true, evidence: '요청된 지난 주(W11) 데이터가 올바르게 반영됨' },
          ],
        },
      ],
    },
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
    evalResult: {
      evaluatedAt: '2026.03.22',
      qualityStatus: 'verified',
      testPrompts: [
        {
          prompt: '본사 창고 재고 점검해줘',
          passed: true,
          expectations: [
            { id: 'erp_wms_compare', label: 'ERP-WMS 비교', passed: true, evidence: 'ERP 재고와 WMS 실물 재고가 품목별로 비교됨' },
            { id: 'tolerance_applied', label: '허용 오차 적용', passed: true, evidence: '일반 품목 ±2%, 고가 품목 ±0.5% 기준 적용됨' },
            { id: 'discrepancy_table', label: '불일치 항목 표', passed: true, evidence: '3건의 불일치 항목이 표로 정리됨' },
          ],
        },
        {
          prompt: '전체 창고 재고 점검하고 원인 추정까지 해줘',
          passed: true,
          expectations: [
            { id: 'all_warehouses', label: '전체 창고 처리', passed: true, evidence: '3개 창고(본사, 부산, 광주) 전체 점검 완료' },
            { id: 'cause_estimation', label: '원인 추정', passed: true, evidence: '이동전표 누락, 입고 미반영 등 원인 추정 포함' },
          ],
        },
        {
          prompt: '고가 품목만 따로 점검해줘',
          passed: true,
          expectations: [
            { id: 'high_value_filter', label: '고가 품목 필터', passed: true, evidence: '단가 100만원 이상 품목 12건만 필터링되어 점검됨' },
            { id: 'strict_tolerance', label: '엄격 기준 적용', passed: true, evidence: '±0.5% 허용 오차 기준으로 점검됨' },
          ],
        },
      ],
    },
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
        promptSnapshot: `# 재고 정합성 점검

## 역할
영림원 ERP와 WMS 실물 재고를 비교·분석하여 불일치를 탐지하고 원인을 추적하는 에이전트입니다.

## 허용 오차
- 일반 품목: ±2%
- 고가 품목 (단가 100만원 이상): ±0.5%

## 점검 절차
1. ERP 재고와 WMS 실물 재고 조회
2. 품목별 수량 비교 (허용 오차 적용)
3. 불일치 항목 식별 및 원인 추정
4. 점검 결과 리포트 생성

## 출력 형식
- 불일치 항목 표 (품목코드, ERP수량, 실물수량, 차이, 오차율)
- 원인 추정 섹션 (이동전표 누락, 입고 미반영 등)
- 조치 권고사항`,
      },
      {
        version: 'v2',
        modifiedAt: '2026.02.28',
        modifiedBy: '홍길동',
        changeEntries: [
          { tag: '추가', subject: '다중 창고 지원', impact: 'warehouse 파라미터로 특정 창고 또는 전체 선택 가능' },
        ],
        promptSnapshot: `# 재고 정합성 점검

## 역할
영림원 ERP와 WMS 실물 재고를 비교·분석하여 불일치를 탐지하고 원인을 추적하는 에이전트입니다.

## 허용 오차
- 일반 품목: ±2%

## 점검 절차
1. ERP 재고와 WMS 실물 재고 조회 (다중 창고 지원)
2. 품목별 수량 비교 (허용 오차 적용)
3. 불일치 항목 식별
4. 점검 결과 리포트 생성

## 출력 형식
- 불일치 항목 표 (품목코드, ERP수량, 실물수량, 차이, 오차율)
- 조치 권고사항`,
      },
      {
        version: 'v1',
        modifiedAt: '2026.01.10',
        modifiedBy: '홍길동',
        changeEntries: [{ tag: '추가', subject: '최초 생성' }],
        promptSnapshot: `# 재고 정합성 점검

## 역할
영림원 ERP와 WMS 실물 재고를 비교·분석하여 불일치를 탐지하고 원인을 추적하는 에이전트입니다.

## 허용 오차
- 일반 품목: ±2%

## 점검 절차
1. ERP 재고와 WMS 실물 재고 조회
2. 품목별 수량 비교 (허용 오차 적용)
3. 불일치 항목 식별

## 출력 형식
- 불일치 항목 표 (품목코드, ERP수량, 실물수량, 차이, 오차율)`,
      },
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
    evalResult: {
      evaluatedAt: '2026.03.22',
      qualityStatus: 'verified',
      testPrompts: [
        {
          prompt: '올해 1~3분기 매출 트렌드 분석해줘',
          passed: true,
          expectations: [
            { id: 'quarterly_data', label: '분기별 데이터', passed: true, evidence: 'Q1~Q3 분기별 매출 데이터 포함' },
            { id: 'growth_rate', label: '성장률 계산', passed: true, evidence: '분기간 성장률이 정확하게 계산됨' },
            { id: 'seasonality', label: '계절성 분석', passed: true, evidence: '분기별 계절 패턴 해석 포함' },
          ],
        },
        {
          prompt: '작년 대비 분기별 변화 추이 보여줘',
          passed: true,
          expectations: [
            { id: 'yoy_quarterly', label: '전년 분기 비교', passed: true, evidence: '2025년 vs 2026년 분기별 비교 데이터 포함' },
            { id: 'chart_output', label: '차트 생성', passed: true, evidence: '막대 차트로 비교 시각화됨' },
          ],
        },
      ],
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
    evalResult: {
      evaluatedAt: '2026.03.15',
      qualityStatus: 'verified',
      testPrompts: [
        {
          prompt: '오늘 회의 내용 정리해줘. 참석자는 홍길동, 김철수, 박영희야',
          passed: true,
          expectations: [
            { id: 'attendee_list', label: '참석자 목록', passed: true, evidence: '3명의 참석자가 올바르게 기재됨' },
            { id: 'decision_items', label: '결정사항 정리', passed: true, evidence: '핵심 결정사항 4건이 별도 섹션으로 정리됨' },
            { id: 'action_items', label: '액션 아이템', passed: true, evidence: '담당자별 액션 아이템 5건이 체크리스트로 정리됨' },
          ],
        },
        {
          prompt: '30분짜리 짧은 스탠드업 미팅 정리해줘',
          passed: true,
          expectations: [
            { id: 'concise_format', label: '간결한 형식', passed: true, evidence: '요약 중심의 간결한 형식으로 작성됨' },
            { id: 'time_noted', label: '시간 기록', passed: true, evidence: '회의 시간(30분)이 헤더에 기록됨' },
          ],
        },
      ],
    },
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
    evalResult: {
      evaluatedAt: '2026.03.10',
      qualityStatus: 'partial-failure',
      testPrompts: [
        {
          prompt: '이 CSV에서 결측값이랑 이상치 정리해줘',
          passed: true,
          expectations: [
            { id: 'missing_handled', label: '결측값 처리', passed: true, evidence: '결측값 23건을 보간 처리하고 처리 로그 출력' },
            { id: 'outlier_detected', label: '이상치 감지', passed: true, evidence: 'Modified Z-Score 기반으로 이상치 7건 감지' },
            { id: 'report_generated', label: '처리 리포트', passed: true, evidence: '정제 전후 비교 요약 리포트 생성됨' },
          ],
        },
        {
          prompt: '500만 행 데이터도 처리할 수 있어?',
          passed: false,
          expectations: [
            { id: 'large_data', label: '대용량 처리', passed: false, evidence: '100만 행 이상 데이터에서 메모리 오류 발생' },
            { id: 'chunking', label: '청크 처리', passed: false, evidence: '배치 처리 로직이 미구현되어 전체 로드 시도' },
          ],
        },
        {
          prompt: '정제된 데이터를 다시 CSV로 내보내줘',
          passed: true,
          expectations: [
            { id: 'export_csv', label: 'CSV 내보내기', passed: true, evidence: '정제된 데이터가 UTF-8 CSV 파일로 정상 출력됨' },
            { id: 'encoding_correct', label: '인코딩 정확', passed: true, evidence: '한글 데이터가 깨지지 않고 올바르게 인코딩됨' },
          ],
        },
      ],
      analysisNote: '현재 100만 행 미만 데이터에 최적화되어 있습니다. 대용량 데이터 처리 시 사전에 청크 단위로 분할하여 입력하는 것을 권장합니다.',
    },
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
    evalResult: {
      evaluatedAt: '2026.03.19',
      qualityStatus: 'partial-failure',
      testPrompts: [
        {
          prompt: 'AI 전략 발표용 PPT 10장으로 만들어줘',
          passed: true,
          expectations: [
            { id: 'slide_count', label: '슬라이드 수', passed: true, evidence: '요청대로 10장의 슬라이드가 생성됨' },
            { id: 'structure', label: '발표 구조', passed: true, evidence: '표지-목차-본문-마무리 구조를 따름' },
            { id: 'visual_quality', label: '시각적 품질', passed: true, evidence: '일관된 폰트, 색상 테마 적용됨' },
          ],
        },
        {
          prompt: '차트가 포함된 재무 보고서 PPT를 만들어줘',
          passed: false,
          expectations: [
            { id: 'chart_inclusion', label: '차트 포함', passed: false, evidence: '차트 데이터가 텍스트 표로만 표현됨. 실제 차트 렌더링 실패' },
            { id: 'financial_format', label: '재무 양식', passed: true, evidence: '재무 보고서 표준 양식을 따름' },
          ],
        },
        {
          prompt: '다크 테마로 미니멀한 PPT 만들어줘',
          passed: true,
          expectations: [
            { id: 'dark_theme', label: '다크 테마', passed: true, evidence: '어두운 배경에 밝은 텍스트 조합 적용됨' },
            { id: 'minimal_design', label: '미니멀 디자인', passed: true, evidence: '슬라이드당 핵심 메시지 1개, 최소 텍스트' },
          ],
        },
      ],
    },
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
    evalResult: {
      evaluatedAt: '2026.03.05',
      qualityStatus: 'verified',
      testPrompts: [
        {
          prompt: '거래처에 납기 지연 사과 이메일 작성해줘',
          passed: true,
          expectations: [
            { id: 'tone_formal', label: '격식 톤', passed: true, evidence: '비즈니스 격식체로 작성됨' },
            { id: 'apology_included', label: '사과 표현', passed: true, evidence: '명확한 사과 표현과 대안 제시 포함' },
            { id: 'structure', label: '이메일 구조', passed: true, evidence: '인사-본문-마무리 3단 구조를 따름' },
          ],
        },
        {
          prompt: '영어로 해외 파트너에게 미팅 요청 이메일 써줘',
          passed: true,
          expectations: [
            { id: 'english_output', label: '영어 작성', passed: true, evidence: '유창한 비즈니스 영어로 작성됨' },
            { id: 'meeting_details', label: '미팅 정보', passed: true, evidence: '일시, 장소, 안건이 명확하게 기재됨' },
          ],
        },
      ],
    },
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
    evalResult: {
      evaluatedAt: '2026.03.16',
      qualityStatus: 'verified',
      testPrompts: [
        {
          prompt: '이 계약서에서 우리에게 불리한 조항 찾아줘',
          passed: true,
          expectations: [
            { id: 'risk_identification', label: '리스크 식별', passed: true, evidence: '불리한 조항 3건을 조항 번호와 함께 식별' },
            { id: 'suggestion', label: '수정 제안', passed: true, evidence: '각 불리 조항에 대한 수정 문구 제안 포함' },
          ],
        },
        {
          prompt: '계약 기간이랑 해지 조건만 요약해줘',
          passed: true,
          expectations: [
            { id: 'period_extracted', label: '계약 기간 추출', passed: true, evidence: '계약 시작일, 종료일, 자동 갱신 조건이 정확히 추출됨' },
            { id: 'termination_summary', label: '해지 조건 요약', passed: true, evidence: '해지 사유, 통지 기간, 위약금 조건이 요약됨' },
          ],
        },
      ],
    },
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
    evalResult: {
      evaluatedAt: '2026.03.12',
      qualityStatus: 'partial-failure',
      testPrompts: [
        {
          prompt: '#general 채널 오늘 대화 요약해줘',
          passed: true,
          expectations: [
            { id: 'channel_read', label: '채널 조회', passed: true, evidence: '#general 채널의 당일 대화가 수집됨' },
            { id: 'key_discussions', label: '핵심 논의', passed: true, evidence: '주요 논의 3건이 요약됨' },
            { id: 'action_items', label: '액션 아이템', passed: true, evidence: '후속 조치 필요 항목 2건이 식별됨' },
          ],
        },
        {
          prompt: 'DM 채널도 다이제스트에 포함시켜줘',
          passed: false,
          expectations: [
            { id: 'dm_access', label: 'DM 접근', passed: false, evidence: 'DM 채널에 대한 접근 권한이 없어 수집 실패' },
            { id: 'error_handling', label: '에러 처리', passed: true, evidence: '접근 불가 사유를 사용자에게 안내함' },
          ],
        },
      ],
      analysisNote: '공개 채널(#으로 시작하는 채널)만 조회 가능합니다. DM 및 비공개 채널은 보안 정책상 접근이 제한됩니다.',
    },
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
    evalResult: {
      evaluatedAt: '2026.03.08',
      qualityStatus: 'verified',
      testPrompts: [
        {
          prompt: '이번 달 입고된 품목 중 단가가 100만원 넘는 거 보여줘',
          passed: true,
          expectations: [
            { id: 'sql_generation', label: 'SQL 생성', passed: true, evidence: '자연어를 정확한 SQL 쿼리로 변환됨' },
            { id: 'filter_applied', label: '필터 적용', passed: true, evidence: '단가 100만원 초과 조건이 WHERE절에 반영됨' },
            { id: 'table_format', label: '표 정리', passed: true, evidence: '결과가 보기 좋은 마크다운 표로 정리됨' },
          ],
        },
        {
          prompt: '지난 분기 매출 TOP 10 거래처 알려줘',
          passed: true,
          expectations: [
            { id: 'ranking', label: '랭킹 정확', passed: true, evidence: 'ORDER BY + LIMIT 10으로 정확한 TOP 10 추출' },
            { id: 'period_correct', label: '기간 정확', passed: true, evidence: '지난 분기(2025 Q4) 데이터만 조회됨' },
          ],
        },
      ],
    },
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
    evalResult: {
      evaluatedAt: '2026.03.20',
      qualityStatus: 'verified',
      testPrompts: [
        {
          prompt: '재무팀 월말 결산 데이터 정제해줘',
          passed: true,
          expectations: [
            { id: 'zero_fill', label: '0값 채움', passed: true, evidence: '결측값이 0으로 올바르게 채워짐 (재무팀 정책)' },
            { id: 'accounting_format', label: '회계 형식', passed: true, evidence: '금액 데이터가 회계 형식으로 포맷팅됨' },
          ],
        },
      ],
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

// ── Dynamic Version Comparison Mock Data ──────────────────────────────────────
// Key format: "skillId:baseVersion:targetVersion"
export const MOCK_DYNAMIC_COMPARISONS: Record<string, DynamicComparisonEntry[]> = {
  'skill-sales-report:v3:v1': [
    { tag: '추가', subject: '데이터 검증 단계', impact: 'v1에서는 빈 셀이 있으면 해당 월이 누락됨. v3에서 기본값(0) 자동 채움으로 분석 오류 방지', occurredIn: 'v3' },
    { tag: '변경', subject: '출력 형식: 표 → 차트', impact: 'v1의 텍스트 표 형식에서 인라인 Recharts 차트로 전환', occurredIn: 'v3' },
    { tag: '추가', subject: '전월 대비 증감률 컬럼', occurredIn: 'v2' },
    { tag: '개선', subject: '차트 레이블 가독성 향상', impact: '축 레이블에 단위(원, 건) 자동 추가', occurredIn: 'v2' },
    { tag: '추가', subject: '트리거 조건에 \'분기 보고서\' 추가', occurredIn: 'v3' },
  ],
  'skill-inventory-check:v3:v1': [
    { tag: '추가', subject: '고가 품목 별도 허용 오차 기준 (±0.5%)', impact: 'v1에서는 모든 품목에 ±2% 단일 기준 적용. v3에서 단가 100만원 이상 품목에 더 엄격한 기준 추가', occurredIn: 'v3' },
    { tag: '개선', subject: '점검 결과 리포트에 원인 추정 섹션 추가', impact: 'v1에서는 불일치 항목만 나열. v3에서 이동전표 누락 등 원인 추정까지 제공', occurredIn: 'v3' },
    { tag: '추가', subject: '다중 창고 지원', impact: 'v1에서는 단일 창고만 점검 가능. v2에서 warehouse 파라미터로 전체 선택 가능', occurredIn: 'v2' },
  ],
};
