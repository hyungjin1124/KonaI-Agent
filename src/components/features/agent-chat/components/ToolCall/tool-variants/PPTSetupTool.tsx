import React from 'react';
import { Check, ChevronDown, Wand2 } from 'lucide-react';
import type { PPTSetupToolProps } from '../types';

/**
 * PPT 세부 설정 도구 (HITL)
 * - 테마, 톤앤매너, 주요 내용, 폰트, 슬라이드 수 설정
 * - 기존 PPTSetupResponse 로직을 ToolCall 위젯 형태로 통합
 */
const PPTSetupTool: React.FC<PPTSetupToolProps> = ({
  status,
  config,
  onConfigUpdate,
  onComplete,
}) => {
  const isDisabled = status === 'completed';

  // 토픽 토글
  const toggleTopic = (topic: string) => {
    const exists = config.topics.includes(topic);
    if (exists) {
      onConfigUpdate('topics', config.topics.filter(t => t !== topic));
    } else {
      onConfigUpdate('topics', [...config.topics, topic]);
    }
  };

  return (
    <div className="space-y-5">
      {/* Theme */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          디자인 테마
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['Corporate Blue', 'Modern Dark', 'Nature Green'] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => !isDisabled && onConfigUpdate('theme', theme)}
              disabled={isDisabled}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                config.theme === theme
                  ? 'border-[#FF3C42] bg-red-50 text-[#FF3C42]'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              } ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      {/* Tone */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          톤앤매너
        </label>
        <div className="flex gap-4">
          {(['Data-driven', 'Formal', 'Storytelling'] as const).map((tone) => (
            <label key={tone} className="flex items-center gap-2 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  config.tone === tone ? 'border-[#FF3C42]' : 'border-gray-300'
                }`}
              >
                {config.tone === tone && (
                  <div className="w-2 h-2 rounded-full bg-[#FF3C42]" />
                )}
              </div>
              <span
                className={`text-sm ${
                  config.tone === tone
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-500 group-hover:text-gray-700'
                }`}
              >
                {tone}
              </span>
              <input
                type="radio"
                className="hidden"
                checked={config.tone === tone}
                onChange={() => !isDisabled && onConfigUpdate('tone', tone)}
                disabled={isDisabled}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Topics */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          포함할 주요 내용
        </label>
        <div className="space-y-1.5">
          {[
            'Executive Summary',
            'Q4 Revenue Overview',
            'YoY Comparison',
            'Regional Performance',
            'Future Outlook',
          ].map((topic) => (
            <div
              key={topic}
              onClick={() => !isDisabled && toggleTopic(topic)}
              className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                config.topics.includes(topic)
                  ? 'bg-blue-50 border-blue-200'
                  : 'border-transparent hover:bg-gray-50'
              } ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center ${
                  config.topics.includes(topic)
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {config.topics.includes(topic) && <Check size={10} />}
              </div>
              <span className="text-sm text-gray-700">{topic}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Count & Font */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            폰트 스타일
          </label>
          <div className="relative">
            <select
              value={config.titleFont}
              onChange={(e) => !isDisabled && onConfigUpdate('titleFont', e.target.value)}
              disabled={isDisabled}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#FF3C42]"
            >
              <option value="Pretendard">Pretendard</option>
              <option value="Noto Sans KR">Noto Sans KR</option>
              <option value="Montserrat">Montserrat</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            슬라이드 수
          </label>
          <input
            type="number"
            value={config.slideCount}
            onChange={(e) => !isDisabled && onConfigUpdate('slideCount', e.target.value === '' ? 0 : parseInt(e.target.value))}
            disabled={isDisabled}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#FF3C42]"
            min={5}
            max={50}
          />
        </div>
      </div>

      {/* Action Button */}
      {status === 'awaiting-input' && (
        <button
          onClick={onComplete}
          className="w-full py-3 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform active:scale-[0.99]"
        >
          <Wand2 size={16} />
          설정 완료 및 생성 (Generate)
        </button>
      )}

      {status === 'completed' && (
        <div className="py-2 text-center text-sm text-green-600 font-medium">
          ✓ PPT 설정이 완료되었습니다
        </div>
      )}
    </div>
  );
};

export default React.memo(PPTSetupTool);
