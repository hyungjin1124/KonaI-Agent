/**
 * 명세서 빌더 - 화면 명세서 생성 통합 인터페이스
 * Markdown 및 DOCX 포맷 지원
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  ScreenSpec,
  ScreenConfig,
  CaptureManifest,
  CaptureResult,
  InputField,
  ButtonSpec,
  GridColumn,
  EventSpec,
  MessageSpec,
  ChangeHistoryEntry
} from '../../config/types.js';

export interface SpecBuilderConfig {
  outputDir: string;
  screenshotDir: string;
  locale: 'ko-KR' | 'en-US';
  formats: ('md' | 'docx')[];
  templateDir?: string;
  includeScreenshots: boolean;
  companyName?: string;
  projectName?: string;
}

export interface SpecBuildResult {
  screenId: string;
  screenName: string;
  success: boolean;
  files: {
    md?: string;
    docx?: string;
  };
  error?: string;
}

const DEFAULT_CONFIG: SpecBuilderConfig = {
  outputDir: 'outputs/specs',
  screenshotDir: 'outputs/screenshots',
  locale: 'ko-KR',
  formats: ['md', 'docx'],
  includeScreenshots: true,
  companyName: 'KonaI',
  projectName: 'KonaI-Agent',
};

export class SpecBuilder {
  private config: SpecBuilderConfig;

  constructor(config: Partial<SpecBuilderConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 캡처 매니페스트로부터 명세서 생성
   */
  async buildFromManifest(manifestPath: string): Promise<SpecBuildResult[]> {
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Manifest not found: ${manifestPath}`);
    }

    const manifest: CaptureManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const results: SpecBuildResult[] = [];

    // 화면별로 그룹화
    const screenGroups = this.groupByScreen(manifest.results);

    for (const [screenId, captureResults] of Object.entries(screenGroups)) {
      const spec = this.createSpecFromCaptures(screenId, captureResults);
      const result = await this.buildSpec(spec);
      results.push(result);
    }

    return results;
  }

  /**
   * 단일 화면 명세서 생성
   */
  async buildForScreen(screenConfig: ScreenConfig): Promise<SpecBuildResult> {
    const spec = this.createSpecFromConfig(screenConfig);
    return this.buildSpec(spec);
  }

  /**
   * ScreenSpec 객체로부터 명세서 생성
   */
  async buildSpec(spec: ScreenSpec): Promise<SpecBuildResult> {
    const result: SpecBuildResult = {
      screenId: spec.header.screenId,
      screenName: spec.header.screenName || spec.header.screenId,
      success: true,
      files: {},
    };

    const outputDir = path.join(this.config.outputDir, this.config.locale);

    try {
      // 스크린샷 경로 찾기
      const screenshotPath = this.findScreenshot(spec.header.screenId);

      // Markdown 생성
      if (this.config.formats.includes('md')) {
        const mdContent = this.renderMarkdown(spec, screenshotPath);
        const mdDir = path.join(outputDir, 'md');
        this.ensureDir(mdDir);
        const mdPath = path.join(mdDir, `${spec.header.screenId}.md`);
        fs.writeFileSync(mdPath, mdContent, 'utf-8');
        result.files.md = path.relative(process.cwd(), mdPath);
        console.log(`[SpecBuilder] Generated MD: ${result.files.md}`);
      }

      // DOCX 생성
      if (this.config.formats.includes('docx')) {
        const docxDir = path.join(outputDir, 'docx');
        this.ensureDir(docxDir);
        const docxPath = path.join(docxDir, `${spec.header.screenId}.docx`);
        await this.renderDocx(spec, screenshotPath, docxPath);
        result.files.docx = path.relative(process.cwd(), docxPath);
        console.log(`[SpecBuilder] Generated DOCX: ${result.files.docx}`);
      }
    } catch (error) {
      result.success = false;
      result.error = error instanceof Error ? error.message : String(error);
      console.error(`[SpecBuilder] Error: ${result.error}`);
    }

    return result;
  }

  /**
   * Markdown 렌더링
   */
  private renderMarkdown(spec: ScreenSpec, screenshotPath?: string): string {
    const lines: string[] = [];

    // 헤더
    lines.push(`# ${spec.header.screenName || spec.header.screenId} 화면명세서`);
    lines.push('');

    // 문서 정보
    lines.push('## 1. 문서 정보');
    lines.push('');
    lines.push('| 항목 | 내용 |');
    lines.push('|------|------|');
    lines.push(`| 화면 ID | ${spec.header.screenId} |`);
    lines.push(`| 화면명 | ${spec.header.screenName || '-'} |`);
    lines.push(`| 버전 | ${spec.header.version} |`);
    lines.push(`| 작성일 | ${spec.header.createdAt} |`);
    lines.push(`| 작성자 | ${spec.header.createdBy} |`);
    if (spec.header.updatedAt) {
      lines.push(`| 수정일 | ${spec.header.updatedAt} |`);
      lines.push(`| 수정자 | ${spec.header.updatedBy || '-'} |`);
    }
    lines.push('');

    // 화면 개요
    lines.push('## 2. 화면 개요');
    lines.push('');
    lines.push(`**설명**: ${spec.overview.description}`);
    lines.push('');
    lines.push(`**접근 경로**: ${spec.overview.accessPath}`);
    lines.push('');

    if (spec.overview.relatedScreens.length > 0) {
      lines.push('**연관 화면**:');
      for (const related of spec.overview.relatedScreens) {
        lines.push(`- ${related.screenId}: ${related.screenName} (${related.relationship || 'link'})`);
      }
      lines.push('');
    }

    if (spec.overview.businessRules) {
      lines.push('**업무 규칙**:');
      lines.push(spec.overview.businessRules);
      lines.push('');
    }

    // 화면 캡처
    if (screenshotPath && this.config.includeScreenshots) {
      lines.push('## 3. 화면 캡처');
      lines.push('');
      lines.push(`![${spec.header.screenName}](${screenshotPath})`);
      lines.push('');
    }

    // 화면 레이아웃
    lines.push('## 4. 화면 레이아웃');
    lines.push('');
    if (spec.layout.areas.length > 0) {
      lines.push('| 영역 ID | 영역명 | 유형 | 순서 |');
      lines.push('|---------|--------|------|------|');
      for (const area of spec.layout.areas) {
        lines.push(`| ${area.areaId} | ${area.areaName} | ${area.type} | ${area.order || '-'} |`);
      }
      lines.push('');
    }

    // 입력 필드
    if (spec.inputFields.length > 0) {
      lines.push('## 5. 입력 필드');
      lines.push('');
      lines.push('| 필드명 | 영문명 | 타입 | 길이 | 필수 | 기본값 | 비고 |');
      lines.push('|--------|--------|------|------|------|--------|------|');
      for (const field of spec.inputFields) {
        lines.push(
          `| ${field.fieldName} | ${field.fieldNameEn} | ${field.dataType} | ${field.length} | ${field.required ? 'Y' : 'N'} | ${field.defaultValue ?? '-'} | ${field.remarks || '-'} |`
        );
      }
      lines.push('');
    }

    // 버튼
    if (spec.buttons.length > 0) {
      lines.push('## 6. 버튼');
      lines.push('');
      lines.push('| 버튼명 | 이벤트 타입 | 동작 | API | 메서드 |');
      lines.push('|--------|-------------|------|-----|--------|');
      for (const btn of spec.buttons) {
        lines.push(
          `| ${btn.buttonName} | ${btn.eventType} | ${btn.action} | ${btn.apiEndpoint || '-'} | ${btn.httpMethod || '-'} |`
        );
      }
      lines.push('');
    }

    // 그리드 컬럼
    if (spec.gridColumns.length > 0) {
      lines.push('## 7. 그리드 컬럼');
      lines.push('');
      lines.push('| 컬럼명 | 영문명 | 타입 | 정렬 | 정렬가능 | 비고 |');
      lines.push('|--------|--------|------|------|----------|------|');
      for (const col of spec.gridColumns) {
        lines.push(
          `| ${col.columnName} | ${col.columnNameEn} | ${col.dataType} | ${col.align} | ${col.sortable ? 'Y' : 'N'} | ${col.remarks || '-'} |`
        );
      }
      lines.push('');
    }

    // 이벤트
    if (spec.events.length > 0) {
      lines.push('## 8. 이벤트');
      lines.push('');
      lines.push('| 이벤트 ID | 이벤트명 | 트리거 | 대상 | 핸들러 |');
      lines.push('|-----------|----------|--------|------|--------|');
      for (const evt of spec.events) {
        lines.push(
          `| ${evt.eventId} | ${evt.eventName} | ${evt.triggerType} | ${evt.targetId || '-'} | ${evt.handler} |`
        );
      }
      lines.push('');
    }

    // 메시지
    if (spec.messages.length > 0) {
      lines.push('## 9. 메시지');
      lines.push('');
      lines.push('| 메시지 ID | 유형 | 내용 | 사용처 |');
      lines.push('|-----------|------|------|--------|');
      for (const msg of spec.messages) {
        lines.push(
          `| ${msg.messageId} | ${msg.messageType} | ${msg.messageText} | ${msg.useCase || '-'} |`
        );
      }
      lines.push('');
    }

    // 변경 이력
    if (spec.changeHistory.length > 0) {
      lines.push('## 10. 변경 이력');
      lines.push('');
      lines.push('| 버전 | 변경일 | 변경자 | 변경 유형 | 설명 |');
      lines.push('|------|--------|--------|-----------|------|');
      for (const history of spec.changeHistory) {
        lines.push(
          `| ${history.version} | ${history.changedAt} | ${history.changedBy} | ${history.changeType} | ${history.description} |`
        );
      }
      lines.push('');
    }

    // 푸터
    lines.push('---');
    lines.push(`*Generated by ${this.config.projectName} Pipeline*`);

    return lines.join('\n');
  }

  /**
   * DOCX 렌더링 (기본 구현 - docx 라이브러리 필요)
   */
  private async renderDocx(spec: ScreenSpec, screenshotPath: string | undefined, outputPath: string): Promise<void> {
    // DOCX 생성을 위해서는 docx 라이브러리 필요
    // 여기서는 Markdown을 임시로 저장하고, 실제 구현 시 docx 라이브러리 사용

    try {
      // docx 라이브러리 동적 로드 시도
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } = await import('docx');

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: `${spec.header.screenName || spec.header.screenId} 화면명세서`,
              heading: HeadingLevel.TITLE,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '화면 ID: ', bold: true }),
                new TextRun(spec.header.screenId),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '버전: ', bold: true }),
                new TextRun(spec.header.version),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '작성일: ', bold: true }),
                new TextRun(spec.header.createdAt),
              ],
            }),
            new Paragraph({
              text: '화면 개요',
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              text: spec.overview.description,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '접근 경로: ', bold: true }),
                new TextRun(spec.overview.accessPath),
              ],
            }),
          ],
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      fs.writeFileSync(outputPath, buffer);
    } catch {
      // docx 라이브러리가 없는 경우 Markdown 내용을 텍스트로 저장
      console.warn('[SpecBuilder] docx library not available, saving as text');
      const mdContent = this.renderMarkdown(spec, screenshotPath);
      const txtPath = outputPath.replace('.docx', '.txt');
      fs.writeFileSync(txtPath, mdContent, 'utf-8');
    }
  }

  /**
   * 캡처 결과로부터 ScreenSpec 생성
   */
  private createSpecFromCaptures(screenId: string, results: CaptureResult[]): ScreenSpec {
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
   * ScreenConfig로부터 ScreenSpec 생성
   */
  private createSpecFromConfig(config: ScreenConfig): ScreenSpec {
    const today = new Date().toISOString().split('T')[0];

    return {
      header: {
        screenId: config.id,
        screenName: config.name,
        version: '1.0.0',
        createdAt: today,
        createdBy: 'KonaI Pipeline',
      },
      overview: {
        description: `${config.name} 화면입니다.`,
        accessPath: config.route,
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
   * 결과를 화면별로 그룹화
   */
  private groupByScreen(results: CaptureResult[]): Record<string, CaptureResult[]> {
    const groups: Record<string, CaptureResult[]> = {};

    for (const result of results) {
      if (!groups[result.screenId]) {
        groups[result.screenId] = [];
      }
      groups[result.screenId].push(result);
    }

    return groups;
  }

  /**
   * 스크린샷 파일 찾기
   */
  private findScreenshot(screenId: string): string | undefined {
    const localeDir = path.join(this.config.screenshotDir, this.config.locale);

    if (!fs.existsSync(localeDir)) {
      return undefined;
    }

    const files = fs.readdirSync(localeDir);
    const screenshot = files.find(f => f.startsWith(screenId) && f.endsWith('.png'));

    if (screenshot) {
      return path.join(localeDir, screenshot);
    }

    return undefined;
  }

  /**
   * 화면 ID로 이름 조회
   */
  private getScreenNameById(screenId: string): string {
    // screen-states.json에서 조회 시도
    try {
      const configPath = 'config/screen-states.json';
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        const screen = config.screens.find((s: ScreenConfig) => s.id === screenId);
        if (screen) {
          return screen.name;
        }
      }
    } catch {
      // 무시
    }

    return screenId;
  }

  /**
   * 화면 ID로 접근 경로 조회
   */
  private getAccessPathById(screenId: string): string {
    // screen-states.json에서 조회 시도
    try {
      const configPath = 'config/screen-states.json';
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        const screen = config.screens.find((s: ScreenConfig) => s.id === screenId);
        if (screen) {
          return `메인 > ${screen.name}`;
        }
      }
    } catch {
      // 무시
    }

    return screenId;
  }

  /**
   * 디렉터리 생성
   */
  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * 설정 업데이트
   */
  updateConfig(config: Partial<SpecBuilderConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * 싱글톤 인스턴스
 */
let specInstance: SpecBuilder | null = null;

export function getSpecBuilder(config?: Partial<SpecBuilderConfig>): SpecBuilder {
  if (!specInstance) {
    specInstance = new SpecBuilder(config);
  }
  return specInstance;
}

export function resetSpecBuilder(): void {
  specInstance = null;
}
