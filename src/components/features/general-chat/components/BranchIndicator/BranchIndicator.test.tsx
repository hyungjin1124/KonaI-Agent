/**
 * Unit tests for BranchIndicator component
 * Tests: rendering, popover interaction, branch switching, branch creation, branch deletion
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BranchIndicator } from './BranchIndicator';
import type { BranchInfo } from '../../types';

// Mock lucide-react icons
vi.mock('../../../../icons', () => ({
  GitBranch: ({ size, ...props }: { size?: number; className?: string }) => (
    <span data-testid="icon-git-branch" {...props}>GitBranch</span>
  ),
  ChevronRight: ({ size, ...props }: { size?: number; className?: string }) => (
    <span data-testid="icon-chevron-right" {...props}>ChevronRight</span>
  ),
  Trash2: ({ size, ...props }: { size?: number; className?: string }) => (
    <span data-testid="icon-trash" {...props}>Trash</span>
  ),
}));

const makeBranches = (count: number): BranchInfo[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i === 0 ? 'primary' : `branch-${i}`,
    name: i === 0 ? '기본' : `분기 ${i + 1}`,
    forkPointMessageId: 'msg-1',
    createdAt: new Date(),
    messageCount: 3 + i,
  }));

describe('BranchIndicator', () => {
  const defaultProps = {
    messageId: 'msg-1',
    branches: makeBranches(3),
    activeBranchId: 'primary',
    onSwitchBranch: vi.fn(),
    onCreateBranch: vi.fn(),
    onDeleteBranch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Smoke test
  it('렌더링 시 분기 수 배지 표시', () => {
    render(<BranchIndicator {...defaultProps} />);

    const button = screen.getByRole('button', { name: /3개 분기/ });
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('3');
  });

  // Scenario 3 (must): AC3 인디케이터
  describe('AC3: 시각적 인디케이터', () => {
    it('GitBranch 아이콘과 분기 수 표시', () => {
      render(<BranchIndicator {...defaultProps} />);

      expect(screen.getByTestId('icon-git-branch')).toBeTruthy();
      expect(screen.getByText('3')).toBeTruthy();
    });
  });

  // Scenario 4 (must): AC4 분기 목록 + 전환
  describe('AC4: 분기 목록 표시 및 전환', () => {
    it('버튼 클릭 → 팝오버에 분기 목록 표시', async () => {
      const user = userEvent.setup();
      render(<BranchIndicator {...defaultProps} />);

      // Click the badge button
      await user.click(screen.getByRole('button', { name: /3개 분기/ }));

      // Popover should show branch list
      expect(screen.getByText('분기 목록')).toBeTruthy();
      expect(screen.getByText('기본')).toBeTruthy();
      expect(screen.getByText('분기 2')).toBeTruthy();
      expect(screen.getByText('분기 3')).toBeTruthy();
    });

    it('분기 클릭 → onSwitchBranch 호출 + 팝오버 닫힘', async () => {
      const user = userEvent.setup();
      render(<BranchIndicator {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /3개 분기/ }));
      await user.click(screen.getByText('분기 2'));

      expect(defaultProps.onSwitchBranch).toHaveBeenCalledWith('branch-1');
      // Popover should be closed
      expect(screen.queryByText('분기 목록')).toBeNull();
    });

    it('활성 분기에 하이라이트 표시', async () => {
      const user = userEvent.setup();
      render(<BranchIndicator {...defaultProps} activeBranchId="branch-1" />);

      await user.click(screen.getByRole('button', { name: /3개 분기/ }));

      // Find the parent div containing the active branch with bg-blue-50
      const activeItem = screen.getByText('분기 2').closest('div[class*="bg-blue-50"]');
      expect(activeItem).toBeTruthy();
    });
  });

  // Branch creation from popover
  describe('새 분기 만들기', () => {
    it('"새 분기 만들기" 클릭 → onCreateBranch 호출', async () => {
      const user = userEvent.setup();
      render(<BranchIndicator {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /3개 분기/ }));
      await user.click(screen.getByText('새 분기 만들기'));

      expect(defaultProps.onCreateBranch).toHaveBeenCalledWith('msg-1');
    });
  });

  // Branch deletion
  describe('분기 삭제', () => {
    it('non-primary 분기의 삭제 버튼 → onDeleteBranch 호출', async () => {
      const user = userEvent.setup();
      render(<BranchIndicator {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /3개 분기/ }));

      // Find delete button for "분기 2"
      const deleteBtn = screen.getByRole('button', { name: '분기 2 삭제' });
      await user.click(deleteBtn);

      expect(defaultProps.onDeleteBranch).toHaveBeenCalledWith('branch-1');
    });

    it('primary 분기에는 삭제 버튼 없음', async () => {
      const user = userEvent.setup();
      render(<BranchIndicator {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /3개 분기/ }));

      expect(screen.queryByRole('button', { name: '기본 삭제' })).toBeNull();
    });
  });

  // Popover toggle
  describe('팝오버 토글', () => {
    it('배지 재클릭 → 팝오버 닫힘', async () => {
      const user = userEvent.setup();
      render(<BranchIndicator {...defaultProps} />);

      const badge = screen.getByRole('button', { name: /3개 분기/ });
      await user.click(badge); // open
      expect(screen.getByText('분기 목록')).toBeTruthy();

      await user.click(badge); // close
      expect(screen.queryByText('분기 목록')).toBeNull();
    });
  });

  // Message count display
  describe('메시지 수 표시', () => {
    it('각 분기의 메시지 수 표시', async () => {
      const user = userEvent.setup();
      render(<BranchIndicator {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /3개 분기/ }));

      expect(screen.getByText('3개')).toBeTruthy();
      expect(screen.getByText('4개')).toBeTruthy();
      expect(screen.getByText('5개')).toBeTruthy();
    });
  });
});
