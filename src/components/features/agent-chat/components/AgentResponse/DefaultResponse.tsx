import React from 'react';

interface DefaultResponseProps {
  dashboardType: 'financial' | 'did' | 'ppt';
}

export const DefaultResponse: React.FC<DefaultResponseProps> = ({ dashboardType }) => {
  return (
    <div className="flex gap-4 mb-2 animate-fade-in-up">
      <div className="w-8 h-8 rounded bg-[#FF3C42] flex items-center justify-center shrink-0 mt-1 shadow-sm">
        <span className="text-white font-bold text-xs">K</span>
      </div>
      <div className="flex-1 space-y-6">
        <div className="prose prose-sm">
          <h3 className="text-lg font-bold text-black mb-2">
            {dashboardType === 'did' ? 'DID 사업부 분석 리포트' : '데이터 분석 결과 리포트'}
          </h3>
          <p className="text-gray-700 leading-relaxed text-sm mb-4">
            {dashboardType === 'did'
              ? '요청하신 DID 사업부의 매출 구성, 원가율 추이 및 주요 칩셋 판매량을 분석했습니다. 글로벌 시장 비중 확대와 원가 절감 노력이 가시적인 성과를 보이고 있습니다.'
              : '요청하신 코나아이 ERP 2025년 데이터를 기반으로 월별 매출, 사업부 구성, 주요 거래처 현황을 시각화했습니다. 데이터 분석 결과, 전반적인 성장세가 확인됩니다.'}
          </p>
        </div>

        {/* Analysis Highlights Cards */}
        <div className="space-y-3">
          {dashboardType === 'did' ? (
            <>
              <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 hover:border-orange-200 transition-colors">
                <h4 className="font-bold text-orange-900 text-sm mb-1 flex items-center gap-2">
                  <span className="text-lg">🌍</span> 글로벌 매출 비중 확대
                </h4>
                <p className="text-orange-800 text-xs leading-relaxed pl-7">
                  해외 매출 비중이 전분기 대비 <strong>대폭 증가하여 66%</strong>를 달성했습니다.
                  이는 DID 기술의 해외 수출 계약 건수 증가에 기인합니다.
                </p>
              </div>
              <div className="p-4 bg-green-50/50 rounded-xl border border-green-100 hover:border-green-200 transition-colors">
                <h4 className="font-bold text-green-900 text-sm mb-1 flex items-center gap-2">
                  <span className="text-lg">📉</span> 원가율 1.7%p 개선
                </h4>
                <p className="text-green-800 text-xs leading-relaxed pl-7">
                  메탈 카드 공정 자동화 도입으로 원가율이 <strong>13.5%</strong>까지 낮아졌으며,
                  이는 사업부 수익성 개선의 핵심 요인입니다.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Card 1: Seasonality */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 hover:border-blue-200 transition-colors">
                <h4 className="font-bold text-blue-900 text-sm mb-1 flex items-center gap-2">
                  <span className="text-lg">📈</span> 연말 매출 급증 (Seasonality)
                </h4>
                <p className="text-blue-800 text-xs leading-relaxed pl-7">
                  11월부터 매출이 가파르게 상승하여{' '}
                  <strong>12월에 연중 최고치(151억 원)</strong>를 기록했습니다. 이는 연말 프로모션
                  효과와 IT 예산 집행이 4분기에 집중된 결과로 해석됩니다.
                </p>
              </div>

              {/* Card 2: Business Focus */}
              <div className="p-4 bg-[#FFF8F6] rounded-xl border border-stone-200 hover:border-stone-300 transition-colors">
                <h4 className="font-bold text-stone-900 text-sm mb-1 flex items-center gap-2">
                  <span className="text-lg">💼</span> 핵심 사업부 집중도 심화
                </h4>
                <p className="text-stone-700 text-xs leading-relaxed pl-7">
                  <strong>플랫폼(38%)</strong>과 <strong>핀테크(27%)</strong> 사업부가 전체
                  매출의 과반(65%)을 차지하며 회사의 캐시카우 역할을 하고 있습니다. 신사업인 B2B
                  솔루션도 10% 비중으로 안착했습니다.
                </p>
              </div>

              {/* Card 3: Dependency */}
              <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 hover:border-orange-200 transition-colors">
                <h4 className="font-bold text-orange-900 text-sm mb-1 flex items-center gap-2">
                  <span className="text-lg">⚠️</span> 상위 거래처 의존도
                </h4>
                <p className="text-orange-800 text-xs leading-relaxed pl-7">
                  상위 3개 거래처(Top 3)가 전체 매출의 <strong>약 31%</strong>를 점유하고
                  있습니다. 리스크 분산을 위해 중소형 클라이언트 확대 전략이 필요합니다.
                </p>
              </div>

              {/* Card 4: YoY Growth */}
              <div className="p-4 bg-green-50/50 rounded-xl border border-green-100 hover:border-green-200 transition-colors">
                <h4 className="font-bold text-green-900 text-sm mb-1 flex items-center gap-2">
                  <span className="text-lg">🚀</span> 지속적인 YoY 성장
                </h4>
                <p className="text-green-800 text-xs leading-relaxed pl-7">
                  전월 대비 변동성은 존재하나, 전년 동기(YoY) 대비로는 꾸준한 우상향 추세를
                  유지하고 있어 2025년 목표 달성이 긍정적입니다.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            우측 패널에서 상세 차트와 원본 데이터를 확인하실 수 있습니다. 추가 분석이 필요하면
            말씀해 주세요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DefaultResponse;
