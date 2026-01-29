import type { CoTStep } from './types';

/**
 * Chain of Thought 4단계 정의
 * 분석 → 검색 → 추론 → 생성
 */
export const COT_STEPS: CoTStep[] = [
  {
    id: 'analyzing',
    label: '분석 중',
    labelComplete: '질문 분석 완료',
    icon: '🔍',
    description: '요청을 분석하고 있습니다...',
    detailMessages: [
      '사용자 질문의 핵심 의도를 파악하고 있습니다.',
      '필요한 데이터 유형과 분석 범위를 결정합니다.',
    ],
  },
  {
    id: 'searching',
    label: '검색 중',
    labelComplete: '데이터 수집 완료',
    icon: '📊',
    description: '관련 데이터를 조회하고 있습니다...',
    detailMessages: [
      'ERP 시스템에서 관련 데이터를 조회합니다.',
      '비교 분석에 필요한 KPI 지표를 수집합니다.',
    ],
  },
  {
    id: 'reasoning',
    label: '추론 중',
    labelComplete: '분석 추론 완료',
    icon: '🧠',
    description: '데이터를 분석하고 인사이트를 도출합니다...',
    detailMessages: [
      '수집된 데이터의 패턴과 이상치를 분석합니다.',
      '비즈니스 맥락에 맞는 인사이트를 도출합니다.',
    ],
  },
  {
    id: 'generating',
    label: '생성 중',
    labelComplete: '답변 생성 완료',
    icon: '✍️',
    description: '최적의 답변을 생성합니다...',
    detailMessages: [
      '분석 결과를 바탕으로 명확한 답변을 구성합니다.',
      '시각화 자료와 함께 결과를 제시합니다.',
    ],
  },
];

// 기본 단계 지속 시간 (ms)
export const DEFAULT_STEP_DURATION = 1500;
