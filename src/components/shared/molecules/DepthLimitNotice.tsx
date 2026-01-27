import React, { memo } from 'react';
import { AlertCircle, ExternalLink } from '../../icons';

interface DepthLimitNoticeProps {
  onRedirect: () => void;
}

export const DepthLimitNotice = memo<DepthLimitNoticeProps>(({ onRedirect }) => (
  <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
    <AlertCircle size={24} className="text-gray-400 mb-2" />
    <h4 className="text-xs font-bold text-gray-700 mb-1">상세 데이터 분석 한계 도달</h4>
    <p className="text-[10px] text-gray-500 mb-3">
      현재 보고서의 심도는 3단계까지입니다.
      <br />
      원천 데이터 및 트랜잭션 단위 분석은 ERP를 활용하세요.
    </p>
    <button
      onClick={onRedirect}
      className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-[10px] font-bold rounded-lg hover:bg-gray-800 transition-all"
    >
      Kona ERP 시스템 바로가기 <ExternalLink size={10} />
    </button>
  </div>
));

DepthLimitNotice.displayName = 'DepthLimitNotice';

export default DepthLimitNotice;
