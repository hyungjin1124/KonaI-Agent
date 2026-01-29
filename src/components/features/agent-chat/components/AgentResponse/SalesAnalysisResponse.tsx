import React, { useState, useEffect, useRef } from 'react';
import { FileText, PanelRightOpen } from '../../../../icons';
import TypingCursor from '../../../../shared/TypingCursor';

// 섹션별 텍스트 데이터
const SECTIONS = [
  {
    id: 'title',
    type: 'h3',
    text: '12월 경영 실적 심층 분석: 양적 성장과 질적 개선의 동시 달성',
  },
  {
    id: 'summary',
    type: 'p',
    text: `2025년 12월 결산 결과, 당사는 **월 매출 420억 원**을 기록하며 전월(370억 원) 대비 **+13.5%의 가파른 성장세**를 실현했습니다. 이는 당초 목표치였던 385억 원을 약 9% 초과 달성한 수치로, 올해 들어 가장 높은 월간 실적입니다. 더욱 고무적인 점은 매출 성장과 함께 영업이익률이 **18.2%**(전월비 +2.1%p)로 개선되었다는 사실입니다. 이는 단순한 물량 확대(Volume Growth)를 넘어, 수익성 중심의 제품 믹스 개선과 공정 효율화가 동시에 이루어진 '질적 성장'의 결과로 분석됩니다.`,
  },
  {
    id: 'section2-title',
    type: 'h4',
    text: '1. 매출 상승의 핵심 동인 (Revenue Drivers Breakdown)',
    className: 'text-blue-800',
  },
  {
    id: 'section2-intro',
    type: 'p',
    text: '금번 매출 상승은 크게 **P(가격)와 Q(수량)의 동반 상승**에 기인합니다. 세부 요인은 다음과 같습니다.',
  },
  {
    id: 'section2-list',
    type: 'ul',
    items: [
      `**주요 고객사 수주 확대 (Volume Effect):** 최대 고객사인 **A은행**의 신규 체크카드 런칭에 따른 초도 물량 20만 장 공급이 12월에 집중되었습니다. 또한, 연말 카드사들의 예산 소진 목적의 선발주 물량이 유입되며 B2B 부문 매출을 견인했습니다.`,
      `**제품 믹스 개선에 따른 ASP 상승 (Price Effect):** 기존 일반 플라스틱 카드 대비 단가가 3배 이상 높은 **'Gold Edition' 메탈 카드**의 출고 비중이 전월 12%에서 18%로 확대되었습니다. 특히 B카드사의 VIP 라인업 개편 전략과 맞물려 고부가 제품군 매출이 전월 대비 22억 원 증가했습니다.`,
      `**계절적 성수기 효과:** 12월은 전통적인 결제 단말기 및 카드 교체 수요가 높은 시기로, 플랫폼 사업부의 결제 수수료 매출 또한 전월 대비 8% 자연 증가하며 실적 하단을 지지했습니다.`,
    ],
  },
  {
    id: 'section3-title',
    type: 'h4',
    text: '2. 원가 구조 및 수익성 분석 (Cost Efficiency Deep Dive)',
    className: 'text-green-800',
  },
  {
    id: 'section3-intro',
    type: 'p',
    text: '매출 증가보다 주목할 점은 **원가율의 획기적 개선(68% → 62%)**입니다. 원가율 6%p 하락은 영업이익 규모를 약 25억 원 추가 확보하는 효과를 냈습니다.',
  },
  {
    id: 'section3-list',
    type: 'ul',
    items: [
      `**공정 자동화 효과 가시화:** 지난 10월 도입된 **3라인 후가공 자동화 설비**의 가동률이 12월 들어 95% 궤도에 올랐습니다. 이로 인해 수작업 공정 대비 불량률이 2.1%에서 0.5% 미만으로 급감하였으며, 단위당 노무비가 15% 절감되는 직접적인 효과를 거두었습니다.`,
      `**원자재 조달 최적화:** 최근 니켈 등 원자재 가격 변동성이 확대되었으나, 구매팀의 **'메탈 플레이트 6개월분 선계약(Hedging)'** 전략이 주효했습니다. 시장가 대비 약 12% 저렴한 단가로 자재를 투입함으로써 재료비 원가 경쟁력을 유지할 수 있었습니다.`,
      `**고정비 레버리지 효과:** 매출 규모(Q)가 커지면서 감가상각비 등 고정비 비중이 희석되는 '영업 레버리지' 효과가 극대화되었습니다. 이는 공장 가동률 상승이 수익성 개선으로 직결되는 제조업의 전형적인 선순환 구조입니다.`,
    ],
  },
  {
    id: 'section4-title',
    type: 'h4',
    text: '3. 향후 리스크 및 전략적 제언 (Strategic Outlook)',
  },
  {
    id: 'section4-intro',
    type: 'p',
    text: '긍정적인 12월 실적에도 불구하고, 2026년 1분기를 대비한 몇 가지 리스크 관리와 전략적 의사결정이 필요합니다.',
  },
  {
    id: 'section4-box',
    type: 'box',
    title: 'CEO Action Items',
    items: [
      `**저수익 고객군 구조조정 검토:** 현재 역성장 중인 **C카드사** 등 저마진 범용 제품 위주의 고객사에 대해서는 단가 인상 협상 또는 'Premium Mix'로의 전환을 강력히 제안해야 합니다. 수익성이 낮은 매출은 과감히 축소하고, 고부가 라인에 생산 CAPA를 집중하는 '선택과 집중' 전략이 유효합니다.`,
      `**설비 투자(CAPEX) 조기 집행:** 현재 가동률이 95%에 육박함에 따라, 1분기 예상 수주 물량을 소화하기 위해서는 **자동화 라인 2호기 발주**를 서둘러야 합니다. 납기 리드타임을 고려할 때 1월 내 의사결정이 필요합니다.`,
      `**환율 리스크 모니터링:** 원자재 수입 비중이 높은 만큼, 최근 환율 상승 기조에 대비하여 1분기 결제 통화 포트폴리오를 점검할 필요가 있습니다.`,
    ],
  },
  {
    id: 'footer',
    type: 'footer',
    text: '* 본 분석은 ERP 실시간 데이터(2025.12.31 기준)를 토대로 작성되었습니다.',
  },
];

// Bold 텍스트 파싱 함수 (**text** -> <strong>text</strong>)
const parseTextWithBold = (text: string, displayLength?: number): React.ReactNode[] => {
  const displayText = displayLength !== undefined ? text.slice(0, displayLength) : text;
  const parts = displayText.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

interface StreamingTextProps {
  text: string;
  typingSpeed?: number;
  onComplete?: () => void;
  showCursor?: boolean;
}

const StreamingTextSpan: React.FC<StreamingTextProps> = ({
  text,
  typingSpeed = 15,
  onComplete,
  showCursor = true,
}) => {
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
      {parseTextWithBold(text, displayLength)}
      {showCursor && !isComplete && <TypingCursor visible={cursorVisible} height="h-4" />}
    </>
  );
};

// 지연 후 완료 콜백을 호출하는 유틸리티 컴포넌트
const DelayedComplete: React.FC<{
  delayMs: number;
  onComplete: () => void;
}> = ({ delayMs, onComplete }) => {
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onCompleteRef.current();
    }, delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return null;
};

interface SalesAnalysisResponseProps {
  onComplete?: () => void;
  onRequestPPT?: () => void;
  isRightPanelCollapsed?: boolean;
  onOpenRightPanel?: () => void;
}

const SalesAnalysisResponse: React.FC<SalesAnalysisResponseProps> = ({
  onComplete,
  onRequestPPT,
  isRightPanelCollapsed,
  onOpenRightPanel
}) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [isAllComplete, setIsAllComplete] = useState(false);

  const handleSectionComplete = (index: number) => {
    setCompletedSections((prev) => new Set(prev).add(index));
    // 다음 섹션으로 진행 (50ms 딜레이)
    setTimeout(() => {
      const nextIndex = Math.min(index + 1, SECTIONS.length - 1);
      setCurrentSectionIndex(nextIndex);

      // 마지막 섹션 완료 시 전체 완료 상태로 전환
      if (index === SECTIONS.length - 1) {
        setIsAllComplete(true);
        onComplete?.();
      }
    }, 50);
  };

  const renderSection = (section: (typeof SECTIONS)[number], index: number) => {
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
              parseTextWithBold(section.text)
            ) : (
              <StreamingTextSpan
                text={section.text}
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
              parseTextWithBold(section.text)
            ) : (
              <StreamingTextSpan
                text={section.text}
                typingSpeed={20}
                onComplete={() => handleSectionComplete(index)}
                showCursor={showCursor}
              />
            )}
          </h4>
        );

      case 'p':
        return (
          <p key={section.id} className="mb-4">
            {isCompleted ? (
              parseTextWithBold(section.text)
            ) : (
              <StreamingTextSpan
                text={section.text}
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
                text={section.text}
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

  // hr 삽입 위치 (section2-title 전, section4-title 전)
  const hrBeforeIndices = [2, 8];

  return (
    <div className="flex gap-4 mb-2 animate-fade-in-up w-full">
      <div className="w-8 h-8 rounded bg-[#FF3C42] flex items-center justify-center shrink-0 mt-1 shadow-sm h-fit">
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

        {/* 분석 완료 후 PPT 생성 연동 버튼 */}
        {isAllComplete && (
          <div className="mt-6 pt-4 border-t border-gray-200 animate-fade-in-up">
            {/* 우측 패널 열기 버튼 - 패널이 접혀있을 때만 표시 */}
            {isRightPanelCollapsed && onOpenRightPanel && (
              <button
                onClick={onOpenRightPanel}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#FF3C42] text-white rounded-lg hover:bg-[#E63338] transition-colors text-sm font-medium shadow-sm mb-4"
              >
                <PanelRightOpen size={16} />
                <span>분석 대시보드 보기</span>
              </button>
            )}

            <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">
              Related Actions
            </p>
            <button
              onClick={onRequestPPT}
              className="w-full text-left p-3 rounded-lg border bg-blue-50 border-blue-200 hover:border-[#FF3C42] hover:bg-white hover:text-[#FF3C42] transition-colors text-sm flex items-center justify-between group"
            >
              <span>분석 결과 PPT로 제작</span>
              <FileText size={14} className="text-blue-500 group-hover:text-[#FF3C42]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesAnalysisResponse;
