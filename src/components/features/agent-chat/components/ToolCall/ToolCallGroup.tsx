import React, { useMemo } from 'react';
import ToolCallGroupHeader from './ToolCallGroupHeader';
import ToolCallWidget from './ToolCallWidget';
import { DEFAULT_DATA_SOURCE_OPTIONS, TOOL_METADATA } from './constants';
import type { ToolCallGroupProps } from './types';
import type { ToolType } from '../../types';
import { Collapsible, CollapsibleContent } from '../../../../ui/collapsible';

/**
 * Tool 그룹 외부 아코디언 컴포넌트 (Claude Chat 스타일)
 * - 전체 Tool 호출을 하나의 그룹으로 감싸는 컨테이너
 * - 시나리오 완료 시 자동으로 접힘
 * - 2단계 아코디언 구조: 외부(그룹) + 내부(개별 Tool)
 */
const ToolCallGroup: React.FC<ToolCallGroupProps> = ({
  groupId,
  groupLabel,
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
  onMarkdownFileGenerated,
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

  // 현재 실행 중이거나 입력 대기 중인 도구 확인
  const hasActiveTool = useMemo(
    () => toolMessages.some(msg => msg.toolStatus === 'running' || msg.toolStatus === 'awaiting-input'),
    [toolMessages]
  );

  // 현재 실행 중이거나 입력 대기 중인 도구의 라벨 계산
  const activeToolLabel = useMemo(() => {
    const activeTool = toolMessages.find(
      msg => msg.toolStatus === 'running' || msg.toolStatus === 'awaiting-input'
    );
    if (!activeTool?.toolType) return undefined;
    const metadata = TOOL_METADATA[activeTool.toolType as ToolType];
    return metadata?.labelRunning;
  }, [toolMessages]);

  // Tool 메시지가 없으면 렌더링하지 않음
  if (totalCount === 0) {
    return null;
  }

  return (
    <Collapsible open={isGroupExpanded} className="mb-4 animate-fade-in-up">
      {/* 외부 아코디언 헤더 */}
      <ToolCallGroupHeader
        label={groupLabel}
        completedCount={completedCount}
        totalCount={totalCount}
        isComplete={completedCount === totalCount && totalCount > 0}
        isRunning={hasActiveTool}
        isExpanded={isGroupExpanded}
        onToggle={onGroupToggle}
        activeToolLabel={activeToolLabel}
      />

      {/* 외부 아코디언 콘텐츠 (내부 Tool 목록) */}
      <CollapsibleContent className="mt-1 ml-2 pl-2 border-l border-gray-200 space-y-0.5 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
        {toolMessages.map((message) => {
          const isExpanded = activeToolMessageId === message.id;

          // PPT 세부 설정 (HITL)
          if (message.toolType === 'ppt_setup') {
            return (
              <ToolCallWidget
                key={message.id}
                toolType={message.toolType}
                status={message.toolStatus || 'pending'}
                isExpanded={isExpanded}
                onToggle={() => onToolToggle(message.id)}
                isHitl={true}
                currentStepId={currentStepId}
                completedStepIds={completedStepIds}
              />
            );
          }

          // 데이터 소스 선택 (HITL)
          if (message.toolType === 'data_source_select') {
            return (
              <ToolCallWidget
                key={message.id}
                toolType={message.toolType}
                status={message.toolStatus || 'pending'}
                isExpanded={isExpanded}
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
                isExpanded={isExpanded}
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

          // 슬라이드 생성
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
              onMarkdownFileGenerated={message.toolType === 'slide_planning' ? onMarkdownFileGenerated : undefined}
            />
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default React.memo(ToolCallGroup);
