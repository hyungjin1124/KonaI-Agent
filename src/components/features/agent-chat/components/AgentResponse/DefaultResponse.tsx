import React, { useState, useEffect, useRef } from 'react';
import { PanelRightOpen } from '../../../../icons';
import TypingCursor from '../../../../shared/TypingCursor';

interface DefaultResponseProps {
  dashboardType: 'financial' | 'did' | 'ppt';
  isRightPanelCollapsed?: boolean;
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

// Card 컴포넌트 with streaming
const HighlightCard: React.FC<{
  emoji: string;
  title: string;
  description: React.ReactNode;
  bgClass: string;
  borderClass: string;
  titleColorClass: string;
  textColorClass: string;
  isVisible: boolean;
  isStreaming: boolean;
  onComplete?: () => void;
}> = ({
  emoji,
  title,
  description,
  bgClass,
  borderClass,
  titleColorClass,
  textColorClass,
  isVisible,
  isStreaming,
  onComplete,
}) => {
  if (!isVisible) return null;

  return (
    <div className={`p-4 ${bgClass} rounded-xl border ${borderClass} hover:border-opacity-80 transition-colors`}>
      <h4 className={`font-bold ${titleColorClass} text-sm mb-1 flex items-center gap-2`}>
        <span className="text-lg">{emoji}</span>
        {isStreaming ? (
          <StreamingTextSpan text={title} typingSpeed={25} onComplete={onComplete} />
        ) : (
          title
        )}
      </h4>
      {!isStreaming && (
        <p className={`${textColorClass} text-xs leading-relaxed pl-7`}>{description}</p>
      )}
    </div>
  );
};

export const DefaultResponse: React.FC<DefaultResponseProps> = ({
  dashboardType,
  isRightPanelCollapsed,
  onOpenRightPanel
}) => {
  const [phase, setPhase] = useState(0); // 0: title, 1: description, 2+: cards

  const titles = {
    did: 'DID 사업부 분석 리포트',
    financial: '데이터 분석 결과 리포트',
    ppt: '데이터 분석 결과 리포트',
  };

  const descriptions = {
    did: '요청하신 DID 사업부의 매출 구성, 원가율 추이 및 주요 칩셋 판매량을 분석했습니다. 글로벌 시장 비중 확대와 원가 절감 노력이 가시적인 성과를 보이고 있습니다.',
    financial:
      '요청하신 코나아이 ERP 2025년 데이터를 기반으로 월별 매출, 사업부 구성, 주요 거래처 현황을 시각화했습니다. 데이터 분석 결과, 전반적인 성장세가 확인됩니다.',
    ppt: '요청하신 코나아이 ERP 2025년 데이터를 기반으로 월별 매출, 사업부 구성, 주요 거래처 현황을 시각화했습니다. 데이터 분석 결과, 전반적인 성장세가 확인됩니다.',
  };

  const didCards = [
    {
      emoji: '🌍',
      title: '글로벌 매출 비중 확대',
      description: (
        <>
          해외 매출 비중이 전분기 대비 <strong>대폭 증가하여 66%</strong>를 달성했습니다. 이는 DID
          기술의 해외 수출 계약 건수 증가에 기인합니다.
        </>
      ),
      bgClass: 'bg-orange-50/50',
      borderClass: 'border-orange-100 hover:border-orange-200',
      titleColorClass: 'text-orange-900',
      textColorClass: 'text-orange-800',
    },
    {
      emoji: '📉',
      title: '원가율 1.7%p 개선',
      description: (
        <>
          메탈 카드 공정 자동화 도입으로 원가율이 <strong>13.5%</strong>까지 낮아졌으며, 이는 사업부
          수익성 개선의 핵심 요인입니다.
        </>
      ),
      bgClass: 'bg-green-50/50',
      borderClass: 'border-green-100 hover:border-green-200',
      titleColorClass: 'text-green-900',
      textColorClass: 'text-green-800',
    },
  ];

  const financialCards = [
    {
      emoji: '📈',
      title: '연말 매출 급증 (Seasonality)',
      description: (
        <>
          11월부터 매출이 가파르게 상승하여 <strong>12월에 연중 최고치(151억 원)</strong>를
          기록했습니다. 이는 연말 프로모션 효과와 IT 예산 집행이 4분기에 집중된 결과로 해석됩니다.
        </>
      ),
      bgClass: 'bg-blue-50/50',
      borderClass: 'border-blue-100 hover:border-blue-200',
      titleColorClass: 'text-blue-900',
      textColorClass: 'text-blue-800',
    },
    {
      emoji: '💼',
      title: '핵심 사업부 집중도 심화',
      description: (
        <>
          <strong>플랫폼(38%)</strong>과 <strong>핀테크(27%)</strong> 사업부가 전체 매출의
          과반(65%)을 차지하며 회사의 캐시카우 역할을 하고 있습니다. 신사업인 B2B 솔루션도 10%
          비중으로 안착했습니다.
        </>
      ),
      bgClass: 'bg-[#FFF8F6]',
      borderClass: 'border-stone-200 hover:border-stone-300',
      titleColorClass: 'text-stone-900',
      textColorClass: 'text-stone-700',
    },
    {
      emoji: '⚠️',
      title: '상위 거래처 의존도',
      description: (
        <>
          상위 3개 거래처(Top 3)가 전체 매출의 <strong>약 31%</strong>를 점유하고 있습니다. 리스크
          분산을 위해 중소형 클라이언트 확대 전략이 필요합니다.
        </>
      ),
      bgClass: 'bg-orange-50/50',
      borderClass: 'border-orange-100 hover:border-orange-200',
      titleColorClass: 'text-orange-900',
      textColorClass: 'text-orange-800',
    },
    {
      emoji: '🚀',
      title: '지속적인 YoY 성장',
      description: (
        <>
          전월 대비 변동성은 존재하나, 전년 동기(YoY) 대비로는 꾸준한 우상향 추세를 유지하고 있어
          2025년 목표 달성이 긍정적입니다.
        </>
      ),
      bgClass: 'bg-green-50/50',
      borderClass: 'border-green-100 hover:border-green-200',
      titleColorClass: 'text-green-900',
      textColorClass: 'text-green-800',
    },
  ];

  const cards = dashboardType === 'did' ? didCards : financialCards;
  const totalPhases = 2 + cards.length + 1; // title, desc, cards, footer

  return (
    <div className="flex gap-4 mb-2 animate-fade-in-up">
      <div className="w-8 h-8 rounded bg-[#FF3C42] flex items-center justify-center shrink-0 mt-1 shadow-sm">
        <span className="text-white font-bold text-xs">K</span>
      </div>
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="prose prose-sm">
          <h3 className="text-lg font-bold text-black mb-2">
            {phase === 0 ? (
              <StreamingTextSpan
                text={titles[dashboardType]}
                typingSpeed={30}
                onComplete={() => setPhase(1)}
              />
            ) : (
              titles[dashboardType]
            )}
          </h3>
          {phase >= 1 && (
            <p className="text-gray-700 leading-relaxed text-sm mb-4">
              {phase === 1 ? (
                <StreamingTextSpan
                  text={descriptions[dashboardType]}
                  typingSpeed={12}
                  onComplete={() => setPhase(2)}
                />
              ) : (
                descriptions[dashboardType]
              )}
            </p>
          )}
        </div>

        {/* Analysis Highlights Cards */}
        {phase >= 2 && (
          <div className="space-y-3">
            {cards.map((card, index) => {
              const cardPhase = index + 2;
              const isVisible = phase >= cardPhase;
              const isStreaming = phase === cardPhase;

              return (
                <HighlightCard
                  key={index}
                  emoji={card.emoji}
                  title={card.title}
                  description={card.description}
                  bgClass={card.bgClass}
                  borderClass={card.borderClass}
                  titleColorClass={card.titleColorClass}
                  textColorClass={card.textColorClass}
                  isVisible={isVisible}
                  isStreaming={isStreaming}
                  onComplete={() => setPhase(cardPhase + 1)}
                />
              );
            })}
          </div>
        )}

        {/* Footer */}
        {phase >= totalPhases - 1 && (
          <div className="pt-4 border-t border-gray-100">
            {/* 우측 패널 열기 버튼 - 패널이 접혀있을 때만 표시 */}
            {isRightPanelCollapsed && onOpenRightPanel && (
              <button
                onClick={onOpenRightPanel}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#FF3C42] text-white rounded-lg hover:bg-[#E63338] transition-colors text-sm font-medium shadow-sm mb-4"
              >
                <PanelRightOpen size={16} />
                <span>대시보드 보기</span>
              </button>
            )}
            <p className="text-xs text-gray-500">
              {phase === totalPhases - 1 ? (
                <StreamingTextSpan
                  text="우측 패널에서 상세 차트와 원본 데이터를 확인하실 수 있습니다. 추가 분석이 필요하면 말씀해 주세요."
                  typingSpeed={15}
                  onComplete={() => setPhase(totalPhases)}
                />
              ) : (
                '우측 패널에서 상세 차트와 원본 데이터를 확인하실 수 있습니다. 추가 분석이 필요하면 말씀해 주세요.'
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DefaultResponse;
