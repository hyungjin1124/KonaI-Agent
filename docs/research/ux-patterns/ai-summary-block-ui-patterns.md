# AI 요약 블록 UI 패턴 리서치

> 스킬 버전 이력을 AI가 정리·요약해주는 기능 설계를 위한 유사 서비스 UI 사례 조사

---

## 1. 리서치 목적

"변경 이력 타임라인 속에 AI 요약이 어떻게 끼워지는가"를 중심으로, 다양한 서비스에서 AI 요약 블록을 보여주는 UI 패턴을 조사하고 설계 시사점을 도출한다.

---

## 2. AI 요약 블록 배치 패턴 분류

조사한 사례들은 AI 요약 블록이 화면에 배치되는 방식에 따라 크게 **5가지 패턴**으로 분류된다.

| 패턴 | 배치 위치 | 트리거 | 대표 사례 |
|------|----------|--------|----------|
| A. diff 위 인라인 블록 | 변경 이력 타임라인 내부 | 변경 감지 시 자동 | Distill.io |
| B. 에디터 인라인 삽입 | 텍스트 에디터 설명란 | 버튼 클릭(수동) | GitHub Copilot, GitLab Duo |
| C. 타임라인 봇 코멘트 | PR 대화 타임라인 | 이벤트 기반 자동 | gpt-commit-summarizer |
| D. 콘텐츠 위 접을 수 있는 패널 | 스레드/채널 메시지 위 | 버튼 클릭(수동) | Slack AI 스레드 요약 |
| E. 콘텐츠 하단 자동 요약 | 파일 첨부 아래 | 파일 공유 시 자동 | Slack AI 파일 요약 |

---

## 3. 사례별 상세 분석

### 3-1. Distill.io — diff 위 파란색 요약 블록

**서비스 개요**: 웹 페이지 변경을 모니터링하는 도구. 변경 이력(change history) 내에 AI 요약 블록이 삽입된다.

**화면 구조**:

```
┌─────────────────────────────────────────────┐
│  Change History                              │
│                                              │
│  ┌─ AI change summary ────────────────────┐  │
│  │ (파란 배경 + 좌측 파란 보더)             │  │
│  │                                        │  │
│  │ Application deadline extended from      │  │
│  │ March 31 to April 30. New eligibility   │  │
│  │ criteria added for international        │  │
│  │ applicants.                             │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Mar 24, 2026 14:30       [Explore diff →]   │
│  + April 30, 2026  ←  - March 31, 2026       │
│  + International applicants with valid...     │
│                                              │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│                                              │
│  ┌─ AI change summary ────────────────────┐  │
│  │ Contact email updated. No substantive   │  │
│  │ policy changes.                         │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Mar 22, 2026 09:15       [Explore diff →]   │
└─────────────────────────────────────────────┘
```

**UI 특징**:

- 블록 위치: 각 diff 항목 바로 위, 타임라인에 인라인으로 삽입
- 시각 구분: 파란 배경(#E6F1FB) + 좌측 3px 파란 보더(#378ADD)로 AI 콘텐츠 구별
- 커스터마이징: 프롬프트를 수정하여 "무엇을 요약하고, 무엇을 무시할지" 설정 가능 (예: 날짜 변경은 요약하되 레이아웃 변경은 무시)
- 연결: "Explore diff" 링크로 상세 diff 뷰(side-by-side 또는 inline 비교)로 이동
- 커스텀 필드: 사용자가 `change_summary` 외에 `important`(boolean), `price`(number) 등 커스텀 필드를 추가하고 각각에 프롬프트 설정 가능

**설계 시사점**:

- 요약과 원본 diff가 한 화면에 있어 맥락 전환 없이 상세 내용 확인 가능
- 프롬프트 기반 커스터마이징으로 도메인별 맞춤 요약 가능
- 변경이 200자 미만이면 요약을 생성하지 않는 임계값 설정

---

### 3-2. GitHub Copilot — PR description 인라인 삽입

**서비스 개요**: PR 생성 시 설명란 에디터에서 Copilot 아이콘을 클릭하면 코드 diff를 분석하여 마크다운 텍스트가 삽입된다.

**화면 구조**:

```
┌─────────────────────────────────────────────┐
│  Create Pull Request                         │
│                                              │
│  Title: [Refactor auth module for OAuth 2.0] │
│                                              │
│  Description:                                │
│  ┌──────────────────────────── [Copilot ✨]─┐│
│  │                                          ││
│  │  ## Summary                              ││
│  │  This PR refactors the authentication    ││
│  │  module to support OAuth 2.0 token       ││
│  │  refresh with exponential backoff...     ││
│  │                                          ││
│  │  ## Changes                              ││
│  │  - Added TokenManager class (src/auth.ts)││
│  │  - Updated session handling (lib/session)││
│  │  - Fixed token expiry logic (lib/utils)  ││
│  │                                          ││
│  └──────────────────────────────────────────┘│
│                                              │
│  How did Copilot perform?  [👍] [👎]         │
│                                              │
│  [Create pull request]                       │
└─────────────────────────────────────────────┘
```

**UI 특징**:

- 트리거: 에디터 툴바의 Copilot 아이콘(sparkle) 클릭 → "Summary" 선택
- 출력 형식: 산문체 개요 1단락 + 파일명 링크가 포함된 변경 불릿 리스트
- 표시 위치: PR description 텍스트 필드 내부 (마크다운)
- 편집: 생성된 텍스트를 자유롭게 편집 후 제출
- 피드백: 생성 직후 thumbs up/down 버튼으로 품질 피드백 수집
- 제한사항: 30개 이상 파일의 대규모 PR은 처리 시간이 길고 일부 파일 누락 가능

**설계 시사점**:

- "AI가 초안을 쓰고, 사람이 편집"하는 협업 모델
- 파일 링크가 포함되어 관련 코드로 즉시 이동 가능
- 영어만 지원 (다국어 지원 시 참고)

---

### 3-3. GitLab Duo — MR 설명란 + 리뷰 요약 코멘트

**서비스 개요**: GitHub Copilot과 유사하지만, "변경 사항 요약"과 "리뷰 의견 요약"을 분리한 두 가지 진입점을 제공한다.

**화면 구조**:

```
┌── 진입점 1: MR 생성 시 ───────────────────┐
│                                            │
│  Description 에디터                        │
│  ┌────────────────────── [Summarize ✨]──┐ │
│  │  (AI가 코드 변경 요약을 삽입)          │ │
│  │  source→target 브랜치 diff 기반        │ │
│  └───────────────────────────────────────┘ │
└────────────────────────────────────────────┘

┌── 진입점 2: 리뷰 완료 시 ─────────────────┐
│                                            │
│  Finish Review 패널                        │
│  ┌──────────────────────────────────────┐  │
│  │  [Add Summary]                       │  │
│  │                                      │  │
│  │  내가 남긴 리뷰 코멘트들을 종합 요약  │  │
│  │  → 코멘트 박스에 삽입                 │  │
│  │  → 편집 후 제출                       │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

**UI 특징**:

- 2개의 분리된 진입점: MR 생성 시 "Summarize code changes" / 리뷰 완료 시 "Add Summary"
- MR 요약: source→target 브랜치 diff를 분석하여 설명란에 삽입
- 리뷰 요약: 리뷰어가 남긴 코멘트들을 종합하여 코멘트 박스에 삽입
- 편집: 두 경우 모두 삽입된 텍스트를 편집 후 제출 가능
- 커밋 메시지 생성: 머지 시 AI 생성 커밋 메시지도 별도 제공

**설계 시사점**:

- "변경 사항 요약"과 "리뷰 의견 요약"의 분리는 다른 맥락의 요약 필요를 잘 반영
- 스킬 버전에서도 "버전 변경 요약"과 "버전에 대한 피드백 요약"을 분리할 수 있음

---

### 3-4. gpt-commit-summarizer — 자동 코멘트 계층 요약

**서비스 개요**: GitHub Action으로, PR이 열리면 봇이 자동으로 3단계 계층 코멘트를 남긴다.

**화면 구조**:

```
┌─────────────────────────────────────────────┐
│  PR Conversation Timeline                    │
│                                              │
│  ┌─ 🤖 bot ──── [auto] ──────────────────┐  │
│  │  PR Summary                            │  │
│  │  This PR refactors the auth module     │  │
│  │  to support OAuth 2.0. Key changes     │  │
│  │  include token refresh logic and       │  │
│  │  session management across 4 files.    │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌─ 🤖 bot ──── [file-level] ────────────┐  │
│  │  File: src/auth.ts                     │  │
│  │  Added OAuth token refresh with        │  │
│  │  exponential backoff. New TokenManager  │  │
│  │  class handles lifecycle.              │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌─ 🤖 bot ──── [commit] ────────────────┐  │
│  │  Commit: a3f29bc                       │  │
│  │  Introduces retry mechanism for failed │  │
│  │  token requests with max 3 attempts.   │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌─ 👤 @reviewer ────────────────────────┐  │
│  │  Looks good! Minor suggestion on...    │  │
│  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**UI 특징**:

- 트리거: PR open/synchronize 이벤트 시 자동 (수동 조작 불필요)
- 출력 형식: 3단계 계층 — 전체 PR 요약 → 파일별 요약 → 커밋별 요약
- 표시 위치: PR conversation 타임라인에 봇 코멘트로 삽입
- 시각 구분: 봇 아바타 + "auto" / "file-level" / "commit" 태그로 레벨 구분
- 업데이트: PR이 업데이트되면 이전 코멘트 삭제 후 새로 생성

**설계 시사점**:

- 전체 → 파일 → 커밋의 3단계 계층은 "전체 버전 요약 → 섹션별 변경 → 개별 수정" 구조로 응용 가능
- 사람 코멘트와 같은 타임라인에 위치하여 자연스러운 워크플로우 통합
- 자동 트리거로 사용자 액션 불필요

---

### 3-5. Slack AI — 채널 Recap 요약 카드

**서비스 개요**: 사이드바의 "Recap" 섹션에 채널별 AI 요약 카드가 매일 자동 생성된다.

**화면 구조**:

```
┌─ Sidebar ──────────┐  ┌─ Recap ────────────────────────┐
│                     │  │                                │
│  🏠 Home            │  │  📋 Recap  Today, 9:00 AM      │
│  💬 DMs             │  │                                │
│  📋 Recap ←── 선택  │  │  # product-launches            │
│  ─────────────      │  │  The team finalized the v3.2   │
│  # general          │  │  release date for April 15.    │
│  # engineering      │  │  QA flagged 2 blocking issues. │
│  # product-launches │  │  [3 messages from @sarah, ...]  │
│                     │  │                                │
│                     │  │  # engineering                 │
│                     │  │  Database migration completed.  │
│                     │  │  Caching reduced response time  │
│                     │  │  by 40%.                       │
│                     │  │  [8 messages from @alex, ...]   │
│                     │  │                                │
│                     │  │  ⚙️ Manage channels            │
└─────────────────────┘  └────────────────────────────────┘
```

**UI 특징**:

- 블록 위치: 사이드바 전용 "Recap" 섹션 (독립 영역)
- 트리거: 매일 자동 생성 (사용자 설정 시간)
- 출처 표시: 메시지 수 + 작성자 이름으로 citation, 클릭 시 원본 메시지로 딥링크
- 채널 관리: 사용자가 어떤 채널을 Recap에 포함할지 선택 가능
- Mute 연동: Recap에 포함된 채널을 mute하여 사이드바 정리 가능

**설계 시사점**:

- "모니터링 대상을 사용자가 선택"하는 패턴은 스킬 버전 이력에서도 "관심 스킬 설정"으로 응용 가능
- citation 링크로 "요약 → 원본"으로의 이동이 매끄러움
- 자동 스케줄 + 수동 조회 병행

---

### 3-6. Slack AI — 스레드 요약 (인라인 패널)

**서비스 개요**: 긴 스레드 상단에 "Summarize" 버튼을 클릭하면 접을 수 있는 요약 패널이 나타난다.

**화면 구조**:

```
┌─────────────────────────────────────────────┐
│  Thread — 23 replies            [Summarize]  │
│                                              │
│  ┌─ Thread summary ────────── [dismiss] ──┐  │
│  │  (코럴/오렌지 배경 + 좌측 보더)         │  │
│  │                                        │  │
│  │  The team debated two approaches for   │  │
│  │  caching. Consensus on Redis with      │  │
│  │  15-min TTL. @alex will create PR      │  │
│  │  by Thursday.                          │  │
│  │                                        │  │
│  │  [View sources (5)]                    │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│                                              │
│  👤 @alex: I think we should use Redis...    │
│  👤 @sarah: What about Memcached instead?    │
│  ... 21 more replies                         │
└─────────────────────────────────────────────┘
```

**UI 특징**:

- 트리거: 스레드 상단 "Summarize" 버튼 클릭
- 블록 위치: 스레드 메시지 목록 위 (접을 수 있는 패널)
- 시각 구분: 색상 배경 + 좌측 보더 + "Thread summary" 레이블
- 출처 표시: "View sources (N)" 링크로 참조 메시지 확인
- 상호작용: dismiss 가능, 원할 때 재생성
- 범위: 항상 전체 스레드를 요약 (부분 선택 불가)

**설계 시사점**:

- "접을 수 있는 요약 패널"은 필요할 때만 보고, 불필요할 때 숨길 수 있어 비침습적
- dismiss 후 재생성 가능한 패턴은 AI 요약의 불확실성을 고려한 설계
- 원본 콘텐츠 바로 위에 위치하여 맥락 전환 최소화

---

### 3-7. Slack AI — 파일 자동 요약 (메시지 하단)

**서비스 개요**: PDF, DOCX, PPTX, XLSX 파일이 공유되면 메시지 아래에 자동으로 요약이 표시된다.

**화면 구조**:

```
┌─────────────────────────────────────────────┐
│  👤 @jen: Here's the updated report          │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │  📄 Q1-2026-Report.pdf    2.4 MB     │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ✨ Summarized by AI                         │
│  ┌──────────────────────────────────────┐    │
│  │  Revenue increased 12% QoQ to $4.2M. │    │
│  │  Customer churn decreased to 3.1%.    │    │
│  │  Key risk: supply chain delays in Q2. │    │
│  │                                       │    │
│  │  [View full summary →]                │    │
│  └──────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

**UI 특징**:

- 트리거: 파일 공유 시 자동 생성 (수동 조작 불필요)
- 블록 위치: 파일 첨부 바로 아래 (메시지 내 인라인)
- 시각 구분: AI 아이콘 + "Summarized by AI" 레이블
- 설정: 사용자별 on/off 토글 가능 (끄면 자기 파일에도 타인 파일에도 요약 미표시)
- 확장: "View full summary"로 더 상세한 요약 확인
- 번역: 기본 번역 언어로 자동 번역 가능

**설계 시사점**:

- 자동 생성이지만 사용자가 끌 수 있는 "옵트아웃" 방식
- 파일 바로 아래라 맥락이 즉시 연결됨
- "View full summary"로 짧은 미리보기 → 상세 요약의 점진적 노출

---

### 3-8. Notion AI — 채팅 사이드바 버전 이력 질의

**서비스 개요**: 전용 UI 없이 AI Agent 사이드바에서 자연어로 질문하면, 버전 히스토리를 검색하여 "누가, 언제, 무엇을, 왜" 변경했는지 답변한다.

**화면 구조**:

```
┌─ Document ──────────────┐  ┌─ AI Agent ──────────────┐
│                          │  │                         │
│  (문서 본문)              │  │  🧑 이 섹션이 왜        │
│  .......................  │  │     바뀌었나요?          │
│  .......................  │  │                         │
│  .......................  │  │  🤖 source: version     │
│  .......................  │  │     history              │
│  .......................  │  │                         │
│                          │  │  3월 15일 @김민수님이    │
│                          │  │  환불 기간을 30일→14일   │
│                          │  │  로 수정. 관련 코멘트:   │
│                          │  │  "CS팀 요청에 따라 조정" │
│                          │  │                         │
│                          │  │  ┌───────────────────┐  │
│                          │  │  │  Ask a question... │  │
│                          │  │  └───────────────────┘  │
└──────────────────────────┘  └─────────────────────────┘
```

**UI 특징**:

- 트리거: 사이드바에서 자연어 질문 입력
- 출력 형식: 대화형 답변 (출처: "version history" 명시)
- 표시 위치: 페이지 옆 AI 사이드바 채팅
- 차별점: 정해진 형식이 아닌, 질문에 따라 유연한 답변
- 컨텍스트: 현재 열린 페이지를 자동으로 참조, 블록 선택 시 해당 부분 집중 분석

**설계 시사점**:

- 고정 형식 요약이 아닌 "질문에 따른 유연한 탐색"
- "왜 변경되었는지"까지 코멘트를 참조하여 답변
- 스킬 버전 이력에서 "v2.0과 v3.0 사이에 무엇이 바뀌었나요?" 같은 자유 질의 지원에 참고

---

## 4. 공통 설계 원칙

여러 서비스의 AI 요약 블록 UI를 분석한 결과, 다음 5가지 설계 원칙이 공통적으로 발견된다.

### 4-1. 출처 인라인 참조 (Citation)

- 요약 내에 클릭 가능한 citation을 달아 원본으로 바로 이동할 수 있게 한다.
- 참고: Slack의 "View sources (N)", Distill의 "Explore diff →", GitHub의 파일 링크

### 4-2. AI 생성 콘텐츠 시각 구별

- 색상 배경, AI 아이콘, 레이블 등으로 사람 작성 콘텐츠와 명확히 구분한다.
- 참고: Distill의 파란 배경 블록, Slack의 "Summarized by AI" 레이블, gpt-commit-summarizer의 봇 아바타

### 4-3. dismiss / 재생성 컨트롤

- 요약이 방해되면 접거나 숨기고, 필요 시 다시 생성할 수 있다.
- 참고: Slack 스레드 요약의 dismiss 버튼, Slack 파일 요약의 개인 on/off 토글

### 4-4. 상세 탐색으로의 연결

- "Explore diff", "View sources", "View full summary" 등으로 원본 데이터 접근 경로를 항상 제공한다.
- 요약은 진입점일 뿐, 원본 확인이 언제든 가능해야 한다.

### 4-5. 요약 커스터마이징

- 프롬프트 설정이나 토글로 무엇을 요약할지 사용자가 제어할 수 있다.
- 참고: Distill의 프롬프트 기반 요약/제외 기준 설정, Slack Recap의 채널 선택

---

## 5. 스킬 버전 이력 요약 기능 설계 권장사항

위 리서치를 바탕으로, 스킬 버전 이력 AI 요약 기능 설계 시 다음을 권장한다.

### 핵심 UI 패턴: diff 위 인라인 블록 (Distill 패턴) + 자유 질의 (Notion 패턴) 조합

**기본 화면 — 버전 이력 타임라인 내 요약 블록**:

```
┌─────────────────────────────────────────────┐
│  Version History                    [AI ✨]  │
│                                              │
│  v3.0 → v3.1  (2026-03-24, @김민수)          │
│  ┌─ AI summary ──────────────────────────┐   │
│  │  프롬프트 템플릿 3개 수정.             │   │
│  │  에러 핸들링 로직 추가.                │   │
│  │  출력 형식을 JSON→마크다운으로 변경.    │   │
│  │                                       │   │
│  │  [View diff →]  [Regenerate]          │   │
│  └───────────────────────────────────────┘   │
│                                              │
│  v2.0 → v3.0  (2026-03-20, @이지은)          │
│  ┌─ AI summary ──────────────────────────┐   │
│  │  Major: 스킬 설명 전면 개편.           │   │
│  │  신규 SKILL.md 구조 도입.              │   │
│  │  의존성 3개 추가 (pandas, numpy, ...). │   │
│  │                                       │   │
│  │  [View diff →]  [Regenerate]          │   │
│  └───────────────────────────────────────┘   │
│                                              │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│  💬 "v2.0에서 뭐가 바뀌었나요?"   [Ask AI]   │
└─────────────────────────────────────────────┘
```

**설계 체크리스트**:

- [ ] 각 버전 변경 항목 위에 AI 요약 블록 인라인 배치
- [ ] AI 콘텐츠는 색상 배경 + 좌측 보더 + 레이블로 시각 구분
- [ ] 요약 내 변경 유형 태그 (New / Improved / Fixed / Breaking)
- [ ] "View diff" 링크로 상세 변경 내용 확인 가능
- [ ] "Regenerate" 버튼으로 재생성 가능
- [ ] dismiss / 접기 기능으로 비침습적 UX
- [ ] 하단에 자연어 질의 입력란으로 심화 탐색 지원
- [ ] 새 버전 저장 시 자동 생성 (옵트아웃 가능)

---

## 6. 참고 서비스 및 리소스

| 서비스 | 링크 | 참고 포인트 |
|--------|------|------------|
| Distill.io | https://distill.io/docs/web-monitor/ai-change-summary/ | diff 위 인라인 AI 요약 블록 |
| GitHub Copilot PR Summary | https://docs.github.com/en/copilot/responsible-use/pull-request-summaries | 에디터 인라인 삽입 패턴 |
| GitLab Duo MR Summary | https://docs.gitlab.com/user/project/merge_requests/duo_in_merge_requests/ | 변경 요약 + 리뷰 요약 분리 |
| gpt-commit-summarizer | https://github.com/KanHarI/gpt-commit-summarizer | 3단계 계층 자동 코멘트 |
| Slack AI | https://slack.com/help/articles/25076892548883-Guide-to-AI-features-in-Slack | Recap / 스레드 요약 / 파일 요약 |
| Notion AI Agent | https://www.notion.com/help/notion-agent | 버전 이력 기반 자연어 질의 |
| ShapeofAI Patterns | https://www.shapeof.ai/patterns/summary | AI 요약 UX 패턴 라이브러리 |
| Smashing Magazine | https://www.smashingmagazine.com/2025/07/design-patterns-ai-interfaces/ | AI 인터페이스 설계 패턴 |
| AI UX Patterns | https://www.aiuxpatterns.com/ | AI UX 패턴 가이드 |

---

*작성일: 2026-03-24*
