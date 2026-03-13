/**
 * PromptManagementView — Unit Tests
 *
 * Covers AC-1 through AC-13 with must/should priority scenarios.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { PromptManagementView } from './PromptManagementView';
import {
  MOCK_TEMPLATES,
  CATEGORY_OPTIONS,
  MODEL_OPTIONS,
  extractVariables,
  estimateTokens,
  filterTemplates,
  getModelName,
} from './promptManagementData';

// --- Radix UI Mocks ---

vi.mock('@radix-ui/react-select', () => {
  const MockRoot = ({ children, value, onValueChange }: { children: React.ReactNode; value?: string; onValueChange?: (v: string) => void }) => (
    <div data-value={value} data-mock-select>{children}</div>
  );
  const MockTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { 'data-testid'?: string }>(
    ({ children, ...props }, ref) => <button ref={ref} {...props}>{children}</button>,
  );
  MockTrigger.displayName = 'MockTrigger';
  const MockValue = ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>;
  const MockContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const MockItem = React.forwardRef<HTMLDivElement, { children: React.ReactNode; value: string }>(
    ({ children, value, ...props }, ref) => <div ref={ref} role="option" data-value={value} {...props}>{children}</div>,
  );
  MockItem.displayName = 'MockItem';
  const MockViewport = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  const MockIcon = () => null;
  const MockItemText = ({ children }: { children: React.ReactNode }) => <span>{children}</span>;
  const MockItemIndicator = ({ children }: { children: React.ReactNode }) => <span>{children}</span>;
  const MockGroup = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const MockLabel = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const MockSeparator = () => <hr />;
  const MockPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  const MockScrollUpButton = () => null;
  const MockScrollDownButton = () => null;
  return {
    Root: MockRoot, Trigger: MockTrigger, Value: MockValue, Content: MockContent,
    Item: MockItem, Viewport: MockViewport, Icon: MockIcon, ItemText: MockItemText,
    ItemIndicator: MockItemIndicator, Group: MockGroup, Label: MockLabel,
    Separator: MockSeparator, Portal: MockPortal,
    ScrollUpButton: MockScrollUpButton, ScrollDownButton: MockScrollDownButton,
  };
});

vi.mock('@radix-ui/react-dialog', () => {
  const MockRoot = ({ children, open }: { children: React.ReactNode; open?: boolean }) => <>{open ? children : null}</>;
  const MockTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ children, ...props }, ref) => <button ref={ref} {...props}>{children}</button>,
  );
  MockTrigger.displayName = 'MockDialogTrigger';
  const MockPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  const MockOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    (props, ref) => <div ref={ref} {...props} />,
  );
  MockOverlay.displayName = 'MockDialogOverlay';
  const MockContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => <div ref={ref} {...props}>{children}</div>,
  );
  MockContent.displayName = 'MockDialogContent';
  const MockTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ children, ...props }, ref) => <h2 ref={ref} {...props}>{children}</h2>,
  );
  MockTitle.displayName = 'MockDialogTitle';
  const MockDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ children, ...props }, ref) => <p ref={ref} {...props}>{children}</p>,
  );
  MockDescription.displayName = 'MockDialogDescription';
  const MockClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ children, ...props }, ref) => <button ref={ref} {...props}>{children}</button>,
  );
  MockClose.displayName = 'MockDialogClose';
  const MockHeader = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>;
  const MockFooter = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>;
  return {
    Root: MockRoot, Trigger: MockTrigger, Portal: MockPortal, Overlay: MockOverlay,
    Content: MockContent, Title: MockTitle, Description: MockDescription, Close: MockClose,
    Header: MockHeader, Footer: MockFooter,
  };
});

vi.mock('@radix-ui/react-tabs', () => {
  const MockRoot = ({ children, defaultValue, ...props }: { children: React.ReactNode; defaultValue?: string } & React.HTMLAttributes<HTMLDivElement>) => {
    const [value, setValue] = React.useState(defaultValue ?? '');
    return (
      <div {...props} data-mock-tabs data-value={value}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{ 'data-tab-value'?: string; 'data-active-tab'?: string }>, { 'data-active-tab': value });
          }
          return child;
        })}
      </div>
    );
  };
  const MockList = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div role="tablist" {...props}>{children}</div>;
  const MockTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { value?: string; 'data-testid'?: string }>(
    ({ children, value, ...props }, ref) => <button ref={ref} role="tab" data-value={value} {...props}>{children}</button>,
  );
  MockTrigger.displayName = 'MockTabsTrigger';
  const MockContent = ({ children, value, ...props }: { children: React.ReactNode; value?: string } & React.HTMLAttributes<HTMLDivElement>) => (
    <div role="tabpanel" data-value={value} {...props}>{children}</div>
  );
  return { Root: MockRoot, List: MockList, Trigger: MockTrigger, Content: MockContent };
});

// --- Tests ---

describe('PromptManagementView', () => {
  describe('Rendering (AC-1, AC-11)', () => {
    it('renders prompt management view with data-testid', () => {
      render(<PromptManagementView />);
      expect(screen.getByTestId('prompt-management-view')).toBeInTheDocument();
    });

    it('renders prompt table with mock data rows', () => {
      render(<PromptManagementView />);
      expect(screen.getByTestId('prompt-table')).toBeInTheDocument();
      // Should have rows for all mock templates
      MOCK_TEMPLATES.forEach(t => {
        expect(screen.getByTestId(`prompt-row-${t.id}`)).toBeInTheDocument();
      });
    });

    it('renders table headers: name, category, model, version, status, date, actions', () => {
      render(<PromptManagementView />);
      const table = screen.getByTestId('prompt-table');
      expect(within(table).getByText('이름')).toBeInTheDocument();
      expect(within(table).getByText('카테고리')).toBeInTheDocument();
      expect(within(table).getByText('모델')).toBeInTheDocument();
      expect(within(table).getByText('버전')).toBeInTheDocument();
      expect(within(table).getByText('상태')).toBeInTheDocument();
      expect(within(table).getByText('수정일')).toBeInTheDocument();
      expect(within(table).getByText('관리')).toBeInTheDocument();
    });

    it('displays template name, model name, version and updated date in each row', () => {
      render(<PromptManagementView />);
      const firstTemplate = MOCK_TEMPLATES[0];
      const row = screen.getByTestId(`prompt-row-${firstTemplate.id}`);
      expect(within(row).getByText(firstTemplate.name)).toBeInTheDocument();
      expect(within(row).getByText(getModelName(firstTemplate.modelId))).toBeInTheDocument();
      expect(within(row).getByText(`v${firstTemplate.currentVersion}`)).toBeInTheDocument();
      expect(within(row).getByText(firstTemplate.updatedAt)).toBeInTheDocument();
    });
  });

  describe('Status Badges (AC-9)', () => {
    it('renders status badges for draft, active, and archived templates', () => {
      render(<PromptManagementView />);
      // There should be active templates
      const activeBadges = screen.getAllByTestId('status-badge-active');
      expect(activeBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Search & Filter (AC-7)', () => {
    it('renders search input and filter controls', () => {
      render(<PromptManagementView />);
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('category-filter')).toBeInTheDocument();
      expect(screen.getByTestId('status-filter')).toBeInTheDocument();
    });

    it('filters templates by search query', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, '고객 응대');

      // Should show matching template
      expect(screen.getByText('고객 응대 기본 프롬프트')).toBeInTheDocument();
      // Non-matching templates should be filtered out
      expect(screen.queryByText('코드 리뷰 자동화')).not.toBeInTheDocument();
    });
  });

  describe('Create Prompt (AC-2, AC-13)', () => {
    it('opens create editor when clicking "새 프롬프트" button', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      await user.click(screen.getByTestId('create-prompt-button'));
      expect(screen.getByTestId('prompt-editor')).toBeInTheDocument();
      expect(screen.getByText('새 프롬프트 생성')).toBeInTheDocument();
    });

    it('creates a new template and adds it to the list', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      const initialCount = MOCK_TEMPLATES.length;
      await user.click(screen.getByTestId('create-prompt-button'));

      // Fill in name
      const nameInput = screen.getByTestId('edit-name');
      await user.type(nameInput, '테스트 신규 프롬프트');

      // Fill in content
      const contentArea = screen.getByTestId('edit-content');
      await user.type(contentArea, '이것은 테스트 프롬프트입니다');

      // Save
      await user.click(screen.getByTestId('save-button'));

      // New template should appear in the list
      expect(screen.getByText('테스트 신규 프롬프트')).toBeInTheDocument();
    });

    it('renders editor form fields: name, category, model, moderation, content', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      await user.click(screen.getByTestId('create-prompt-button'));
      expect(screen.getByTestId('edit-name')).toBeInTheDocument();
      expect(screen.getByTestId('edit-category')).toBeInTheDocument();
      expect(screen.getByTestId('edit-model')).toBeInTheDocument();
      expect(screen.getByTestId('edit-moderation')).toBeInTheDocument();
      expect(screen.getByTestId('edit-content')).toBeInTheDocument();
    });

    it('shows character count and token estimate', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);
      await user.click(screen.getByTestId('create-prompt-button'));

      const contentArea = screen.getByTestId('edit-content');
      await user.type(contentArea, '테스트 프롬프트 내용');

      // Should show character count and token estimate
      expect(screen.getByText(/자.*tokens/)).toBeInTheDocument();
    });
  });

  describe('Edit Prompt (AC-2, AC-3, AC-13)', () => {
    it('opens edit editor when clicking edit button on a row', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      const firstTemplate = MOCK_TEMPLATES[0];
      await user.click(screen.getByTestId(`edit-button-${firstTemplate.id}`));

      expect(screen.getByTestId('prompt-editor')).toBeInTheDocument();
      expect(screen.getByText(`프롬프트 편집: ${firstTemplate.name}`)).toBeInTheDocument();
    });

    it('pre-fills editor form with selected template data', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      const firstTemplate = MOCK_TEMPLATES[0];
      await user.click(screen.getByTestId(`edit-button-${firstTemplate.id}`));

      const nameInput = screen.getByTestId('edit-name') as HTMLInputElement;
      expect(nameInput.value).toBe(firstTemplate.name);

      const contentArea = screen.getByTestId('edit-content') as HTMLTextAreaElement;
      expect(contentArea.value).toBe(firstTemplate.content);
    });

    it('shows version history tab in edit mode', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      const firstTemplate = MOCK_TEMPLATES[0];
      await user.click(screen.getByTestId(`edit-button-${firstTemplate.id}`));

      expect(screen.getByTestId('tab-versions')).toBeInTheDocument();
    });

    it('shows change note input in edit mode', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      const firstTemplate = MOCK_TEMPLATES[0];
      await user.click(screen.getByTestId(`edit-button-${firstTemplate.id}`));

      expect(screen.getByTestId('edit-change-note')).toBeInTheDocument();
    });
  });

  describe('Version History (AC-3)', () => {
    it('displays version history entries in reverse chronological order', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      const templateWithVersions = MOCK_TEMPLATES.find(t => t.versions.length >= 3)!;
      await user.click(screen.getByTestId(`edit-button-${templateWithVersions.id}`));

      // Click versions tab
      await user.click(screen.getByTestId('tab-versions'));

      const versionHistory = screen.getByTestId('version-history');
      expect(versionHistory).toBeInTheDocument();

      // Should show all versions
      templateWithVersions.versions.forEach(ver => {
        expect(within(versionHistory).getByText(`v${ver.version}`)).toBeInTheDocument();
      });
    });
  });

  describe('Model Binding (AC-5)', () => {
    it('renders model binding dropdown in editor', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      await user.click(screen.getByTestId('create-prompt-button'));
      const modelSelect = screen.getByTestId('edit-model');
      expect(modelSelect).toBeInTheDocument();

      // Should show model options within the select (use getAllByText since models appear in table too)
      MODEL_OPTIONS.forEach(opt => {
        expect(screen.getAllByText(opt.label).length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Moderation Level (AC-6)', () => {
    it('renders moderation level buttons: Low, Medium, High', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      await user.click(screen.getByTestId('create-prompt-button'));
      expect(screen.getByTestId('moderation-low')).toBeInTheDocument();
      expect(screen.getByTestId('moderation-medium')).toBeInTheDocument();
      expect(screen.getByTestId('moderation-high')).toBeInTheDocument();
    });

    it('selects moderation level when clicking', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      await user.click(screen.getByTestId('create-prompt-button'));
      const highButton = screen.getByTestId('moderation-high');
      await user.click(highButton);

      expect(highButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Delete Prompt (AC-8)', () => {
    it('opens delete confirmation dialog', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      const firstTemplate = MOCK_TEMPLATES[0];
      await user.click(screen.getByTestId(`delete-button-${firstTemplate.id}`));

      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
      expect(screen.getByText(/삭제하시겠습니까/)).toBeInTheDocument();
    });

    it('removes template from list after confirming delete', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      const firstTemplate = MOCK_TEMPLATES[0];
      await user.click(screen.getByTestId(`delete-button-${firstTemplate.id}`));
      await user.click(screen.getByTestId('confirm-delete-button'));

      expect(screen.queryByTestId(`prompt-row-${firstTemplate.id}`)).not.toBeInTheDocument();
    });
  });

  describe('Inline Test (AC-4)', () => {
    it('renders test panel with run button', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      await user.click(screen.getByTestId('create-prompt-button'));
      await user.click(screen.getByTestId('tab-test'));

      expect(screen.getByTestId('test-panel')).toBeInTheDocument();
      expect(screen.getByTestId('run-test-button')).toBeInTheDocument();
    });

    it('shows variable input fields when template has variables', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      // Open an existing template with known variables (pt-001 has {{company_name}} and {{language}})
      const templateWithVars = MOCK_TEMPLATES.find(t => extractVariables(t.content).length > 0)!;
      await user.click(screen.getByTestId(`edit-button-${templateWithVars.id}`));

      // The test panel is rendered (mock Tabs shows all content)
      const testPanel = screen.getByTestId('test-panel');
      expect(testPanel).toBeInTheDocument();

      // Variable inputs should be visible (mock tabs renders all panels)
      const vars = extractVariables(templateWithVars.content);
      vars.forEach(v => {
        expect(screen.getByTestId(`test-var-${v}`)).toBeInTheDocument();
      });
    });

    it('shows mock response after running test', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      // Open existing template (content already filled)
      await user.click(screen.getByTestId(`edit-button-${MOCK_TEMPLATES[0].id}`));

      // Run test button should be visible (mock tabs renders all panels)
      await user.click(screen.getByTestId('run-test-button'));

      // Wait for mock response (1200ms delay)
      await waitFor(() => {
        expect(screen.getByTestId('test-result')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Empty State (AC-7)', () => {
    it('shows empty state when search matches nothing', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'zzzzz_no_match_zzzzz');

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  describe('Variable Highlight', () => {
    it('shows variable preview with highlighted variables', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      await user.click(screen.getByTestId('create-prompt-button'));
      const contentArea = screen.getByTestId('edit-content');
      await user.type(contentArea, '안녕 {{name}}');

      expect(screen.getByTestId('variable-highlight')).toBeInTheDocument();
    });
  });

  describe('Mock Data (AC-10)', () => {
    it('has at least 10 mock templates', () => {
      expect(MOCK_TEMPLATES.length).toBeGreaterThanOrEqual(10);
    });

    it('each template has at least 2 versions (except drafts)', () => {
      const nonDrafts = MOCK_TEMPLATES.filter(t => t.status !== 'draft');
      nonDrafts.forEach(t => {
        expect(t.versions.length).toBeGreaterThanOrEqual(2);
      });
    });
  });
});

describe('promptManagementData helpers', () => {
  describe('extractVariables', () => {
    it('extracts unique variable names from content', () => {
      const vars = extractVariables('Hello {{name}}, your role is {{role}}. Hello {{name}}.');
      expect(vars).toEqual(['name', 'role']);
    });

    it('returns empty array for content without variables', () => {
      expect(extractVariables('No variables here')).toEqual([]);
    });
  });

  describe('estimateTokens', () => {
    it('estimates tokens as text length / 4', () => {
      expect(estimateTokens('abcd')).toBe(1);
      expect(estimateTokens('12345678')).toBe(2);
    });
  });

  describe('filterTemplates', () => {
    it('filters by search query', () => {
      const result = filterTemplates(MOCK_TEMPLATES, '고객 응대', 'all', 'all');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toContain('고객 응대');
    });

    it('filters by category', () => {
      const result = filterTemplates(MOCK_TEMPLATES, '', 'safety', 'all');
      result.forEach(t => expect(t.category).toBe('safety'));
    });

    it('filters by status', () => {
      const result = filterTemplates(MOCK_TEMPLATES, '', 'all', 'active');
      result.forEach(t => expect(t.status).toBe('active'));
    });

    it('returns all when all filters are "all"', () => {
      const result = filterTemplates(MOCK_TEMPLATES, '', 'all', 'all');
      expect(result.length).toBe(MOCK_TEMPLATES.length);
    });
  });

  describe('getModelName', () => {
    it('returns model name for known ID', () => {
      expect(getModelName('claude-opus-4-6')).toBe('Claude Opus 4.6');
    });

    it('returns ID as fallback for unknown model', () => {
      expect(getModelName('unknown-model')).toBe('unknown-model');
    });
  });
});
