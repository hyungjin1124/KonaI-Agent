import React from 'react';
import { Pencil, X, Check, ChevronDown, Wand2 } from 'lucide-react';
import { HitlOption, ToolType, DataValidationSummary } from '../types';
import { PPTConfig } from '../../../../types';

interface HITLFloatingPanelProps {
  isVisible: boolean;
  question: string;
  options: HitlOption[];
  selectedOption?: string;
  onSelect: (optionId: string) => void;
  onSkip?: () => void;
  onClose?: () => void;
  totalQuestions?: number;
  currentQuestion?: number;
  // 도구 타입별 분기용
  toolType?: ToolType;
  // data_validation용
  validationData?: DataValidationSummary;
  // ppt_setup용
  pptConfig?: PPTConfig;
  onPptConfigUpdate?: <K extends keyof PPTConfig>(key: K, value: PPTConfig[K]) => void;
  onPptSetupComplete?: () => void;
}

/**
 * HITL 플로팅 패널 컴포넌트
 * - 채팅 입력창 위에 표시되는 사용자 선택 패널
 * - Claude Cowork 스타일
 * - toolType별 커스텀 렌더링 지원
 */
export const HITLFloatingPanel: React.FC<HITLFloatingPanelProps> = ({
  isVisible,
  question,
  options,
  selectedOption,
  onSelect,
  onSkip,
  onClose,
  totalQuestions = 1,
  currentQuestion = 1,
  toolType,
  validationData,
  pptConfig,
  onPptConfigUpdate,
  onPptSetupComplete,
}) => {
  if (!isVisible) return null;

  // PPT 세부 설정 UI 렌더링
  const renderPptSetupContent = () => {
    if (!pptConfig || !onPptConfigUpdate || !onPptSetupComplete) return null;

    return (
      <div className="space-y-5">
        {/* 테마 선택 */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">디자인 테마</label>
          <div className="grid grid-cols-3 gap-2">
            {(['Corporate Blue', 'Modern Dark', 'Nature Green'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => onPptConfigUpdate('theme', theme)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                  pptConfig.theme === theme
                  ? 'border-[#FF3C42] bg-red-50 text-[#FF3C42]'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        {/* 톤앤매너 */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">톤앤매너</label>
          <div className="flex flex-wrap gap-4">
            {(['Data-driven', 'Formal', 'Storytelling'] as const).map((tone) => (
              <label key={tone} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  checked={pptConfig.tone === tone}
                  onChange={() => onPptConfigUpdate('tone', tone)}
                  className="hidden"
                />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  pptConfig.tone === tone ? 'border-[#FF3C42]' : 'border-gray-300 group-hover:border-gray-400'
                }`}>
                  {pptConfig.tone === tone && <div className="w-2 h-2 rounded-full bg-[#FF3C42]" />}
                </div>
                <span className={`text-sm transition-colors ${
                  pptConfig.tone === tone ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-700'
                }`}>
                  {tone}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 포함할 주요 내용 */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">포함할 주요 내용</label>
          <div className="space-y-1.5">
            {['Executive Summary', 'Q4 Revenue Overview', 'YoY Comparison', 'Regional Performance', 'Future Outlook'].map((topic) => {
              const isSelected = pptConfig.topics.includes(topic);
              return (
                <button
                  key={topic}
                  onClick={() => {
                    const newTopics = isSelected
                      ? pptConfig.topics.filter(t => t !== topic)
                      : [...pptConfig.topics, topic];
                    onPptConfigUpdate('topics', newTopics);
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all ${
                    isSelected
                    ? 'bg-blue-50 border-blue-200'
                    : 'border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 bg-white'
                  }`}>
                    {isSelected && <Check size={10} />}
                  </div>
                  <span className="text-sm text-gray-700">{topic}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 슬라이드 수 & 폰트 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">폰트 스타일</label>
            <div className="relative">
              <select
                value={pptConfig.titleFont}
                onChange={(e) => onPptConfigUpdate('titleFont', e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#FF3C42] focus:ring-1 focus:ring-[#FF3C42]"
              >
                <option value="Pretendard">Pretendard</option>
                <option value="Noto Sans KR">Noto Sans KR</option>
                <option value="Montserrat">Montserrat</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">슬라이드 수</label>
            <input
              type="number"
              value={pptConfig.slideCount}
              onChange={(e) => onPptConfigUpdate('slideCount', e.target.value === '' ? '' : parseInt(e.target.value))}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#FF3C42] focus:ring-1 focus:ring-[#FF3C42]"
              min={5} max={50}
            />
          </div>
        </div>

        {/* 완료 버튼 */}
        <button
          onClick={onPptSetupComplete}
          className="w-full py-3 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-md hover:shadow-lg transform active:scale-[0.99]"
        >
          <Wand2 size={16} />
          설정 완료 및 생성
        </button>
      </div>
    );
  };

  // 데이터 검증 UI 렌더링
  const renderValidationContent = () => {
    if (!validationData) return null;

    return (
      <div className="space-y-4">
        {/* 데이터 박스 */}
        <div className="p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-gray-500 font-medium">매출액</span>
              <p className="text-lg font-bold text-gray-900">{validationData.revenue}</p>
              <span className="inline-flex items-center text-xs text-green-600 font-medium">
                ↑ {validationData.revenueGrowth}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-gray-500 font-medium">영업이익</span>
              <p className="text-lg font-bold text-gray-900">{validationData.operatingProfit}</p>
              <span className="inline-flex items-center text-xs text-green-600 font-medium">
                ↑ {validationData.operatingProfitGrowth}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-0.5">
            <p>데이터 기준일: {validationData.dataDate}</p>
            <p>출처: {validationData.dataSources.join(', ')}</p>
          </div>
        </div>

        {/* 확인/수정 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={() => onSelect('confirm')}
            className="flex-1 py-3 bg-black text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all shadow-md"
          >
            확인
          </button>
          <button
            onClick={() => onSelect('modify')}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            수정 요청
          </button>
        </div>
      </div>
    );
  };

  // 기본 옵션 버튼 렌더링
  const renderDefaultOptions = () => (
    <>
      <div className="space-y-2">
        {options.map((option, idx) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`
              w-full p-3.5 rounded-xl border text-left transition-all flex items-center gap-3
              ${selectedOption === option.id
                ? 'border-[#FF3C42] bg-red-50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
              }
            `}
          >
            {/* 숫자 아이콘 */}
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors ${
              selectedOption === option.id
                ? 'bg-[#FF3C42] text-white'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {idx + 1}
            </span>

            {/* 라벨 및 설명 */}
            <div className="flex-1 min-w-0">
              <span className="text-sm text-gray-800 font-medium block">{option.label}</span>
              {option.description && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">{option.description}</p>
              )}
            </div>

            {/* 추천 표시 */}
            {option.recommended && (
              <span className="text-xs text-[#FF3C42] font-semibold px-2 py-1 bg-red-50 rounded-full shrink-0">
                추천
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 기타 입력 + 건너뛰기 - 자연스러운 구분 */}
      <div className="flex items-center justify-between pt-4 mt-2">
        <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          <Pencil size={14} />
          <span>기타</span>
        </button>
        {onSkip && (
          <button
            onClick={onSkip}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            건너뛰기
          </button>
        )}
      </div>
    </>
  );

  // toolType에 따라 적절한 콘텐츠 렌더링
  const renderContent = () => {
    if (toolType === 'ppt_setup' && pptConfig && onPptConfigUpdate) {
      return renderPptSetupContent();
    }
    if (toolType === 'data_validation' && validationData) {
      return renderValidationContent();
    }
    return renderDefaultOptions();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 mb-4 animate-fade-in-up ring-1 ring-black/5">
      {/* 헤더: 질문 + 진행 상황 + 닫기 */}
      <div className="flex items-start justify-between mb-5">
        <h4 className="text-sm font-semibold text-gray-900 flex-1 pr-4 leading-relaxed">
          {question}
        </h4>
        <div className="flex items-center gap-2 shrink-0">
          {totalQuestions > 1 && (
            <span className="text-xs text-gray-400 font-medium">
              {totalQuestions}개 중 {currentQuestion}개
            </span>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      {renderContent()}
    </div>
  );
};

export default HITLFloatingPanel;
