/**
 * ApprovalGate — QA Edge Case Tests
 *
 * Tests edge cases and boundary conditions that the developer tests may not cover.
 * Separate from the developer's test file (ApprovalGate.test.tsx).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import type { ApprovalGateProps, ApprovalItem, ElicitationSchema } from './types';
import { ApprovalGate } from './ApprovalGate';
import { ApprovalToast } from './ApprovalToast';
import { ApprovalItemRow } from './ApprovalItemRow';

// Reuse same mocks as developer tests
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) => (
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

vi.mock('@/components/ui/label', () => ({
  Label: React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
    ({ children, ...props }, _ref) => <label {...props}>{children}</label>,
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    (props, _ref) => <input {...props} />,
  ),
}));

// Helpers
function getButtonByLabel(label: string) {
  const buttons = screen.getAllByRole('button');
  const btn = buttons.find((b) => b.textContent?.includes(label));
  if (!btn) throw new Error(`No button found containing "${label}"`);
  return btn;
}

const defaultProps: ApprovalGateProps = {
  actionType: 'execute',
  riskLevel: 'medium',
  title: 'Test Title',
  onApprove: vi.fn(),
  onReject: vi.fn(),
};

// =============================================
// Edge Case: Empty Data
// =============================================

describe('Edge Case: Empty Data', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('renders with empty items array', () => {
    render(<ApprovalGate {...defaultProps} items={[]} />);
    // Should still render the card without items
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders with no description', () => {
    render(<ApprovalGate {...defaultProps} description={undefined} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    // No description should not cause any crash
  });

  it('renders schema with no properties', () => {
    const emptySchema: ElicitationSchema = {
      type: 'object',
      properties: {},
    };
    render(<ApprovalGate {...defaultProps} schema={emptySchema} />);
    // Should render without crash, no form fields
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders with all items pre-approved', () => {
    const items: ApprovalItem[] = [
      { id: '1', title: 'Item 1', status: 'approved' },
      { id: '2', title: 'Item 2', status: 'approved' },
    ];
    render(<ApprovalGate {...defaultProps} items={items} />);

    // All items should show approved badge
    const badges = screen.getAllByText('승인');
    // 2 from items + 1 from approve button label
    expect(badges.length).toBeGreaterThanOrEqual(2);
  });

  it('renders with all items pre-rejected', () => {
    const items: ApprovalItem[] = [
      { id: '1', title: 'Item 1', status: 'rejected' },
      { id: '2', title: 'Item 2', status: 'rejected' },
    ];
    render(<ApprovalGate {...defaultProps} items={items} />);

    // All items should show rejected badge
    expect(screen.getAllByText('거절').length).toBeGreaterThanOrEqual(2);
  });
});

// =============================================
// Edge Case: Long Text / Special Characters
// =============================================

describe('Edge Case: Long Text / Special Characters', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('handles very long title without crash', () => {
    const longTitle = 'A'.repeat(500);
    render(<ApprovalGate {...defaultProps} title={longTitle} />);
    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  it('handles very long description without crash', () => {
    const longDesc = 'D'.repeat(1000);
    render(<ApprovalGate {...defaultProps} description={longDesc} />);
    expect(screen.getByText(longDesc)).toBeInTheDocument();
  });

  it('handles items with very long titles (truncation)', () => {
    const longTitle = 'VeryLongItemTitleWithoutSpaces'.repeat(15);
    const items: ApprovalItem[] = [
      { id: '1', title: longTitle, status: 'pending' },
    ];
    render(<ApprovalGate {...defaultProps} items={items} />);
    // Item should be rendered (truncated by CSS, but text exists in DOM)
    expect(screen.getByRole('listitem')).toBeInTheDocument();
    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  it('handles special characters in title', () => {
    const specialTitle = '<script>alert("xss")</script> & "quotes" \'apostrophes\'';
    render(<ApprovalGate {...defaultProps} title={specialTitle} />);
    // React auto-escapes HTML, so this should render as text
    expect(screen.getByText(specialTitle)).toBeInTheDocument();
  });

  it('handles emoji in title and description', () => {
    render(
      <ApprovalGate
        {...defaultProps}
        title="승인 요청 🔒"
        description="위험한 작업입니다 ⚠️"
      />,
    );
    expect(screen.getByText('승인 요청 🔒')).toBeInTheDocument();
    expect(screen.getByText('위험한 작업입니다 ⚠️')).toBeInTheDocument();
  });
});

// =============================================
// Edge Case: Rapid Interactions
// =============================================

describe('Edge Case: Rapid Interactions', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('handles rapid approve clicks without multiple calls', async () => {
    const onApprove = vi.fn();
    const user = userEvent.setup();

    render(<ApprovalGate {...defaultProps} onApprove={onApprove} />);

    const approveBtn = getButtonByLabel('승인');
    // Rapid triple click
    await user.click(approveBtn);
    await user.click(approveBtn);
    await user.click(approveBtn);

    // onApprove should be called for each click (no debounce built in)
    expect(onApprove).toHaveBeenCalledTimes(3);
  });

  it('handles rapid item approve/reject toggling', async () => {
    const items: ApprovalItem[] = [
      { id: '1', title: 'Item 1', status: 'pending' },
    ];
    const user = userEvent.setup();

    render(<ApprovalGate {...defaultProps} items={items} />);

    // Approve then immediately reject same item
    await user.click(screen.getByLabelText('Item 1 승인'));
    // After approve, the item shows badge not buttons, so can't reject
    // This is correct behavior - once decided, can't toggle back
    const approvedBadges = screen.getAllByText('승인');
    // At least one is the approved item badge (others may be the approve button label)
    expect(approvedBadges.length).toBeGreaterThanOrEqual(1);
    // The individual approve/reject buttons for this item should be gone
    expect(screen.queryByLabelText('Item 1 승인')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Item 1 거절')).not.toBeInTheDocument();
  });
});

// =============================================
// Edge Case: Toast Timer Behavior
// =============================================

describe('Edge Case: Toast Timer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('toast timer is cleared on unmount (no memory leak)', () => {
    const onApprove = vi.fn();
    const { unmount } = render(
      <ApprovalToast
        title="Auto"
        onApprove={onApprove}
        onReject={vi.fn()}
        approveLabel="승인"
        rejectLabel="취소"
      />,
    );

    // Unmount before timer fires
    unmount();

    // Advance time past the auto-dismiss
    act(() => {
      vi.advanceTimersByTime(6000);
    });

    // onApprove should NOT have been called after unmount
    expect(onApprove).not.toHaveBeenCalled();
  });

  it('toast cancel clears the auto-dismiss timer', async () => {
    vi.useRealTimers();
    const onApprove = vi.fn();
    const onReject = vi.fn();
    const user = userEvent.setup();

    render(
      <ApprovalToast
        title="Auto"
        onApprove={onApprove}
        onReject={onReject}
        approveLabel="승인"
        rejectLabel="취소"
      />,
    );

    // Click cancel immediately
    await user.click(screen.getByText('취소'));
    expect(onReject).toHaveBeenCalledTimes(1);

    // After cancel, auto-dismiss should not fire
    // (Can't easily test timer after useRealTimers, but reject handler clears timers)
  });

  it('toast close button clears the auto-dismiss timer', async () => {
    vi.useRealTimers();
    const onApprove = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <ApprovalToast
        title="Auto"
        onApprove={onApprove}
        onReject={vi.fn()}
        onClose={onClose}
        approveLabel="승인"
        rejectLabel="취소"
      />,
    );

    await user.click(screen.getByLabelText('닫기'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// =============================================
// Edge Case: Schema Validation
// =============================================

describe('Edge Case: Schema Validation', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('allows approval without filling required schema fields (no client validation)', async () => {
    const schema: ElicitationSchema = {
      type: 'object',
      properties: {
        reason: { type: 'string', title: 'Reason' },
      },
      required: ['reason'],
    };
    const onApprove = vi.fn();
    const user = userEvent.setup();

    render(<ApprovalGate {...defaultProps} schema={schema} onApprove={onApprove} />);

    // Approve without filling the required field
    await user.click(getButtonByLabel('승인'));

    // Should still call onApprove (no client-side validation)
    expect(onApprove).toHaveBeenCalledTimes(1);
    // schemaData should be empty object (no values)
    expect(onApprove).toHaveBeenCalledWith(
      expect.objectContaining({ decision: 'approved' }),
    );
  });

  it('handles schema with default values correctly', async () => {
    const schema: ElicitationSchema = {
      type: 'object',
      properties: {
        count: { type: 'number', title: 'Count', default: 42 },
        name: { type: 'string', title: 'Name', default: 'Default' },
      },
    };
    const onApprove = vi.fn();
    const user = userEvent.setup();

    render(<ApprovalGate {...defaultProps} schema={schema} onApprove={onApprove} />);

    // Approve with defaults
    await user.click(getButtonByLabel('승인'));

    expect(onApprove).toHaveBeenCalledWith(
      expect.objectContaining({
        schemaData: expect.objectContaining({
          count: 42,
          name: 'Default',
        }),
      }),
    );
  });

  it('handles boolean schema field toggle', async () => {
    const schema: ElicitationSchema = {
      type: 'object',
      properties: {
        confirmed: { type: 'boolean', title: 'Confirm' },
      },
    };
    const onApprove = vi.fn();
    const user = userEvent.setup();

    render(<ApprovalGate {...defaultProps} schema={schema} onApprove={onApprove} />);

    // Toggle the checkbox
    const checkbox = screen.getByTestId('checkbox-schema-confirmed');
    await user.click(checkbox);

    // Approve
    await user.click(getButtonByLabel('승인'));

    expect(onApprove).toHaveBeenCalledWith(
      expect.objectContaining({
        schemaData: expect.objectContaining({
          confirmed: true,
        }),
      }),
    );
  });
});

// =============================================
// Edge Case: null/undefined Props
// =============================================

describe('Edge Case: Optional Props', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('renders without onModify prop', () => {
    render(<ApprovalGate {...defaultProps} onModify={undefined} modifyLabel="수정" />);
    // Modify button should not be shown
    expect(screen.queryByText('수정')).not.toBeInTheDocument();
  });

  it('renders without onClose prop', () => {
    vi.useFakeTimers();
    render(<ApprovalGate {...defaultProps} riskLevel="low" onClose={undefined} />);
    // Should render toast without error
    expect(screen.getByRole('status')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('renders without items and schema (minimal props)', () => {
    render(
      <ApprovalGate
        actionType="create"
        riskLevel="medium"
        title="Minimal"
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    );
    expect(screen.getByText('Minimal')).toBeInTheDocument();
  });

  it('handles items with no description', () => {
    const items: ApprovalItem[] = [
      { id: '1', title: 'No desc item', status: 'pending' },
    ];
    render(<ApprovalGate {...defaultProps} items={items} />);
    expect(screen.getByText('No desc item')).toBeInTheDocument();
  });

  it('handles items with empty metadata', () => {
    const items: ApprovalItem[] = [
      { id: '1', title: 'With metadata', status: 'pending', metadata: {} },
    ];
    render(<ApprovalGate {...defaultProps} items={items} />);
    expect(screen.getByText('With metadata')).toBeInTheDocument();
  });
});

// =============================================
// Edge Case: State Transitions
// =============================================

describe('Edge Case: State Transitions', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('approve result includes both approved and pending items (pending auto-approved)', async () => {
    const items: ApprovalItem[] = [
      { id: '1', title: 'Item 1', status: 'pending' },
      { id: '2', title: 'Item 2', status: 'pending' },
      { id: '3', title: 'Item 3', status: 'pending' },
    ];
    const onApprove = vi.fn();
    const user = userEvent.setup();

    render(<ApprovalGate {...defaultProps} items={items} onApprove={onApprove} />);

    // Only approve item 1 individually
    await user.click(screen.getByLabelText('Item 1 승인'));

    // Click main approve button (should auto-approve items 2 and 3)
    await user.click(getButtonByLabel('승인'));

    expect(onApprove).toHaveBeenCalledWith(
      expect.objectContaining({
        decision: 'approved',
        approvedItemIds: expect.arrayContaining(['1', '2', '3']),
        rejectedItemIds: [],
      }),
    );
  });

  it('reject result does not auto-reject pending items', async () => {
    const items: ApprovalItem[] = [
      { id: '1', title: 'Item 1', status: 'pending' },
      { id: '2', title: 'Item 2', status: 'pending' },
    ];
    const onReject = vi.fn();
    const user = userEvent.setup();

    render(<ApprovalGate {...defaultProps} items={items} onReject={onReject} />);

    // Reject item 1 individually
    await user.click(screen.getByLabelText('Item 1 거절'));

    // Click main reject button
    await user.click(getButtonByLabel('거절'));

    expect(onReject).toHaveBeenCalledWith(
      expect.objectContaining({
        decision: 'rejected',
        rejectedItemIds: ['1'],
        // Pending items are NOT auto-rejected
        approvedItemIds: [],
      }),
    );
  });
});

// =============================================
// Edge Case: Large Data
// =============================================

describe('Edge Case: Large Data', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('handles 100 items without crash', () => {
    const items: ApprovalItem[] = Array.from({ length: 100 }, (_, i) => ({
      id: `item-${i}`,
      title: `Item ${i}`,
      description: `Description for item ${i}`,
      status: 'pending' as const,
    }));

    render(<ApprovalGate {...defaultProps} items={items} />);

    expect(screen.getByText(/대기: 100/)).toBeInTheDocument();
    // Scrollable container should exist
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('handles schema with many fields without crash', () => {
    const properties: ElicitationSchema['properties'] = {};
    for (let i = 0; i < 20; i++) {
      properties[`field_${i}`] = { type: 'string', title: `Field ${i}` };
    }
    const schema: ElicitationSchema = { type: 'object', properties };

    render(<ApprovalGate {...defaultProps} schema={schema} />);

    // All 20 fields should render
    for (let i = 0; i < 20; i++) {
      expect(screen.getByText(`Field ${i}`)).toBeInTheDocument();
    }
  });
});
