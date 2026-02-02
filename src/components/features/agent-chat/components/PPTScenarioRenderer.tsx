import React, { useEffect, useMemo } from 'react';
import { ToolCallGroup } from './ToolCall';
import { PPTDoneResponse } from './AgentResponse';
import { ProgressTask } from '../types';
import { PPTConfig } from '../../../../types';
import usePPTScenario from '../../../../hooks/usePPTScenario';

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
    startScenario,
    resumeWithHitlSelection,
    confirmValidation,
    completePptSetup,
    completeSlideGeneration,
    toggleMessageExpand,
    activeToolMessageId,
    isGroupExpanded,
    toggleGroup,
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

  // todo_update 메시지 필터링
  const filteredMessages = useMemo(() => {
    return messages.filter(msg => msg.toolType !== 'todo_update');
  }, [messages]);

  // Progress 업데이트 전달
  useEffect(() => {
    onProgressUpdate?.(progressTasks);
  }, [progressTasks, onProgressUpdate]);

  // 시나리오 자동 시작 (완료 상태에서는 재시작하지 않음)
  useEffect(() => {
    if (userQuery && !isRunning && !isComplete && messages.length === 0) {
      startScenario();
      onPptStatusChange('setup');
    }
  }, [userQuery, isRunning, isComplete, messages.length, startScenario, onPptStatusChange]);

  // PPTGenPanel에서 슬라이드 생성 완료 시 시나리오 진행
  useEffect(() => {
    if (isSlideGenerationComplete && currentStepId === 'tool_slide_generation' && isPaused) {
      completeSlideGeneration();
    }
  }, [isSlideGenerationComplete, currentStepId, isPaused, completeSlideGeneration]);

  // 에이전트 텍스트 메시지만 필터링 (최초 인사 등)
  const agentMessages = useMemo(() => {
    return filteredMessages.filter(msg => msg.type === 'agent-text' && msg.content !== 'final');
  }, [filteredMessages]);

  // Tool 메시지가 있는지 확인 (그룹 렌더링용)
  const hasToolMessages = useMemo(() => {
    return filteredMessages.some(msg => msg.type === 'tool-call');
  }, [filteredMessages]);

  return (
    <div className="space-y-2">
      {/* 에이전트 초기 메시지 */}
      {agentMessages.map((message) => (
        <div key={message.id} className="flex gap-4 mb-4 animate-fade-in-up">
          <div className="w-8 h-8 rounded bg-[#FF3C42] flex items-center justify-center shrink-0 mt-1 shadow-sm">
            <span className="text-white font-bold text-xs">K</span>
          </div>
          <div className="flex-1">
            <p className="text-gray-900 font-medium text-sm leading-relaxed">
              {message.content}
            </p>
          </div>
        </div>
      ))}

      {/* Tool 그룹 (2단계 아코디언) */}
      {hasToolMessages && (
        <ToolCallGroup
          messages={filteredMessages}
          isGroupExpanded={isGroupExpanded}
          onGroupToggle={toggleGroup}
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
      )}

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
