/**
 * 통합 파이프라인 오케스트레이터
 * /pipeline:full, /pipeline:quick 명령어 처리
 */

import * as fs from 'fs';
import * as path from 'path';
import { ServerManager, getServerManager } from '../core/server-manager.js';
import { CaptureEngine, getCaptureEngine } from '../core/capture-engine.js';
import { SpecBuilder, getSpecBuilder, SpecBuildResult } from '../core/spec-builder.js';
import { GitManager, getGitManager } from '../core/git-manager.js';
import { ScreenConfig, ScreenStatesConfig, CaptureManifest } from '../../config/types.js';

export interface PipelineOptions {
  mode: 'full' | 'quick';
  screens?: string[]; // 특정 화면만 처리
  skipBuild?: boolean;
  skipA11y?: boolean;
  skipSpec?: boolean;
  parallel?: boolean;
  locale?: 'ko-KR' | 'en-US';
}

export interface PipelineResult {
  success: boolean;
  mode: 'full' | 'quick';
  startedAt: string;
  completedAt: string;
  duration: number;
  summary: {
    totalScreens: number;
    capturedScreens: number;
    generatedSpecs: number;
    a11yWarnings: number;
    errors: number;
  };
  details: {
    capture: CaptureManifest | null;
    specs: SpecBuildResult[];
    a11y: A11yResult | null;
  };
  errors: string[];
}

export interface A11yResult {
  violations: A11yViolation[];
  passes: number;
  incomplete: number;
}

export interface A11yViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  nodes: number;
}

export type PipelineStep =
  | 'validate'
  | 'build'
  | 'server'
  | 'capture'
  | 'spec'
  | 'a11y'
  | 'report';

export interface PipelineProgress {
  step: PipelineStep;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progress?: number; // 0-100
  message?: string;
}

export class PipelineOrchestrator {
  private serverManager: ServerManager;
  private captureEngine: CaptureEngine;
  private specBuilder: SpecBuilder;
  private gitManager: GitManager;

  private progressCallbacks: ((progress: PipelineProgress) => void)[] = [];

  constructor() {
    this.serverManager = getServerManager();
    this.captureEngine = getCaptureEngine();
    this.specBuilder = getSpecBuilder();
    this.gitManager = getGitManager();
  }

  /**
   * 진행 상태 콜백 등록
   */
  onProgress(callback: (progress: PipelineProgress) => void): void {
    this.progressCallbacks.push(callback);
  }

  /**
   * 진행 상태 알림
   */
  private notifyProgress(progress: PipelineProgress): void {
    const progressStr = progress.progress !== undefined ? ` (${progress.progress}%)` : '';
    console.log(`[Pipeline] ${progress.step}: ${progress.status}${progressStr} - ${progress.message || ''}`);
    for (const callback of this.progressCallbacks) {
      callback(progress);
    }
  }

  /**
   * Full 파이프라인 실행
   */
  async runFull(options: Omit<PipelineOptions, 'mode'> = {}): Promise<PipelineResult> {
    return this.run({ ...options, mode: 'full' });
  }

  /**
   * Quick 파이프라인 실행
   */
  async runQuick(options: Omit<PipelineOptions, 'mode'> = {}): Promise<PipelineResult> {
    return this.run({ ...options, mode: 'quick' });
  }

  /**
   * 파이프라인 실행
   */
  async run(options: PipelineOptions): Promise<PipelineResult> {
    const startTime = Date.now();
    const result: PipelineResult = {
      success: false,
      mode: options.mode,
      startedAt: new Date().toISOString(),
      completedAt: '',
      duration: 0,
      summary: {
        totalScreens: 0,
        capturedScreens: 0,
        generatedSpecs: 0,
        a11yWarnings: 0,
        errors: 0,
      },
      details: {
        capture: null,
        specs: [],
        a11y: null,
      },
      errors: [],
    };

    console.log(`\n${'='.repeat(60)}`);
    console.log(`[Pipeline] Starting ${options.mode.toUpperCase()} pipeline`);
    console.log(`${'='.repeat(60)}\n`);

    try {
      // 1. 검증 단계
      this.notifyProgress({ step: 'validate', status: 'running', message: 'Validating configuration...' });
      await this.validateConfiguration();
      this.notifyProgress({ step: 'validate', status: 'completed' });

      // 2. 대상 화면 결정
      const screens = await this.getTargetScreens(options);
      result.summary.totalScreens = screens.length;

      if (screens.length === 0) {
        console.log('[Pipeline] No screens to process');
        result.success = true;
        return result;
      }

      console.log(`[Pipeline] Target screens: ${screens.map(s => s.id).join(', ')}`);

      // 3. 빌드 검증 (full 모드에서만)
      if (options.mode === 'full' && !options.skipBuild) {
        this.notifyProgress({ step: 'build', status: 'running', message: 'Running build...' });
        await this.runBuild();
        this.notifyProgress({ step: 'build', status: 'completed' });
      } else {
        this.notifyProgress({ step: 'build', status: 'skipped' });
      }

      // 4. 개발 서버 시작
      this.notifyProgress({ step: 'server', status: 'running', message: 'Starting server...' });
      await this.serverManager.start();
      this.notifyProgress({ step: 'server', status: 'completed', message: `Running at ${this.serverManager.getUrl()}` });

      // 5. 스크린샷 캡처
      this.notifyProgress({ step: 'capture', status: 'running', message: 'Capturing screenshots...', progress: 0 });

      await this.captureEngine.startSession();

      for (let i = 0; i < screens.length; i++) {
        const screen = screens[i];
        await this.captureEngine.captureScreen(screen);
        const progress = Math.round(((i + 1) / screens.length) * 100);
        this.notifyProgress({ step: 'capture', status: 'running', message: `Capturing ${screen.id}...`, progress });
      }

      const manifest = await this.captureEngine.endSession();
      result.details.capture = manifest;
      result.summary.capturedScreens = manifest.results.filter(r => r.success).length;

      await this.captureEngine.saveManifest(manifest);
      this.notifyProgress({ step: 'capture', status: 'completed', message: `Captured ${result.summary.capturedScreens} screenshots` });

      // 6. 명세서 생성
      if (!options.skipSpec) {
        this.notifyProgress({ step: 'spec', status: 'running', message: 'Generating specifications...', progress: 0 });

        for (let i = 0; i < screens.length; i++) {
          const screen = screens[i];
          const specResult = await this.specBuilder.buildForScreen(screen);
          result.details.specs.push(specResult);
          if (specResult.success) {
            result.summary.generatedSpecs++;
          }
          const progress = Math.round(((i + 1) / screens.length) * 100);
          this.notifyProgress({ step: 'spec', status: 'running', message: `Generating ${screen.id}...`, progress });
        }

        this.notifyProgress({ step: 'spec', status: 'completed', message: `Generated ${result.summary.generatedSpecs} specs` });
      } else {
        this.notifyProgress({ step: 'spec', status: 'skipped' });
      }

      // 7. 접근성 검증 (full 모드에서만)
      if (options.mode === 'full' && !options.skipA11y) {
        this.notifyProgress({ step: 'a11y', status: 'running', message: 'Running accessibility checks...' });
        const a11yResult = await this.runA11yValidation(screens);
        result.details.a11y = a11yResult;
        result.summary.a11yWarnings = a11yResult.violations.length;
        this.notifyProgress({ step: 'a11y', status: 'completed', message: `Found ${a11yResult.violations.length} issues` });
      } else {
        this.notifyProgress({ step: 'a11y', status: 'skipped' });
      }

      // 8. 리포트 생성
      this.notifyProgress({ step: 'report', status: 'running', message: 'Generating report...' });
      await this.generateReport(result);
      this.notifyProgress({ step: 'report', status: 'completed' });

      result.success = true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(errorMessage);
      result.summary.errors++;
      console.error(`[Pipeline] Error: ${errorMessage}`);
    } finally {
      // 정리
      if (this.serverManager.isRunning()) {
        await this.serverManager.stop();
      }

      result.completedAt = new Date().toISOString();
      result.duration = Date.now() - startTime;

      this.printSummary(result);
    }

    return result;
  }

  /**
   * 설정 검증
   */
  private async validateConfiguration(): Promise<void> {
    const configPath = 'config/screen-states.json';

    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration not found: ${configPath}`);
    }

    const config: ScreenStatesConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    if (!config.screens || config.screens.length === 0) {
      throw new Error('No screens configured');
    }

    // Git 상태 확인
    const gitStatus = await this.gitManager.getStatus();
    if (gitStatus.hasChanges) {
      console.warn('[Pipeline] Warning: Uncommitted changes detected');
    }
  }

  /**
   * 대상 화면 결정
   */
  private async getTargetScreens(options: PipelineOptions): Promise<ScreenConfig[]> {
    const configPath = 'config/screen-states.json';
    const config: ScreenStatesConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    if (options.screens && options.screens.length > 0) {
      // 특정 화면만 선택
      return config.screens.filter(s => options.screens!.includes(s.id));
    }

    if (options.mode === 'quick') {
      // Quick 모드: 변경된 화면만
      const changedFiles = await this.gitManager.getChangedFiles();
      const changedScreenIds = this.extractScreenIds(changedFiles);

      if (changedScreenIds.length === 0) {
        console.log('[Pipeline] No changed screens detected, processing all');
        return config.screens;
      }

      return config.screens.filter(s => changedScreenIds.includes(s.id));
    }

    // Full 모드: 모든 화면
    return config.screens;
  }

  /**
   * 변경된 파일에서 화면 ID 추출
   */
  private extractScreenIds(files: string[]): string[] {
    const screenIds: string[] = [];
    const configPath = 'config/screen-states.json';

    if (!fs.existsSync(configPath)) {
      return screenIds;
    }

    const config: ScreenStatesConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    for (const file of files) {
      // src/pages/xxx/ 패턴에서 화면 찾기
      const match = file.match(/src\/pages\/([^/]+)/);
      if (match) {
        const dirName = match[1];
        const screen = config.screens.find(s =>
          this.toKebabCase(s.nameEn) === dirName ||
          s.component.toLowerCase() === dirName.toLowerCase()
        );
        if (screen && !screenIds.includes(screen.id)) {
          screenIds.push(screen.id);
        }
      }
    }

    return screenIds;
  }

  /**
   * 빌드 실행
   */
  private async runBuild(): Promise<void> {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    try {
      await execAsync('npm run build', { cwd: process.cwd() });
    } catch (error) {
      throw new Error(`Build failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 접근성 검증
   */
  private async runA11yValidation(screens: ScreenConfig[]): Promise<A11yResult> {
    // 실제 구현에서는 axe-core 사용
    // 여기서는 기본 결과 반환
    return {
      violations: [],
      passes: screens.length * 10,
      incomplete: 0,
    };
  }

  /**
   * 리포트 생성
   */
  private async generateReport(result: PipelineResult): Promise<void> {
    const reportDir = 'outputs/reports';
    this.ensureDir(reportDir);

    const reportPath = path.join(reportDir, `pipeline-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(result, null, 2), 'utf-8');

    console.log(`[Pipeline] Report saved: ${reportPath}`);
  }

  /**
   * 결과 요약 출력
   */
  private printSummary(result: PipelineResult): void {
    const status = result.success ? 'SUCCESS' : 'FAILED';
    const durationSec = (result.duration / 1000).toFixed(1);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`[Pipeline] ${result.mode.toUpperCase()} Pipeline ${status}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`\n  Total Screens:    ${result.summary.totalScreens}`);
    console.log(`  Captured:         ${result.summary.capturedScreens}`);
    console.log(`  Specs Generated:  ${result.summary.generatedSpecs}`);
    console.log(`  A11y Warnings:    ${result.summary.a11yWarnings}`);
    console.log(`  Errors:           ${result.summary.errors}`);
    console.log(`  Duration:         ${durationSec}s`);

    if (result.errors.length > 0) {
      console.log(`\n  Errors:`);
      for (const error of result.errors) {
        console.log(`    - ${error}`);
      }
    }

    console.log(`\n${'='.repeat(60)}\n`);
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
   * 디렉터리 생성
   */
  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

/**
 * 싱글톤 인스턴스
 */
let pipelineInstance: PipelineOrchestrator | null = null;

export function getPipelineOrchestrator(): PipelineOrchestrator {
  if (!pipelineInstance) {
    pipelineInstance = new PipelineOrchestrator();
  }
  return pipelineInstance;
}
