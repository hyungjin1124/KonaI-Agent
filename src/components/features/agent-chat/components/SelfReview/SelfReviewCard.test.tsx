import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import SelfReviewCard from './SelfReviewCard';
import { deriveRiskLevel, buildSelfReviewResult } from './constants';
import type { ReviewItem, ReviewOverallStatus } from './types';

// =============================================
// Test Fixtures
// =============================================

function makeItems(overrides?: Partial<ReviewItem>[]): ReviewItem[] {
  const defaults: ReviewItem[] = [
    { id: 'check_1', label: '슬라이드 수 일치', status: 'pass' },
    { id: 'check_2', label: '데이터 정합성 확인', status: 'pass' },
    { id: 'check_3', label: '레이아웃 일관성', status: 'pass' },
  ];
  if (!overrides) return defaults;
  return defaults.map((item, i) => ({ ...item, ...overrides[i] }));
}

const defaultProps = {
  items: makeItems(),
  overallStatus: 'pass' as ReviewOverallStatus,
};

// =============================================
// Smoke Test
// =============================================

describe('SelfReviewCard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without error', () => {
    render(<SelfReviewCard {...defaultProps} />);
    expect(screen.getByRole('region', { name: '자체 검증 결과' })).toBeInTheDocument();
  });

  // =============================================
  // AC2: pass/warning/fail 트래픽 라이트 + 체크리스트
  // =============================================

  describe('AC2: 상태별 헤더 표시', () => {
    it('items가 모두 pass일 때 "자체 검증 완료" 헤더 표시', () => {
      render(<SelfReviewCard {...defaultProps} />);
      expect(screen.getByText('자체 검증 완료')).toBeInTheDocument();
      expect(screen.getByLabelText('검증 완료')).toBeInTheDocument();
    });

    it('warning 항목 존재 시 "검증 이슈 발견" 헤더 표시', () => {
      const items = makeItems([
        { status: 'pass' },
        { status: 'warning' },
        { status: 'pass' },
      ]);
      render(<SelfReviewCard items={items} overallStatus="warning" />);
      expect(screen.getByText('검증 이슈 발견')).toBeInTheDocument();
      expect(screen.getByLabelText('경고 발견')).toBeInTheDocument();
    });

    it('fail 항목 존재 시 "검증 실패" 헤더 표시', () => {
      const items = makeItems([
        { status: 'pass' },
        { status: 'fail' },
        { status: 'pass' },
      ]);
      render(<SelfReviewCard items={items} overallStatus="fail" />);
      expect(screen.getByText('검증 실패')).toBeInTheDocument();
      expect(screen.getByLabelText('검증 실패')).toBeInTheDocument();
    });

    it('결과 요약에 통과/경고/실패 카운트 표시', () => {
      const items = makeItems([
        { status: 'pass' },
        { status: 'warning' },
        { status: 'fail' },
      ]);
      render(<SelfReviewCard items={items} overallStatus="fail" />);
      expect(screen.getByText(/1 통과/)).toBeInTheDocument();
      expect(screen.getByText(/1 경고/)).toBeInTheDocument();
      expect(screen.getByText(/1 실패/)).toBeInTheDocument();
    });
  });

  // =============================================
  // AC6: 로딩 상태 "검증 항목 N/M 확인 중..."
  // =============================================

  describe('AC6: 진행률 표시', () => {
    it('reviewing 상태에서 currentCheckIndex로 진행률 텍스트 표시', () => {
      const items = makeItems([
        { status: 'pass' },
        { status: 'checking' },
        { status: 'pending' },
      ]);
      render(
        <SelfReviewCard
          items={items}
          overallStatus="reviewing"
          currentCheckIndex={1}
        />
      );
      expect(screen.getByText('검증 항목 2/3 확인 중...')).toBeInTheDocument();
    });

    it('reviewing 상태에서 스피너 아이콘 표시', () => {
      render(
        <SelfReviewCard
          items={makeItems([{ status: 'checking' }, { status: 'pending' }, { status: 'pending' }])}
          overallStatus="reviewing"
          currentCheckIndex={0}
        />
      );
      expect(screen.getByLabelText('검증 중')).toBeInTheDocument();
    });
  });

  // =============================================
  // AC3: 접이식 상세 + 증거 링크
  // =============================================

  describe('AC3: 접이식 토글', () => {
    it('카드 클릭 시 접이식 확장하여 항목 상세 표시', async () => {
      const user = userEvent.setup();
      const items = makeItems([
        { status: 'pass', description: '5/5 슬라이드 일치' },
        { status: 'warning', description: '일부 데이터 누락' },
        { status: 'pass' },
      ]);
      render(<SelfReviewCard items={items} overallStatus="warning" />);

      // 초기에는 상세 내용 숨김
      expect(screen.queryByText('5/5 슬라이드 일치')).not.toBeInTheDocument();

      // 헤더 클릭 → 확장
      await user.click(screen.getByRole('button', { name: /검증 이슈 발견/ }));

      // 상세 내용 표시
      expect(screen.getByText('5/5 슬라이드 일치')).toBeInTheDocument();
      expect(screen.getByText('일부 데이터 누락')).toBeInTheDocument();
    });

    it('증거 링크가 있는 항목에서 증거 라벨 표시', async () => {
      const user = userEvent.setup();
      const items: ReviewItem[] = [
        {
          id: 'check_1',
          label: '데이터 정합성',
          status: 'warning',
          description: '합계 불일치',
          evidence: { type: 'log', label: '검증 로그 확인' },
        },
      ];
      render(<SelfReviewCard items={items} overallStatus="warning" />);

      await user.click(screen.getByRole('button', { name: /검증 이슈 발견/ }));

      expect(screen.getByText('검증 로그 확인')).toBeInTheDocument();
    });
  });

  // =============================================
  // AC8: 키보드 접근성
  // =============================================

  describe('AC8: 키보드 접근성', () => {
    it('Tab으로 포커스 가능', async () => {
      const user = userEvent.setup();
      render(<SelfReviewCard {...defaultProps} />);

      await user.tab();
      const trigger = screen.getByRole('button', { name: /자체 검증 완료/ });
      expect(trigger).toHaveFocus();
    });

    it('Enter로 토글', async () => {
      const user = userEvent.setup();
      render(<SelfReviewCard {...defaultProps} />);

      await user.tab();
      await user.keyboard('{Enter}');

      // 확장되어 항목이 보여야 함
      expect(screen.getByText('슬라이드 수 일치')).toBeInTheDocument();
    });

    it('Escape로 축소', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(
        <SelfReviewCard {...defaultProps} isExpanded={true} onToggle={onToggle} />
      );

      // region div에 tabIndex를 설정하고 포커스 후 Escape
      const region = screen.getByRole('region', { name: '자체 검증 결과' });
      // region 위에서 직접 Escape를 발생 — fireEvent 사용
      const { fireEvent } = await import('@testing-library/react');
      fireEvent.keyDown(region, { key: 'Escape' });
      expect(onToggle).toHaveBeenCalled();
    });
  });

  // =============================================
  // AC7: 실패 시 자동 수정
  // =============================================

  describe('AC7: 자동 수정', () => {
    it('fail 항목 + onAutoFix → "자동 수정 시도" 버튼 표시', async () => {
      const user = userEvent.setup();
      const onAutoFix = vi.fn();
      const items = makeItems([
        { status: 'pass' },
        { status: 'fail' },
        { status: 'pass' },
      ]);
      render(
        <SelfReviewCard
          items={items}
          overallStatus="fail"
          isExpanded={true}
          onAutoFix={onAutoFix}
        />
      );

      const autoFixButton = screen.getByText('자동 수정 시도');
      expect(autoFixButton).toBeInTheDocument();

      await user.click(autoFixButton);
      expect(onAutoFix).toHaveBeenCalledTimes(1);
    });

    it('isAutoFixing=true → "자동 수정 진행 중..." 텍스트 표시', () => {
      const items = makeItems([{ status: 'fail' }, { status: 'pass' }, { status: 'pass' }]);
      render(
        <SelfReviewCard
          items={items}
          overallStatus="fail"
          isExpanded={true}
          onAutoFix={() => {}}
          isAutoFixing={true}
        />
      );

      expect(screen.getByText('자동 수정 진행 중...')).toBeInTheDocument();
    });
  });
});

// =============================================
// AC4: 유틸 함수 단위 테스트 (suggestedRiskLevel)
// =============================================

describe('deriveRiskLevel', () => {
  it('모든 항목 pass → low', () => {
    const items = makeItems();
    expect(deriveRiskLevel(items)).toBe('low');
  });

  it('warning 존재 → medium', () => {
    const items = makeItems([{ status: 'pass' }, { status: 'warning' }, { status: 'pass' }]);
    expect(deriveRiskLevel(items)).toBe('medium');
  });

  it('fail 존재 → high', () => {
    const items = makeItems([{ status: 'pass' }, { status: 'fail' }, { status: 'pass' }]);
    expect(deriveRiskLevel(items)).toBe('high');
  });

  it('fail + warning → high (fail 우선)', () => {
    const items = makeItems([{ status: 'warning' }, { status: 'fail' }, { status: 'pass' }]);
    expect(deriveRiskLevel(items)).toBe('high');
  });
});

describe('buildSelfReviewResult', () => {
  it('검증 결과 요약을 올바르게 생성', () => {
    const items = makeItems([{ status: 'pass' }, { status: 'warning' }, { status: 'fail' }]);
    const result = buildSelfReviewResult(items, 'fail');

    expect(result.passCount).toBe(1);
    expect(result.warningCount).toBe(1);
    expect(result.failCount).toBe(1);
    expect(result.totalCount).toBe(3);
    expect(result.suggestedRiskLevel).toBe('high');
    expect(result.overallStatus).toBe('fail');
  });
});
