import React, { useEffect, useMemo, useRef } from 'react';
import { ToolCallGroup } from './ToolCall';
import { PPTDoneResponse } from './AgentResponse';
import { ProgressTask, ToolType } from '../types';
import { PPTConfig, HitlOption } from '../../../../types';
import usePPTScenario from '../../../../hooks/usePPTScenario';

// HITL 플로팅 패널용 상태 타입
export interface ActiveHitl {
  stepId: string;
  toolType: ToolType;
  question: string;
  options: HitlOption[];
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
}) => {
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
    completeSlideGeneration,
    toggleMessageExpand,
    activeToolMessageId,
    groupExpandState,
    toggleGroup,
    renderSegments,
  } = usePPTScenario({
    onScenarioComplete: () => {
      onPptStatusChange('done');
      onScenarioComplete();
    },
    onStepStart: (stepId) => {
      // 조건 A: PPT 세부 설정 단계에서 가운데 패널 열기
      if (stepId === 'tool_ppt_setup') {
        onOpenCenterPanel?.();
      }
      // 조건 B: 슬라이드 생성 단계에서 가운데 패널 열기 (닫혀있었다면)
      if (stepId === 'tool_slide_generation') {
        onPptStatusChange('generating');
        onOpenCenterPanel?.();
      }
    },
  });

  // Progress 업데이트 전달
  useEffect(() => {
    onProgressUpdate?.(progressTasks);
  }, [progressTasks, onProgressUpdate]);

  // 슬라이드 생성 완료 처리 추적 (중복 호출 방지)
  const slideCompletionHandledRef = useRef(false);

  // completeSlideGeneration 함수의 최신 참조 유지 (stale closure 방지)
  const completeSlideGenerationRef = useRef(completeSlideGeneration);
  completeSlideGenerationRef.current = completeSlideGeneration;

  // resumeWithHitlSelection 함수의 최신 참조 유지 (무한 루프 방지)
  const resumeWithHitlSelectionRef = useRef(resumeWithHitlSelection);
  resumeWithHitlSelectionRef.current = resumeWithHitlSelection;

  // 수정 3: HITL 플로팅 패널 상태 전달
  // resumeWithHitlSelection을 ref로 전달하여 의존성 배열에서 제거 (무한 루프 방지)
  useEffect(() => {
    onActiveHitlChange?.(activeHitl, resumeWithHitlSelectionRef.current);
  }, [activeHitl, onActiveHitlChange]);

  // 시나리오 자동 시작 (완료 상태에서는 재시작하지 않음)
  useEffect(() => {
    if (userQuery && !isRunning && !isComplete && messages.length === 0) {
      // 시나리오 시작 시 ref 초기화
      slideCompletionHandledRef.current = false;
      startScenario();
      onPptStatusChange('setup');
    }
  }, [userQuery, isRunning, isComplete, messages.length, startScenario, onPptStatusChange]);

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
