/**
 * 화면 명세서 생성기
 */

import * as fs from 'fs';
import * as path from 'path';
import { ScreenSpec, ScreenConfig, CaptureManifest } from '../../config/types.js';
import { DocxBuilder } from './docx-builder.js';
import { MarkdownRenderer } from './markdown-renderer.js';

export interface GeneratorConfig {
  outputDir: string;
  screenshotDir: string;
  locale: 'ko-KR' | 'en-US';
  formats: ('md' | 'docx' | 'pdf')[];
}

export interface GenerationResult {
  screenId: string;
  screenName: string;
  files: {
    md?: string;
    docx?: string;
    pdf?: string;
  };
  success: boolean;
  error?: string;
}

export class SpecGenerator {
  private docxBuilder: DocxBuilder;
  private markdownRenderer: MarkdownRenderer;

  constructor() {
    this.docxBuilder = new DocxBuilder();
    this.markdownRenderer = new MarkdownRenderer();
  }

  /**
   * 캡처 매니페스트로부터 명세서 생성
   */
  async generateFromManifest(
    manifestPath: string,
    config: GeneratorConfig
  ): Promise<GenerationResult[]> {
    // 매니페스트 로드
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Manifest not found: ${manifestPath}`);
    }

    const manifest: CaptureManifest = JSON.parse(
      fs.readFileSync(manifestPath, 'utf-8')
    );

    // 화면별로 그룹화
    const screenGroups = this.groupResultsByScreen(manifest.results);
    const results: GenerationResult[] = [];

    for (const [screenId, captureResults] of Object.entries(screenGroups)) {
      const spec = this.createSpecFromCaptures(screenId, captureResults);
      const screenshotPath = this.findScreenshot(screenId, config.screenshotDir, config.locale);

      const result = await this.generateSpecDocuments(spec, screenshotPath, config);
      results.push(result);
    }

    return results;
  }

  /**
   * 단일 화면 명세서 생성
   */
  async generateForScreen(
    screenConfig: ScreenConfig,
    config: GeneratorConfig
  ): Promise<GenerationResult> {
    const spec = this.createSpecFromScreenConfig(screenConfig);
    const screenshotPath = this.findScreenshot(
      screenConfig.id,
      config.screenshotDir,
      config.locale
    );

    return this.generateSpecDocuments(spec, screenshotPath, config);
  }

  /**
   * 명세서 문서들 생성
   */
  private async generateSpecDocuments(
    spec: ScreenSpec,
    screenshotPath: string | undefined,
    config: GeneratorConfig
  ): Promise<GenerationResult> {
    const result: GenerationResult = {
      screenId: spec.header.screenId,
      screenName: spec.header.screenName || spec.header.screenId,
      files: {},
      success: true,
    };

    const outputDir = path.join(config.outputDir, config.locale);

    try {
      // Markdown 생성
      if (config.formats.includes('md')) {
        const mdContent = this.markdownRenderer.renderSpec(spec, screenshotPath);
        const mdPath = path.join(outputDir, 'md', `${spec.header.screenId}.md`);
        this.markdownRenderer.saveToFile(mdContent, mdPath);
        result.files.md = mdPath;
      }

      // DOCX 생성
      if (config.formats.includes('docx')) {
        const doc = await this.docxBuilder.buildSpecDocument(spec, screenshotPath);
        const docxPath = path.join(outputDir, 'docx', `${spec.header.screenId}.docx`);
        await this.docxBuilder.saveDocument(doc, docxPath);
        result.files.docx = docxPath;
      }

      // PDF 생성 (DOCX 기반)
      if (config.formats.includes('pdf')) {
        // PDF는 별도 라이브러리 필요 - 여기서는 DOCX와 동일하게 생성
        // 실제 구현 시 docx-to-pdf 또는 Puppeteer PDF 사용
        const pdfPath = path.join(outputDir, 'pdf', `${spec.header.screenId}.pdf`);
        result.files.pdf = pdfPath;
        console.log(`[SpecGenerator] PDF generation not yet implemented: ${pdfPath}`);
      }

    } catch (error) {
      result.success = false;
      result.error = error instanceof Error ? error.message : String(error);
    }

    return result;
  }

  /**
   * 캡처 결과를 화면별로 그룹화
   */
  private groupResultsByScreen(
    results: CaptureManifest['results']
  ): Record<string, CaptureManifest['results']> {
    const groups: Record<string, CaptureManifest['results']> = {};

    for (const result of results) {
      if (!groups[result.screenId]) {
        groups[result.screenId] = [];
      }
      groups[result.screenId].push(result);
    }

    return groups;
  }

  /**
   * 캡처 결과로부터 명세 생성
   */
  private createSpecFromCaptures(
    screenId: string,
    results: CaptureManifest['results']
  ): ScreenSpec {
    const firstResult = results[0];
    const screenName = this.getScreenNameById(screenId);
    const today = new Date().toISOString().split('T')[0];

    return {
      header: {
        screenId,
        screenName,
        version: '1.0.0',
        createdAt: today,
        createdBy: 'KonaI Pipeline',
      },
      overview: {
        description: `${screenName} 화면입니다.`,
        accessPath: this.getAccessPathById(screenId),
        relatedScreens: [],
      },
      layout: {
        screenshotPath: firstResult?.screenshotPath || '',
        areas: [
          {
            areaId: 'main',
            areaName: '메인 영역',
            type: 'custom',
            order: 1,
          },
        ],
      },
      inputFields: [],
      buttons: [],
      gridColumns: [],
      events: [],
      messages: [],
      changeHistory: [
        {
          version: '1.0.0',
          changedAt: today,
          changedBy: 'KonaI Pipeline',
          changeType: 'create',
          description: '최초 작성',
        },
      ],
    };
  }

  /**
   * ScreenConfig로부터 명세 생성
   */
  private createSpecFromScreenConfig(screenConfig: ScreenConfig): ScreenSpec {
    const today = new Date().toISOString().split('T')[0];

    return {
      header: {
        screenId: screenConfig.id,
        screenName: screenConfig.name,
        version: '1.0.0',
        createdAt: today,
        createdBy: 'KonaI Pipeline',
      },
      overview: {
        description: `${screenConfig.name} 화면입니다.`,
        accessPath: screenConfig.route,
        relatedScreens: [],
      },
      layout: {
        screenshotPath: '',
        areas: [
          {
            areaId: 'main',
            areaName: '메인 영역',
            type: 'custom',
            order: 1,
          },
        ],
      },
      inputFields: [],
      buttons: [],
      gridColumns: [],
      events: [],
      messages: [],
      changeHistory: [
        {
          version: '1.0.0',
          changedAt: today,
          changedBy: 'KonaI Pipeline',
          changeType: 'create',
          description: '최초 작성',
        },
      ],
    };
  }

  /**
   * 스크린샷 파일 찾기
   */
  private findScreenshot(
    screenId: string,
    screenshotDir: string,
    locale: string
  ): string | undefined {
    const localeDir = path.join(screenshotDir, locale);

    if (!fs.existsSync(localeDir)) {
      return undefined;
    }

    const files = fs.readdirSync(localeDir);
    const screenshot = files.find((f) => f.startsWith(screenId) && f.endsWith('.png'));

    if (screenshot) {
      return path.join(localeDir, screenshot);
    }

    return undefined;
  }

  /**
   * 화면 ID로 이름 조회
   */
  private getScreenNameById(screenId: string): string {
    const names: Record<string, string> = {
      'SCR-001': '로그인 화면',
      'SCR-002': '대시보드',
      'SCR-003': '시나리오 분석',
      'SCR-004': '라이브보드',
      'SCR-005': '데이터 관리',
      'SCR-006': '스킬 관리',
      'SCR-007': '관리자 설정',
      'SCR-008': '채팅 히스토리',
      'SCR-009': 'PPT 생성',
    };

    return names[screenId] || screenId;
  }

  /**
   * 화면 ID로 접근 경로 조회
   */
  private getAccessPathById(screenId: string): string {
    const paths: Record<string, string> = {
      'SCR-001': '로그인',
      'SCR-002': '메인 > 대시보드',
      'SCR-003': '메인 > 시나리오 분석',
      'SCR-004': '메인 > 라이브보드',
      'SCR-005': '메인 > 데이터 관리',
      'SCR-006': '메인 > 스킬 관리',
      'SCR-007': '메인 > 관리자 설정',
      'SCR-008': '메인 > 채팅 히스토리',
      'SCR-009': '메인 > PPT 생성',
    };

    return paths[screenId] || screenId;
  }
}
