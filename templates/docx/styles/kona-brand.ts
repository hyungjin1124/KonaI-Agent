/**
 * KonaI 브랜드 스타일 정의
 */

import {
  IStylesOptions,
  AlignmentType,
  HeadingLevel,
  convertInchesToTwip,
  ISectionPropertiesOptions,
  BorderStyle,
  ITableCellBorders,
} from 'docx';

// 브랜드 컬러 (constants/theme.ts에서 가져온 값)
export const BRAND_COLORS = {
  PRIMARY: 'FF3C42',      // 코나 레드
  PRIMARY_DARK: 'E02B31',
  BLACK: '000000',
  WHITE: 'FFFFFF',
  GRAY_DARK: '0A0A0A',
  GRAY_MEDIUM: '555555',
  GRAY: '848383',
  GRAY_LIGHT: 'AAAAAA',
  GRAY_LIGHTER: 'E5E7EB',
} as const;

export class KonaBrandStyles {
  /**
   * 문서 스타일 정의
   */
  getDocumentStyles(): IStylesOptions {
    return {
      default: {
        document: {
          run: {
            font: 'Pretendard',
            size: 22, // 11pt
          },
          paragraph: {
            spacing: {
              line: 276, // 1.15 line spacing
              after: 120,
            },
          },
        },
        heading1: {
          run: {
            font: 'Pretendard',
            size: 36, // 18pt
            bold: true,
            color: BRAND_COLORS.BLACK,
          },
          paragraph: {
            spacing: {
              before: 240,
              after: 120,
            },
          },
        },
        heading2: {
          run: {
            font: 'Pretendard',
            size: 28, // 14pt
            bold: true,
            color: BRAND_COLORS.PRIMARY,
          },
          paragraph: {
            spacing: {
              before: 200,
              after: 100,
            },
          },
        },
        heading3: {
          run: {
            font: 'Pretendard',
            size: 24, // 12pt
            bold: true,
            color: BRAND_COLORS.GRAY_DARK,
          },
          paragraph: {
            spacing: {
              before: 160,
              after: 80,
            },
          },
        },
        title: {
          run: {
            font: 'Pretendard',
            size: 48, // 24pt
            bold: true,
            color: BRAND_COLORS.BLACK,
          },
          paragraph: {
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 200,
            },
          },
        },
      },
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            font: 'Pretendard',
            size: 22,
          },
        },
        {
          id: 'TableHeader',
          name: 'Table Header',
          basedOn: 'Normal',
          run: {
            bold: true,
            color: BRAND_COLORS.WHITE,
            size: 20,
          },
          paragraph: {
            alignment: AlignmentType.CENTER,
          },
        },
        {
          id: 'TableCell',
          name: 'Table Cell',
          basedOn: 'Normal',
          run: {
            size: 20,
          },
        },
        {
          id: 'Caption',
          name: 'Caption',
          basedOn: 'Normal',
          run: {
            size: 18,
            color: BRAND_COLORS.GRAY,
            italics: true,
          },
          paragraph: {
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 60,
              after: 120,
            },
          },
        },
        {
          id: 'Footer',
          name: 'Footer',
          basedOn: 'Normal',
          run: {
            size: 18,
            color: BRAND_COLORS.GRAY,
          },
          paragraph: {
            alignment: AlignmentType.CENTER,
          },
        },
      ],
    };
  }

  /**
   * 섹션 속성 (페이지 설정)
   */
  getSectionProperties(): ISectionPropertiesOptions {
    return {
      page: {
        margin: {
          top: convertInchesToTwip(1),
          right: convertInchesToTwip(1),
          bottom: convertInchesToTwip(1),
          left: convertInchesToTwip(1),
        },
        size: {
          width: convertInchesToTwip(8.27),  // A4
          height: convertInchesToTwip(11.69), // A4
        },
      },
    };
  }

  /**
   * 테이블 헤더 스타일
   */
  getTableHeaderStyle(): {
    bold: boolean;
    color: string;
    size: number;
  } {
    return {
      bold: true,
      color: BRAND_COLORS.WHITE,
      size: 20,
    };
  }

  /**
   * 테이블 헤더 셀 배경
   */
  getTableHeaderShading(): { fill: string } {
    return {
      fill: BRAND_COLORS.BLACK,
    };
  }

  /**
   * 테이블 테두리 스타일
   */
  getTableBorders(): ITableCellBorders {
    return {
      top: { style: BorderStyle.SINGLE, size: 1, color: BRAND_COLORS.GRAY_LIGHTER },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: BRAND_COLORS.GRAY_LIGHTER },
      left: { style: BorderStyle.SINGLE, size: 1, color: BRAND_COLORS.GRAY_LIGHTER },
      right: { style: BorderStyle.SINGLE, size: 1, color: BRAND_COLORS.GRAY_LIGHTER },
    };
  }

  /**
   * 강조 테두리 (Primary 컬러)
   */
  getAccentBorders(): ITableCellBorders {
    return {
      top: { style: BorderStyle.SINGLE, size: 2, color: BRAND_COLORS.PRIMARY },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: BRAND_COLORS.PRIMARY },
      left: { style: BorderStyle.SINGLE, size: 2, color: BRAND_COLORS.PRIMARY },
      right: { style: BorderStyle.SINGLE, size: 2, color: BRAND_COLORS.PRIMARY },
    };
  }

  /**
   * 필수 항목 표시 스타일
   */
  getRequiredStyle(): { color: string; bold: boolean } {
    return {
      color: BRAND_COLORS.PRIMARY,
      bold: true,
    };
  }

  /**
   * 코드 블록 스타일
   */
  getCodeStyle(): {
    font: string;
    size: number;
    color: string;
  } {
    return {
      font: 'Consolas',
      size: 18,
      color: BRAND_COLORS.GRAY_DARK,
    };
  }
}

// 싱글톤 인스턴스
export const konaBrandStyles = new KonaBrandStyles();
