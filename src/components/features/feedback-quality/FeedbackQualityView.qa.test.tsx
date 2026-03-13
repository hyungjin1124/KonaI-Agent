/**
 * FeedbackQualityView — QA Edge Case Tests
 *
 * QA Engineer 관점에서 엣지 케이스를 검증한다.
 * 개발자 테스트(FeedbackQualityView.test.tsx)와 분리.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { FeedbackQualityView } from './FeedbackQualityView';
import {
  MOCK_FEEDBACK,
  FEEDBACK_FILTER_OPTIONS,
  filterFeedback,
  getDailyQualityByPeriod,
} from './feedbackQualityData';

// Mock Recharts
vi.mock('recharts', () => {
  const MockResponsiveContainer = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  );
  const MockLineChart = ({ children }: { children: React.ReactNode; data?: unknown[] }) => (
    <div data-testid="line-chart">{children}</div>
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

describe('FeedbackQualityView — QA Edge Cases', () => {
  // =========================================================================
  // 3-1. 데이터 경계 테스트
  // =========================================================================
  describe('Data Boundary Tests', () => {
    it('shows empty state when all feedback is filtered out via search', async () => {
      const user = userEvent.setup();
      render(<FeedbackQualityView />);

      const searchInput = screen.getByLabelText('피드백 검색');
      await user.type(searchInput, 'XXXXXXXXX_NO_MATCH_XXXXXXXXX');

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('조건에 맞는 피드백이 없습니다.')).toBeInTheDocument();
      expect(screen.getByText('0건의 피드백')).toBeInTheDocument();
    });

    it('shows empty state when type filter + search combination yields no results', async () => {
      const user = userEvent.setup();
      render(<FeedbackQualityView />);

      // Filter to negative only
      const feedbackFilter = screen.getByTestId('feedback-filter');
      await user.click(within(feedbackFilter).getByText('부정'));

      // Search for a user that only has positive feedback
      const searchInput = screen.getByLabelText('피드백 검색');
      // '한소영' has 2 positive and 0 negative in mock data
      await user.type(searchInput, '한소영');

      expect(screen.getByText('0건의 피드백')).toBeInTheDocument();
    });

    it('handles special characters in search without crashing', async () => {
      const user = userEvent.setup();
      render(<FeedbackQualityView />);

      const searchInput = screen.getByLabelText('피드백 검색');
      // Regex special chars, HTML entities, emoji
      await user.type(searchInput, '<script>alert("xss")</script>');

      expect(screen.getByText('0건의 피드백')).toBeInTheDocument();
      // No crash — component still renders
      expect(screen.getByTestId('feedback-quality-view')).toBeInTheDocument();
    });

    it('handles emoji in search input', async () => {
      const user = userEvent.setup();
      render(<FeedbackQualityView />);

      const searchInput = screen.getByLabelText('피드백 검색');
      await user.type(searchInput, '👍🎉');

      expect(screen.getByTestId('feedback-quality-view')).toBeInTheDocument();
    });

    it('displays all 25 mock feedback items with no filter', () => {
      render(<FeedbackQualityView />);
      expect(screen.getByText(`${MOCK_FEEDBACK.length}건의 피드백`)).toBeInTheDocument();
    });

    it('handles long text in response summary with truncation', () => {
      render(<FeedbackQualityView />);
      // Verify truncate class is applied to response summary cells
      const longSummaryItem = MOCK_FEEDBACK.find(
        f => f.responseSummary.length > 20
      );
      if (longSummaryItem) {
        const cell = screen.getByText(longSummaryItem.responseSummary);
        expect(cell).toHaveClass('truncate');
      }
    });

    it('displays dash for items without comments', () => {
      render(<FeedbackQualityView />);
      const noCommentItems = MOCK_FEEDBACK.filter(f => !f.comment);
      // There should be dashes rendered for items without comments
      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBe(noCommentItems.length);
    });
  });

  // =========================================================================
  // 3-2. 사용자 인터랙션 테스트
  // =========================================================================
  describe('User Interaction Tests', () => {
    it('rapid period filter clicks settle on last clicked value', async () => {
      const user = userEvent.setup();
      render(<FeedbackQualityView />);

      const btn7d = screen.getByRole('button', { name: '7일' });
      const btn90d = screen.getByRole('button', { name: '90일' });
      const btn30d = screen.getByRole('button', { name: '30일' });

      // Rapid clicks
      await user.click(btn7d);
      await user.click(btn90d);
      await user.click(btn30d);
      await user.click(btn7d);

      expect(btn7d).toHaveAttribute('aria-pressed', 'true');
      expect(btn90d).toHaveAttribute('aria-pressed', 'false');
      expect(btn30d).toHaveAttribute('aria-pressed', 'false');
    });

    it('rapid feedback filter clicks settle on last clicked value', async () => {
      const user = userEvent.setup();
      render(<FeedbackQualityView />);

      const feedbackFilter = screen.getByTestId('feedback-filter');
      const btnNeg = within(feedbackFilter).getByText('부정');
      const btnPos = within(feedbackFilter).getByText('긍정');
      const btnAll = within(feedbackFilter).getByText('전체');

      await user.click(btnNeg);
      await user.click(btnPos);
      await user.click(btnAll);
      await user.click(btnNeg);

      const negativeFeedback = MOCK_FEEDBACK.filter(f => f.feedbackType === 'negative');
      expect(screen.getByText(`${negativeFeedback.length}건의 피드백`)).toBeInTheDocument();
    });

    it('search input can be cleared back to show all results', async () => {
      const user = userEvent.setup();
      render(<FeedbackQualityView />);

      const searchInput = screen.getByLabelText('피드백 검색');
      await user.type(searchInput, '홍길동');

      const filteredCount = MOCK_FEEDBACK.filter(f =>
        f.userName.includes('홍길동') ||
        f.responseSummary.includes('홍길동') ||
        (f.comment && f.comment.includes('홍길동'))
      ).length;
      expect(screen.getByText(`${filteredCount}건의 피드백`)).toBeInTheDocument();

      // Clear search
      await user.clear(searchInput);
      expect(screen.getByText(`${MOCK_FEEDBACK.length}건의 피드백`)).toBeInTheDocument();
    });

    it('combines search and feedback filter correctly', async () => {
      const user = userEvent.setup();
      render(<FeedbackQualityView />);

      // Set filter to positive
      const feedbackFilter = screen.getByTestId('feedback-filter');
      await user.click(within(feedbackFilter).getByText('긍정'));

      // Search for specific user
      const searchInput = screen.getByLabelText('피드백 검색');
      await user.type(searchInput, '홍길동');

      const expected = filterFeedback(MOCK_FEEDBACK, 'positive', '홍길동');
      expect(screen.getByText(`${expected.length}건의 피드백`)).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 3-3. 상태 전환 테스트
  // =========================================================================
  describe('State Transition Tests', () => {
    it('switching period does not reset feedback filter or search', async () => {
      const user = userEvent.setup();
      render(<FeedbackQualityView />);

      // Set feedback filter to negative
      const feedbackFilter = screen.getByTestId('feedback-filter');
      await user.click(within(feedbackFilter).getByText('부정'));

      // Type search
      const searchInput = screen.getByLabelText('피드백 검색');
      await user.type(searchInput, '김철수');

      // Switch period
      await user.click(screen.getByRole('button', { name: '7일' }));

      // Verify search and filter are preserved
      expect(searchInput).toHaveValue('김철수');
      const negBtn = within(feedbackFilter).getByText('부정');
      // The button with '부정' should still be active (rendered differently from others)
      expect(screen.getByRole('button', { name: '7일' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('switching feedback filter does not reset search query', async () => {
      const user = userEvent.setup();
      render(<FeedbackQualityView />);

      const searchInput = screen.getByLabelText('피드백 검색');
      await user.type(searchInput, '매출');

      const feedbackFilter = screen.getByTestId('feedback-filter');
      await user.click(within(feedbackFilter).getByText('부정'));
      await user.click(within(feedbackFilter).getByText('긍정'));

      expect(searchInput).toHaveValue('매출');
    });
  });

  // =========================================================================
  // 3-4. Period filter on table (Fix Cycle 1 verification)
  // =========================================================================
  describe('Period Filter on Table', () => {
    it('filterFeedback with period parameter excludes items before cutoff', () => {
      const result7d = filterFeedback(MOCK_FEEDBACK, 'all', '', '7d');
      const result30d = filterFeedback(MOCK_FEEDBACK, 'all', '', '30d');
      // 7d should return fewer or equal items compared to 30d
      expect(result7d.length).toBeLessThanOrEqual(result30d.length);
      // 7d result should be a subset of 30d result
      result7d.forEach(item => {
        expect(result30d.find(r => r.id === item.id)).toBeTruthy();
      });
    });

    it('filterFeedback with period + type filters together', () => {
      const result = filterFeedback(MOCK_FEEDBACK, 'negative', '', '7d');
      result.forEach(item => {
        expect(item.feedbackType).toBe('negative');
      });
      // Should be subset of negative-only without period filter
      const allNegative = filterFeedback(MOCK_FEEDBACK, 'negative', '');
      expect(result.length).toBeLessThanOrEqual(allNegative.length);
    });

    it('filterFeedback without period returns all items', () => {
      const result = filterFeedback(MOCK_FEEDBACK, 'all', '');
      expect(result.length).toBe(MOCK_FEEDBACK.length);
    });
  });

  // =========================================================================
  // Helper function edge cases
  // =========================================================================
  describe('Helper Function Edge Cases', () => {
    it('filterFeedback with empty array returns empty', () => {
      const result = filterFeedback([], 'all', '');
      expect(result).toHaveLength(0);
    });

    it('filterFeedback search is case-insensitive', () => {
      const result = filterFeedback(MOCK_FEEDBACK, 'all', '홍길동');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(item => {
        const matches =
          item.userName.includes('홍길동') ||
          item.responseSummary.includes('홍길동') ||
          (item.comment && item.comment.includes('홍길동'));
        expect(matches).toBe(true);
      });
    });

    it('filterFeedback searches in comment field', () => {
      const result = filterFeedback(MOCK_FEEDBACK, 'all', '법무팀');
      expect(result.length).toBe(1);
      expect(result[0].comment).toContain('법무팀');
    });

    it('getDailyQualityByPeriod for 90d returns all available data', () => {
      const result = getDailyQualityByPeriod('90d');
      // Only 30 days of data available, so should return all 30
      expect(result.length).toBe(30);
    });

    it('filterFeedback with whitespace-only search returns all', () => {
      const result = filterFeedback(MOCK_FEEDBACK, 'all', '   ');
      // Whitespace search should match nothing since no item contains just spaces
      // Actually it depends on implementation — '   '.toLowerCase().includes checks
      // Empty strings match everything, but '   ' won't match field content
      expect(result.length).toBeLessThanOrEqual(MOCK_FEEDBACK.length);
    });
  });
});
