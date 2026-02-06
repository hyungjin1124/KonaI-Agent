import React from 'react';
import type { ToolStatus } from '../../../types';
import StreamingText from '../../../../../shared/StreamingText';

/**
 * Sales Analysis Tool Renderers
 * 매출 분석 시나리오 전용 도구 렌더러 (13개)
 */

export interface SalesToolRendererProps {
  status: ToolStatus;
  streamingEnabled: boolean;
}

// 1. 요청 분석
const RequestAnalysisRenderer: React.FC<SalesToolRendererProps> = ({ streamingEnabled }) => {
  const subtools = [
    { label: '키워드 추출', result: '"12월", "경영 실적", "분석"' },
    { label: '분석 범위 파악', result: '재무 실적, 사업부별 성과, 운영 KPI' },
    { label: '작업 계획 수립', result: '5단계 분석 프로세스 구성 완료' },
  ];

  return (
    <div className="space-y-2">
      {subtools.map((subtool, idx) => (
        <div key={idx} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500">✓</span>
            <StreamingText
              content={subtool.label}
              as="span"
              className="font-medium text-gray-800"
              typingSpeed={30}
              startDelay={idx * 400}
              showCursor={false}
              enabled={streamingEnabled}
            />
          </div>
          <StreamingText
            content={subtool.result}
            as="p"
            className="text-xs text-gray-500 ml-5 mt-1"
            typingSpeed={25}
            startDelay={idx * 400 + 200}
            showCursor={false}
            enabled={streamingEnabled}
          />
        </div>
      ))}
    </div>
  );
};

// 2. 분석 범위 확인 (HITL)
const AnalysisScopeConfirmRenderer: React.FC<SalesToolRendererProps> = ({ status }) => (
  <div className="text-sm text-gray-500">
    {status === 'completed'
      ? '분석 범위가 확정되었습니다.'
      : '분석 범위 확인 대기 중...'}
  </div>
);

// 3. 데이터 소스 연결
const DataSourceConnectRenderer: React.FC<SalesToolRendererProps> = ({ streamingEnabled }) => {
  const connections = [
    { label: 'ERP 시스템 연결', source: '영림원 ERP', desc: '재무/회계 데이터 소스 연결 완료' },
    { label: 'MES 시스템 연결', source: 'E2MAX MES', desc: '생산/물류 데이터 소스 연결 완료' },
    { label: 'CRM/Portal 연결', source: 'Platform Portal', desc: '고객/매출 데이터 소스 연결 완료' },
  ];

  return (
    <div className="space-y-2">
      {connections.map((conn, idx) => (
        <div key={idx} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <StreamingText
                content={conn.label}
                as="span"
                className="font-medium text-gray-800"
                typingSpeed={30}
                startDelay={idx * 500}
                showCursor={false}
                enabled={streamingEnabled}
              />
            </div>
            <StreamingText
              content={conn.source}
              as="span"
              className="text-xs text-gray-400"
              typingSpeed={25}
              startDelay={idx * 500 + 150}
              showCursor={false}
              enabled={streamingEnabled}
            />
          </div>
          <StreamingText
            content={conn.desc}
            as="p"
            className="text-xs text-gray-500 ml-5 mt-1"
            typingSpeed={25}
            startDelay={idx * 500 + 300}
            showCursor={false}
            enabled={streamingEnabled}
          />
        </div>
      ))}
    </div>
  );
};

// 4. 재무 데이터 수집
const FinancialDataCollectionRenderer: React.FC<SalesToolRendererProps> = ({ streamingEnabled }) => {
  const dataItems = [
    { label: '손익계산서 조회', metrics: '매출액 420억 | 영업이익 63억 | 순이익 48억' },
    { label: '재무상태표 조회', metrics: '총자산 1,250억 | 부채비율 42% | 유동비율 180%' },
    { label: '현금흐름표 조회', metrics: '영업CF +52억 | 투자CF -18억 | 재무CF -12억' },
  ];

  return (
    <div className="space-y-2">
      {dataItems.map((item, idx) => (
        <div key={idx} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500">✓</span>
            <StreamingText
              content={item.label}
              as="span"
              className="font-medium text-gray-800"
              typingSpeed={30}
              startDelay={idx * 450}
              showCursor={false}
              enabled={streamingEnabled}
            />
          </div>
          <StreamingText
            content={item.metrics}
            as="p"
            className="text-xs text-gray-500 ml-5 mt-1"
            typingSpeed={20}
            startDelay={idx * 450 + 200}
            showCursor={false}
            enabled={streamingEnabled}
          />
        </div>
      ))}
    </div>
  );
};

// 5. 사업부별 실적 수집
const DivisionDataCollectionRenderer: React.FC<SalesToolRendererProps> = ({ streamingEnabled }) => {
  const divisions = [
    { label: '플랫폼사업부', change: '전월비 +18%', metrics: '매출 252억 | 영업이익 45억' },
    { label: '솔루션사업부', change: '전월비 +8%', metrics: '매출 105억 | 영업이익 12억' },
    { label: '컨설팅사업부', change: '전월비 +5%', metrics: '매출 63억 | 영업이익 6억' },
  ];

  return (
    <div className="space-y-2">
      {divisions.map((div, idx) => (
        <div key={idx} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <StreamingText
                content={div.label}
                as="span"
                className="font-medium text-gray-800"
                typingSpeed={30}
                startDelay={idx * 450}
                showCursor={false}
                enabled={streamingEnabled}
              />
            </div>
            <StreamingText
              content={div.change}
              as="span"
              className="text-xs text-green-600"
              typingSpeed={25}
              startDelay={idx * 450 + 150}
              showCursor={false}
              enabled={streamingEnabled}
            />
          </div>
          <StreamingText
            content={div.metrics}
            as="p"
            className="text-xs text-gray-500 ml-5 mt-1"
            typingSpeed={20}
            startDelay={idx * 450 + 300}
            showCursor={false}
            enabled={streamingEnabled}
          />
        </div>
      ))}
    </div>
  );
};

// 6. 운영 지표 수집
const OperationDataCollectionRenderer: React.FC<SalesToolRendererProps> = ({ streamingEnabled }) => {
  const operations = [
    { label: '생산/물류 KPI', source: 'E2MAX MES', metrics: '생산완료율 98.2% | OTD 96.5% | 불량률 0.8%' },
    { label: '고객/매출 지표', source: 'Platform Portal', metrics: '총 고객 847 | 신규 52 | 유지율 94.2%' },
  ];

  return (
    <div className="space-y-2">
      {operations.map((op, idx) => (
        <div key={idx} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <StreamingText
                content={op.label}
                as="span"
                className="font-medium text-gray-800"
                typingSpeed={30}
                startDelay={idx * 500}
                showCursor={false}
                enabled={streamingEnabled}
              />
            </div>
            <StreamingText
              content={op.source}
              as="span"
              className="text-xs text-gray-400"
              typingSpeed={25}
              startDelay={idx * 500 + 150}
              showCursor={false}
              enabled={streamingEnabled}
            />
          </div>
          <StreamingText
            content={op.metrics}
            as="p"
            className="text-xs text-gray-500 ml-5 mt-1"
            typingSpeed={20}
            startDelay={idx * 500 + 300}
            showCursor={false}
            enabled={streamingEnabled}
          />
        </div>
      ))}
    </div>
  );
};

// 7. 매출 동인 분석
const RevenueDriverAnalysisRenderer: React.FC<SalesToolRendererProps> = ({ streamingEnabled }) => {
  const drivers = [
    { label: '가격 효과 분석', finding: '고부가 제품 비중 확대로 ASP +8% 상승' },
    { label: '물량 효과 분석', finding: '주요 고객사 수주 확대로 물량 +5% 증가' },
    { label: '제품 믹스 분석', finding: '메탈 카드 비중 12% → 18% 확대' },
  ];

  return (
    <div className="space-y-2">
      {drivers.map((driver, idx) => (
        <div key={idx} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500">✓</span>
            <StreamingText
              content={driver.label}
              as="span"
              className="font-medium text-gray-800"
              typingSpeed={30}
              startDelay={idx * 450}
              showCursor={false}
              enabled={streamingEnabled}
            />
          </div>
          <StreamingText
            content={`→ ${driver.finding}`}
            as="p"
            className="text-xs text-gray-600 ml-5 mt-1"
            typingSpeed={20}
            startDelay={idx * 450 + 200}
            showCursor={false}
            enabled={streamingEnabled}
          />
        </div>
      ))}
    </div>
  );
};

// 8. 수익성 분석
const ProfitabilityAnalysisRenderer: React.FC<SalesToolRendererProps> = ({ streamingEnabled }) => {
  const analyses = [
    { label: '원가 구조 분석', finding: '원가율 68% → 62%로 6%p 개선' },
    { label: '마진율 추이 분석', finding: '영업이익률 18.2% (전월비 +2.1%p)' },
    { label: '비용 효율성 분석', finding: '자동화로 단위당 노무비 15% 절감' },
  ];

  return (
    <div className="space-y-2">
      {analyses.map((analysis, idx) => (
        <div key={idx} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500">✓</span>
            <StreamingText
              content={analysis.label}
              as="span"
              className="font-medium text-gray-800"
              typingSpeed={30}
              startDelay={idx * 450}
              showCursor={false}
              enabled={streamingEnabled}
            />
          </div>
          <StreamingText
            content={`→ ${analysis.finding}`}
            as="p"
            className="text-xs text-gray-600 ml-5 mt-1"
            typingSpeed={20}
            startDelay={idx * 450 + 200}
            showCursor={false}
            enabled={streamingEnabled}
          />
        </div>
      ))}
    </div>
  );
};

// 9. 이상 징후 탐지
const AnomalyDetectionRenderer: React.FC<SalesToolRendererProps> = ({ streamingEnabled }) => {
  const anomalies: Array<{
    label: string;
    findings?: Array<{ type: 'positive' | 'warning'; text: string }>;
    finding?: string;
    type?: 'warning';
  }> = [
    {
      label: '전월/전년 대비 이상치',
      findings: [
        { type: 'positive', text: '매출 +13.5% (전월비) - 연중 최고치' },
        { type: 'warning', text: '재고 회전일 증가 (32일 → 38일)' },
      ],
    },
    { label: '계절성 패턴 분석', finding: '12월 계절적 성수기 효과 반영됨' },
    { label: '리스크 요인 식별', finding: '환율 상승에 따른 수입 원자재 비용 증가 우려', type: 'warning' },
  ];

  return (
    <div className="space-y-2">
      {anomalies.map((item, idx) => (
        <div key={idx} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500">✓</span>
            <StreamingText
              content={item.label}
              as="span"
              className="font-medium text-gray-800"
              typingSpeed={30}
              startDelay={idx * 500}
              showCursor={false}
              enabled={streamingEnabled}
            />
          </div>
          {'findings' in item && item.findings ? (
            <div className="ml-5 mt-1 space-y-1">
              {item.findings.map((f, fIdx) => (
                <StreamingText
                  key={fIdx}
                  content={`${f.type === 'positive' ? '● ' : '▲ '}${f.text}`}
                  as="p"
                  className={`text-xs ${f.type === 'positive' ? 'text-green-600' : 'text-amber-600'}`}
                  typingSpeed={20}
                  startDelay={idx * 500 + 200 + fIdx * 150}
                  showCursor={false}
                  enabled={streamingEnabled}
                />
              ))}
            </div>
          ) : (
            <StreamingText
              content={`→ ${item.finding}`}
              as="p"
              className={`text-xs ml-5 mt-1 ${item.type === 'warning' ? 'text-amber-600' : 'text-gray-600'}`}
              typingSpeed={20}
              startDelay={idx * 500 + 200}
              showCursor={false}
              enabled={streamingEnabled}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// 10. 데이터 검증 (HITL)
const DataVerificationRenderer: React.FC<SalesToolRendererProps> = ({ status }) => (
  <div className="text-sm text-gray-500">
    {status === 'completed'
      ? '데이터 검증이 완료되었습니다.'
      : '데이터 검증 대기 중...'}
  </div>
);

// 11. 핵심 인사이트 도출
const KeyInsightGenerationRenderer: React.FC<SalesToolRendererProps> = ({ streamingEnabled }) => {
  const insights = [
    { label: '성과 하이라이트', finding: '월 매출 420억원 - 연중 최고 실적' },
    { label: '개선 영역 식별', finding: '재고 회전율 개선 필요 (현재 12.4회)' },
    { label: '전략적 시사점', finding: 'CAPEX 조기 집행 검토 (가동률 한계)' },
  ];

  return (
    <div className="space-y-2">
      {insights.map((insight, idx) => (
        <div key={idx} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500">✓</span>
            <StreamingText
              content={insight.label}
              as="span"
              className="font-medium text-gray-800"
              typingSpeed={30}
              startDelay={idx * 450}
              showCursor={false}
              enabled={streamingEnabled}
            />
          </div>
          <StreamingText
            content={`→ ${insight.finding}`}
            as="p"
            className="text-xs text-gray-600 ml-5 mt-1"
            typingSpeed={20}
            startDelay={idx * 450 + 200}
            showCursor={false}
            enabled={streamingEnabled}
          />
        </div>
      ))}
    </div>
  );
};

// 12. 시각화 생성
const VisualizationGenerationRenderer: React.FC<SalesToolRendererProps> = ({ streamingEnabled }) => {
  const charts = [
    { label: '매출 추이 차트', desc: '월별/분기별 매출 증감 추이 (Bar + Line)' },
    { label: '사업부 비교 차트', desc: '사업부별 매출/영업이익 비교 (Stacked Bar)' },
    { label: '운영 KPI 대시보드', desc: '주요 운영 지표 게이지/히트맵 구성' },
  ];

  return (
    <div className="space-y-2">
      {charts.map((chart, idx) => (
        <div key={idx} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500">✓</span>
            <StreamingText
              content={chart.label}
              as="span"
              className="font-medium text-gray-800"
              typingSpeed={30}
              startDelay={idx * 450}
              showCursor={false}
              enabled={streamingEnabled}
            />
          </div>
          <StreamingText
            content={chart.desc}
            as="p"
            className="text-xs text-gray-500 ml-5 mt-1"
            typingSpeed={20}
            startDelay={idx * 450 + 200}
            showCursor={false}
            enabled={streamingEnabled}
          />
        </div>
      ))}
    </div>
  );
};

// 13. 분석 완료
const AnalysisCompletionRenderer: React.FC<SalesToolRendererProps> = ({ streamingEnabled }) => {
  const completionItems = [
    { label: '분석 요약', desc: '전체 분석 결과 요약문 생성 완료' },
    { label: '후속 액션 제안', desc: '분석 결과 PPT로 제작 / 상세 리포트 다운로드' },
  ];

  return (
    <div className="space-y-2">
      {completionItems.map((item, idx) => (
        <div key={idx} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500">✓</span>
            <StreamingText
              content={item.label}
              as="span"
              className="font-medium text-gray-800"
              typingSpeed={30}
              startDelay={idx * 450}
              showCursor={false}
              enabled={streamingEnabled}
            />
          </div>
          <StreamingText
            content={item.desc}
            as="p"
            className="text-xs text-gray-500 ml-5 mt-1"
            typingSpeed={20}
            startDelay={idx * 450 + 200}
            showCursor={false}
            enabled={streamingEnabled}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Sales Analysis Tool Registry
 * toolType → React Component mapping
 */
export const SALES_ANALYSIS_RENDERERS: Record<string, React.FC<SalesToolRendererProps>> = {
  request_analysis: RequestAnalysisRenderer,
  analysis_scope_confirm: AnalysisScopeConfirmRenderer,
  data_source_connect: DataSourceConnectRenderer,
  financial_data_collection: FinancialDataCollectionRenderer,
  division_data_collection: DivisionDataCollectionRenderer,
  operation_data_collection: OperationDataCollectionRenderer,
  revenue_driver_analysis: RevenueDriverAnalysisRenderer,
  profitability_analysis: ProfitabilityAnalysisRenderer,
  anomaly_detection: AnomalyDetectionRenderer,
  data_verification: DataVerificationRenderer,
  key_insight_generation: KeyInsightGenerationRenderer,
  visualization_generation: VisualizationGenerationRenderer,
  analysis_completion: AnalysisCompletionRenderer,
};
