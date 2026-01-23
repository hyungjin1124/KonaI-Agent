/**
 * GitManager 단위 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { exec, execSync } from 'child_process';
import { GitManager, GitConfig } from '../../scripts/core/git-manager';

// child_process 모듈 모킹
vi.mock('child_process', () => ({
  exec: vi.fn(),
  execSync: vi.fn(),
}));

vi.mock('util', () => ({
  promisify: (fn: typeof exec) => {
    return (...args: unknown[]) => {
      return new Promise((resolve, reject) => {
        (fn as Function)(...args, (err: Error | null, stdout: string) => {
          if (err) reject(err);
          else resolve({ stdout, stderr: '' });
        });
      });
    };
  },
}));

describe('GitManager', () => {
  let gitManager: GitManager;

  beforeEach(() => {
    gitManager = new GitManager();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCurrentBranch', () => {
    it('should return current branch name', async () => {
      vi.mocked(exec).mockImplementation((_cmd, _opts, callback) => {
        (callback as Function)(null, 'feature/test-branch\n');
        return {} as ReturnType<typeof exec>;
      });

      const branch = await gitManager.getCurrentBranch();

      expect(branch).toBe('feature/test-branch');
    });
  });

  describe('getStatus', () => {
    it('should parse git status correctly', async () => {
      // 첫 번째 호출: branch
      // 두 번째 호출: status
      let callCount = 0;
      vi.mocked(exec).mockImplementation((_cmd, _opts, callback) => {
        callCount++;
        if (callCount === 1) {
          (callback as Function)(null, 'main\n');
        } else {
          (callback as Function)(null, 'M  modified.ts\n?? untracked.ts\n');
        }
        return {} as ReturnType<typeof exec>;
      });

      const status = await gitManager.getStatus();

      expect(status.branch).toBe('main');
      expect(status.hasChanges).toBe(true);
    });

    it('should return hasChanges false when no changes', async () => {
      let callCount = 0;
      vi.mocked(exec).mockImplementation((_cmd, _opts, callback) => {
        callCount++;
        if (callCount === 1) {
          (callback as Function)(null, 'main\n');
        } else {
          (callback as Function)(null, '');
        }
        return {} as ReturnType<typeof exec>;
      });

      const status = await gitManager.getStatus();

      expect(status.hasChanges).toBe(false);
      expect(status.staged.length).toBe(0);
      expect(status.modified.length).toBe(0);
    });
  });

  describe('createFeatureBranch', () => {
    it('should create new branch with correct naming pattern', async () => {
      let createdBranch = '';
      vi.mocked(exec).mockImplementation((cmd, _opts, callback) => {
        if (cmd.includes('branch -vv')) {
          (callback as Function)(null, '* main abc123 Initial commit\n');
        } else if (cmd.includes('checkout -b')) {
          createdBranch = cmd.match(/checkout -b (\S+)/)?.[1] || '';
          (callback as Function)(null, '');
        }
        return {} as ReturnType<typeof exec>;
      });

      const branchName = await gitManager.createFeatureBranch('SCR-001');

      expect(branchName).toBe('feature/screen-scr-001');
    });
  });

  describe('formatCommitMessage', () => {
    it('should format commit message correctly', () => {
      const message = gitManager.formatCommitMessage('feat', 'SCR-001', '새 화면 추가');

      expect(message).toContain('feat');
      expect(message).toContain('SCR-001');
      expect(message).toContain('새 화면 추가');
    });
  });

  describe('commit', () => {
    it('should create commit with message', async () => {
      vi.mocked(exec).mockImplementation((cmd, _opts, callback) => {
        if (cmd.includes('branch --show-current')) {
          (callback as Function)(null, 'main\n');
        } else if (cmd.includes('status --porcelain')) {
          (callback as Function)(null, 'A  newfile.ts\n');
        } else if (cmd.includes('commit')) {
          (callback as Function)(null, '');
        } else if (cmd.includes('rev-parse')) {
          (callback as Function)(null, 'abc123\n');
        }
        return {} as ReturnType<typeof exec>;
      });

      const hash = await gitManager.commit('Test commit message');

      expect(hash).toBe('abc123');
    });

    it('should throw error when no staged changes', async () => {
      vi.mocked(exec).mockImplementation((cmd, _opts, callback) => {
        if (cmd.includes('branch --show-current')) {
          (callback as Function)(null, 'main\n');
        } else if (cmd.includes('status --porcelain')) {
          (callback as Function)(null, '');
        }
        return {} as ReturnType<typeof exec>;
      });

      await expect(gitManager.commit('Test')).rejects.toThrow('No staged changes');
    });
  });

  describe('isGitRepository', () => {
    it('should return true for git repository', () => {
      vi.mocked(execSync).mockReturnValue('.git');

      const result = gitManager.isGitRepository();

      expect(result).toBe(true);
    });

    it('should return false for non-git directory', () => {
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('Not a git repository');
      });

      const result = gitManager.isGitRepository();

      expect(result).toBe(false);
    });
  });
});
