/**
 * FeedbackQualityView — QA Flow Tests
 *
 * UX 플로우를 검증한다:
 * - AdminView 탭 통합 렌더링
 * - 필터 + 검색 → 빈 상태 → 복원 플로우
 * - 기간 변경 → 차트 데이터 변경 검증
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { FeedbackQualityView } from './FeedbackQualityView';
import { MOCK_FEEDBACK, filterFeedback } from './feedbackQualityData';

// Mock Recharts
vi.mock('recharts', () => {
  const MockResponsiveContainer = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  );
  const MockLineChart = ({ children, data }: { children: React.ReactNode; data?: unknown[] }) => (
    <div data-testid="line-chart" data-chart-count={data?.length ?? 0}>
      {children}
    </div>
  );
  const MockLine = () => <div data-testid="chart-line" />;
  const MockXAxis = () => null;
  const MockYAxis = () => null;
  const MockCartesianGrid = () => null;
  const MockTooltip = () => null;

  return {
    ResponsiveContainer: MockResponsiveContainer,
    LineChart: MockLineChart,
    Line: MockLine,
    XAxis: MockXAxis,
    YAxis: MockYAxis,
    CartesianGrid: MockCartesianGrid,
    Tooltip: MockTooltip,
  };
});

describe('FeedbackQualityView — QA Flow Tests', () => {
  // =========================================================================
  // Flow 1: Filter → Empty State → Reset → Full State
  // =========================================================================
  describe('Flow 1: Filter to empty and recover', () => {
    it('full flow: filter negative → search no match → empty state → clear search → recover', async () => {
      const user = userEvent.setup();
      render(<FeedbackQualityView />);

      // Step 1: Verify initial state — all feedback visible
      expect(screen.getByText(`${MOCK_FEEDBACK.length}건의 피드백`)).toBeInTheDocument();

      // Step 2: Filter to negative
      const feedbackFilter = screen.getByTestId('feedback-filter');
      await user.click(within(feedbackFilter).getByText('부정'));
      const negativeCount = MOCK_FEEDBACK.filter(f => f.feedbackType === 'negative').length;
      expect(screen.getByText(`${negativeCount}건의 피드백`)).toBeInTheDocument();

      // Step 3: Search for no match
      const searchInput = screen.getByLabelText('피드백 검색');
      await user.type(searchInput, 'NONEXISTENT');
      expect(screen.getByText('0건의 피드백')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();

      // Step 4: Clear search — should recover to negative-only
      await user.clear(searchInput);
      expect(screen.getByText(`${negativeCount}건의 피드백`)).toBeInTheDocument();

      // Step 5: Reset filter to all — should recover to full list
      await user.click(within(feedbackFilter).getByText('전체'));
      expect(screen.getByText(`${MOCK_FEEDBACK.length}건의 피드백`)).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Flow 2: Period Switch → Chart Data Change
  // =========================================================================
  describe('Flow 2: Period filter changes chart data', () => {
    it('switching period updates chart data count', async () => {
      const user = userEvent.setup();
      render(<FeedbackQualityView />);

      // Default: 30d
      const chart = screen.getByTestId('line-chart');
      expect(chart).toHaveAttribute('data-chart-count', '30');

      // Switch to 7d
      await user.click(screen.getByRole('button', { name: '7일' }));
      const chart7d = screen.getByTestId('line-chart');
      expect(chart7d).toHaveAttribute('data-chart-count', '7');

      // Switch to 90d (only 30 data points available)
      await user.click(screen.getByRole('button', { name: '90일' }));
      const chart90d = screen.getByTestId('line-chart');
      expect(chart90d).toHaveAttribute('data-chart-count', '30');
    });
  });

  // =========================================================================
  // Flow 3: Positive Filter → Verify Only Positive Badges
  // =========================================================================
  describe('Flow 3: Positive filter shows only positive badges', () => {
    it('filtering to positive shows only positive type badges in table', async () => {
      const user = userEvent.setup();
      render(<FeedbackQualityView />);

      const feedbackFilter = screen.getByTestId('feedback-filter');
      await user.click(within(feedbackFilter).getByText('긍정'));

      // All visible badge text should be '긍정', none should be '부정'
      const positiveBadges = screen.getAllByText('긍정');
      // Filter button itself shows '긍정' once, plus each row badge
      const positiveFeedback = MOCK_FEEDBACK.filter(f => f.feedbackType === 'positive');
      // positiveBadges includes filter button + table badges
      // At minimum we should have positive feedback items
      expect(positiveBadges.length).toBeGreaterThan(1); // 1 in filter + N in table

      // No '부정' badges should be visible in table area
      // '부정' text appears in: filter button (1) + chart legend (1) = 2 fixed locations
      // No additional '부정' badges from table rows should appear
      const allNegTexts = screen.queryAllByText('부정');
      expect(allNegTexts.length).toBe(2); // filter button + chart legend only

      expect(screen.getByText(`${positiveFeedback.length}건의 피드백`)).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Flow 4: Search in comment field
  // =========================================================================
  describe('Flow 4: Search finds matches in comment field', () => {
    it('searching for text that only exists in comments returns correct results', async () => {
      const user = userEvent.setup();
      render(<FeedbackQualityView />);

      // '법무팀' only appears in fb-4's comment
      const searchInput = screen.getByLabelText('피드백 검색');
      await user.type(searchInput, '법무팀');

      expect(screen.getByText('1건의 피드백')).toBeInTheDocument();
      expect(screen.getByText('박민수')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Flow 5: All three filters interact correctly (period + type + search)
  // =========================================================================
  describe('Flow 5: Triple filter interaction', () => {
    it('period change preserves search/type filter state', async () => {
      const user = userEvent.setup();
      render(<FeedbackQualityView />);

      // Set type filter
      const feedbackFilter = screen.getByTestId('feedback-filter');
      await user.click(within(feedbackFilter).getByText('부정'));

      // Set search
      const searchInput = screen.getByLabelText('피드백 검색');
      await user.type(searchInput, '데이터');

      // Count current results with default 30d period
      const expected30d = filterFeedback(MOCK_FEEDBACK, 'negative', '데이터', '30d');
      expect(screen.getByText(`${expected30d.length}건의 피드백`)).toBeInTheDocument();

      // Switch period to 7d — table results may change due to period filter on table
      await user.click(screen.getByRole('button', { name: '7일' }));
      const expected7d = filterFeedback(MOCK_FEEDBACK, 'negative', '데이터', '7d');
      expect(screen.getByText(`${expected7d.length}건의 피드백`)).toBeInTheDocument();

      // Verify search and type filter are preserved
      expect(searchInput).toHaveValue('데이터');
    });
  });

  // =========================================================================
  // Flow 6: Period filter affects table (Fix Cycle 1 verification)
  // =========================================================================
  describe('Flow 6: Period filter applies to table data', () => {
    it('switching from 30d to 7d reduces table count if older items exist', async () => {
      const user = userEvent.setup();
      render(<FeedbackQualityView />);

      // Default 30d — all 25 items should be visible
      const count30d = filterFeedback(MOCK_FEEDBACK, 'all', '', '30d').length;
      expect(screen.getByText(`${count30d}건의 피드백`)).toBeInTheDocument();

      // Switch to 7d
      await user.click(screen.getByRole('button', { name: '7일' }));
      const count7d = filterFeedback(MOCK_FEEDBACK, 'all', '', '7d').length;
      expect(screen.getByText(`${count7d}건의 피드백`)).toBeInTheDocument();

      // 7d count should be <= 30d count
      expect(count7d).toBeLessThanOrEqual(count30d);
    });
  });
});
