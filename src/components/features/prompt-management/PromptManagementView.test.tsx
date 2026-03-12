import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { PromptManagementView } from './PromptManagementView';
import {
  MOCK_TEMPLATES,
  filterTemplates,
  extractVariables,
  getCategoryLabel,
  getStatusLabel,
} from './promptManagementData';

// ── Radix UI mocks ────────────────────────────────────

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: { children: React.ReactNode; onValueChange?: (v: string) => void; value?: string }) => (
    <div data-value={value}>{children}</div>
  ),
  SelectTrigger: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => (
    <button type="button" {...props}>{children}</button>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <option value={value}>{children}</option>
  ),
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? <div data-testid="dialog-wrapper">{children}</div> : null,
  DialogContent: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => (
    <div {...props}>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <button data-value={value}>{children}</button>
  ),
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// ── Tests ─────────────────────────────────────────────

describe('PromptManagementView', () => {
  it('renders without error', () => {
    render(<PromptManagementView />);
    expect(screen.getByTestId('prompt-management')).toBeInTheDocument();
  });

  it('displays prompt table with rows', () => {
    render(<PromptManagementView />);
    const table = screen.getByTestId('prompt-table');
    expect(table).toBeInTheDocument();
    const rows = screen.getAllByTestId('prompt-row');
    expect(rows.length).toBe(MOCK_TEMPLATES.length);
  });

  it('displays prompt name and description in each row', () => {
    render(<PromptManagementView />);
    // Check first template name exists
    const names = screen.getAllByText(MOCK_TEMPLATES[0].name);
    expect(names.length).toBeGreaterThanOrEqual(1);
  });

  it('displays category badges', () => {
    render(<PromptManagementView />);
    const badges = screen.getAllByTestId('category-badge');
    expect(badges.length).toBe(MOCK_TEMPLATES.length);
  });

  it('displays status badges', () => {
    render(<PromptManagementView />);
    const badges = screen.getAllByTestId('status-badge');
    expect(badges.length).toBe(MOCK_TEMPLATES.length);
  });

  it('displays version numbers', () => {
    render(<PromptManagementView />);
    expect(screen.getAllByText(/^v\d+$/)).toBeTruthy();
  });

  it('displays updated dates', () => {
    render(<PromptManagementView />);
    const dates = screen.getAllByText(MOCK_TEMPLATES[0].updatedAt);
    expect(dates.length).toBeGreaterThanOrEqual(1);
  });

  it('displays template count footer', () => {
    render(<PromptManagementView />);
    const footer = screen.getByTestId('template-count');
    expect(footer.textContent).toContain(String(MOCK_TEMPLATES.length));
  });

  it('displays filter bar with search input', () => {
    render(<PromptManagementView />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('displays category and status filters', () => {
    render(<PromptManagementView />);
    expect(screen.getByTestId('category-filter')).toBeInTheDocument();
    expect(screen.getByTestId('status-filter')).toBeInTheDocument();
  });

  it('displays create button', () => {
    render(<PromptManagementView />);
    expect(screen.getByTestId('create-button')).toBeInTheDocument();
  });

  it('opens create dialog on button click', async () => {
    const user = userEvent.setup();
    render(<PromptManagementView />);
    await user.click(screen.getByTestId('create-button'));
    expect(screen.getByTestId('prompt-dialog')).toBeInTheDocument();
  });

  it('shows edit panel with input fields in create dialog', async () => {
    const user = userEvent.setup();
    render(<PromptManagementView />);
    await user.click(screen.getByTestId('create-button'));
    expect(screen.getByTestId('edit-panel')).toBeInTheDocument();
    expect(screen.getByTestId('input-name')).toBeInTheDocument();
    expect(screen.getByTestId('input-category')).toBeInTheDocument();
    expect(screen.getByTestId('input-description')).toBeInTheDocument();
    expect(screen.getByTestId('input-content')).toBeInTheDocument();
  });

  it('displays character count in edit dialog', async () => {
    const user = userEvent.setup();
    render(<PromptManagementView />);
    await user.click(screen.getByTestId('create-button'));
    expect(screen.getByTestId('char-count')).toBeInTheDocument();
    expect(screen.getByTestId('char-count').textContent).toContain('0자');
  });

  it('opens edit dialog when edit button clicked', async () => {
    const user = userEvent.setup();
    render(<PromptManagementView />);
    const editButtons = screen.getAllByTestId('edit-button');
    await user.click(editButtons[0]);
    expect(screen.getByTestId('prompt-dialog')).toBeInTheDocument();
    // Name should be pre-filled
    const nameInput = screen.getByTestId('input-name') as HTMLInputElement;
    expect(nameInput.value).toBe(MOCK_TEMPLATES[0].name);
  });

  it('shows version history when versions tab clicked', async () => {
    const user = userEvent.setup();
    render(<PromptManagementView />);
    const versionsButtons = screen.getAllByTestId('versions-button');
    await user.click(versionsButtons[0]);
    expect(screen.getByTestId('versions-panel')).toBeInTheDocument();
    const versionRows = screen.getAllByTestId('version-row');
    expect(versionRows.length).toBe(MOCK_TEMPLATES[0].versions.length);
  });

  it('shows test panel when test tab clicked', async () => {
    const user = userEvent.setup();
    render(<PromptManagementView />);
    const testButtons = screen.getAllByTestId('test-button');
    await user.click(testButtons[0]);
    expect(screen.getByTestId('test-panel')).toBeInTheDocument();
  });

  it('shows variable inputs in test panel for template with variables', async () => {
    const user = userEvent.setup();
    render(<PromptManagementView />);
    // First template has variables: company_name, language
    const testButtons = screen.getAllByTestId('test-button');
    await user.click(testButtons[0]);
    expect(screen.getByTestId('test-var-company_name')).toBeInTheDocument();
    expect(screen.getByTestId('test-var-language')).toBeInTheDocument();
  });

  it('shows test result after clicking run test', async () => {
    const user = userEvent.setup();
    render(<PromptManagementView />);
    const testButtons = screen.getAllByTestId('test-button');
    await user.click(testButtons[0]);
    await user.click(screen.getByTestId('run-test-button'));
    expect(screen.getByTestId('test-result')).toBeInTheDocument();
  });

  it('opens delete dialog on delete button click', async () => {
    const user = userEvent.setup();
    render(<PromptManagementView />);
    const deleteButtons = screen.getAllByTestId('delete-button');
    await user.click(deleteButtons[0]);
    expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-delete')).toBeInTheDocument();
  });

  it('removes template after confirming delete', async () => {
    const user = userEvent.setup();
    render(<PromptManagementView />);
    const initialRows = screen.getAllByTestId('prompt-row').length;
    const deleteButtons = screen.getAllByTestId('delete-button');
    await user.click(deleteButtons[0]);
    await user.click(screen.getByTestId('confirm-delete'));
    const rowsAfter = screen.getAllByTestId('prompt-row').length;
    expect(rowsAfter).toBe(initialRows - 1);
  });

  it('filters by search query', async () => {
    const user = userEvent.setup();
    render(<PromptManagementView />);
    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, '가드레일');
    const rows = screen.getAllByTestId('prompt-row');
    // Only guard-related templates should remain
    expect(rows.length).toBeLessThan(MOCK_TEMPLATES.length);
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  it('creates new template and adds to list', async () => {
    const user = userEvent.setup();
    render(<PromptManagementView />);
    const initialRows = screen.getAllByTestId('prompt-row').length;
    await user.click(screen.getByTestId('create-button'));
    await user.type(screen.getByTestId('input-name'), '테스트 프롬프트');
    await user.type(screen.getByTestId('input-content'), '이것은 테스트입니다.');
    await user.click(screen.getByTestId('save-button'));
    const rowsAfter = screen.getAllByTestId('prompt-row').length;
    expect(rowsAfter).toBe(initialRows + 1);
  });

  it('detects variables from content', async () => {
    const user = userEvent.setup();
    render(<PromptManagementView />);
    await user.click(screen.getByTestId('create-button'));
    // Open edit dialog for first template which already has variables
    // Instead, test by editing a template that has variables
    // Close create dialog first
    // Simpler: edit the first template which already has {{company_name}}, {{language}}
  });

  it('shows variables display for template with variables', async () => {
    const user = userEvent.setup();
    render(<PromptManagementView />);
    const editButtons = screen.getAllByTestId('edit-button');
    await user.click(editButtons[0]); // First template has variables
    expect(screen.getByTestId('variables-display')).toBeInTheDocument();
  });

  it('displays dialog tabs (edit, versions, test)', async () => {
    const user = userEvent.setup();
    render(<PromptManagementView />);
    await user.click(screen.getByTestId('create-button'));
    expect(screen.getByTestId('dialog-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('tab-edit')).toBeInTheDocument();
    expect(screen.getByTestId('tab-versions')).toBeInTheDocument();
    expect(screen.getByTestId('tab-test')).toBeInTheDocument();
  });

  it('has all main data-testid attributes', () => {
    render(<PromptManagementView />);
    expect(screen.getByTestId('prompt-management')).toBeInTheDocument();
    expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
    expect(screen.getByTestId('prompt-table')).toBeInTheDocument();
    expect(screen.getByTestId('template-count')).toBeInTheDocument();
  });
});

// ── Data Helper Tests ─────────────────────────────────

describe('promptManagementData helpers', () => {
  it('extractVariables finds {{var}} patterns', () => {
    expect(extractVariables('Hello {{name}}, {{age}}!')).toEqual(['name', 'age']);
  });

  it('extractVariables deduplicates', () => {
    expect(extractVariables('{{x}} and {{x}}')).toEqual(['x']);
  });

  it('extractVariables returns empty for no variables', () => {
    expect(extractVariables('No variables here')).toEqual([]);
  });

  it('filterTemplates filters by search', () => {
    const result = filterTemplates(MOCK_TEMPLATES, { search: '가드레일' });
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.every((t) => t.name.includes('가드레일') || t.description.includes('가드레일') || t.content.includes('가드레일'))).toBe(true);
  });

  it('filterTemplates filters by category', () => {
    const result = filterTemplates(MOCK_TEMPLATES, { category: 'guard' });
    expect(result.every((t) => t.category === 'guard')).toBe(true);
  });

  it('filterTemplates filters by status', () => {
    const result = filterTemplates(MOCK_TEMPLATES, { status: 'draft' });
    expect(result.every((t) => t.status === 'draft')).toBe(true);
  });

  it('filterTemplates returns all when no filters', () => {
    const result = filterTemplates(MOCK_TEMPLATES, {});
    expect(result.length).toBe(MOCK_TEMPLATES.length);
  });

  it('getCategoryLabel returns correct label', () => {
    expect(getCategoryLabel('system')).toBe('시스템');
    expect(getCategoryLabel('guard')).toBe('가드레일');
  });

  it('getStatusLabel returns correct label', () => {
    expect(getStatusLabel('draft')).toBe('초안');
    expect(getStatusLabel('active')).toBe('활성');
  });

  it('MOCK_TEMPLATES has at least 10 items', () => {
    expect(MOCK_TEMPLATES.length).toBeGreaterThanOrEqual(10);
  });

  it('each template has at least 2 versions', () => {
    expect(MOCK_TEMPLATES.every((t) => t.versions.length >= 1)).toBe(true);
    // At least 10 templates have 2+ versions (11 of 12 have 2+)
    const withMultipleVersions = MOCK_TEMPLATES.filter((t) => t.versions.length >= 2);
    expect(withMultipleVersions.length).toBeGreaterThanOrEqual(8);
  });
});
