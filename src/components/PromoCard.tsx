
import React from 'react';

const PromoCard: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-2xl bg-[#1A1A1A] border border-gray-800 rounded-2xl p-6 flex items-center justify-between overflow-hidden relative group cursor-pointer hover:border-gray-700 transition-all">
        <div className="flex-1 pr-4">
          <h3 className="text-xl font-bold text-white mb-2">풀스택 웹 앱 구축</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            첫 번째 AI-네이티브 웹 애플리케이션을 구축하고 1조 LLM 토큰을 받으세요
          </p>
        </div>
        <div className="w-48 h-28 bg-[#252525] rounded-xl overflow-hidden border border-gray-800 shrink-0">
          <img 
            src="https://picsum.photos/400/200?random=1" 
            alt="Promotion" 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
      
      {/* 슬라이더 인디케이터 */}
      <div className="flex gap-2 mt-6">
        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
      </div>
    </div>
  );
};

export default PromoCard;
