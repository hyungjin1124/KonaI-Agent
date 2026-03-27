# 경쟁사 제품 변경 사항 스캔 (2026-03-19 ~ 2026-03-26)

> Researched: 2026-03-26
> Researcher: Claude Code (researcher agent)
> Status: Final

## Executive Summary

2026-03-19~26 기간 동안 8개 경쟁사 소스를 스캔했다. ChatGPT의 Library 기능(파일 자동 저장/재사용), Claude의 Computer Use 확장(Cowork/Claude Code), Cursor의 Self-hosted Cloud Agent, GitHub Copilot의 PR 내 @copilot 멘션 편집 기능이 KonaI-Agent UI/UX 설계에 참고할 만한 주요 변경 사항이다.

---

## 스캔 결과 요약

| # | 소스 | URL | 상태 | UI 관련 변경 |
|---|------|-----|------|-------------|
| 1 | ChatGPT | releasebot.io/updates/openai/chatgpt | 확인 완료 (4건) | Library 기능, 쇼핑 비교 UI |
| 2 | Claude | releasebot.io/updates/anthropic/claude | 확인 완료 (1건) | Computer Use in Cowork |
| 3 | Cursor | cursor.com/changelog | 확인 완료 (2건) | Self-hosted Cloud Agent, Composer 2 |
| 4 | Gemini | gemini.google/release-notes | 변경 없음 | 최근 항목: 2026-02-19 |
| 5 | Windsurf | windsurf.com/changelog | 변경 없음 | 버그 수정만 (2026-03-19) |
| 6 | Bolt.new | support.bolt.new/release-notes | 변경 없음 | 최근 항목: ~2026-03-13 |
| 7 | v0 by Vercel | v0.dev/changelog | 확인 완료 (2건) | .riv 파일 업로드, Next.js 16.2.0 |
| 8 | GitHub Copilot | releasebot.io/updates/github | 확인 완료 (7건+) | PR 내 @copilot 편집, 세션 로그 추적 |

---

## 상세 내역

### 1. ChatGPT (OpenAI)
- **URL**: https://releasebot.io/updates/openai/chatgpt
- **상태**: 확인 완료

| 날짜 | 변경 내용 |
|------|----------|
| 03-24 | **쇼핑 개선** — 대화형 브라우징, 이미지 기반 유사 상품 검색, 나란히 비교 UI. Agentic Commerce Protocol 활용 |
| 03-23 | **Library 기능 출시** — 업로드/생성 파일 자동 저장. PDF, 스프레드시트, 이미지 지원. 웹+모바일 |
| 03-20 | Codex for Students 프로그램 (UI 변경 아님) |
| 03-19 | Legacy deep research 모드 제거 예고 (UI 변경 아님) |

**UI 관련 시사점**:
- **Library 기능**: 사용자가 생성한 아티팩트(파일, 문서)를 자동 저장하고 재사용하는 패턴. KonaI-Agent의 아티팩트 패널/히스토리 설계에 직접적 참고 가능.
- **쇼핑 비교 UI**: side-by-side 비교 레이아웃은 스킬 비교, 모델 비교 UI에 적용 가능한 패턴.

---

### 2. Claude (Anthropic)
- **URL**: https://releasebot.io/updates/anthropic/claude
- **상태**: 확인 완료

| 날짜 | 변경 내용 |
|------|----------|
| 03-23 | **Computer Use** — Cowork 및 Claude Code에서 Pro/Max 사용자 대상 컴퓨터 조작 기능 추가. 파일 열기, 개발 도구 실행, 화면 내 포인트/클릭/탐색 가능. Dispatch 기능 개선 (부재 시 자율 작업) |

**UI 관련 시사점**:
- Computer Use의 "사용자 부재 시 자율 작업 + 결과 보고" 패턴은 KonaI-Agent의 비동기 에이전트 태스크 실행 및 결과 대시보드 설계에 참고할 모델.
- Cowork(협업 모드)에서의 에이전트 작업 상태 표시 방식 추가 조사 필요.

---

### 3. Cursor
- **URL**: https://cursor.com/changelog
- **상태**: 확인 완료

| 날짜 | 변경 내용 |
|------|----------|
| 03-25 | **Self-hosted Cloud Agent** — 코드와 도구 실행을 자체 네트워크 내에서 유지하는 셀프 호스팅 클라우드 에이전트. 비밀값/코드베이스가 내부 인프라에 유지됨 |
| 03-19 | **Composer 2** — Frontier 수준 코딩 성능. Standard/Fast 두 가지 요금 티어 ($0.50~$7.50/M tokens) |

**UI 관련 시사점**:
- **Self-hosted Agent**: 멀티 테넌트 SaaS에서 "에이전트 실행 환경 선택" UI 패턴 (클라우드 vs 셀프 호스팅). KonaI-Agent의 관리자 설정에서 에이전트 실행 정책 UI에 참고.
- **Composer 2의 이중 티어**: 모델/성능 선택 UI (Standard vs Fast)는 모델 선택 드롭다운 설계 참고.

---

### 4. Gemini (Google)
- **URL**: https://gemini.google/release-notes
- **상태**: 변경 없음
- **최근 항목**: 2026-02-19 (Gemini 3.1 Pro 발표)

---

### 5. Windsurf
- **URL**: https://windsurf.com/changelog
- **상태**: 변경 없음 (UI 관련)
- **비고**: 2026-03-19에 Mac x64 빌드 수정, 버그 수정만 존재. UI/UX 변경 없음.

---

### 6. Bolt.new
- **URL**: https://support.bolt.new/release-notes
- **상태**: 변경 없음
- **최근 항목**: 2026-02-23 ~ 03-13 기간 (AI 이미지 생성, MCP 서버 연결)

---

### 7. v0 by Vercel
- **URL**: https://v0.dev/changelog
- **상태**: 확인 완료

| 날짜 | 변경 내용 |
|------|----------|
| 03-20 | .riv 파일 업로드 지원, 디자인 모드 요소 선택 개선, git sync 워크플로우 개선 |
| 03-19 | Next.js 16.2.0 업데이트, auto-fix 비활성화 수정, 결제 모달/에러 메시지 개선 |

**UI 관련 시사점**:
- **디자인 모드 요소 선택 개선**: 비주얼 에디터 내 요소 선택 UX 관련. KonaI-Agent 라이브보드 위젯 편집 모드에 참고 가능.
- **Git sync 워크플로우**: 프로젝트-Git 연동 UI 패턴.

---

### 8. GitHub Copilot
- **URL**: https://releasebot.io/updates/github
- **상태**: 확인 완료

| 날짜 | 변경 내용 |
|------|----------|
| 03-25 | **@copilot PR 편집** — PR에서 @copilot 멘션으로 직접 코드 수정 요청. 클라우드 개발 환경에서 실행 |
| 03-25 | Copilot coding agent 저장소 접근 관리 REST API |
| 03-25 | CodeQL 증분 분석 개선 (UI 변경 아님) |
| 03-24 | Gemini 3.1 Pro 모델 JetBrains/Xcode/Eclipse 지원 확대 |
| 03-24 | Push protection 예외 설정 (저장소 설정) |
| 03-23 | Copilot CLI v1.0.11 — MCP 지원 개선, monorepo 탐색 |
| 03-20 | **사용량 메트릭 — Auto 모델 선택 시 실제 모델명 표시** |
| 03-20 | **Coding agent 커밋 → 세션 로그 추적 링크** |
| 03-20 | GitHub Mobile Android 내비게이션 개선 |

**UI 관련 시사점**:
- **@copilot PR 편집**: 자연어 멘션으로 에이전트 작업 트리거하는 UX 패턴. 채팅 외 컨텍스트에서 에이전트 호출하는 방식.
- **세션 로그 추적**: 에이전트 커밋에 세션 로그 영구 링크 첨부. KonaI-Agent의 에이전트 활동 감사 로그(audit log) UI에 직접 참고 가능한 패턴.
- **Auto 모델 → 실제 모델명 표시**: 모델 자동 선택 시 투명성 제공. 사용량 대시보드의 모델별 메트릭 표시에 참고.
- **API 기반 에이전트 접근 관리**: RBAC 기반 에이전트 권한 관리의 API-first 접근. 관리자 패널의 에이전트 권한 설정 UI 설계 참고.

---

## KonaI-Agent 적용 관련 핵심 인사이트

### 높은 관련성 (즉시 설계 반영 검토)

1. **아티팩트 Library 패턴** (ChatGPT) — 에이전트가 생성한 파일/문서의 자동 저장, 검색, 재사용 UI. 현재 아티팩트 패널의 "일회성 표시"를 넘어 영구 라이브러리로 진화하는 방향.

2. **에이전트 세션 로그 추적** (GitHub Copilot) — 에이전트 활동의 감사 추적(audit trail) UI. 커밋/액션마다 세션 로그 링크를 첨부하는 패턴. 관리자 감사 로그 뷰에 직접 적용 가능.

3. **Auto 모델 선택 투명성** (GitHub Copilot) — 자동 모델 선택 시 실제 사용된 모델을 사후 표시. 멀티 모델 지원 계획에서 사용량 메트릭 대시보드 설계에 반영.

### 중간 관련성 (추가 조사 후 반영)

4. **셀프 호스팅 에이전트 설정** (Cursor) — 클라우드 vs 온프레미스 에이전트 실행 환경 선택 UI. 멀티 테넌트 관리자 설정에 참고.

5. **비동기 자율 작업 + 결과 보고** (Claude Computer Use) — Dispatch 모드의 "부재 시 작업 후 보고" 패턴. 비동기 에이전트 태스크 대시보드 설계에 참고.

6. **에이전트 권한 관리 API** (GitHub Copilot) — 저장소별 에이전트 접근 제어. 15-role RBAC 체계의 에이전트 권한 관리 UI 설계에 참고.

---

## Sources
- [ChatGPT Updates](https://releasebot.io/updates/openai/chatgpt) — OpenAI ChatGPT 릴리즈 노트 추적
- [Claude Updates](https://releasebot.io/updates/anthropic/claude) — Anthropic Claude 릴리즈 노트 추적
- [Cursor Changelog](https://cursor.com/changelog) — Cursor 에디터 변경 로그
- [Gemini Release Notes](https://gemini.google/release-notes) — Google Gemini 릴리즈 노트
- [Windsurf Changelog](https://windsurf.com/changelog) — Windsurf 에디터 변경 로그
- [Bolt.new Release Notes](https://support.bolt.new/release-notes) — Bolt.new 릴리즈 노트
- [v0 Changelog](https://v0.dev/changelog) — Vercel v0 변경 로그
- [GitHub Updates](https://releasebot.io/updates/github) — GitHub/Copilot 릴리즈 노트 추적
