# Agent Skills 오픈 표준(SKILL.md 기반) 에이전트 서비스 스킬 관리 패턴 심층 분석

> 조사 기준일: 2026년 3월 23일
> 범위: Agent Skills 표준 채택 서비스 16+ 및 자체 스킬 체계 서비스 4종

---

# Part A: Agent Skills 표준 채택 서비스

## A-1. Anthropic (Claude Code / Claude.ai / API)

### 조사 항목 1: SKILL.md 파일 구조

Anthropic은 Agent Skills 표준의 창시자이자 agentskills.io 스펙의 관리자이다. 공식 스펙에 따르면 SKILL.md는 YAML 프론트매터와 Markdown 본문으로 구성된다. 필수 필드는 `name`(최대 64자, 소문자+하이픈)과 `description`(최대 1024자)이며, 선택 필드로 `license`, `compatibility`(최대 500자, 환경 요구사항), `metadata`(임의 키-값 맵), `allowed-tools`(실험적, 사전 승인 도구 목록)가 있다. 디렉토리 구조는 `SKILL.md`(필수) + `scripts/`(실행 코드) + `references/`(추가 문서) + `assets/`(템플릿, 리소스)로 구성된다.

### 조사 항목 2: 스킬 탐색 경로

Claude Code는 두 레벨에서 스킬을 자동 탐색한다. 프로젝트 레벨은 `.claude/skills/` 디렉토리이고, 사용자(글로벌) 레벨은 `~/.claude/skills/`이다. Claude.ai에서는 프리빌트 스킬이 `/mnt/skills/public/`, `/mnt/skills/private/`, `/mnt/skills/examples/`, `/mnt/skills/user/` 경로에 위치한다. 시스템 프롬프트에 `<available_skills>` 블록으로 스킬 메타데이터가 주입되며, 에이전트는 `view` 도구로 SKILL.md를 읽는다.

### 조사 항목 3: 스킬 트리거 방식

Claude Code와 Claude.ai 모두 **모델 호출(model-invoked)** 방식을 사용한다. 에이전트가 사용자 요청과 스킬 description을 매칭하여 자율적으로 활성화한다. Claude.ai에서는 시스템 프롬프트 내 "Claude's first order of business should always be to examine the skills available and decide which skills are relevant" 패턴으로 작동한다. 명시적 호출도 가능하며, 사용자가 "use the PDF skill" 등으로 직접 지정할 수 있다.

### 조사 항목 4: 스킬 분류 체계

- **프리빌트(Pre-built) 스킬**: Anthropic이 제공하는 공식 스킬. PPTX, XLSX, DOCX, PDF, frontend-design, file-reading, pdf-reading, product-self-knowledge 등이 포함된다.
- **커스텀 스킬**: 사용자가 직접 생성. `.claude/skills/` 또는 `~/.claude/skills/`에 배치.
- **예제 스킬**: `/mnt/skills/examples/`에 위치. skill-creator, algorithmic-art 등.
- **사용자 업로드 스킬**: `/mnt/skills/user/`에 위치. 사용자가 업로드한 커스텀 스킬.

### 조사 항목 5: 스킬 설치/배포

Claude Code에서는 세 가지 경로로 설치한다. (1) 수동 복사: 스킬 폴더를 `.claude/skills/`에 직접 배치. (2) Git 클론: `git clone` 후 해당 디렉토리에 복사. (3) 플러그인 마켓플레이스: `/plugin marketplace add` 명령으로 마켓플레이스 등록 후 `/plugin install`로 설치. 공식 Anthropic 마켓플레이스(`claude-plugins-official`)는 자동으로 사용 가능하며, 커뮤니티 마켓플레이스도 수동 추가할 수 있다. 외부 마켓플레이스로는 SkillsMP(skillsmp.com), skills.sh 등이 등장했다.

### 조사 항목 6: 스킬 번들링

Claude Code는 **플러그인(.plugin)** 시스템을 통해 스킬을 번들링한다. 하나의 플러그인이 다수의 스킬, 에이전트, 훅(hooks), MCP 서버, LSP 서버를 포함할 수 있다. `.claude-plugin/marketplace.json` 매니페스트 파일이 플러그인 구조를 정의하며, `"skills": ["./"]` 필드로 SKILL.md 디렉토리를 지정한다. 마켓플레이스 자체가 플러그인들의 카탈로그 역할을 한다.

### 조사 항목 7: 스킬 프로바이더 아키텍처

Claude Code는 파일시스템 기반 탐색이 기본이다. 플러그인 시스템은 GitHub 리포지토리 URL을 소스로 사용하며, `~/.claude/plugins/cache/` 디렉토리에 로컬 캐시한다. 원격 마켓플레이스는 자동 업데이트를 지원하여 시작 시 최신 버전을 Pull한다.

### 조사 항목 8: MCP 연동

Claude Code 플러그인은 MCP 서버를 번들링할 수 있다. 플러그인 내에 사전 구성된 MCP 서버를 포함하여, 스킬 설치 시 MCP 서버도 함께 설정된다. 스킬의 `allowed-tools` 필드에서 사용 가능한 도구를 사전 선언할 수 있다. Claude.ai에서는 MCP 서버가 별도 연결 방식으로 관리되며, 스킬과 MCP는 상호 보완적 관계로 설계되어 있다(스킬=지시, MCP=실행).

### 조사 항목 9: 웹 UI

Claude.ai 웹 인터페이스에는 스킬 전용 관리 UI가 별도로 노출되지 않는다. 스킬은 시스템 프롬프트에 내장되어 자동 작동한다. Claude Code CLI에서는 `/plugin` 명령으로 탭 형태의 관리 인터페이스(Discover / Installed / Configure / Errors)를 제공한다. 외부에서는 claudemarketplaces.com, skillsmp.com, claudecodeplugins.io 같은 서드파티 웹 카탈로그가 운영되고 있다.

### 조사 항목 10: 에이전트-스킬 관계

Claude Code/Claude.ai에서 스킬은 에이전트에 자동으로 할당된다. 모든 탐색 경로의 스킬이 메타데이터 수준에서 로드되며, 에이전트가 요청 컨텍스트에 따라 자율적으로 선택한다. Claude Code의 커스텀 에이전트(custom agents)에서는 특정 스킬을 명시적으로 리소스로 지정할 수 있다.

### 조사 항목 11: 다른 기능과의 연결 지점

- **스킬 → 컴퓨터 사용(Computer Use)**: 스킬이 bash 명령, 파일 생성, 스크립트 실행을 지시
- **스킬 → MCP 서버**: 스킬 내에서 MCP 도구 호출 지시 가능
- **플러그인 → 스킬 + MCP + 훅 + LSP**: 플러그인이 스킬과 다른 확장 기능을 번들링
- **마켓플레이스 → 플러그인 → 스킬**: 탐색-설치-활성화 파이프라인
- **시스템 프롬프트 → 스킬 메타데이터**: `<available_skills>` 블록으로 스킬 목록 주입
- **CLAUDE.md → 스킬**: 프로젝트 컨텍스트와 스킬이 상호 보완(Steering vs Skills 역할 분리)

---

## A-1. OpenAI (Codex CLI / IDE / App)

### 조사 항목 1: SKILL.md 파일 구조

OpenAI Codex는 Agent Skills 표준 형식의 SKILL.md를 지원한다. YAML 프론트매터에 `name`과 `description`이 필수이며, 추가로 `agents/openai.yaml` 파일을 통해 UI 메타데이터, 호출 정책(invocation policy), 도구 의존성 선언이 가능하다.

### 조사 항목 2: 스킬 탐색 경로

Codex는 다중 위치에서 스킬을 탐색한다. (1) 리포지토리 레벨: `.agents/skills` 디렉토리를 현재 작업 디렉토리부터 리포지토리 루트까지 상위로 스캔. (2) 사용자 레벨: `~/.codex/skills/`. (3) 관리자 레벨 및 시스템 레벨도 존재. 심볼릭 링크된 스킬 폴더도 인식하며, 동일 이름의 스킬이 있을 경우 병합하지 않고 둘 다 표시한다.

### 조사 항목 3: 스킬 트리거 방식

두 가지 모드를 지원한다. **명시적 호출**: CLI/IDE에서 `/skills` 명령 또는 `$`를 입력하여 스킬을 멘션. **암묵적 호출**: 사용자 태스크가 스킬 description과 매칭될 때 Codex가 자율 선택. `agents/openai.yaml`에서 호출 정책을 별도 구성할 수 있다.

### 조사 항목 4: 스킬 분류 체계

프리빌트 스킬과 커스텀 스킬로 구분된다. ChatGPT의 코드 인터프리터 환경에는 `/home/oai/skills` 폴더에 PDF, 문서, 스프레드시트용 빌트인 스킬이 포함되어 있다(Simon Willison이 2025년 12월 발견). instruction-only(기본값)와 스크립트 포함 스킬로도 분류된다.

### 조사 항목 5: 스킬 설치/배포

(1) 수동 생성: 폴더에 SKILL.md 파일 생성. (2) 스킬 인스톨러: `$skill-installer`를 사용하여 외부 리포지토리에서 설치. (3) `~/.codex/config.toml`에서 `[[skills.config]]` 섹션으로 스킬 경로 및 활성화 여부 설정. (4) 스킬 생성기(skill creator)가 내장되어 대화형으로 스킬을 자동 생성.

### 조사 항목 6: 스킬 번들링

OpenAI 자체 번들링 포맷은 확인되지 않으나, `agents/openai.yaml`을 통해 스킬에 도구 의존성을 선언할 수 있어 사실상 스킬+도구 패키지 역할을 한다.

### 조사 항목 7: 스킬 프로바이더 아키텍처

파일시스템 기반. `~/.codex/config.toml`에서 외부 경로 지정 가능. GitHub 리포지토리에서 `$skill-installer`로 다운로드.

### 조사 항목 8: MCP 연동

Codex CLI는 `--enable skills` 플래그로 스킬을 활성화한다. MCP와 스킬은 별도 확장 메커니즘이나, 스킬 내에서 도구 호출을 지시할 수 있다.

### 조사 항목 9: 웹 UI

Codex App(IDE)에서 `/skills` 명령으로 스킬 목록 확인 및 관리. 별도 웹 기반 스킬 마켓플레이스는 공식적으로 확인되지 않았으나, SkillsMP 등 서드파티에서 Codex 호환 스킬을 제공.

### 조사 항목 10: 에이전트-스킬 관계

**프로그레시브 디스클로저(Progressive Disclosure)** 패턴을 사용한다. 시작 시 각 스킬의 메타데이터(name, description, file path)만 로드하고, 사용 결정 시에만 전체 SKILL.md를 로드한다. `agents/openai.yaml`로 에이전트별 스킬 메타데이터를 추가 구성할 수 있다.

### 조사 항목 11: 다른 기능과의 연결 지점

- **스킬 → agents/openai.yaml**: UI 메타데이터, 호출 정책, 도구 의존성 선언
- **$skill-installer → GitHub**: 외부 리포지토리에서 스킬 설치
- **스킬 → 코드 실행**: instruction-only 또는 스크립트 포함 모드 선택
- **config.toml → 스킬 관리**: 경로 지정, 활성화/비활성화 제어

---

## A-1. Google (Gemini CLI / Antigravity)

### 조사 항목 1: SKILL.md 파일 구조

Gemini CLI는 agentskills.io 표준 SKILL.md 형식을 그대로 지원한다. YAML 프론트매터에 `name`과 `description`이 필수이며, 표준 디렉토리 구조(scripts/, references/, assets/)를 따른다.

### 조사 항목 2: 스킬 탐색 경로

세 가지 소스에서 스킬을 탐색한다. (1) **워크스페이스 스킬**: `.gemini/skills/` 또는 `.agents/skills/`(별칭). (2) **사용자 스킬**: `~/.gemini/skills/` 또는 `~/.agents/skills/`(별칭). (3) **익스텐션 스킬**: 설치된 익스텐션 내 번들 스킬(`~/.gemini/extensions/<extension_name>/skills`). 우선순위는 Workspace > User > Extension이며, 동일 티어 내에서는 `.agents/skills/` 별칭이 `.gemini/skills/`보다 우선한다.

### 조사 항목 3: 스킬 트리거 방식

Gemini는 `activate_skill` 도구를 사용하여 자율적으로 스킬을 활성화한다. 사용자 요청과 스킬 description을 기반으로 관련 스킬을 식별하면, 전체 지시사항과 리소스를 컨텍스트에 로드한다. `/skills` 명령으로 현재 로드된 스킬 목록 확인이 가능하며, `/skills disable` 및 `/skills enable`로 개별 스킬 활성화/비활성화를 제어할 수 있다.

### 조사 항목 4: 스킬 분류 체계

- **워크스페이스 스킬**: 프로젝트에 커밋하여 팀과 공유하는 스킬
- **사용자 스킬**: 개인 워크플로우용 글로벌 스킬
- **익스텐션 스킬**: 설치된 익스텐션에 번들된 스킬

### 조사 항목 5: 스킬 설치/배포

(1) 수동 생성: `.gemini/skills/` 디렉토리에 배치. (2) 빌트인 skill-creator: 대화형으로 새 스킬 자동 생성. (3) Gemini CLI 내장 설치: `gemini skills install <git-url> --path <path>`. (4) `npx skills` CLI(Vercel labs/skills): 크로스 플랫폼 스킬 설치/관리 도구. 심볼릭 링크 방식으로 여러 에이전트에 스킬을 공유. (5) Context7 CLI: `npx ctx7 skills install` 명령으로 설치.

### 조사 항목 6: 스킬 번들링

Gemini CLI의 **익스텐션(Extensions)** 시스템이 번들링 역할을 한다. 익스텐션은 컨텍스트, MCP 서버, 커스텀 명령, 스킬을 하나의 패키지로 묶는다. `gemini extensions install` 명령으로 설치하면 스킬이 `~/.gemini/extensions/<name>/skills` 디렉토리에 자동 배치된다.

### 조사 항목 7: 스킬 프로바이더 아키텍처

파일시스템 기반이 기본이며, 익스텐션 시스템과 Git 리포지토리를 통한 원격 배포를 지원한다. Google은 기존 익스텐션 내 eager-loaded MCP 서버를 deprecate하고 스킬 기반 프로그레시브 디스클로저로 전환하고 있다.

### 조사 항목 8: MCP 연동

기존 Gemini CLI 익스텐션은 MCP 서버를 번들링했으나, Agent Skills 도입 이후 MCP에서 스킬 기반으로 전환하는 추세이다. 스킬 내 scripts/에서 MCP 서버와 연동되는 코드를 실행할 수 있다. Antigravity에서도 동일한 스킬 디렉토리 구조를 사용하며, `~/.gemini/antigravity/skills/` 경로에서 탐색한다.

### 조사 항목 9: 웹 UI

Gemini CLI는 터미널 기반이며, `/skills` 명령으로 스킬 목록 조회 및 관리를 제공한다. 별도 웹 UI는 확인되지 않았다.

### 조사 항목 10: 에이전트-스킬 관계

에이전트가 자율 선택하는 모델. GEMINI.md(항상 로드되는 컨텍스트)와 스킬(온디맨드 로드)은 역할이 분리되어 있다.

### 조사 항목 11: 다른 기능과의 연결 지점

- **GEMINI.md → 항상 활성 컨텍스트 / 스킬 → 온디맨드 전문 지식**: 역할 분리
- **익스텐션 → 스킬 + MCP + 명령 + 컨텍스트**: 번들링 시스템
- **`npx skills` CLI → 멀티 에이전트 스킬 공유**: Gemini CLI와 Antigravity 간 심볼릭 링크
- **Google Codelabs → 스킬 튜토리얼**: Firebase Agent Skills 등 공식 스킬 배포

---

## A-1. Amazon (Kiro IDE & CLI)

### 조사 항목 1: SKILL.md 파일 구조

Kiro는 agentskills.io 표준 형식을 그대로 채택한다. 2026년 2월 5일(v0.9) IDE에서 Agent Skills 지원을 추가했다.

### 조사 항목 2: 스킬 탐색 경로

(1) **워크스페이스 스킬**: `.kiro/skills/` 디렉토리. 프로젝트별 적용. (2) **글로벌 스킬**: `~/.kiro/skills/`. 모든 워크스페이스에 적용. 이름 충돌 시 워크스페이스 스킬이 글로벌 스킬을 오버라이드한다. Kiro CLI에서는 `/context show` 명령으로 현재 세션에서 사용 가능한 스킬을 확인할 수 있다.

### 조사 항목 3: 스킬 트리거 방식

스킬은 사용자 요청에 기반하여 **자동 활성화**된다. Kiro가 요청과 스킬 description을 매칭하여 판단한다. 슬래시 명령으로 직접 호출하는 방식은 지원하지 않는다. 단, 프롬프트에 "use the X skill" 형태로 힌트를 줄 수 있다.

### 조사 항목 4: 스킬 분류 체계

Kiro는 세 가지 개념을 **의도적으로 구분**한다:
- **Steering**: Kiro 전용 컨텍스트. 코딩 표준, 프로젝트 규칙 등 **항상 활성화**되는 지침. `.kiro/steering/` 디렉토리. `always`, `auto`, `fileMatch`, `manual` 포함 모드 지원.
- **Skills**: Agent Skills 표준 기반. **온디맨드 로드**되는 포터블 지시 패키지.
- **Powers**: MCP 통합 + 번들된 지식과 워크플로우. 스킬의 상위 집합(superset)으로, MCP 서버와 규칙을 포함. 컨텍스트에 따라 **동적 활성화**.

### 조사 항목 5: 스킬 설치/배포

Kiro IDE의 "Agent Steering & Skills" 패널에서 "+" 버튼으로 스킬 추가. (1) 워크스페이스 스킬: `.kiro/skills/{skill-name}/SKILL.md` 경로에 생성. (2) 글로벌 스킬: `~/.kiro/skills/`에 생성. (3) GitHub에서 임포트 가능. (4) Kiro와 대화하여 자동 생성. `.claude/skills/`에 있는 기존 스킬을 `.kiro/skills/`로 직접 복사하면 호환된다.

### 조사 항목 6: 스킬 번들링

**Powers** 개념이 사실상 번들링 역할을 한다. MCP 도구 + 지식 + 워크플로우를 하나의 패키지로 묶는다.

### 조사 항목 7: 스킬 프로바이더 아키텍처

파일시스템 기반. 커스텀 에이전트에서는 `resources` 필드에 `skill://` URI 스킴으로 스킬 경로를 지정한다: `"skill://.kiro/skills/*/SKILL.md"`, `"skill://~/.kiro/skills/*/SKILL.md"`. 글로브 패턴을 지원한다.

### 조사 항목 8: MCP 연동

Powers가 MCP 서버와 스킬을 통합하는 역할을 한다. 커스텀 에이전트 구성에서 MCP 서버와 스킬을 동시에 리소스로 지정할 수 있다.

### 조사 항목 9: 웹 UI

Kiro IDE 좌측 패널에 "AGENT STEERING & SKILLS" 섹션이 있다. 스킬 목록 확인, 추가, 관리가 가능한 전용 UI를 제공한다. 엔터프라이즈 고객에게는 IAM Identity Center를 통한 웹 도구 접근 제어, 프라이빗 익스텐션 레지스트리 설정 등 거버넌스 기능이 제공된다.

### 조사 항목 10: 에이전트-스킬 관계

기본 에이전트(`kiro_default`)는 양쪽 위치의 스킬을 자동 로드한다. **커스텀 에이전트는 기본적으로 스킬을 로드하지 않으며**, `resources` 필드에 명시적으로 추가해야 한다. `/agent swap` 명령으로 에이전트를 전환할 수 있다.

### 조사 항목 11: 다른 기능과의 연결 지점

- **Steering(항상 활성) ↔ Skills(온디맨드)**: 의도적 역할 분리
- **Powers → MCP + Skills + Rules**: 통합 번들링
- **커스텀 에이전트 → skill:// URI → 스킬 할당**: 에이전트별 스킬 제어
- **Hooks → Pre/Post Tool Use**: 도구 호출 전후 인터셉트
- **IAM Identity Center → 거버넌스**: 엔터프라이즈 도구 접근 제어
- **MDM/Group Policy → ~/.kiro/steering/**: 팀 단위 중앙 배포

---

## A-1. Microsoft (GitHub Copilot / VS Code / Agent Framework)

### 조사 항목 1: SKILL.md 파일 구조

GitHub Copilot과 VS Code는 agentskills.io 표준 SKILL.md를 지원한다. YAML 프론트매터(name, description)와 Markdown 본문 구조. Microsoft는 자체 확장으로 `compatibility` 필드에 필요한 MCP 서버를 명시하고, SKILL.md 본문에 도구 참조 테이블(MCP 도구 매핑)을 포함하는 패턴을 사용한다. microsoft/skills 리포지토리에는 132개 이상의 Azure/Microsoft AI 스킬이 수록되어 있으며 1158개의 테스트 시나리오가 포함되어 있다.

### 조사 항목 2: 스킬 탐색 경로

(1) **프로젝트 레벨**: `.github/skills/` 디렉토리. (2) **개인 스킬**: `~/.copilot/skills/`(기본 설치 경로). (3) VS Code 설정 `chat.agentSkillsLocations`으로 추가 탐색 경로 지정 가능. (4) 모노레포에서는 `chat.useCustomizationsInParentRepositories`로 상위 리포지토리 루트에서도 탐색. (5) 익스텐션이 `chatSkills` 기여점(contribution point)으로 스킬을 제공. (6) 플러그인에 번들된 스킬도 자동 노출.

### 조사 항목 3: 스킬 트리거 방식

**3단계 프로그레시브 디스클로저**: (1) Discovery: 프론트매터의 name, description만 로드. (2) Instructions loading: 매칭 시 SKILL.md 본문 로드. `/skill-name` 슬래시 명령으로도 직접 트리거 가능. (3) Resource access: 필요시 스킬 디렉토리 내 추가 파일 로드. VS Code Chat에서 `/create-skill` 명령으로 스킬 생성, 진행 중인 대화에서 "create a skill from how we just debugged that"으로 스킬 추출도 가능.

### 조사 항목 4: 스킬 분류 체계

- **프로젝트 스킬**(Project skills): `.github/skills/`
- **개인 스킬**(Personal skills): 사용자 홈 디렉토리
- **플러그인 번들 스킬**: 설치된 에이전트 플러그인에 포함된 스킬
- **익스텐션 기여 스킬**: VS Code 익스텐션이 `chatSkills`로 제공하는 스킬
- Microsoft는 조직 레벨 스킬이 리포지토리 레벨 스킬을 오버라이드하는 구조를 지원

### 조사 항목 5: 스킬 설치/배포

(1) 수동 복사: `.github/skills/` 디렉토리에 배치. (2) 심볼릭 링크: 여러 에이전트 디렉토리에 공유(`ln -s ../.github/skills .claude/skills`). (3) GitHub awesome-copilot 리포지토리: 커뮤니티 스킬 컬렉션. (4) anthropics/skills 리포지토리: 참조 스킬. (5) VS Code "Chat Customizations" 에디터(Preview)에서 스킬 탐색/생성/관리. (6) `.github + MCP` 익스텐션(VS 2026)으로 스킬 설치. (7) microsoft/skills 리포지토리의 Skill Explorer로 132개 스킬 1-click 설치.

### 조사 항목 6: 스킬 번들링

**에이전트 플러그인(Agent Plugins)** 시스템. `.github/plugins/` 디렉토리에 플러그인을 배치하며, 스킬 + MCP 구성을 하나의 패키지로 묶는다. Azure Skills Plugin(`.github/plugins/azure-skills/`)이 대표적 예시로, 20개 스킬과 `.mcp.json` MCP 설정을 함께 포함한다.

### 조사 항목 7: 스킬 프로바이더 아키텍처

파일시스템 기반 + VS Code 익스텐션 기여점. Microsoft Agent Framework SDK에서는 `FileAgentSkillsProvider` 등 스토리지 비종속 프로바이더 패턴을 사용할 수 있으며, `load_skill`, `read_skill_resource`, `run_skill_script` 도구를 노출한다. GitHub Copilot SDK를 통해 프로그래밍 방식으로 스킬을 통합할 수 있다.

### 조사 항목 8: MCP 연동

Azure Skills Plugin이 스킬과 MCP 서버를 하나의 플러그인으로 통합하는 패턴을 보여준다. Agent Framework에서는 스킬을 MCP 서버로 노출하거나, MCP 서버를 통해 스킬이 외부 서비스와 상호작용할 수 있다. GitHub Copilot SDK는 로컬(stdio) 및 원격(HTTP) MCP 서버 연결을 네이티브로 지원한다.

### 조사 항목 9: 웹 UI

VS Code에 "Chat Customizations" 에디터(Preview), "Configure Skills" 메뉴가 있다. microsoft.github.io/skills 사이트에서 전체 스킬 카탈로그를 웹으로 탐색할 수 있다. VS 2026에서는 `.github + MCP` 익스텐션을 통해 스킬 리스트, 편집, 자동 호출을 지원한다.

### 조사 항목 10: 에이전트-스킬 관계

Copilot이 컨텍스트 기반으로 자율 선택한다. VS 2026에서는 "auto-invoked if identified as a skill that would help the current prompt/chat flow" 방식. 커스텀 에이전트에서는 `resources`로 특정 스킬을 명시적으로 할당할 수 있다.

### 조사 항목 11: 다른 기능과의 연결 지점

- **Custom Instructions(항상 적용) ↔ Skills(온디맨드)**: 역할 분리
- **에이전트 플러그인 → 스킬 + MCP 설정**: 번들링
- **Agent Framework SDK → AIAgent → 스킬**: 프로그래밍 방식 통합
- **VS Code 익스텐션 → chatSkills 기여점**: 익스텐션이 스킬 제공
- **Copilot SDK → 멀티 호스트 지원**: VS Code, CLI, 코딩 에이전트에서 동일 스킬 사용
- **테스트 하니스 → 스킬 검증**: 스킬별 수용 기준 및 테스트 시나리오

---

## A-2. Manus

### 조사 항목 1: SKILL.md 파일 구조

agentskills.io 표준을 채택한다. 추가로 Manus는 내장 데이터 소스(SimilarWeb, YahooFinance, LinkedinSearch 등)를 스킬로 캡슐화하여 discoverable하게 만들었다.

### 조사 항목 2: 스킬 탐색 경로

Manus의 격리된 샌드박스 VM 환경 내 파일시스템에서 스킬을 탐색한다. 사용자 스킬 라이브러리에서 관리된다.

### 조사 항목 3: 스킬 트리거 방식

**슬래시 명령**: `/SKILL_NAME`으로 명시적 호출. 자동 트리거도 가능하며, 에이전트가 요청 관련성에 따라 SKILL.md를 읽고 실행한다.

### 조사 항목 4: 스킬 분류 체계

- **개인 스킬**: 사용자가 생성한 스킬
- **공식 스킬(Official)**: Manus 팀이 큐레이션한 라이브러리
- **내장 데이터 소스 스킬**: SimilarWeb 등 플랫폼 데이터 소스를 스킬로 변환
- **GitHub 임포트 스킬**: 외부 커뮤니티 스킬

### 조사 항목 5: 스킬 설치/배포

네 가지 방법: (1) **대화에서 생성**: 성공적인 태스크 완료 후 "Package this workflow into a Skill" 지시로 원클릭 패키징. (2) **업로드**: .zip, .skill 파일, 폴더 업로드. (3) **공식 라이브러리에서 추가**: 큐레이션된 프리빌트 스킬. (4) **GitHub에서 임포트**: 리포지토리 링크 제공.

### 조사 항목 6: 스킬 번들링

`.skill` 파일 형식이 ZIP 아카이브 기반 번들이다. SKILL.md + scripts/ + assets/ + references/ 구조를 하나의 파일로 패키징한다.

### 조사 항목 7: 스킬 프로바이더 아키텍처

VM 파일시스템 기반. 브라우저 자동화, 코드 실행, 파일 작업이 통합된 실행 환경에서 스킬의 스크립트를 직접 실행한다.

### 조사 항목 8: MCP 연동

Manus는 스킬과 MCP를 상호 보완적으로 사용한다. "Skills provide the playbook; MCP provides the data pipeline." Connectors를 통해 MCP와 스킬을 동일 세션에서 함께 사용할 수 있다.

### 조사 항목 9: 웹 UI

Manus 웹 앱에서 스킬 관리 인터페이스를 제공한다. 스킬 라이브러리 브라우징, 생성, 업로드, GitHub 임포트가 가능하다. 채팅 입력에서 `/`를 입력하면 사용 가능한 스킬 목록이 표시된다.

### 조사 항목 10: 에이전트-스킬 관계

에이전트와 스킬은 1:N 관계. 프로젝트에 스킬을 통합하면 해당 프로젝트의 에이전트가 스킬을 사용할 수 있다. 팀 플랜에서는 **팀 스킬 라이브러리**가 예정되어 있어, 멤버가 검증된 스킬을 공유 라이브러리에 게시할 수 있다.

### 조사 항목 11: 다른 기능과의 연결 지점

- **대화 → 스킬 생성**: 성공적 워크플로우를 스킬로 패키징
- **프로젝트 → 스킬 할당**: 프로젝트별 스킬 커스터마이징
- **Connectors → MCP + 스킬**: 데이터 파이프라인과 실행 지침 통합
- **팀 스킬 라이브러리(예정) → 조직 내 공유**: 전문 지식의 조직적 확산
- **Chrome 확장 → 브라우저 자동화**: 스킬이 브라우저 도구와 결합

---

## A-2. Cursor

### 조사 항목 1~11 요약

Cursor는 나이틀리 빌드에서 Agent Skills를 먼저 지원하다가 정식 채택했다. `.cursor/skills/` 또는 `.agents/skills/` 경로에서 스킬을 탐색한다. agentskills.io 표준 SKILL.md 형식을 따르며, 프로그레시브 디스클로저 패턴을 사용한다. Cursor Rules(프로젝트 규칙)와 스킬은 역할이 분리되어 있다.

---

## A-2. Block (Goose)

### 조사 항목 1~11 요약

Goose는 오픈소스 에이전트 프레임워크로 Agent Skills를 채택했다. 익스텐션 시스템을 통해 스킬을 지원하며, agentskills.io 호환 SKILL.md를 인식한다.

---

## A-3. 기타 호환 서비스 (요약)

- **OpenCode**: `.agents/skills`(글로벌 스킬), `.opencode/skills`(프로젝트) 경로 지원. 글로벌 스킬은 모든 프로젝트에서 사용 가능.
- **Amp**: Agent Skills 지원 문서 확인됨.
- **Cline/Roo Code**: VS Code 확장으로 스킬 통합 지원.
- **Kilo Code**: 커뮤니티 문서에서 스킬 지원 확인.
- **Letta**: 상태 유지(Stateful) LLM 에이전트 + 메모리에 Agent Skills 지원.
- **Deep Agents(LangChain)**: `deepagents-CLI`에 스킬 지원 추가. 요청 관련성에 따라 자동으로 SKILL.md를 읽고 실행.
- **JetBrains (Junie)**: Agent Skills 호환 확인됨.

---

## A-4. Spring AI (Java 프레임워크)

### 조사 항목 요약

Spring AI는 LLM 프로바이더 비종속 Agent Skills 구현을 제공하는 Java 프레임워크이다. Agent Skills 표준에 따라 스킬을 로드하고 에이전트에 제공하는 기능을 지원한다.

---

# Part B: 자체 스킬 체계 서비스

## Coze (ByteDance)

### 조사 항목 1: 스킬에 해당하는 개념의 명칭과 정의

Coze에서 스킬에 해당하는 개념은 **플러그인(Plugin)**이다. 플러그인은 봇(Bot)에 추가 기능을 부여하는 모듈로, 서드파티 API를 래핑하여 정보 검색, 생산성 작업, 외부 서비스 연동 등을 수행한다. 이 외에 **워크플로우(Workflow)**가 복잡한 비즈니스 로직을 시각적으로 설계하는 기능이며, **지식 베이스(Knowledge Base)**가 RAG 기반 데이터 제공 역할을 한다.

### 조사 항목 2: 스킬 관리가 GNB에서 어디에 위치하는가

Coze의 GNB(글로벌 내비게이션)에서 플러그인은 두 곳에서 접근된다. (1) **봇 에디터 내부**: 봇 빌드 화면에서 "Plugins" 섹션으로 플러그인을 추가/제거. (2) **플러그인 스토어**: 별도의 탐색/마켓 화면으로 60개 이상의 공식 플러그인 브라우징. Coze Studio(오픈소스)에서는 "Resources" 모듈 내에 플러그인 관리가 위치한다.

### 조사 항목 3: 스킬 분류 체계

- **공식 플러그인**: Coze 팀이 제공하는 프리빌트 플러그인
- **커스텀 플러그인**: 사용자가 API 기반으로 생성
- **워크플로우**: 시각적 노드 기반 자동화(실행 스킬 유사)
- **지식 베이스**: 문서 업로드 및 벡터 검색(데이터 스킬 유사)
- **데이터베이스**: 구조화된 데이터 저장/조회

### 조사 항목 4: "내 스킬"과 "탐색/마켓" 화면의 분리/통합

분리 구조이다. 봇 에디터에서 "내 봇에 할당된 플러그인"을 관리하고, 별도 플러그인 스토어에서 새 플러그인을 탐색/추가한다. 봇 스토어(Bot Store)에서는 완성된 봇을 공유/배포할 수 있으며, 플러그인 스토어에서는 플러그인을 개별적으로 게시한다.

### 조사 항목 5: 스킬 목록 UI

플러그인 스토어는 카드 형태의 그리드 레이아웃으로 구성되며, 카테고리 필터와 검색 기능을 제공한다. 봇 에디터 내에서는 리스트 형태로 할당된 플러그인이 표시된다.

### 조사 항목 6: 스킬 생성/편집 UX

커스텀 플러그인은 API 엔드포인트를 등록하는 방식으로 생성한다. 서드파티 서비스의 인증 키를 설정하고, API 스키마를 정의한다. Coze Studio에서는 시각적 워크플로우 캔버스에서 노드를 드래그앤드롭하여 복잡한 로직을 설계한다.

### 조사 항목 7: 에이전트에 스킬을 할당하는 UX

봇 에디터에서 "Plugins" 섹션을 열고, 사용할 플러그인을 선택하여 봇에 추가한다. 워크플로우도 마찬가지로 봇에 바인딩한다. 할당은 봇 단위로 이루어지며, 하나의 봇에 여러 플러그인을 동시에 할당할 수 있다.

### 조사 항목 8: 다른 기능과의 연결 지점

- **봇 빌더 → 플러그인 할당**: 봇 편집 화면에서 직접 연결
- **플러그인 스토어 → 봇 빌더**: 스토어에서 선택 후 봇에 추가
- **워크플로우 → 봇 바인딩**: 워크플로우를 봇의 실행 로직으로 연결
- **지식 베이스 → 봇 컨텍스트**: RAG 데이터 소스로 연결
- **멀티 플랫폼 배포 → 봇 게시**: Discord, Slack, Telegram 등으로 봇 배포

---

## Dify

### 조사 항목 1: 스킬에 해당하는 개념의 명칭과 정의

Dify에서 스킬에 해당하는 핵심 개념은 **도구(Tools)**이다. 도구는 에이전트가 외부 세계와 상호작용하는 수단으로, LLM 기능을 확장한다. 최근에는 **플러그인(Plugins)** 시스템이 추가되어, 도구 플러그인, 모델 플러그인, 에이전트 전략 플러그인, 확장 플러그인 등을 포괄한다.

### 조사 항목 2: 스킬 관리가 GNB에서 어디에 위치하는가

Dify의 워크스페이스 내비게이션에서 **"Tools"** 메뉴가 최상위 항목으로 존재한다. 여기서 인증 설정, 커스텀 도구 임포트, MCP 서버 구성, 워크플로우를 도구로 게시하는 기능을 관리한다. 별도로 **"Plugins"** 관리 화면이 있다.

### 조사 항목 3: 스킬 분류 체계

- **빌트인 도구(Built-in Tools)**: Dify 생태계가 제공하는 50개 이상의 도구 (Google Search, DALL·E, Stable Diffusion, WolframAlpha 등)
- **커스텀 도구(Custom Tools)**: 사용자가 OpenAPI/Swagger 또는 ChatGPT Plugin 스펙으로 임포트하는 API 도구
- **워크플로우 도구**: 워크플로우를 도구로 게시하여 다른 에이전트에서 사용
- **MCP 서버**: MCP 프로토콜로 연결하는 외부 도구
- **플러그인 마켓플레이스**: 도구 플러그인, 모델 플러그인, 에이전트 전략 플러그인, 확장 플러그인, 번들

### 조사 항목 4: "내 스킬"과 "탐색/마켓" 화면의 분리/통합

분리 구조이다. "Tools" 화면에서 현재 워크스페이스의 도구를 관리하고, 별도 플러그인 마켓플레이스에서 커뮤니티/공식 플러그인을 탐색·설치한다.

### 조사 항목 5: 스킬 목록 UI

"Tools" 화면에서는 빌트인 도구와 커스텀 도구가 리스트/카드 형태로 표시된다. 각 도구에 대해 인증 상태, 파라미터, 테스트 기능이 제공된다. 플러그인 마켓플레이스는 카테고리별 탐색, 검색, 필터를 지원한다.

### 조사 항목 6: 스킬 생성/편집 UX

커스텀 도구 생성은 "Tools → Custom Tools" 섹션에서 OpenAPI 스키마를 직접 붙여넣거나 URL에서 임포트하는 방식이다. 시스템이 자동으로 파라미터를 파싱하여 미리보기를 제공하고, 도구 파라미터를 테스트할 수 있다. 플러그인 개발은 CLI 기반 스캐폴딩 도구(`dify` CLI)로 초기화하고, Python 코드로 구현한 후 `.difypkg`로 패키징한다.

### 조사 항목 7: 에이전트에 스킬을 할당하는 UX

에이전트 빌더(Studio)에서 "Tools" 섹션을 열고, 사용할 도구를 추가한다. 빌트인 도구와 커스텀 도구 모두 선택 가능하다. 워크플로우 노드에서도 "Tools" 노드로 도구를 삽입할 수 있다. 노드별 재시도 설정(최대 10회), 에러 핸들링(대체 워크플로우 경로) 구성이 가능하다.

### 조사 항목 8: 다른 기능과의 연결 지점

- **에이전트 빌더(Studio) → Tools 할당**: 에이전트에 도구 직접 연결
- **워크플로우 → Tools 노드**: 워크플로우 내 도구 호출
- **워크플로우 → 도구로 게시**: 워크플로우 자체를 다른 에이전트의 도구로 노출
- **MCP 서버 → 도구**: MCP 프로토콜로 외부 서비스 연결
- **플러그인 마켓플레이스 → 워크스페이스**: 플러그인 설치 후 전체 팀 사용 가능
- **OpenAPI → 자동 파싱**: 외부 API를 도구로 자동 변환

---

## Dust.tt

### 조사 항목 1: 스킬에 해당하는 개념의 명칭과 정의

Dust에서는 **도구(Tools)**와 **연결(Connections)**이 스킬에 해당하는 개념이다. Tools는 에이전트가 사용하는 실행 능력(GitHub, GitLab 작업, 웹 탐색, 코드 실행 등)이고, Connections/Data Sources는 데이터를 에이전트에 공급하는 연결(Slack, Google Drive, Notion 등)이다. 에이전트 빌더에서 **Actions**로 지칭되기도 한다.

### 조사 항목 2: 스킬 관리가 GNB에서 어디에 위치하는가

워크스페이스 관리자는 **Spaces → Tools** 메뉴에서 도구를 관리한다. 이곳에서 미리 정의된 도구 추가, 인증 설정, MCP 서버 연결, 접근 권한 관리가 이루어진다.

### 조사 항목 3: 스킬 분류 체계

- **데이터 스킬(Connections/Data Sources)**: Slack, Google Drive, Notion, Confluence, GitHub 등에서 데이터를 가져오는 연결. Semantic search 기반.
- **실행 스킬(Tools)**: GitHub 이슈 생성, Slack 메시지 전송, Google Calendar 관리, Gmail 초안 작성 등 외부 서비스에 대한 액션.
- **Dust Apps**: 코드를 실행하는 커스텀 도구. 에이전트의 도구로 사용 가능.
- **원격 MCP 서버**: 외부 MCP 서버 연결.

도구의 **위험도 분류(Stake Level)** 체계가 독특하다:
- **Never ask**: 확인 없이 자동 실행
- **Low stake**: 사용자가 비활성화 가능한 확인
- **Medium stake**: 특정 에이전트/파라미터 범위에서 승인 저장 가능
- **High stake(기본)**: 항상 사용자 확인 필요

### 조사 항목 4: "내 스킬"과 "탐색/마켓" 화면의 분리/통합

통합 구조에 가깝다. Spaces → Tools에서 도구 추가/관리를 하며, "Add Tool" 버튼으로 Dust 빌트인 도구 또는 원격 MCP 서버를 추가한다. 별도 마켓플레이스는 없으며, 에이전트 빌더에서 직접 도구를 구성한다.

### 조사 항목 5: 스킬 목록 UI

도구 관리 화면에서 설치된 도구 세트가 리스트로 표시된다. 각 도구 세트를 클릭하면 세부 정보(사용 가능한 도구 목록), 인증 관리, 제거 옵션이 나타난다. 각 도구의 이름과 설명을 커스터마이징할 수 있다.

### 조사 항목 6: 스킬 생성/편집 UX

(1) **에이전트 빌더**에서 "Search" 액션 추가 시 데이터 소스 선택 및 설명 작성. (2) **Dust Apps**로 커스텀 코드 도구 생성. (3) **원격 MCP 서버** 추가로 외부 도구 연결. 에이전트 빌더에는 사이드킥(Sidekick) 가이드가 있어 설정을 도와준다.

### 조사 항목 7: 에이전트에 스킬을 할당하는 UX

에이전트 빌더에서 "Tools & Knowledge" 섹션을 통해 도구를 추가한다. 각 데이터 소스에 대해 설명을 작성하여 에이전트가 언제 사용할지 가이드한다. 여러 Search 액션을 추가하여 소스별 컨텍스트를 제공할 수 있다. 에이전트는 도구 중 어떤 것을 사용할지 자율 결정한다.

### 조사 항목 8: 다른 기능과의 연결 지점

- **Spaces → Tools → 에이전트**: 도구가 Space 단위로 관리되고 에이전트에 할당
- **에이전트 빌더 → Actions → 데이터 소스/도구**: 에이전트별 도구 구성
- **Triggers → 에이전트 자동화**: 스케줄 또는 웹훅으로 에이전트 자동 실행
- **Slack 채널 → 에이전트 바인딩**: 특정 채널에 에이전트를 연결
- **OAuth → 인증 관리**: 워크스페이스 또는 개인 레벨 인증
- **위험도 분류 → 거버넌스**: 도구별 승인 수준 설정

---

## Relevance AI

### 조사 항목 1: 스킬에 해당하는 개념의 명칭과 정의

Relevance AI에서 스킬에 해당하는 개념은 **도구(Tools)**이다. 도구는 에이전트가 수행하는 자동화된 액션으로, 이메일 전송, CRM 업데이트, 웹 검색, API 호출 등을 포함한다. 노코드 **Tool Builder**에서 드래그앤드롭 캔버스로 도구를 생성한다.

### 조사 항목 2: 스킬 관리가 GNB에서 어디에 위치하는가

Relevance AI의 내비게이션에서 "Tools" 메뉴가 최상위 항목으로 존재한다. 에이전트, 도구, 지식(Knowledge), 워크포스(Workforces)가 주요 내비게이션 항목이다.

### 조사 항목 3: 스킬 분류 체계

- **빌트인 도구**: 기성 제공되는 자동화 도구 (YouTube 비디오 추출, 지식 검색, 이메일 에스컬레이션 등)
- **커스텀 도구**: Tool Builder에서 LLM 프롬프트, 플로우 제어, API 호출을 결합하여 생성
- **오프더셸프 자동화**: 기술 스택과 연동하는 사전 구성된 자동화

### 조사 항목 4: "내 스킬"과 "탐색/마켓" 화면의 분리/통합

**마켓플레이스**에서 프리빌트 에이전트, 도구, 워크포스를 클론하여 커스터마이징할 수 있다. 사용자의 도구는 "Tools" 메뉴에서 관리된다.

### 조사 항목 5: 스킬 목록 UI

도구 목록은 카드/리스트 형태로 표시되며, 각 도구에 대한 설명, 입력 파라미터, 사용 방법이 제공된다. 도구를 대량 실행(Bulk Run)할 수 있는 기능도 있다.

### 조사 항목 6: 스킬 생성/편집 UX

Tool Builder는 노코드 드래그앤드롭 캔버스이다. LLM 프롬프트 스텝, API 호출 스텝, 조건부 로직, 변환 등을 노드로 연결하여 도구를 구성한다. "Invent" 기능으로 설명을 입력하면 에이전트가 자동으로 도구를 생성해준다.

### 조사 항목 7: 에이전트에 스킬을 할당하는 UX

에이전트 빌더에서 도구를 에이전트에 장착(equip)한다. "Give them tools" 패턴으로 에이전트에 필요한 도구를 선택하여 추가한다. 워크포스 캔버스에서는 여러 에이전트를 시각적으로 연결하고, 각 에이전트에 다른 도구 세트를 할당할 수 있다.

### 조사 항목 8: 다른 기능과의 연결 지점

- **에이전트 빌더 → 도구 장착**: 에이전트에 도구 직접 할당
- **워크포스 캔버스 → 멀티 에이전트 → 도구**: 에이전트 팀 구성
- **지식(Knowledge) → 에이전트 컨텍스트**: RAG 기반 데이터 제공
- **마켓플레이스 → 클론 → 커스터마이징**: 프리빌트 에이전트/도구 재사용
- **트리거 → 자동 실행**: 파이프라인 이벤트에 의한 에이전트 자동 트리거

---

# Part C: 비교 분석

## 비교 축 1: 스킬 정의 방식

**Agent Skills 표준(SKILL.md 선언형)**: 마크다운 파일 기반. YAML 프론트매터 + Markdown 본문으로 구성된 텍스트 파일 하나가 스킬의 핵심이다. 코드 에디터나 텍스트 에디터에서 작성하며, 버전 관리(Git)에 자연스럽게 통합된다. 복잡한 SDK나 API 없이 human-readable 형식으로 작성한다. 실행 코드는 scripts/ 디렉토리에 별도 번들링한다.

**Coze(UI 기반)**: 시각적 워크플로우 캔버스에서 노드를 드래그앤드롭하여 플러그인/워크플로우를 구성한다. API 엔드포인트를 등록하고 인증을 설정하는 폼 기반 UI이다.

**Dify(하이브리드)**: OpenAPI/Swagger 스키마를 붙여넣거나 URL에서 임포트하는 반자동 방식. 플러그인 개발은 CLI + Python 코드 기반이다.

**Dust(UI 기반 + 코드)**: 에이전트 빌더 UI에서 액션을 구성하고, Dust Apps로 코드 기반 커스텀 도구를 생성한다.

**Relevance AI(노코드 빌더)**: 드래그앤드롭 Tool Builder 캔버스에서 도구를 시각적으로 설계한다.

관찰: Agent Skills 표준은 **개발자 친화적**이고 **이식성**이 높다(파일 복사만으로 이식). 자체 스킬 체계는 **비개발자 접근성**이 높지만 **플랫폼 종속적**이다.

## 비교 축 2: 스킬 탐색

**Agent Skills 표준**: 파일시스템 자동 탐색이 핵심 메커니즘이다. 프로젝트 디렉토리와 사용자 홈 디렉토리에서 약속된 경로(`.claude/skills/`, `.github/skills/`, `.gemini/skills/`, `.kiro/skills/`, `.agents/skills/` 등)를 스캔한다. 심볼릭 링크, 글로브 패턴, 추가 경로 설정으로 확장한다. 마켓플레이스/레지스트리(SkillsMP, skills.sh, GitHub 리포지토리)는 배포 채널이지 탐색 메커니즘은 아니다.

**Coze**: 플러그인 스토어에서 카테고리/검색으로 탐색. 봇 에디터 내부에서도 사용 가능한 플러그인을 브라우징.

**Dify**: Tools 화면에서 빌트인 도구를 탐색하고, 플러그인 마켓플레이스에서 외부 플러그인을 탐색.

**Dust**: Spaces → Tools에서 관리자가 도구를 추가. 에이전트 빌더 내에서 사용 가능한 데이터 소스와 도구를 선택.

**Relevance AI**: Tools 메뉴와 마켓플레이스에서 탐색.

관찰: Agent Skills 표준은 **분산 탐색(파일시스템 컨벤션)** 모델이고, 자체 스킬 체계는 **중앙 집중 탐색(UI/마켓플레이스)** 모델이다.

## 비교 축 3: 스킬 분류

| 분류 기준 | Agent Skills 표준 | Coze | Dify | Dust | Relevance AI |
|---|---|---|---|---|---|
| 항상 활성 vs 온디맨드 | Steering/Rules(항상) + Skills(온디맨드) | 모든 플러그인이 봇에 할당되면 항상 사용 가능 | 도구가 에이전트에 할당되면 항상 사용 가능 | 위험도 기반 분류 | 에이전트에 장착되면 사용 가능 |
| 데이터 vs 실행 | 미분리(스킬 내 지시) | 지식 베이스 vs 플러그인/워크플로우 | 빌트인/커스텀 도구 vs 지식 베이스 | Connections(데이터) vs Tools(실행) | Knowledge vs Tools |
| 프리빌트 vs 커스텀 | 공식 스킬 + 커스텀 스킬 | 공식 플러그인 + 커스텀 플러그인 | 빌트인 50+ + 커스텀 API 도구 | 빌트인 도구 + MCP + Dust Apps | 빌트인 자동화 + 커스텀 Tool Builder |
| 스코프 | 프로젝트/사용자/시스템 레벨 | 봇별 할당 | 워크스페이스 단위 | Space 단위 + 위험도 레벨 | 에이전트별 할당 |

## 비교 축 4: 스킬 거버넌스

**Agent Skills 표준**: 엔터프라이즈 거버넌스가 서비스별로 다르게 구현된다. Kiro는 IAM Identity Center 기반 도구 접근 제어, 프라이빗 익스텐션 레지스트리, MDM을 통한 팀 단위 Steering 배포를 지원한다. GitHub Copilot은 조직 레벨 스킬이 리포지토리 레벨을 오버라이드하는 구조를 지원한다. 대부분의 서비스에서 스킬은 파일시스템 기반이므로 Git 리포지토리의 접근 권한과 코드 리뷰 프로세스로 거버넌스를 구현한다. 전용 승인 프로세스는 표준 자체에 정의되어 있지 않다.

**Coze**: 워크스페이스 기반 접근 제어. 플러그인 스토어 게시에는 리뷰 프로세스가 존재한다.

**Dify**: 워크스페이스 단위 도구 관리. 커스텀 도구 생성 시 전체 워크스페이스 멤버가 사용 가능하다. 플러그인은 `.difypkg`로 패키징하여 별도 리포지토리에 업로드한다.

**Dust**: 도구별 **위험도 분류(Stake Level)** 시스템이 거버넌스 역할을 한다. 관리자가 도구를 추가하고, Space 단위로 접근을 제어하며, 워크스페이스 전체 또는 개별 Space에 도구 가시성을 설정한다. OAuth 인증은 워크스페이스 레벨 또는 개인 레벨로 분리된다.

**Relevance AI**: 역할 기반 접근 제어. Team/Enterprise 플랜에서 조직 단위 관리를 제공한다.

## 비교 축 5: 확장성 — 스킬 공유·재사용·번들링

**Agent Skills 표준**: 표준 자체가 이식성(portability)을 핵심 가치로 삼는다. "한 번 작성하면 26개 이상 플랫폼에서 사용"이 가능하다. Git 리포지토리로 공유하며, 심볼릭 링크로 멀티 에이전트에 재사용한다. 번들링은 플러그인(Claude Code), 익스텐션(Gemini CLI), 에이전트 플러그인(GitHub Copilot) 등 서비스별로 구현된다. `npx skills` CLI(Vercel labs)가 크로스 플랫폼 설치 도구 역할을 한다. SkillsMP에는 500,000개 이상의 스킬이 인덱싱되어 있다.

**Coze**: 봇 스토어와 플러그인 스토어를 통한 공유. 봇 단위로 플러그인이 할당되므로 봇을 공유하면 플러그인 구성도 함께 공유된다. 플랫폼 외부로의 이식성은 없다.

**Dify**: Explore 섹션에서 앱 템플릿을 공유. 플러그인 마켓플레이스를 통한 확장. 워크플로우를 도구로 게시하여 에이전트 간 재사용. MCP 서버로 게시하여 외부 클라이언트에서 사용 가능. 오픈소스이므로 자체 배포 환경에서 커스터마이징 가능.

**Dust**: 에이전트 템플릿을 통한 공유. Dust Apps로 커스텀 도구를 코드로 관리. MCP 서버를 통한 외부 도구 통합. Space 단위 접근 제어로 팀 간 도구 공유를 관리.

**Relevance AI**: 마켓플레이스에서 에이전트/도구/워크포스를 클론하여 재사용. "Invent" 기능으로 설명에서 자동 생성. 워크포스 캔버스에서 멀티 에이전트 구성을 재사용.

---

# 시각 자료 모음

## Anthropic (Claude Code)
- [Claude Code 플러그인 마켓플레이스 관리 UI](https://code.claude.com/docs/en/discover-plugins) — `/plugin` 명령의 Discover/Installed/Configure/Errors 탭 구조를 확인할 수 있는 공식 문서
- [Anthropic 스킬 리포지토리](https://github.com/anthropics/skills) — 공식 스킬 목록과 디렉토리 구조 참조
- [SkillsMP 마켓플레이스](https://skillsmp.com/) — 500,000+ 스킬의 서드파티 카탈로그. 카드 UI, 검색/필터, 호환 플랫폼 표시 패턴 참조
- [claudecodeplugins.io](https://github.com/jeremylongshore/claude-code-plugins-plus-skills) — 340 플러그인 + 1,367 스킬의 커뮤니티 마켓플레이스. 카테고리별 구성 참조

## OpenAI (Codex)
- [Codex Skills 공식 문서](https://developers.openai.com/codex/skills) — `/skills` 명령, `$` 멘션, progressive disclosure 구조, agents/openai.yaml 패턴 확인
- [Codex CLI Skills 사용 가이드](https://developers.openai.com/codex/skills) — 스킬 인스톨러, config.toml 설정, 스킬 생성기 UX 참조

## Google (Gemini CLI)
- [Gemini CLI Skills 공식 문서](https://geminicli.com/docs/cli/skills/) — 워크스페이스/사용자/익스텐션 스킬 구조, `/skills` 명령, 활성화/비활성화 UX 확인
- [Gemini CLI Skills 튜토리얼](https://geminicli.com/docs/cli/tutorials/skills-getting-started/) — 스킬 생성 UX 및 스크립트 번들링 패턴 참조
- [Google Codelabs: Agent Skills for Gemini CLI](https://codelabs.developers.google.com/gemini-cli/how-to-create-agent-skills-for-gemini-cli) — Firebase Agent Skills 설치/사용 실습 가이드
- [Gemini CLI 익스텐션의 스킬 전환 블로그](https://medium.com/google-cloud/your-gemini-cli-extensions-just-got-smarter-introducing-agent-skills-a8fbfa077e7f) — MCP에서 스킬 기반으로의 전환 아키텍처 참조

## Amazon (Kiro)
- [Kiro IDE Skills 공식 문서](https://kiro.dev/docs/skills/) — Steering vs Skills vs Powers 구분, "AGENT STEERING & SKILLS" 패널 UI 확인
- [Kiro CLI Skills 문서](https://kiro.dev/docs/cli/skills/) — CLI에서의 스킬 탐색, `skill://` URI 스킴, 커스텀 에이전트 리소스 지정 패턴 참조
- [Kiro 0.9 릴리즈 블로그](https://kiro.dev/blog/custom-subagents-skills-and-enterprise-controls/) — 커스텀 서브에이전트 + 스킬 + 엔터프라이즈 거버넌스 통합 아키텍처 참조
- [Kiro 커스텀 에이전트 문서](https://kiro.dev/docs/cli/custom-agents/creating/) — 에이전트에 스킬을 할당하는 JSON 구성 패턴 확인

## Microsoft (GitHub Copilot / VS Code)
- [VS Code Agent Skills 공식 문서](https://code.visualstudio.com/docs/copilot/customization/agent-skills) — `.github/skills/` 구조, Chat Customizations 에디터, 플러그인 번들 스킬, `/create-skill` 명령 참조
- [Microsoft Skills 리포지토리 및 Explorer](https://microsoft.github.io/skills/) — 132개 Azure 스킬 카탈로그, 1-click 설치 UI 패턴 확인
- [.NET Skills 블로그](https://devblogs.microsoft.com/dotnet/extend-your-coding-agent-with-dotnet-skills/) — VS 2026에서의 스킬 자동 호출, 마켓플레이스 URL 설정 패턴 참조
- [Azure Skills Plugin](https://github.com/microsoft/azure-skills) — `.github/plugins/` 디렉토리의 스킬+MCP 번들링 구조 확인

## Manus
- [Manus Skills 공식 문서](https://manus.im/docs/features/skills) — 스킬 생성(대화에서 패키징, 업로드, 공식 라이브러리, GitHub 임포트), `/SKILL_NAME` 트리거 UX 확인
- [Manus Skills 기능 페이지](https://manus.im/features/agent-skills) — 스킬 마켓플레이스 화면, MCP와의 보완적 관계 설명 참조
- [Manus Skills 통합 블로그](https://manus.im/blog/manus-skills) — 내장 데이터 소스의 스킬 변환, 팀 스킬 라이브러리 로드맵 참조

## Coze
- [Coze 플러그인 스토어 게시 문서](https://www.coze.com/open/docs/guides/store_plugin) — 플러그인 스토어 게시 프로세스 참조
- [Coze Studio GitHub](https://github.com/coze-dev/coze-studio) — 오픈소스 UI 구조, 플러그인/워크플로우/지식베이스 관리 화면 확인

## Dify
- [Dify Tools 공식 문서](https://docs.dify.ai/en/use-dify/nodes/tools) — 도구 노드 구성, 재시도/에러 핸들링 UX 참조
- [Dify Agent 문서](https://legacy-docs.dify.ai/guides/application-orchestrate/agent) — 에이전트에 도구 할당하는 UX, 빌트인 vs 커스텀 도구 선택 화면 참조
- [Dify 플러그인 개발 문서](https://legacy-docs.dify.ai/plugins/quick-start/develop-plugins/agent-strategy-plugin) — 에이전트 전략 플러그인, Tool Plugin 개발 워크플로우 참조

## Dust.tt
- [Dust Tools 관리 문서](https://docs.dust.tt/docs/tools-management) — 위험도 분류(Stake Level) UI, OAuth 인증 플로우, Space 단위 접근 제어 화면 참조
- [Dust Tools 문서](https://docs.dust.tt/docs/tools) — Spaces → Tools 메뉴, 도구 추가/인증/MCP 서버 구성 참조
- [Dust 에이전트 빌더 문서](https://docs.dust.tt/docs/quickstart-agent) — 에이전트에 도구/지식 할당하는 빌더 UI, 프리뷰 영역 참조

## Relevance AI
- [Relevance AI Tools 페이지](https://relevanceai.com/tool) — Tool Builder 캔버스, 빌트인 도구 목록, 대량 실행(Bulk Run) UI 참조
- [Relevance AI 소개 문서](https://relevanceai.com/docs/get-started/introduction) — 에이전트-도구-지식-워크포스 구조, 마켓플레이스 참조

## 공통 참조
- [agentskills.io 스펙](https://agentskills.io/specification) — 공식 스펙 전문. SKILL.md 필드, 프로그레시브 디스클로저, 밸리데이션 참조
- [Agent Skills 개요](https://agentskills.io/home) — 표준 개요, 채택 서비스 로고 목록, SDK 도구 참조
- [Anthropic 공식 블로그: Agent Skills 발표](https://thenewstack.io/agent-skills-anthropics-next-bid-to-define-ai-standards/) — 표준 공개 배경, 생태계 확장 전략 참조
- [awesome-agent-skills 리포지토리](https://github.com/skillmatic-ai/awesome-agent-skills) — 26+ 플랫폼 채택 현황, 스킬 카탈로그, 비교 가이드 참조
- [skills.sh](https://inference.sh/blog/skills/agent-skills-overview) — 150+ 스킬 컬렉션, 표준 설명 및 배포 방식 참조
