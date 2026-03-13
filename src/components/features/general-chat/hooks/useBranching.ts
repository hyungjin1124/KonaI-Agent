import { useState, useCallback, useMemo } from 'react';
import type { ChatMessage, BranchInfo } from '../types';

const PRIMARY_BRANCH_ID = 'primary';

function generateId(): string {
  return `branch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function generateBranchName(existing: BranchInfo[]): string {
  const base = '분기';
  let num = existing.length + 1;
  const names = new Set(existing.map((b) => b.name));
  while (names.has(`${base} ${num}`)) {
    num++;
  }
  return `${base} ${num}`;
}

export interface UseBranchingReturn {
  branches: BranchInfo[];
  activeBranchId: string;
  activeMessages: ChatMessage[];
  createBranch: (forkPointMessageId: string, name?: string) => string;
  switchBranch: (branchId: string) => void;
  deleteBranch: (branchId: string) => void;
  renameBranch: (branchId: string, name: string) => void;
  addMessage: (message: Omit<ChatMessage, 'branchId'>) => void;
  getBranchesAtMessage: (messageId: string) => BranchInfo[];
  hasBranches: (messageId: string) => boolean;
  resetBranching: () => void;
}

export function useBranching(): UseBranchingReturn {
  const [branches, setBranches] = useState<BranchInfo[]>([
    {
      id: PRIMARY_BRANCH_ID,
      name: '기본',
      forkPointMessageId: '',
      createdAt: new Date(),
      messageCount: 0,
    },
  ]);
  const [activeBranchId, setActiveBranchId] = useState<string>(PRIMARY_BRANCH_ID);
  // Map branchId → messages for that branch
  const [messagesByBranch, setMessagesByBranch] = useState<Record<string, ChatMessage[]>>({
    [PRIMARY_BRANCH_ID]: [],
  });

  const activeMessages = useMemo(
    () => messagesByBranch[activeBranchId] ?? [],
    [messagesByBranch, activeBranchId]
  );

  const addMessage = useCallback(
    (message: Omit<ChatMessage, 'branchId'>) => {
      const fullMessage: ChatMessage = {
        ...message,
        branchId: activeBranchId,
      };
      setMessagesByBranch((prev) => ({
        ...prev,
        [activeBranchId]: [...(prev[activeBranchId] ?? []), fullMessage],
      }));
      setBranches((prev) =>
        prev.map((b) =>
          b.id === activeBranchId
            ? { ...b, messageCount: (prev.find((x) => x.id === activeBranchId)?.messageCount ?? 0) + 1 }
            : b
        )
      );
    },
    [activeBranchId]
  );

  const createBranch = useCallback(
    (forkPointMessageId: string, name?: string) => {
      const currentMessages = messagesByBranch[activeBranchId] ?? [];
      const forkIndex = currentMessages.findIndex((m) => m.id === forkPointMessageId);
      if (forkIndex === -1) return activeBranchId;

      const newId = generateId();
      const branchName = name ?? generateBranchName(branches);

      // Copy messages up to (and including) the fork point
      const copiedMessages = currentMessages.slice(0, forkIndex + 1).map((m) => ({
        ...m,
        branchId: newId,
      }));

      const newBranch: BranchInfo = {
        id: newId,
        name: branchName,
        forkPointMessageId,
        createdAt: new Date(),
        messageCount: copiedMessages.length,
      };

      setBranches((prev) => [...prev, newBranch]);
      setMessagesByBranch((prev) => ({
        ...prev,
        [newId]: copiedMessages,
      }));
      setActiveBranchId(newId);

      return newId;
    },
    [activeBranchId, messagesByBranch, branches]
  );

  const switchBranch = useCallback(
    (branchId: string) => {
      if (messagesByBranch[branchId] !== undefined) {
        setActiveBranchId(branchId);
      }
    },
    [messagesByBranch]
  );

  const deleteBranch = useCallback(
    (branchId: string) => {
      // Cannot delete primary branch
      if (branchId === PRIMARY_BRANCH_ID) return;
      // Cannot delete if only one branch
      if (branches.length <= 1) return;

      setBranches((prev) => prev.filter((b) => b.id !== branchId));
      setMessagesByBranch((prev) => {
        const next = { ...prev };
        delete next[branchId];
        return next;
      });

      // If deleting active branch, switch to primary
      if (activeBranchId === branchId) {
        setActiveBranchId(PRIMARY_BRANCH_ID);
      }
    },
    [activeBranchId, branches.length]
  );

  const renameBranch = useCallback((branchId: string, name: string) => {
    setBranches((prev) =>
      prev.map((b) => (b.id === branchId ? { ...b, name } : b))
    );
  }, []);

  const getBranchesAtMessage = useCallback(
    (messageId: string) => {
      return branches.filter(
        (b) => b.id !== PRIMARY_BRANCH_ID && b.forkPointMessageId === messageId
      );
    },
    [branches]
  );

  const hasBranches = useCallback(
    (messageId: string) => {
      return branches.some(
        (b) => b.id !== PRIMARY_BRANCH_ID && b.forkPointMessageId === messageId
      );
    },
    [branches]
  );

  const resetBranching = useCallback(() => {
    setBranches([
      {
        id: PRIMARY_BRANCH_ID,
        name: '기본',
        forkPointMessageId: '',
        createdAt: new Date(),
        messageCount: 0,
      },
    ]);
    setActiveBranchId(PRIMARY_BRANCH_ID);
    setMessagesByBranch({ [PRIMARY_BRANCH_ID]: [] });
  }, []);

  return {
    branches,
    activeBranchId,
    activeMessages,
    createBranch,
    switchBranch,
    deleteBranch,
    renameBranch,
    addMessage,
    getBranchesAtMessage,
    hasBranches,
    resetBranching,
  };
}
