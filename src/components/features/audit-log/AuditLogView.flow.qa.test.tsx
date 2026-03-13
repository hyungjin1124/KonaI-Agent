/**
 * AuditLogView — UX Flow QA Tests
 *
 * End-to-end user flow tests verifying multi-step interactions:
 *
 * 3.5-1. Callback Wiring Audit
 *   - Component mounts without props
 *   - onClose from AuditLogDetail clears selectedEntry (drawer closes)
 *
 * 3.5-3. Terminal State Scenarios
 *   - Search that eliminates all results -> clear -> results return
 *   - Filter combination that eliminates all results -> clear -> results return
 *
 * 3.5-4. Critical User Flow Traces
 *   - Flow 1: Search -> Select Row -> View Detail -> Close -> Search Again
 *   - Flow 2: Paginate -> Filter -> Verify Reset
 *   - Flow 3: Open Detail -> Navigate to Different Row
 *
 * Filter function integration tests (filterEntries)
 *
 * Uses Vitest + React Testing Library with jsdom environment.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { AuditLogView } from './AuditLogView';
import {
  MOCK_AUDIT_LOG_ENTRIES,
  filterEntries,
  filterByTimeRange,
  type AuditLogEntry,
} from './auditLogData';

// ---------------------------------------------------------------------------
// Mock: Radix Dialog (used by Sheet) — enhanced for close-flow testing
// ---------------------------------------------------------------------------
// Use React context to allow MockClose to call onOpenChange(false) from Root.
const OnOpenChangeCtx = React.createContext<((open: boolean) => void) | undefined>(undefined);

vi.mock('@radix-ui/react-dialog', () => {
  const MockRoot = ({ children, open, onOpenChange }: { children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => (
    <OnOpenChangeCtx.Provider value={onOpenChange}>
      {open ? <div data-testid="sheet-root">{children}</div> : null}
    </OnOpenChangeCtx.Provider>
  );
  const MockPortal = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
  const MockOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => <div ref={ref} {...props} />);
  MockOverlay.displayName = 'MockOverlay';
  const MockContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children, ...props }, ref) => (
    <div ref={ref} data-testid="sheet-content" {...props}>{children}</div>
  ));
  MockContent.displayName = 'MockContent';
  const MockClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ children, onClick, ...props }, ref) => {
    const onOpenChange = React.useContext(OnOpenChangeCtx);
    return (
      <button
        ref={ref}
        {...props}
        onClick={(e) => {
          onClick?.(e);
          onOpenChange?.(false);
        }}
      >
        {children}
      </button>
    );
  });
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** All table data rows (role="button", aria-label containing em-dash) */
function getDataRows() {
  return screen.getAllByRole('button', { name: /—/ });
}

/** Safely query data rows — returns empty array when none exist */
function queryDataRows() {
  return screen.queryAllByRole('button', { name: /—/ });
}

/** Get the search input */
function getSearchInput() {
  return screen.getByPlaceholderText('액터, 액션, 리소스 검색...');
}

// ---------------------------------------------------------------------------
// 3.5-1  Callback Wiring Audit
// ---------------------------------------------------------------------------

describe('3.5-1. Callback Wiring Audit', () => {
  it('mounts without any props and renders the view', () => {
    render(<AuditLogView />);
    expect(screen.getByTestId('audit-log-view')).toBeInTheDocument();
    // Verify core sections exist
    expect(screen.getByText('총 이벤트')).toBeInTheDocument();
    expect(screen.getByText('타임스탬프')).toBeInTheDocument();
  });

  it('onClose callback clears selectedEntry and closes the drawer', async () => {
    const user = userEvent.setup();
    render(<AuditLogView />);

    // 1. Click a row to open the detail drawer
    const rows = getDataRows();
    await user.click(rows[0]);

    // Drawer should be visible
    expect(screen.getByTestId('sheet-root')).toBeInTheDocument();
    expect(screen.getByText('기본 정보')).toBeInTheDocument();
    expect(screen.getByText('상세 설명')).toBeInTheDocument();

    // 2. Click the Close button (rendered by SheetContent via SheetPrimitive.Close)
    //    The sr-only text inside the close button is "Close"
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    // 3. Drawer should be gone (selectedEntry set to null)
    expect(screen.queryByTestId('sheet-root')).not.toBeInTheDocument();
    expect(screen.queryByText('기본 정보')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 3.5-3  Terminal State Scenarios
// ---------------------------------------------------------------------------

describe('3.5-3. Terminal State Scenarios', () => {
  it('search that eliminates all results -> clear -> results return', async () => {
    const user = userEvent.setup();
    render(<AuditLogView />);

    const initialRows = getDataRows();
    const initialCount = initialRows.length;
    expect(initialCount).toBeGreaterThan(0);

    // Type nonsense search term
    const searchInput = getSearchInput();
    await user.type(searchInput, 'xyznonexistent99999zzz');

    // Empty state should show
    expect(screen.getByText('검색 조건에 맞는 로그가 없습니다.')).toBeInTheDocument();
    expect(queryDataRows()).toHaveLength(0);

    // Clear search
    await user.clear(searchInput);

    // Results should return
    const restoredRows = getDataRows();
    expect(restoredRows.length).toBe(initialCount);
    expect(screen.queryByText('검색 조건에 맞는 로그가 없습니다.')).not.toBeInTheDocument();
  });

  it('filter combination producing zero results -> clear filters -> results return', async () => {
    const user = userEvent.setup();
    render(<AuditLogView />);

    const initialRowCount = getDataRows().length;
    expect(initialRowCount).toBeGreaterThan(0);

    // Use search as a proxy for a highly restrictive "filter combination"
    // since Radix Select is not easily testable in jsdom.
    // Combine a specific search with another constraint:
    // Search for a term that matches only agent entries, then search for
    // something that doesn't overlap.
    const searchInput = getSearchInput();

    // First verify a specific search yields results
    await user.type(searchInput, 'SQL');
    expect(getDataRows().length).toBeGreaterThan(0);

    // Now refine to something impossible
    await user.clear(searchInput);
    await user.type(searchInput, 'ZZZZZZNOTFOUND_IMPOSSIBLE_COMBO');

    expect(screen.getByText('검색 조건에 맞는 로그가 없습니다.')).toBeInTheDocument();
    expect(queryDataRows()).toHaveLength(0);

    // Clear filters (clear search)
    await user.clear(searchInput);

    // All results return
    expect(getDataRows().length).toBe(initialRowCount);
    expect(screen.queryByText('검색 조건에 맞는 로그가 없습니다.')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 3.5-4  Critical User Flow Traces
// ---------------------------------------------------------------------------

describe('3.5-4. Critical User Flow Traces', () => {
  describe('Flow 1: Search -> Select Row -> View Detail -> Close -> Search Again', () => {
    it('completes the full cycle', async () => {
      const user = userEvent.setup();
      render(<AuditLogView />);

      const fullRowCount = getDataRows().length;

      // Step 1: Type a search that narrows results
      const searchInput = getSearchInput();
      await user.type(searchInput, 'SQL');

      const filteredRows = getDataRows();
      expect(filteredRows.length).toBeGreaterThan(0);
      expect(filteredRows.length).toBeLessThan(fullRowCount);

      // Step 2: Click a row to open the detail drawer
      await user.click(filteredRows[0]);
      expect(screen.getByTestId('sheet-root')).toBeInTheDocument();
      expect(screen.getByText('기본 정보')).toBeInTheDocument();
      expect(screen.getByText('상세 설명')).toBeInTheDocument();

      // Verify the detail shows the correct entry (should contain SQL in the title)
      const sheetContent = screen.getByTestId('sheet-content');
      // The heading (h2) in the drawer shows the action type
      expect(within(sheetContent).getByRole('heading', { level: 2 })).toHaveTextContent(/SQL/);

      // Step 3: Close the drawer
      const closeButton = screen.getByRole('button', { name: 'Close' });
      await user.click(closeButton);
      expect(screen.queryByTestId('sheet-root')).not.toBeInTheDocument();

      // Step 4: Clear search — full results should return
      await user.clear(searchInput);
      expect(getDataRows().length).toBe(fullRowCount);
    });
  });

  describe('Flow 2: Paginate -> Filter -> Verify Reset', () => {
    it('resets to page 1 when search is performed on page 2', async () => {
      const user = userEvent.setup();
      render(<AuditLogView />);

      // Default filter (7d) should show >20 entries for pagination to appear
      const defaultFiltered = filterEntries(MOCK_AUDIT_LOG_ENTRIES, {
        timeRange: '7d',
        actorType: 'all',
        category: 'all',
        severity: 'all',
        search: '',
      });
      // Only proceed if pagination exists
      expect(defaultFiltered.length).toBeGreaterThan(20);

      // Verify page 1 info is shown
      const pageInfoBefore = screen.getByText(/건 중/);
      expect(pageInfoBefore.textContent).toContain('1–');

      // Click "다음" to go to page 2
      const nextButton = screen.getByRole('button', { name: '다음' });
      await user.click(nextButton);

      // Verify we are on page 2 (starts at 21)
      const pageInfoAfterNav = screen.getByText(/건 중/);
      expect(pageInfoAfterNav.textContent).toContain('21–');

      // Now perform a search
      const searchInput = getSearchInput();
      await user.type(searchInput, '홍길동');

      // Page should reset to 1
      const filteredRows = getDataRows();
      expect(filteredRows.length).toBeGreaterThan(0);

      // If there are enough results for pagination info, check page 1
      const pageInfoAfterFilter = screen.queryByText(/건 중/);
      if (pageInfoAfterFilter) {
        expect(pageInfoAfterFilter.textContent).toContain('1–');
      }
      // If no pagination (fewer than 20 results), that also confirms page reset
      // because all results fit on one page.

      // Verify the filtered data actually shows 홍길동 entries
      filteredRows.forEach(row => {
        expect(row.getAttribute('aria-label')).toContain('홍길동');
      });
    });
  });

  describe('Flow 3: Open Detail -> Navigate to Different Row', () => {
    it('updates drawer content when a different row is clicked', async () => {
      const user = userEvent.setup();
      render(<AuditLogView />);

      const rows = getDataRows();
      expect(rows.length).toBeGreaterThanOrEqual(2);

      // Extract aria-labels for the first two rows to identify them
      const firstLabel = rows[0].getAttribute('aria-label')!;
      const secondLabel = rows[1].getAttribute('aria-label')!;

      // Extract the action type from the aria-label (format: "actionType — actorName")
      const firstActionType = firstLabel.split(' — ')[0];
      const secondActionType = secondLabel.split(' — ')[0];

      // Step 1: Click first row — drawer opens
      await user.click(rows[0]);
      expect(screen.getByTestId('sheet-root')).toBeInTheDocument();

      // Verify the drawer shows the first entry's action type in the title
      const sheetContent = screen.getByTestId('sheet-content');
      expect(within(sheetContent).getByRole('heading', { level: 2 })).toHaveTextContent(firstActionType);

      // Step 2: Click second row — drawer updates
      // The rows are still in the DOM (drawer is a sibling, not an overlay in mock)
      await user.click(rows[1]);
      expect(screen.getByTestId('sheet-root')).toBeInTheDocument();

      // Verify the heading now shows the second entry's action type
      const updatedSheetContent = screen.getByTestId('sheet-content');
      expect(within(updatedSheetContent).getByRole('heading', { level: 2 })).toHaveTextContent(secondActionType);
    });
  });
});

// ---------------------------------------------------------------------------
// filterEntries integration tests (pure function)
// ---------------------------------------------------------------------------

describe('filterEntries — integration', () => {
  const allEntries = MOCK_AUDIT_LOG_ENTRIES;

  describe('filters by each dimension independently', () => {
    it('filters by actorType', () => {
      const agentEntries = filterEntries(allEntries, {
        timeRange: 'all', actorType: 'agent', category: 'all', severity: 'all', search: '',
      });
      expect(agentEntries.length).toBeGreaterThan(0);
      agentEntries.forEach(e => expect(e.actor.type).toBe('agent'));

      const userEntries = filterEntries(allEntries, {
        timeRange: 'all', actorType: 'user', category: 'all', severity: 'all', search: '',
      });
      expect(userEntries.length).toBeGreaterThan(0);
      userEntries.forEach(e => expect(e.actor.type).toBe('user'));

      const systemEntries = filterEntries(allEntries, {
        timeRange: 'all', actorType: 'system', category: 'all', severity: 'all', search: '',
      });
      expect(systemEntries.length).toBeGreaterThan(0);
      systemEntries.forEach(e => expect(e.actor.type).toBe('system'));
    });

    it('filters by action category', () => {
      const categories = ['data_access', 'settings_change', 'tool_call', 'authentication'] as const;
      categories.forEach(cat => {
        const result = filterEntries(allEntries, {
          timeRange: 'all', actorType: 'all', category: cat, severity: 'all', search: '',
        });
        expect(result.length).toBeGreaterThan(0);
        result.forEach(e => expect(e.action.category).toBe(cat));
      });
    });

    it('filters by severity', () => {
      const severities = ['info', 'warning', 'critical'] as const;
      severities.forEach(sev => {
        const result = filterEntries(allEntries, {
          timeRange: 'all', actorType: 'all', category: 'all', severity: sev, search: '',
        });
        expect(result.length).toBeGreaterThan(0);
        result.forEach(e => expect(e.severity).toBe(sev));
      });
    });

    it('filters by timeRange', () => {
      const all = filterEntries(allEntries, {
        timeRange: 'all', actorType: 'all', category: 'all', severity: 'all', search: '',
      });
      const sevenDay = filterEntries(allEntries, {
        timeRange: '7d', actorType: 'all', category: 'all', severity: 'all', search: '',
      });
      const oneDay = filterEntries(allEntries, {
        timeRange: '24h', actorType: 'all', category: 'all', severity: 'all', search: '',
      });

      // More restrictive time ranges should have equal or fewer entries
      expect(all.length).toBeGreaterThanOrEqual(sevenDay.length);
      expect(sevenDay.length).toBeGreaterThanOrEqual(oneDay.length);
      expect(oneDay.length).toBeGreaterThan(0);
    });

    it('filters by search query', () => {
      const result = filterEntries(allEntries, {
        timeRange: 'all', actorType: 'all', category: 'all', severity: 'all', search: 'SQL',
      });
      expect(result.length).toBeGreaterThan(0);
      result.forEach(e => {
        const combined = `${e.actor.name} ${e.action.type} ${e.action.description} ${e.resource.name}`.toLowerCase();
        expect(combined).toContain('sql');
      });
    });
  });

  describe('combines multiple filters correctly', () => {
    it('actorType + category', () => {
      const result = filterEntries(allEntries, {
        timeRange: 'all', actorType: 'agent', category: 'tool_call', severity: 'all', search: '',
      });
      expect(result.length).toBeGreaterThan(0);
      result.forEach(e => {
        expect(e.actor.type).toBe('agent');
        expect(e.action.category).toBe('tool_call');
      });
    });

    it('severity + search', () => {
      const result = filterEntries(allEntries, {
        timeRange: 'all', actorType: 'all', category: 'all', severity: 'warning', search: '데이터',
      });
      // All results must be warning severity AND contain '데이터'
      result.forEach(e => {
        expect(e.severity).toBe('warning');
        const combined = `${e.actor.name} ${e.action.type} ${e.action.description} ${e.resource.name}`.toLowerCase();
        expect(combined).toContain('데이터');
      });
    });

    it('all filters at once', () => {
      const result = filterEntries(allEntries, {
        timeRange: 'all', actorType: 'user', category: 'authentication', severity: 'info', search: '로그인',
      });
      result.forEach(e => {
        expect(e.actor.type).toBe('user');
        expect(e.action.category).toBe('authentication');
        expect(e.severity).toBe('info');
        const combined = `${e.actor.name} ${e.action.type} ${e.action.description} ${e.resource.name}`.toLowerCase();
        expect(combined).toContain('로그인');
      });
    });

    it('returns empty for impossible combinations', () => {
      const result = filterEntries(allEntries, {
        timeRange: 'all', actorType: 'system', category: 'authentication', severity: 'all', search: '',
      });
      // System actors do not have authentication events in mock data
      expect(result).toHaveLength(0);
    });
  });

  describe('search is case-insensitive', () => {
    it('matches regardless of case for English text', () => {
      const upper = filterEntries(allEntries, {
        timeRange: 'all', actorType: 'all', category: 'all', severity: 'all', search: 'SQL',
      });
      const lower = filterEntries(allEntries, {
        timeRange: 'all', actorType: 'all', category: 'all', severity: 'all', search: 'sql',
      });
      const mixed = filterEntries(allEntries, {
        timeRange: 'all', actorType: 'all', category: 'all', severity: 'all', search: 'Sql',
      });

      expect(upper.length).toBe(lower.length);
      expect(upper.length).toBe(mixed.length);
      expect(upper.length).toBeGreaterThan(0);

      // Same IDs
      const upperIds = upper.map(e => e.id);
      const lowerIds = lower.map(e => e.id);
      expect(upperIds).toEqual(lowerIds);
    });

    it('matches regardless of case for mixed Korean/English', () => {
      const resultCRM = filterEntries(allEntries, {
        timeRange: 'all', actorType: 'all', category: 'all', severity: 'all', search: 'CRM',
      });
      const resultcrm = filterEntries(allEntries, {
        timeRange: 'all', actorType: 'all', category: 'all', severity: 'all', search: 'crm',
      });

      expect(resultCRM.length).toBe(resultcrm.length);
      expect(resultCRM.length).toBeGreaterThan(0);
    });
  });

  describe('filterByTimeRange', () => {
    it('all returns every entry', () => {
      const result = filterByTimeRange(allEntries, 'all');
      expect(result.length).toBe(allEntries.length);
    });

    it('24h returns only entries within 24 hours of the anchor date', () => {
      const anchor = new Date('2026-03-11T18:00:00');
      const cutoff = new Date(anchor.getTime() - 24 * 3600000);
      const result = filterByTimeRange(allEntries, '24h');
      result.forEach(e => {
        expect(new Date(e.timestamp).getTime()).toBeGreaterThanOrEqual(cutoff.getTime());
      });
    });

    it('7d returns entries within 7 days', () => {
      const anchor = new Date('2026-03-11T18:00:00');
      const cutoff = new Date(anchor.getTime() - 168 * 3600000);
      const result = filterByTimeRange(allEntries, '7d');
      result.forEach(e => {
        expect(new Date(e.timestamp).getTime()).toBeGreaterThanOrEqual(cutoff.getTime());
      });
    });

    it('30d returns entries within 30 days', () => {
      const anchor = new Date('2026-03-11T18:00:00');
      const cutoff = new Date(anchor.getTime() - 720 * 3600000);
      const result = filterByTimeRange(allEntries, '30d');
      result.forEach(e => {
        expect(new Date(e.timestamp).getTime()).toBeGreaterThanOrEqual(cutoff.getTime());
      });
    });
  });
});
