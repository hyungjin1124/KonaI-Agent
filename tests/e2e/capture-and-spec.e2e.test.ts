/**
 * E2E 테스트: 스크린샷 캡처 및 화면명세서 생성
 *
 * 테스트 대상: SCR-001 로그인 화면 (default 상태)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { CaptureEngine, resetCaptureEngine } from '../../scripts/core/capture-engine.js';
import { SpecBuilder, resetSpecBuilder } from '../../scripts/core/spec-builder.js';
import { ScreenConfig } from '../../config/types.js';

// 테스트 설정
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  outputDir: 'outputs/test-e2e',
  screenshotDir: 'outputs/test-e2e/screenshots',
  specDir: 'outputs/test-e2e/specs',
};

// 테스트 대상 화면: SCR-001 로그인 화면 (default 상태만)
const LOGIN_SCREEN_CONFIG: ScreenConfig = {
  id: 'SCR-001',
  name: '로그인 화면',
  nameEn: 'Login Screen',
  route: '/',
  component: 'LoginView',
  states: [
    {
      stateId: 'default',
      stateName: '초기 상태',
      description: '로그인 폼이 비어있는 초기 상태',
      waitFor: '[data-testid="login-view"]',
      delay: 2000,
    },
  ],
};

describe('E2E: 스크린샷 캡처 및 화면명세서 생성', () => {
  let captureEngine: CaptureEngine;
  let specBuilder: SpecBuilder;

  beforeAll(async () => {
    // 1. 출력 디렉토리 준비 (기존 디렉토리 정리)
    if (fs.existsSync(TEST_CONFIG.outputDir)) {
      fs.rmSync(TEST_CONFIG.outputDir, { recursive: true });
    }
    fs.mkdirSync(TEST_CONFIG.screenshotDir, { recursive: true });
    fs.mkdirSync(path.join(TEST_CONFIG.specDir, 'md'), { recursive: true });
    fs.mkdirSync(path.join(TEST_CONFIG.specDir, 'docx'), { recursive: true });

    // 2. 캡처 엔진 초기화
    captureEngine = new CaptureEngine({
      baseUrl: TEST_CONFIG.baseUrl,
      outputDir: TEST_CONFIG.screenshotDir,
      locale: 'ko-KR',
      headless: true,
      timeout: 30000,
      format: 'png',
      viewport: { width: 1920, height: 1080 },
      fullPage: false,
    });

    // 3. 명세서 빌더 초기화
    specBuilder = new SpecBuilder({
      outputDir: TEST_CONFIG.specDir,
      screenshotDir: TEST_CONFIG.screenshotDir,
      locale: 'ko-KR',
      formats: ['md', 'docx'],
      includeScreenshots: true,
    });
  }, 60000);

  afterAll(async () => {
    // 캡처 세션 정리
    if (captureEngine && captureEngine.isSessionActive()) {
      try {
        await captureEngine.endSession();
      } catch {
        // 세션 종료 에러 무시
      }
    }

    // 싱글톤 리셋
    resetCaptureEngine();
    resetSpecBuilder();
  });

  describe('Step 1: 스크린샷 캡처', () => {
    it('로그인 화면 (default 상태) 스크린샷을 캡처해야 한다', async () => {
      // 캡처 세션 시작
      await captureEngine.startSession();

      // 스크린샷 캡처
      const results = await captureEngine.captureScreen(LOGIN_SCREEN_CONFIG);

      // 검증: 결과 개수
      expect(results).toHaveLength(1);

      // 검증: 성공 여부
      expect(results[0].success).toBe(true);
      expect(results[0].screenId).toBe('SCR-001');
      expect(results[0].stateId).toBe('default');
      expect(results[0].screenshotPath).toBeTruthy();
      expect(results[0].error).toBeUndefined();

      // 검증: 파일 존재
      const screenshotPath = path.resolve(process.cwd(), results[0].screenshotPath);
      expect(fs.existsSync(screenshotPath)).toBe(true);

      // 검증: 파일 크기 (최소 1KB - 유효한 이미지인지 확인)
      const stats = fs.statSync(screenshotPath);
      expect(stats.size).toBeGreaterThan(1024);

      console.log(`[Test] Screenshot captured: ${results[0].screenshotPath}`);
      console.log(`[Test] Screenshot size: ${(stats.size / 1024).toFixed(2)} KB`);
    }, 60000);
  });

  describe('Step 2: 화면명세서 생성', () => {
    it('Markdown 명세서를 생성해야 한다', async () => {
      const result = await specBuilder.buildForScreen(LOGIN_SCREEN_CONFIG);

      // 검증: 성공 여부
      expect(result.success).toBe(true);
      expect(result.screenId).toBe('SCR-001');
      expect(result.screenName).toBe('로그인 화면');
      expect(result.files.md).toBeTruthy();

      // 검증: MD 파일 존재
      const mdPath = path.resolve(process.cwd(), result.files.md!);
      expect(fs.existsSync(mdPath)).toBe(true);

      // 검증: MD 내용
      const mdContent = fs.readFileSync(mdPath, 'utf-8');
      expect(mdContent).toContain('# 로그인 화면 화면명세서');
      expect(mdContent).toContain('SCR-001');
      expect(mdContent).toContain('화면 개요');
      expect(mdContent).toContain('화면 레이아웃');

      console.log(`[Test] Markdown spec generated: ${result.files.md}`);
    });

    it('DOCX 명세서를 생성해야 한다', async () => {
      const result = await specBuilder.buildForScreen(LOGIN_SCREEN_CONFIG);

      // 검증: 성공 여부
      expect(result.success).toBe(true);

      // 검증: DOCX 또는 txt 파일 존재 (docx 라이브러리 없으면 txt로 fallback)
      if (result.files.docx) {
        const docxPath = path.resolve(process.cwd(), result.files.docx);
        const txtPath = docxPath.replace('.docx', '.txt');

        // DOCX 또는 TXT 파일 존재 확인
        const exists = fs.existsSync(docxPath) || fs.existsSync(txtPath);
        expect(exists).toBe(true);

        if (fs.existsSync(docxPath)) {
          const stats = fs.statSync(docxPath);
          expect(stats.size).toBeGreaterThan(100);
          console.log(`[Test] DOCX spec generated: ${result.files.docx}`);
        } else if (fs.existsSync(txtPath)) {
          console.log(`[Test] TXT spec generated (docx fallback): ${txtPath}`);
        }
      }
    });
  });

  describe('Step 3: 전체 플로우 통합 검증', () => {
    it('캡처 매니페스트가 생성되어야 한다', async () => {
      // 세션 종료 및 매니페스트 생성
      const manifest = await captureEngine.endSession();

      // 검증: 매니페스트 내용
      expect(manifest.version).toBe('1.0.0');
      expect(manifest.locale).toBe('ko-KR');
      expect(manifest.totalScreens).toBe(1);
      expect(manifest.totalStates).toBeGreaterThanOrEqual(1);
      expect(manifest.results).toHaveLength(manifest.totalStates);

      // 매니페스트 저장
      const manifestPath = path.join(TEST_CONFIG.outputDir, 'manifest.json');

      // 새 세션 시작하여 매니페스트 저장
      const newEngine = new CaptureEngine({
        baseUrl: TEST_CONFIG.baseUrl,
        outputDir: TEST_CONFIG.screenshotDir,
      });
      await newEngine.saveManifest(manifest, manifestPath);

      // 검증: 매니페스트 파일 존재
      expect(fs.existsSync(manifestPath)).toBe(true);

      const savedManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      expect(savedManifest.totalScreens).toBe(1);
      expect(savedManifest.results.length).toBeGreaterThanOrEqual(1);

      console.log(`[Test] Manifest saved: ${manifestPath}`);
    });

    it('출력 디렉토리에 모든 파일이 생성되어야 한다', () => {
      // 스크린샷 디렉토리 확인
      const screenshotDir = path.join(TEST_CONFIG.screenshotDir, 'ko-KR');
      expect(fs.existsSync(screenshotDir)).toBe(true);

      const screenshots = fs.readdirSync(screenshotDir).filter(f => f.endsWith('.png'));
      expect(screenshots.length).toBeGreaterThanOrEqual(1);
      expect(screenshots.some(f => f.startsWith('SCR-001'))).toBe(true);

      // 명세서 디렉토리 확인
      const mdDir = path.join(TEST_CONFIG.specDir, 'ko-KR', 'md');
      expect(fs.existsSync(mdDir)).toBe(true);

      const mdFiles = fs.readdirSync(mdDir).filter(f => f.endsWith('.md'));
      expect(mdFiles).toContain('SCR-001.md');

      console.log('[Test] All output files verified successfully');
      console.log(`[Test] Screenshots: ${screenshots.join(', ')}`);
      console.log(`[Test] Specs: ${mdFiles.join(', ')}`);
    });
  });
});
