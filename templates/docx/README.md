# Document Generation Scripts

이 디렉토리는 Word 문서(.docx)를 자동으로 생성하는 스크립트와 템플릿을 저장하는 공간입니다.

## 🎯 용도

- 명세서 자동 생성
- 보고서 템플릿
- 문서 변환 스크립트
- 배치 문서 생성

## 📦 주요 라이브러리

프로젝트는 `docx` 라이브러리를 사용합니다.

```bash
npm install docx
```

## 🚀 기본 사용 예제

### 간단한 문서 생성

```javascript
import { Document, Packer, Paragraph, TextRun } from 'docx';
import fs from 'fs';

// 문서 생성
const doc = new Document({
  sections: [{
    properties: {},
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: "KonaI Agent 명세서",
            bold: true,
            size: 32,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "이 문서는 KonaI Agent의 기능을 설명합니다.",
          }),
        ],
      }),
    ],
  }],
});

// 파일로 저장
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("output.docx", buffer);
});
```

### 템플릿 기반 생성

```javascript
import { Document, Packer } from 'docx';

async function generateSpec(data) {
  const doc = new Document({
    sections: [{
      children: [
        createTitle(data.title),
        createSection("개요", data.overview),
        createSection("기능 요구사항", data.requirements),
      ],
    }],
  });

  return Packer.toBuffer(doc);
}
```

## 📂 파일 구조 권장사항

```
docx/
├── generators/       # 문서 생성 스크립트
├── templates/        # 문서 템플릿
└── utils/           # 공통 유틸리티
```

## 🔧 고급 기능

### 표 생성

```javascript
import { Table, TableRow, TableCell } from 'docx';

const table = new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("항목")] }),
        new TableCell({ children: [new Paragraph("설명")] }),
      ],
    }),
  ],
});
```

### 이미지 삽입

```javascript
import { ImageRun } from 'docx';
import fs from 'fs';

const image = new ImageRun({
  data: fs.readFileSync("./image.png"),
  transformation: {
    width: 600,
    height: 400,
  },
});
```

### 스타일 적용

```javascript
import { HeadingLevel } from 'docx';

const heading = new Paragraph({
  text: "제목",
  heading: HeadingLevel.HEADING_1,
});
```

## 📝 템플릿 구조

템플릿 JSON 형식 예제:

```json
{
  "title": "문서 제목",
  "sections": [
    {
      "heading": "섹션 1",
      "content": "내용...",
      "subsections": []
    }
  ],
  "metadata": {
    "author": "작성자",
    "date": "2026-01-21"
  }
}
```

## 🔄 자동화 스크립트

### 배치 생성

```javascript
// generateAll.js
import { generateSpec } from './generators/spec.js';
import fs from 'fs';
import path from 'path';

const specsDir = './specs';
const outputDir = './outputs';

fs.readdirSync(specsDir).forEach(async (file) => {
  if (file.endsWith('.json')) {
    const data = JSON.parse(fs.readFileSync(path.join(specsDir, file)));
    const buffer = await generateSpec(data);
    fs.writeFileSync(
      path.join(outputDir, file.replace('.json', '.docx')),
      buffer
    );
  }
});
```

## 💡 베스트 프랙티스

1. **모듈화**: 재사용 가능한 함수로 분리
2. **타입 안정성**: TypeScript 사용 권장
3. **에러 처리**: 파일 I/O 에러 처리
4. **성능**: 대용량 문서 생성 시 스트림 사용
5. **테스트**: 생성된 문서의 유효성 검증

## 📊 출력 경로

생성된 문서는 `outputs/` 디렉토리에 저장됩니다.

```javascript
const outputPath = './outputs/spec-2026-01-21.docx';
```

## ✅ 체크리스트

문서 생성 스크립트 작성 시:
- [ ] 템플릿 구조 정의
- [ ] 데이터 검증 로직
- [ ] 에러 처리
- [ ] 출력 파일 경로 설정
- [ ] 생성된 문서 검증
