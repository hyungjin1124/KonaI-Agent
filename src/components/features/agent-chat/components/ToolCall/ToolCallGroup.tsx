import React, { useMemo } from 'react';
import ToolCallGroupHeader from './ToolCallGroupHeader';
import ToolCallWidget from './ToolCallWidget';
import { PPTSetupTool } from './tool-variants';
import { DEFAULT_DATA_SOURCE_OPTIONS } from './constants';
import type { ToolCallGroupProps } from './types';

/**
 * Tool 그룹 외부 아코디언 컴포넌트 (Claude Chat 스타일)
 * - 전체 Tool 호출을 하나의 그룹으로 감싸는 컨테이너
 * - 시나리오 완료 시 자동으로 접힘
 * - 2단계 아코디언 구조: 외부(그룹) + 내부(개별 Tool)
 */
const ToolCallGroup: React.FC<ToolCallGroupProps> = ({
  messages,
  isGroupExpanded,
  onGroupToggle,
  activeToolMessageId,
  onToolToggle,
  isScenarioComplete,
  isScenarioRunning,
  currentStepId,
  completedStepIds,
  onHitlSelect,
  onValidationConfirm,
  onPptSetupComplete,
  pptConfig,
  onPptConfigUpdate,
  validationData,
  slideGenerationState,
}) => {
  // Tool 메시지만 필터링 (todo_update 제외)
  const toolMessages = useMemo(
    () => messages.filter(msg => msg.type === 'tool-call' && msg.toolType !== 'todo_update'),
    [messages]
  );

  // 완료된 Tool 수 계산
  const completedCount = useMemo(
    () => toolMessages.filter(msg => msg.toolStatus === 'completed').length,
    [toolMessages]
  );

  const totalCount = toolMessages.length;

  // Tool 메시지가 없으면 렌더링하지 않음
  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="mb-4 animate-fade-in-up">
      {/* 외부 아코디언 헤더 */}
      <ToolCallGroupHeader
        completedCount={completedCount}
        totalCount={totalCount}
        isComplete={isScenarioComplete}
        isRunning={isScenarioRunning}
        isExpanded={isGroupExpanded}
        onToggle={onGroupToggle}
      />

      {/* 외부 아코디언 콘텐츠 (내부 Tool 목록) */}
      {isGroupExpanded && (
        <div
          className={`
            mt-2 ml-4 pl-4 border-l-2 border-gray-200
            space-y-2
            animate-accordion-down
          `}
        >
          {toolMessages.map((message) => {
            const isExpanded = activeToolMessageId === message.id;

            // HITL 도구는 입력 대기 중일 때 강제 펼침
            const isHitlAwaitingInput =
              message.toolStatus === 'running' || message.toolStatus === 'awaiting-input';
            const shouldExpand = message.isHumanInTheLoop
              ? isHitlAwaitingInput || isExpanded
              : isExpanded;

            // PPT 세부 설정은 별도 처리
            if (message.toolType === 'ppt_setup') {
              return (
                <div key={message.id}>
                  <ToolCallWidget
                    toolType={message.toolType}
                    status={message.toolStatus || 'pending'}
                    isExpanded={shouldExpand}
                    onToggle={() => onToolToggle(message.id)}
                    currentStepId={currentStepId}
                    completedStepIds={completedStepIds}
                  />
                  {message.toolStatus !== 'completed' && (
                    <div className="mt-2 ml-6 p-4 bg-white border border-pink-200 rounded-lg">
                      <PPTSetupTool
                        status={message.toolStatus === 'running' ? 'awaiting-input' : message.toolStatus || 'pending'}
                        config={pptConfig!}
                        onConfigUpdate={onPptConfigUpdate!}
                        onComplete={onPptSetupComplete!}
                      />
                    </div>
                  )}
                </div>
              );
            }

            // 데이터 소스 선택 (HITL)
            if (message.toolType === 'data_source_select') {
              return (
                <ToolCallWidget
                  key={message.id}
                  toolType={message.toolType}
                  status={message.toolStatus || 'pending'}
                  isExpanded={shouldExpand}
                  onToggle={() => onToolToggle(message.id)}
                  isHitl={true}
                  hitlOptions={DEFAULT_DATA_SOURCE_OPTIONS}
                  selectedOption={message.hitlSelectedOption}
                  onHitlSelect={
                    onHitlSelect
                      ? (optionId) => onHitlSelect('tool_data_source', optionId)
                      : undefined
                  }
                  currentStepId={currentStepId}
                  completedStepIds={completedStepIds}
                />
              );
            }

            // 데이터 검증 (HITL)
            if (message.toolType === 'data_validation') {
              return (
                <ToolCallWidget
                  key={message.id}
                  toolType={message.toolType}
                  status={message.toolStatus || 'pending'}
                  isExpanded={shouldExpand}
                  onToggle={() => onToolToggle(message.id)}
                  isHitl={true}
                  validationData={validationData}
                  onValidationConfirm={onValidationConfirm}
                  onValidationModify={() => {
                    console.log('Modification requested');
                  }}
                  currentStepId={currentStepId}
                  completedStepIds={completedStepIds}
                />
              );
            }

            // 슬라이드 생성 (우측 패널과 동기화)
            if (message.toolType === 'slide_generation') {
              return (
                <ToolCallWidget
                  key={message.id}
                  toolType={message.toolType}
                  status={message.toolStatus || 'pending'}
                  isExpanded={isExpanded}
                  onToggle={() => onToolToggle(message.id)}
                  input={{
                    currentSlide: slideGenerationState?.currentSlide || 1,
                    totalSlides: slideGenerationState?.totalSlides || pptConfig?.slideCount || 8,
                    completedSlides: slideGenerationState?.completedSlides || [],
                  }}
                  currentStepId={currentStepId}
                  completedStepIds={completedStepIds}
                />
              );
            }

            // 기타 도구 호출
            return (
              <ToolCallWidget
                key={message.id}
                toolType={message.toolType!}
                status={message.toolStatus || 'pending'}
                isExpanded={isExpanded}
                onToggle={() => onToolToggle(message.id)}
                input={message.toolInput}
                result={message.toolResult}
                currentStepId={currentStepId}
                completedStepIds={completedStepIds}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(ToolCallGroup);
