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

브라우저에서 `http://localhost:5173` (기본 포트)으로 접속합니다.

### PPT 시나리오 실행하기

개발 서버 실행 후 아래 순서대로 시나리오를 체험할 수 있습니다.

#### 1. 로그인

| 항목 | 값 |
|------|------|
| Email | `admin@konai.com` |
| Password | `password123` |

로그인 화면에서 위 정보를 입력하고 **"로그인"** 버튼을 클릭합니다.

#### 2. 시나리오 트리거

로그인 후 대시보드 상단의 입력창에 다음과 같이 입력하고 **Enter**를 누릅니다.

```
Q4 2025 경영 실적 보고서 PPT를 만들어주세요.
```

> **Tip:** "PPT"와 함께 "보고서", "생성", "만들어", "Q4" 중 하나 이상의 키워드가 포함되면 PPT 시나리오가 자동으로 시작됩니다.

#### 3. 시나리오 진행 (HITL 상호작용)

시나리오가 시작되면 에이전트가 자동으로 단계를 진행하며, 중간중간 사용자 확인이 필요한 **HITL(Human-In-The-Loop)** 단계에서 멈춥니다. 화면 우측 하단의 플로팅 패널에서 버튼을 클릭하여 진행합니다.

| 단계 | 내용 | 사용자 액션 |
|------|------|-------------|
| 데이터 소스 선택 | ERP 시스템 등 데이터 소스 선택 | **"승인"** 클릭 |
| 데이터 검증 | 매출액, 영업이익 등 조회 데이터 확인 | **"데이터 확인"** 클릭 |
| PPT 설정 | 테마, 톤, 폰트 등 PPT 세부 설정 | **"완료"** 클릭 |
| 슬라이드 구성 검토 | 생성된 슬라이드 개요 확인 | **"모두 승인"** 클릭 |
| 테마/폰트 선택 | 최종 테마 및 폰트 적용 | **"적용"** 클릭 |

모든 HITL 단계를 완료하면 슬라이드가 자동 생성되고, 완료 화면에서 PPT를 다운로드하거나 프레젠테이션을 시작할 수 있습니다.

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
