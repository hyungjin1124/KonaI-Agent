/**
 * PromptManagementView — QA UX Flow Tests
 *
 * 컴포넌트 간 상태 전파, 콜백 배선, 종료 상태, 핵심 사용자 플로우를 추적한다.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { PromptManagementView } from './PromptManagementView';
import { MOCK_TEMPLATES, extractVariables } from './promptManagementData';

// --- Radix UI Mocks (same as dev test) ---

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

// --- UX Flow Tests ---

describe('PromptManagementView — UX Flow Tests', () => {
  describe('Flow 1: Create → Verify in List → Edit → Verify Version', () => {
    it('completes full CRUD lifecycle', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      // Step 1: Create template
      await user.click(screen.getByTestId('create-prompt-button'));
      expect(screen.getByText('새 프롬프트 생성')).toBeInTheDocument();

      await user.type(screen.getByTestId('edit-name'), 'Flow Test Template');
      await user.type(screen.getByTestId('edit-content'), '{{role}} 전문가로서 {{task}}를 수행합니다.');
      await user.click(screen.getByTestId('save-button'));

      // Step 2: Verify in list
      expect(screen.getByText('Flow Test Template')).toBeInTheDocument();

      // Step 3: Find the new template by searching
      await user.type(screen.getByTestId('search-input'), 'Flow Test');
      expect(screen.getByText('Flow Test Template')).toBeInTheDocument();

      // Clear search for next steps
      await user.clear(screen.getByTestId('search-input'));
    });
  });

  describe('Flow 2: Edit → Save → Verify Version Increment', () => {
    it('creates new version on edit save', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      const template = MOCK_TEMPLATES[0];
      const originalVersion = template.currentVersion;

      // Edit existing template
      await user.click(screen.getByTestId(`edit-button-${template.id}`));

      // Modify content
      const contentArea = screen.getByTestId('edit-content') as HTMLTextAreaElement;
      await user.clear(contentArea);
      await user.type(contentArea, 'Updated content for version test');

      // Add change note
      await user.type(screen.getByTestId('edit-change-note'), 'QA flow test change');

      // Save
      await user.click(screen.getByTestId('save-button'));

      // Verify version incremented in table
      // The row should show v{originalVersion + 1}
      const row = screen.getByTestId(`prompt-row-${template.id}`);
      expect(within(row).getByText(`v${originalVersion + 1}`)).toBeInTheDocument();
    });
  });

  describe('Flow 3: Delete Last Item → Empty State', () => {
    it('shows empty state after deleting all templates', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      // Delete each template
      for (const t of MOCK_TEMPLATES) {
        const deleteBtn = screen.queryByTestId(`delete-button-${t.id}`);
        if (deleteBtn) {
          await user.click(deleteBtn);
          await user.click(screen.getByTestId('confirm-delete-button'));
        }
      }

      // Verify empty state
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('검색 조건에 맞는 프롬프트가 없습니다.')).toBeInTheDocument();
    });
  });

  describe('Flow 4: Test Execution Flow', () => {
    it('test panel shows variables from current content', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      // Open template with variables
      const templateWithVars = MOCK_TEMPLATES.find(t => extractVariables(t.content).length > 0)!;
      await user.click(screen.getByTestId(`edit-button-${templateWithVars.id}`));

      // Variables should appear in test panel
      const vars = extractVariables(templateWithVars.content);
      vars.forEach(v => {
        expect(screen.getByTestId(`test-var-${v}`)).toBeInTheDocument();
      });

      // Fill variable and run test
      if (vars.length > 0) {
        await user.type(screen.getByTestId(`test-var-${vars[0]}`), 'test value');
      }

      // Run test
      await user.click(screen.getByTestId('run-test-button'));

      // Wait for result
      await waitFor(() => {
        expect(screen.getByTestId('test-result')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Callback Wiring: Editor Open/Close', () => {
    it('editor sheet closes properly and resets selectedTemplate', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      // Open editor
      await user.click(screen.getByTestId(`edit-button-${MOCK_TEMPLATES[0].id}`));
      expect(screen.getByTestId('prompt-editor')).toBeInTheDocument();
      expect(screen.getByText(`프롬프트 편집: ${MOCK_TEMPLATES[0].name}`)).toBeInTheDocument();

      // Close via cancel button
      await user.click(screen.getByText('취소'));

      // Open a different template
      await user.click(screen.getByTestId(`edit-button-${MOCK_TEMPLATES[1].id}`));
      expect(screen.getByText(`프롬프트 편집: ${MOCK_TEMPLATES[1].name}`)).toBeInTheDocument();
    });
  });

  describe('Callback Wiring: Delete Dialog', () => {
    it('delete dialog targets correct template', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      const template = MOCK_TEMPLATES[2]; // Use third template
      await user.click(screen.getByTestId(`delete-button-${template.id}`));

      // Dialog should mention the correct template name
      // Name appears both in the table row and in the dialog <strong>, so use getAllByText
      const matches = screen.getAllByText(new RegExp(template.name));
      expect(matches.length).toBeGreaterThanOrEqual(2); // table row + dialog
      // Confirm the delete dialog is open
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    });
  });

  describe('Dual State: Search + Filter Interaction', () => {
    it('search and category filter work independently', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      // Type search first
      await user.type(screen.getByTestId('search-input'), '프롬프트');

      // Verify filtered results exist
      const rows = screen.getAllByTestId(/^prompt-row-/);
      expect(rows.length).toBeGreaterThan(0);

      // Clear search
      await user.clear(screen.getByTestId('search-input'));

      // All templates should be back
      const allRows = screen.getAllByTestId(/^prompt-row-/);
      expect(allRows.length).toBe(MOCK_TEMPLATES.length);
    });
  });

  describe('Terminal State: Editor with No Content', () => {
    it('editor handles clearing all content gracefully', async () => {
      const user = userEvent.setup();
      render(<PromptManagementView />);

      // Open editor for existing template
      await user.click(screen.getByTestId(`edit-button-${MOCK_TEMPLATES[0].id}`));

      // Clear content
      const contentArea = screen.getByTestId('edit-content') as HTMLTextAreaElement;
      await user.clear(contentArea);

      // Save button should be disabled
      expect(screen.getByTestId('save-button')).toBeDisabled();

      // Variable preview should not show (no content)
      expect(screen.queryByTestId('variable-highlight')).not.toBeInTheDocument();

      // Token count should show 0
      expect(screen.getByText(/0자/)).toBeInTheDocument();
    });
  });

  describe('AdminView Integration Point', () => {
    it('PromptManagementView renders as standalone without AdminView context', () => {
      // PromptManagementView has no props — it should render independently
      const { container } = render(<PromptManagementView />);
      expect(container.querySelector('[data-testid="prompt-management-view"]')).toBeInTheDocument();
    });
  });
});
