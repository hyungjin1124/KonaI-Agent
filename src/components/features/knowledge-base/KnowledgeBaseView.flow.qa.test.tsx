/**
 * KnowledgeBaseView — Flow QA Tests
 *
 * UX 플로우 검증: 콜백 배선, 상태 동기화, 종료 상태, 핵심 사용자 플로우.
 * 개발자 테스트, QA 엣지 케이스 테스트와 분리.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { KnowledgeBaseView } from './KnowledgeBaseView';
import {
  MOCK_COLLECTIONS,
  formatFileSize,
  filterDocuments,
} from './knowledgeBaseData';

// Mock Radix Select
vi.mock('@radix-ui/react-select', () => {
  const MockRoot = ({ children, value, onValueChange }: {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (v: string) => void;
  }) => <div data-testid="select-root">{children}</div>;

  const MockTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { 'aria-label'?: string }>(
    ({ children, ...props }, ref) => (
      <button ref={ref} {...props}>{children}</button>
    )
  );
  MockTrigger.displayName = 'MockSelectTrigger';

  const MockValue = ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder ?? '전체'}</span>
  );

  const MockContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const MockItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(
    ({ children, ...props }, ref) => <div ref={ref} {...props}>{children}</div>
  );
  MockItem.displayName = 'MockSelectItem';
  const MockItemText = ({ children }: { children: React.ReactNode }) => <span>{children}</span>;

  const MockViewport = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const MockIcon = () => null;
  const MockPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  const MockGroup = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const MockLabel = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const MockSeparator = () => <hr />;
  const MockScrollUpButton = () => null;
  const MockScrollDownButton = () => null;

  return {
    Root: MockRoot,
    Trigger: MockTrigger,
    Value: MockValue,
    Content: MockContent,
    Item: MockItem,
    ItemText: MockItemText,
    Viewport: MockViewport,
    Icon: MockIcon,
    Portal: MockPortal,
    Group: MockGroup,
    Label: MockLabel,
    Separator: MockSeparator,
    ScrollUpButton: MockScrollUpButton,
    ScrollDownButton: MockScrollDownButton,
    ItemIndicator: () => null,
  };
});

// Mock Radix Dialog
vi.mock('@radix-ui/react-dialog', () => {
  const MockRoot = ({ children, open }: { children: React.ReactNode; open?: boolean; onOpenChange?: (o: boolean) => void }) => (
    <>{open ? children : null}</>
  );
  const MockTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ children, ...props }, ref) => <button ref={ref} {...props}>{children}</button>
  );
  MockTrigger.displayName = 'MockDialogTrigger';
  const MockPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  const MockOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => <div ref={ref} {...props}>{children}</div>
  );
  MockOverlay.displayName = 'MockDialogOverlay';
  const MockContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => <div ref={ref} role="dialog" {...props}>{children}</div>
  );
  MockContent.displayName = 'MockDialogContent';
  const MockHeader = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>;
  const MockTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ children, ...props }, ref) => <h2 ref={ref} {...props}>{children}</h2>
  );
  MockTitle.displayName = 'MockDialogTitle';
  const MockDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ children, ...props }, ref) => <p ref={ref} {...props}>{children}</p>
  );
  MockDescription.displayName = 'MockDialogDescription';
  const MockClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ children, ...props }, ref) => <button ref={ref} {...props}>{children}</button>
  );
  MockClose.displayName = 'MockDialogClose';

  return {
    Root: MockRoot,
    Trigger: MockTrigger,
    Portal: MockPortal,
    Overlay: MockOverlay,
    Content: MockContent,
    Header: MockHeader,
    Title: MockTitle,
    Description: MockDescription,
    Close: MockClose,
  };
});

describe('KnowledgeBaseView — Flow QA Tests', () => {
  // --- Flow 1: 컬렉션 그리드 → 문서 목록 → 검색 → 뒤로가기 (가장 흔한 사용 시나리오) ---
  describe('Flow 1: Collection Browse + Search + Back', () => {
    it('full navigation flow: grid → documents → search → back → grid', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      // Step 1: Grid view visible
      expect(screen.getByTestId('collection-grid')).toBeInTheDocument();
      expect(screen.getByTestId('summary-bar')).toBeInTheDocument();

      // Step 2: Click collection
      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`));

      // Verify: Grid replaced by document list
      expect(screen.queryByTestId('collection-grid')).not.toBeInTheDocument();
      expect(screen.getByText(MOCK_COLLECTIONS[0].name)).toBeInTheDocument();
      expect(screen.getByLabelText('문서 검색')).toBeInTheDocument();

      // Step 3: Search for a document
      const searchInput = screen.getByLabelText('문서 검색');
      await user.type(searchInput, '취업규칙');

      // Verify: Only matching document shown
      expect(screen.getByText('2026년 취업규칙.pdf')).toBeInTheDocument();
      expect(screen.getByText(/1개 문서/)).toBeInTheDocument();

      // Step 4: Back to grid
      await user.click(screen.getByLabelText('컬렉션 목록으로 돌아가기'));

      // Verify: Grid restored
      expect(screen.getByTestId('collection-grid')).toBeInTheDocument();
      expect(screen.getByTestId('summary-bar')).toBeInTheDocument();
    });
  });

  // --- Flow 2: 업로드 플로우 ---
  describe('Flow 2: Upload Flow', () => {
    it('upload flow: collection → upload button → dialog → drop → close', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      // Step 1: Navigate to collection
      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`));

      // Step 2: Open upload dialog
      await user.click(screen.getByText('업로드'));
      expect(screen.getByText('문서 업로드')).toBeInTheDocument();
      expect(screen.getByTestId('upload-dropzone')).toBeInTheDocument();

      // Step 3: Simulate file drop
      const dropzone = screen.getByTestId('upload-dropzone');
      fireEvent.drop(dropzone, { preventDefault: () => {} });

      // Step 4: Dialog should close
      expect(screen.queryByText('문서 업로드')).not.toBeInTheDocument();

      // Step 5: Document list should still be visible
      expect(screen.getByText(MOCK_COLLECTIONS[0].name)).toBeInTheDocument();
    });
  });

  // --- Flow 3: 교차 컬렉션 탐색 (파괴적 시나리오) ---
  describe('Flow 3: Cross-Collection Navigation', () => {
    it('navigating between collections resets search state', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      // Step 1: Go to first collection and search
      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`));
      await user.type(screen.getByLabelText('문서 검색'), 'test');

      // Step 2: Go back
      await user.click(screen.getByLabelText('컬렉션 목록으로 돌아가기'));

      // Step 3: Go to second collection
      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[1].id}`));

      // Verify: Search is reset, all documents of second collection are visible
      expect(screen.getByLabelText('문서 검색')).toHaveValue('');
      MOCK_COLLECTIONS[1].documents.forEach(doc => {
        expect(screen.getByText(doc.name)).toBeInTheDocument();
      });
    });
  });

  // --- 이중 상태 동기화 테스트 ---
  describe('Dual State Sync', () => {
    it('filteredDocs count matches footer count', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`));

      // All documents should be shown initially
      const expectedCount = MOCK_COLLECTIONS[0].documents.length;
      expect(screen.getByText(new RegExp(`${expectedCount}개 문서`))).toBeInTheDocument();

      // After search, footer should update
      await user.type(screen.getByLabelText('문서 검색'), '규');

      // Count matching docs
      const matchingDocs = filterDocuments(MOCK_COLLECTIONS[0].documents, '규', 'all');
      expect(screen.getByText(new RegExp(`${matchingDocs.length}개 문서`))).toBeInTheDocument();
    });

    it('selectedCollection header always matches current collection', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      for (const col of MOCK_COLLECTIONS) {
        await user.click(screen.getByTestId(`collection-${col.id}`));

        // Header should show this collection's info
        expect(screen.getByText(col.name)).toBeInTheDocument();
        expect(screen.getByText(col.description)).toBeInTheDocument();

        await user.click(screen.getByLabelText('컬렉션 목록으로 돌아가기'));
      }
    });
  });

  // --- 종료 상태 시나리오 ---
  describe('Terminal State Scenarios', () => {
    it('back button returns to grid with all collections intact', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      // Navigate into and out of every collection
      for (const col of MOCK_COLLECTIONS) {
        await user.click(screen.getByTestId(`collection-${col.id}`));
        await user.click(screen.getByLabelText('컬렉션 목록으로 돌아가기'));
      }

      // All collections should still be present
      MOCK_COLLECTIONS.forEach(col => {
        expect(screen.getByTestId(`collection-${col.id}`)).toBeInTheDocument();
      });
    });

    it('upload dialog cancel returns to document list without side effects', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`));

      // Record document count before upload
      const docCount = MOCK_COLLECTIONS[0].documents.length;

      // Open and cancel upload
      await user.click(screen.getByText('업로드'));
      await user.click(screen.getByText('취소'));

      // Documents should still be the same
      expect(screen.getByText(new RegExp(`${docCount}개 문서`))).toBeInTheDocument();
    });
  });

  // --- AdminView 통합 지점 ---
  describe('Integration Points', () => {
    it('KnowledgeBaseView renders as standalone component (no required props)', () => {
      // Verify component works without any props
      const { container } = render(<KnowledgeBaseView />);
      expect(container.firstChild).toBeTruthy();
    });

    it('KnowledgeBaseView exports correctly from index', async () => {
      const mod = await import('./index');
      expect(mod.KnowledgeBaseView).toBeDefined();
    });
  });
});
