import { SlideContent } from '../agent-chat/types';

// Mock slide data for PPT generation simulation
export const MOCK_SLIDES: SlideContent[] = [
  {
    type: 'cover',
    title: 'Q4 2025 경영 실적 보고서',
    subtitle: '전략기획실 | 2025.12.31'
  },
  {
    type: 'toc',
    title: '목차',
    bulletPoints: [
      '경영 실적 요약',
      '매출 분석',
      '비용 구조 분석',
      '향후 전략 및 전망'
    ]
  },
  {
    type: 'content',
    title: 'Executive Summary',
    bulletPoints: [
      '전년 대비 매출 15% 성장 달성',
      '영업이익률 12.5% 기록',
      '신규 사업 매출 비중 25% 확대',
      '해외 시장 진출 성공적 완료'
    ]
  },
  {
    type: 'chart',
    title: '분기별 매출 추이',
    subtitle: '단위: 억원',
    chartData: {
      type: 'bar',
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      values: [120, 145, 160, 185]
    }
  },
  {
    type: 'content',
    title: '주요 성과 하이라이트',
    bulletPoints: [
      '디지털 전환 프로젝트 성공적 완료',
      '고객 만족도 92% 달성',
      '신규 고객 1,500개사 확보',
      '운영 효율성 20% 개선'
    ]
  },
  {
    type: 'chart',
    title: '사업부별 매출 비중',
    chartData: {
      type: 'pie',
      labels: ['금융 솔루션', '플랫폼 서비스', '컨설팅', '기타'],
      values: [45, 30, 18, 7]
    }
  },
  {
    type: 'comparison',
    title: '전년 대비 실적 비교',
    bulletPoints: [
      '2024년 매출: 520억원 → 2025년: 610억원',
      '성장률: +17.3%',
      '영업이익: 58억원 → 76억원',
      '순이익: 42억원 → 55억원'
    ]
  },
  {
    type: 'content',
    title: '비용 구조 분석',
    bulletPoints: [
      '인건비: 전체 비용의 45%',
      'IT 인프라: 전체 비용의 20%',
      '마케팅: 전체 비용의 15%',
      '관리비: 전체 비용의 12%',
      '기타: 8%'
    ]
  },
  {
    type: 'chart',
    title: '월별 신규 고객 추이',
    chartData: {
      type: 'line',
      labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
      values: [85, 92, 110, 125, 138, 142, 155, 168, 175, 190, 205, 220]
    }
  },
  {
    type: 'content',
    title: '2026년 전략 방향',
    bulletPoints: [
      'AI 기반 서비스 확대',
      '글로벌 시장 진출 가속화',
      'M&A를 통한 사업 다각화',
      'ESG 경영 강화'
    ]
  },
  {
    type: 'content',
    title: '투자 계획',
    bulletPoints: [
      'R&D 투자 30% 확대',
      '인재 영입 100명 목표',
      '신규 데이터센터 구축',
      '해외 법인 2개 추가 설립'
    ]
  },
  {
    type: 'chart',
    title: '2026년 매출 목표',
    subtitle: '단위: 억원',
    chartData: {
      type: 'bar',
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      values: [170, 195, 220, 250]
    }
  },
  {
    type: 'content',
    title: '리스크 관리',
    bulletPoints: [
      '시장 변동성 대응 체계 구축',
      '사이버 보안 강화',
      '규제 환경 변화 모니터링',
      '공급망 다변화 추진'
    ]
  },
  {
    type: 'summary',
    title: '핵심 성과 및 향후 계획',
    bulletPoints: [
      '2025년 목표 초과 달성',
      '2026년 매출 835억원 목표',
      '지속 가능한 성장 기반 확보',
      '글로벌 Top 10 진입 추진'
    ]
  },
  {
    type: 'cover',
    title: '감사합니다',
    subtitle: '문의: strategy@company.com'
  }
];

// Generate slides based on slideCount
export function generateMockSlides(slideCount: number): SlideContent[] {
  const slides: SlideContent[] = [];
  const availableSlides = [...MOCK_SLIDES];

  for (let i = 0; i < slideCount; i++) {
    if (i < availableSlides.length) {
      slides.push(availableSlides[i]);
    } else {
      // Cycle through content slides if we need more
      const contentSlides = availableSlides.filter(s => s.type === 'content');
      slides.push(contentSlides[i % contentSlides.length]);
    }
  }

  return slides;
}
