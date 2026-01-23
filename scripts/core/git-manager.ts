/**
 * Git 워크플로우 자동화
 */

import { exec, execSync } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface GitConfig {
  defaultBranch: string;
  featureBranchPrefix: string;
  commitMessageFormat: string;
  autoPush: boolean;
}

export interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  date: string;
}

export interface BranchInfo {
  name: string;
  current: boolean;
  tracking?: string;
  ahead?: number;
  behind?: number;
}

export interface GitStatus {
  branch: string;
  staged: string[];
  modified: string[];
  untracked: string[];
  deleted: string[];
  hasChanges: boolean;
}

const DEFAULT_CONFIG: GitConfig = {
  defaultBranch: 'main',
  featureBranchPrefix: 'feature/screen-',
  commitMessageFormat: '[{type}] {screenId}: {description}',
  autoPush: false,
};

export class GitManager {
  private config: GitConfig;
  private cwd: string;

  constructor(config: Partial<GitConfig> = {}, cwd?: string) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cwd = cwd || process.cwd();
  }

  /**
   * Git 명령 실행
   */
  private async git(command: string): Promise<string> {
    try {
      const { stdout } = await execAsync(`git ${command}`, { cwd: this.cwd });
      return stdout.trim();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Git command failed: ${message}`);
    }
  }

  /**
   * Git 명령 실행 (동기)
   */
  private gitSync(command: string): string {
    try {
      return execSync(`git ${command}`, { cwd: this.cwd, encoding: 'utf-8' }).trim();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Git command failed: ${message}`);
    }
  }

  /**
   * 현재 상태 조회
   */
  async getStatus(): Promise<GitStatus> {
    const branch = await this.getCurrentBranch();
    const statusOutput = await this.git('status --porcelain');

    const staged: string[] = [];
    const modified: string[] = [];
    const untracked: string[] = [];
    const deleted: string[] = [];

    const lines = statusOutput.split('\n').filter(Boolean);

    for (const line of lines) {
      const indexStatus = line[0];
      const workTreeStatus = line[1];
      const filePath = line.slice(3);

      // Staged changes
      if (indexStatus === 'A' || indexStatus === 'M' || indexStatus === 'D') {
        staged.push(filePath);
      }

      // Working tree changes
      if (workTreeStatus === 'M') {
        modified.push(filePath);
      } else if (workTreeStatus === 'D') {
        deleted.push(filePath);
      } else if (indexStatus === '?' && workTreeStatus === '?') {
        untracked.push(filePath);
      }
    }

    return {
      branch,
      staged,
      modified,
      untracked,
      deleted,
      hasChanges: staged.length > 0 || modified.length > 0 || untracked.length > 0 || deleted.length > 0,
    };
  }

  /**
   * 현재 브랜치 조회
   */
  async getCurrentBranch(): Promise<string> {
    return this.git('branch --show-current');
  }

  /**
   * Feature 브랜치 생성
   */
  async createFeatureBranch(screenId: string): Promise<string> {
    const branchName = `${this.config.featureBranchPrefix}${screenId.toLowerCase()}`;

    // 기존 브랜치 확인
    const branches = await this.getBranches();
    const existingBranch = branches.find(b => b.name === branchName);

    if (existingBranch) {
      console.log(`[GitManager] Branch ${branchName} already exists, checking out...`);
      await this.git(`checkout ${branchName}`);
    } else {
      console.log(`[GitManager] Creating new branch: ${branchName}`);
      await this.git(`checkout -b ${branchName}`);
    }

    return branchName;
  }

  /**
   * 브랜치 목록 조회
   */
  async getBranches(): Promise<BranchInfo[]> {
    const output = await this.git('branch -vv');
    const branches: BranchInfo[] = [];

    const lines = output.split('\n').filter(Boolean);

    for (const line of lines) {
      const current = line.startsWith('*');
      const parts = line.replace('*', '').trim().split(/\s+/);
      const name = parts[0];

      // 트래킹 브랜치 정보 파싱
      const trackingMatch = line.match(/\[([^\]]+)\]/);
      let tracking: string | undefined;
      let ahead: number | undefined;
      let behind: number | undefined;

      if (trackingMatch) {
        const trackingInfo = trackingMatch[1];
        const trackingParts = trackingInfo.split(':');
        tracking = trackingParts[0];

        if (trackingParts[1]) {
          const aheadMatch = trackingParts[1].match(/ahead (\d+)/);
          const behindMatch = trackingParts[1].match(/behind (\d+)/);
          if (aheadMatch) ahead = parseInt(aheadMatch[1], 10);
          if (behindMatch) behind = parseInt(behindMatch[1], 10);
        }
      }

      branches.push({ name, current, tracking, ahead, behind });
    }

    return branches;
  }

  /**
   * 파일 스테이징
   */
  async stageFiles(files: string[]): Promise<void> {
    if (files.length === 0) {
      console.log('[GitManager] No files to stage');
      return;
    }

    const fileList = files.map(f => `"${f}"`).join(' ');
    await this.git(`add ${fileList}`);
    console.log(`[GitManager] Staged ${files.length} file(s)`);
  }

  /**
   * 모든 변경 파일 스테이징
   */
  async stageAll(): Promise<void> {
    await this.git('add -A');
    console.log('[GitManager] Staged all changes');
  }

  /**
   * 커밋 생성
   */
  async commit(message: string, files?: string[]): Promise<string> {
    if (files && files.length > 0) {
      await this.stageFiles(files);
    }

    // 스테이징된 파일 확인
    const status = await this.getStatus();
    if (status.staged.length === 0) {
      throw new Error('No staged changes to commit');
    }

    // 커밋 메시지에서 특수문자 이스케이프
    const escapedMessage = message.replace(/"/g, '\\"');

    await this.git(`commit -m "${escapedMessage}"`);
    const hash = await this.git('rev-parse --short HEAD');

    console.log(`[GitManager] Created commit: ${hash}`);
    return hash;
  }

  /**
   * 원격 저장소로 푸시
   */
  async push(branch?: string): Promise<void> {
    const currentBranch = branch || await this.getCurrentBranch();

    // 원격 브랜치 존재 여부 확인
    try {
      await this.git(`rev-parse --verify origin/${currentBranch}`);
      await this.git(`push origin ${currentBranch}`);
    } catch {
      // 원격에 브랜치가 없으면 -u 옵션으로 푸시
      await this.git(`push -u origin ${currentBranch}`);
    }

    console.log(`[GitManager] Pushed to origin/${currentBranch}`);
  }

  /**
   * 대상 브랜치로 머지
   */
  async mergeToBranch(targetBranch: string): Promise<void> {
    const currentBranch = await this.getCurrentBranch();

    // 대상 브랜치로 체크아웃
    await this.git(`checkout ${targetBranch}`);

    // 최신 상태로 풀
    try {
      await this.git('pull');
    } catch {
      console.log('[GitManager] Pull failed, continuing with local state');
    }

    // 머지 수행
    await this.git(`merge ${currentBranch}`);
    console.log(`[GitManager] Merged ${currentBranch} into ${targetBranch}`);
  }

  /**
   * 변경된 파일 목록 조회
   */
  async getChangedFiles(base?: string): Promise<string[]> {
    const baseBranch = base || this.config.defaultBranch;

    try {
      const output = await this.git(`diff --name-only ${baseBranch}...HEAD`);
      return output.split('\n').filter(Boolean);
    } catch {
      // 브랜치가 없는 경우 현재 상태의 변경 파일 반환
      const status = await this.getStatus();
      return [...status.staged, ...status.modified, ...status.untracked];
    }
  }

  /**
   * 최근 커밋 로그 조회
   */
  async getRecentCommits(count: number = 5): Promise<CommitInfo[]> {
    const format = '%H|%s|%an|%ai';
    const output = await this.git(`log -${count} --format="${format}"`);
    const commits: CommitInfo[] = [];

    const lines = output.split('\n').filter(Boolean);

    for (const line of lines) {
      const [hash, message, author, date] = line.split('|');
      commits.push({ hash, message, author, date });
    }

    return commits;
  }

  /**
   * 커밋 메시지 포맷팅
   */
  formatCommitMessage(type: string, screenId: string, description: string): string {
    return this.config.commitMessageFormat
      .replace('{type}', type)
      .replace('{screenId}', screenId)
      .replace('{description}', description);
  }

  /**
   * 화면 관련 파일 변경 확인
   */
  async getChangedScreenIds(): Promise<string[]> {
    const changedFiles = await this.getChangedFiles();
    const screenIds = new Set<string>();

    // src/pages/ 하위 변경 파일에서 화면 ID 추출
    for (const file of changedFiles) {
      const match = file.match(/src\/pages\/([^/]+)/);
      if (match) {
        // kebab-case를 screen ID로 변환 (예: customer-management -> SCR-XXX)
        // 실제로는 screen-states.json에서 매핑을 찾아야 함
        screenIds.add(match[1]);
      }
    }

    return Array.from(screenIds);
  }

  /**
   * 스테이징 취소
   */
  async unstage(files?: string[]): Promise<void> {
    if (files && files.length > 0) {
      const fileList = files.map(f => `"${f}"`).join(' ');
      await this.git(`restore --staged ${fileList}`);
    } else {
      await this.git('restore --staged .');
    }
    console.log('[GitManager] Unstaged files');
  }

  /**
   * 변경 사항 되돌리기
   */
  async discardChanges(files?: string[]): Promise<void> {
    if (files && files.length > 0) {
      const fileList = files.map(f => `"${f}"`).join(' ');
      await this.git(`checkout -- ${fileList}`);
    } else {
      await this.git('checkout -- .');
    }
    console.log('[GitManager] Discarded changes');
  }

  /**
   * 태그 생성
   */
  async createTag(tagName: string, message?: string): Promise<void> {
    if (message) {
      await this.git(`tag -a ${tagName} -m "${message}"`);
    } else {
      await this.git(`tag ${tagName}`);
    }
    console.log(`[GitManager] Created tag: ${tagName}`);
  }

  /**
   * 원격 저장소 URL 조회
   */
  async getRemoteUrl(): Promise<string> {
    return this.git('remote get-url origin');
  }

  /**
   * Git 초기화 여부 확인
   */
  isGitRepository(): boolean {
    try {
      this.gitSync('rev-parse --git-dir');
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 싱글톤 인스턴스
 */
let gitInstance: GitManager | null = null;

export function getGitManager(config?: Partial<GitConfig>): GitManager {
  if (!gitInstance) {
    gitInstance = new GitManager(config);
  }
  return gitInstance;
}

export function resetGitManager(): void {
  gitInstance = null;
}
