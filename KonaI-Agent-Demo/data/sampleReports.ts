
import { ExecutiveAnalysisReport } from '../types/AnalysisReport';

export const DecSalesAnalysisReport: ExecutiveAnalysisReport = {
  title: "12월 경영 실적 심층 분석: 양적 성장과 질적 개선의 동시 달성",
  summary: "12월 매출은 전월 대비 13.5% 성장한 42억 원을 기록하며 목표를 초과 달성했습니다. 특히 고마진 제품군(Gold Edition) 확대와 공정 자동화로 영업이익률이 2.1%p 개선되는 '수익성 동반 성장' 구조가 정착되었습니다. 이제 저수익 고객군 구조조정과 프리미엄 라인업 확대를 위한 과감한 의사결정이 필요한 시점입니다.",
  metrics: [
    { label: "영업이익률", value: "18.2%", change: "+2.1%p", trend: "up", impact: "positive" },
    { label: "C카드 매출", value: "₩10.5억", change: "-6.7%", trend: "down", impact: "negative" }
  ],
  growthDrivers: [
    { name: "물량 효과 (Volume)", contribution: 70, description: "A은행 신규 발급 20만 장 급증 (일회성 요인 포함)", sustainability: "Medium" },
    { name: "단가 효과 (Price)", contribution: 30, description: "Gold/LED 등 고부가 제품 Mix 개선", sustainability: "High" }
  ],
  costEfficiency: {
    currentRatio: 62.0,
    targetRatio: 65.0,
    improvement: 3.0,
    analysis: "공정 자동화율 75% 달성으로 고정비 부담 증가에도 불구하고 변동비(인건비) 절감 효과가 이를 상회하여, 경쟁사 평균(68%) 대비 확실한 원가 우위를 확보했습니다."
  },
  recommendations: [
    {
      id: "rec_01",
      title: "C카드사 대상 'Premium Mix' 전환 제안 승인",
      description: "역성장 중인 C카드사의 저마진 범용 제품을 단계적으로 단종하고, 'Gold Edition'으로 전환 유도.",
      expectedImpact: "매출 -5% 예상되나, 영업이익 +1.5억 개선",
      timeline: "즉시 (1월 협상 시작)",
      riskLevel: "Medium",
      actionItems: ["C카드사 전담 영업팀 재편", "전환 프로모션 예산 0.5억 배정"]
    },
    {
      id: "rec_02",
      title: "자동화 라인 2호기 조기 발주",
      description: "현재 가동률 95% 육박. 1분기 수주 물량 안정적 소화를 위한 선제적 CAPA 투자.",
      expectedImpact: "원가율 추가 2%p 절감 및 생산량 30% 증대",
      timeline: "Q1 내 발주 완료",
      riskLevel: "Low",
      actionItems: ["투자심의위원회 안건 상정", "설비 공급사 납기 단축 협의"]
    }
  ],
  visualizationReferences: ["revenue_bridge_chart", "cost_correlation_chart", "customer_analysis_chart"]
};
