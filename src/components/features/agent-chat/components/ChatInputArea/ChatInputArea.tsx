import React, { RefObject } from 'react';
import { Plus, Mic, ArrowUp } from '../../../../icons';
import { HITLFloatingPanel } from '../HITLFloatingPanel';
import { DEFAULT_VALIDATION_DATA } from '../../scenarios/pptScenario';
import { PPTConfig, HitlOption } from '../../../../../types';
import { ActiveHitl } from '../PPTScenarioRenderer';
import { DataValidationSummary } from '../../types';

/**
 * 추천 프롬프트 칩 설정
 */
interface SuggestionChip {
  label: string;
  prompt: string;
}

/**
 * ChatInputArea Props
 */
interface ChatInputAreaProps {
  // 입력 상태
  inputValue: string;
  setInputValue: (value: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement>;
  onSend: (text: string) => void;

  // HITL 상태
  activeHitl: ActiveHitl | null;
  hitlResumeCallback: ((stepId: string, selectedOption: string) => void) | null;
  onHitlClose: () => void;

  // PPT 설정 (HITL용)
  pptConfig?: PPTConfig;
  updatePptConfig?: <K extends keyof PPTConfig>(key: K, value: PPTConfig[K]) => void;
  onGenerateStart?: () => void;
  onThemeFontComplete?: () => void;

  // 시나리오 완료 상태 (추천 칩 표시용)
  pptStatus: 'idle' | 'setup' | 'generating' | 'done';
  salesAnalysisComplete: boolean;
}

/**
 * ChatInputArea 컴포넌트
 *
 * 대시보드 뷰에서 사용되는 채팅 입력 영역
 * - HITL 플로팅 패널
 * - 추천 프롬프트 칩
 * - 텍스트 입력창
 */
export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  inputValue,
  setInputValue,
  textareaRef,
  onSend,
  activeHitl,
  hitlResumeCallback,
  onHitlClose,
  pptConfig,
  updatePptConfig,
  onGenerateStart,
  onThemeFontComplete,
  pptStatus,
  salesAnalysisComplete,
}) => {
  // PPT 완료 후 추천 칩
  const pptDoneChips: SuggestionChip[] = [
    { label: '이 데이터로 매출 심층 분석해줘', prompt: '이 데이터로 매출 심층 분석해줘' },
    { label: '원가율 추이 분석해줘', prompt: '원가율 추이 분석해줘' },
  ];

  // 매출 분석 완료 후 추천 칩
  const salesAnalysisChips: SuggestionChip[] = [
    { label: '이 분석 결과로 PPT 만들어줘', prompt: '이 분석 결과로 PPT 만들어줘' },
    { label: '경영진 보고서 생성해줘', prompt: '경영진 보고서 생성해줘' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        onSend(inputValue);
      }
    }
  };

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSend(inputValue);
    }
  };

  return (
    <div className="p-4 pb-6 bg-white border-t border-gray-100 flex flex-col items-center">
      {/* HITL 플로팅 패널 - 입력창 위에 표시 */}
      {activeHitl && hitlResumeCallback && (
        <div className="w-full max-w-3xl">
          <HITLFloatingPanel
            isVisible={true}
            question={activeHitl.question}
            options={activeHitl.options}
            onSelect={(optionId) => hitlResumeCallback(activeHitl.stepId, optionId)}
            onSkip={() => hitlResumeCallback(activeHitl.stepId, 'skip')}
            onClose={onHitlClose}
            toolType={activeHitl.toolType}
            // data_validation용 (PPT 시나리오)
            validationData={activeHitl.toolType === 'data_validation' ? DEFAULT_VALIDATION_DATA : undefined}
            // ppt_setup 및 theme_font_select용
            pptConfig={(activeHitl.toolType === 'ppt_setup' || activeHitl.toolType === 'theme_font_select') ? pptConfig : undefined}
            onPptConfigUpdate={(activeHitl.toolType === 'ppt_setup' || activeHitl.toolType === 'theme_font_select') ? updatePptConfig : undefined}
            onPptSetupComplete={activeHitl.toolType === 'ppt_setup' && hitlResumeCallback ? () => {
              hitlResumeCallback(activeHitl.stepId, 'complete');
              // onGenerateStart는 theme_font_select 완료 시에만 호출
            } : undefined}
            // 테마/폰트 선택용 - 완료 시 PPT 생성 시작
            onThemeFontComplete={activeHitl.toolType === 'theme_font_select' && onThemeFontComplete ? () => {
              onThemeFontComplete();
              onGenerateStart?.();
            } : undefined}
            // 매출 분석 시나리오 HITL용
            analysisScopeData={activeHitl.analysisScopeData}
            dataVerificationData={activeHitl.dataVerificationData}
          />
        </div>
      )}

      <div className="w-full max-w-3xl">
        {/* 추천 프롬프트 칩 - 시나리오 완료 상태에 따라 표시 */}
        {(pptStatus === 'done' || salesAnalysisComplete) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {pptStatus === 'done' && pptDoneChips.map((chip, idx) => (
              <button
                key={`ppt-${idx}`}
                onClick={() => onSend(chip.prompt)}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 bg-white hover:border-[#FF3C42] hover:text-[#FF3C42] transition-colors"
              >
                {chip.label}
              </button>
            ))}
            {salesAnalysisComplete && salesAnalysisChips.map((chip, idx) => (
              <button
                key={`sales-${idx}`}
                onClick={() => onSend(chip.prompt)}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 bg-white hover:border-[#FF3C42] hover:text-[#FF3C42] transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* 입력창 */}
        <div className="relative bg-[#F3F4F6] rounded-xl border border-transparent focus-within:border-[#FF3C42] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#FF3C42] transition-all p-2 flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-[#FF3C42] transition-colors">
            <Plus size={20} />
          </button>
          <textarea
            ref={textareaRef}
            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-[#000000] placeholder-gray-400 resize-none h-10 py-2 text-sm max-h-32 overflow-y-auto custom-scrollbar"
            placeholder="추가 요청이나 질문을 입력하세요..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="p-2 text-gray-400 hover:text-[#FF3C42] transition-colors">
            <Mic size={20} />
          </button>
          <button
            className={`p-2 rounded-lg transition-all ${inputValue.trim() ? 'bg-[#FF3C42] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            disabled={!inputValue.trim()}
            onClick={handleSubmit}
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInputArea;
