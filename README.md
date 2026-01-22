# KonaI Agent Specifications

KonaI Agent 프로젝트의 명세서, 데모 화면, 문서 생성 템플릿을 관리하는 저장소입니다.

## 📁 프로젝트 구조

```
kona-agent-specs/
├── demos/              # 데모 화면 저장
├── specs/              # 명세서 문서
├── templates/
│   ├── prompts/        # AI Studio Build 프롬프트
│   └── docx/           # 문서 생성 스크립트
├── scripts/            # 자동화 스크립트
├── config/             # 설정 파일
└── outputs/            # 임시 출력 (git ignored)
```

## 🚀 시작하기

### 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone https://github.com/hyungjin1124/KonaI-Agent.git
cd KonaI-Agent

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 필요한 값을 설정하세요
```

## 📦 주요 의존성

- **puppeteer**: 브라우저 자동화 및 스크린샷 캡처
- **docx**: 워드 문서 생성
- **dotenv**: 환경 변수 관리

## 📖 사용 방법

### 데모 화면 관리

`demos/` 디렉토리에 프로젝트의 데모 스크린샷과 영상을 저장합니다.

### 명세서 작성

`specs/` 디렉토리에 프로젝트 명세서 문서를 작성합니다.

### 템플릿 사용

- `templates/prompts/`: AI Studio Build에서 사용할 프롬프트 템플릿
- `templates/docx/`: 문서 자동 생성 스크립트

### 자동화 스크립트

`scripts/` 디렉토리의 스크립트를 사용하여 반복 작업을 자동화합니다.

## 🔧 개발

### 디렉토리별 상세 정보

각 디렉토리에는 해당 디렉토리의 용도와 사용법을 설명하는 README.md가 있습니다.

## 📝 라이선스

ISC

## 👥 기여

이슈와 풀 리퀘스트는 언제나 환영합니다!
