import React, { useState, useCallback, useEffect } from 'react';
import ToolCallHeader from './ToolCallHeader';
import ToolCallContent from './ToolCallContent';
import { TOOL_METADATA, isHitlTool } from './constants';
import type { ToolCallWidgetProps } from './types';
import { Collapsible, CollapsibleContent } from '../../../../ui/collapsible';

/**
 * 도구 호출 위젯 메인 컴포넌트
 * - 접이식 UI (Collapsible)
 * - 도구 타입에 따라 다른 콘텐츠 렌더링
 * - HITL 도구는 사용자 입력 대기 상태 표시
 */
const ToolCallWidget: React.FC<ToolCallWidgetProps> = ({
  toolType,
  status,
  input,
  result,
  isExpanded: isExpandedProp,
  onToggle: onToggleProp,
  isHitl,
  hitlOptions,
  selectedOption,
  onHitlSelect,
  pptConfig,
  onPptConfigUpdate,
  onPptSetupComplete,
  validationData,
  onValidationConfirm,
  onValidationModify,
  currentStepId,
  completedStepIds,
  onMarkdownFileGenerated,
}) => {
  // 내부 상태 (외부에서 제어하지 않는 경우)
  const [internalExpanded, setInternalExpanded] = useState(false);

  // 완료 후 접힘 추적 (재펼침 시 스트리밍 건너뛰기용)
  const [hasBeenCollapsedAfterComplete, setHasBeenCollapsedAfterComplete] = useState(false);

  // 펼침 상태 결정 (외부 prop 우선)
  const isExpanded = isExpandedProp !== undefined ? isExpandedProp : internalExpanded;

  // 완료 상태에서 접히면 추적
  useEffect(() => {
    if (status === 'completed' && !isExpanded) {
      setHasBeenCollapsedAfterComplete(true);
    }
  }, [status, isExpanded]);

  // 토글 핸들러
  const handleToggle = useCallback(() => {
    if (onToggleProp) {
      onToggleProp();
    } else {
      setInternalExpanded(prev => !prev);
    }
  }, [onToggleProp]);

  // 메타데이터 조회
  const metadata = TOOL_METADATA[toolType];
  if (!metadata) {
    console.warn(`Unknown tool type: ${toolType}`);
    return null;
  }

  // HITL 도구 여부 결정
  const isHitlTool_ = isHitl !== undefined ? isHitl : isHitlTool(toolType);

  // 실제 상태 (HITL 도구이고 입력 대기 중이면 awaiting-input)
  const effectiveStatus = isHitlTool_ && status === 'running' && !selectedOption
    ? 'awaiting-input'
    : status;

  return (
    <Collapsible open={isExpanded} className="animate-fade-in-up">
      {/* 헤더 (항상 표시) */}
      <ToolCallHeader
        toolType={toolType}
        status={effectiveStatus}
        isExpanded={isExpanded}
        onToggle={handleToggle}
        metadata={metadata}
      />

      {/* 상세 내용 (Collapsible이 관리) */}
      <CollapsibleContent className="ml-3 pl-2 border-l border-gray-200 mt-1 text-xs data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
        <ToolCallContent
          toolType={toolType}
          status={effectiveStatus}
          input={input}
          result={result}
          isHitl={isHitlTool_}
          hitlOptions={hitlOptions}
          selectedOption={selectedOption}
          onHitlSelect={onHitlSelect}
          pptConfig={pptConfig}
          onPptConfigUpdate={onPptConfigUpdate}
          onPptSetupComplete={onPptSetupComplete}
          validationData={validationData}
          onValidationConfirm={onValidationConfirm}
          onValidationModify={onValidationModify}
          currentStepId={currentStepId}
          completedStepIds={completedStepIds}
          skipStreaming={hasBeenCollapsedAfterComplete}
          onMarkdownFileGenerated={onMarkdownFileGenerated}
        />
      </CollapsibleContent>
    </Collapsible>
  );
};

export default React.memo(ToolCallWidget);
