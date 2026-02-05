import React, { RefObject } from 'react';
import {
  Plus, Mic, ArrowUp, FileText, Globe, Box, Palette, MoreHorizontal,
  TrendingUp, PieChart, Users, Paperclip, X
} from '../../../icons';
import { SampleInterfaceContext } from '../../../../types';

/**
 * 퀵 액션 칩 타입
 */
interface QuickActionChip {
  icon: React.ReactNode;
  label: string;
}

/**
 * 추천 프롬프트 타입
 */
interface SuggestionItem {
  title: string;
  description?: string;
  prompt: string;
  icon: React.ReactNode;
}

/**
 * HomeView Props
 */
interface HomeViewProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  contextData: SampleInterfaceContext | null;
  setContextData: (data: SampleInterfaceContext | null) => void;
  textareaRef: RefObject<HTMLTextAreaElement>;
  onSend: (text: string) => void;
}

/**
 * 퀵 액션 칩 데이터
 */
const QUICK_ACTION_CHIPS: QuickActionChip[] = [
  { icon: <FileText size={14} />, label: '슬라이드 제작' },
  { icon: <Globe size={14} />, label: '데이터 시각화' },
  { icon: <Box size={14} />, label: 'Wide Research' },
  { icon: <Palette size={14} />, label: '비디오 생성' },
  { icon: <MoreHorizontal size={14} />, label: '더보기' },
];

/**
 * 추천 프롬프트 데이터
 */
const SUGGESTED_PROMPTS: SuggestionItem[] = [
  {
    title: '실적 분석',
    description: '코나아이 ERP의 2025년 월별 매출 데이터를 분석 및 시각화',
    prompt: '코나아이 ERP의 2025년 월별 매출 데이터를 분석하여 시각화:\n- 월별 매출 추이\n- 사업부별 매출 구성\n- 주요 거래처 Top 10\n- 전년 동기 대비 성장률 KPI 카드 차트',
    icon: <TrendingUp size={20} className="text-[#FF3C42]" />
  },
  {
    title: 'DID 리포트',
    description: 'DID 사업부 매출 및 원가 효율성 상세 분석 요청',
    prompt: 'DID 사업부의 2025년 성과를 분석해줘:\n- 국내/해외 매출 비중 추이\n- 메탈 카드 원가율 분석\n- 주력 칩셋 판매 순위',
    icon: <PieChart size={20} className="text-[#FF6D72]" />
  },
  {
    title: 'PPT 생성',
    description: 'Q4 2025 경영 실적 보고서 PPT 생성',
    prompt: `Q4 2025 경영 실적 보고서 PPT를 만들어주세요.\n다음 섹션을 포함해주세요:\n- 표지 (회사 로고, 보고 일자)\n- 목차\n- 요약 (Executive Summary)\n- 재무 성과 (매출, 영업이익, 순이익)\n- 주요 사업 성과 (신규 계약, 프로젝트 완료율)\n- 향후 계획`,
    icon: <FileText size={20} className="text-[#FF9DA0]" />
  },
  {
    title: '인사이트',
    prompt: '환율 1,500원 달성 시 이번 분기 원가 영향 분석 및 대처 방안',
    icon: <Users size={20} className="text-black" />
  },
];

/**
 * HomeView 컴포넌트
 *
 * 에이전트 채팅의 초기 화면 (랜딩 페이지)
 */
export const HomeView: React.FC<HomeViewProps> = ({
  inputValue,
  setInputValue,
  contextData,
  setContextData,
  textareaRef,
  onSend,
}) => {
  return (
    <div data-testid="analysis-view" className="flex flex-col items-center justify-center w-full h-full max-w-3xl mx-auto px-6 pb-20 animate-fade-in-up">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#000000] tracking-tight">
          무엇을 도와드릴까요?
        </h1>
      </div>

      <div className="w-full flex flex-col gap-6">
        {/* 입력 영역 */}
        <div className="relative bg-[#FFFFFF] rounded-2xl border border-[#848383] focus-within:border-[#FF3C42] transition-all shadow-lg p-4">
          {/* Context Chip (Visual Indicator) */}
          {contextData && (
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100 animate-fade-in-up">
              <Paperclip size={12} />
              <span>Context: {contextData.name}</span>
              <button onClick={() => setContextData(null)} className="ml-1 hover:text-blue-900">
                <X size={12} />
              </button>
            </div>
          )}

          <textarea
            ref={textareaRef}
            rows={1}
            className={`w-full bg-transparent border-none focus:ring-0 focus:outline-none text-[#000000] placeholder-[#848383] resize-none text-base max-h-[200px] overflow-y-auto ${contextData ? 'pt-8' : ''}`}
            style={{ padding: '16px 0' }}
            placeholder="작업을 할당하거나 무엇이든 질문하세요"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (inputValue.trim()) onSend(inputValue);
              }
            }}
          />

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full text-[#848383] hover:text-[#FF3C42] transition-colors">
                <Plus size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full text-[#848383] hover:text-[#FF3C42] transition-colors">
                <Mic size={20} />
              </button>
              <button
                className={`p-2 rounded-full transition-all ${inputValue ? 'bg-[#FF3C42] text-white' : 'bg-gray-200 text-[#848383] cursor-not-allowed'}`}
                disabled={!inputValue}
                onClick={() => inputValue && onSend(inputValue)}
              >
                <ArrowUp size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* 퀵 액션 칩 */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {QUICK_ACTION_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#848383] bg-[#FFFFFF] hover:bg-gray-50 hover:border-[#FF3C42] text-xs font-medium text-[#848383] hover:text-[#FF3C42] transition-all"
            >
              {chip.icon}
              {chip.label}
            </button>
          ))}
        </div>

        {/* 추천 질문 섹션 */}
        <div className="w-full mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SUGGESTED_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                className="p-4 rounded-xl border border-[#848383] bg-[#FFFFFF] hover:bg-gray-50 hover:border-[#FF3C42] text-left transition-all group flex items-start gap-4 shadow-sm hover:shadow-md"
                onClick={() => onSend(item.prompt)}
              >
                <div className="mt-0.5 p-2.5 rounded-lg bg-[#FFFFFF] border border-[#848383] group-hover:border-[#FF3C42] shrink-0">
                  {item.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[#848383] group-hover:text-[#FF3C42]">{item.title}</span>
                  <span className="text-sm text-[#000000] leading-snug line-clamp-2 whitespace-pre-line">
                    {item.description || item.prompt}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
