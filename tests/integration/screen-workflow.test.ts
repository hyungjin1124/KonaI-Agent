/**
 * ScreenWorkflow 통합 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ScreenWorkflow, ScreenWorkflowOptions } from '../../scripts/workflows/screen-workflow';

// 모듈 모킹
vi.mock('fs');
vi.mock('../../scripts/core/server-manager', () => ({
  getServerManager: () => ({
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    isRunning: vi.fn().mockReturnValue(false),
    getUrl: vi.fn().mockReturnValue('http://localhost:3000'),
  }),
}));

vi.mock('../../scripts/core/capture-engine', () => ({
  getCaptureEngine: () => ({
    startSession: vi.fn().mockResolvedValue(undefined),
    endSession: vi.fn().mockResolvedValue({ results: [], totalScreens: 0, totalStates: 0 }),
    captureScreen: vi.fn().mockResolvedValue([
      { screenId: 'SCR-001', stateId: 'initial', success: true, screenshotPath: 'path/to/screenshot.png' },
    ]),
    saveManifest: vi.fn().mockResolvedValue('manifest.json'),
  }),
}));

vi.mock('../../scripts/core/spec-builder', () => ({
  getSpecBuilder: () => ({
    buildForScreen: vi.fn().mockResolvedValue({
      screenId: 'SCR-001',
      screenName: 'Test Screen',
      success: true,
      files: { md: 'spec.md', docx: 'spec.docx' },
    }),
  }),
}));

vi.mock('../../scripts/core/git-manager', () => ({
  getGitManager: () => ({
    createFeatureBranch: vi.fn().mockResolvedValue('feature/screen-scr-001'),
    stageAll: vi.fn().mockResolvedValue(undefined),
    commit: vi.fn().mockResolvedValue('abc123'),
    formatCommitMessage: vi.fn().mockReturnValue('[feat] SCR-001: Test'),
  }),
}));

describe('ScreenWorkflow Integration', () => {
  let workflow: ScreenWorkflow;

  beforeEach(() => {
    workflow = new ScreenWorkflow();
    vi.clearAllMocks();

    // fs 모킹
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ screens: [] }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('create', () => {
    const baseOptions: ScreenWorkflowOptions = {
      screenName: '테스트 화면',
      screenNameEn: 'TestScreen',
      screenType: 'crud',
      requirements: '목록 조회, 등록, 수정, 삭제',
      locale: 'ko-KR',
      autoCommit: false,
      generateSpec: true,
      skipCapture: true, // 테스트에서는 캡처 스킵
    };

    it('should complete workflow successfully', async () => {
      const result = await workflow.create(baseOptions);

      expect(result.success).toBe(true);
      expect(result.screenId).toMatch(/^SCR-\d{3}$/);
      expect(result.componentPath).toBeTruthy();
      expect(result.errors.length).toBe(0);
    });

    it('should generate screen ID in correct format', async () => {
      const result = await workflow.create(baseOptions);

      expect(result.screenId).toMatch(/^SCR-\d{3}$/);
    });

    it('should create component files', async () => {
      const result = await workflow.create(baseOptions);

      expect(result.componentPath).toContain('test-screen');
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should generate spec files when generateSpec is true', async () => {
      const result = await workflow.create({
        ...baseOptions,
        generateSpec: true,
      });

      expect(result.specPaths.md).toBeDefined();
      expect(result.specPaths.docx).toBeDefined();
    });

    it('should skip spec generation when generateSpec is false', async () => {
      const result = await workflow.create({
        ...baseOptions,
        generateSpec: false,
      });

      expect(result.specPaths.md).toBeUndefined();
      expect(result.specPaths.docx).toBeUndefined();
    });

    it('should commit changes when autoCommit is true', async () => {
      const result = await workflow.create({
        ...baseOptions,
        autoCommit: true,
      });

      expect(result.gitBranch).toBeDefined();
      expect(result.commitHash).toBeDefined();
    });

    it('should track progress through callbacks', async () => {
      const progressHistory: string[] = [];

      workflow.onProgress((progress) => {
        progressHistory.push(`${progress.step}:${progress.status}`);
      });

      await workflow.create(baseOptions);

      expect(progressHistory).toContain('generate:running');
      expect(progressHistory).toContain('generate:completed');
    });

    it('should measure duration', async () => {
      const result = await workflow.create(baseOptions);

      expect(result.duration).toBeGreaterThan(0);
    });

    it('should handle errors and record them', async () => {
      vi.mocked(fs.mkdirSync).mockImplementation(() => {
        throw new Error('Test error');
      });

      const result = await workflow.create(baseOptions);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
        screens: [
          {
            id: 'SCR-001',
            name: '기존 화면',
            nameEn: 'ExistingScreen',
            route: '/existing-screen',
            component: 'ExistingScreen',
            states: [{ stateId: 'initial', stateName: '초기' }],
          },
        ],
      }));
    });

    it('should update existing screen successfully', async () => {
      const result = await workflow.update('SCR-001', '검색 조건 추가');

      expect(result.success).toBe(true);
      expect(result.screenId).toBe('SCR-001');
    });

    it('should fail when screen not found', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ screens: [] }));

      const result = await workflow.update('SCR-999', 'Update');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
