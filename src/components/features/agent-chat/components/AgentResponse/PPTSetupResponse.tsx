import React from 'react';
import { Check, ChevronDown, Wand2 } from '../../../../icons';
import { PPTConfig } from '../../../../../types';

interface PPTSetupResponseProps {
  config: PPTConfig;
  onUpdateConfig: <K extends keyof PPTConfig>(key: K, value: PPTConfig[K]) => void;
  onToggleTopic: (topic: string) => void;
  onGenerateStart: () => void;
}

export const PPTSetupResponse: React.FC<PPTSetupResponseProps> = ({
  config,
  onUpdateConfig,
  onToggleTopic,
  onGenerateStart,
}) => {
  return (
    <div className="flex gap-4 mb-2 animate-fade-in-up">
      <div className="w-8 h-8 rounded bg-[#FF3C42] flex items-center justify-center shrink-0 mt-1 shadow-sm">
        <span className="text-white font-bold text-xs">K</span>
      </div>
      <div className="flex-1 space-y-4">
        <div className="prose prose-sm">
          <p className="text-gray-900 font-medium">
            Q4 2025 경영 실적 보고서 PPT 생성을 요청하셨군요. 세부 설정을 확인해주세요.
          </p>
        </div>

        {/* Configuration Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-6">
          {/* Theme */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              디자인 테마
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Corporate Blue', 'Modern Dark', 'Nature Green'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => onUpdateConfig('theme', theme)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                    config.theme === theme
                      ? 'border-[#FF3C42] bg-red-50 text-[#FF3C42]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
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
                    onChange={() => onUpdateConfig('tone', tone)}
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
                  onClick={() => onToggleTopic(topic)}
                  className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                    config.topics.includes(topic)
                      ? 'bg-blue-50 border-blue-200'
                      : 'border-transparent hover:bg-gray-50'
                  }`}
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
                  onChange={(e) => onUpdateConfig('titleFont', e.target.value)}
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
                onChange={(e) => onUpdateConfig('slideCount', e.target.value === '' ? '' : parseInt(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#FF3C42]"
                min={5}
                max={50}
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onGenerateStart}
            className="w-full py-3 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform active:scale-[0.99]"
          >
            <Wand2 size={16} />
            설정 완료 및 생성 (Generate)
          </button>
        </div>

        <p className="text-xs text-gray-400">
          * 우측 패널에서 실시간 미리보기를 확인할 수 있습니다.
        </p>
      </div>
    </div>
  );
};

export default PPTSetupResponse;
