import React from 'react';
import { CheckCircle2, Users, FileText } from '../../../../icons';

interface MultiAgentDoneResponseProps {
  onRequestPPT?: () => void;
}

export const MultiAgentDoneResponse: React.FC<MultiAgentDoneResponseProps> = ({
  onRequestPPT,
}) => {
  return (
    <div className="flex gap-4 mb-2 animate-fade-in-up">
      <div className="w-8 h-8 rounded bg-[#FF3C42] flex items-center justify-center shrink-0 mt-1 shadow-sm">
        <span className="text-white font-bold text-xs">K</span>
      </div>
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={18} className="text-green-600" />
          <h3 className="text-lg font-bold text-black">
            멀티 에이전트 협업 완료
          </h3>
        </div>

        <p className="text-gray-700 text-sm leading-relaxed">
          4개 전문 에이전트(데이터 수집, 분석, 시각화, 보고서 작성)가 병렬로 작업을 완료했습니다.
        </p>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users size={14} />
            4 에이전트
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={14} className="text-green-500" />
            완료
          </span>
        </div>

        {onRequestPPT && (
          <div className="pt-2">
            <button
              onClick={onRequestPPT}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border bg-[#FF3C42]/10 border-[#FF3C42]/30 hover:border-[#FF3C42] hover:bg-white hover:text-[#FF3C42] transition-colors text-sm font-medium"
            >
              <FileText size={16} />
              <span>분석 결과 PPT 생성</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiAgentDoneResponse;
