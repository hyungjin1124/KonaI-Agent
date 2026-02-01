import React, { useEffect, useCallback } from 'react';
import { ToolCallWidget, DEFAULT_DATA_SOURCE_OPTIONS } from './ToolCall';
import { PPTSetupTool } from './ToolCall/tool-variants';
import { PPTDoneResponse } from './AgentResponse';
import { ScenarioMessage, ToolStatus } from '../types';
import { DEFAULT_VALIDATION_DATA } from '../scenarios/pptScenario';
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
    startScenario,
    resumeWithHitlSelection,
    confirmValidation,
    completePptSetup,
    completeSlideGeneration,
    toggleMessageExpand,
    expandedMessageIds,
  } = usePPTScenario({
    onScenarioComplete: () => {
      onPptStatusChange('done');
      onScenarioComplete();
    },
    onStepStart: (stepId) => {
      // PPT 세부 설정 단계에서 우측 패널 자동 열기
      if (stepId === 'tool_ppt_setup') {
        onOpenRightPanel();
      }
      // 슬라이드 생성 단계에서 generating 상태로 변경
      if (stepId === 'tool_slide_generation') {
        onPptStatusChange('generating');
      }
    },
  });

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

  // 메시지 렌더링
  const renderMessage = useCallback((message: ScenarioMessage, index: number) => {
    const isExpanded = expandedMessageIds.has(message.id);

    // 에이전트 텍스트 메시지
    if (message.type === 'agent-text') {
      // 최종 응답은 PPTDoneResponse로 렌더링
      if (message.content === 'final' && isComplete) {
        return (
          <div key={message.id} className="mb-4">
            <PPTDoneResponse
              slideCount={pptConfig.slideCount}
              onRequestSalesAnalysis={onRequestSalesAnalysis}
              isRightPanelCollapsed={isRightPanelCollapsed}
              currentDashboardType="ppt"
              onOpenRightPanel={onOpenRightPanel}
            />
          </div>
        );
      }

      // 일반 에이전트 텍스트
      return (
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
      );
    }

    // 도구 호출 메시지
    if (message.type === 'tool-call' && message.toolType) {
      // HITL 위젯은 입력 대기 중일 때 항상 펼침, 완료 후에는 접을 수 있음
      const isHitlAwaitingInput = message.toolStatus === 'running' || message.toolStatus === 'awaiting-input';

      // PPT 세부 설정은 별도 컴포넌트로 렌더링
      if (message.toolType === 'ppt_setup') {
        const pptSetupExpanded = isHitlAwaitingInput || isExpanded;
        return (
          <div key={message.id} className="mb-4">
            <ToolCallWidget
              toolType={message.toolType}
              status={message.toolStatus || 'pending'}
              isExpanded={pptSetupExpanded}
              onToggle={() => toggleMessageExpand(message.id)}
              currentStepId={currentStepId}
              completedStepIds={completedStepIds}
            />
            {message.toolStatus !== 'completed' && (
              <div className="mt-2 p-4 bg-white border border-pink-200 rounded-lg">
                <PPTSetupTool
                  status={message.toolStatus === 'running' ? 'awaiting-input' : message.toolStatus || 'pending'}
                  config={pptConfig}
                  onConfigUpdate={onPptConfigUpdate}
                  onComplete={completePptSetup}
                />
              </div>
            )}
          </div>
        );
      }

      // 데이터 소스 선택 (HITL)
      if (message.toolType === 'data_source_select') {
        const dataSourceExpanded = isHitlAwaitingInput || isExpanded;
        return (
          <div key={message.id} className="mb-4">
            <ToolCallWidget
              toolType={message.toolType}
              status={message.toolStatus || 'pending'}
              isExpanded={dataSourceExpanded}
              onToggle={() => toggleMessageExpand(message.id)}
              isHitl={true}
              hitlOptions={DEFAULT_DATA_SOURCE_OPTIONS}
              selectedOption={message.hitlSelectedOption}
              onHitlSelect={(optionId) => resumeWithHitlSelection('tool_data_source', optionId)}
              currentStepId={currentStepId}
              completedStepIds={completedStepIds}
            />
          </div>
        );
      }

      // 데이터 검증 (HITL)
      if (message.toolType === 'data_validation') {
        const validationExpanded = isHitlAwaitingInput || isExpanded;
        return (
          <div key={message.id} className="mb-4">
            <ToolCallWidget
              toolType={message.toolType}
              status={message.toolStatus || 'pending'}
              isExpanded={validationExpanded}
              onToggle={() => toggleMessageExpand(message.id)}
              isHitl={true}
              validationData={validationData}
              onValidationConfirm={confirmValidation}
              onValidationModify={() => {
                // TODO: 수정 요청 처리
                console.log('Modification requested');
              }}
              currentStepId={currentStepId}
              completedStepIds={completedStepIds}
            />
          </div>
        );
      }

      // 슬라이드 제작 (우측 패널과 동기화)
      if (message.toolType === 'slide_generation') {
        return (
          <div key={message.id} className="mb-4">
            <ToolCallWidget
              toolType={message.toolType}
              status={message.toolStatus || 'pending'}
              isExpanded={isExpanded}
              onToggle={() => toggleMessageExpand(message.id)}
              input={{
                currentSlide: slideGenerationState?.currentSlide || 1,
                totalSlides: slideGenerationState?.totalSlides || pptConfig.slideCount,
                completedSlides: slideGenerationState?.completedSlides || [],
              }}
              currentStepId={currentStepId}
              completedStepIds={completedStepIds}
            />
          </div>
        );
      }

      // 기타 도구 호출 (접을 수 있음)
      return (
        <div key={message.id} className="mb-4">
          <ToolCallWidget
            toolType={message.toolType}
            status={message.toolStatus || 'pending'}
            isExpanded={isExpanded}
            onToggle={() => toggleMessageExpand(message.id)}
            input={message.toolInput}
            result={message.toolResult}
            currentStepId={currentStepId}
            completedStepIds={completedStepIds}
          />
        </div>
      );
    }

    return null;
  }, [
    expandedMessageIds,
    isComplete,
    pptConfig,
    onRequestSalesAnalysis,
    isRightPanelCollapsed,
    onOpenRightPanel,
    toggleMessageExpand,
    resumeWithHitlSelection,
    validationData,
    confirmValidation,
    completePptSetup,
    onPptConfigUpdate,
    currentStepId,
    completedStepIds,
    slideGenerationState,
  ]);

  return (
    <div className="space-y-2">
      {messages.map((message, index) => renderMessage(message, index))}

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
