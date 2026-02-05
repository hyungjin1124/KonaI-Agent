import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ToolCallGroup } from './ToolCall';
import { PPTDoneResponse } from './AgentResponse';
import { ProgressTask, ToolType } from '../types';
import { PPTConfig, HitlOption } from '../../../../types';
import usePPTScenario from '../../../../hooks/usePPTScenario';
import { AnalysisScopeData, DataVerificationData } from './HITLFloatingPanel';
import type { SlideFile } from './ToolCall/constants';

// HITL 플로팅 패널용 상태 타입
export interface ActiveHitl {
  stepId: string;
  toolType: ToolType;
  question: string;
  options: HitlOption[];
  // 매출 분석 시나리오 HITL 데이터 (옵셔널)
  analysisScopeData?: AnalysisScopeData;
  dataVerificationData?: DataVerificationData;
}

interface PPTScenarioRendererProps {
  userQuery: string;
  pptConfig: PPTConfig;
  onPptConfigUpdate: <K extends keyof PPTConfig>(key: K, value: PPTConfig[K]) => void;
  onPptStatusChange: (status: 'idle' | 'setup' | 'generating' | 'done') => void;
  onScenarioComplete: () => void;
  onRequestSalesAnalysis: () => void;
  isRightPanelCollapsed: boolean;
  onOpenRightPanel: () => void;
  onOpenCenterPanel?: () => void; // 가운데 패널 열기 콜백
  onProgressUpdate?: (tasks: ProgressTask[]) => void; // Progress 업데이트 콜백
  onActiveHitlChange?: (hitl: ActiveHitl | null, resumeCallback: (stepId: string, selectedOption: string) => void) => void; // 수정 3: HITL 플로팅 패널 상태 전달
  slideGenerationState?: {
    currentSlide: number;
    completedSlides: number[];
    totalSlides: number;
  };
  isSlideGenerationComplete?: boolean; // PPTGenPanel에서 모든 슬라이드 완료 시 true
  // Slide Outline Review Props
  onSlideOutlineReviewStart?: () => void; // 슬라이드 개요 검토 단계 시작 시 콜백
  isSlideOutlineReviewComplete?: boolean; // 모든 슬라이드 개요 승인 시 true
  // Theme/Font Select Props
  onThemeFontComplete?: (completeCallback: () => void) => void; // 테마/폰트 선택 완료 콜백 전달
  // 마크다운 파일 생성 콜백
  onMarkdownFileGenerated?: (file: SlideFile) => void;
  // 슬라이드 계획 완료 콜백 전달 (모든 파일 생성 완료 시 호출)
  onSlidePlanningComplete?: (completeCallback: () => void) => void;
}

/**
 * PPT 생성 시나리오 렌더러
 * - 도구 호출과 답변이 번갈아 표시
 * - HITL 단계에서 사용자 입력 처리
 */
const PPTScenarioRenderer: React.FC<PPTScenarioRendererProps> = ({
  userQuery,
  pptConfig,
  onPptConfigUpdate,
  onPptStatusChange,
  onScenarioComplete,
  onRequestSalesAnalysis,
  isRightPanelCollapsed,
  onOpenRightPanel,
  onOpenCenterPanel,
  onProgressUpdate,
  onActiveHitlChange,
  slideGenerationState,
  isSlideGenerationComplete,
  // Slide Outline Review
  onSlideOutlineReviewStart,
  isSlideOutlineReviewComplete,
  // Theme/Font Select
  onThemeFontComplete,
  // 마크다운 파일 생성
  onMarkdownFileGenerated,
  // 슬라이드 계획 완료
  onSlidePlanningComplete,
}) => {
  // 무한 루프 방지: usePPTScenario에 전달하는 콜백을 메모이제이션
  const handleScenarioComplete = useCallback(() => {
    onPptStatusChange('done');
    onScenarioComplete();
  }, [onPptStatusChange, onScenarioComplete]);

  const handleStepStart = useCallback((stepId: string) => {
    // tool_ppt_setup: 중앙 패널 열지 않음 (HITL 플로팅 패널만 사용)
    // tool_slide_outline_review: HITL 플로팅 패널로 처리 (중앙 패널 열지 않음)

    // 슬라이드 생성 단계 - PPT 생성은 theme_font_select 완료 시 시작됨
    if (stepId === 'tool_slide_generation') {
      onOpenCenterPanel?.();
    }
  }, [onOpenCenterPanel]);

  const {
    messages,
    currentStepId,
    isRunning,
    isPaused,
    isComplete,
    validationData,
    completedStepIds,
    progressTasks,
    activeHitl,
    startScenario,
    resumeWithHitlSelection,
    confirmValidation,
    completePptSetup,
    completeThemeFontSelect,
    completeSlideOutlineReview,
    completeSlidePlanning,
    completeSlideGeneration,
    toggleMessageExpand,
    activeToolMessageId,
    groupExpandState,
    toggleGroup,
    renderSegments,
  } = usePPTScenario({
    onScenarioComplete: handleScenarioComplete,
    onStepStart: handleStepStart,
  });

  // Progress 업데이트 전달
  useEffect(() => {
    onProgressUpdate?.(progressTasks);
  }, [progressTasks, onProgressUpdate]);

  // 슬라이드 개요 검토 완료 처리 추적 (중복 호출 방지)
  const slideOutlineReviewCompletionHandledRef = useRef(false);

  // 슬라이드 생성 완료 처리 추적 (중복 호출 방지)
  const slideCompletionHandledRef = useRef(false);

  // completeSlideOutlineReview 함수의 최신 참조 유지 (stale closure 방지)
  const completeSlideOutlineReviewRef = useRef(completeSlideOutlineReview);
  completeSlideOutlineReviewRef.current = completeSlideOutlineReview;

  // completeSlideGeneration 함수의 최신 참조 유지 (stale closure 방지)
  const completeSlideGenerationRef = useRef(completeSlideGeneration);
  completeSlideGenerationRef.current = completeSlideGeneration;

  // resumeWithHitlSelection 함수의 최신 참조 유지 (무한 루프 방지)
  const resumeWithHitlSelectionRef = useRef(resumeWithHitlSelection);
  resumeWithHitlSelectionRef.current = resumeWithHitlSelection;

  // completeThemeFontSelect 함수의 최신 참조 유지 (무한 루프 방지)
  const completeThemeFontSelectRef = useRef(completeThemeFontSelect);
  completeThemeFontSelectRef.current = completeThemeFontSelect;

  // completeSlidePlanning 함수의 최신 참조 유지 (무한 루프 방지)
  const completeSlidePlanningRef = useRef(completeSlidePlanning);
  completeSlidePlanningRef.current = completeSlidePlanning;

  // 테마/폰트 선택 완료 콜백 전달 여부 추적
  const themeFontCompleteHandledRef = useRef(false);

  // 슬라이드 계획 완료 콜백 전달 여부 추적
  const slidePlanningCompleteHandledRef = useRef(false);

  // 수정 3: HITL 플로팅 패널 상태 전달
  // resumeWithHitlSelection을 ref로 전달하여 의존성 배열에서 제거 (무한 루프 방지)
  useEffect(() => {
    onActiveHitlChange?.(activeHitl, resumeWithHitlSelectionRef.current);
  }, [activeHitl, onActiveHitlChange]);

  // 테마/폰트 선택 완료 콜백 전달 (ref 패턴으로 무한 루프 방지)
  useEffect(() => {
    // 이미 처리됨 - 중복 호출 방지
    if (themeFontCompleteHandledRef.current) return;

    if (onThemeFontComplete) {
      themeFontCompleteHandledRef.current = true;
      onThemeFontComplete(completeThemeFontSelectRef.current);
    }
  }, [onThemeFontComplete]);  // completeThemeFontSelect 의존성 제거

  // 슬라이드 계획 완료 콜백 전달 (ref 패턴으로 무한 루프 방지)
  useEffect(() => {
    // 이미 처리됨 - 중복 호출 방지
    if (slidePlanningCompleteHandledRef.current) return;

    if (onSlidePlanningComplete) {
      slidePlanningCompleteHandledRef.current = true;
      onSlidePlanningComplete(completeSlidePlanningRef.current);
    }
  }, [onSlidePlanningComplete]);  // completeSlidePlanning 의존성 제거

  // 시나리오 자동 시작 (완료 상태에서는 재시작하지 않음)
  useEffect(() => {
    if (userQuery && !isRunning && !isComplete && messages.length === 0) {
      // 시나리오 시작 시 ref 초기화
      slideOutlineReviewCompletionHandledRef.current = false;
      slideCompletionHandledRef.current = false;
      themeFontCompleteHandledRef.current = false;
      slidePlanningCompleteHandledRef.current = false;
      startScenario();
      onPptStatusChange('setup');
    }
  }, [userQuery, isRunning, isComplete, messages.length, startScenario, onPptStatusChange]);

  // 슬라이드 개요 검토 완료 시 시나리오 진행
  useEffect(() => {
    if (isSlideOutlineReviewComplete && !slideOutlineReviewCompletionHandledRef.current) {
      slideOutlineReviewCompletionHandledRef.current = true;
      completeSlideOutlineReviewRef.current?.();
    }
  }, [isSlideOutlineReviewComplete]);

  // PPTGenPanel에서 슬라이드 생성 완료 시 시나리오 진행
  // isSlideGenerationComplete만 확인 - PPTGenPanel의 완료 신호를 신뢰
  useEffect(() => {
    if (isSlideGenerationComplete && !slideCompletionHandledRef.current) {
      slideCompletionHandledRef.current = true;
      completeSlideGenerationRef.current?.();
    }
  }, [isSlideGenerationComplete]);

  // 초기 인사 메시지 (agent_greeting - 첫 번째 그룹 전에 표시)
  const greetingMessage = useMemo(() => {
    return messages.find(
      msg => msg.type === 'agent-text' && msg.id.includes('agent_greeting')
    );
  }, [messages]);

  return (
    <div className="space-y-4">
      {/* 초기 인사 메시지 */}
      {greetingMessage && (
        <div className="flex gap-4 mb-4 animate-fade-in-up">
          <div className="w-8 h-8 rounded bg-[#FF3C42] flex items-center justify-center shrink-0 mt-1 shadow-sm">
            <span className="text-white font-bold text-xs">K</span>
          </div>
          <div className="flex-1">
            <p className="text-gray-900 font-medium text-sm leading-relaxed">
              {greetingMessage.content}
            </p>
          </div>
        </div>
      )}

      {/* 세그먼트별 렌더링 (Claude Cowork 스타일) */}
      {renderSegments.map((segment) => {
        // 텍스트 세그먼트
        if (segment.type === 'text') {
          return (
            <div key={segment.message.id} className="flex gap-4 mb-4 animate-fade-in-up">
              <div className="w-8 h-8 rounded bg-[#FF3C42] flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <span className="text-white font-bold text-xs">K</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium text-sm leading-relaxed">
                  {segment.message.content}
                </p>
              </div>
            </div>
          );
        }

        // 도구 그룹 세그먼트
        return (
          <ToolCallGroup
            key={segment.group.id}
            groupId={segment.group.id}
            groupLabel={segment.group.label}
            messages={segment.messages}
            isGroupExpanded={groupExpandState[segment.group.id] ?? false}
            onGroupToggle={() => toggleGroup(segment.group.id)}
            activeToolMessageId={activeToolMessageId}
            onToolToggle={toggleMessageExpand}
            isScenarioComplete={isComplete}
            isScenarioRunning={isRunning}
            currentStepId={currentStepId}
            completedStepIds={completedStepIds}
            onHitlSelect={resumeWithHitlSelection}
            onValidationConfirm={confirmValidation}
            onPptSetupComplete={completePptSetup}
            pptConfig={pptConfig}
            onPptConfigUpdate={onPptConfigUpdate}
            validationData={validationData}
            slideGenerationState={slideGenerationState}
            onMarkdownFileGenerated={onMarkdownFileGenerated}
          />
        );
      })}

      {/* 최종 완료 응답 */}
      {isComplete && (
        <div className="mb-4">
          <PPTDoneResponse
            slideCount={pptConfig.slideCount}
            onRequestSalesAnalysis={onRequestSalesAnalysis}
            isRightPanelCollapsed={isRightPanelCollapsed}
            currentDashboardType="ppt"
            onOpenRightPanel={onOpenRightPanel}
          />
        </div>
      )}

      {/* 로딩 인디케이터 (실행 중이고 일시 중지가 아닐 때) */}
      {isRunning && !isPaused && !isComplete && (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
          <span>처리 중...</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(PPTScenarioRenderer);
