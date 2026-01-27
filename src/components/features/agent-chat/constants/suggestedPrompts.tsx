import React from 'react';
import { TrendingUp, PieChart, FileText, Users } from '../../../icons';
import { SuggestionItem } from '../types';

export const suggestedPrompts: SuggestionItem[] = [
  {
    title: '실적 분석',
    description: '코나아이 ERP의 2025년 월별 매출 데이터를 분석 및 시각화',
    prompt: '코나아이 ERP의 2025년 월별 매출 데이터를 분석하여 시각화:\n- 월별 매출 추이\n- 사업부별 매출 구성\n- 주요 거래처 Top 10\n- 전년 동기 대비 성장률 KPI 카드 차트',
    icon: <TrendingUp size={20} className="text-[#FF3C42]" />,
  },
  {
    title: 'DID 리포트',
    description: 'DID 사업부 매출 및 원가 효율성 상세 분석 요청',
    prompt: 'DID 사업부의 2025년 성과를 분석해줘:\n- 국내/해외 매출 비중 추이\n- 메탈 카드 원가율 분석\n- 주력 칩셋 판매 순위',
    icon: <PieChart size={20} className="text-[#FF6D72]" />,
  },
  {
    title: 'PPT 생성',
    description: 'Q4 2025 경영 실적 보고서 PPT 생성',
    prompt: `Q4 2025 경영 실적 보고서 PPT를 만들어주세요.\n다음 섹션을 포함해주세요:\n- 표지 (회사 로고, 보고 일자)\n- 목차\n- 요약 (Executive Summary)\n- 재무 성과 (매출, 영업이익, 순이익)\n- 주요 사업 성과 (신규 계약, 프로젝트 완료율)\n- 향후 계획`,
    icon: <FileText size={20} className="text-[#FF9DA0]" />,
  },
  {
    title: '인사이트',
    prompt: '환율 1,500원 달성 시 이번 분기 원가 영향 분석 및 대처 방안',
    icon: <Users size={20} className="text-black" />,
  },
];
