/**
 * Chain of Thought (CoT) 관련 타입 정의
 */

// CoT 단계 타입
export type CoTStepType = 'analyzing' | 'searching' | 'reasoning' | 'generating';

// 개별 단계 인터페이스
export interface CoTStep {
  id: CoTStepType;
  label: string;           // 진행 중 라벨 (예: "분석 중")
  labelComplete: string;   // 완료 시 라벨 (예: "질문 분석 완료")
  icon: string;            // 이모지 아이콘
  description: string;     // 단계 설명
  detailMessages: string[]; // 상세 사고 과정 메시지
}

// CoT 컴포넌트 Props
export interface ChainOfThoughtProps {
  isActive: boolean;              // CoT 표시 여부
  onComplete?: () => void;        // 모든 단계 완료 콜백
  stepDuration?: number;          // 각 단계 지속 시간 (ms, 기본: 1500)
}

// CoT 단계 아이템 Props
export interface CoTStepItemProps {
  step: CoTStep;
  stepIndex: number;
  isActive: boolean;
  isComplete: boolean;
  isVisible: boolean;
}

// CoT 진행 표시기 Props
export interface CoTStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
}
