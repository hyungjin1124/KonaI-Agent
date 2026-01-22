/**
 * DOCX 문서 빌더
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  ImageRun,
  HeadingLevel,
  AlignmentType,
  WidthType,
  PageBreak,
  TableOfContents,
  Footer,
  PageNumber,
  Header,
} from 'docx';
import * as fs from 'fs';
import * as path from 'path';
import { KonaBrandStyles, BRAND_COLORS } from '../../templates/docx/styles/kona-brand.js';
import { ScreenSpec, InputField, ButtonSpec, GridColumn, EventSpec } from '../../config/types.js';

export class DocxBuilder {
  private styles: KonaBrandStyles;

  constructor() {
    this.styles = new KonaBrandStyles();
  }

  /**
   * 화면 명세서 문서 생성
   */
  async buildSpecDocument(spec: ScreenSpec, screenshotPath?: string): Promise<Document> {
    const sections: (Paragraph | Table)[] = [];
    const screenName = spec.header.screenName || spec.header.screenId;

    // 제목
    sections.push(this.createTitle(screenName));
    sections.push(this.createSubtitle(`화면 ID: ${spec.header.screenId} | 버전: ${spec.header.version}`));

    // 문서 정보
    sections.push(...this.createDocInfo(spec.header));

    // 개요 섹션
    sections.push(this.createHeading2('1. 화면 개요'));
    sections.push(...this.createOverviewSection(spec.overview));

    // 스크린샷 섹션 (있는 경우)
    if (screenshotPath && fs.existsSync(screenshotPath)) {
      sections.push(this.createHeading2('2. 화면 레이아웃'));
      sections.push(await this.createScreenshotSection(screenshotPath));
    }

    // 입력 항목 섹션
    if (spec.inputFields && spec.inputFields.length > 0) {
      sections.push(this.createHeading2('3. 입력 항목 정의'));
      sections.push(this.createInputFieldsTable(spec.inputFields));
    }

    // 버튼 섹션
    if (spec.buttons && spec.buttons.length > 0) {
      sections.push(this.createHeading2('4. 버튼/액션 정의'));
      sections.push(this.createButtonsTable(spec.buttons));
    }

    // 그리드 컬럼 섹션
    if (spec.gridColumns && spec.gridColumns.length > 0) {
      sections.push(this.createHeading2('5. 그리드 컬럼 정의'));
      sections.push(this.createGridColumnsTable(spec.gridColumns));
    }

    // 이벤트 섹션
    if (spec.events && spec.events.length > 0) {
      sections.push(this.createHeading2('6. 이벤트 처리'));
      sections.push(this.createEventsTable(spec.events));
    }

    return new Document({
      styles: this.styles.getDocumentStyles(),
      sections: [
        {
          properties: this.styles.getSectionProperties(),
          headers: {
            default: this.createHeader(screenName),
          },
          footers: {
            default: this.createFooter(),
          },
          children: sections,
        },
      ],
    });
  }

  /**
   * 문서를 파일로 저장
   */
  async saveDocument(doc: Document, outputPath: string): Promise<void> {
    const buffer = await Packer.toBuffer(doc);
    const dir = path.dirname(outputPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, buffer);
  }

  /**
   * 제목 생성
   */
  private createTitle(text: string): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text,
          bold: true,
          size: 48,
          font: 'Pretendard',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    });
  }

  /**
   * 부제목 생성
   */
  private createSubtitle(text: string): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text,
          size: 24,
          color: BRAND_COLORS.GRAY,
          font: 'Pretendard',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    });
  }

  /**
   * 문서 정보 섹션
   */
  private createDocInfo(header: ScreenSpec['header']): Paragraph[] {
    return [
      new Paragraph({
        children: [
          new TextRun({ text: '작성일: ', bold: true, size: 20 }),
          new TextRun({ text: header.createdAt, size: 20 }),
          new TextRun({ text: '  |  ', size: 20 }),
          new TextRun({ text: '작성자: ', bold: true, size: 20 }),
          new TextRun({ text: header.createdBy, size: 20 }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      header.updatedAt
        ? new Paragraph({
            children: [
              new TextRun({ text: '수정일: ', bold: true, size: 20 }),
              new TextRun({ text: header.updatedAt, size: 20 }),
              new TextRun({ text: '  |  ', size: 20 }),
              new TextRun({ text: '수정자: ', bold: true, size: 20 }),
              new TextRun({ text: header.updatedBy || '-', size: 20 }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          })
        : new Paragraph({ spacing: { after: 400 } }),
    ];
  }

  /**
   * Heading 2 생성
   */
  private createHeading2(text: string): Paragraph {
    return new Paragraph({
      text,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    });
  }

  /**
   * 개요 섹션
   */
  private createOverviewSection(overview: ScreenSpec['overview']): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: '설명: ', bold: true, size: 22 }),
          new TextRun({ text: overview.description, size: 22 }),
        ],
        spacing: { after: 100 },
      })
    );

    if (overview.accessPath) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: '접근 경로: ', bold: true, size: 22 }),
            new TextRun({ text: overview.accessPath, size: 22 }),
          ],
          spacing: { after: 100 },
        })
      );
    }

    if (overview.businessRules) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: '업무 규칙: ', bold: true, size: 22 }),
            new TextRun({ text: overview.businessRules, size: 22 }),
          ],
          spacing: { after: 200 },
        })
      );
    }

    return paragraphs;
  }

  /**
   * 스크린샷 섹션
   */
  private async createScreenshotSection(screenshotPath: string): Promise<Paragraph> {
    const imageBuffer = fs.readFileSync(screenshotPath);
    const ext = path.extname(screenshotPath).slice(1).toLowerCase();
    const imageType: 'png' | 'jpg' | 'gif' | 'bmp' = ext === 'jpeg' || ext === 'jpg' ? 'jpg' : 'png';

    return new Paragraph({
      children: [
        new ImageRun({
          data: imageBuffer,
          transformation: {
            width: 600,
            height: 338, // 16:9 비율
          },
          type: imageType,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    });
  }

  /**
   * 입력 항목 테이블
   */
  private createInputFieldsTable(fields: InputField[]): Table {
    const headerRow = new TableRow({
      children: ['필드명', '필드ID', '타입', '길이', '필수', '설명'].map(
        (text) =>
          new TableCell({
            children: [new Paragraph({ text, alignment: AlignmentType.CENTER })],
            shading: this.styles.getTableHeaderShading(),
            width: { size: 16.67, type: WidthType.PERCENTAGE },
          })
      ),
      tableHeader: true,
    });

    const dataRows = fields.map(
      (field) =>
        new TableRow({
          children: [
            this.createTableCell(field.fieldName),
            this.createTableCell(field.fieldId || '-'),
            this.createTableCell(field.dataType),
            this.createTableCell(field.length?.toString() || '-'),
            this.createTableCell(field.required ? 'Y' : 'N', field.required),
            this.createTableCell(field.remarks || '-'),
          ],
        })
    );

    return new Table({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
  }

  /**
   * 버튼 테이블
   */
  private createButtonsTable(buttons: ButtonSpec[]): Table {
    const headerRow = new TableRow({
      children: ['버튼명', 'ID', '이벤트', '처리 내용', 'API'].map(
        (text) =>
          new TableCell({
            children: [new Paragraph({ text, alignment: AlignmentType.CENTER })],
            shading: this.styles.getTableHeaderShading(),
            width: { size: 20, type: WidthType.PERCENTAGE },
          })
      ),
      tableHeader: true,
    });

    const dataRows = buttons.map(
      (button) =>
        new TableRow({
          children: [
            this.createTableCell(button.buttonName),
            this.createTableCell(button.buttonId || '-'),
            this.createTableCell(button.eventType),
            this.createTableCell(button.action),
            this.createTableCell(button.apiEndpoint || '-'),
          ],
        })
    );

    return new Table({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
  }

  /**
   * 그리드 컬럼 테이블
   */
  private createGridColumnsTable(columns: GridColumn[]): Table {
    const headerRow = new TableRow({
      children: ['컬럼명', 'ID', '타입', '너비', '정렬', '정렬가능', '비고'].map(
        (text) =>
          new TableCell({
            children: [new Paragraph({ text, alignment: AlignmentType.CENTER })],
            shading: this.styles.getTableHeaderShading(),
            width: { size: 14.28, type: WidthType.PERCENTAGE },
          })
      ),
      tableHeader: true,
    });

    const dataRows = columns.map(
      (col) =>
        new TableRow({
          children: [
            this.createTableCell(col.columnName),
            this.createTableCell(col.columnId || '-'),
            this.createTableCell(col.dataType),
            this.createTableCell(col.width?.toString() || 'auto'),
            this.createTableCell(col.align),
            this.createTableCell(col.sortable !== false ? 'Y' : 'N'),
            this.createTableCell(col.remarks),
          ],
        })
    );

    return new Table({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
  }

  /**
   * 이벤트 테이블
   */
  private createEventsTable(events: EventSpec[]): Table {
    const headerRow = new TableRow({
      children: ['이벤트명', 'ID', '트리거', '대상', '처리 내용'].map(
        (text) =>
          new TableCell({
            children: [new Paragraph({ text, alignment: AlignmentType.CENTER })],
            shading: this.styles.getTableHeaderShading(),
            width: { size: 20, type: WidthType.PERCENTAGE },
          })
      ),
      tableHeader: true,
    });

    const dataRows = events.map(
      (event) =>
        new TableRow({
          children: [
            this.createTableCell(event.eventName),
            this.createTableCell(event.eventId),
            this.createTableCell(event.triggerType),
            this.createTableCell(event.targetId || '-'),
            this.createTableCell(event.handler),
          ],
        })
    );

    return new Table({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
  }

  /**
   * 테이블 셀 생성
   */
  private createTableCell(text: string, highlight = false): TableCell {
    return new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              size: 20,
              color: highlight ? BRAND_COLORS.PRIMARY : BRAND_COLORS.BLACK,
              bold: highlight,
            }),
          ],
        }),
      ],
      borders: this.styles.getTableBorders(),
    });
  }

  /**
   * 헤더 생성
   */
  private createHeader(screenName: string): Header {
    return new Header({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: `KonaI Agent - ${screenName}`,
              size: 18,
              color: BRAND_COLORS.GRAY,
            }),
          ],
          alignment: AlignmentType.RIGHT,
        }),
      ],
    });
  }

  /**
   * 푸터 생성
   */
  private createFooter(): Footer {
    return new Footer({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: 'Page ',
              size: 18,
            }),
            new TextRun({
              children: [PageNumber.CURRENT],
              size: 18,
            }),
            new TextRun({
              text: ' of ',
              size: 18,
            }),
            new TextRun({
              children: [PageNumber.TOTAL_PAGES],
              size: 18,
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
      ],
    });
  }
}
