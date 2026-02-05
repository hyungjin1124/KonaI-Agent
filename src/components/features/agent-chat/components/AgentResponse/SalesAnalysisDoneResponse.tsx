import React, { useState, useEffect, useRef } from 'react';
import { Plus, BarChart2, FileText, TrendingUp } from '../../../../icons';
import TypingCursor from '../../../../shared/TypingCursor';

interface SalesAnalysisDoneResponseProps {
  onRequestPPT: () => void;
  isRightPanelCollapsed?: boolean;
  currentDashboardType?: 'financial' | 'did' | 'ppt';
  currentDashboardScenario?: string;
  onOpenRightPanel?: () => void;
}

// 스트리밍 텍스트 컴포넌트 (PPTDoneResponse와 동일)
const StreamingTextSpan: React.FC<{
  text: string;
  typingSpeed?: number;
  onComplete?: () => void;
  showCursor?: boolean;
}> = ({ text, typingSpeed = 20, onComplete, showCursor = true }) => {
  const [displayLength, setDisplayLength] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (displayLength >= text.length) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setDisplayLength((prev) => {
        if (prev >= text.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, typingSpeed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, typingSpeed, displayLength]);

  useEffect(() => {
    if (displayLength >= text.length && !isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [displayLength, text.length, isComplete, onComplete]);

  useEffect(() => {
    if (isComplete) {
      setCursorVisible(false);
      return;
    }

    const blinkInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);

    return () => clearInterval(blinkInterval);
  }, [isComplete]);

  return (
    <>
      {text.slice(0, displayLength)}
      {showCursor && !isComplete && <TypingCursor visible={cursorVisible} height="h-4" />}
    </>
  );
};

export const SalesAnalysisDoneResponse: React.FC<SalesAnalysisDoneResponseProps> = ({
  onRequestPPT,
  isRightPanelCollapsed,
  currentDashboardType,
  currentDashboardScenario,
  onOpenRightPanel
}) => {
  const [phase, setPhase] = useState(0); // 0: title, 1: description, 2: actions

  const titleText = 'Analysis complete: 12월 경영 실적 심층 분석';
  const descriptionText = '매출 데이터 수집, 수익성 분석, 이상 징후 탐지를 완료하였습니다. 주요 인사이트와 시각화 결과를 확인하실 수 있습니다.';

  return (
    <div className="flex gap-4 mb-2 animate-fade-in-up">
      <div className="w-8 h-8 rounded bg-[#FF3C42] flex items-center justify-center shrink-0 mt-1 shadow-sm">
        <span className="text-white font-bold text-xs">K</span>
      </div>
      <div className="flex-1 space-y-6">
        <div className="prose prose-sm">
          <h3 className="text-lg font-bold text-black mb-2">
            {phase === 0 ? (
              <StreamingTextSpan
                text={titleText}
                typingSpeed={25}
                onComplete={() => setPhase(1)}
              />
            ) : (
              titleText
            )}
          </h3>
          {phase >= 1 && (
            <p className="text-gray-700 leading-relaxed text-sm mb-4">
              {phase === 1 ? (
                <StreamingTextSpan
                  text={descriptionText}
                  typingSpeed={15}
                  onComplete={() => setPhase(2)}
                />
              ) : (
                <>
                  매출 데이터 수집, 수익성 분석, 이상 징후 탐지를 완료하였습니다.
                  <strong> 주요 인사이트</strong>와 <strong>시각화 결과</strong>를 확인하실 수 있습니다.
                </>
              )}
            </p>
          )}
        </div>

        {/* Actions */}
        {phase >= 2 && (
          <>
            {/* 우측 패널 열기 버튼 */}
            {onOpenRightPanel && (() => {
              const isDisabled = !isRightPanelCollapsed &&
                currentDashboardType === 'financial' &&
                currentDashboardScenario === 'sales_analysis';
              return (
                <button
                  onClick={onOpenRightPanel}
                  disabled={isDisabled}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium shadow-sm mb-4 ${
                    isDisabled
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <BarChart2 size={16} />
                  <span>분석 결과 보기</span>
                </button>
              );
            })()}

            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                Related Actions
              </p>

              <button className="w-full text-left p-3 rounded-lg border bg-white border-gray-200 hover:border-[#FF3C42] hover:text-[#FF3C42] transition-colors text-sm flex items-center justify-between group">
                <span>추가 기간 데이터 비교 분석</span>
                <TrendingUp size={14} className="text-gray-400 group-hover:text-[#FF3C42]" />
              </button>
              <button className="w-full text-left p-3 rounded-lg border bg-white border-gray-200 hover:border-[#FF3C42] hover:text-[#FF3C42] transition-colors text-sm flex items-center justify-between group">
                <span>사업부별 상세 분석 보고서 생성</span>
                <FileText size={14} className="text-gray-400 group-hover:text-[#FF3C42]" />
              </button>
              <button className="w-full text-left p-3 rounded-lg border bg-white border-gray-200 hover:border-[#FF3C42] hover:text-[#FF3C42] transition-colors text-sm flex items-center justify-between group">
                <span>이상 징후 원인 심층 분석</span>
                <Plus size={14} className="text-gray-400 group-hover:text-[#FF3C42]" />
              </button>
              {/* PPT 생성 시나리오 연동 버튼 */}
              <button
                onClick={onRequestPPT}
                className="w-full text-left p-3 rounded-lg border bg-[#FF3C42]/10 border-[#FF3C42]/30 hover:border-[#FF3C42] hover:bg-white hover:text-[#FF3C42] transition-colors text-sm flex items-center justify-between group"
              >
                <span>분석 결과 PPT 생성</span>
                <FileText size={14} className="text-[#FF3C42] group-hover:text-[#FF3C42]" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SalesAnalysisDoneResponse;
