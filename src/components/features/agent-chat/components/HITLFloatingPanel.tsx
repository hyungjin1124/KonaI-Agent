import React from 'react';
import { Pencil, X, Check, ChevronDown, Wand2, Calendar, Database, BarChart3, TrendingUp } from 'lucide-react';
import { HitlOption, ToolType, DataValidationSummary } from '../types';
import { PPTConfig } from '../../../../types';
import {
  PPT_THEME_OPTIONS,
  PPT_FONT_OPTIONS,
  PPT_TOPIC_OPTIONS,
} from './ToolCall/constants';

// 분석 범위 확인 데이터 타입
export interface AnalysisScopeData {
  period: string;
  comparisonPeriod: string;
  analysisScope: string[];
  dataSources: string[];
}

// 데이터 검증 데이터 타입
export interface DataVerificationData {
  keyMetrics: Array<{ label: string; value: string; change: string }>;
  dataAsOf: string;
  sources: string[];
}

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
  // data_validation용 (PPT 시나리오)
  validationData?: DataValidationSummary;
  // ppt_setup용
  pptConfig?: PPTConfig;
  onPptConfigUpdate?: <K extends keyof PPTConfig>(key: K, value: PPTConfig[K]) => void;
  onPptSetupComplete?: () => void;
  // theme_font_select용
  onThemeFontComplete?: () => void;
  // 매출 분석 시나리오 HITL용
  analysisScopeData?: AnalysisScopeData;
  dataVerificationData?: DataVerificationData;
}

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
  onThemeFontComplete,
  analysisScopeData,
  dataVerificationData,
}) => {
  if (!isVisible) return null;

  // 콘텐츠 설정 (토픽 + 슬라이드 수)
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

  // PPT 콘텐츠 설정 UI 렌더링 (단일 단계로 단순화)
  const renderPptSetupContent = () => {
    if (!pptConfig || !onPptConfigUpdate || !onPptSetupComplete) return null;

    return (
      <div className="space-y-4">
        {renderContentStep()}

        {/* 설정 완료 버튼 */}
        <button
          onClick={onPptSetupComplete}
          className="w-full py-3.5 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <Wand2 size={18} />
          설정 완료
        </button>
      </div>
    );
  };

  // 테마/폰트 선택 UI 렌더링 (NEW)
  const renderThemeFontContent = () => {
    if (!pptConfig || !onPptConfigUpdate || !onThemeFontComplete) return null;

    return (
      <div className="space-y-5">
        {/* 테마 선택 */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">테마</label>
          <div className="grid grid-cols-3 gap-2">
            {PPT_THEME_OPTIONS.map((theme) => (
              <button
                key={theme}
                onClick={() => onPptConfigUpdate?.('theme', theme)}
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

        {/* 적용 버튼 */}
        <button
          onClick={onThemeFontComplete}
          className="w-full py-3.5 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
        >
          적용하기
        </button>
      </div>
    );
  };

  // 데이터 검증 UI 렌더링 (PPT 시나리오용)
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

  // 분석 범위 확인 UI 렌더링 (매출 분석 시나리오용)
  const renderAnalysisScopeContent = () => {
    if (!analysisScopeData) return null;

    return (
      <div className="space-y-4">
        {/* 분석 범위 정보 박스 */}
        <div className="p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl shadow-sm space-y-3">
          {/* 분석 기간 */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <Calendar size={16} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <span className="text-xs text-gray-500 font-medium">분석 기간</span>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{analysisScopeData.period}</p>
              <p className="text-xs text-gray-500 mt-0.5">비교: {analysisScopeData.comparisonPeriod}</p>
            </div>
          </div>

          {/* 분석 범위 */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
              <BarChart3 size={16} className="text-green-600" />
            </div>
            <div className="flex-1">
              <span className="text-xs text-gray-500 font-medium">분석 범위</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {analysisScopeData.analysisScope.map((scope, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                    {scope}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 데이터 소스 */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
              <Database size={16} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <span className="text-xs text-gray-500 font-medium">데이터 소스</span>
              <p className="text-sm text-gray-700 mt-0.5">{analysisScopeData.dataSources.join(', ')}</p>
            </div>
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
            onClick={() => onSelect('modify_period')}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            기간 변경
          </button>
          <button
            onClick={() => onSelect('modify_scope')}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            범위 조정
          </button>
        </div>
      </div>
    );
  };

  // 데이터 검증 UI 렌더링 (매출 분석 시나리오용)
  const renderDataVerificationContent = () => {
    if (!dataVerificationData) return null;

    return (
      <div className="space-y-4">
        {/* 주요 지표 박스 */}
        <div className="p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            {dataVerificationData.keyMetrics.map((metric, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-xs text-gray-500 font-medium">{metric.label}</span>
                <div className="flex items-baseline gap-2">
                  <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                  <span className={`text-xs font-medium ${
                    metric.change.startsWith('+') ? 'text-green-600' : metric.change.startsWith('-') ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {metric.change.startsWith('+') && <TrendingUp size={10} className="inline mr-0.5" />}
                    {metric.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-0.5">
            <p>데이터 기준일: {dataVerificationData.dataAsOf}</p>
            <p>출처: {dataVerificationData.sources.join(', ')}</p>
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
    if (toolType === 'theme_font_select' && pptConfig && onPptConfigUpdate) {
      return renderThemeFontContent();
    }
    if (toolType === 'data_validation' && validationData) {
      return renderValidationContent();
    }
    // 매출 분석 시나리오 HITL
    if (toolType === 'analysis_scope_confirm' && analysisScopeData) {
      return renderAnalysisScopeContent();
    }
    if (toolType === 'data_verification' && dataVerificationData) {
      return renderDataVerificationContent();
    }
    return renderDefaultOptions();
  };

  // 헤더 정보 (ppt_setup과 theme_font_select는 question 사용)
  const headerTitle = question;
  const headerDescription: string | null = null;

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
