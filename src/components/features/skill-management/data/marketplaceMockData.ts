import type { MarketplaceSkill } from '@/types/skill-management.types';

// ── Marketplace Skills (v10/v11) ─────────────────────────────────────────────
// 전사 공개 스킬 목 데이터: 3개 팀 × 8개 스킬

export const mockMarketplaceSkills: MarketplaceSkill[] = [
  // ── 영업팀 (3개) ──────────────────────────────────────────────────────────
  {
    id: 'mkt-sales-pipeline',
    name: '영업 파이프라인 분석',
    description: '영업 기회 단계별 전환율과 파이프라인 건전성을 분석합니다',
    fullDescription: 'CRM 데이터를 기반으로 영업 기회를 단계별(리드→제안→협상→계약)로 분류하고, 전환율·평균 체류 기간·예상 매출을 시각화합니다.',
    category: 'data-analysis',
    author: '박지훈',
    authorId: 'user-ext-park-jh',
    authorTeam: '영업팀',
    createdAt: '2026.01.05',
    lastModifiedAt: '2026.03.25',
    version: 'v4',
    callCount: 89,
    activatedBy: ['user-ext-park-jh', 'user-ext-yoon', 'user-ext-na'],
    isActivatedByMe: false,
    status: 'active',
    creationSource: 'chat',
    isPublishedToMarketplace: true,
    instructionBody: '# 영업 파이프라인 분석\n\n## 역할\nCRM 데이터를 기반으로 영업 파이프라인 건전성을 분석하는 에이전트입니다.\n\n## 분석 항목\n1. 단계별 전환율 (리드→제안→협상→계약)\n2. 평균 체류 기간\n3. 예상 매출 파이프라인\n4. 이탈 위험 기회 식별',
    parameters: [
      { key: 'period', type: 'string', value: '2026-Q1', defaultValue: 'current-quarter', description: '분석 대상 기간' },
      { key: 'team', type: 'string', value: 'all', defaultValue: 'all', description: '대상 영업팀' },
    ],
    attachments: [],
    versionHistory: [
      {
        version: 'v4',
        modifiedAt: '2026.03.25',
        modifiedBy: '박지훈',
        changeEntries: [
          { tag: '추가', subject: '이탈 위험 기회 자동 식별', impact: '30일 이상 단계 변화 없는 기회를 자동으로 하이라이트' },
          { tag: '개선', subject: '전환율 계산 로직 개선', impact: '분모에서 취소 건 제외하여 정확도 향상' },
        ],
      },
      {
        version: 'v3',
        modifiedAt: '2026.03.10',
        modifiedBy: '박지훈',
        changeEntries: [{ tag: '추가', subject: '팀별 필터링 지원' }],
      },
      { version: 'v2', modifiedAt: '2026.02.15', modifiedBy: '박지훈', changeEntries: [{ tag: '변경', subject: '차트 형식 개선' }] },
      { version: 'v1', modifiedAt: '2026.01.05', modifiedBy: '박지훈', changeEntries: [{ tag: '추가', subject: '최초 생성' }] },
    ],
    evalResult: {
      evaluatedAt: '2026.03.25',
      qualityStatus: 'partial-failure',
      testPrompts: [
        {
          prompt: '2026년 1분기 영업 파이프라인 전환율을 단계별로 분석해줘',
          passed: true,
          expectations: [
            { id: 'e1-1', label: '단계별 전환율 출력', passed: true, evidence: '리드→제안→협상→계약 각 전환율이 수치로 출력됨' },
            { id: 'e1-2', label: '분기 파라미터 반영', passed: true, evidence: 'period=2026-Q1 기준 데이터로 분석됨' },
            { id: 'e1-3', label: '이탈 위험 기회 식별', passed: true, evidence: '30일 이상 정체 기회 3건 하이라이트 표시됨' },
          ],
        },
        {
          prompt: '전체 팀이 아닌 강남 지역 영업팀만 필터링해서 파이프라인 현황 보여줘',
          passed: false,
          expectations: [
            { id: 'e2-1', label: '지역 단위 팀 필터 지원', passed: false, evidence: 'team 파라미터가 전사/팀 단위만 지원하며 지역 단위 필터 없음' },
            { id: 'e2-2', label: '미지원 파라미터 안내', passed: true, evidence: '지원하지 않는 필터임을 사용자에게 안내함' },
          ],
        },
        {
          prompt: '이번 분기 예상 매출 파이프라인 총합을 계산해줘',
          passed: true,
          expectations: [
            { id: 'e3-1', label: '예상 매출 합산 출력', passed: true, evidence: '단계별 확률 가중치를 적용한 예상 매출 합계 제공됨' },
            { id: 'e3-2', label: '취소 건 제외 처리', passed: true, evidence: '취소 상태 기회는 집계에서 제외됨' },
          ],
        },
      ],
      analysisNote: 'team 파라미터가 전사·팀 단위만 지원하여 지역·담당자 단위 필터 요청 시 응답 불가. 파라미터 확장 필요.',
    },
    // Marketplace-specific
    orgCallCount: 142,
    activeTeamCount: 5,
    copyCount: 3,
    isPopular: true,
  },
  {
    id: 'mkt-customer-churn',
    name: '고객 이탈 예측',
    description: '고객 행동 데이터를 분석하여 이탈 위험 고객을 식별합니다',
    fullDescription: '최근 6개월 거래 빈도, 문의 이력, 클레임 건수 등을 종합 분석하여 이탈 확률을 예측하고 선제적 리텐션 액션을 제안합니다.',
    category: 'data-analysis',
    author: '윤서영',
    authorId: 'user-ext-yoon',
    authorTeam: '영업팀',
    createdAt: '2026.02.10',
    lastModifiedAt: '2026.03.18',
    version: 'v2',
    callCount: 34,
    activatedBy: ['user-ext-yoon', 'user-ext-park-jh'],
    isActivatedByMe: false,
    status: 'active',
    creationSource: 'chat',
    isPublishedToMarketplace: true,
    instructionBody: '# 고객 이탈 예측\n\n## 역할\n고객 행동 데이터 기반 이탈 예측 에이전트입니다.',
    parameters: [
      { key: 'lookback_months', type: 'number', value: '6', defaultValue: '6', description: '분석 기간 (개월)' },
    ],
    attachments: [],
    versionHistory: [
      {
        version: 'v2',
        modifiedAt: '2026.03.18',
        modifiedBy: '윤서영',
        changeEntries: [
          { tag: '추가', subject: '리텐션 액션 자동 제안', impact: '이탈 위험 등급별 맞춤 액션 3가지 제시' },
        ],
      },
      { version: 'v1', modifiedAt: '2026.02.10', modifiedBy: '윤서영', changeEntries: [{ tag: '추가', subject: '최초 생성' }] },
    ],
    evalResult: {
      evaluatedAt: '2026.03.18',
      qualityStatus: 'verified',
      testPrompts: [
        {
          prompt: '최근 6개월 거래 데이터 기준으로 이탈 위험 고객 목록을 뽑아줘',
          passed: true,
          expectations: [
            { id: 'e1-1', label: '이탈 위험 고객 식별', passed: true, evidence: '이탈 확률 상위 고객 목록이 순위별로 출력됨' },
            { id: 'e1-2', label: 'lookback_months 파라미터 반영', passed: true, evidence: '기본값 6개월 기준 데이터 적용됨' },
          ],
        },
        {
          prompt: '이탈 위험 고객 A사에 대한 리텐션 액션을 추천해줘',
          passed: true,
          expectations: [
            { id: 'e2-1', label: '이탈 위험 등급 분류', passed: true, evidence: '고위험 등급으로 분류 후 맞춤 액션 3가지 제시됨' },
            { id: 'e2-2', label: '액션 구체성', passed: true, evidence: '할인 제공, 전담 AM 배정, 정기 점검 방문 등 실행 가능한 액션 포함' },
          ],
        },
      ],
    },
    orgCallCount: 67,
    activeTeamCount: 3,
    copyCount: 1,
    isPopular: false,
  },
  {
    id: 'mkt-deal-summary',
    name: '딜 요약 리포트',
    description: '개별 영업 딜의 진행 상황을 한 페이지 리포트로 요약합니다',
    fullDescription: '특정 영업 기회에 대한 고객 정보, 제안 이력, 경쟁 현황, 다음 액션을 한 페이지 요약 리포트로 생성합니다.',
    category: 'document',
    author: '나은혜',
    authorId: 'user-ext-na',
    authorTeam: '영업팀',
    createdAt: '2026.03.01',
    lastModifiedAt: '2026.03.22',
    version: 'v1',
    callCount: 21,
    activatedBy: ['user-ext-na', 'user-ext-park-jh'],
    isActivatedByMe: false,
    status: 'active',
    creationSource: 'chat',
    isPublishedToMarketplace: true,
    instructionBody: '# 딜 요약 리포트\n\n## 역할\n영업 딜 상세 정보를 한 페이지 리포트로 요약하는 에이전트입니다.',
    parameters: [
      { key: 'deal_id', type: 'string', value: '', defaultValue: '', description: '딜 ID' },
    ],
    attachments: [],
    versionHistory: [
      { version: 'v1', modifiedAt: '2026.03.01', modifiedBy: '나은혜', changeEntries: [{ tag: '추가', subject: '최초 생성' }] },
    ],
    evalResult: {
      evaluatedAt: '2026.03.22',
      qualityStatus: 'verified',
      testPrompts: [
        {
          prompt: '딜 ID DEA-2026-038에 대한 요약 리포트를 생성해줘',
          passed: true,
          expectations: [
            { id: 'e1-1', label: '고객 정보 포함', passed: true, evidence: '고객사명·담당자·연락처가 리포트에 포함됨' },
            { id: 'e1-2', label: '제안 이력 요약', passed: true, evidence: '최근 3건의 제안 이력이 시간순으로 정리됨' },
            { id: 'e1-3', label: '다음 액션 명시', passed: true, evidence: '예정된 다음 미팅 일정과 준비 사항이 기술됨' },
          ],
        },
        {
          prompt: '경쟁사 현황도 포함해서 딜 요약 리포트 만들어줘',
          passed: true,
          expectations: [
            { id: 'e2-1', label: '경쟁사 정보 포함', passed: true, evidence: '경쟁사 및 비교 강점이 리포트 별도 섹션에 포함됨' },
            { id: 'e2-2', label: '한 페이지 분량 유지', passed: true, evidence: '출력 분량이 A4 1페이지 이내로 구성됨' },
          ],
        },
      ],
    },
    orgCallCount: 45,
    activeTeamCount: 2,
    copyCount: 0,
    isPopular: false,
  },

  // ── HR팀 (3개) ────────────────────────────────────────────────────────────
  {
    id: 'mkt-hr-onboarding',
    name: '신규 입사자 온보딩 가이드',
    description: '신규 입사자 맞춤형 온보딩 체크리스트와 안내 문서를 생성합니다',
    fullDescription: '부서, 직급, 업무 영역에 따라 맞춤형 온보딩 체크리스트를 생성하고, 필수 교육·시스템 접근 권한·멘토 매칭 정보를 안내합니다.',
    category: 'automation',
    author: '정하늘',
    authorId: 'user-ext-jung',
    authorTeam: 'HR팀',
    createdAt: '2026.01.20',
    lastModifiedAt: '2026.03.15',
    version: 'v3',
    callCount: 56,
    activatedBy: ['user-ext-jung', 'user-ext-song'],
    isActivatedByMe: false,
    status: 'active',
    creationSource: 'chat',
    isPublishedToMarketplace: true,
    instructionBody: '# 신규 입사자 온보딩 가이드\n\n## 역할\n신규 입사자 맞춤형 온보딩 가이드를 생성하는 에이전트입니다.',
    parameters: [
      { key: 'department', type: 'string', value: '', defaultValue: '', description: '배정 부서' },
      { key: 'position', type: 'string', value: '', defaultValue: '', description: '직급' },
    ],
    attachments: [],
    versionHistory: [
      {
        version: 'v3',
        modifiedAt: '2026.03.15',
        modifiedBy: '정하늘',
        changeEntries: [
          { tag: '추가', subject: '멘토 자동 매칭 로직', impact: '동일 부서 선배 중 업무 유사도 기준으로 자동 추천' },
          { tag: '개선', subject: 'IT 시스템 접근 권한 안내 상세화' },
        ],
      },
      { version: 'v2', modifiedAt: '2026.02.20', modifiedBy: '정하늘', changeEntries: [{ tag: '추가', subject: '부서별 필수 교육 목록 연동' }] },
      { version: 'v1', modifiedAt: '2026.01.20', modifiedBy: '정하늘', changeEntries: [{ tag: '추가', subject: '최초 생성' }] },
    ],
    evalResult: {
      evaluatedAt: '2026.03.15',
      qualityStatus: 'verified',
      testPrompts: [
        {
          prompt: '개발팀 신입 사원 온보딩 체크리스트를 만들어줘',
          passed: true,
          expectations: [
            { id: 'e1-1', label: '부서 맞춤 체크리스트', passed: true, evidence: '개발팀 특화 항목(GitHub 계정 생성, 개발 환경 설정 등) 포함됨' },
            { id: 'e1-2', label: '시스템 접근 권한 안내', passed: true, evidence: '필요한 시스템별 권한 신청 절차가 목록으로 제공됨' },
          ],
        },
        {
          prompt: '멘토도 자동으로 추천해줘',
          passed: true,
          expectations: [
            { id: 'e2-1', label: '멘토 자동 추천', passed: true, evidence: '동일 부서 선배 중 업무 유사도 기준 상위 2명 추천됨' },
            { id: 'e2-2', label: '추천 근거 제시', passed: true, evidence: '추천 이유(유사 업무 경험, 연차 등)가 함께 표시됨' },
          ],
        },
        {
          prompt: '마케팅팀 팀장급 온보딩 안내 문서를 생성해줘',
          passed: true,
          expectations: [
            { id: 'e3-1', label: '직급별 항목 차별화', passed: true, evidence: '팀장 직급에 맞는 리더십 과정·임원 면담 일정 항목 포함됨' },
            { id: 'e3-2', label: '필수 교육 목록 연동', passed: true, evidence: '마케팅팀 필수 교육 과정 3개가 목록에 포함됨' },
          ],
        },
      ],
    },
    orgCallCount: 98,
    activeTeamCount: 7,
    copyCount: 4,
    isPopular: false,
  },
  {
    id: 'mkt-hr-survey',
    name: '직원 만족도 분석',
    description: '설문 결과를 분석하여 조직 만족도 현황과 개선점을 도출합니다',
    fullDescription: '직원 만족도 설문 결과를 항목별로 분석하고, 부서·연차·직급별 교차 분석 결과와 개선 우선순위를 리포트로 제공합니다.',
    category: 'data-analysis',
    author: '송민지',
    authorId: 'user-ext-song',
    authorTeam: 'HR팀',
    createdAt: '2026.01.15',
    lastModifiedAt: '2026.03.20',
    version: 'v2',
    callCount: 78,
    activatedBy: ['user-ext-song', 'user-ext-jung'],
    isActivatedByMe: false,
    status: 'active',
    creationSource: 'chat',
    isPublishedToMarketplace: true,
    instructionBody: '# 직원 만족도 분석\n\n## 역할\n직원 만족도 설문 데이터를 심층 분석하는 에이전트입니다.',
    parameters: [
      { key: 'survey_id', type: 'string', value: '', defaultValue: '', description: '설문 ID' },
    ],
    attachments: [],
    versionHistory: [
      {
        version: 'v2',
        modifiedAt: '2026.03.20',
        modifiedBy: '송민지',
        changeEntries: [
          { tag: '추가', subject: '부서·연차별 교차 분석', impact: '세부 집단별 만족도 차이를 수치로 비교 가능' },
          { tag: '변경', subject: '리포트 출력 형식: 텍스트 → 차트 + 텍스트' },
        ],
      },
      { version: 'v1', modifiedAt: '2026.01.15', modifiedBy: '송민지', changeEntries: [{ tag: '추가', subject: '최초 생성' }] },
    ],
    evalResult: {
      evaluatedAt: '2026.03.20',
      qualityStatus: 'verified',
      testPrompts: [
        {
          prompt: '2026년 상반기 전사 직원 만족도 설문 결과를 분석해줘',
          passed: true,
          expectations: [
            { id: 'e1-1', label: '항목별 분석 결과 제공', passed: true, evidence: '급여, 복지, 성장 기회 등 항목별 평균 점수가 출력됨' },
            { id: 'e1-2', label: '개선 우선순위 도출', passed: true, evidence: '점수 낮은 순으로 개선 우선순위 3개 제시됨' },
          ],
        },
        {
          prompt: '부서별·연차별 교차 분석 결과를 보여줘',
          passed: true,
          expectations: [
            { id: 'e2-1', label: '부서별 교차 분석', passed: true, evidence: '전 부서 항목별 만족도 비교 표가 생성됨' },
            { id: 'e2-2', label: '연차별 교차 분석', passed: true, evidence: '1~3년차, 4~7년차, 8년차 이상으로 그룹화하여 비교됨' },
            { id: 'e2-3', label: '차트 포함 출력', passed: true, evidence: '수치 비교 차트와 텍스트 해석이 함께 제공됨' },
          ],
        },
      ],
    },
    orgCallCount: 198,
    activeTeamCount: 9,
    copyCount: 6,
    isPopular: true,
  },
  {
    id: 'mkt-hr-policy',
    name: '인사 규정 Q&A',
    description: '인사 규정과 복리후생 관련 질문에 정확한 답변을 제공합니다',
    fullDescription: '최신 인사 규정·복리후생·휴가 정책 등을 기반으로 직원 질문에 조항 근거를 포함한 정확한 답변을 제공합니다.',
    category: 'communication',
    author: '정하늘',
    authorId: 'user-ext-jung',
    authorTeam: 'HR팀',
    createdAt: '2026.02.01',
    lastModifiedAt: '2026.03.10',
    version: 'v1',
    callCount: 41,
    activatedBy: ['user-ext-jung'],
    isActivatedByMe: false,
    status: 'active',
    creationSource: 'chat',
    isPublishedToMarketplace: true,
    instructionBody: '# 인사 규정 Q&A\n\n## 역할\n인사 규정 기반 질의응답 에이전트입니다.',
    parameters: [],
    attachments: [
      { id: 'att-mkt-1', path: 'references/hr-policy-2026.pdf', fileName: 'hr-policy-2026.pdf', fileType: 'binary', size: 2048 },
    ],
    versionHistory: [
      { version: 'v1', modifiedAt: '2026.02.01', modifiedBy: '정하늘', changeEntries: [{ tag: '추가', subject: '최초 생성' }] },
    ],
    evalResult: {
      evaluatedAt: '2026.03.10',
      qualityStatus: 'verified',
      testPrompts: [
        {
          prompt: '연차 휴가 사용 기준이 어떻게 되나요?',
          passed: true,
          expectations: [
            { id: 'e1-1', label: '규정 조항 근거 포함', passed: true, evidence: '인사 규정 제12조 인용하여 답변 제공됨' },
            { id: 'e1-2', label: '정확한 기준 안내', passed: true, evidence: '입사 1년 미만·이상 연차 발생 기준이 정확히 안내됨' },
          ],
        },
        {
          prompt: '육아휴직 신청 절차와 복직 후 처우를 알려줘',
          passed: true,
          expectations: [
            { id: 'e2-1', label: '신청 절차 안내', passed: true, evidence: '육아휴직 신청 서류·기한·제출처가 단계별로 안내됨' },
            { id: 'e2-2', label: '복직 후 처우 설명', passed: true, evidence: '호봉 인정 및 동일 직무 복직 원칙이 규정 기반으로 설명됨' },
          ],
        },
        {
          prompt: '경조사 지원금 기준을 알려줘',
          passed: true,
          expectations: [
            { id: 'e3-1', label: '경조사 유형별 지원금 안내', passed: true, evidence: '결혼·출산·상조 등 유형별 지원금액이 표로 제공됨' },
            { id: 'e3-2', label: '신청 방법 포함', passed: true, evidence: '지원금 신청 방법과 첨부 서류가 함께 안내됨' },
          ],
        },
      ],
    },
    orgCallCount: 76,
    activeTeamCount: 4,
    copyCount: 2,
    isPopular: false,
  },

  // ── 재무팀 (2개) ──────────────────────────────────────────────────────────
  {
    id: 'mkt-fin-budget',
    name: '예산 집행 현황 분석',
    description: '부서별 예산 집행률과 잔여 예산을 분석하여 리포트를 생성합니다',
    fullDescription: '회계 시스템 데이터를 기반으로 부서별 예산 배정액·집행액·잔여액을 분석하고, 집행률 이상 부서를 식별합니다.',
    category: 'data-analysis',
    author: '한도윤',
    authorId: 'user-ext-han',
    authorTeam: '재무팀',
    createdAt: '2026.01.10',
    lastModifiedAt: '2026.03.28',
    version: 'v3',
    callCount: 52,
    activatedBy: ['user-ext-han', 'user-ext-kwon'],
    isActivatedByMe: false,
    status: 'active',
    creationSource: 'chat',
    isPublishedToMarketplace: true,
    instructionBody: '# 예산 집행 현황 분석\n\n## 역할\n예산 집행 현황을 분석하고 이상 징후를 식별하는 에이전트입니다.',
    parameters: [
      { key: 'fiscal_year', type: 'string', value: '2026', defaultValue: 'current-year', description: '회계연도' },
      { key: 'department', type: 'string', value: 'all', defaultValue: 'all', description: '대상 부서' },
    ],
    attachments: [],
    versionHistory: [
      {
        version: 'v3',
        modifiedAt: '2026.03.28',
        modifiedBy: '한도윤',
        changeEntries: [
          { tag: '추가', subject: '집행률 이상 탐지 알림', impact: '목표 대비 ±20% 이상 편차 시 자동 하이라이트' },
          { tag: '개선', subject: '분기별 추이 비교 차트 추가' },
        ],
      },
      { version: 'v2', modifiedAt: '2026.02.25', modifiedBy: '한도윤', changeEntries: [{ tag: '추가', subject: '부서별 필터링' }] },
      { version: 'v1', modifiedAt: '2026.01.10', modifiedBy: '한도윤', changeEntries: [{ tag: '추가', subject: '최초 생성' }] },
    ],
    evalResult: {
      evaluatedAt: '2026.03.28',
      qualityStatus: 'partial-failure',
      testPrompts: [
        {
          prompt: '2026년 마케팅팀 예산 집행률을 분석해줘',
          passed: true,
          expectations: [
            { id: 'e1-1', label: '집행률 수치 출력', passed: true, evidence: '배정액·집행액·잔여액이 수치로 출력됨' },
            { id: 'e1-2', label: '이상 편차 하이라이트', passed: true, evidence: '목표 대비 ±20% 초과 부서가 자동 표시됨' },
          ],
        },
        {
          prompt: '분기별 예산 집행 추이를 전년도와 비교해줘',
          passed: false,
          expectations: [
            { id: 'e2-1', label: '전년도 데이터 비교', passed: false, evidence: '전년도 데이터 소스가 연동되지 않아 비교 불가' },
            { id: 'e2-2', label: '분기별 추이 출력', passed: true, evidence: '당해연도 분기별 집행 추이 차트는 정상 출력됨' },
          ],
        },
        {
          prompt: '예산 이상 징후가 발생한 부서 목록을 뽑아줘',
          passed: true,
          expectations: [
            { id: 'e3-1', label: '이상 부서 목록 출력', passed: true, evidence: '편차 기준 초과 부서 4곳이 리스트로 출력됨' },
            { id: 'e3-2', label: '편차 수치 명시', passed: true, evidence: '각 부서별 편차율이 수치로 함께 표시됨' },
          ],
        },
      ],
      analysisNote: '전년도 회계 데이터 소스 미연동으로 YoY 비교 요청 시 응답 불가. 데이터 소스 확장 필요.',
    },
    orgCallCount: 112,
    activeTeamCount: 6,
    copyCount: 2,
    isPopular: false,
  },
  {
    id: 'mkt-fin-invoice',
    name: '청구서 자동 검토',
    description: '수신 청구서의 주요 항목을 자동 검토하고 이상 내역을 식별합니다',
    fullDescription: '청구서 PDF를 업로드하면 금액·수량·단가·세금 계산을 자동 검증하고, 계약 조건과의 불일치 항목을 리포트합니다.',
    category: 'automation',
    author: '권지은',
    authorId: 'user-ext-kwon',
    authorTeam: '재무팀',
    createdAt: '2026.02.15',
    lastModifiedAt: '2026.03.20',
    version: 'v2',
    callCount: 38,
    activatedBy: ['user-ext-kwon', 'user-ext-han'],
    isActivatedByMe: false,
    status: 'active',
    creationSource: 'chat',
    isPublishedToMarketplace: true,
    instructionBody: '# 청구서 자동 검토\n\n## 역할\n수신 청구서를 자동으로 검토하고 이상 항목을 식별하는 에이전트입니다.',
    parameters: [],
    attachments: [],
    versionHistory: [
      {
        version: 'v2',
        modifiedAt: '2026.03.20',
        modifiedBy: '권지은',
        changeEntries: [
          { tag: '추가', subject: '계약 조건 대비 자동 검증', impact: '단가·할인율이 계약과 불일치 시 자동 플래깅' },
        ],
      },
      { version: 'v1', modifiedAt: '2026.02.15', modifiedBy: '권지은', changeEntries: [{ tag: '추가', subject: '최초 생성' }] },
    ],
    evalResult: {
      evaluatedAt: '2026.03.20',
      qualityStatus: 'verified',
      testPrompts: [
        {
          prompt: '첨부한 청구서 PDF의 금액 계산에 오류가 있는지 검토해줘',
          passed: true,
          expectations: [
            { id: 'e1-1', label: '금액·수량·단가 자동 검증', passed: true, evidence: '단가×수량 합계와 청구 총액 불일치 여부가 자동 확인됨' },
            { id: 'e1-2', label: '세금 계산 검증', passed: true, evidence: '부가세 10% 적용 여부가 라인별로 검증됨' },
          ],
        },
        {
          prompt: '이 청구서가 계약 조건과 맞는지 확인해줘',
          passed: true,
          expectations: [
            { id: 'e2-1', label: '단가 계약 대비 일치 여부', passed: true, evidence: '계약 단가와 청구 단가 불일치 항목 2건 자동 플래깅됨' },
            { id: 'e2-2', label: '할인율 검증', passed: true, evidence: '계약상 할인율이 청구서에 올바르게 반영됐는지 확인됨' },
            { id: 'e2-3', label: '이상 항목 리포트 출력', passed: true, evidence: '불일치 항목이 요약 리포트로 정리되어 제공됨' },
          ],
        },
      ],
    },
    orgCallCount: 85,
    activeTeamCount: 4,
    copyCount: 1,
    isPopular: false,
  },
];

// ── 마켓플레이스 팀 목록 (필터용) ────────────────────────────────────────────
export const MARKETPLACE_TEAMS = ['영업팀', 'HR팀', '재무팀'] as const;
