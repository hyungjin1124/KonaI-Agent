import React, { useState, useEffect, useRef } from 'react';
import { Plus, FileImage, Sparkles, MonitorPlay, BarChart2 } from '../../../../icons';
import TypingCursor from '../../../../shared/TypingCursor';

interface PPTDoneResponseProps {
  slideCount: number;
  onRequestSalesAnalysis?: () => void;
  isRightPanelCollapsed?: boolean;
  currentDashboardType?: 'financial' | 'did' | 'ppt';
  onOpenRightPanel?: () => void;
}

// 스트리밍 텍스트 컴포넌트
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
    intervalRef.current = setInterval(() => {
      setDisplayLength((prev) => {
        if (prev >= text.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsComplete(true);
          onComplete?.();
          return prev;
        }
        return prev + 1;
      });
    }, typingSpeed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, typingSpeed, onComplete]);

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

export const PPTDoneResponse: React.FC<PPTDoneResponseProps> = ({
  slideCount,
  onRequestSalesAnalysis,
  isRightPanelCollapsed,
  currentDashboardType,
  onOpenRightPanel
}) => {
  const [phase, setPhase] = useState(0); // 0: title, 1: description, 2: actions

  const titleText = 'Presentation created: Q4 2025 경영 실적 보고서';
  const descriptionText = `요청하신 내용을 바탕으로 경영 실적, 재무 성과, 사업부별 주요 성과 및 향후 계획을 포함한 ${slideCount}장의 슬라이드를 초안으로 작성했습니다.`;

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
                  요청하신 내용을 바탕으로 경영 실적, 재무 성과, 사업부별 주요 성과 및 향후 계획을
                  포함한 <strong>{slideCount}장의 슬라이드</strong>를 초안으로 작성했습니다.
                </>
              )}
            </p>
          )}
        </div>

        {/* Related Queries / Actions for PPT */}
        {phase >= 2 && (
          <>
            {/* 우측 패널 열기 버튼 - 현재 패널이 열려있으면 비활성화 */}
            {onOpenRightPanel && (() => {
              const isDisabled = !isRightPanelCollapsed && currentDashboardType === 'ppt';
              return (
                <button
                  onClick={onOpenRightPanel}
                  disabled={isDisabled}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium shadow-sm mb-4 ${
                    isDisabled
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#FF3C42] text-white hover:bg-[#E63338]'
                  }`}
                >
                  <span>PPT 결과</span>
                </button>
              );
            })()}

            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                Related Actions
              </p>

              <button className="w-full text-left p-3 rounded-lg border bg-white border-gray-200 hover:border-[#FF3C42] hover:text-[#FF3C42] transition-colors text-sm flex items-center justify-between group">
                <span>최신 ERP 데이터 연동 및 차트 업데이트</span>
                <Plus size={14} className="text-gray-400 group-hover:text-[#FF3C42]" />
              </button>
              <button className="w-full text-left p-3 rounded-lg border bg-white border-gray-200 hover:border-[#FF3C42] hover:text-[#FF3C42] transition-colors text-sm flex items-center justify-between group">
                <span>각 사업부별 대표 이미지 플레이스홀더 추가</span>
                <FileImage size={14} className="text-gray-400 group-hover:text-[#FF3C42]" />
              </button>
              <button className="w-full text-left p-3 rounded-lg border bg-white border-gray-200 hover:border-[#FF3C42] hover:text-[#FF3C42] transition-colors text-sm flex items-center justify-between group">
                <span>'향후 계획' 슬라이드에 세부 로드맵 추가</span>
                <Sparkles size={14} className="text-gray-400 group-hover:text-[#FF3C42]" />
              </button>
              {/* 매출 분석 시나리오 연동 버튼 */}
              <button
                onClick={onRequestSalesAnalysis}
                className="w-full text-left p-3 rounded-lg border bg-blue-50 border-blue-200 hover:border-[#FF3C42] hover:bg-white hover:text-[#FF3C42] transition-colors text-sm flex items-center justify-between group"
              >
                <span>매출 실적 상세 분석 보기</span>
                <BarChart2 size={14} className="text-blue-500 group-hover:text-[#FF3C42]" />
              </button>
            </div>

            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mt-2">
              <MonitorPlay size={16} />
              <span>슬라이드 쇼 모드로 보기</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PPTDoneResponse;
