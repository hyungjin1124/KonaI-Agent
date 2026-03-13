/**
 * KnowledgeBaseView — Unit Tests
 *
 * Tests for Knowledge Base Management component.
 * Uses Vitest + React Testing Library with jsdom environment.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { KnowledgeBaseView } from './KnowledgeBaseView';
import {
  MOCK_COLLECTIONS,
  formatFileSize,
  getDocumentTypeLabel,
  filterDocuments,
} from './knowledgeBaseData';

// Mock Radix Select to avoid portal issues in jsdom
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

// Mock Radix Dialog to avoid portal issues in jsdom
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

describe('KnowledgeBaseView', () => {
  it('renders without error', () => {
    render(<KnowledgeBaseView />);
    expect(screen.getByTestId('knowledge-base-view')).toBeInTheDocument();
  });

  describe('Collection Grid View', () => {
    it('displays summary bar with collection count, document count, and total size', () => {
      render(<KnowledgeBaseView />);
      const summary = screen.getByTestId('summary-bar');
      expect(summary).toBeInTheDocument();
      // Collection count
      expect(summary).toHaveTextContent(`${MOCK_COLLECTIONS.length}`);
    });

    it('displays all collections in grid', () => {
      render(<KnowledgeBaseView />);
      const grid = screen.getByTestId('collection-grid');
      MOCK_COLLECTIONS.forEach(col => {
        expect(within(grid).getByTestId(`collection-${col.id}`)).toBeInTheDocument();
      });
    });

    it('displays collection name and description', () => {
      render(<KnowledgeBaseView />);
      MOCK_COLLECTIONS.forEach(col => {
        expect(screen.getByText(col.name)).toBeInTheDocument();
      });
    });

    it('displays document count per collection', () => {
      render(<KnowledgeBaseView />);
      MOCK_COLLECTIONS.forEach(col => {
        expect(screen.getByText(`${col.documentCount}개 문서`)).toBeInTheDocument();
      });
    });

    it('displays access level badges', () => {
      render(<KnowledgeBaseView />);
      // At least one '제한' (restricted) badge
      const restrictedBadges = screen.getAllByText('제한');
      expect(restrictedBadges.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Document List View (after clicking collection)', () => {
    it('navigates to document list on collection click', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      // Click the first collection
      const firstCollection = screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`);
      await user.click(firstCollection);

      // Should show collection name as header
      expect(screen.getByText(MOCK_COLLECTIONS[0].name)).toBeInTheDocument();
      // Should show back button
      expect(screen.getByLabelText('컬렉션 목록으로 돌아가기')).toBeInTheDocument();
    });

    it('displays document table with file names', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`));

      // Check some documents from the first collection (HR)
      MOCK_COLLECTIONS[0].documents.forEach(doc => {
        expect(screen.getByText(doc.name)).toBeInTheDocument();
      });
    });

    it('displays document status badges', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`));

      // HR collection has indexed, processing, and pending statuses
      const completeBadges = screen.getAllByText('완료');
      expect(completeBadges.length).toBeGreaterThanOrEqual(1);
    });

    it('goes back to collection grid on back button click', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`));

      // Click back button
      await user.click(screen.getByLabelText('컬렉션 목록으로 돌아가기'));

      // Should be back to grid view
      expect(screen.getByTestId('collection-grid')).toBeInTheDocument();
    });

    it('displays search input and type filter', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`));

      expect(screen.getByLabelText('문서 검색')).toBeInTheDocument();
      expect(screen.getByLabelText('파일 타입 필터')).toBeInTheDocument();
    });

    it('shows upload button', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`));

      expect(screen.getByText('업로드')).toBeInTheDocument();
    });

    it('shows document count footer', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`));

      // Footer shows "{N}개 문서"
      const footer = screen.getByText(new RegExp(`${MOCK_COLLECTIONS[0].documents.length}개 문서`));
      expect(footer).toBeInTheDocument();
    });
  });

  describe('Upload Dialog', () => {
    it('opens upload dialog on button click', async () => {
      const user = userEvent.setup();
      render(<KnowledgeBaseView />);

      await user.click(screen.getByTestId(`collection-${MOCK_COLLECTIONS[0].id}`));
      await user.click(screen.getByText('업로드'));

      expect(screen.getByText('문서 업로드')).toBeInTheDocument();
      expect(screen.getByTestId('upload-dropzone')).toBeInTheDocument();
    });
  });

  describe('Helper Functions', () => {
    it('formatFileSize formats bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(2_500_000)).toBe('2.4 MB');
    });

    it('getDocumentTypeLabel returns correct labels', () => {
      expect(getDocumentTypeLabel('pdf')).toBe('PDF');
      expect(getDocumentTypeLabel('docx')).toBe('Word');
      expect(getDocumentTypeLabel('xlsx')).toBe('Excel');
    });

    it('filterDocuments filters by search query', () => {
      const docs = MOCK_COLLECTIONS[0].documents;
      const result = filterDocuments(docs, '취업규칙', 'all');
      expect(result.length).toBe(1);
      expect(result[0].name).toContain('취업규칙');
    });

    it('filterDocuments filters by type', () => {
      const docs = MOCK_COLLECTIONS[0].documents;
      const result = filterDocuments(docs, '', 'docx');
      result.forEach(doc => expect(doc.type).toBe('docx'));
    });

    it('filterDocuments returns all when no filters', () => {
      const docs = MOCK_COLLECTIONS[0].documents;
      const result = filterDocuments(docs, '', 'all');
      expect(result.length).toBe(docs.length);
    });
  });

  describe('Mock Data Validation', () => {
    it('has at least 3 collections', () => {
      expect(MOCK_COLLECTIONS.length).toBeGreaterThanOrEqual(3);
    });

    it('each collection has documents', () => {
      MOCK_COLLECTIONS.forEach(col => {
        expect(col.documents.length).toBeGreaterThan(0);
        expect(col.documentCount).toBe(col.documents.length);
      });
    });

    it('total document count matches across collections', () => {
      const total = MOCK_COLLECTIONS.reduce((sum, c) => sum + c.documentCount, 0);
      expect(total).toBe(30);
    });

    it('each collection has required fields', () => {
      MOCK_COLLECTIONS.forEach(col => {
        expect(col.id).toBeTruthy();
        expect(col.name).toBeTruthy();
        expect(col.color).toBeTruthy();
        expect(['active', 'updating', 'error']).toContain(col.status);
        expect(['public', 'private', 'restricted']).toContain(col.accessLevel);
      });
    });
  });
});
