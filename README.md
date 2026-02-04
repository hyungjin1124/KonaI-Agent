# Kona ERP Frontend Demo

ERP 시스템 데모 화면 개발 및 화면명세서 자동 생성 시스템입니다.

## 프로젝트 구조

```
kona-erp-frontend-demo/
├── src/                    # React 소스 코드
│   ├── components/         # 재사용 가능한 컴포넌트
│   ├── pages/              # 페이지 컴포넌트
│   ├── hooks/              # 커스텀 훅
│   ├── context/            # React Context
│   ├── services/           # API 서비스
│   ├── types/              # TypeScript 타입 정의
│   └── styles/             # 스타일 파일
├── scripts/                # 자동화 스크립트
│   ├── capture/            # 스크린샷 캡처
│   ├── generate/           # 문서 생성
│   └── workflows/          # 워크플로우 오케스트레이션
├── specs/                  # 화면명세서 문서
├── demos/                  # 데모 화면 저장
├── templates/              # 문서 생성 템플릿
├── config/                 # 설정 파일
└── tests/                  # 테스트 코드
```

## 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Lucide React, React Grid Layout, ReactFlow, Recharts
- **Automation**: Puppeteer (스크린샷 캡처), docx (문서 생성)
- **Testing**: Vitest, Axe-core (접근성 검사)

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- npm

### 설치

```bash
# 저장소 클론
git clone https://gitlab.konai.com:8081/konachain_ai/kona-erp-frontend-demo.git
cd kona-erp-frontend-demo

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

## 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run capture` | 스크린샷 캡처 |
| `npm run capture:all` | 모든 시나리오 캡처 |
| `npm run generate:spec` | 화면명세서 생성 |
| `npm run pipeline:full` | 전체 파이프라인 실행 |
| `npm run pipeline:quick` | 빠른 파이프라인 실행 |
| `npm run test` | 테스트 실행 |
| `npm run test:e2e` | E2E 테스트 실행 |

## 라이선스

ISC
