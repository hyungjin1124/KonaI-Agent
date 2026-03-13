/**
 * QA Flow Tests for useBranching Hook
 * Tests complete user flows and state synchronization:
 * - Branch create → switch → message add → verify isolation
 * - All branches deleted → terminal state
 * - Session reset during active branch
 * - Dual state sync: branches array vs messagesByBranch map
 *
 * @vitest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useBranching } from './useBranching';
import type { ChatMessage } from '../types';

function makeMsg(
  id: string,
  type: 'user' | 'assistant' = 'user',
  content = ''
): Omit<ChatMessage, 'branchId'> {
  return { id, type, content: content || `msg-${id}`, timestamp: new Date() };
}

describe('useBranching — Flow QA Tests', () => {
  // Flow 1: Complete branch lifecycle
  describe('Flow 1: 분기 생명주기 — 생성 → 메시지 추가 → 전환 → 삭제', () => {
    it('전체 플로우가 상태 불일치 없이 동작', () => {
      const { result } = renderHook(() => useBranching());

      // Step 1: Add initial messages on primary
      act(() => result.current.addMessage(makeMsg('m1')));
      act(() => result.current.addMessage(makeMsg('m2', 'assistant')));
      act(() => result.current.addMessage(makeMsg('m3')));

      // Verify initial state
      expect(result.current.branches).toHaveLength(1);
      expect(result.current.activeMessages).toHaveLength(3);

      // Step 2: Create branch at m2
      let branchId = '';
      act(() => {
        branchId = result.current.createBranch('m2');
      });

      // Verify: auto-switched to new branch, messages forked correctly
      expect(result.current.activeBranchId).toBe(branchId);
      expect(result.current.activeMessages).toHaveLength(2); // m1, m2
      expect(result.current.branches).toHaveLength(2);

      // Step 3: Add messages on new branch
      act(() => result.current.addMessage(makeMsg('m4-branch', 'assistant')));
      act(() => result.current.addMessage(makeMsg('m5-branch')));

      expect(result.current.activeMessages).toHaveLength(4); // m1, m2, m4, m5

      // Step 4: Switch to primary — should see original messages
      act(() => result.current.switchBranch('primary'));
      expect(result.current.activeMessages).toHaveLength(3); // m1, m2, m3
      expect(result.current.activeMessages.map((m) => m.id)).toEqual(['m1', 'm2', 'm3']);

      // Step 5: Switch back to branch — messages preserved
      act(() => result.current.switchBranch(branchId));
      expect(result.current.activeMessages).toHaveLength(4);
      expect(result.current.activeMessages[2].id).toBe('m4-branch');

      // Step 6: Delete branch — back to primary
      act(() => result.current.deleteBranch(branchId));
      expect(result.current.activeBranchId).toBe('primary');
      expect(result.current.branches).toHaveLength(1);
      expect(result.current.activeMessages).toHaveLength(3);

      // Step 7: Verify branch data is fully cleaned up
      expect(result.current.getBranchesAtMessage('m2')).toHaveLength(0);
      expect(result.current.hasBranches('m2')).toBe(false);
    });
  });

  // Flow 2: Terminal state — all non-primary branches deleted
  describe('Flow 2: 종료 상태 — 모든 비-primary 분기 삭제', () => {
    it('3개 분기 순차 삭제 후 primary만 남고 메시지 정상', () => {
      const { result } = renderHook(() => useBranching());

      // Setup: add messages, create 3 branches
      act(() => result.current.addMessage(makeMsg('m1')));
      act(() => result.current.addMessage(makeMsg('m2', 'assistant')));

      const branchIds: string[] = [];
      for (let i = 0; i < 3; i++) {
        act(() => result.current.switchBranch('primary'));
        act(() => {
          branchIds.push(result.current.createBranch('m1'));
        });
      }

      expect(result.current.branches).toHaveLength(4); // primary + 3

      // Delete one by one
      // Currently on branchIds[2]. Delete it → should go to primary
      act(() => result.current.deleteBranch(branchIds[2]));
      expect(result.current.activeBranchId).toBe('primary');
      expect(result.current.branches).toHaveLength(3);

      act(() => result.current.deleteBranch(branchIds[1]));
      expect(result.current.branches).toHaveLength(2);

      act(() => result.current.deleteBranch(branchIds[0]));
      expect(result.current.branches).toHaveLength(1);

      // Only primary remains
      expect(result.current.branches[0].id).toBe('primary');
      expect(result.current.activeBranchId).toBe('primary');
      expect(result.current.activeMessages).toHaveLength(2); // m1, m2
    });
  });

  // Flow 3: Session reset during active branch
  describe('Flow 3: 분기 활성 상태에서 세션 리셋', () => {
    it('handleNewChat 시뮬레이션 — 분기 중 리셋 → 완전 초기화', () => {
      const { result } = renderHook(() => useBranching());

      // Setup
      act(() => result.current.addMessage(makeMsg('m1')));
      act(() => result.current.addMessage(makeMsg('m2', 'assistant')));

      let branchId = '';
      act(() => {
        branchId = result.current.createBranch('m1');
      });
      act(() => result.current.addMessage(makeMsg('m3-on-branch')));

      // Verify branch is active
      expect(result.current.activeBranchId).toBe(branchId);
      expect(result.current.activeMessages).toHaveLength(2); // m1 + m3-on-branch

      // Reset (simulating handleNewChat)
      act(() => result.current.resetBranching());

      // All state should be clean
      expect(result.current.branches).toHaveLength(1);
      expect(result.current.branches[0].id).toBe('primary');
      expect(result.current.activeBranchId).toBe('primary');
      expect(result.current.activeMessages).toHaveLength(0);

      // New messages go to fresh primary
      act(() => result.current.addMessage(makeMsg('m-fresh')));
      expect(result.current.activeMessages).toHaveLength(1);
      expect(result.current.activeMessages[0].id).toBe('m-fresh');
      expect(result.current.activeMessages[0].branchId).toBe('primary');
    });
  });

  // Flow 4: Dual state sync — branches array vs messagesByBranch consistency
  describe('Flow 4: 이중 상태 동기화 검증', () => {
    it('branches 배열과 activeMessages가 항상 일관됨', () => {
      const { result } = renderHook(() => useBranching());

      // Add messages
      for (let i = 1; i <= 5; i++) {
        act(() =>
          result.current.addMessage(
            makeMsg(`m${i}`, i % 2 === 0 ? 'assistant' : 'user')
          )
        );
      }

      // Create branch at m3
      let branch1 = '';
      act(() => {
        branch1 = result.current.createBranch('m3');
      });

      // Verify consistency: activeBranchId matches activeMessages' branchId
      expect(result.current.activeBranchId).toBe(branch1);
      result.current.activeMessages.forEach((m) => {
        expect(m.branchId).toBe(branch1);
      });

      // Switch to primary
      act(() => result.current.switchBranch('primary'));
      expect(result.current.activeBranchId).toBe('primary');
      result.current.activeMessages.forEach((m) => {
        expect(m.branchId).toBe('primary');
      });

      // Verify branch count matches branches array
      const branchFromBranches = result.current.branches.find(
        (b) => b.id === branch1
      );
      expect(branchFromBranches).toBeDefined();

      // Delete branch and verify cleanup
      act(() => result.current.deleteBranch(branch1));
      expect(result.current.branches.find((b) => b.id === branch1)).toBeUndefined();
    });
  });

  // Flow 5: Keyboard shortcut simulation (Ctrl+Shift+B on last assistant message)
  describe('Flow 5: 키보드 단축키 분기 시나리오', () => {
    it('마지막 assistant 메시지에서 분기 → 해당 메시지까지만 이력 보존', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1', 'user')));
      act(() => result.current.addMessage(makeMsg('m2', 'assistant')));
      act(() => result.current.addMessage(makeMsg('m3', 'user')));
      act(() => result.current.addMessage(makeMsg('m4', 'assistant')));
      act(() => result.current.addMessage(makeMsg('m5', 'user')));

      // Simulate Ctrl+Shift+B: find last assistant message and branch from it
      const lastAssistant = [...result.current.activeMessages]
        .reverse()
        .find((m) => m.type === 'assistant');
      expect(lastAssistant!.id).toBe('m4');

      act(() => {
        result.current.createBranch(lastAssistant!.id);
      });

      // New branch should have m1, m2, m3, m4 (up to m4 inclusive)
      expect(result.current.activeMessages).toHaveLength(4);
      expect(result.current.activeMessages.map((m) => m.id)).toEqual([
        'm1',
        'm2',
        'm3',
        'm4',
      ]);

      // Original primary still has all 5
      act(() => result.current.switchBranch('primary'));
      expect(result.current.activeMessages).toHaveLength(5);
    });
  });

  // Flow 6: Concurrent branches from same fork point
  describe('Flow 6: 동일 포크 지점에서 다중 분기', () => {
    it('3개 분기가 동일 메시지에서 포크 → 각자 독립 이력', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));
      act(() => result.current.addMessage(makeMsg('m2', 'assistant')));

      // Create 3 branches from m1
      const ids: string[] = [];
      for (let i = 0; i < 3; i++) {
        act(() => result.current.switchBranch('primary'));
        act(() => {
          ids.push(result.current.createBranch('m1'));
        });
      }

      // Add unique message to each branch
      for (let i = 0; i < 3; i++) {
        act(() => result.current.switchBranch(ids[i]));
        act(() =>
          result.current.addMessage(makeMsg(`unique-${i}`, 'assistant'))
        );
      }

      // Verify each branch has its own unique message
      for (let i = 0; i < 3; i++) {
        act(() => result.current.switchBranch(ids[i]));
        expect(
          result.current.activeMessages.some((m) => m.id === `unique-${i}`)
        ).toBe(true);
        // Should NOT have other branches' unique messages
        for (let j = 0; j < 3; j++) {
          if (j !== i) {
            expect(
              result.current.activeMessages.some(
                (m) => m.id === `unique-${j}`
              )
            ).toBe(false);
          }
        }
      }

      // getBranchesAtMessage should return all 3
      const atM1 = result.current.getBranchesAtMessage('m1');
      expect(atM1).toHaveLength(3);
    });
  });
});
