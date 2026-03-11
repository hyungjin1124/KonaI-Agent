/**
 * FeedbackQualityView — Unit Tests
 *
 * Tests for Feedback & Quality Management dashboard.
 * Uses Vitest + React Testing Library with jsdom environment.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { FeedbackQualityView } from './FeedbackQualityView';
import {
  QUALITY_KPI,
  MOCK_FEEDBACK,
  PERIOD_OPTIONS,
  FEEDBACK_FILTER_OPTIONS,
  filterFeedback,
  getDailyQualityByPeriod,
} from './feedbackQualityData';

// Mock Recharts to avoid canvas/SVG rendering issues in jsdom
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

describe('FeedbackQualityView', () => {
  it('renders without error', () => {
    render(<FeedbackQualityView />);
    expect(screen.getByTestId('feedback-quality-view')).toBeInTheDocument();
  });

  describe('KPI Cards', () => {
    it('displays 4 KPI cards', () => {
      render(<FeedbackQualityView />);
      const kpiSection = screen.getByTestId('kpi-cards');
      expect(kpiSection).toBeInTheDocument();
    });

    it('shows satisfaction rate', () => {
      render(<FeedbackQualityView />);
      expect(screen.getByText(`${QUALITY_KPI.satisfactionRate}%`)).toBeInTheDocument();
    });

    it('shows good quality rate', () => {
      render(<FeedbackQualityView />);
      expect(screen.getByText(`${QUALITY_KPI.goodQualityRate}%`)).toBeInTheDocument();
    });

    it('shows total feedback count', () => {
      render(<FeedbackQualityView />);
      expect(screen.getByText(QUALITY_KPI.totalFeedback.toLocaleString())).toBeInTheDocument();
    });

    it('shows unresolved rate', () => {
      render(<FeedbackQualityView />);
      expect(screen.getByText(`${QUALITY_KPI.unresolvedRate}%`)).toBeInTheDocument();
    });
  });

  describe('Period Filter', () => {
    it('displays period filter buttons', () => {
      render(<FeedbackQualityView />);
      const periodFilter = screen.getByTestId('period-filter');
      PERIOD_OPTIONS.forEach(opt => {
        expect(within(periodFilter).getByText(opt.label)).toBeInTheDocument();
      });
    });

    it('30d is selected by default', () => {
      render(<FeedbackQualityView />);
      const btn30d = screen.getByRole('button', { name: '30일' });
      expect(btn30d).toHaveAttribute('aria-pressed', 'true');
    });

    it('changes period on click', async () => {
      const user = userEvent.setup();
      render(<FeedbackQualityView />);

      const btn7d = screen.getByRole('button', { name: '7일' });
      await user.click(btn7d);
      expect(btn7d).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Quality Trend Chart', () => {
    it('displays chart container', () => {
      render(<FeedbackQualityView />);
      expect(screen.getByTestId('quality-chart')).toBeInTheDocument();
    });

    it('renders Recharts LineChart', () => {
      render(<FeedbackQualityView />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('Feedback Table', () => {
    it('displays feedback items', () => {
      render(<FeedbackQualityView />);
      // Check first feedback item user name (may appear multiple times)
      const userNames = screen.getAllByText(MOCK_FEEDBACK[0].userName);
      expect(userNames.length).toBeGreaterThanOrEqual(1);
    });

    it('displays feedback type badges', () => {
      render(<FeedbackQualityView />);
      // There should be both positive and negative badges
      const positiveBadges = screen.getAllByText('긍정');
      const negativeBadges = screen.getAllByText('부정');
      expect(positiveBadges.length).toBeGreaterThanOrEqual(1);
      expect(negativeBadges.length).toBeGreaterThanOrEqual(1);
    });

    it('displays status badges', () => {
      render(<FeedbackQualityView />);
      const reviewedBadges = screen.getAllByText('검토됨');
      expect(reviewedBadges.length).toBeGreaterThanOrEqual(1);
    });

    it('displays comments where present', () => {
      render(<FeedbackQualityView />);
      const itemWithComment = MOCK_FEEDBACK.find(f => f.comment);
      if (itemWithComment?.comment) {
        expect(screen.getByText(itemWithComment.comment)).toBeInTheDocument();
      }
    });

    it('shows feedback count footer', () => {
      render(<FeedbackQualityView />);
      expect(screen.getByText(`${MOCK_FEEDBACK.length}건의 피드백`)).toBeInTheDocument();
    });
  });

  describe('Feedback Filter', () => {
    it('displays feedback filter buttons', () => {
      render(<FeedbackQualityView />);
      const feedbackFilter = screen.getByTestId('feedback-filter');
      FEEDBACK_FILTER_OPTIONS.forEach(opt => {
        expect(within(feedbackFilter).getByText(opt.label)).toBeInTheDocument();
      });
    });

    it('filters to negative only', async () => {
      const user = userEvent.setup();
      render(<FeedbackQualityView />);

      // Click the "부정" filter in the feedback filter group
      const feedbackFilter = screen.getByTestId('feedback-filter');
      await user.click(within(feedbackFilter).getByText('부정'));

      // Now only negative feedback items should show
      const negativeFeedback = MOCK_FEEDBACK.filter(f => f.feedbackType === 'negative');
      expect(screen.getByText(`${negativeFeedback.length}건의 피드백`)).toBeInTheDocument();
    });
  });

  describe('Search', () => {
    it('displays search input', () => {
      render(<FeedbackQualityView />);
      expect(screen.getByLabelText('피드백 검색')).toBeInTheDocument();
    });
  });

  describe('Helper Functions', () => {
    it('filterFeedback filters by type', () => {
      const result = filterFeedback(MOCK_FEEDBACK, 'negative', '');
      result.forEach(item => expect(item.feedbackType).toBe('negative'));
    });

    it('filterFeedback filters by search', () => {
      const result = filterFeedback(MOCK_FEEDBACK, 'all', '홍길동');
      result.forEach(item => expect(item.userName).toBe('홍길동'));
    });

    it('filterFeedback returns all when no filters', () => {
      const result = filterFeedback(MOCK_FEEDBACK, 'all', '');
      expect(result.length).toBe(MOCK_FEEDBACK.length);
    });

    it('getDailyQualityByPeriod returns correct count for 7d', () => {
      const result = getDailyQualityByPeriod('7d');
      expect(result.length).toBe(7);
    });

    it('getDailyQualityByPeriod returns correct count for 30d', () => {
      const result = getDailyQualityByPeriod('30d');
      expect(result.length).toBe(30);
    });
  });

  describe('Mock Data Validation', () => {
    it('has at least 20 feedback items', () => {
      expect(MOCK_FEEDBACK.length).toBeGreaterThanOrEqual(20);
    });

    it('each feedback item has required fields', () => {
      MOCK_FEEDBACK.forEach(item => {
        expect(item.id).toBeTruthy();
        expect(item.date).toBeTruthy();
        expect(item.userName).toBeTruthy();
        expect(item.responseSummary).toBeTruthy();
        expect(['positive', 'negative']).toContain(item.feedbackType);
        expect(['reviewed', 'pending', 'resolved']).toContain(item.status);
      });
    });

    it('has both positive and negative feedback', () => {
      const positive = MOCK_FEEDBACK.filter(f => f.feedbackType === 'positive');
      const negative = MOCK_FEEDBACK.filter(f => f.feedbackType === 'negative');
      expect(positive.length).toBeGreaterThan(0);
      expect(negative.length).toBeGreaterThan(0);
    });

    it('KPI has all required fields', () => {
      expect(QUALITY_KPI.satisfactionRate).toBeGreaterThan(0);
      expect(QUALITY_KPI.goodQualityRate).toBeGreaterThan(0);
      expect(QUALITY_KPI.totalFeedback).toBeGreaterThan(0);
      expect(QUALITY_KPI.unresolvedRate).toBeGreaterThanOrEqual(0);
    });
  });
});
