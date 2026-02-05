import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ToolCallGroup } from './ToolCall';
import { ProgressTask, ToolType } from '../types';
import { HitlOption } from '../../../../types';
import useSalesAnalysisScenario from '../../../../hooks/useSalesAnalysisScenario';
import {
  SECTIONS,
  SectionItem,
  StreamingTextSpan,
  parseTextWithBold,
  DelayedComplete,
} from './AgentResponse/SalesAnalysisResponse';
import TypingCursor from '../../../shared/TypingCursor';
import { AnalysisScopeData, DataVerificationData } from './HITLFloatingPanel';

// HITL 플로팅 패널용 상태 타입
export interface ActiveHitl {
  stepId: string;
  toolType: ToolType;
  question: string;
  options: HitlOption[];
  // 매출 분석 시나리오 HITL 데이터
  analysisScopeData?: AnalysisScopeData;
  dataVerificationData?: DataVerificationData;
}

// 스트리밍 최종 응답 컴포넌트
const StreamingFinalResponse: React.FC = () => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [isStreamingComplete, setIsStreamingComplete] = useState(false);

  // hr 삽입 위치 (section2-title 전, section4-title 전)
  const hrBeforeIndices = [2, 8];

  const handleSectionComplete = (index: number) => {
    setCompletedSections((prev) => new Set(prev).add(index));
    setTimeout(() => {
      const nextIndex = Math.min(index + 1, SECTIONS.length - 1);
      setCurrentSectionIndex(nextIndex);

      if (index === SECTIONS.length - 1) {
        setIsStreamingComplete(true);
      }
    }, 50);
  };

  const renderSection = (section: SectionItem, index: number) => {
    const isCurrentSection = index === currentSectionIndex;
    const isCompleted = completedSections.has(index);
    const shouldShow = index <= currentSectionIndex;

    if (!shouldShow) return null;

    const showCursor = isCurrentSection && !isCompleted;

    switch (section.type) {
      case 'h3':
        return (
          <h3 key={section.id} className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            {isCompleted ? (
              parseTextWithBold(section.text || '')
            ) : (
              <StreamingTextSpan
                text={section.text || ''}
                typingSpeed={20}
                onComplete={() => handleSectionComplete(index)}
                showCursor={showCursor}
              />
            )}
          </h3>
        );

      case 'h4':
        return (
          <h4 key={section.id} className={`text-lg font-bold text-gray-900 mb-3 ${section.className || ''}`}>
            {isCompleted ? (
              parseTextWithBold(section.text || '')
            ) : (
              <StreamingTextSpan
                text={section.text || ''}
                typingSpeed={20}
                onComplete={() => handleSectionComplete(index)}
                showCursor={showCursor}
              />
            )}
          </h4>
        );

      case 'p':
        return (
          <p key={section.id} className="mb-4 text-gray-800 leading-relaxed">
            {isCompleted ? (
              parseTextWithBold(section.text || '')
            ) : (
              <StreamingTextSpan
                text={section.text || ''}
                typingSpeed={10}
                onComplete={() => handleSectionComplete(index)}
                showCursor={showCursor}
              />
            )}
          </p>
        );

      case 'ul':
        return (
          <ul key={section.id} className="list-disc pl-5 space-y-2 mb-6 text-gray-700">
            {section.items?.map((item, i) => (
              <li key={i}>{parseTextWithBold(item)}</li>
            ))}
            {!isCompleted && showCursor && <TypingCursor visible={true} height="h-4" />}
            {isCurrentSection && !isCompleted && (
              <DelayedComplete
                delayMs={800}
                onComplete={() => handleSectionComplete(index)}
              />
            )}
          </ul>
        );

      case 'box':
        return (
          <div key={section.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
            <strong className="block text-gray-900 mb-2">{section.title}</strong>
            <ol className="list-decimal pl-5 space-y-2 text-gray-700">
              {section.items?.map((item, i) => (
                <li key={i}>{parseTextWithBold(item)}</li>
              ))}
            </ol>
            {!isCompleted && showCursor && <TypingCursor visible={true} height="h-4" />}
            {isCurrentSection && !isCompleted && (
              <DelayedComplete
                delayMs={1000}
                onComplete={() => handleSectionComplete(index)}
              />
            )}
          </div>
        );

      case 'footer':
        return (
          <p
            key={section.id}
            className={`text-sm text-gray-500 mt-4 transition-all duration-300 ${
              isCompleted ? 'text-right' : 'text-left'
            }`}
          >
            {isCompleted ? (
              section.text
            ) : (
              <StreamingTextSpan
                text={section.text || ''}
                typingSpeed={15}
                onComplete={() => handleSectionComplete(index)}
                showCursor={showCursor}
              />
            )}
          </p>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex gap-4 mb-4 animate-fade-in-up">
      <div className="w-8 h-8 rounded bg-[#FF3C42] flex items-center justify-center shrink-0 mt-1 shadow-sm">
        <span className="text-white font-bold text-xs">K</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
          {SECTIONS.map((section, index) => (
            <React.Fragment key={section.id}>
              {hrBeforeIndices.includes(index) && index <= currentSectionIndex && (
                <hr className="my-6 border-gray-200" />
              )}
              {renderSection(section, index)}
            </React.Fragment>
          ))}
        </div>

      </div>
    </div>
  );
};

interface SalesAnalysisScenarioRendererProps {
  userQuery: string;
  onScenarioComplete: () => void;
  onRequestPPT: () => void;
  isRightPanelCollapsed: boolean;
  onOpenRightPanel: () => void;
  onOpenCenterPanel?: (content?: 'ppt-preview' | 'dashboard') => void; // 가운데 패널(대시보드) 열기 콜백
  onProgressUpdate?: (tasks: ProgressTask[]) => void;
  onActiveHitlChange?: (hitl: ActiveHitl | null, resumeCallback: (stepId: string, selectedOption: string) => void) => void;
  onVisualizationComplete?: (isComplete: boolean) => void; // Skeleton 제어용
}

/**
 * 매출 분석 시나리오 렌더러
 * - PPT 시나리오와 동일한 구조
 * - 도구 호출과 답변이 번갈아 표시
 * - HITL 단계에서 사용자 입력 처리
 */
const SalesAnalysisScenarioRenderer: React.FC<SalesAnalysisScenarioRendererProps> = ({
  userQuery,
  onScenarioComplete,
  onRequestPPT,
  isRightPanelCollapsed,
  onOpenRightPanel,
  onOpenCenterPanel,
  onProgressUpdate,
  onActiveHitlChange,
  onVisualizationComplete,
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
    isVisualizationComplete,
    analysisScopeData,
    dataVerificationData,
    startScenario,
    resumeWithHitlSelection,
    toggleMessageExpand,
    activeToolMessageId,
    groupExpandState,
    toggleGroup,
    renderSegments,
  } = useSalesAnalysisScenario({
    onScenarioComplete,
    onStepStart: (stepId) => {
      // 시각화 생성 단계에서 가운데 패널(대시보드) 열기
      if (stepId === 'tool_visualization_generation') {
        onOpenCenterPanel?.('dashboard');
      }
    },
    onVisualizationStart: () => {
      onOpenCenterPanel?.('dashboard');
    },
  });

  // Progress 업데이트 전달
  useEffect(() => {
    onProgressUpdate?.(progressTasks);
  }, [progressTasks, onProgressUpdate]);

  // 시각화 완료 상태 전달
  useEffect(() => {
    onVisualizationComplete?.(isVisualizationComplete);
  }, [isVisualizationComplete, onVisualizationComplete]);

  // resumeWithHitlSelection 함수의 최신 참조 유지 (무한 루프 방지)
  const resumeWithHitlSelectionRef = useRef(resumeWithHitlSelection);
  resumeWithHitlSelectionRef.current = resumeWithHitlSelection;

  // HITL 플로팅 패널 상태 전달 (새로운 HITL 데이터 포함)
  useEffect(() => {
    if (activeHitl) {
      const enrichedHitl: ActiveHitl = {
        ...activeHitl,
        analysisScopeData: activeHitl.toolType === 'analysis_scope_confirm' ? analysisScopeData : undefined,
        dataVerificationData: activeHitl.toolType === 'data_verification' ? dataVerificationData : undefined,
      };
      onActiveHitlChange?.(enrichedHitl, resumeWithHitlSelectionRef.current);
    } else {
      onActiveHitlChange?.(null, resumeWithHitlSelectionRef.current);
    }
  }, [activeHitl, analysisScopeData, dataVerificationData, onActiveHitlChange]);

  // 시나리오 자동 시작
  useEffect(() => {
    if (userQuery && !isRunning && !isComplete && messages.length === 0) {
      startScenario();
    }
  }, [userQuery, isRunning, isComplete, messages.length, startScenario]);

  // 초기 인사 메시지
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
            validationData={validationData}
          />
        );
      })}

      {/* 최종 완료 응답 - 스트리밍 효과 */}
      {isComplete && <StreamingFinalResponse />}

      {/* 로딩 인디케이터 */}
      {isRunning && !isPaused && !isComplete && (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
          <span>처리 중...</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(SalesAnalysisScenarioRenderer);
