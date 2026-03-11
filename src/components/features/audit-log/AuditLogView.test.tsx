/**
 * AuditLogView — Unit Tests
 *
 * Tests for Audit Log component.
 * Uses Vitest + React Testing Library with jsdom environment.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { AuditLogView } from './AuditLogView';
import { MOCK_AUDIT_LOG_ENTRIES } from './auditLogData';

// Mock Radix Dialog (used by Sheet) to avoid portal issues in jsdom
vi.mock('@radix-ui/react-dialog', () => {
  const MockRoot = ({ children, open, onOpenChange }: { children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => (
    open ? <div data-testid="sheet-root">{children}</div> : null
  );
  const MockPortal = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
  const MockOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => <div ref={ref} {...props} />);
  MockOverlay.displayName = 'MockOverlay';
  const MockContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children, ...props }, ref) => (
    <div ref={ref} data-testid="sheet-content" {...props}>{children}</div>
  ));
  MockContent.displayName = 'MockContent';
  const MockClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ children, ...props }, ref) => (
    <button ref={ref} {...props}>{children}</button>
  ));
  MockClose.displayName = 'MockClose';
  const MockTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ children, ...props }, ref) => (
    <h2 ref={ref} {...props}>{children}</h2>
  ));
  MockTitle.displayName = 'MockTitle';
  const MockDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ children, ...props }, ref) => (
    <p ref={ref} {...props}>{children}</p>
  ));
  MockDescription.displayName = 'MockDescription';

  return {
    Root: MockRoot,
    Portal: MockPortal,
    Overlay: MockOverlay,
    Content: MockContent,
    Close: MockClose,
    Title: MockTitle,
    Description: MockDescription,
    Trigger: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  };
});

describe('AuditLogView', () => {
  it('renders without error', () => {
    render(<AuditLogView />);
    expect(screen.getByTestId('audit-log-view')).toBeInTheDocument();
  });

  describe('KPI Summary Bar', () => {
    it('displays 4 KPI metrics', () => {
      render(<AuditLogView />);
      const kpiGrid = screen.getByTestId('audit-log-view').querySelector('.grid.grid-cols-4')!;
      expect(within(kpiGrid as HTMLElement).getByText('총 이벤트')).toBeInTheDocument();
      expect(within(kpiGrid as HTMLElement).getByText('에이전트 액션')).toBeInTheDocument();
      expect(within(kpiGrid as HTMLElement).getByText('경고')).toBeInTheDocument();
      expect(within(kpiGrid as HTMLElement).getByText('최근 24시간')).toBeInTheDocument();
    });

    it('displays KPI values', () => {
      render(<AuditLogView />);
      expect(screen.getByText('2,847')).toBeInTheDocument();
      expect(screen.getByText('1,204')).toBeInTheDocument();
      expect(screen.getByText('23')).toBeInTheDocument();
      expect(screen.getByText('342')).toBeInTheDocument();
    });
  });

  describe('Log Table', () => {
    it('displays 6 column headers', () => {
      render(<AuditLogView />);
      expect(screen.getByText('타임스탬프')).toBeInTheDocument();
      expect(screen.getByText('액터')).toBeInTheDocument();
      expect(screen.getByText('액션')).toBeInTheDocument();
      expect(screen.getByText('리소스')).toBeInTheDocument();
      expect(screen.getByText('결과')).toBeInTheDocument();
      expect(screen.getByText('심각도')).toBeInTheDocument();
    });

    it('renders log entries in the table', () => {
      render(<AuditLogView />);
      // Data rows have role="button" for click handling
      const dataRows = screen.getAllByRole('button', { name: /—/ });
      expect(dataRows.length).toBeGreaterThan(0);
    });
  });

  describe('Search Filter', () => {
    it('filters entries by keyword', async () => {
      const user = userEvent.setup();
      render(<AuditLogView />);

      const searchInput = screen.getByPlaceholderText('액터, 액션, 리소스 검색...');
      await user.type(searchInput, 'SQL');

      // Should show entries matching 'SQL'
      expect(screen.getByText(/SQL/)).toBeInTheDocument();
    });

    it('shows empty state when no results match', async () => {
      const user = userEvent.setup();
      render(<AuditLogView />);

      const searchInput = screen.getByPlaceholderText('액터, 액션, 리소스 검색...');
      await user.type(searchInput, 'xyznonexistent12345');

      expect(screen.getByText('검색 조건에 맞는 로그가 없습니다.')).toBeInTheDocument();
    });
  });

  describe('Detail Drawer', () => {
    it('opens detail drawer when row is clicked', async () => {
      const user = userEvent.setup();
      render(<AuditLogView />);

      // Click the first data row (table rows have role="button")
      const table = screen.getByRole('table');
      const rows = within(table).getAllByRole('button');
      expect(rows.length).toBeGreaterThan(0);

      await user.click(rows[0]);

      // Sheet should show detail content
      expect(screen.getByText('기본 정보')).toBeInTheDocument();
      expect(screen.getByText('상세 설명')).toBeInTheDocument();
    });
  });

  describe('Severity Badge Colors', () => {
    it('renders critical badges with red styling', () => {
      render(<AuditLogView />);
      const criticalBadges = screen.getAllByText('위험');
      criticalBadges.forEach(badge => {
        expect(badge.className).toContain('red');
      });
    });

    it('renders warning badges with amber styling', () => {
      render(<AuditLogView />);
      const warningBadges = screen.getAllByText('경고');
      // Filter to only severity badge elements (exclude KPI card label)
      const severityBadges = warningBadges.filter(el => el.className.includes('border'));
      expect(severityBadges.length).toBeGreaterThan(0);
      severityBadges.forEach(badge => {
        expect(badge.className).toContain('amber');
      });
    });
  });

  describe('Mock Data Validation', () => {
    it('has 50+ entries', () => {
      expect(MOCK_AUDIT_LOG_ENTRIES.length).toBeGreaterThanOrEqual(50);
    });

    it('includes all actor types', () => {
      const actorTypes = new Set(MOCK_AUDIT_LOG_ENTRIES.map(e => e.actor.type));
      expect(actorTypes.has('user')).toBe(true);
      expect(actorTypes.has('agent')).toBe(true);
      expect(actorTypes.has('system')).toBe(true);
    });

    it('includes all severity levels', () => {
      const severities = new Set(MOCK_AUDIT_LOG_ENTRIES.map(e => e.severity));
      expect(severities.has('info')).toBe(true);
      expect(severities.has('warning')).toBe(true);
      expect(severities.has('critical')).toBe(true);
    });

    it('includes all action categories', () => {
      const categories = new Set(MOCK_AUDIT_LOG_ENTRIES.map(e => e.action.category));
      expect(categories.has('data_access')).toBe(true);
      expect(categories.has('settings_change')).toBe(true);
      expect(categories.has('tool_call')).toBe(true);
      expect(categories.has('authentication')).toBe(true);
    });
  });
});
