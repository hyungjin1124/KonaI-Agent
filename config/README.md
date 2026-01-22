# Configuration

이 디렉토리는 프로젝트의 설정 파일을 저장하는 공간입니다.

## 🎯 용도

- 애플리케이션 설정
- 환경별 설정 파일
- API 엔드포인트 설정
- 빌드 설정
- 로깅 설정

## 📂 설정 파일 구조 권장사항

```
config/
├── default.json      # 기본 설정
├── development.json  # 개발 환경
├── production.json   # 프로덕션 환경
├── test.json        # 테스트 환경
└── puppeteer.json   # Puppeteer 설정
```

## 📝 설정 파일 예제

### default.json

```json
{
  "app": {
    "name": "kona-agent-specs",
    "version": "1.0.0"
  },
  "paths": {
    "demos": "./demos",
    "specs": "./specs",
    "templates": "./templates",
    "outputs": "./outputs"
  },
  "puppeteer": {
    "headless": true,
    "timeout": 30000,
    "viewport": {
      "width": 1920,
      "height": 1080
    }
  },
  "document": {
    "defaultAuthor": "KonaI Team",
    "defaultFormat": "docx"
  }
}
```

### development.json

```json
{
  "debug": true,
  "logLevel": "debug",
  "puppeteer": {
    "headless": false,
    "slowMo": 100
  }
}
```

### production.json

```json
{
  "debug": false,
  "logLevel": "error",
  "puppeteer": {
    "headless": true,
    "slowMo": 0
  }
}
```

## 🔧 설정 로드 방법

### 환경별 설정 로드

```javascript
// config/index.js
import fs from 'fs';
import path from 'path';

const env = process.env.NODE_ENV || 'development';

function loadConfig() {
  const defaultConfig = JSON.parse(
    fs.readFileSync('./config/default.json', 'utf-8')
  );

  const envConfigPath = `./config/${env}.json`;
  const envConfig = fs.existsSync(envConfigPath)
    ? JSON.parse(fs.readFileSync(envConfigPath, 'utf-8'))
    : {};

  return { ...defaultConfig, ...envConfig };
}

export const config = loadConfig();
```

### 사용 예제

```javascript
import { config } from './config/index.js';

console.log(`App: ${config.app.name}`);
console.log(`Environment: ${process.env.NODE_ENV}`);

// Puppeteer 설정 사용
const browser = await puppeteer.launch({
  headless: config.puppeteer.headless,
  timeout: config.puppeteer.timeout,
});
```

## 🔐 환경 변수와의 조합

설정 파일과 환경 변수를 함께 사용:

```javascript
export const config = {
  ...loadConfig(),
  apiKey: process.env.OPENAI_API_KEY,
  databaseUrl: process.env.DATABASE_URL,
};
```

## 📊 설정 검증

설정 값의 유효성 검증:

```javascript
// config/validator.js
export function validateConfig(config) {
  if (!config.app.name) {
    throw new Error('App name is required');
  }

  if (config.puppeteer.timeout < 1000) {
    throw new Error('Timeout must be at least 1000ms');
  }

  return true;
}
```

## 💡 베스트 프랙티스

1. **기본값 제공**: 모든 설정에 합리적인 기본값 설정
2. **환경 분리**: 환경별로 설정 파일 분리
3. **민감 정보 제외**: API 키 등은 환경 변수 사용
4. **검증**: 설정 값의 유효성 검증
5. **문서화**: 각 설정 항목의 의미와 사용법 문서화

## 🔄 설정 우선순위

설정 값의 우선순위 (높은 순):

1. 환경 변수 (`process.env`)
2. 환경별 설정 파일 (`development.json`, `production.json`)
3. 기본 설정 파일 (`default.json`)

## 📝 설정 항목 가이드

### Puppeteer 설정

```json
{
  "puppeteer": {
    "headless": true,          // 브라우저 UI 표시 여부
    "timeout": 30000,          // 작업 타임아웃 (ms)
    "slowMo": 0,              // 느린 모드 (디버깅용)
    "viewport": {
      "width": 1920,           // 뷰포트 너비
      "height": 1080           // 뷰포트 높이
    },
    "args": [
      "--no-sandbox",          // 샌드박스 비활성화
      "--disable-setuid-sandbox"
    ]
  }
}
```

### 문서 생성 설정

```json
{
  "document": {
    "defaultAuthor": "작성자명",
    "defaultFormat": "docx",
    "pageMargins": {
      "top": 1440,
      "right": 1440,
      "bottom": 1440,
      "left": 1440
    }
  }
}
```

## ✅ 체크리스트

설정 파일 추가 시:
- [ ] 기본값 설정
- [ ] 환경별 설정 분리
- [ ] 민감 정보 환경 변수 처리
- [ ] 설정 검증 로직
- [ ] 문서화
