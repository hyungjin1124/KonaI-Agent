import React from 'react';
import { ArrowRight, RotateCcw } from '../../../../icons';

interface AnomalyResponseProps {
  agentMessage: string;
}

export const AnomalyResponse: React.FC<AnomalyResponseProps> = ({ agentMessage }) => {
  return (
    <div className="flex gap-4 mb-2 animate-fade-in-up">
      <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center shrink-0 mt-1 shadow-sm animate-pulse">
        <span className="text-white font-bold text-xs">!</span>
      </div>
      <div className="flex-1 space-y-6">
        <div className="prose prose-sm max-w-none text-gray-800">
          <h3 className="text-lg font-bold text-red-600 mb-3 border-b border-red-100 pb-2 flex items-center gap-2">
            [Urgent] 공정 원가율 이상 급등 감지
          </h3>

          <div className="bg-red-50 border border-red-100 p-4 rounded-xl mb-4">
            <p className="font-medium text-red-900 leading-relaxed">
              {agentMessage.split('**').map((part: string, i: number) =>
                i % 2 === 1 ? (
                  <strong key={i} className="bg-red-200/50 px-1 rounded">
                    {part}
                  </strong>
                ) : (
                  part
                )
              )}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">원인 분석 (Root Cause Analysis)</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>
                <strong>13:00~14:00 구간</strong> 자동화 설비 3호기 센서 오작동으로 인한 수율 저하
                발생
              </li>
              <li>긴급 투입된 수동 검수 인력 비용이 실시간 노무비에 반영됨</li>
            </ul>
          </div>

          <div className="pt-2">
            <h4 className="font-bold text-gray-900 mb-2">권장 조치 (Action Items)</h4>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-xl bg-black text-white hover:bg-gray-800 transition-all text-sm flex items-center justify-between group shadow-md">
                <span className="font-bold">
                  현장 책임자(김철수 부장) 즉시 호출 및 설비 점검 지시
                </span>
                <ArrowRight size={16} />
              </button>
              <button className="w-full text-left p-3 rounded-xl border bg-white border-gray-200 hover:border-red-500 hover:text-red-600 transition-all text-sm flex items-center justify-between group">
                <span>3호기 가동 중단 및 예비 4호기 대체 투입 시뮬레이션</span>
                <RotateCcw size={16} className="text-gray-400 group-hover:text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnomalyResponse;
