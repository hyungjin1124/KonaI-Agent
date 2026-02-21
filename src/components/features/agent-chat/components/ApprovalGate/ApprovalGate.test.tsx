/**
 * ApprovalGate — Unit Tests
 *
 * Tests for ApprovalGate (main), ApprovalToast, ApprovalInlineCard,
 * ApprovalModal, and ApprovalItemRow components.
 * Uses Vitest + React Testing Library with jsdom environment.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import type { ApprovalGateProps, ApprovalItem, ElicitationSchema } from './types';
import { ApprovalGate } from './ApprovalGate';
import { ApprovalToast } from './ApprovalToast';
import { ApprovalInlineCard } from './ApprovalInlineCard';
import { ApprovalModal } from './ApprovalModal';
import { ApprovalItemRow } from './ApprovalItemRow';

// -------------------------------------------------
// Mock Radix UI Dialog (not functional in jsdom)
// -------------------------------------------------
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => (
    open !== false ? <div data-testid="dialog-root" data-open={open}>{children}</div> : null
  ),
  DialogContent: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { role?: string }>(
    ({ children, role, ...props }, _ref) => (
      <div data-testid="dialog-content" role={role} {...props}>{children}</div>
    ),
  ),
  DialogHeader: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="dialog-header" {...props}>{children}</div>
  ),
  DialogTitle: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 data-testid="dialog-title" {...props}>{children}</h2>
  ),
  DialogDescription: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p data-testid="dialog-description" {...props}>{children}</p>
  ),
  DialogFooter: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="dialog-footer" {...props}>{children}</div>
  ),
}));

// Mock Radix UI Checkbox
vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: React.forwardRef<HTMLButtonElement, {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    id?: string;
  }>(({ checked, onCheckedChange, id, ...props }, _ref) => (
    <input
      type="checkbox"
      id={id}
      checked={!!checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      data-testid={id ? `checkbox-${id}` : 'checkbox'}
      {...props}
    />
  )),
}));

// Mock Radix UI Label
vi.mock('@/components/ui/label', () => ({
  Label: React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
    ({ children, ...props }, _ref) => <label {...props}>{children}</label>,
  ),
}));

// Mock Input
vi.mock('@/components/ui/input', () => ({
  Input: React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    (props, _ref) => <input {...props} />,
  ),
}));

// -------------------------------------------------
// Helpers
// -------------------------------------------------

/** Find a button element whose text content includes the given label */
function getButtonByLabel(label: string) {
  const buttons = screen.getAllByRole('button');
  const btn = buttons.find((b) => b.textContent?.includes(label));
  if (!btn) throw new Error(`No button found containing "${label}"`);
  return btn;
}

// -------------------------------------------------
// Test Fixtures
// -------------------------------------------------

const defaultProps: ApprovalGateProps = {
  actionType: 'execute',
  riskLevel: 'medium',
  title: 'API 호출 승인',
  onApprove: vi.fn(),
  onReject: vi.fn(),
};

const makeItems = (): ApprovalItem[] => [
  { id: 'item-1', title: '슬라이드 1', description: '소개 슬라이드', status: 'pending' },
  { id: 'item-2', title: '슬라이드 2', description: '본문 슬라이드', status: 'pending' },
  { id: 'item-3', title: '슬라이드 3', description: '결론 슬라이드', status: 'pending' },
];

const makeSchema = (): ElicitationSchema => ({
  type: 'object',
  properties: {
    reason: {
      type: 'string',
      title: '사유',
      description: '변경 사유를 입력하세요',
    },
    priority: {
      type: 'number',
      title: '우선순위',
      default: 1,
    },
    confirm: {
      type: 'boolean',
      title: '확인',
    },
  },
  required: ['reason'],
});

// =============================================
// ApprovalItemRow Tests
// =============================================

describe('ApprovalItemRow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders item title and description', () => {
    const item: ApprovalItem = { id: '1', title: 'Test Item', description: 'Desc', status: 'pending' };
    render(<ApprovalItemRow item={item} onApprove={vi.fn()} onReject={vi.fn()} />);

    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('Desc')).toBeInTheDocument();
  });

  it('renders approve/reject buttons for pending items', () => {
    const item: ApprovalItem = { id: '1', title: 'Pending Item', status: 'pending' };
    render(<ApprovalItemRow item={item} onApprove={vi.fn()} onReject={vi.fn()} />);

    expect(screen.getByLabelText('Pending Item 승인')).toBeInTheDocument();
    expect(screen.getByLabelText('Pending Item 거절')).toBeInTheDocument();
  });

  it('calls onApprove with item id when approve is clicked', async () => {
    const onApprove = vi.fn();
    const item: ApprovalItem = { id: 'item-42', title: 'Item', status: 'pending' };
    const user = userEvent.setup();

    render(<ApprovalItemRow item={item} onApprove={onApprove} onReject={vi.fn()} />);

    await user.click(screen.getByLabelText('Item 승인'));
    expect(onApprove).toHaveBeenCalledWith('item-42');
  });

  it('calls onReject with item id when reject is clicked', async () => {
    const onReject = vi.fn();
    const item: ApprovalItem = { id: 'item-42', title: 'Item', status: 'pending' };
    const user = userEvent.setup();

    render(<ApprovalItemRow item={item} onApprove={vi.fn()} onReject={onReject} />);

    await user.click(screen.getByLabelText('Item 거절'));
    expect(onReject).toHaveBeenCalledWith('item-42');
  });

  it('shows approved badge for approved items', () => {
    const item: ApprovalItem = { id: '1', title: 'Done Item', status: 'approved' };
    render(<ApprovalItemRow item={item} onApprove={vi.fn()} onReject={vi.fn()} />);

    expect(screen.getByText('승인')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows rejected badge for rejected items', () => {
    const item: ApprovalItem = { id: '1', title: 'Rejected Item', status: 'rejected' };
    render(<ApprovalItemRow item={item} onApprove={vi.fn()} onReject={vi.fn()} />);

    expect(screen.getByText('거절')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('has listitem role', () => {
    const item: ApprovalItem = { id: '1', title: 'Item', status: 'pending' };
    render(<ApprovalItemRow item={item} onApprove={vi.fn()} onReject={vi.fn()} />);

    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });
});

// =============================================
// ApprovalToast Tests
// =============================================

describe('ApprovalToast', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders title and description', () => {
    render(
      <ApprovalToast
        title="Toast Title"
        description="Toast Description"
        onApprove={vi.fn()}
        onReject={vi.fn()}
        approveLabel="승인"
        rejectLabel="취소"
      />
    );

    expect(screen.getByText('Toast Title')).toBeInTheDocument();
    expect(screen.getByText('Toast Description')).toBeInTheDocument();
  });

  it('has role="status" and aria-live="polite"', () => {
    render(
      <ApprovalToast
        title="Title"
        onApprove={vi.fn()}
        onReject={vi.fn()}
        approveLabel="승인"
        rejectLabel="취소"
      />
    );

    const toast = screen.getByRole('status');
    expect(toast).toHaveAttribute('aria-live', 'polite');
  });

  it('auto-dismisses after 5 seconds by calling onApprove', () => {
    const onApprove = vi.fn();
    render(
      <ApprovalToast
        title="Auto"
        onApprove={onApprove}
        onReject={vi.fn()}
        approveLabel="승인"
        rejectLabel="취소"
      />
    );

    expect(onApprove).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onApprove).toHaveBeenCalledTimes(1);
  });

  it('calls onReject when cancel button is clicked', async () => {
    vi.useRealTimers();
    const onReject = vi.fn();
    const user = userEvent.setup();

    render(
      <ApprovalToast
        title="Title"
        onApprove={vi.fn()}
        onReject={onReject}
        approveLabel="승인"
        rejectLabel="취소"
      />
    );

    await user.click(screen.getByText('취소'));
    expect(onReject).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close (X) button is clicked', async () => {
    vi.useRealTimers();
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <ApprovalToast
        title="Title"
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onClose={onClose}
        approveLabel="승인"
        rejectLabel="취소"
      />
    );

    await user.click(screen.getByLabelText('닫기'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// =============================================
// ApprovalInlineCard Tests
// =============================================

describe('ApprovalInlineCard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders title and description', () => {
    render(
      <ApprovalInlineCard
        title="Inline Title"
        description="Inline Description"
        onApprove={vi.fn()}
        onReject={vi.fn()}
        approveLabel="승인"
        rejectLabel="거절"
      />
    );

    expect(screen.getByText('Inline Title')).toBeInTheDocument();
    expect(screen.getByText('Inline Description')).toBeInTheDocument();
  });

  it('has role="alert" and aria-live="assertive"', () => {
    render(
      <ApprovalInlineCard
        title="Title"
        onApprove={vi.fn()}
        onReject={vi.fn()}
        approveLabel="승인"
        rejectLabel="거절"
      />
    );

    const card = screen.getByRole('alert');
    expect(card).toHaveAttribute('aria-live', 'assertive');
  });

  it('calls onApprove when approve button is clicked', async () => {
    const onApprove = vi.fn();
    const user = userEvent.setup();

    render(
      <ApprovalInlineCard
        title="Title"
        onApprove={onApprove}
        onReject={vi.fn()}
        approveLabel="승인"
        rejectLabel="거절"
      />
    );

    await user.click(getButtonByLabel('승인'));
    expect(onApprove).toHaveBeenCalledTimes(1);
  });

  it('calls onReject when reject button is clicked', async () => {
    const onReject = vi.fn();
    const user = userEvent.setup();

    render(
      <ApprovalInlineCard
        title="Title"
        onApprove={vi.fn()}
        onReject={onReject}
        approveLabel="승인"
        rejectLabel="거절"
      />
    );

    await user.click(getButtonByLabel('거절'));
    expect(onReject).toHaveBeenCalledTimes(1);
  });

  it('calls onApprove on Enter key', async () => {
    const onApprove = vi.fn();
    const user = userEvent.setup();

    render(
      <ApprovalInlineCard
        title="Title"
        onApprove={onApprove}
        onReject={vi.fn()}
        approveLabel="승인"
        rejectLabel="거절"
      />
    );

    const card = screen.getByRole('alert');
    card.focus();
    await user.keyboard('{Enter}');

    expect(onApprove).toHaveBeenCalledTimes(1);
  });

  it('calls onReject on Escape key', async () => {
    const onReject = vi.fn();
    const user = userEvent.setup();

    render(
      <ApprovalInlineCard
        title="Title"
        onApprove={vi.fn()}
        onReject={onReject}
        approveLabel="승인"
        rejectLabel="거절"
      />
    );

    const card = screen.getByRole('alert');
    card.focus();
    await user.keyboard('{Escape}');

    expect(onReject).toHaveBeenCalledTimes(1);
  });

  it('renders modify button when onModify and modifyLabel are provided', () => {
    render(
      <ApprovalInlineCard
        title="Title"
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onModify={vi.fn()}
        approveLabel="승인"
        rejectLabel="거절"
        modifyLabel="수정 요청"
      />
    );

    expect(screen.getByText('수정 요청')).toBeInTheDocument();
  });

  it('does not render modify button without onModify', () => {
    render(
      <ApprovalInlineCard
        title="Title"
        onApprove={vi.fn()}
        onReject={vi.fn()}
        approveLabel="승인"
        rejectLabel="거절"
        modifyLabel="수정 요청"
      />
    );

    expect(screen.queryByText('수정 요청')).not.toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <ApprovalInlineCard
        title="Title"
        onApprove={vi.fn()}
        onReject={vi.fn()}
        approveLabel="승인"
        rejectLabel="거절"
      >
        <span data-testid="child-content">Child</span>
      </ApprovalInlineCard>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('renders session permission checkbox', () => {
    render(
      <ApprovalInlineCard
        title="Title"
        onApprove={vi.fn()}
        onReject={vi.fn()}
        approveLabel="승인"
        rejectLabel="거절"
        sessionPermissionCheckbox={<span data-testid="session-perm">Session</span>}
      />
    );

    expect(screen.getByTestId('session-perm')).toBeInTheDocument();
  });
});

// =============================================
// ApprovalModal Tests
// =============================================

describe('ApprovalModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders in a dialog with alertdialog role', () => {
    render(
      <ApprovalModal
        title="Modal Title"
        description="Modal Description"
        onApprove={vi.fn()}
        onReject={vi.fn()}
        approveLabel="승인"
        rejectLabel="거절"
      />
    );

    expect(screen.getByTestId('dialog-root')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-content')).toHaveAttribute('role', 'alertdialog');
  });

  it('renders title and description', () => {
    render(
      <ApprovalModal
        title="Modal Title"
        description="Modal Description"
        onApprove={vi.fn()}
        onReject={vi.fn()}
        approveLabel="승인"
        rejectLabel="거절"
      />
    );

    expect(screen.getByText('Modal Title')).toBeInTheDocument();
    expect(screen.getByText('Modal Description')).toBeInTheDocument();
  });

  it('calls onApprove when approve button is clicked', async () => {
    const onApprove = vi.fn();
    const user = userEvent.setup();

    render(
      <ApprovalModal
        title="Title"
        onApprove={onApprove}
        onReject={vi.fn()}
        approveLabel="승인"
        rejectLabel="거절"
      />
    );

    await user.click(screen.getByText('승인'));
    expect(onApprove).toHaveBeenCalledTimes(1);
  });

  it('calls onReject when reject button is clicked', async () => {
    const onReject = vi.fn();
    const user = userEvent.setup();

    render(
      <ApprovalModal
        title="Title"
        onApprove={vi.fn()}
        onReject={onReject}
        approveLabel="승인"
        rejectLabel="거절"
      />
    );

    await user.click(screen.getByText('거절'));
    expect(onReject).toHaveBeenCalledTimes(1);
  });

  it('renders modify button when onModify and modifyLabel are provided', () => {
    render(
      <ApprovalModal
        title="Title"
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onModify={vi.fn()}
        approveLabel="승인"
        rejectLabel="거절"
        modifyLabel="수정"
      />
    );

    expect(screen.getByText('수정')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <ApprovalModal
        title="Title"
        onApprove={vi.fn()}
        onReject={vi.fn()}
        approveLabel="승인"
        rejectLabel="거절"
      >
        <div data-testid="modal-child">Content</div>
      </ApprovalModal>
    );

    expect(screen.getByTestId('modal-child')).toBeInTheDocument();
  });
});

// =============================================
// ApprovalGate (Main Component) Tests
// =============================================

describe('ApprovalGate', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // --- Smoke test ---

  it('renders without error for medium risk', () => {
    const { container } = render(<ApprovalGate {...defaultProps} />);
    expect(container.innerHTML).not.toBe('');
  });

  it('renders without error for low risk', () => {
    vi.useFakeTimers();
    const { container } = render(<ApprovalGate {...defaultProps} riskLevel="low" />);
    expect(container.innerHTML).not.toBe('');
    vi.useRealTimers();
  });

  it('renders without error for high risk', () => {
    const { container } = render(<ApprovalGate {...defaultProps} riskLevel="high" />);
    expect(container.innerHTML).not.toBe('');
  });

  // --- Risk-level routing ---

  it('renders toast for low risk', () => {
    vi.useFakeTimers();
    render(<ApprovalGate {...defaultProps} riskLevel="low" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('renders inline card for medium risk', () => {
    render(<ApprovalGate {...defaultProps} riskLevel="medium" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders modal for high risk', () => {
    render(<ApprovalGate {...defaultProps} riskLevel="high" />);
    expect(screen.getByTestId('dialog-root')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-content')).toHaveAttribute('role', 'alertdialog');
  });

  // --- Title and description ---

  it('displays title in inline card', () => {
    render(<ApprovalGate {...defaultProps} riskLevel="medium" />);
    expect(screen.getByText('API 호출 승인')).toBeInTheDocument();
  });

  it('displays description when provided', () => {
    render(
      <ApprovalGate {...defaultProps} riskLevel="medium" description="상세 설명" />
    );
    expect(screen.getByText('상세 설명')).toBeInTheDocument();
  });

  // --- Approve/Reject handlers ---

  it('calls onApprove with result when approved', async () => {
    const onApprove = vi.fn();
    const user = userEvent.setup();

    render(<ApprovalGate {...defaultProps} onApprove={onApprove} riskLevel="medium" />);

    await user.click(getButtonByLabel('승인'));
    expect(onApprove).toHaveBeenCalledTimes(1);
    expect(onApprove).toHaveBeenCalledWith(
      expect.objectContaining({ decision: 'approved' }),
    );
  });

  it('calls onReject with result when rejected', async () => {
    const onReject = vi.fn();
    const user = userEvent.setup();

    render(<ApprovalGate {...defaultProps} onReject={onReject} riskLevel="medium" />);

    await user.click(getButtonByLabel('거절'));
    expect(onReject).toHaveBeenCalledTimes(1);
    expect(onReject).toHaveBeenCalledWith(
      expect.objectContaining({ decision: 'rejected' }),
    );
  });

  it('calls onModify with result when modify is clicked', async () => {
    const onModify = vi.fn();
    const user = userEvent.setup();

    render(
      <ApprovalGate
        {...defaultProps}
        riskLevel="medium"
        onModify={onModify}
        modifyLabel="수정 요청"
      />,
    );

    await user.click(screen.getByText('수정 요청'));
    expect(onModify).toHaveBeenCalledTimes(1);
    expect(onModify).toHaveBeenCalledWith(
      expect.objectContaining({ decision: 'modify' }),
    );
  });

  // --- Multi-item mode (AC4) ---

  it('renders items in multi-item mode', () => {
    const items = makeItems();
    render(<ApprovalGate {...defaultProps} riskLevel="medium" items={items} />);

    expect(screen.getByText('슬라이드 1')).toBeInTheDocument();
    expect(screen.getByText('슬라이드 2')).toBeInTheDocument();
    expect(screen.getByText('슬라이드 3')).toBeInTheDocument();
  });

  it('renders item descriptions', () => {
    const items = makeItems();
    render(<ApprovalGate {...defaultProps} riskLevel="medium" items={items} />);

    expect(screen.getByText('소개 슬라이드')).toBeInTheDocument();
    expect(screen.getByText('본문 슬라이드')).toBeInTheDocument();
  });

  it('shows item summary counts', () => {
    const items = makeItems();
    render(<ApprovalGate {...defaultProps} riskLevel="medium" items={items} />);

    expect(screen.getByText(/대기: 3/)).toBeInTheDocument();
  });

  it('updates item status when individual item is approved', async () => {
    const items = makeItems();
    const user = userEvent.setup();

    render(<ApprovalGate {...defaultProps} riskLevel="medium" items={items} />);

    await user.click(screen.getByLabelText('슬라이드 1 승인'));

    // After approving item 1, counts should update
    expect(screen.getByText(/승인: 1/)).toBeInTheDocument();
    expect(screen.getByText(/대기: 2/)).toBeInTheDocument();
  });

  it('includes item ids in approval result', async () => {
    const items = makeItems();
    const onApprove = vi.fn();
    const user = userEvent.setup();

    render(
      <ApprovalGate {...defaultProps} riskLevel="medium" items={items} onApprove={onApprove} />,
    );

    // Approve item-1, reject item-2
    await user.click(screen.getByLabelText('슬라이드 1 승인'));
    await user.click(screen.getByLabelText('슬라이드 2 거절'));

    // Click the main approve button
    await user.click(getButtonByLabel('승인'));

    expect(onApprove).toHaveBeenCalledWith(
      expect.objectContaining({
        decision: 'approved',
        // item-1 was individually approved, item-3 becomes approved via "approve all pending"
        approvedItemIds: expect.arrayContaining(['item-1', 'item-3']),
        rejectedItemIds: ['item-2'],
      }),
    );
  });

  // --- Schema form (AC3) ---

  it('renders schema form fields', () => {
    const schema = makeSchema();
    render(<ApprovalGate {...defaultProps} riskLevel="medium" schema={schema} />);

    expect(screen.getByText('사유')).toBeInTheDocument();
    expect(screen.getByText('우선순위')).toBeInTheDocument();
    expect(screen.getByText('확인')).toBeInTheDocument();
  });

  it('renders required indicator for required fields', () => {
    const schema = makeSchema();
    render(<ApprovalGate {...defaultProps} riskLevel="medium" schema={schema} />);

    // "사유" label should have a red asterisk (required field)
    const reasonLabel = screen.getByText('사유');
    const parent = reasonLabel.closest('label');
    expect(parent?.textContent).toContain('*');
  });

  it('includes schema data in approval result', async () => {
    const schema = makeSchema();
    const onApprove = vi.fn();
    const user = userEvent.setup();

    render(
      <ApprovalGate
        {...defaultProps}
        riskLevel="medium"
        schema={schema}
        onApprove={onApprove}
      />,
    );

    // Type in the reason field
    const reasonInput = screen.getByPlaceholderText('변경 사유를 입력하세요');
    await user.clear(reasonInput);
    await user.type(reasonInput, 'Testing schema');

    // Approve
    await user.click(getButtonByLabel('승인'));

    expect(onApprove).toHaveBeenCalledWith(
      expect.objectContaining({
        decision: 'approved',
        schemaData: expect.objectContaining({
          reason: 'Testing schema',
          priority: 1, // default value
        }),
      }),
    );
  });

  it('renders enum fields as select dropdowns', () => {
    const schema: ElicitationSchema = {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          title: '등급',
          enum: ['A', 'B', 'C'],
        },
      },
    };

    render(<ApprovalGate {...defaultProps} riskLevel="medium" schema={schema} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  // --- Session permission (AC6) ---

  it('shows session permission checkbox when enabled', () => {
    render(
      <ApprovalGate
        {...defaultProps}
        riskLevel="medium"
        showSessionPermission
      />,
    );

    expect(screen.getByText('이 세션에서 동일 작업 자동 승인')).toBeInTheDocument();
  });

  it('does not show session permission by default', () => {
    render(<ApprovalGate {...defaultProps} riskLevel="medium" />);
    expect(screen.queryByText('이 세션에서 동일 작업 자동 승인')).not.toBeInTheDocument();
  });

  it('calls onSessionPermissionChange when checkbox is toggled', async () => {
    const onSessionPermissionChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ApprovalGate
        {...defaultProps}
        riskLevel="medium"
        showSessionPermission
        onSessionPermissionChange={onSessionPermissionChange}
      />,
    );

    const checkbox = screen.getByTestId('checkbox-session-permission');
    await user.click(checkbox);

    expect(onSessionPermissionChange).toHaveBeenCalledWith('execute', true);
  });

  // --- Custom labels ---

  it('uses custom approve/reject labels', () => {
    render(
      <ApprovalGate
        {...defaultProps}
        riskLevel="medium"
        approveLabel="확인"
        rejectLabel="취소"
      />,
    );

    expect(screen.getByText('확인')).toBeInTheDocument();
    expect(screen.getByText('취소')).toBeInTheDocument();
  });

  it('uses default labels when not provided', () => {
    render(<ApprovalGate {...defaultProps} riskLevel="medium" />);

    // Buttons should contain default labels (keyboard hints also contain text, so use button helper)
    expect(getButtonByLabel('승인')).toBeInTheDocument();
    expect(getButtonByLabel('거절')).toBeInTheDocument();
  });

  // --- Keyboard shortcuts (AC8) ---

  it('approves on Enter key in inline card', async () => {
    const onApprove = vi.fn();
    const user = userEvent.setup();

    render(<ApprovalGate {...defaultProps} riskLevel="medium" onApprove={onApprove} />);

    const card = screen.getByRole('alert');
    card.focus();
    await user.keyboard('{Enter}');

    expect(onApprove).toHaveBeenCalledTimes(1);
  });

  it('rejects on Escape key in inline card', async () => {
    const onReject = vi.fn();
    const user = userEvent.setup();

    render(<ApprovalGate {...defaultProps} riskLevel="medium" onReject={onReject} />);

    const card = screen.getByRole('alert');
    card.focus();
    await user.keyboard('{Escape}');

    expect(onReject).toHaveBeenCalledTimes(1);
  });

  // --- High-risk modal specifics ---

  it('renders modal with alertdialog role for high risk', () => {
    render(<ApprovalGate {...defaultProps} riskLevel="high" />);

    const content = screen.getByTestId('dialog-content');
    expect(content).toHaveAttribute('role', 'alertdialog');
  });

  it('renders items inside modal for high risk', () => {
    const items = makeItems();
    render(<ApprovalGate {...defaultProps} riskLevel="high" items={items} />);

    expect(screen.getByText('슬라이드 1')).toBeInTheDocument();
    expect(screen.getByText('슬라이드 2')).toBeInTheDocument();
  });

  // --- Low-risk toast specifics ---

  it('auto-approves after timeout for low risk', () => {
    vi.useFakeTimers();
    const onApprove = vi.fn();

    render(<ApprovalGate {...defaultProps} riskLevel="low" onApprove={onApprove} />);

    expect(onApprove).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onApprove).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
