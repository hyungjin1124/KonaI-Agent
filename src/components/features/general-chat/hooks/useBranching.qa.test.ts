/**
 * QA Edge Case Tests for useBranching Hook
 * Tests edge cases not covered by dev tests:
 * - Large branch counts
 * - Rapid operations
 * - Data boundary conditions
 * - State consistency after sequences of operations
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

describe('useBranching — QA Edge Cases', () => {
  // 3-1. Data boundary tests

  describe('빈 데이터 경계', () => {
    it('존재하지 않는 messageId에서 createBranch → 무시, 기존 분기 유지', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));

      const returnedId = (() => {
        let id = '';
        act(() => { id = result.current.createBranch('nonexistent-id'); });
        return id;
      })();

      expect(returnedId).toBe('primary'); // no-op
      expect(result.current.branches).toHaveLength(1);
      expect(result.current.activeMessages).toHaveLength(1);
    });

    it('존재하지 않는 branchId에 switchBranch → 무시', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.switchBranch('does-not-exist'));
      expect(result.current.activeBranchId).toBe('primary');
    });

    it('존재하지 않는 branchId에 deleteBranch → 무시', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));
      act(() => result.current.deleteBranch('does-not-exist'));

      expect(result.current.branches).toHaveLength(1);
      expect(result.current.activeMessages).toHaveLength(1);
    });

    it('존재하지 않는 branchId에 renameBranch → 무시 (에러 없음)', () => {
      const { result } = renderHook(() => useBranching());

      // Should not throw
      act(() => result.current.renameBranch('nonexistent', 'New Name'));
      expect(result.current.branches).toHaveLength(1);
    });
  });

  describe('대량 데이터', () => {
    it('10개 분기 생성 후 모든 분기가 고유 ID와 이름을 가짐', () => {
      const { result } = renderHook(() => useBranching());

      // Add messages
      act(() => result.current.addMessage(makeMsg('m1')));
      act(() => result.current.addMessage(makeMsg('m2', 'assistant')));

      const branchIds: string[] = [];
      for (let i = 0; i < 10; i++) {
        act(() => result.current.switchBranch('primary'));
        act(() => {
          const id = result.current.createBranch('m1');
          branchIds.push(id);
        });
      }

      // 1 primary + 10 new = 11
      expect(result.current.branches).toHaveLength(11);

      // All IDs unique
      const ids = result.current.branches.map((b) => b.id);
      expect(new Set(ids).size).toBe(11);

      // All names unique
      const names = result.current.branches.map((b) => b.name);
      expect(new Set(names).size).toBe(11);
    });

    it('50개 메시지 추가 후 분기 생성 → 이력 보존 정확', () => {
      const { result } = renderHook(() => useBranching());

      for (let i = 0; i < 50; i++) {
        act(() =>
          result.current.addMessage(
            makeMsg(`m${i}`, i % 2 === 0 ? 'user' : 'assistant')
          )
        );
      }

      expect(result.current.activeMessages).toHaveLength(50);

      // Fork at message 25
      act(() => {
        result.current.createBranch('m24');
      });

      // New branch should have messages 0-24 (25 messages)
      expect(result.current.activeMessages).toHaveLength(25);
      expect(result.current.activeMessages[0].id).toBe('m0');
      expect(result.current.activeMessages[24].id).toBe('m24');
    });
  });

  describe('특수 문자 / 긴 텍스트', () => {
    it('이모지와 특수 문자가 포함된 분기 이름', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));

      act(() => {
        result.current.createBranch('m1', '🔥 대안 분석 <script>alert(1)</script>');
      });

      const branch = result.current.branches.find(
        (b) => b.name === '🔥 대안 분석 <script>alert(1)</script>'
      );
      expect(branch).toBeDefined();
    });

    it('빈 문자열 이름으로 분기 생성', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));

      act(() => {
        result.current.createBranch('m1', '');
      });

      // Empty string name branch should exist
      const emptyNameBranch = result.current.branches.find((b) => b.name === '');
      expect(emptyNameBranch).toBeDefined();
    });
  });

  // 3-2. Interaction edge cases

  describe('빠른 연속 조작', () => {
    it('동일 메시지에서 연속 분기 생성 → 모두 독립적', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));
      act(() => result.current.addMessage(makeMsg('m2', 'assistant')));

      // Create 3 branches from same message rapidly
      const ids: string[] = [];
      act(() => {
        ids.push(result.current.createBranch('m1'));
      });
      // Switch back to create another from primary
      act(() => result.current.switchBranch('primary'));
      act(() => {
        ids.push(result.current.createBranch('m1'));
      });
      act(() => result.current.switchBranch('primary'));
      act(() => {
        ids.push(result.current.createBranch('m1'));
      });

      expect(ids[0]).not.toBe(ids[1]);
      expect(ids[1]).not.toBe(ids[2]);
      expect(result.current.branches).toHaveLength(4); // primary + 3
    });

    it('분기 생성 직후 삭제 → 깨끗한 상태 복원', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));

      let branchId = '';
      act(() => {
        branchId = result.current.createBranch('m1');
      });

      expect(result.current.activeBranchId).toBe(branchId);

      act(() => result.current.deleteBranch(branchId));

      expect(result.current.branches).toHaveLength(1);
      expect(result.current.activeBranchId).toBe('primary');
    });

    it('여러 분기 전환 후 메시지 추가 → 올바른 분기에 추가', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));

      let branch1 = '';
      act(() => {
        branch1 = result.current.createBranch('m1');
      });
      act(() => result.current.switchBranch('primary'));

      let branch2 = '';
      act(() => {
        branch2 = result.current.createBranch('m1');
      });

      // Now on branch2, add message
      act(() => result.current.addMessage(makeMsg('m-on-branch2', 'assistant')));

      // Switch to branch1
      act(() => result.current.switchBranch(branch1));
      expect(
        result.current.activeMessages.find((m) => m.id === 'm-on-branch2')
      ).toBeUndefined();

      // Switch to branch2
      act(() => result.current.switchBranch(branch2));
      expect(
        result.current.activeMessages.find((m) => m.id === 'm-on-branch2')
      ).toBeDefined();
    });
  });

  // 3-3. State transition tests

  describe('상태 전환', () => {
    it('resetBranching 후 새 메시지 추가 → 깨끗한 primary에 추가', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));
      act(() => result.current.createBranch('m1'));
      act(() => result.current.addMessage(makeMsg('m2', 'assistant')));

      act(() => result.current.resetBranching());

      expect(result.current.activeMessages).toHaveLength(0);
      expect(result.current.branches).toHaveLength(1);

      act(() => result.current.addMessage(makeMsg('m-new')));
      expect(result.current.activeMessages).toHaveLength(1);
      expect(result.current.activeMessages[0].id).toBe('m-new');
    });

    it('활성 분기 삭제 후 primary 메시지가 정확히 표시', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));
      act(() => result.current.addMessage(makeMsg('m2', 'assistant')));
      act(() => result.current.addMessage(makeMsg('m3')));

      let branchId = '';
      act(() => {
        branchId = result.current.createBranch('m1');
      });
      // Add branch-specific message
      act(() => result.current.addMessage(makeMsg('m-branch')));

      // Delete active branch
      act(() => result.current.deleteBranch(branchId));

      // Should be on primary with original messages
      expect(result.current.activeBranchId).toBe('primary');
      expect(result.current.activeMessages).toHaveLength(3);
      expect(result.current.activeMessages.map((m) => m.id)).toEqual([
        'm1',
        'm2',
        'm3',
      ]);
    });

    it('모든 비-primary 분기 삭제 → primary만 남음', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));

      const ids: string[] = [];
      for (let i = 0; i < 3; i++) {
        act(() => result.current.switchBranch('primary'));
        act(() => {
          ids.push(result.current.createBranch('m1'));
        });
      }

      expect(result.current.branches).toHaveLength(4);

      // Delete all non-primary
      for (const id of ids) {
        act(() => result.current.deleteBranch(id));
      }

      expect(result.current.branches).toHaveLength(1);
      expect(result.current.branches[0].id).toBe('primary');
      expect(result.current.activeBranchId).toBe('primary');
    });
  });

  describe('getBranchesAtMessage 정확성', () => {
    it('여러 메시지에서 분기 생성 → 각 메시지의 분기만 반환', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));
      act(() => result.current.addMessage(makeMsg('m2', 'assistant')));
      act(() => result.current.addMessage(makeMsg('m3')));

      // Branch from m1
      act(() => result.current.createBranch('m1'));
      act(() => result.current.switchBranch('primary'));
      // Branch from m2
      act(() => result.current.createBranch('m2'));
      act(() => result.current.switchBranch('primary'));
      // Another branch from m1
      act(() => result.current.createBranch('m1'));

      const atM1 = result.current.getBranchesAtMessage('m1');
      const atM2 = result.current.getBranchesAtMessage('m2');
      const atM3 = result.current.getBranchesAtMessage('m3');

      expect(atM1).toHaveLength(2);
      expect(atM2).toHaveLength(1);
      expect(atM3).toHaveLength(0);

      expect(result.current.hasBranches('m1')).toBe(true);
      expect(result.current.hasBranches('m2')).toBe(true);
      expect(result.current.hasBranches('m3')).toBe(false);
    });
  });

  describe('분기 체인 (분기에서 다시 분기)', () => {
    it('분기에서 새 분기 생성 → 독립적으로 동작', () => {
      const { result } = renderHook(() => useBranching());

      // Primary: m1, m2
      act(() => result.current.addMessage(makeMsg('m1')));
      act(() => result.current.addMessage(makeMsg('m2', 'assistant')));

      // Branch A from m1
      let branchA = '';
      act(() => {
        branchA = result.current.createBranch('m1');
      });

      // On Branch A: add m3
      act(() => result.current.addMessage(makeMsg('m3', 'assistant')));

      // Branch B from m3 (on Branch A!)
      let branchB = '';
      act(() => {
        branchB = result.current.createBranch('m3');
      });

      // Branch B should have: m1 (from A), m3 (from A)
      expect(result.current.activeBranchId).toBe(branchB);
      expect(result.current.activeMessages).toHaveLength(2);
      expect(result.current.activeMessages[0].id).toBe('m1');
      expect(result.current.activeMessages[1].id).toBe('m3');

      // Primary should still have m1, m2
      act(() => result.current.switchBranch('primary'));
      expect(result.current.activeMessages).toHaveLength(2);
      expect(result.current.activeMessages[0].id).toBe('m1');
      expect(result.current.activeMessages[1].id).toBe('m2');

      // Branch A should have m1, m3
      act(() => result.current.switchBranch(branchA));
      expect(result.current.activeMessages).toHaveLength(2);
      expect(result.current.activeMessages[0].id).toBe('m1');
      expect(result.current.activeMessages[1].id).toBe('m3');
    });
  });

  describe('messageCount 정확성', () => {
    it('메시지 추가 후 분기의 messageCount가 정확', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));
      act(() => result.current.addMessage(makeMsg('m2', 'assistant')));
      act(() => result.current.addMessage(makeMsg('m3')));

      expect(result.current.branches[0].messageCount).toBe(3);

      // Create branch at m2, which copies m1, m2 (2 messages)
      let branchId = '';
      act(() => {
        branchId = result.current.createBranch('m2');
      });

      const branch = result.current.branches.find((b) => b.id === branchId);
      expect(branch!.messageCount).toBe(2);

      // Add message to branch
      act(() => result.current.addMessage(makeMsg('m4')));
      const updatedBranch = result.current.branches.find((b) => b.id === branchId);
      expect(updatedBranch!.messageCount).toBe(3);
    });
  });
});
