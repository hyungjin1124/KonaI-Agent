---
name: screen-generator
description: |
  React 데모 화면을 자동으로 생성하고 화면명세서까지 생성하는 통합 스킬.
  사용 시점:
  - 새 화면 개발 요청 시
  - 기존 화면 수정 시
  - 화면명세서 생성/업데이트 시
  - /screen:create, /screen:update 명령어 실행 시
triggers:
  - "새 화면"
  - "화면 생성"
  - "화면 추가"
  - "화면 수정"
  - "컴포넌트 생성"
  - "CRUD 화면"
  - "대시보드"
  - "/screen:create"
  - "/screen:update"
---

# Screen Generator Skill

React 데모 화면 자동 생성 및 화면명세서 생성을 위한 통합 스킬입니다.

## 워크플로우 개요

1. **요구사항 분석**: 사용자 입력을 구조화된 명세로 변환
2. **코드 생성**: React + TypeScript 컴포넌트 생성
3. **서버 실행**: Vite 개발 서버 자동 실행
4. **캡처**: Puppeteer로 스크린샷 캡처
5. **명세서**: MD + DOCX 화면명세서 생성
6. **Git**: 자동 커밋 및 푸시

## 화면 타입별 패턴

### CRUD 화면
표준 CRUD 작업을 위한 화면입니다.

**구성 요소:**
- 검색 영역: 검색 조건 입력 필드, 조회 버튼
- 목록 영역: 데이터 테이블/그리드 (페이징, 정렬, 필터)
- 상세 영역: 등록/수정 폼 (모달 또는 페이지)
- 액션 버튼: 등록, 수정, 삭제

**코드 구조:**
```
src/pages/{screen-name}/
├── {ScreenName}.tsx          # 메인 컴포넌트
├── {ScreenName}.styles.ts    # 스타일 정의
├── {ScreenName}.types.ts     # 타입 정의
├── index.ts                  # 내보내기
└── components/               # 서브 컴포넌트 (선택)
    ├── SearchForm.tsx
    ├── DataGrid.tsx
    └── DetailModal.tsx
```

### Dashboard 화면
KPI 및 데이터 시각화를 위한 화면입니다.

**구성 요소:**
- KPI 카드: 주요 지표 요약
- 차트: Line, Bar, Pie 차트
- 데이터 테이블: 상세 데이터

### Form 화면
데이터 입력을 위한 폼 화면입니다.

**구성 요소:**
- 입력 필드 그룹
- 유효성 검증
- 제출/취소 버튼

### Report 화면
조회 및 내보내기를 위한 리포트 화면입니다.

**구성 요소:**
- 조회 조건
- 결과 테이블
- 내보내기 (Excel, PDF)

## 실행 방법

### 새 화면 생성
```bash
npm run workflow:screen -- create \
  --name "거래처관리" \
  --nameEn "CustomerManagement" \
  --type crud

# 또는 Claude Code에서
/screen:create
```

### 기존 화면 수정
```bash
npm run workflow:screen -- update \
  --id SCR-010 \
  --changes "검색 조건 추가"

# 또는 Claude Code에서
/screen:update
```

### 명세서만 생성
```bash
npm run workflow:spec -- generate \
  --id SCR-010 \
  --format all

# 또는 Claude Code에서
/spec:generate
```

## 모듈 참조

이 스킬은 다음 모듈들을 활용합니다:

- `scripts/core/react-generator.ts`: React 컴포넌트 생성
- `scripts/core/server-manager.ts`: 개발 서버 관리
- `scripts/core/capture-engine.ts`: 스크린샷 캡처
- `scripts/core/spec-builder.ts`: 명세서 생성
- `scripts/core/git-manager.ts`: Git 자동화
- `scripts/workflows/screen-workflow.ts`: 워크플로우 오케스트레이션

## 참조 문서

- `references/component-patterns.md`: 컴포넌트 코딩 패턴
- `references/screen-types.md`: 화면 타입별 상세 구조
- `references/spec-templates.md`: 명세서 작성 템플릿

## 설정 파일

### screen-states.json
```json
{
  "version": "1.0.0",
  "screens": [
    {
      "id": "SCR-010",
      "name": "거래처 관리",
      "nameEn": "CustomerManagement",
      "route": "/customer-management",
      "component": "CustomerManagement",
      "states": [
        {
          "stateId": "initial",
          "stateName": "초기 상태"
        }
      ]
    }
  ]
}
```

### workflow.config.ts
워크플로우 동작을 커스터마이징할 수 있습니다.

```typescript
{
  devServer: {
    port: 3000,
    startTimeout: 30000
  },
  capture: {
    defaultViewport: { width: 1920, height: 1080 }
  },
  git: {
    autoPush: false
  }
}
```

## 트러블슈팅

### 서버 시작 실패
- 포트 충돌 확인: `lsof -i :3000`
- 의존성 설치 확인: `npm install`

### 캡처 실패
- 브라우저 설치 확인: `npx puppeteer install`
- 화면 로드 대기 시간 증가

### Git 커밋 실패
- 변경 사항 확인: `git status`
- 스테이징 확인: `git diff --cached`
