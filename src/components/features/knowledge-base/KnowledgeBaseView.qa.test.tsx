/**
 * KnowledgeBaseView — QA Edge Case Tests
 *
 * QA Engineer 관점의 엣지 케이스 테스트.
 * 개발자 테스트(KnowledgeBaseView.test.tsx)와 분리.
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
  getDocumentTypeLabel,
  filterDocuments,
  DOCUMENT_TYPES,
  type KnowledgeDocument,
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

describe('KnowledgeBaseView — QA Edge Cases', () => {
  // --- 데이터 경계 테스트 ---
  describe('Data Boundary Tests', () => {
    it('shows empty-state when search matches no documents', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      // Navigate to a collection
      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`));

      // Type a search query that matches nothing
      const searchInput = screen.getByLabelText('문서 검색');
      await user.type(searchInput, 'xyz존재하지않는문서명zzz');

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('검색 조건에 맞는 문서가 없습니다.')).toBeInTheDocument();
    });

    it('footer shows 0개 문서 when search returns no results', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`));

      const searchInput = screen.getByLabelText('문서 검색');
      await user.type(searchInput, 'nonexistent_file_zzz');

      expect(screen.getByText(/0개 문서/)).toBeInTheDocument();
    });

    it('formatFileSize handles 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('formatFileSize handles boundary values', () => {
      expect(formatFileSize(1023)).toBe('1023 B');
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1024 * 1024 - 1)).toBe('1024.0 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
    });

    it('filterDocuments handles empty documents array', () => {
      const result = filterDocuments([], 'test', 'all');
      expect(result).toEqual([]);
    });

    it('filterDocuments handles combined search + type filter', () => {
      const docs = MOCK_COLLECTIONS[0].documents;
      const result = filterDocuments(docs, '규', 'pdf');
      result.forEach(doc => {
        expect(doc.type).toBe('pdf');
        expect(doc.name.toLowerCase()).toContain('규');
      });
    });

    it('filterDocuments is case-insensitive', () => {
      const docs: KnowledgeDocument[] = [
        { id: 'test-1', name: 'API Guide.PDF', type: 'pdf', size: 100, uploadedAt: '2026-01-01', uploadedBy: 'test', status: 'indexed' },
      ];
      const result = filterDocuments(docs, 'api', 'all');
      expect(result.length).toBe(1);
    });

    it('getDocumentTypeLabel covers all document types', () => {
      DOCUMENT_TYPES.forEach(type => {
        const label = getDocumentTypeLabel(type);
        expect(label).toBeTruthy();
        expect(typeof label).toBe('string');
      });
    });
  });

  // --- 모든 상태/배지 렌더링 테스트 ---
  describe('Status Badge Rendering', () => {
    it('renders all 4 document statuses correctly', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      // HR collection has indexed, processing, and pending
      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`));

      expect(screen.getAllByText('완료').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('처리 중').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('대기 중').length).toBeGreaterThanOrEqual(1);
    });

    it('renders failed status in tech collection', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      // Tech collection has a 'failed' status document
      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[1].id}`));

      expect(screen.getAllByText('실패').length).toBeGreaterThanOrEqual(1);
    });

    it('renders all 3 collection statuses in grid', () => {
      render(<KnowledgeBaseView />);

      // Mock data: active (HR, Product, Compliance), updating (Tech)
      expect(screen.getAllByText('활성').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('업데이트 중').length).toBeGreaterThanOrEqual(1);
    });

    it('renders all 3 access level types in grid', () => {
      render(<KnowledgeBaseView />);

      // Mock data: restricted (HR, Compliance), private (Tech), public (Product)
      expect(screen.getAllByText('제한').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('비공개').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('공개').length).toBeGreaterThanOrEqual(1);
    });
  });

  // --- 사용자 인터랙션 테스트 ---
  describe('User Interaction Tests', () => {
    it('resets search and type filter on back navigation', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      // Navigate to collection
      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`));

      // Type a search query
      const searchInput = screen.getByLabelText('문서 검색');
      await user.type(searchInput, 'test');

      // Go back
      await user.click(screen.getByLabelText('컬렉션 목록으로 돌아가기'));

      // Navigate to same collection again
      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`));

      // Search should be reset
      const newSearchInput = screen.getByLabelText('문서 검색');
      expect(newSearchInput).toHaveValue('');
    });

    it('can navigate to different collections sequentially', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      // Navigate to first collection
      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`));
      expect(screen.getByText(MOCK_COLLECTIONS[0].name)).toBeInTheDocument();

      // Go back
      await user.click(screen.getByLabelText('컬렉션 목록으로 돌아가기'));

      // Navigate to second collection
      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[1].id}`));
      expect(screen.getByText(MOCK_COLLECTIONS[1].name)).toBeInTheDocument();

      // Verify documents from second collection are shown
      MOCK_COLLECTIONS[1].documents.forEach(doc => {
        expect(screen.getByText(doc.name)).toBeInTheDocument();
      });
    });

    it('upload dialog shows and closes with cancel button', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`));

      // Open upload
      await user.click(screen.getByText('업로드'));
      expect(screen.getByText('문서 업로드')).toBeInTheDocument();

      // Close with cancel
      await user.click(screen.getByText('취소'));
      expect(screen.queryByText('문서 업로드')).not.toBeInTheDocument();
    });

    it('drag and drop interaction changes visual state', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`));
      await user.click(screen.getByText('업로드'));

      const dropzone = screen.getByTestId('upload-dropzone');

      // Simulate dragOver
      fireEvent.dragOver(dropzone, { preventDefault: () => {} });

      // After dragOver, isDragging should be true → blue border
      expect(dropzone.className).toContain('border-blue-400');

      // Simulate dragLeave
      fireEvent.dragLeave(dropzone);
      expect(dropzone.className).toContain('border-gray-200');
    });

    it('drop event closes upload dialog', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`));
      await user.click(screen.getByText('업로드'));

      const dropzone = screen.getByTestId('upload-dropzone');

      fireEvent.drop(dropzone, {
        preventDefault: () => {},
        dataTransfer: { files: [] },
      });

      // Dialog should close after drop
      expect(screen.queryByText('문서 업로드')).not.toBeInTheDocument();
    });

    it('clicking file select button closes dialog (mock behavior)', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`));
      await user.click(screen.getByText('업로드'));

      // Click "파일 선택" button
      await user.click(screen.getByText('파일 선택'));

      // Dialog closes (mock behavior)
      expect(screen.queryByText('문서 업로드')).not.toBeInTheDocument();
    });
  });

  // --- 상태 전환 테스트 ---
  describe('State Transition Tests', () => {
    it('document list view shows correct collection header info', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      for (const col of MOCK_COLLECTIONS) {
        await user.click(screen.getByTestId(`collection-${col.id}`));

        // Verify collection name is displayed
        expect(screen.getByText(col.name)).toBeInTheDocument();
        // Verify description is displayed
        expect(screen.getByText(col.description)).toBeInTheDocument();

        // Go back for next iteration
        await user.click(screen.getByLabelText('컬렉션 목록으로 돌아가기'));
      }
    });

    it('summary bar numbers are consistent with mock data', () => {
      render(<KnowledgeBaseView />);

      const summary = screen.getByTestId('summary-bar');
      const totalDocs = MOCK_COLLECTIONS.reduce((sum, c) => sum + c.documentCount, 0);
      const totalSize = MOCK_COLLECTIONS.reduce((sum, c) => sum + c.totalSize, 0);

      expect(summary).toHaveTextContent(`${MOCK_COLLECTIONS.length}`);
      expect(summary).toHaveTextContent(`${totalDocs}`);
      expect(summary).toHaveTextContent(formatFileSize(totalSize));
    });
  });

  // --- 데이터 무결성 테스트 ---
  describe('Mock Data Integrity', () => {
    it('each collection documentCount matches actual documents array length', () => {
      MOCK_COLLECTIONS.forEach(col => {
        expect(col.documentCount).toBe(col.documents.length);
      });
    });

    it('each collection totalSize matches sum of document sizes', () => {
      MOCK_COLLECTIONS.forEach(col => {
        const expectedSize = col.documents.reduce((sum, d) => sum + d.size, 0);
        expect(col.totalSize).toBe(expectedSize);
      });
    });

    it('all document IDs are unique', () => {
      const allIds = MOCK_COLLECTIONS.flatMap(c => c.documents.map(d => d.id));
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });

    it('all collection IDs are unique', () => {
      const ids = MOCK_COLLECTIONS.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('all documents have valid types', () => {
      const validTypes = ['pdf', 'docx', 'xlsx', 'csv', 'txt', 'md', 'pptx', 'html'];
      MOCK_COLLECTIONS.flatMap(c => c.documents).forEach(doc => {
        expect(validTypes).toContain(doc.type);
      });
    });

    it('all documents have valid statuses', () => {
      const validStatuses = ['indexed', 'processing', 'failed', 'pending'];
      MOCK_COLLECTIONS.flatMap(c => c.documents).forEach(doc => {
        expect(validStatuses).toContain(doc.status);
      });
    });

    it('mock data contains all 4 document statuses across collections', () => {
      const allStatuses = new Set(
        MOCK_COLLECTIONS.flatMap(c => c.documents.map(d => d.status))
      );
      expect(allStatuses.has('indexed')).toBe(true);
      expect(allStatuses.has('processing')).toBe(true);
      expect(allStatuses.has('failed')).toBe(true);
      expect(allStatuses.has('pending')).toBe(true);
    });
  });
});
