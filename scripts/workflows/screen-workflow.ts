/**
 * 화면 개발 전체 워크플로우 오케스트레이션
 * /screen:create, /screen:update 명령어 처리
 */

import * as path from 'path';
import * as fs from 'fs';
import { ReactGenerator, ScreenType, GenerationResult } from '../core/react-generator.js';
import { ServerManager, getServerManager } from '../core/server-manager.js';
import { CaptureEngine, getCaptureEngine } from '../core/capture-engine.js';
import { SpecBuilder, getSpecBuilder, SpecBuildResult } from '../core/spec-builder.js';
import { GitManager, getGitManager } from '../core/git-manager.js';
import { ScreenConfig } from '../../config/types.js';

export interface ScreenWorkflowOptions {
  screenName: string;
  screenNameEn: string;
  screenType: ScreenType;
  requirements: string;
  locale?: 'ko-KR' | 'en-US';
  autoCommit?: boolean;
  generateSpec?: boolean;
  skipCapture?: boolean;
}

export interface WorkflowResult {
  success: boolean;
  screenId: string;
  componentPath: string;
  screenshotPaths: string[];
  specPaths: {
    md?: string;
    docx?: string;
  };
  gitBranch?: string;
  commitHash?: string;
  duration: number;
  errors: string[];
}

export type WorkflowStep =
  | 'generate'
  | 'server'
  | 'capture'
  | 'spec'
  | 'git';

export interface WorkflowProgress {
  step: WorkflowStep;
  status: 'pending' | 'running' | 'completed' | 'failed';
  message?: string;
}

export class ScreenWorkflow {
  private reactGenerator: ReactGenerator;
  private serverManager: ServerManager;
  private captureEngine: CaptureEngine;
  private specBuilder: SpecBuilder;
  private gitManager: GitManager;

  private progressCallbacks: ((progress: WorkflowProgress) => void)[] = [];

  constructor() {
    this.reactGenerator = new ReactGenerator();
    this.serverManager = getServerManager();
    this.captureEngine = getCaptureEngine();
    this.specBuilder = getSpecBuilder();
    this.gitManager = getGitManager();
  }

  /**
   * 진행 상태 콜백 등록
   */
  onProgress(callback: (progress: WorkflowProgress) => void): void {
    this.progressCallbacks.push(callback);
  }

  /**
   * 진행 상태 알림
   */
  private notifyProgress(progress: WorkflowProgress): void {
    console.log(`[ScreenWorkflow] ${progress.step}: ${progress.status} - ${progress.message || ''}`);
    for (const callback of this.progressCallbacks) {
      callback(progress);
    }
  }

  /**
   * 새 화면 생성 워크플로우
   */
  async create(options: ScreenWorkflowOptions): Promise<WorkflowResult> {
    const startTime = Date.now();
    const result: WorkflowResult = {
      success: false,
      screenId: '',
      componentPath: '',
      screenshotPaths: [],
      specPaths: {},
      duration: 0,
      errors: [],
    };

    try {
      // 1. 화면 ID 생성
      const screenId = await this.generateScreenId();
      result.screenId = screenId;

      console.log(`\n${'='.repeat(60)}`);
      console.log(`[ScreenWorkflow] Creating new screen: ${screenId}`);
      console.log(`  Name: ${options.screenName} (${options.screenNameEn})`);
      console.log(`  Type: ${options.screenType}`);
      console.log(`${'='.repeat(60)}\n`);

      // 2. React 컴포넌트 생성
      this.notifyProgress({ step: 'generate', status: 'running', message: 'Generating React components...' });

      const generateResult = await this.reactGenerator.generate({
        screenId,
        screenName: options.screenName,
        screenNameEn: options.screenNameEn,
        screenType: options.screenType,
        requirements: options.requirements,
        outputDir: 'src/pages',
      });

      if (!generateResult.success) {
        throw new Error(`Generation failed: ${generateResult.error}`);
      }

      result.componentPath = generateResult.componentPath;
      this.notifyProgress({ step: 'generate', status: 'completed', message: `Created ${generateResult.files.length} files` });

      // 3. 개발 서버 시작
      if (!options.skipCapture) {
        this.notifyProgress({ step: 'server', status: 'running', message: 'Starting development server...' });

        await this.serverManager.start();
        this.notifyProgress({ step: 'server', status: 'completed', message: `Server running at ${this.serverManager.getUrl()}` });

        // 4. 스크린샷 캡처
        this.notifyProgress({ step: 'capture', status: 'running', message: 'Capturing screenshots...' });

        const screenConfig = this.createScreenConfig(screenId, options, generateResult.routePath);
        await this.captureEngine.startSession();
        const captureResults = await this.captureEngine.captureScreen(screenConfig);
        const manifest = await this.captureEngine.endSession();

        result.screenshotPaths = captureResults
          .filter(r => r.success)
          .map(r => r.screenshotPath);

        await this.captureEngine.saveManifest(manifest);
        this.notifyProgress({ step: 'capture', status: 'completed', message: `Captured ${result.screenshotPaths.length} screenshots` });
      }

      // 5. 명세서 생성
      if (options.generateSpec !== false) {
        this.notifyProgress({ step: 'spec', status: 'running', message: 'Generating specification documents...' });

        const screenConfig = this.createScreenConfig(screenId, options, result.componentPath);
        const specResult = await this.specBuilder.buildForScreen(screenConfig);

        result.specPaths = specResult.files;
        this.notifyProgress({ step: 'spec', status: 'completed', message: 'Generated MD and DOCX specs' });
      }

      // 6. Git 커밋
      if (options.autoCommit) {
        this.notifyProgress({ step: 'git', status: 'running', message: 'Committing changes...' });

        const branchName = await this.gitManager.createFeatureBranch(screenId);
        result.gitBranch = branchName;

        await this.gitManager.stageAll();
        const commitMessage = this.gitManager.formatCommitMessage(
          'feat',
          screenId,
          `${options.screenName} 화면 추가`
        );
        result.commitHash = await this.gitManager.commit(commitMessage);

        this.notifyProgress({ step: 'git', status: 'completed', message: `Committed to ${branchName}` });
      }

      result.success = true;
      console.log(`\n${'='.repeat(60)}`);
      console.log(`[ScreenWorkflow] Screen creation completed successfully!`);
      console.log(`  Screen ID: ${screenId}`);
      console.log(`  Component: ${result.componentPath}`);
      console.log(`  Duration: ${Date.now() - startTime}ms`);
      console.log(`${'='.repeat(60)}\n`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(errorMessage);
      console.error(`[ScreenWorkflow] Error: ${errorMessage}`);
    } finally {
      // 서버 정리
      if (this.serverManager.isRunning()) {
        await this.serverManager.stop();
      }

      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * 기존 화면 업데이트 워크플로우
   */
  async update(screenId: string, changes: string): Promise<WorkflowResult> {
    const startTime = Date.now();
    const result: WorkflowResult = {
      success: false,
      screenId,
      componentPath: '',
      screenshotPaths: [],
      specPaths: {},
      duration: 0,
      errors: [],
    };

    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`[ScreenWorkflow] Updating screen: ${screenId}`);
      console.log(`${'='.repeat(60)}\n`);

      // 1. 기존 화면 정보 조회
      const screenConfig = await this.getScreenConfig(screenId);
      if (!screenConfig) {
        throw new Error(`Screen not found: ${screenId}`);
      }

      result.componentPath = path.join('src/pages', this.toKebabCase(screenConfig.nameEn));

      // 2. 컴포넌트 업데이트 (Claude Code에서 직접 수정)
      this.notifyProgress({ step: 'generate', status: 'running', message: 'Ready for component updates...' });

      // 실제 코드 수정은 Claude Code가 수행
      // 여기서는 수정 준비만 함

      this.notifyProgress({ step: 'generate', status: 'completed', message: 'Component update ready' });

      // 3. 개발 서버 시작
      this.notifyProgress({ step: 'server', status: 'running', message: 'Starting development server...' });

      await this.serverManager.start();
      this.notifyProgress({ step: 'server', status: 'completed' });

      // 4. 스크린샷 재캡처
      this.notifyProgress({ step: 'capture', status: 'running', message: 'Re-capturing screenshots...' });

      await this.captureEngine.startSession();
      const captureResults = await this.captureEngine.captureScreen(screenConfig);
      const manifest = await this.captureEngine.endSession();

      result.screenshotPaths = captureResults
        .filter(r => r.success)
        .map(r => r.screenshotPath);

      await this.captureEngine.saveManifest(manifest);
      this.notifyProgress({ step: 'capture', status: 'completed', message: `Captured ${result.screenshotPaths.length} screenshots` });

      // 5. 명세서 버전 업데이트
      this.notifyProgress({ step: 'spec', status: 'running', message: 'Updating specification...' });

      const specResult = await this.specBuilder.buildForScreen(screenConfig);
      result.specPaths = specResult.files;

      this.notifyProgress({ step: 'spec', status: 'completed' });

      // 6. Git 커밋
      this.notifyProgress({ step: 'git', status: 'running', message: 'Committing changes...' });

      await this.gitManager.stageAll();
      const commitMessage = this.gitManager.formatCommitMessage(
        'update',
        screenId,
        changes.substring(0, 50)
      );
      result.commitHash = await this.gitManager.commit(commitMessage);

      this.notifyProgress({ step: 'git', status: 'completed' });

      result.success = true;
      console.log(`\n${'='.repeat(60)}`);
      console.log(`[ScreenWorkflow] Screen update completed!`);
      console.log(`${'='.repeat(60)}\n`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(errorMessage);
      console.error(`[ScreenWorkflow] Error: ${errorMessage}`);
    } finally {
      if (this.serverManager.isRunning()) {
        await this.serverManager.stop();
      }

      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * 화면 ID 생성
   */
  private async generateScreenId(): Promise<string> {
    const configPath = 'config/screen-states.json';
    let maxId = 0;

    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      for (const screen of config.screens || []) {
        const match = screen.id.match(/SCR-(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxId) maxId = num;
        }
      }
    }

    return `SCR-${String(maxId + 1).padStart(3, '0')}`;
  }

  /**
   * ScreenConfig 생성
   */
  private createScreenConfig(
    screenId: string,
    options: ScreenWorkflowOptions,
    routePath: string
  ): ScreenConfig {
    return {
      id: screenId,
      name: options.screenName,
      nameEn: options.screenNameEn,
      route: routePath.startsWith('/') ? routePath : `/${routePath}`,
      component: this.toPascalCase(options.screenNameEn),
      requiresAuth: false,
      states: [
        {
          stateId: 'initial',
          stateName: '초기 상태',
          description: '화면 최초 로드 상태',
        },
      ],
    };
  }

  /**
   * screen-states.json에서 화면 정보 조회
   */
  private async getScreenConfig(screenId: string): Promise<ScreenConfig | null> {
    const configPath = 'config/screen-states.json';

    if (!fs.existsSync(configPath)) {
      return null;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return config.screens.find((s: ScreenConfig) => s.id === screenId) || null;
  }

  /**
   * 문자열을 kebab-case로 변환
   */
  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * 문자열을 PascalCase로 변환
   */
  private toPascalCase(str: string): string {
    return str
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }
}

/**
 * 싱글톤 인스턴스
 */
let workflowInstance: ScreenWorkflow | null = null;

export function getScreenWorkflow(): ScreenWorkflow {
  if (!workflowInstance) {
    workflowInstance = new ScreenWorkflow();
  }
  return workflowInstance;
}
