# Scripts

이 디렉토리는 프로젝트 자동화 스크립트를 저장하는 공간입니다.

## 🎯 용도

- 데모 화면 캡처 자동화
- 문서 생성 자동화
- 배치 처리 스크립트
- 데이터 변환 유틸리티
- CI/CD 스크립트

## 📂 스크립트 분류

```
scripts/
├── capture/          # 화면 캡처 스크립트
├── generate/         # 문서 생성 스크립트
├── transform/        # 데이터 변환 스크립트
└── utils/           # 공통 유틸리티
```

## 🚀 주요 스크립트 예제

### 1. 화면 캡처 스크립트 (Puppeteer)

```javascript
// capture-demo.js
import puppeteer from 'puppeteer';
import path from 'path';

async function captureScreenshot(url, outputPath) {
  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.screenshot({
      path: outputPath,
      fullPage: true
    });
    console.log(`Screenshot saved: ${outputPath}`);
  } finally {
    await browser.close();
  }
}

// 사용 예
captureScreenshot(
  'https://example.com',
  './demos/example-screenshot.png'
);
```

### 2. 배치 스크린샷 캡처

```javascript
// batch-capture.js
import { captureScreenshot } from './capture-demo.js';

const pages = [
  { url: 'https://example.com/page1', name: 'page1' },
  { url: 'https://example.com/page2', name: 'page2' },
];

for (const page of pages) {
  await captureScreenshot(
    page.url,
    `./demos/${page.name}.png`
  );
}
```

### 3. 문서 생성 스크립트

```javascript
// generate-specs.js
import { generateSpec } from '../templates/docx/generators/spec.js';
import fs from 'fs';

const specData = {
  title: 'KonaI Agent 명세서',
  version: '1.0.0',
  sections: [
    { heading: '개요', content: '...' },
    { heading: '기능', content: '...' },
  ],
};

const buffer = await generateSpec(specData);
fs.writeFileSync('./outputs/spec.docx', buffer);
```

### 4. 환경 설정 검증

```javascript
// check-env.js
import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
];

const missing = requiredEnvVars.filter(
  varName => !process.env[varName]
);

if (missing.length > 0) {
  console.error('Missing environment variables:', missing);
  process.exit(1);
}

console.log('Environment check passed!');
```

## 🔧 스크립트 실행 방법

### package.json에 스크립트 추가

```json
{
  "scripts": {
    "capture": "node scripts/capture-demo.js",
    "generate": "node scripts/generate-specs.js",
    "check-env": "node scripts/check-env.js"
  }
}
```

### 실행

```bash
npm run capture
npm run generate
npm run check-env
```

## 💡 베스트 프랙티스

1. **에러 처리**: 모든 스크립트에 적절한 에러 처리 추가
2. **로깅**: 진행 상황과 결과를 명확히 로깅
3. **환경 변수**: 민감한 정보는 환경 변수 사용
4. **재사용성**: 공통 기능은 유틸리티로 분리
5. **문서화**: 각 스크립트의 용도와 사용법 주석 작성

## 📝 스크립트 템플릿

```javascript
#!/usr/bin/env node

/**
 * 스크립트 이름
 *
 * 설명: 이 스크립트의 용도
 * 사용법: node scripts/script-name.js [옵션]
 *
 * 옵션:
 *   --option1: 옵션 설명
 *   --option2: 옵션 설명
 */

import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    // 스크립트 로직
    console.log('Starting...');

    // 작업 수행

    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
```

## 🔐 보안 주의사항

- API 키는 절대 코드에 하드코딩하지 않기
- `.env` 파일은 `.gitignore`에 포함
- 민감한 데이터는 환경 변수로 관리
- 외부 입력은 항상 검증

## ✅ 체크리스트

새 스크립트 추가 시:
- [ ] 명확한 목적과 사용법 문서화
- [ ] 에러 처리 구현
- [ ] 환경 변수 검증
- [ ] 로깅 추가
- [ ] package.json에 스크립트 명령어 추가
- [ ] 테스트 실행
