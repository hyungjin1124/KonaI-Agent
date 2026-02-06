import { useState, useCallback, useMemo } from 'react';
import {
  SlideOutline,
  SlideOutlineDeck,
  SlideOutlineStatus,
  SlideLayoutType,
} from '../components/features/agent-chat/types';

// 기본 슬라이드 개요 데이터 (데모용)
const createDefaultSlideOutlines = (): SlideOutline[] => [
  {
    id: 'slide-1',
    slideNumber: 1,
    title: '표지',
    fileName: '01_표지.md',
    layoutType: 'title-only',
    markdownContent: `# Q4 2025 경영 실적 보고서

## 코나아이 주식회사
### "디지털 결제의 미래를 선도하는 플랫폼 기업"

---

**발표일**: 2026년 1월 30일
**작성**: 경영기획팀
**보안등급**: 사내 한정`,
    status: 'pending-review',
    estimatedDuration: '1 min',
    lastModifiedAt: new Date(),
  },
  {
    id: 'slide-2',
    slideNumber: 2,
    title: 'Executive Summary',
    fileName: '02_Executive_Summary.md',
    layoutType: 'title-bullets',
    markdownContent: `# Executive Summary

## 핵심 성과 요약

\`\`\`layout
type: metric-cards
columns: 4
\`\`\`

| 지표 | 실적 | 증감 | 목표달성률 |
|------|------|------|-----------|
| 매출액 | ₩1,258억 | +12.3% | 103% |
| 영업이익 | ₩189억 | +20.3% | 108% |
| 영업이익률 | 15.0% | +1.0%p | - |
| 순이익 | ₩144억 | +22.3% | 110% |

---

## 주요 하이라이트

### 성과
- **메탈카드 사업** 분기 최대 실적 (₩312억)
- **신규 고객사** 12곳 확보 (누적 287개사)
- **원가율 개선** 2.1%p 절감 (67.2% → 65.1%)

### 주의
- **물류비 상승** 유가 인상 (+3.2%)
- **재고 수준** 일시적 증가 (회전율 12.4회)`,
    speakerNotes: '전사 목표를 모두 초과 달성. 영업이익 +20.3% 성장이 가장 큰 성과임을 강조.',
    estimatedDuration: '2 min',
    dataConnections: ['영림원 ERP', 'Platform Portal'],
    status: 'pending-review',
    lastModifiedAt: new Date(),
  },
  {
    id: 'slide-3',
    slideNumber: 3,
    title: '매출 실적 상세',
    fileName: '03_매출_실적_상세.md',
    layoutType: 'chart-full',
    markdownContent: `# Q4 2025 매출 실적 상세

## 분기별 매출 추이

\`\`\`chart
type: combo-bar-line
title: 분기별 매출 및 성장률 추이
x-axis: [Q1, Q2, Q3, Q4]
bar-data: [1089, 1156, 1198, 1258]
line-data: [8.2, 10.5, 11.1, 12.3]
legend: [매출액(억원), YoY 성장률(%)]
source: 영림원 ERP > 손익계산서 > 분기별_매출
\`\`\`

---

## 월별 상세

| 월 | 매출액 | 전월비 | 특이사항 |
|----|--------|--------|----------|
| 10월 | ₩398억 | +3.2% | 추석 특수 |
| 11월 | ₩412억 | +3.5% | 블랙프라이데이 |
| 12월 | ₩448억 | **+8.7%** | *연말 카드 발급 급증 |

---

**연간 누적**: ₩4,701억 (전년 대비 +10.5%)`,
    speakerNotes: 'Q4가 연간 최고 실적이며, 12월 연말 특수가 크게 기여. 메탈카드 크리스마스 에디션이 특히 인기',
    estimatedDuration: '3 min',
    dataConnections: ['영림원 ERP'],
    status: 'pending-review',
    lastModifiedAt: new Date(),
  },
  {
    id: 'slide-4',
    slideNumber: 4,
    title: '사업부별 실적 비교',
    fileName: '04_사업부별_실적.md',
    layoutType: 'comparison',
    markdownContent: `# 사업부별 실적 비교

\`\`\`chart
type: donut
title: 사업부별 매출 구성비
center-text: "₩1,258억 총 매출"
\`\`\`

---

### [1] 플랫폼사업부
**₩755억** (YoY +18%)

| 세부 항목 | 매출 | 성장률 |
|----------|------|--------|
| 메탈카드 제조 | ₩312억 | **+32%** * |
| 선불카드 플랫폼 | ₩298억 | +12% |
| 기프트카드 | ₩145억 | +5% |

### [2] 솔루션사업부
**₩315억** (YoY +8%)

| 세부 항목 | 매출 |
|----------|------|
| SI 프로젝트 | ₩198억 |
| 유지보수 | ₩87억 |
| 클라우드 전환 | ₩30억 (신규) |

### [3] 컨설팅사업부
**₩189억** (YoY +5%)

| 세부 항목 | 매출 |
|----------|------|
| 금융 컨설팅 | ₩112억 |
| IT 컨설팅 | ₩77억 |`,
    speakerNotes: '플랫폼사업부가 전체 성장을 견인. 메탈카드의 폭발적 성장(+32%)이 핵심 동인.',
    estimatedDuration: '4 min',
    dataConnections: ['영림원 ERP', 'E2MAX MES'],
    status: 'pending-review',
    lastModifiedAt: new Date(),
  },
  {
    id: 'slide-5',
    slideNumber: 5,
    title: '원가 및 수익성 분석',
    fileName: '05_원가_수익성.md',
    layoutType: 'chart-full',
    markdownContent: `# 원가 및 수익성 분석

## 영업이익 Bridge 분석

\`\`\`chart
type: waterfall
title: Q3 → Q4 영업이익 변동 요인
bars:
  - Q3 영업이익: 156억
  - 매출 증가 효과: +48억
  - 원가율 개선: +12억
  - 판관비 증가: -18억
  - 물류비 상승: -9억
  - Q4 영업이익: 189억
annotation: "+21.2% 성장"
\`\`\`

---

## 핵심 비용 지표

| 항목 | Q3 2025 | Q4 2025 | 변화 |
|------|---------|---------|------|
| 매출원가율 | 67.2% | 65.1% | ● ▼ 2.1%p |
| 판관비율 | 19.8% | 19.9% | ▲ 0.1%p |
| 영업이익률 | 13.0% | 15.0% | ● ▲ 2.0%p |

---

## 원가 절감 주요 성과

- **원자재 구매 단가 협상**: ₩8.2억 절감
- **생산 효율화**: 가동률 87% → 92%, ₩3.8억 절감
- **불량률 감소**: 1.2% → 0.8%, ₩2.1억 절감

**총 절감액: ₩14.1억**`,
    speakerNotes: '원가율 2.1%p 개선이 영업이익 급증의 핵심. Waterfall 차트에서 녹색(개선)이 적색(비용증가)보다 큼을 강조',
    estimatedDuration: '3 min',
    dataConnections: ['영림원 ERP', 'E2MAX MES'],
    status: 'pending-review',
    lastModifiedAt: new Date(),
  },
  {
    id: 'slide-6',
    slideNumber: 6,
    title: '운영 KPI 현황',
    fileName: '06_운영_KPI.md',
    layoutType: 'two-column',
    markdownContent: `# 운영 KPI 현황

## 생산 지표

| KPI | 목표 | 실적 | 달성률 |
|-----|------|------|--------|
| 생산 가동률 | 90% | 92.3% | ● 103% |
| 불량률 | ≤1.0% | 0.8% | ● 125% |
| 납기 준수율 | 98% | 99.2% | ● 101% |
| 재고 회전율 | 14회 | 12.4회 | ▲ 89% |

**재고 회전율** 목표 미달: 메탈카드 원자재 선제 확보로 일시적 증가

---

## 고객 지표

| KPI | 목표 | 실적 | 달성률 |
|-----|------|------|--------|
| 고객 만족도 (CSAT) | 4.5 | 4.7 | ● 104% |
| 응답 시간 | ≤2시간 | 1.5시간 | ● 133% |
| 재계약률 | 95% | 97.2% | ● 102% |
| 신규 고객 | 10개사 | 12개사 | ● 120% |

---

## 인력 지표

| 항목 | 값 | 비고 |
|------|-----|------|
| 전체 인원 | 342명 | +8명 |
| 이직률 | 2.1% | 업계 5.2% |
| 교육 이수율 | 98.7% | - |`,
    speakerNotes: '8개 KPI 중 7개 달성. 재고 회전율은 Q1 수요 대비 전략적 선택.',
    estimatedDuration: '3 min',
    dataConnections: ['E2MAX MES', 'Platform Portal'],
    status: 'pending-review',
    lastModifiedAt: new Date(),
  },
  {
    id: 'slide-7',
    slideNumber: 7,
    title: '시장 환경 및 경쟁 분석',
    fileName: '07_시장_경쟁.md',
    layoutType: 'comparison',
    markdownContent: `# 시장 환경 및 경쟁 분석

## 결제 시장 동향

\`\`\`chart
type: line
title: 국내 카드 발급 시장 성장률 (2023-2025)
data:
  - 2023: +3.2%
  - 2024: +5.8%
  - 2025: +7.1%
source: 여신금융협회
\`\`\`

---

## 경쟁사 비교 (추정)

| 업체 | 시장점유율 | YoY | 강점 |
|------|-----------|-----|------|
| **코나아이** | 28% | +3%p | 메탈카드, 기술력 |
| A사 | 24% | +1%p | 가격 경쟁력 |
| B사 | 18% | -1%p | 대기업 네트워크 |
| 기타 | 30% | -3%p | - |

---

## 시장 기회 요인
- 동남아 결제 시장 급성장 (연 15% 성장)
- 프리미엄 카드 수요 증가
- 보안 카드 규제 강화 예정

## 위험 요인
- 원자재(니켈, 스테인리스) 가격 변동성
- 대기업 시장 진입 가능성`,
    speakerNotes: '시장점유율 1위 탈환. 메탈카드 기술 우위가 핵심 경쟁력',
    estimatedDuration: '3 min',
    dataConnections: ['외부 시장 데이터'],
    status: 'pending-review',
    lastModifiedAt: new Date(),
  },
  {
    id: 'slide-8',
    slideNumber: 8,
    title: '2026년 전략 방향',
    fileName: '08_전략_방향.md',
    layoutType: 'title-bullets',
    markdownContent: `# 2026년 전략 방향

## 핵심 전략 3대 축

### 1. 수익성 중심 성장
- 매출 목표: ₩5,200억 (YoY +10.6%)
- 영업이익률 목표: 16% (현재 15%)
- 메탈카드 비중 확대: 30% → 35%

### 2. 시장 확장
- 베트남 현지법인 설립 (Q2)
- 태국 파트너십 체결 (Q3)
- 신규 제품 라인업 3종 출시

### 3. 디지털 전환 가속화
- 스마트팩토리 2단계 투자
- AI 기반 품질 예측 시스템 도입
- 클라우드 전환 완료 (현재 60% → 100%)

---

## 투자 계획

| 항목 | 금액 | 용도 |
|------|------|------|
| 설비 투자 | ₩50억 | 메탈카드 라인 증설 |
| R&D | ₩30억 | 신제품 개발 |
| 해외 진출 | ₩20억 | 베트남 법인 |
| IT 인프라 | ₩15억 | 클라우드 전환 |

**총 투자액**: ₩115억`,
    speakerNotes: '수익성과 성장의 균형을 강조. 해외 진출은 리스크 최소화하며 단계적 추진',
    estimatedDuration: '4 min',
    status: 'pending-review',
    lastModifiedAt: new Date(),
  },
  {
    id: 'slide-9',
    slideNumber: 9,
    title: 'Q&A / 감사',
    fileName: '09_QnA.md',
    layoutType: 'title-only',
    markdownContent: `# Q&A

---

## 추가 자료 문의

**경영기획팀**
E-mail: planning@konai.com
Tel: 02-1234-5678

---

## 감사합니다

### 코나아이 주식회사
*"결제의 미래를 함께 만들어 갑니다"*

---

**Appendix**
- 상세 재무제표: 별첨 1
- 사업부별 상세 실적: 별첨 2
- 경쟁사 분석 보고서: 별첨 3`,
    estimatedDuration: '2 min',
    status: 'pending-review',
    lastModifiedAt: new Date(),
  },
];

interface UseSlideOutlineHITLProps {
  onAllApproved?: () => void;
  onOutlineUpdate?: (outline: SlideOutline) => void;
}

interface UseSlideOutlineHITLReturn {
  // State
  deck: SlideOutlineDeck | null;
  selectedOutlineId: string | null;
  selectedOutline: SlideOutline | null;
  isAllApproved: boolean;
  approvedCount: number;
  totalCount: number;

  // Actions
  initializeDeck: () => void;
  selectOutline: (id: string) => void;
  selectNextOutline: () => void;
  selectPreviousOutline: () => void;
  updateOutlineContent: (id: string, markdownContent: string) => void;
  updateOutlineContentAndReset: (id: string, markdownContent: string) => void;
  updateOutlineLayout: (id: string, layoutType: SlideLayoutType) => void;
  approveOutline: (id: string) => void;
  markNeedsRevision: (id: string) => void;
  approveAll: () => void;
  resetAllStatus: () => void;
}

export const useSlideOutlineHITL = ({
  onAllApproved,
  onOutlineUpdate,
}: UseSlideOutlineHITLProps = {}): UseSlideOutlineHITLReturn => {
  const [deck, setDeck] = useState<SlideOutlineDeck | null>(null);
  const [selectedOutlineId, setSelectedOutlineId] = useState<string | null>(null);

  // 선택된 개요
  const selectedOutline = useMemo(() => {
    if (!deck || !selectedOutlineId) return null;
    return deck.outlines.find((o) => o.id === selectedOutlineId) || null;
  }, [deck, selectedOutlineId]);

  // 승인 상태 계산
  const { isAllApproved, approvedCount, totalCount } = useMemo(() => {
    if (!deck) return { isAllApproved: false, approvedCount: 0, totalCount: 0 };
    const approved = deck.outlines.filter((o) => o.status === 'approved').length;
    const total = deck.outlines.length;
    return {
      isAllApproved: approved === total && total > 0,
      approvedCount: approved,
      totalCount: total,
    };
  }, [deck]);

  // 덱 초기화
  const initializeDeck = useCallback(() => {
    const outlines = createDefaultSlideOutlines();
    const newDeck: SlideOutlineDeck = {
      id: `deck-${Date.now()}`,
      title: 'Q4 2025 경영 실적 보고서',
      outlines,
      overallStatus: 'review',
      metadata: {
        estimatedTotalDuration: '25 min',
        totalSlides: outlines.length,
        approvedSlides: 0,
        createdAt: new Date(),
        lastModifiedAt: new Date(),
      },
    };
    setDeck(newDeck);
    // 첫 번째 슬라이드 자동 선택
    if (outlines.length > 0) {
      setSelectedOutlineId(outlines[0].id);
    }
  }, []);

  // 개요 선택
  const selectOutline = useCallback((id: string) => {
    setSelectedOutlineId(id);
  }, []);

  // 다음 개요 선택
  const selectNextOutline = useCallback(() => {
    if (!deck || !selectedOutlineId) return;
    const currentIndex = deck.outlines.findIndex((o) => o.id === selectedOutlineId);
    if (currentIndex < deck.outlines.length - 1) {
      setSelectedOutlineId(deck.outlines[currentIndex + 1].id);
    }
  }, [deck, selectedOutlineId]);

  // 이전 개요 선택
  const selectPreviousOutline = useCallback(() => {
    if (!deck || !selectedOutlineId) return;
    const currentIndex = deck.outlines.findIndex((o) => o.id === selectedOutlineId);
    if (currentIndex > 0) {
      setSelectedOutlineId(deck.outlines[currentIndex - 1].id);
    }
  }, [deck, selectedOutlineId]);

  // 헬퍼: 개요 업데이트
  const updateOutline = useCallback(
    (id: string, updates: Partial<SlideOutline>) => {
      setDeck((prev) => {
        if (!prev) return prev;
        const updatedOutlines = prev.outlines.map((o) =>
          o.id === id ? { ...o, ...updates, lastModifiedAt: new Date() } : o
        );
        const approvedCount = updatedOutlines.filter((o) => o.status === 'approved').length;
        const newDeck = {
          ...prev,
          outlines: updatedOutlines,
          metadata: {
            ...prev.metadata,
            approvedSlides: approvedCount,
            lastModifiedAt: new Date(),
          },
        };

        // 콜백 호출
        const updatedOutline = updatedOutlines.find((o) => o.id === id);
        if (updatedOutline && onOutlineUpdate) {
          onOutlineUpdate(updatedOutline);
        }

        // 모두 승인 확인
        if (approvedCount === updatedOutlines.length && onAllApproved) {
          setTimeout(() => onAllApproved(), 100);
        }

        return newDeck;
      });
    },
    [onOutlineUpdate, onAllApproved]
  );

  // 마크다운 내용 업데이트
  const updateOutlineContent = useCallback(
    (id: string, markdownContent: string) => {
      updateOutline(id, { markdownContent });
    },
    [updateOutline]
  );

  // 마크다운 내용 업데이트 + 상태 리셋 (수정 모드에서 사용)
  const updateOutlineContentAndReset = useCallback(
    (id: string, markdownContent: string) => {
      updateOutline(id, { markdownContent, status: 'pending-review' as SlideOutlineStatus });
    },
    [updateOutline]
  );

  // 레이아웃 업데이트
  const updateOutlineLayout = useCallback(
    (id: string, layoutType: SlideLayoutType) => {
      updateOutline(id, { layoutType });
    },
    [updateOutline]
  );

  // 개요 승인
  const approveOutline = useCallback(
    (id: string) => {
      updateOutline(id, { status: 'approved' as SlideOutlineStatus });
    },
    [updateOutline]
  );

  // 수정 필요 표시
  const markNeedsRevision = useCallback(
    (id: string) => {
      updateOutline(id, { status: 'needs-revision' as SlideOutlineStatus });
    },
    [updateOutline]
  );

  // 모두 승인
  const approveAll = useCallback(() => {
    setDeck((prev) => {
      if (!prev) return prev;
      const updatedOutlines = prev.outlines.map((o) => ({
        ...o,
        status: 'approved' as SlideOutlineStatus,
        lastModifiedAt: new Date(),
      }));
      const newDeck = {
        ...prev,
        outlines: updatedOutlines,
        overallStatus: 'approved' as const,
        metadata: {
          ...prev.metadata,
          approvedSlides: updatedOutlines.length,
          lastModifiedAt: new Date(),
        },
      };

      if (onAllApproved) {
        setTimeout(() => onAllApproved(), 100);
      }

      return newDeck;
    });
  }, [onAllApproved]);

  // 모든 상태 리셋
  const resetAllStatus = useCallback(() => {
    setDeck((prev) => {
      if (!prev) return prev;
      const updatedOutlines = prev.outlines.map((o) => ({
        ...o,
        status: 'pending-review' as SlideOutlineStatus,
        lastModifiedAt: new Date(),
      }));
      return {
        ...prev,
        outlines: updatedOutlines,
        overallStatus: 'review' as const,
        metadata: {
          ...prev.metadata,
          approvedSlides: 0,
          lastModifiedAt: new Date(),
        },
      };
    });
  }, []);

  return {
    deck,
    selectedOutlineId,
    selectedOutline,
    isAllApproved,
    approvedCount,
    totalCount,
    initializeDeck,
    selectOutline,
    selectNextOutline,
    selectPreviousOutline,
    updateOutlineContent,
    updateOutlineContentAndReset,
    updateOutlineLayout,
    approveOutline,
    markNeedsRevision,
    approveAll,
    resetAllStatus,
  };
};

export default useSlideOutlineHITL;
