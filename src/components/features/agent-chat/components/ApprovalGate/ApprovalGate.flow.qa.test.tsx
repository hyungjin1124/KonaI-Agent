/**
 * ApprovalGate — QA Flow Tests
 *
 * Tests complete user flows through the ApprovalGate component,
 * verifying state propagation and callback chains.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import type { ApprovalGateProps, ApprovalItem, ElicitationSchema, ApprovalGateResult } from './types';
import { ApprovalGate } from './ApprovalGate';

// Reuse same mocks
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

function getButtonByLabel(label: string) {
  const buttons = screen.getAllByRole('button');
  const btn = buttons.find((b) => b.textContent?.includes(label));
  if (!btn) throw new Error(`No button found containing "${label}"`);
  return btn;
}

// =============================================
// Flow 1: Complete Multi-Item Approval Flow
// =============================================

describe('Flow: Complete Multi-Item Approval', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('individual approve → individual approve → bulk approve remaining', async () => {
    const items: ApprovalItem[] = [
      { id: 'slide-1', title: '소개', status: 'pending' },
      { id: 'slide-2', title: '본문', status: 'pending' },
      { id: 'slide-3', title: '결론', status: 'pending' },
    ];
    const onApprove = vi.fn();
    const user = userEvent.setup();

    render(
      <ApprovalGate
        actionType="create"
        riskLevel="medium"
        title="슬라이드 개요 승인"
        items={items}
        onApprove={onApprove}
        onReject={vi.fn()}
      />,
    );

    // Step 1: Verify initial state
    expect(screen.getByText(/대기: 3/)).toBeInTheDocument();

    // Step 2: Approve slide 1
    await user.click(screen.getByLabelText('소개 승인'));
    expect(screen.getByText(/승인: 1/)).toBeInTheDocument();
    expect(screen.getByText(/대기: 2/)).toBeInTheDocument();

    // Step 3: Approve slide 2
    await user.click(screen.getByLabelText('본문 승인'));
    expect(screen.getByText(/승인: 2/)).toBeInTheDocument();
    expect(screen.getByText(/대기: 1/)).toBeInTheDocument();

    // Step 4: Click main approve (auto-approves remaining slide 3)
    await user.click(getButtonByLabel('승인'));

    // Verify final result
    expect(onApprove).toHaveBeenCalledWith(
      expect.objectContaining({
        decision: 'approved',
        approvedItemIds: expect.arrayContaining(['slide-1', 'slide-2', 'slide-3']),
        rejectedItemIds: [],
      }),
    );
  });
});

// =============================================
// Flow 2: Mixed Approval/Rejection Flow
// =============================================

describe('Flow: Mixed Approval and Rejection', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('approve some → reject some → bulk approve remaining', async () => {
    const items: ApprovalItem[] = [
      { id: '1', title: 'Item A', status: 'pending' },
      { id: '2', title: 'Item B', status: 'pending' },
      { id: '3', title: 'Item C', status: 'pending' },
      { id: '4', title: 'Item D', status: 'pending' },
    ];
    const onApprove = vi.fn();
    const user = userEvent.setup();

    render(
      <ApprovalGate
        actionType="modify"
        riskLevel="medium"
        title="혼합 승인"
        items={items}
        onApprove={onApprove}
        onReject={vi.fn()}
      />,
    );

    // Approve A, Reject B
    await user.click(screen.getByLabelText('Item A 승인'));
    await user.click(screen.getByLabelText('Item B 거절'));

    // Verify intermediate state
    expect(screen.getByText(/승인: 1/)).toBeInTheDocument();
    expect(screen.getByText(/거절: 1/)).toBeInTheDocument();
    expect(screen.getByText(/대기: 2/)).toBeInTheDocument();

    // Bulk approve (C and D become approved)
    await user.click(getButtonByLabel('승인'));

    const result: ApprovalGateResult = onApprove.mock.calls[0][0];
    expect(result.decision).toBe('approved');
    expect(result.approvedItemIds).toContain('1');
    expect(result.approvedItemIds).toContain('3');
    expect(result.approvedItemIds).toContain('4');
    expect(result.rejectedItemIds).toEqual(['2']);
  });
});

// =============================================
// Flow 3: Schema Fill + Approve Flow
// =============================================

describe('Flow: Schema Form Fill and Approve', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('fill form fields → approve → result includes form data', async () => {
    const schema: ElicitationSchema = {
      type: 'object',
      properties: {
        reason: { type: 'string', title: '사유', description: '사유를 입력하세요' },
        priority: { type: 'number', title: '우선순위', default: 1 },
        confirm: { type: 'boolean', title: '확인' },
      },
      required: ['reason'],
    };
    const onApprove = vi.fn();
    const user = userEvent.setup();

    render(
      <ApprovalGate
        actionType="execute"
        riskLevel="medium"
        title="스키마 승인"
        schema={schema}
        onApprove={onApprove}
        onReject={vi.fn()}
      />,
    );

    // Step 1: Fill reason field
    const reasonInput = screen.getByPlaceholderText('사유를 입력하세요');
    await user.clear(reasonInput);
    await user.type(reasonInput, '테스트 사유');

    // Step 2: Toggle confirm checkbox
    const confirmCheckbox = screen.getByTestId('checkbox-schema-confirm');
    await user.click(confirmCheckbox);

    // Step 3: Approve
    await user.click(getButtonByLabel('승인'));

    // Verify result
    expect(onApprove).toHaveBeenCalledWith(
      expect.objectContaining({
        decision: 'approved',
        schemaData: expect.objectContaining({
          reason: '테스트 사유',
          priority: 1, // default
          confirm: true,
        }),
      }),
    );
  });

  it('fill form + items → approve → both in result', async () => {
    const schema: ElicitationSchema = {
      type: 'object',
      properties: {
        comment: { type: 'string', title: 'Comment', description: 'Add comment' },
      },
    };
    const items: ApprovalItem[] = [
      { id: '1', title: 'Item 1', status: 'pending' },
    ];
    const onApprove = vi.fn();
    const user = userEvent.setup();

    render(
      <ApprovalGate
        actionType="modify"
        riskLevel="medium"
        title="Combined"
        schema={schema}
        items={items}
        onApprove={onApprove}
        onReject={vi.fn()}
      />,
    );

    // Fill comment
    const commentInput = screen.getByPlaceholderText('Add comment');
    await user.type(commentInput, 'LGTM');

    // Approve item 1
    await user.click(screen.getByLabelText('Item 1 승인'));

    // Main approve
    await user.click(getButtonByLabel('승인'));

    const result: ApprovalGateResult = onApprove.mock.calls[0][0];
    expect(result.approvedItemIds).toContain('1');
    expect(result.schemaData).toEqual(expect.objectContaining({ comment: 'LGTM' }));
  });
});

// =============================================
// Flow 4: Toast Auto-Dismiss Flow
// =============================================

describe('Flow: Toast Auto-Dismiss', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('low risk → toast appears → 5s → auto-approves', () => {
    const onApprove = vi.fn();

    render(
      <ApprovalGate
        actionType="create"
        riskLevel="low"
        title="자동 승인"
        onApprove={onApprove}
        onReject={vi.fn()}
      />,
    );

    // Toast should be visible
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('자동 승인')).toBeInTheDocument();

    // Wait 4.9 seconds — not yet
    act(() => {
      vi.advanceTimersByTime(4900);
    });
    expect(onApprove).not.toHaveBeenCalled();

    // Wait the remaining 0.1 seconds
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(onApprove).toHaveBeenCalledTimes(1);
  });
});

// =============================================
// Flow 5: Session Permission + Approve Flow
// =============================================

describe('Flow: Session Permission', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('enable session permission → approve → callback receives actionType', async () => {
    const onSessionPermissionChange = vi.fn();
    const onApprove = vi.fn();
    const user = userEvent.setup();

    render(
      <ApprovalGate
        actionType="delete"
        riskLevel="high"
        title="세션 허용 테스트"
        showSessionPermission
        onSessionPermissionChange={onSessionPermissionChange}
        onApprove={onApprove}
        onReject={vi.fn()}
      />,
    );

    // Step 1: Enable session permission
    const checkbox = screen.getByTestId('checkbox-session-permission');
    await user.click(checkbox);

    expect(onSessionPermissionChange).toHaveBeenCalledWith('delete', true);

    // Step 2: Approve
    await user.click(getButtonByLabel('승인'));

    expect(onApprove).toHaveBeenCalledWith(
      expect.objectContaining({ decision: 'approved' }),
    );
  });
});

// =============================================
// Flow 6: Modify Request Flow
// =============================================

describe('Flow: Modify Request', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('approve items partially → request modify → result includes partial state', async () => {
    const items: ApprovalItem[] = [
      { id: '1', title: 'Item A', status: 'pending' },
      { id: '2', title: 'Item B', status: 'pending' },
    ];
    const onModify = vi.fn();
    const user = userEvent.setup();

    render(
      <ApprovalGate
        actionType="modify"
        riskLevel="medium"
        title="수정 요청 테스트"
        items={items}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onModify={onModify}
        modifyLabel="수정 요청"
      />,
    );

    // Approve item 1 only
    await user.click(screen.getByLabelText('Item A 승인'));

    // Click modify
    await user.click(screen.getByText('수정 요청'));

    const result: ApprovalGateResult = onModify.mock.calls[0][0];
    expect(result.decision).toBe('modify');
    expect(result.approvedItemIds).toContain('1');
    // Item 2 still pending, not in rejected
    expect(result.rejectedItemIds).toEqual([]);
  });
});

// =============================================
// Flow 7: High-Risk Modal Keyboard Flow
// =============================================

describe('Flow: High-Risk Modal Keyboard', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('Enter key approves from modal', async () => {
    const onApprove = vi.fn();

    render(
      <ApprovalGate
        actionType="delete"
        riskLevel="high"
        title="위험 작업"
        onApprove={onApprove}
        onReject={vi.fn()}
      />,
    );

    // Directly fire keyDown event on dialog content (mock doesn't support focus propagation)
    const content = screen.getByTestId('dialog-content');
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    content.dispatchEvent(event);

    expect(onApprove).toHaveBeenCalledTimes(1);
  });
});
