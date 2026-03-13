/**
 * Unit tests for useBranching Hook
 * Tests: branch CRUD, message history preservation, edge cases
 *
 * @vitest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useBranching } from './useBranching';
import type { ChatMessage } from '../types';

function makeMsg(id: string, type: 'user' | 'assistant' = 'user', content = ''): Omit<ChatMessage, 'branchId'> {
  return { id, type, content: content || `msg-${id}`, timestamp: new Date() };
}

describe('useBranching', () => {
  // Smoke test
  it('초기 상태: primary 분기 1개, 메시지 0개', () => {
    const { result } = renderHook(() => useBranching());

    expect(result.current.branches).toHaveLength(1);
    expect(result.current.branches[0].id).toBe('primary');
    expect(result.current.branches[0].name).toBe('기본');
    expect(result.current.activeBranchId).toBe('primary');
    expect(result.current.activeMessages).toHaveLength(0);
  });

  // Scenario 1 (must): AC1 분기 생성
  describe('AC1: 분기 생성', () => {
    it('메시지가 있는 상태에서 createBranch 호출 → 새 분기 생성', () => {
      const { result } = renderHook(() => useBranching());

      // Add messages
      act(() => result.current.addMessage(makeMsg('m1')));
      act(() => result.current.addMessage(makeMsg('m2', 'assistant')));
      act(() => result.current.addMessage(makeMsg('m3')));

      // Create branch at m2
      let newBranchId: string;
      act(() => {
        newBranchId = result.current.createBranch('m2');
      });

      expect(result.current.branches).toHaveLength(2);
      expect(result.current.activeBranchId).toBe(newBranchId!);
      // New branch should be auto-named
      const newBranch = result.current.branches.find((b) => b.id === newBranchId!);
      expect(newBranch).toBeDefined();
      expect(newBranch!.name).toBe('분기 2');
      expect(newBranch!.forkPointMessageId).toBe('m2');
    });

    it('커스텀 이름으로 분기 생성', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));

      act(() => {
        result.current.createBranch('m1', '대안 분석');
      });

      const newBranch = result.current.branches.find((b) => b.name === '대안 분석');
      expect(newBranch).toBeDefined();
    });
  });

  // Scenario 2 (must): AC2 이력 보존
  describe('AC2: 분기 시 대화 이력 보존', () => {
    it('3개 메시지 후 2번째에서 분기 → 분기에 1,2번 메시지만 포함', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));
      act(() => result.current.addMessage(makeMsg('m2', 'assistant')));
      act(() => result.current.addMessage(makeMsg('m3')));

      // Create branch at m2 (fork point)
      act(() => {
        result.current.createBranch('m2');
      });

      // Active branch is the new one. It should contain m1, m2 only
      expect(result.current.activeMessages).toHaveLength(2);
      expect(result.current.activeMessages[0].id).toBe('m1');
      expect(result.current.activeMessages[1].id).toBe('m2');
    });

    it('분기된 메시지의 branchId가 새 분기 ID로 변경됨', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));
      act(() => result.current.addMessage(makeMsg('m2', 'assistant')));

      let newId: string;
      act(() => {
        newId = result.current.createBranch('m2');
      });

      result.current.activeMessages.forEach((m) => {
        expect(m.branchId).toBe(newId!);
      });
    });
  });

  // Scenario 6 (must): AC6 메시지 갱신
  describe('AC6: 분기 전환 시 메시지 갱신', () => {
    it('switchBranch 호출 → activeMessages가 해당 분기 메시지로 변경', () => {
      const { result } = renderHook(() => useBranching());

      // Add 3 messages on primary
      act(() => result.current.addMessage(makeMsg('m1')));
      act(() => result.current.addMessage(makeMsg('m2', 'assistant')));
      act(() => result.current.addMessage(makeMsg('m3')));

      // Create branch at m2
      let branchId: string;
      act(() => {
        branchId = result.current.createBranch('m2');
      });

      // Add a new message on the new branch
      act(() => result.current.addMessage(makeMsg('m4-branch')));

      // New branch: m1, m2, m4-branch
      expect(result.current.activeMessages).toHaveLength(3);

      // Switch back to primary
      act(() => result.current.switchBranch('primary'));
      expect(result.current.activeBranchId).toBe('primary');
      expect(result.current.activeMessages).toHaveLength(3); // m1, m2, m3
      expect(result.current.activeMessages[2].id).toBe('m3');

      // Switch back to new branch
      act(() => result.current.switchBranch(branchId!));
      expect(result.current.activeMessages).toHaveLength(3); // m1, m2, m4-branch
      expect(result.current.activeMessages[2].id).toBe('m4-branch');
    });

    it('존재하지 않는 branchId로 switchBranch → 무시', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.switchBranch('nonexistent'));
      expect(result.current.activeBranchId).toBe('primary');
    });
  });

  // Scenario 7 (must): AC7 분기 삭제
  describe('AC7: 분기 삭제', () => {
    it('deleteBranch 호출 → branches에서 제거, primary로 전환', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));
      act(() => result.current.addMessage(makeMsg('m2', 'assistant')));

      let branchId: string;
      act(() => {
        branchId = result.current.createBranch('m2');
      });

      expect(result.current.activeBranchId).toBe(branchId!);
      expect(result.current.branches).toHaveLength(2);

      act(() => result.current.deleteBranch(branchId!));

      expect(result.current.branches).toHaveLength(1);
      expect(result.current.activeBranchId).toBe('primary');
    });

    it('비활성 분기 삭제 → 활성 분기 유지', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));

      let branch1: string;
      act(() => {
        branch1 = result.current.createBranch('m1', '분기 A');
      });

      // Switch back to primary, add msg, create another branch
      act(() => result.current.switchBranch('primary'));
      act(() => result.current.addMessage(makeMsg('m2', 'assistant')));

      let branch2: string;
      act(() => {
        branch2 = result.current.createBranch('m2', '분기 B');
      });

      // Now on branch2, delete branch1
      act(() => result.current.deleteBranch(branch1!));
      expect(result.current.activeBranchId).toBe(branch2!);
      expect(result.current.branches).toHaveLength(2); // primary + branch2
    });
  });

  // Scenario 10 (should): 엣지 — 빈 세션에서 분기
  describe('엣지: 빈 세션에서 분기 생성', () => {
    it('메시지 없는 상태에서 createBranch → 기존 분기 ID 반환 (무시)', () => {
      const { result } = renderHook(() => useBranching());

      let returnedId: string;
      act(() => {
        returnedId = result.current.createBranch('nonexistent');
      });

      expect(returnedId!).toBe('primary'); // returns current active (no-op)
      expect(result.current.branches).toHaveLength(1);
    });
  });

  // Scenario 11 (should): primary 분기 삭제 시도
  describe('엣지: primary 분기 삭제 불가', () => {
    it('primary 분기 삭제 시도 → 무시', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.deleteBranch('primary'));
      expect(result.current.branches).toHaveLength(1);
      expect(result.current.activeBranchId).toBe('primary');
    });
  });

  // Scenario 12 (could): 분기 이름 충돌 시 자동 번호 부여
  describe('엣지: 분기 이름 충돌 시 자동 번호 부여', () => {
    it('동일 이름 자동 부여 시 번호 증가', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));
      act(() => result.current.addMessage(makeMsg('m2', 'assistant')));

      // Create first branch (auto name: "분기 2")
      act(() => result.current.createBranch('m1'));
      // Switch to primary to create another from there
      act(() => result.current.switchBranch('primary'));

      // Create second branch (auto name: "분기 3")
      act(() => result.current.createBranch('m2'));

      const names = result.current.branches.map((b) => b.name);
      expect(names).toContain('기본');
      expect(names).toContain('분기 2');
      expect(names).toContain('분기 3');
    });
  });

  // addMessage
  describe('addMessage', () => {
    it('메시지 추가 시 활성 분기에 추가되고 messageCount 증가', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));
      act(() => result.current.addMessage(makeMsg('m2', 'assistant')));

      expect(result.current.activeMessages).toHaveLength(2);
      expect(result.current.branches[0].messageCount).toBe(2);
    });

    it('branchId가 자동으로 활성 분기 ID로 설정됨', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));
      expect(result.current.activeMessages[0].branchId).toBe('primary');
    });
  });

  // getBranchesAtMessage / hasBranches
  describe('getBranchesAtMessage / hasBranches', () => {
    it('분기점 메시지에서 분기 목록 반환 (primary 제외)', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));
      act(() => result.current.addMessage(makeMsg('m2', 'assistant')));

      act(() => result.current.createBranch('m2'));

      const branchesAtM2 = result.current.getBranchesAtMessage('m2');
      expect(branchesAtM2).toHaveLength(1);
      expect(branchesAtM2[0].forkPointMessageId).toBe('m2');

      expect(result.current.hasBranches('m2')).toBe(true);
      expect(result.current.hasBranches('m1')).toBe(false);
    });
  });

  // renameBranch
  describe('renameBranch', () => {
    it('분기 이름 변경', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));

      let branchId: string;
      act(() => {
        branchId = result.current.createBranch('m1');
      });

      act(() => result.current.renameBranch(branchId!, '새 이름'));
      const branch = result.current.branches.find((b) => b.id === branchId!);
      expect(branch!.name).toBe('새 이름');
    });
  });

  // resetBranching
  describe('resetBranching', () => {
    it('초기 상태로 리셋', () => {
      const { result } = renderHook(() => useBranching());

      act(() => result.current.addMessage(makeMsg('m1')));
      act(() => result.current.createBranch('m1'));

      expect(result.current.branches.length).toBeGreaterThan(1);

      act(() => result.current.resetBranching());

      expect(result.current.branches).toHaveLength(1);
      expect(result.current.activeBranchId).toBe('primary');
      expect(result.current.activeMessages).toHaveLength(0);
    });
  });
});
