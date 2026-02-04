import React, { useState } from 'react';
import { Pencil, X, Check, ChevronDown, ChevronLeft, ChevronRight, Wand2 } from 'lucide-react';
import { HitlOption, ToolType, DataValidationSummary } from '../types';
import { PPTConfig } from '../../../../types';
import {
  PPT_SETUP_STEPS,
  PPT_THEME_OPTIONS,
  PPT_FONT_OPTIONS,
  PPT_TOPIC_OPTIONS,
  PPTSetupStepId
} from './ToolCall/constants';

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

// 인라인 수정 타입
type EditingField = 'theme' | 'font' | 'topics' | 'slideCount' | null;

/**
 * HITL 플로팅 패널 컴포넌트
 * - 채팅 입력창 위에 표시되는 사용자 선택 패널
 * - Claude Cowork 스타일
 * - toolType별 커스텀 렌더링 지원
 * - PPT Setup: 3단계 Wizard UI
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
  // PPT Setup Wizard 상태
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [editingField, setEditingField] = useState<EditingField>(null);

  if (!isVisible) return null;

  // Step 네비게이션
  const currentStep = PPT_SETUP_STEPS[currentStepIndex];
  const totalSteps = PPT_SETUP_STEPS.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setEditingField(null);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setEditingField(null);
    }
  };

  // 테마 선택 시 자동으로 다음 단계 이동
  const handleThemeSelect = (theme: PPTConfig['theme']) => {
    onPptConfigUpdate?.('theme', theme);
    // 폰트가 선택되어 있으면 자동으로 다음 단계로
    setTimeout(() => {
      if (pptConfig?.titleFont) {
        handleNext();
      }
    }, 300);
  };

  // Progress Indicator 렌더링
  const renderProgressIndicator = () => (
    <div className="flex items-center gap-1.5">
      {PPT_SETUP_STEPS.map((step, index) => (
        <div
          key={step.id}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            index < currentStepIndex
              ? 'bg-green-500'
              : index === currentStepIndex
                ? 'bg-[#FF3C42] scale-125'
                : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );

  // Step 1: 디자인 설정 (테마 + 폰트)
  const renderDesignStep = () => (
    <div className="space-y-5">
      {/* 테마 선택 */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">테마</label>
        <div className="grid grid-cols-3 gap-2">
          {PPT_THEME_OPTIONS.map((theme) => (
            <button
              key={theme}
              onClick={() => handleThemeSelect(theme)}
              className={`px-3 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                pptConfig?.theme === theme
                  ? 'border-[#FF3C42] bg-red-50 text-[#FF3C42] shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white hover:bg-gray-50'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      {/* 폰트 선택 */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">폰트 스타일</label>
        <div className="relative">
          <select
            value={pptConfig?.titleFont || 'Pretendard'}
            onChange={(e) => onPptConfigUpdate?.('titleFont', e.target.value)}
            className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#FF3C42] focus:ring-2 focus:ring-[#FF3C42]/20 transition-all"
          >
            {PPT_FONT_OPTIONS.map((font) => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );

  // Step 2: 콘텐츠 설정 (토픽 + 슬라이드 수)
  const renderContentStep = () => (
    <div className="space-y-5">
      {/* 포함할 주요 내용 */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">포함할 주요 내용</label>
        <div className="space-y-1.5">
          {PPT_TOPIC_OPTIONS.map((topic) => {
            const isSelected = pptConfig?.topics.includes(topic);
            return (
              <button
                key={topic}
                onClick={() => {
                  const newTopics = isSelected
                    ? pptConfig?.topics.filter(t => t !== topic) || []
                    : [...(pptConfig?.topics || []), topic];
                  onPptConfigUpdate?.('topics', newTopics);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'bg-blue-50 border-blue-300'
                    : 'border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 bg-white'
                }`}>
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </div>
                <span className={`text-sm ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                  {topic}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 슬라이드 수 */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">슬라이드 수</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={pptConfig?.slideCount || ''}
            onChange={(e) => onPptConfigUpdate?.('slideCount', e.target.value === '' ? '' : parseInt(e.target.value))}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#FF3C42] focus:ring-2 focus:ring-[#FF3C42]/20 transition-all"
            min={5}
            max={50}
            placeholder="15"
          />
          <span className="text-sm text-gray-500">장</span>
        </div>
      </div>
    </div>
  );

  // Step 3: 설정 확인 (요약 + 인라인 수정)
  const renderConfirmStep = () => {
    const topicsText = pptConfig?.topics.length === 1
      ? pptConfig.topics[0]
      : pptConfig?.topics.length
        ? `${pptConfig.topics[0]} 외 ${pptConfig.topics.length - 1}개`
        : '선택 없음';

    return (
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          {/* 테마 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">테마</span>
            {editingField === 'theme' ? (
              <select
                value={pptConfig?.theme}
                onChange={(e) => {
                  onPptConfigUpdate?.('theme', e.target.value as PPTConfig['theme']);
                  setEditingField(null);
                }}
                onBlur={() => setEditingField(null)}
                autoFocus
                className="text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-[#FF3C42]"
              >
                {PPT_THEME_OPTIONS.map((theme) => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{pptConfig?.theme}</span>
                <button
                  onClick={() => setEditingField('theme')}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                >
                  <Pencil size={12} />
                </button>
              </div>
            )}
          </div>

          {/* 폰트 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">폰트</span>
            {editingField === 'font' ? (
              <select
                value={pptConfig?.titleFont}
                onChange={(e) => {
                  onPptConfigUpdate?.('titleFont', e.target.value);
                  setEditingField(null);
                }}
                onBlur={() => setEditingField(null)}
                autoFocus
                className="text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-[#FF3C42]"
              >
                {PPT_FONT_OPTIONS.map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{pptConfig?.titleFont}</span>
                <button
                  onClick={() => setEditingField('font')}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                >
                  <Pencil size={12} />
                </button>
              </div>
            )}
          </div>

          {/* 포함 내용 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">포함 내용</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{topicsText}</span>
              <button
                onClick={() => setCurrentStepIndex(1)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
              >
                <Pencil size={12} />
              </button>
            </div>
          </div>

          {/* 슬라이드 수 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">슬라이드</span>
            {editingField === 'slideCount' ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={pptConfig?.slideCount || ''}
                  onChange={(e) => onPptConfigUpdate?.('slideCount', e.target.value === '' ? '' : parseInt(e.target.value))}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                  autoFocus
                  className="w-16 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-[#FF3C42]"
                  min={5}
                  max={50}
                />
                <span className="text-sm text-gray-500">장</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{pptConfig?.slideCount}장</span>
                <button
                  onClick={() => setEditingField('slideCount')}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                >
                  <Pencil size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 생성 버튼 */}
        <button
          onClick={onPptSetupComplete}
          className="w-full py-3.5 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform active:scale-[0.99]"
        >
          <Wand2 size={18} />
          설정 완료 및 생성
        </button>
      </div>
    );
  };

  // PPT 세부 설정 Wizard UI 렌더링
  const renderPptSetupContent = () => {
    if (!pptConfig || !onPptConfigUpdate || !onPptSetupComplete) return null;

    const stepRenderers: Record<PPTSetupStepId, () => JSX.Element> = {
      design: renderDesignStep,
      content: renderContentStep,
      confirm: renderConfirmStep,
    };

    return (
      <div className="space-y-4">
        {stepRenderers[currentStep.id]()}

        {/* 네비게이션 버튼 (확인 단계 제외) */}
        {!isLastStep && (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleBack}
              disabled={isFirstStep}
              className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                isFirstStep
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ChevronLeft size={16} />
              이전
            </button>

            <span className="text-xs text-gray-400">
              {currentStepIndex + 1} / {totalSteps}
            </span>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 text-sm font-medium text-[#FF3C42] hover:text-[#E63338] transition-colors"
            >
              다음
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* 확인 단계에서 이전 버튼만 표시 */}
        {isLastStep && (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronLeft size={16} />
              이전
            </button>
            <span className="text-xs text-gray-400">
              {currentStepIndex + 1} / {totalSteps}
            </span>
            <div className="w-12" /> {/* 균형을 위한 빈 공간 */}
          </div>
        )}
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

  // PPT Setup일 때 헤더 정보
  const isPptSetup = toolType === 'ppt_setup' && pptConfig && onPptConfigUpdate;
  const headerTitle = isPptSetup ? currentStep.title : question;
  const headerDescription = isPptSetup ? currentStep.description : null;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 mb-4 animate-fade-in-up ring-1 ring-black/5">
      {/* 헤더: 질문/제목 + 진행 상황 + 닫기 */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 pr-4">
          <h4 className="text-sm font-semibold text-gray-900 leading-relaxed">
            {headerTitle}
          </h4>
          {headerDescription && (
            <p className="text-xs text-gray-500 mt-1">{headerDescription}</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isPptSetup ? (
            renderProgressIndicator()
          ) : (
            totalQuestions > 1 && (
              <span className="text-xs text-gray-400 font-medium">
                {totalQuestions}개 중 {currentQuestion}개
              </span>
            )
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
