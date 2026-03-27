# AI 에이전트 스킬 발견 및 배포 패턴 통합 가이드

> 통합 문서: skill-marketplace-ux-analysis.md + team-skill-sharing-patterns.md 병합
> 통합 일자: 2026-03-25
> 목적: 스킬 발견(마켓플레이스 UX), 팀 내 공유(배포 채널), 조직 전체 배포의 전체 여정 아키텍처 제시

---

## 개요: 스킬 여정의 전 단계

스킬의 생명주기는 **개인 제작 → 팀 공유 → 조직 배포 → 공개 마켓플레이스**의 4단계를 거친다.
각 단계마다 다른 배포 채널, 권한 모델, 발견 메커니즘이 적용된다.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    스킬 배포 채널별 여정 (개인→팀→조직→공개)             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ 1️⃣ 개인 공간 (Personal)                                                 │
│    └─ 드래그앤드롭 업로드, 개인 폴더에 저장                              │
│    └─ 비공개, 초안/프로토타입 용도                                        │
│                                                                          │
│       ▼ "Publish to Team" 클릭                                           │
│                                                                          │
│ 2️⃣ 팀 스킬 공간 (Team Level)                                            │
│    └─ Git 커밋 (.claude/skills/) 또는 마켓플레이스 제출                   │
│    └─ 팀원만 접근 가능, 팀 관리자 승인                                   │
│    └─ 발견 방식: 팀 카탈로그 UI + 공유 폴더 브라우징                    │
│    └─ 관리: 복사(Linked) 또는 포크(Forked) 추적                          │
│                                                                          │
│       ▼ 팀 관리자 "기본 활성화" 또는 "조직 추천" 승인                     │
│                                                                          │
│ 3️⃣ 조직 레지스트리 (Org Level)                                          │
│    └─ 테넌트 전용 마켓플레이스에 수록                                   │
│    └─ 조직 내 전체 사용자 접근 가능                                     │
│    └─ 조직 관리자의 강제 활성화 또는 비활성화 가능                      │
│    └─ 발견 방식: 조직 전체 카탈로그 + AI 시맨틱 검색                   │
│                                                                          │
│       ▼ (선택) 공개 마켓플레이스에 제출 (GitHub, Anthropic Skills)       │
│                                                                          │
│ 4️⃣ 공개 마켓플레이스 (Public)                                           │
│    └─ SkillsMP, Anthropic Skills Directory, GitHub 큐레이션 등          │
│    └─ 누구나 발견/설치 가능                                              │
│    └─ 발견 방식: 전역 검색 + 카테고리 + 추천 알고리즘                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

    ↕️  원본 업데이트 시나리오 (양방향 동기화)

    [공개 마켓] → [조직 레지스트리] → [팀 공간] → [개인]
    (마스터)      (미러/프록시)      (Linked)     (설치 복사)

    • 공개 마켓에서 업데이트 → 조직 레지스트리 자동 동기화
    • 팀 관리자 검토 → "업데이트 수락" 배포
    • Linked 스킬은 자동 동기화, Forked는 독립 관리
```

---

## 1. 마켓플레이스 UX: 스킬 발견 (Search & Explore)

### 1.1 분석 대상 및 규모

#### AI 에이전트 스킬 전용 플랫폼

| 플랫폼 | 유형 | 규모 | 핵심 특징 |
|--------|------|------|----------|
| **Anthropic Skills Directory** | 공식 파트너 디렉토리 | 파트너 10여 개 + 빌트인 스킬 | claude.com/connectors에서 브라우즈, 원클릭 ZIP 업로드 |
| **SkillsMP.com** | 커뮤니티 애그리게이터 | 61,000+ 인덱싱 | GitHub 소스, 12개 카테고리, AI 시맨틱 검색 |
| **antigravity-awesome-skills** | GitHub 큐레이션 리포 | 1,000+ 스킬 | 번들/워크플로 기반 추천, npx 인스톨러, CATALOG.md |
| **Claude Code 플러그인** | CLI 내장 | 에코시스템 연동 | ~/.claude/skills/ 디렉토리 기반, 자동 활성화 |

#### 참조 마켓플레이스

| 플랫폼 | 규모 | 핵심 UX 패턴 |
|--------|------|-------------|
| **VS Code Marketplace** | 60,000+ 확장 | IDE 내장 사이드바 + 웹 마켓, 강력한 필터 시스템 |
| **Raycast Store** | 수천 개 | 미니멀 그리드, 카테고리 태그, 스크린샷 메타데이터 |
| **Zapier App Directory** | 8,000+ 앱 | 카테고리별 탐색, 트리거/액션 명시, 인기 워크플로 템플릿 |
| **ChatGPT GPT Store** | 300만+ GPT | 리더보드, 6개 카테고리, 에디터 추천, 컨텍스트 기반 자동 제안 |

### 1.2 카테고리 분류 체계 (12개 기본 분류)

**Anthropic Skills Directory**
- 분류 depth: 1단계 (플랫 구조)
- 접근 방식: 파트너사 브랜드 중심 (Notion, Figma, Atlassian, Canva, Zapier, Stripe, Vercel, Cloudflare)
- 카테고리 대신 MCP 커넥터와 연계된 "기능별 그룹"으로 동작
- 특징: 스킬 수가 적어 카테고리보다 "전체 리스트 스캔"이 효율적

**SkillsMP.com**
- 분류 depth: 1단계, 12개 카테고리
- 카테고리 예시: Development, Data & AI, DevOps, Web App Development, Content Creation 등
- 서브카테고리: 없음 (태그로 보완)
- 특징: AI 시맨틱 검색(`search --ai`)으로 카테고리 한계 보완

**VS Code Extension Marketplace**
- 분류 depth: 1단계, 11개 공식 카테고리
- 카테고리: Programming Languages, Snippets, Linters, Themes, Debuggers, Formatters, Keymaps, SCM Providers, Extension Packs, Language Packs, Other
- 태그 시스템: 무제한 자유 태그 (예: `node`, `python`, `git`)
- 필터 조합: `@category:` + `tag:` + `@sort:` 조합 가능

**Raycast Store**
- 분류 depth: 1단계, 15+ 카테고리
- 카테고리: Design Tools, Developer Tools, Productivity, Project Management, AI, Pomodoro Timer, Time Management, Transcript, Translation, Work From Home 등
- 특징: 카테고리가 "사용 시나리오" 중심으로 설계됨

**Zapier App Directory**
- 분류 depth: 1단계, 기능 카테고리 (CRM, Spreadsheet, Marketing Automation 등)
- 특징: 각 앱 프로필 페이지에 카테고리 태그 노출, 카테고리 클릭 시 관련 앱 리스트로 이동
- 검색: 앱 이름, 카테고리, 트리거/액션 타입으로 필터링

**ChatGPT GPT Store**
- 분류 depth: 1단계, 6개 카테고리
- 카테고리: DALL·E, Writing, Research, Programming, Education, Lifestyle
- 특징: 리더보드(인기/트렌딩) 중심, 에디터 픽 큐레이션

### 1.3 검색 필터 시스템

| 필터 항목 | Anthropic | SkillsMP | VS Code | Raycast | Zapier | GPT Store |
|-----------|-----------|----------|---------|---------|--------|-----------|
| 키워드 검색 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| AI 시맨틱 검색 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 카테고리 필터 | 제한적 | ✅ 12개 | ✅ 11개 | ✅ 15+개 | ✅ | ✅ 6개 |
| 인기순 정렬 | ❌ | ✅ (GitHub stars) | ✅ (설치 수) | ✅ | ✅ (인기도) | ✅ (트렌딩) |
| 평점순 정렬 | ❌ | ❌ | ✅ (1-5별점) | ❌ | ❌ | ❌ |
| 최신순 정렬 | ❌ | ✅ (업데이트 일자) | ✅ | ❌ | ❌ | ❌ |
| 호환성 필터 | ❌ | ✅ (Claude/Codex/ChatGPT) | ✅ (VS Code 버전) | ❌ | ❌ | ❌ |
| 태그 필터 | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| 제작자 필터 | 파트너사 | ✅ (GitHub author) | ✅ (publisher) | ✅ (author) | ❌ | ✅ (builder) |

### 1.4 추천 및 큐레이션 방식

| 방식 | 적용 플랫폼 | 설명 |
|------|------------|------|
| **에디터 추천 (Staff Picks)** | GPT Store, VS Code, Raycast | 플랫폼 운영팀이 수동 선별 |
| **인기 리더보드** | GPT Store, SkillsMP | 설치 수/사용량 기반 자동 순위 |
| **번들/역할 기반 추천** | antigravity-awesome-skills | "Web Dev → Web Wizard", "Security → Security Engineer" 등 역할별 스킬 세트 추천 |
| **워크플로 기반 추천** | Zapier, antigravity | "이 트리거를 쓰는 사람이 같이 쓴 액션" 형태 |
| **컨텍스트 자동 제안** | ChatGPT Apps, Claude Skills | 대화 맥락에서 관련 스킬/앱 자동 추천 |
| **추천 확장** | VS Code | 워크스페이스 기반 추천 (팀원이 많이 쓰는 것) |

### 1.5 스킬 카드 UI (3가지 패턴)

#### 패턴 A: 그리드(Grid) 방식

특징: 3~4열 그리드, 아이콘 강조, 짧은 텍스트
- 시각적 탐색에 유리
- 한눈에 많은 항목 노출
- 비개발자 친화적
- 예: Raycast Store, GPT Store, Zapier

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  ┌────┐      │ │  ┌────┐      │ │  ┌────┐      │
│  │icon│      │ │  │icon│      │ │  │icon│      │
│  └────┘      │ │  └────┘      │ │  └────┘      │
│  Skill Name  │ │  Skill Name  │ │  Skill Name  │
│  설명 텍스트 │ │  설명 텍스트 │ │  설명 텍스트 │
│  짧게 2줄... │ │  짧게 2줄... │ │  짧게 2줄... │
│              │ │              │ │              │
│  by Author   │ │  by Author   │ │  by Author   │
│  [카테고리]  │ │  [카테고리]  │ │  [카테고리]  │
└──────────────┘ └──────────────┘ └──────────────┘
```

#### 패턴 B: 리스트(List) 방식

특징: 1열 세로 리스트, 높은 정보 밀도
- 정보 밀도가 높음
- 빠른 스캔/비교 가능
- 개발자 친화적
- 예: VS Code 사이드바, SkillsMP

```
┌─────────────────────────────────────────────────────┐
│ ┌────┐  Skill Name                    ★★★★☆  ⬇1.2M │
│ │icon│  짧은 설명 텍스트 ...                        │
│ └────┘  Publisher  |  [Category]  |  Updated 3d   │
└─────────────────────────────────────────────────────┘
```

#### 패턴 C: 토글 리스트 (현재 우리 시스템)

특징: 단순 on/off 토글, 최소 정보
- 즉각적 활성화/비활성화
- 단순함
- 확장성 제한
- 발견이 어려움

```
┌─────────────────────────────────────────────────────┐
│  Skill Name                                [●━━ ON] │
│  설명 텍스트가 여기에 표시됩니다                   │
└─────────────────────────────────────────────────────┘
```

### 1.6 스킬 상세 페이지 구성

| 구성 요소 | Anthropic | SkillsMP | VS Code | Raycast | Zapier | GPT Store |
|-----------|-----------|----------|---------|---------|--------|-----------|
| 상세 설명 (README) | ✅ GitHub | ✅ GitHub | ✅ Marketplace | ✅ | ✅ | ✅ |
| 스크린샷/미리보기 | ❌ | ❌ | ✅ (최대 6장) | ✅ (최대 6장) | ❌ | ❌ |
| 데모/라이브 프리뷰 | ❌ | ❌ | 제한적 | ❌ | ✅ (Zap 템플릿) | ✅ (대화 시작) |
| 설치 방법 안내 | ✅ ZIP 업로드 | ✅ CLI 명령어 | 자동 | 자동 | 자동 | 자동 |
| 변경 로그 | GitHub 연동 | GitHub | ✅ 탭 | ❌ | ❌ | ❌ |
| 리뷰/평점 | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| 관련 스킬 추천 | ❌ | ❌ | ✅ | ❌ | ✅ (연관 워크플로) | ❌ |
| 의존성/요구사항 | MCP 커넥터 명시 | ❌ | ✅ | ✅ | ✅ (필요 앱) | ❌ |
| 소스코드 링크 | ✅ GitHub | ✅ GitHub | ✅ (옵션) | ✅ GitHub | ❌ | ❌ |
| 라이선스 정보 | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## 2. 배포 채널: 팀 내 공유 및 분배 패턴

### 2.1 Anthropic 공식 배포 경로 (3가지)

#### A. Git 기반 공유 (.claude/skills/ 커밋 → 팀원 pull)

프로젝트 리포지토리의 `.claude/skills/` 디렉터리에 SKILL.md와 리소스 파일을 커밋하면, 해당 리포를 클론한 팀원 전체가 자동으로 스킬을 사용할 수 있다. Claude Code가 작업 시 해당 폴더를 스캔하여 관련 스킬을 동적으로 로드한다.

| 항목 | 내용 |
|------|------|
| **장점** | 버전 관리 자동 적용, PR 리뷰를 통한 품질 관리, CI/CD 파이프라인과 연동 가능, 팀 전체 일괄 배포 |
| **단점** | Git 사용이 전제(비개발자 접근 어려움), 개인용 스킬과 팀 스킬 분리 어려움, 스킬 발견(discovery)이 불편 |
| **적합 대상** | 개발팀, Git 워크플로우에 익숙한 조직 |

엔터프라이즈 배포 사례로, Michelle Pellon은 "repo-first library" 모델을 제안하며, 스킬을 내부 SDLC에 통합해 CI 린터와 테스트를 적용하는 패턴을 소개했다. 이 접근은 거버넌스가 강하지만, 비개발자가 참여하기 어렵다는 한계가 있다.

#### B. 플러그인 마켓플레이스 (marketplace.json → /plugin install)

Anthropic은 공식 플러그인 디렉터리(claude.com/plugins)를 운영하며, 커뮤니티와 파트너가 제작한 플러그인을 등록·배포한다. 각 플러그인은 스킬, 에이전트, MCP 서버, 커맨드를 번들로 포함할 수 있다.

배포 구조:

```
my-marketplace/
├── marketplace.json          # 카탈로그 정의
└── plugins/
    └── quality-review/
        ├── .claude-plugin/
        │   └── plugin.json   # 메타데이터
        └── skills/
            └── quality-review/
                └── SKILL.md
```

사용자는 Claude Code에서 `/plugin marketplace add owner/repo`로 마켓플레이스를 등록한 뒤, `/plugin install plugin-name@marketplace-name`으로 개별 플러그인을 설치한다. Claude Cowork(웹)에서는 Marketplace 섹션에서 검색 → Install → Authorise 절차를 거친다.

| 항목 | 내용 |
|------|------|
| **장점** | 중앙화된 발견·설치 경험, 버전 추적과 자동 업데이트, 권한 리뷰 화면 제공, 팀용 프라이빗 마켓플레이스 생성 가능 |
| **단점** | 아직 조직 전체 관리자 푸시(admin push) 기능 미완성, 프라이빗 마켓플레이스 지원은 개발 중, CLI 기반이라 비개발자 설치 허들 존재 |
| **적합 대상** | 커뮤니티 배포, 파트너 에코시스템, 생명과학 등 도메인 특화 번들 |

Anthropic은 공식 마켓플레이스 외에도 생명과학(life-sciences) 같은 도메인별 마켓플레이스를 GitHub로 운영하는 사례를 보여주고 있다. 서드파티에서도 SkillsMP.com 같은 커뮤니티 어그리게이터가 등장했다.

#### C. 수동 공유 (파일 전달 → 개인 폴더 복사)

사용자가 SKILL.md가 포함된 폴더를 .zip으로 압축하여 전달하고, 수신자가 `~/.claude/skills/`에 복사하는 방식이다. Claude.ai에서는 Settings > Capabilities에서 커스텀 스킬을 업로드할 수 있다.

| 항목 | 내용 |
|------|------|
| **장점** | 가장 간단하고 즉각적, 도구 의존성 없음 |
| **단점** | 버전 추적 불가, 원본 업데이트 시 알림 없음, 스킬 증가 시 관리 불가, 보안 리뷰 부재 |
| **적합 대상** | 프로토타이핑, 1:1 공유, 임시 사용 |

### 2.2 현재 한계점 종합

Anthropic 공식 문서(2025년 10월 기준)에서도 "claude.ai는 아직 중앙화된 관리자 관리(admin management)나 조직 전체 커스텀 스킬 배포를 지원하지 않는다"고 명시하고 있다. 조직 전체 공유·프라이빗 마켓플레이스 지원은 로드맵에 있으나 아직 완성되지 않은 상태다.

핵심 갭:
- P2P 스킬 공유(같은 테넌트 내 팀원 간 직접 공유) 공식 미지원
- 비개발자를 위한 스킬 발견·설치 UI 미비
- 포크/복제 관계 추적, 원본 업데이트 알림 메커니즘 부재
- 스킬 사용량·효과 분석 대시보드 없음

### 2.3 유사 제품의 팀 내 공유 패턴 비교

#### Zapier: 공유 폴더 + 템플릿 + 에이전트 공유

Zapier의 팀 공유 모델은 세 가지 레이어로 구성된다.

**공유 폴더(Shared Folders):** Team/Enterprise 플랜에서 공유 폴더를 생성하면, 폴더 내 모든 Zap을 팀원이 보기·편집·복사할 수 있다. 폴더를 특정 사용자나 특정 팀에만 공유하는 범위 설정이 가능하다. 개인 앱 연결(예: 개인 Gmail)은 자동으로 보호되어, 복사 시 수신자가 자체 계정을 연결해야 한다.

**Zap 템플릿:** 작동 중인 Zap에서 "Share as template"을 선택하면 구조만 추출한 템플릿이 생성된다. 수신자는 템플릿 링크를 클릭하여 자기 계정에 복제한 후, 앱 연결과 설정을 직접 수행한다. 템플릿은 커뮤니티에 퍼블릭으로 제출할 수도 있다.

**에이전트 공유(2025년 가을 출시):** Zapier Agents에서 Viewer(모니터링·테스트), Editor(편집), Owner(전체 관리) 세 단계 권한으로 에이전트를 팀에 공유한다. 성공적인 에이전트를 퍼블릭 템플릿으로 제출하는 흐름도 제공한다.

| 단계 | Zapier 구현 |
|------|------------|
| 공유 | 에디터 내 Share 버튼, 공유 폴더 이동, 템플릿 링크 생성 |
| 발견 | 공유 폴더 브라우징, Copilot 검색, 커뮤니티 템플릿 갤러리 |
| 설치 | 1-클릭 복사 → 앱 연결 설정 위저드 |
| 피드백 | Task History 공유, JSON 내보내기 → AI 분석, 크로스팀 리뷰 문화 권장 |

우리에게 주는 시사점: 공유 폴더 기반의 범위 설정 모델이 직관적이다. "복사 시 개인 크리덴셜 자동 분리" 패턴은 스킬에도 적용 가능(예: 스킬 내 API 키 참조를 설치 시 개인화).

#### Make(Integromat): 팀 템플릿 + 퍼블릭 갤러리

Make는 시나리오 템플릿을 두 가지 유형으로 구분한다.

**퍼블릭 템플릿:** Make와 커뮤니티가 제작한 7,500개 이상의 시나리오 템플릿이 전체 사용자에게 공개된다.

**팀 템플릿:** 팀원이 제작한 템플릿으로, 해당 팀 내에서만 접근 가능하다. 퍼블릭 링크를 통해 팀 외부와 공유할 수도 있다.

Teams 플랜에서는 팀 역할(role), 공유 템플릿, 시나리오 권한 설정을 제공한다. 시나리오 자체의 소유권 이전은 팀 내에서 가능하지만, 세밀한 권한(보기만/실행만/편집)은 역할 기반으로 관리된다.

우리에게 주는 시사점: "팀 템플릿 vs 퍼블릭 템플릿" 이분법은 우리의 "테넌트 내부 vs 마켓플레이스 공개" 구분에 대응된다. 퍼블릭 링크로 팀 외부 공유하는 패턴도 유용하다.

#### Notion: 워크스페이스 + 팀스페이스 + 템플릿 복제

Notion은 계층적 공유 구조를 사용한다.

**워크스페이스:** 조직 전체가 공유하는 최상위 단위. 사이드바에서 General 팀스페이스에 전사 공유 페이지를 배치한다.

**팀스페이스:** 부서/팀별 공간. Open(전체 공개), Closed(초대만), Private(관리자 지정) 세 가지 접근 수준을 제공한다.

**템플릿 복제:** 페이지의 "Duplicate" 기능으로 구조를 복제한다. 수신자는 원본과 무관한 독립 복사본을 받는다. 데이터베이스 템플릿은 반복 생성 시 일관성을 보장한다.

| 단계 | Notion 구현 |
|------|------------|
| 공유 | Share 버튼으로 팀/개인에 권한 부여, 퍼블릭 링크로 외부 공유 |
| 발견 | 팀스페이스 내비게이션, 검색, "General" 팀스페이스의 공유 허브 |
| 설치 | Duplicate 클릭 → 자기 워크스페이스에 복사 |
| 피드백 | 페이지 코멘트, @멘션, 페이지 히스토리 |

우리에게 주는 시사점: 팀스페이스의 Open/Closed/Private 3단계 접근 수준은 스킬 공유 범위 설정에 직접 참고할 수 있다. "General" 공간에 큐레이션된 추천을 배치하는 패턴도 유용하다.

#### Figma: 라이브러리 퍼블리시 + 업데이트 알림 + 관리자 제어

Figma의 팀 라이브러리는 스킬 공유 UX의 가장 성숙한 레퍼런스다.

**3단계 공유 범위:**
1. 파일 수준: 컴포넌트를 라이브러리로 퍼블리시하면, 해당 파일에 접근 가능한 사람이 사용
2. 팀 수준: 팀 관리자가 라이브러리를 팀 기본 라이브러리로 활성화
3. 조직 수준: 조직 관리자가 전체 팀에 라이브러리를 기본 활성화

**업데이트 알림 메커니즘:** 라이브러리 원본이 업데이트되면, 해당 라이브러리를 사용하는 모든 파일에 파란색 뱃지가 나타난다. 사용자는 업데이트를 리뷰하고 Accept/Skip을 선택한다. 퍼블리시 시 변경 요약(description)을 작성하도록 프롬프트된다.

**권한 분리:** Edit 권한이 있는 사람만 라이브러리 원본을 수정하고 퍼블리시할 수 있다. View 권한자는 사용만 가능하다. 이로써 "소수의 제작자 + 다수의 소비자" 구조가 자연스럽게 구현된다.

**라이브러리 분석(Analytics):** Enterprise 플랜에서 컴포넌트·스타일·변수의 사용량을 추적하는 디자인 시스템 애널리틱스를 제공한다.

| 단계 | Figma 구현 |
|------|-----------|
| 공유 | Publish 버튼 → 범위 선택(팀/조직) → 변경 설명 작성 |
| 발견 | Assets 패널의 라이브러리 브라우저, 팀 관리자가 활성화한 기본 라이브러리 |
| 설치 | 라이브러리 토글 ON → 즉시 Assets 패널에 노출 (별도 설치 불필요) |
| 피드백 | 업데이트 알림 → Review → Accept/Skip, 라이브러리 애널리틱스 |

우리에게 주는 시사점: Figma 모델이 우리 시스템 요구에 가장 부합한다.
- "퍼블리시 → 팀 관리자 활성화 → 개인 토글"의 3단계가 "소수 제작자 + 다수 소비자"에 최적
- 업데이트 알림 + Accept/Skip이 포크 관계 없이 동기화 관리 가능
- 라이브러리 애널리틱스가 스킬 효과 측정에 대응

---

## 3. 통합: 스킬 배포 채널별 여정 (개인→팀→조직→공개)

### 3.1 전체 시스템 아키텍처

```
┌────────────────────────────────────────────────────────────────────────┐
│             종합: 스킬 배포 채널별 여정 (개인→팀→조직→공개)           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ ┌─ 1️⃣ 개인 공간 (Personal Workspace) ────────────────────────────┐   │
│ │                                                                 │   │
│ │ • 스킬 생성: .drag-and-drop 또는 web UI 업로드                 │   │
│ │ • 저장소: ~/.claude/skills/ (로컬) 또는 $TENANT/users/{id}/..  │   │
│ │ • 공개도: Private (비공개)                                      │   │
│ │ • 용도: 초안, 프로토타입, 개인 자동화                           │   │
│ │ • 발견: 자신의 스킬 목록에만 표시                              │   │
│ │                                                                 │   │
│ │ [Create Skill] → [Test Locally] → [Publish to Team?]          │   │
│ └──────────────────────────────────────┬──────────────────────────┘   │
│                                        │                               │
│                                        ▼                               │
│ ┌─ 2️⃣ 팀 스킬 공간 (Team Workspace) ───────────────────────────┐   │
│ │                                                              │   │
│ │ 배포 채널 A: Git 기반 (.claude/skills/ 커밋)               │   │
│ │ ├─ 장점: 버전 제어, PR 리뷰, CI/CD 통합                    │   │
│ │ ├─ 단점: 비개발자 접근 어려움, 발견 불편                   │   │
│ │ └─ 흐름: author commit → PR → merge → auto-pull            │   │
│ │                                                              │   │
│ │ 배포 채널 B: 마켓플레이스 제출 (web UI)                    │   │
│ │ ├─ 장점: 중앙화된 발견, 원클릭 설치                         │   │
│ │ ├─ 단점: 관리자 승인 대기 시간, 권한 리뷰 필요             │   │
│ │ └─ 흐름: author click "Publish" → change summary → submit  │   │
│ │                                                              │   │
│ │ 배포 채널 C: 공유 폴더 (Zapier 패턴)                       │   │
│ │ ├─ 장점: 간단한 범위 설정                                   │   │
│ │ ├─ 단점: 메타데이터 관리 제한                               │   │
│ │ └─ 흐름: author share → recipient copy/fork               │   │
│ │                                                              │   │
│ │ 공유 범위: 특정 팀 또는 팀 내 일부 사용자                   │   │
│ │ 권한 모델: View(사용만) / Edit(원본 수정+퍼블리시)           │   │
│ │ 발견 방식: 팀 카탈로그 UI + 검색 + 태그 필터               │   │
│ │ 동기화:   Linked(원본 자동 추적) vs Forked(독립)            │   │
│ │                                                              │   │
│ │ [Publish to Team] → [Select Team] → [Add Change Summary]   │   │
│ └──────────────────────────────┬───────────────────────────────┘   │
│                                │                                   │
│                                ▼                                   │
│ ┌─ 3️⃣ 조직 레지스트리 (Org Registry) ────────────────────────┐   │
│ │                                                              │   │
│ │ • 저장소: 테넌트 중앙 DB (/org/skills/{skill-id}/)          │   │
│ │ • 공개도: 조직 전체 공개                                     │   │
│ │ • 접근자: 테넌트 내 모든 사용자 (비개발자 포함)             │   │
│ │ • 발견 방식:                                                │   │
│ │   - 조직 스킬 카탈로그 (웹 UI)                              │   │
│ │   - 검색 + 카테고리/태그 필터                               │   │
│ │   - "추천" 섹션 (인기, 관리자 픽, AI 추천)                 │   │
│ │   - 컨텍스트 자동 제안                                      │   │
│ │                                                              │   │
│ │ • 관리 모델:                                                │   │
│ │   - 조직 관리자: 기본 활성화, 강제 비활성화, 통계           │   │
│ │   - 제작자: 버전 관리, 변경 로그, 폐기(deprecate)          │   │
│ │   - 소비자: 활성화/비활성화 토글, 업데이트 알림             │   │
│ │                                                              │   │
│ │ • 업데이트 흐름:                                            │   │
│ │   1. 제작자 Publish New Version                            │   │
│ │   2. "Update Available" 배지 + 인앱 알림                   │   │
│ │   3. 소비자 Review → Accept / Skip                         │   │
│ │   4. Linked 스킬 자동 동기화 또는 Forked 유지             │   │
│ │                                                              │   │
│ │ [Promote to Org] → [Admin Approval] → [Base Activate]      │   │
│ └──────────────────────────────┬───────────────────────────────┘   │
│                                │                                   │
│                                ▼                                   │
│ ┌─ 4️⃣ 공개 마켓플레이스 (Public Marketplace) ──────────────┐   │
│ │                                                         │   │
│ │ 플랫폼들:                                              │   │
│ │ • SkillsMP.com (커뮤니티 애그리게이터)                 │   │
│ │ • Anthropic Skills Directory (공식)                    │   │
│ │ • GitHub (Open Source 중심)                            │   │
│ │                                                         │   │
│ │ 배포 절차:                                             │   │
│ │ 1. 스킬 메타데이터 완성 (README, LICENSE, ...)        │   │
│ │ 2. GitHub repo 공개 또는 플랫폼 계정 등록             │   │
│ │ 3. 카탈로그에 인덱싱 (자동 또는 수동 심사)            │   │
│ │ 4. 누구나 발견 가능                                    │   │
│ │                                                         │   │
│ │ [Export to Public] → [GitHub Publish] → [Index]       │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└────────────────────────────────────────────────────────────────────────┘

    ↕️  양방향 동기화 및 피드백 루프

    [공개 마켓] ◄───┬─── [조직 레지스트리] ◄──┬── [팀 공간] ◄── [개인]
                    │                          │
                    │ 원본 업데이트 감지         │ Accept/Skip
                    │                          │
                    └──► 자동 동기화            └── 버전 관리

    • Linked(연결된) 스킬: 원본 업데이트를 자동으로 추적
    • Forked(복제된) 스킬: 독립적으로 관리, 필요시 upstream 머지
    • 모든 수준에서 버전 히스토리 유지
    • 사용량/만족도 메트릭 수집 및 피드백 루프
```

### 3.2 단계별 워크플로 (사용자 관점)

#### 제작자 플로우

```
1. 개인 공간에서 스킬 제작
   └─ web UI 또는 드래그앤드롭으로 SKILL.md 생성
   └─ 로컬 테스트 ("Try it")

2. 팀에 공유하기
   └─ [Publish to Team] 버튼 클릭
   └─ 팀 선택 (Team A / Team B / All Teams)
   └─ 변경 요약 입력 (필수: "What's new?")
   └─ [Publish] 확인

3. (선택) 조직 전체로 승격
   └─ 팀 관리자 또는 조직 관리자가 "Promote to Org" 승인
   └─ 조직 카탈로그에 수록
   └─ 모든 팀원이 발견 가능

4. (선택) 공개 마켓플레이스 제출
   └─ GitHub에 공개 repo 생성
   └─ SkillsMP / Anthropic Directory에 등록
```

#### 팀 관리자 플로우

```
1. 신규 팀 스킬 알림 수신
   └─ "New skill published: Excel Generator by John"

2. 리뷰
   └─ 스킬 상세 페이지 방문
   └─ 설명, 요구사항, 권한 범위 확인
   └─ (필요시) 제작자에게 질문/수정 요청

3. 팀 기본 활성화
   └─ [Make Team Default] 토글 ON
   └─ 팀원 전체에 즉시 노출 (기본 활성화)

4. 조직 추천 요청 (선택)
   └─ [Request Org Promotion] 클릭
   └─ 조직 관리자에게 승인 대기
```

#### 조직 관리자 플로우

```
1. 팀에서 올라온 스킬 승인 요청
   └─ Admin Dashboard > Pending Skills

2. 심사
   └─ 보안 검토 (코드 스캔)
   └─ 품질 검토 (문서, 버전, 의존성)
   └─ 규정 검토 (라이선스, 데이터 정책)

3. 조직 카탈로그 추가
   └─ [Approve & Publish to Org] 클릭
   └─ 모든 팀원 대상 기본 활성화 (선택 가능)

4. 통계 모니터링
   └─ Admin Dashboard > Skills Analytics
   └─ 설치 수, 활성 사용자, 호출 빈도, 성공률
```

#### 소비자 플로우

```
1. 스킬 발견
   └─ 조직 카탈로그 페이지 방문
   └─ 검색 또는 카테고리 브라우징
   └─ "추천 스킬" 섹션 확인

2. 활성화
   └─ 스킬 카드에서 [활성화] 또는 토글 ON
   └─ 즉시 사용 가능 (별도 설치 과정 없음)

3. 업데이트 알림
   └─ "Update Available" 배지 + 인앱 알림
   └─ [Review Update] 클릭
   └─ 변경 사항 확인 후 [Accept] 또는 [Skip]

4. 관리
   └─ "My Skills" 탭에서 활성화/비활성화 토글
   └─ 피드백 남기기 (별점, 코멘트)
   └─ (필요시) 제거 또는 포크
```

### 3.3 배포 채널 비교 매트릭스

| 속성 | Git (.claude/skills/) | 마켓플레이스 | 공유 폴더 | 공개 마켓 |
|------|--------|------|-------|---------|
| **접근성** | 개발자 | 모두 (웹 UI) | 모두 | 모두 |
| **설치 난이도** | 높음 (git pull) | 낮음 (클릭) | 중간 (복사) | 낮음 (클릭) |
| **버전 관리** | 자동 (git) | 자동 (시스템) | 수동 | 자동 |
| **권한 제어** | 파일 수준 | 스킬 수준 | 폴더 수준 | 공개 |
| **발견 용이성** | 낮음 | 높음 | 중간 | 높음 |
| **보안 리뷰** | 가능 (PR) | 가능 (승인) | 제한적 | 커뮤니티 기반 |
| **적합 대상** | 개발팀 | 조직 전체 | 팀/부서 | 커뮤니티 |

---

## 4. 공유 UX 핵심 설계 요소

### 4.1 공유할 때 (Publish)

| 설계 요소 | 권장 패턴 | 참고 제품 |
|-----------|----------|----------|
| **공유 범위** | 3단계: 전체 조직(테넌트) / 특정 팀 / 특정 인원. 기본값은 "특정 팀"으로 안전하게 시작 | Figma(파일→팀→조직), Notion(Private→Closed→Open) |
| **권한 모델** | 보기(사용만) / 수정(원본 편집+퍼블리시) / 복제(포크하여 독립 버전 생성) | Figma(View/Edit), Zapier(Viewer/Editor/Owner) |
| **퍼블리시 프로세스** | 1) 제작자가 "Publish" 클릭 → 2) 변경 요약 작성(필수) → 3) 범위 선택 → 4) 확인 | Figma 라이브러리 퍼블리시 |
| **크리덴셜 분리** | 스킬 내 API 키·환경변수 참조는 설치 시 개인화. 원본 제작자의 크리덴셜이 공유되면 안 됨 | Zapier(개인 앱 연결 자동 보호) |
| **메타데이터** | 스킬명, 설명, 태그, 작성자, 버전, 최소 호환 버전, 의존성(MCP 서버 등) | Anthropic plugin.json, npm package.json |

### 4.2 발견할 때 (Discover)

| 설계 요소 | 권장 패턴 | 참고 제품 |
|-----------|----------|----------|
| **팀 내부 디렉터리** | 테넌트 전용 스킬 카탈로그 페이지. 카테고리(업무 유형별) + 태그 필터 + 텍스트 검색 | Anthropic marketplace.json의 category/tags, Figma Assets 패널 |
| **큐레이션** | "최근 팀에서 인기", "이번 주 신규", "관리자 추천" 섹션. 사용량 기반 자동 랭킹 + 관리자 수동 핀 | Notion General 팀스페이스, Figma 기본 라이브러리 활성화 |
| **추천 트리거** | 사용자가 특정 작업을 요청할 때 "이 작업에 도움이 되는 팀 스킬이 있습니다" 알림 | Claude의 스킬 자동 로딩 방식 확장 |
| **미리보기** | 스킬 상세 페이지: 설명, 스크린샷/사용 예시, 제작자, 설치 수, 최근 업데이트일, 리뷰/별점 | Anthropic 플러그인 디렉토리, app store 패턴 |

### 4.3 설치 후 (Post-Install)

| 설계 요소 | 권장 패턴 | 참고 제품 |
|-----------|----------|----------|
| **원본 업데이트 알림** | 원본이 새 버전을 퍼블리시하면, 해당 스킬을 설치한 사용자에게 인앱 알림. Review → Accept/Skip 선택 | Figma 라이브러리 업데이트 알림 |
| **포크/복제 추적** | "사용 중(linked)" vs "포크됨(forked)" 상태 구분. Linked는 원본 업데이트를 받고, Forked는 독립 | Git fork 모델, Figma 인스턴스 vs 디태치 |
| **롤백** | 이전 버전으로 되돌리기 기능. 버전 히스토리 조회 | Git 버전 관리, Figma 버전 히스토리 |
| **사용량 분석** | 관리자/제작자용 대시보드: 설치 수, 활성 사용자 수, 호출 빈도, 성공/실패율 | Figma 디자인 시스템 애널리틱스 |
| **피드백 루프** | 스킬 상세 페이지에 별점/코멘트, 제작자에게 개선 요청(issue) | App store 리뷰, GitHub Issues |
| **비활성화/제거** | 개인이 토글 OFF로 비활성화 가능. 관리자가 팀/조직 수준에서 강제 비활성화 가능 | Figma 라이브러리 토글, Zapier Zap on/off |

---

## 5. 우리 시스템에 대한 설계 권장사항

### 5.1 컨텍스트 요약

- 멀티테넌트 SaaS, 테넌트 내 50–500명
- 스킬 제작자 소수(5–10명), 소비자 다수
- 비개발자도 스킬 소비(활성화/비활성화) 가능해야 함
- 현재: .zip/.skill 파일 드래그앤드롭 업로드

### 5.2 권장 아키텍처: "팀 스킬 라이브러리" 모델

Figma의 라이브러리 모델을 핵심 레퍼런스로 삼되, Zapier의 폴더 공유와 Make의 템플릿 이분법을 결합한다.

```
┌─────────────────────────────────────────┐
│      테넌트 스킬 레지스트리              │
│  (모든 퍼블리시된 스킬의 중앙 저장소)    │
├──────────────┬──────────────┬───────────┤
│  조직 전체    │   팀 A       │   팀 B    │
│  (관리자 승인) │  (팀 관리자)  │  (팀 관리자)
├──────────────┴──────────────┴───────────┤
│          개인 스킬 공간                  │
│  (비공개, 개인 실험·초안용)             │
└─────────────────────────────────────────┘
```

### 5.3 핵심 워크플로

**제작자 플로우:**
1. 개인 공간에서 스킬 제작·테스트 (기존 드래그앤드롭 유지)
2. "Publish to Team" 클릭 → 변경 요약 작성 → 대상 팀 선택
3. (선택) 팀 관리자 또는 조직 관리자에게 "조직 전체 공개" 요청

**팀 관리자 플로우:**
1. 팀 스킬 라이브러리에서 새 퍼블리시 알림 수신
2. 리뷰 후 "팀 기본 활성화" 토글 (팀원 전체에 자동 노출)
3. 조직 전체 추천 요청 시 조직 관리자에게 에스컬레이션

**소비자 플로우:**
1. 스킬 카탈로그에서 검색/브라우징 (비개발자 친화 UI)
2. "활성화" 토글 → 즉시 사용 가능 (설치 과정 없음)
3. 업데이트 알림 수신 → 리뷰 → Accept/Skip
4. "비활성화" 토글로 언제든 끄기

### 5.4 MVP에서 반드시 포함해야 할 요소

비교 분석을 종합하면, 비개발자 친화적인 스킬 공유 MVP의 필수 기능은 다음과 같다.

1. **테넌트 내 스킬 카탈로그 UI** — 웹 기반, 검색+카테고리+태그 필터. 비개발자도 스킬을 탐색하고 활성화할 수 있는 가장 기본적인 인터페이스.

2. **Publish 워크플로우** — 제작자가 "Publish" 버튼으로 팀에 공유. 변경 요약 필수 입력. Git이나 CLI 없이 웹 UI에서 완결.

3. **3단계 공유 범위** — 개인 / 팀 / 조직 전체. 기본값은 "팀" 수준.

4. **활성화/비활성화 토글** — 소비자가 원클릭으로 스킬을 켜고 끌 수 있는 인터페이스. 설치 과정을 제거하고 토글로 단순화.

5. **업데이트 알림** — 원본 스킬이 새 버전을 퍼블리시하면 인앱 알림. Accept/Skip 선택.

### 5.5 Phase 2에서 추가할 요소

6. **관리자 대시보드** — 팀/조직 수준 스킬 관리, 기본 활성화 설정, 강제 비활성화
7. **사용량 애널리틱스** — 설치 수, 활성 사용자, 호출 빈도, 성공률
8. **포크 관계 추적** — Linked vs Forked 상태 관리, Linked는 원본 동기화, Forked는 독립
9. **피드백/리뷰** — 별점, 코멘트, 개선 요청
10. **큐레이션 엔진** — "팀에서 인기", "관리자 추천", AI 기반 컨텍스트 추천

### 5.6 권장 카테고리 분류 체계 (한국 기업 맥락)

우리 사용자(한국 기업 도메인 전문가, 비개발자 포함)를 고려하면 "기술 도메인" 보다 "업무 시나리오" 중심 카테고리가 적합하다. Raycast의 시나리오 중심 접근법을 참고한다.

| 카테고리 | 설명 | 예시 스킬 |
|---------|------|----------|
| 📄 문서 작성 | 보고서, 기획서, 제안서 등 문서 생성 | Excel, PPT, Word, PDF 생성 |
| 📊 데이터 분석 | 데이터 정리, 시각화, 인사이트 도출 | 차트 생성, CSV 분석, 대시보드 |
| 🔗 외부 도구 연동 | 기존 업무 도구와의 연결 | Notion, Jira, Slack, Google Drive |
| 🎨 콘텐츠 제작 | 마케팅, 디자인, 미디어 콘텐츠 | Figma 연동, 이미지 생성, 번역 |
| ⚙️ 업무 자동화 | 반복 작업 자동화, 워크플로 | 이메일 자동화, 스케줄링, 양식 처리 |
| 🏢 도메인 전문 | 산업별 특화 스킬 | 법률 문서, 재무 분석, HR 프로세스 |

---

## 6. 참고 자료 및 출처

### 마켓플레이스 UX 및 발견 패턴

- Anthropic, "Equipping agents for the real world with Agent Skills" (2025-10-16)
- Anthropic, "Introducing Agent Skills" / claude.com/blog/skills (2026-01-06 업데이트)
- Anthropic, "Create and distribute a plugin marketplace" — code.claude.com/docs
- Anthropic, "Plugins for Claude Code and Cowork" — claude.com/plugins
- Claude.com Skills Directory: https://claude.com/connectors
- SkillsMP.com: https://skillsmp.com
- antigravity-awesome-skills: https://github.com/sickn33/antigravity-awesome-skills
- VoltAgent awesome-agent-skills: https://github.com/VoltAgent/awesome-agent-skills
- VS Code Extension Marketplace: https://marketplace.visualstudio.com/vscode
- VS Code Extension Documentation: https://code.visualstudio.com/docs/configure/extensions/extension-marketplace
- Raycast Store: https://raycast.com/store
- Zapier App Directory: https://zapier.com/apps
- ChatGPT GPT Store: https://chatgpt.com/gpts
- OpenAI, "Introducing the GPT Store" (openai.com/index/introducing-the-gpt-store)

### 팀 내 공유 및 배포 패턴

- Michelle Pellon, "Claude Skills in the Enterprise: A Practical Playbook" (2025-10-20)
- Anthropic, "Agent Skills as an Open Standard" (2025-12-XX)
- Zapier, "Collaborate with members of your Team or Enterprise account"
- Zapier, "Best practices for sharing, collaborating on, and maintaining workflows"
- Zapier, "Zapier Agents" (2025 가을 출시 예정)
- Make (Integromat), "Scenario templates" — make.com/en/help
- Make, "Team roles and permissions" — make.com/en/help
- Notion, "How to set up your Notion workspace for your team"
- Notion, "Sharing & permissions" — notion.so/help
- Figma, "Share libraries in an organization" — help.figma.com
- Figma, "Publish a library" — help.figma.com
- Figma, "Components, styles, and shared library best practices"
- Figma, "Manage shared libraries" — help.figma.com/en/articles/4403772
- Anthropic Skills GitHub Repository: https://github.com/anthropics/skills
- Agent Skills Standard: https://agentskills.io
