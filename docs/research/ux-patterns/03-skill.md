# 엔터프라이즈 AI 에이전트 플랫폼 — 스킬/도구/플러그인 관리 IA 심층 분석

> 리서치 일자: 2026-03-20  
> 대상: Claude (Code + Projects/Artifacts), ChatGPT (GPTs/Actions), Coze, Dify, Microsoft Copilot Studio, n8n  
> 목적: 스킬 관리 메뉴 IA 설계를 위한 벤치마크 리서치  
> 원칙: 관찰된 사실만 기록. 결론/권장안 없음.

---

## 1. Claude (Anthropic) — Claude Code 스킬 시스템

### 1-1. 스킬/도구 관리가 GNB에서 어디에 위치하는가

Claude Code는 CLI(터미널) 기반 도구이므로 전통적인 GNB가 존재하지 않는다. 스킬은 파일시스템 디렉토리 구조로 관리된다. `.claude/skills/` 디렉토리 아래에 각 스킬이 폴더 단위로 존재하며, 프로젝트 루트의 `.claude/skills/`(프로젝트 스코프) 또는 `~/.claude/skills/`(머신 스코프)에 배치된다. claude.ai 웹 인터페이스에서는 스킬 관리 메뉴가 별도로 노출되지 않으며, 시스템 프롬프트에 `<available_skills>` 블록으로 주입되어 자동으로 동작한다.

### 1-2. "내 스킬"과 "탐색/마켓" 화면의 분리 또는 통합 방식

Claude Code의 스킬 생태계는 세 계층으로 분리되어 있다:

- **내 스킬(로컬)**: `.claude/skills/` 디렉토리에 직접 작성한 SKILL.md 파일들. 사용자가 파일시스템에서 직접 관리한다.
- **공식 스킬(Anthropic 제공)**: claude.ai에서 `/mnt/skills/public/` 경로에 미리 탑재된 스킬들(docx, pdf, pptx, xlsx, frontend-design 등). 사용자에게 별도 UI로 노출되지 않고 시스템 프롬프트의 `<available_skills>` 블록에 name, description, location이 나열된다.
- **커뮤니티 스킬**: 2026년 3월 기준 GitHub의 Antigravity Awesome Skills 등 커뮤니티 저장소가 22,000+ 스타를 기록하며, `npx skills add {스킬명}` 또는 `npx antigravity-awesome-skills --claude` 명령으로 설치한다. 별도의 마켓플레이스 GUI는 존재하지 않으며, npm/GitHub 기반 배포 체계를 따른다.

웹(claude.ai)과 CLI(Claude Code) 간에 스킬 관리 통합 화면은 존재하지 않는다.

### 1-3. 스킬 목록 UI

CLI에서는 `/` 슬래시 커맨드로 스킬을 검색/호출한다. 웹 인터페이스에서는 스킬 목록이 사용자에게 직접 노출되지 않는다. 시스템 내부적으로 `<available_skills>` 블록에 name, description, location 세 필드가 나열되며, Claude가 사용자 쿼리를 해석할 때 LLM 추론으로 적절한 스킬을 선택한다. 카드, 테이블, 카테고리 분류 등의 시각적 UI는 존재하지 않는다.

### 1-4. 스킬 생성/편집 UX

스킬 생성은 선언형 파일 기반이다:

- **SKILL.md**: YAML 프론트매터(name, description, disable-model-invocation, user-invocable)와 Markdown 본문으로 구성된다. 프론트매터의 `name` 필드가 `/slash-command`가 되고, `description`이 자동 트리거 판단에 사용된다.
- **디렉토리 구조**: 각 스킬은 `SKILL.md`를 포함하는 독립 폴더이며, 보조 스크립트, 템플릿, 데이터 파일을 하위 디렉토리에 배치할 수 있다. 예: `.claude/skills/pdf/SKILL.md`, `.claude/skills/pdf/extract_text.py`.
- **생성 도구**: Anthropic 공식 문서에서 `skill-creator` 스킬을 사용한 메타 생성 패턴을 권장한다. Claude에게 "스킬을 만들어달라"고 요청하면 Claude가 SKILL.md를 생성해준다.
- **권장 크기**: SKILL.md 본문은 500줄 미만 유지를 권장. 초과 시 별도 참조 파일로 분리하는 점진적 공개(progressive disclosure) 패턴을 사용한다.

코드 기반과 선언형의 하이브리드다. SKILL.md 자체는 마크다운 선언이지만, 내부에 스크립트 실행 지시를 포함할 수 있다.

### 1-5. 에이전트에 스킬을 할당하는 UX

별도의 "할당" 단계가 없다. `.claude/skills/` 디렉토리에 스킬 파일을 배치하면 자동으로 등록된다. Claude Code는 시작 시 모든 스킬의 메타데이터(name, description)를 시스템 프롬프트에 포함시키며, SKILL.md 본문은 실제 호출 시에만 로드한다(on-demand loading). 스킬 선택은 알고리즘 라우팅이 아닌 LLM 추론으로 이루어진다. 정규식, 키워드 매칭, ML 기반 의도 분류가 아니라 Claude의 트랜스포머 포워드 패스에서 결정된다.

프론트매터에서 호출 제어가 가능하다:
- `disable-model-invocation: true` — 사용자만 `/명령`으로 호출 가능 (부작용 있는 작업용)
- `user-invocable: false` — Claude만 자동으로 호출 가능 (배경 지식용)

### 1-6. 스킬 버전 관리, 테스트/디버깅 지원 여부

- **버전 관리**: 공식 버전 관리 시스템은 없다. 커뮤니티에서 Git 기반 버전 관리를 권장하며("Treat SKILL.md like code"), SKILL.md의 변경 이력을 커밋으로 추적하는 패턴이 Best Practice로 제시된다.
- **테스트**: 별도 테스트 프레임워크는 없다. Anthropic은 "Claude A(작성자)로 스킬을 작성하고, Claude B(소비자)로 실제 태스크에 테스트하는" 2-에이전트 테스트 패턴을 공식 문서에서 권장한다.
- **디버깅**: `--add-dir` 플래그로 추가 디렉토리의 스킬을 실시간 변경 감지(live change detection)한다. 세션 재시작 없이 스킬을 수정하고 즉시 테스트할 수 있다.
- **보안 감사**: Snyk의 ToxicSkills 리서치에 따르면 테스트 대상 스킬의 36%에서 프롬프트 인젝션이 발견되었으며, 1,467개의 악성 페이로드가 생태계에서 확인되었다. Anthropic은 신뢰할 수 있는 소스의 스킬만 사용할 것을 권고한다.

### 1-7. 프로젝트/워크스페이스 단위 스킬 관리 패턴

- **프로젝트 스코프**: `.claude/skills/` 디렉토리가 프로젝트 루트에 위치하면 해당 프로젝트에서만 활성화된다.
- **머신 스코프**: `~/.claude/skills/`에 위치한 스킬은 해당 머신의 모든 프로젝트에서 사용 가능하다.
- **API 사용**: Claude API에서는 `container` 파라미터에 `skill_id`를 지정하여 코드 실행 도구와 함께 사용한다. `code-execution-2025-08-25` 베타 헤더가 필요하다.

### 1-8. 다른 기능과의 연결 지점

- **채팅 → 스킬**: 사용자 메시지를 LLM이 분석하여 자동으로 관련 스킬을 호출 (Auto-trigger)
- **슬래시 커맨드 → 스킬**: `/skill-name`으로 명시적 호출
- **시스템 프롬프트 → 스킬 메타데이터**: 시작 시 모든 스킬의 name/description가 시스템 프롬프트에 주입
- **파일시스템 → 스킬 로딩**: SKILL.md를 bash Read 도구로 동적 로딩
- **스크립트 실행 → 스킬**: 스킬 내부에서 Python/Bash 스크립트 실행 가능
- **MCP 서버 → 스킬과 공존**: MCP 서버는 새로운 도구를 추가하고, 스킬은 프롬프트를 온디맨드로 확장하며, 두 시스템이 병행 운영
- **Artifact 생성 → 스킬 결과물**: docx, pdf, pptx 등 스킬 실행 결과가 `/mnt/user-data/outputs/`에 생성되어 사용자에게 파일로 전달

---

## 2. Claude (Anthropic) — Projects + Artifacts

### 2-1. 스킬/도구 관리가 GNB에서 어디에 위치하는가

Claude Projects는 claude.ai 사이드바의 "Projects" 섹션에 위치한다. 프로젝트는 채팅, 파일, 지시문을 묶는 컨테이너이며, 도구 관리 메뉴가 아닌 "컨텍스트 관리" 단위로 동작한다. MCP 서버 연결은 Settings에서 관리되며 프로젝트 단위가 아닌 계정/워크스페이스 단위로 설정된다.

Artifacts는 대화 중 Claude가 생성하는 독립적인 결과물(코드, 문서, 앱)이며, 사이드바의 "Artifacts" 공간 또는 대화 오른쪽 패널에 표시된다. 2025년 중반부터 Artifact Catalog이 추가되어 퍼블리시된 아티팩트를 탐색할 수 있다.

### 2-2. "내 스킬"과 "탐색/마켓" 화면의 분리 또는 통합 방식

Projects에서는 "내 도구" 개념 대신 "프로젝트 지식(Knowledge)" 개념을 사용한다. 프로젝트 Instructions(시스템 프롬프트), 업로드된 Knowledge Files, 그리고 대화 기록이 컨텍스트 계층을 구성한다. MCP 연결은 별도 설정 화면에서 관리되며 프로젝트와 직접 연결되지 않는다.

Artifact Catalog(claude.ai/catalog/artifacts)은 퍼블리시된 아티팩트를 탐색하는 공개 갤러리 역할을 한다. Slack 채널 요약 도구, 브레인스토밍 도구, CSV 분석기, 프로젝트 상태 보드 등이 카테고리별로 정리되어 있다.

### 2-3. 스킬 목록 UI

Projects는 프로젝트 단위로 왼쪽 사이드바에 리스트로 표시된다. 각 프로젝트를 클릭하면 Knowledge Files, Instructions, 대화 목록이 나타난다.

Artifacts는 대화 내에서 인라인으로 생성되며, 2025년 업데이트로 전용 워크스페이스에서 관리할 수 있게 되었다. Team/Enterprise 사용자는 조직 내 공유된 아티팩트를 브라우징할 수 있다.

### 2-4. 스킬 생성/편집 UX

Projects의 컨텍스트 설정은 대화형이다. 프로젝트 생성 → Instructions 작성(자연어) → Knowledge Files 업로드 → 대화 시작의 흐름을 따른다. 코드 작성이 필요 없으며, 모든 설정이 자연어와 파일 업로드로 이루어진다.

Artifacts의 생성은 완전히 대화형이다. 사용자가 자연어로 요청하면 Claude가 코드/문서/앱을 생성하고, 인라인 편집(targeted replacement)으로 수정한다. 2025년 10월 업데이트로 전체 코드 재생성 대신 인라인 텍스트 교체가 가능해져 3-4배 빠른 업데이트가 가능해졌다.

### 2-5. 에이전트에 스킬을 할당하는 UX

Projects에서 Instructions를 작성하면 해당 프로젝트 내 모든 대화에 자동 적용된다. MCP 서버는 계정 레벨에서 연결하며, Artifact에서 MCP 도구에 접근할 때 최초 상호작용 시 승인을 요청한다.

### 2-6. 스킬 버전 관리, 테스트/디버깅 지원 여부

- Projects의 Instructions는 수동으로 편집하며 버전 기록은 없다.
- Artifacts에는 인라인 수정 기록이 대화 내에 남지만, 공식적인 버전 관리 시스템은 없다. 사용자들이 "중간 아티팩트 정리" 기능과 "더 나은 버전 컨트롤"을 요청하고 있다는 리뷰가 확인된다.
- Persistent Storage가 퍼블리시된 아티팩트에 한해 제공되며(Pro, Max, Team, Enterprise), 개발/테스트 단계에서는 스토리지 작업이 성공하지 않는다.

### 2-7. 프로젝트/워크스페이스 단위 스킬 관리 패턴

- **프로젝트 단위 격리**: 각 프로젝트의 Instructions와 Knowledge Files는 해당 프로젝트 내에서만 유효하다. ChatGPT Enterprise에서도 유사한 Project-only Memory 기능을 제공한다.
- **역할 기반 권한**: Private, View access, Edit access, Bulk email invitations 지원. 관리자가 프로젝트 가시성을 전환할 수 있다.
- **조직 내 아티팩트 공유**: Team/Enterprise 사용자 간 아티팩트를 조직 레벨에서 공유 가능하다.

### 2-8. 다른 기능과의 연결 지점

- **프로젝트 Instructions → 모든 대화**: 프로젝트 내 모든 대화에 컨텍스트로 적용
- **Knowledge Files → 대화 컨텍스트**: 업로드된 파일이 200K 토큰 컨텍스트 윈도우로 참조
- **대화 → Artifact 생성**: 대화 중 자동으로 Artifact 패널에 결과물 표시
- **Artifact → MCP 연결**: Artifact 내에서 Asana, Google Calendar, Slack 등 MCP 서비스에 접근
- **Artifact → Persistent Storage**: 퍼블리시된 아티팩트에서 키-값 스토리지 API로 세션 간 데이터 유지
- **Artifact → 공개 공유**: 링크로 공유하거나 웹사이트에 임베드 가능
- **채팅 기록 검색 → 프로젝트**: "이전에 이 주제 다룬 적 있나?" 식의 대화 기록 검색

---

## 3. ChatGPT (OpenAI) — GPTs, Actions, GPT Store

### 3-1. 스킬/도구 관리가 GNB에서 어디에 위치하는가

ChatGPT의 GPT 관리는 두 곳에서 접근된다:

- **사이드바 "Explore GPTs"**: GPT Store 진입점. 카테고리 탐색, 검색, 추천 GPT 브라우징이 가능하다.
- **chatgpt.com/gpts/mine**: 내가 만든 GPT 목록, 사용 통계(Chats 컬럼)를 확인한다.
- **Enterprise/Edu 워크스페이스**: Profile → Manage workspace → GPTs 탭에서 관리자가 워크스페이스 전체 GPT를 관리한다(`chatgpt.com/admin/gpts`).

GPTs는 독립 메뉴("Explore GPTs")로 GNB 사이드바에서 직접 접근되며, 설정 하위가 아닌 1단계 메뉴이다.

### 3-2. "내 스킬"과 "탐색/마켓" 화면의 분리 또는 통합 방식

완전히 분리되어 있다:

- **GPT Store (Explore GPTs)**: 공개된 GPT를 카테고리별로 탐색, 검색, 리더보드 확인. Featured/Trending GPT 표시.
- **My GPTs (chatgpt.com/gpts/mine)**: 내가 생성한 GPT 목록. 사용 통계, 편집, 삭제 가능.
- **Enterprise 관리 뷰**: 워크스페이스 내 모든 GPT를 테이블로 표시. 생성/업데이트 타임스탬프, 담당자, 사용 통계, 접근 권한 필터링 가능.

2026년 3월 업데이트로 "App Directory"가 도입되어, Connectors가 Apps로 통합되고 하나의 디렉토리에서 모든 도구를 관리할 수 있게 되었다. Enterprise/Edu에서는 앱이 기본 비활성이며 관리자가 RBAC으로 제어한다.

### 3-3. 스킬 목록 UI

GPT Store는 카드 기반 레이아웃이다. 각 GPT는 아이콘, 이름, 설명, 카테고리, 빌더 프로필, 별점(가능한 경우)을 표시한다. 검색과 카테고리 필터(Productivity, Education, Just for fun 등)를 지원한다.

Enterprise 관리 뷰는 테이블 기반이다. GPT 이름, 생성/업데이트 시간, 담당자, 사용 통계(채팅 수)를 컬럼으로 표시하며, Capabilities와 Access permissions 기준 필터링이 가능하다.

### 3-4. 스킬 생성/편집 UX

GPT Builder는 대화형 + 설정 패널 하이브리드다:

- **Create 탭**: GPT Builder와 자연어 대화로 GPT를 설명하면 이름, 프로필 이미지, 대화 스타터를 자동 생성한다.
- **Configure 탭**: 직접 설정 — Instructions(상세 지시문), Knowledge(파일 업로드, 최대 20개), Capabilities(Web Search, Canvas, Image Generation, Code Interpreter), Actions(외부 API 연결).
- **Preview 패널**: 우측에서 실시간 테스트.
- **Actions 설정**: OpenAPI 스펙을 붙여넣어 외부 API를 연결한다. 인증 방식(None, API Key, OAuth) 선택. 공개 공유 시 Privacy Policy URL 필수.
- **모델 선택**: GPT-5.2 시리즈 포함 전체 모델 선택 가능 (2026년 1월부터). Custom Actions가 있는 GPT는 GPT-4o, GPT-4.1, GPT-5.2 계열 사용.

GPT 생성/편집은 웹(chatgpt.com)에서만 가능하며, 모바일 앱에서는 불가하다.

### 3-5. 에이전트에 스킬을 할당하는 UX

GPT 자체가 "에이전트"이므로, GPT 생성 시 Capabilities와 Actions를 설정하는 것이 "스킬 할당"에 해당한다. 대화 중 `@`를 입력하면 기존 GPT를 현재 대화에 불러올 수 있으며, 이때 대화 컨텍스트를 유지한다. GPT는 저장된 Memory, Custom Instructions, 이전 대화를 사용하지 않는다.

### 3-6. 스킬 버전 관리, 테스트/디버깅 지원 여부

- **버전 관리**: "Update" 버튼으로 새 버전을 생성한다. 이전 버전으로의 롤백은 공식적으로 지원되지 않는다.
- **테스트**: GPT Builder 내 Preview 패널에서 실시간 테스트 가능.
- **모델 전환**: 2026년 2월 13일부터 레거시 모델(GPT-4o, GPT-4.1, o4-mini, GPT-5 Instant/Thinking) 은퇴 예정. GPT가 자동으로 가장 가까운 GPT-5.2 모델로 마이그레이션된다.
- **관리자 감사**: Enterprise 워크스페이스에서 GPT별 사용 통계, 접근 권한, 소유권 변경 가능.

### 3-7. 프로젝트/워크스페이스 단위 스킬 관리 패턴

- **GPT 공유 레벨**: Private, 특정 사용자/그룹(최대 100명), 워크스페이스 전체, 링크 공유, GPT Store 공개.
- **권한**: Can chat, Can view settings(복제/설정 보기), Can edit(직접 수정).
- **워크스페이스 제어**: 관리자가 공유 범위, Action 도메인 제한, 서드파티 GPT 접근 여부를 설정.
- **Projects(ChatGPT)**: 파일, 채팅, 아티팩트를 프로젝트 단위로 묶는 기능. Project-only Memory로 프로젝트 간 컨텍스트 오염 방지(Enterprise/Business).

### 3-8. 다른 기능과의 연결 지점

- **채팅 → GPT 호출**: `@GPT이름`으로 대화 중 GPT 전환
- **GPT → Actions**: OpenAPI 기반 외부 API 호출
- **GPT → Knowledge**: 업로드된 파일 참조
- **GPT → Capabilities**: Web Search, Code Interpreter, Image Generation, Canvas 연결
- **GPT Store → 탐색/설치**: 공개 GPT 발견 및 즉시 사용
- **Enterprise Admin → GPT 관리**: 소유권 변경, 접근 제어, 사용 통계
- **App Directory → 통합 관리**: Connectors + Apps를 하나의 디렉토리에서 관리 (2026년 3월~)
- **Projects → GPT와 별개**: Projects는 채팅 컨텍스트 관리, GPTs는 도구/능력 커스터마이징으로 역할 분리

---

## 4. Coze (ByteDance)

### 4-1. 스킬/도구 관리가 GNB에서 어디에 위치하는가

Coze의 네비게이션은 2024년 10월 리뉴얼 이후 다음과 같이 구성되어 있다:

- **홈페이지**: 즐겨찾기 에이전트, 최근 대화.
- **워크스페이스**: 에이전트, 플러그인, 워크플로우, 지식 베이스 등 리소스 관리. 플러그인은 워크스페이스 내 "리소스 라이브러리"에 위치한다.
- **스토어**: Bot Store(공개 봇 탐색)와 Plugin Store(플러그인 탐색/게시)가 별도로 존재한다.

플러그인 관리는 에이전트 빌더 내부와 워크스페이스 리소스 라이브러리 양쪽에서 접근 가능하다.

### 4-2. "내 스킬"과 "탐색/마켓" 화면의 분리 또는 통합 방식

분리되어 있다:

- **워크스페이스 리소스 라이브러리**: 내가 만든/설치한 플러그인 관리. 플러그인을 게시하면 버전이 생성된다.
- **Plugin Store**: 커뮤니티가 게시한 플러그인을 탐색하고 내 봇에 추가. "Publish plugins to Coze store" 경로를 통해 자신의 플러그인을 스토어에 공개할 수 있다.
- **에이전트 빌더 내부**: 봇 편집 화면에서 "Add Plugin" 버튼으로 스토어 플러그인 또는 커스텀 플러그인을 직접 추가.

### 4-3. 스킬 목록 UI

플러그인 스토어는 카드 기반 브라우징을 제공하며, 60개 이상의 빌트인 플러그인이 카테고리별로 정리되어 있다. 에이전트 빌더 내부에서는 추가된 플러그인이 리스트로 표시된다. 워크스페이스 리소스 라이브러리에서는 플러그인, 워크플로우, 지식 베이스, 변수 등을 통합 관리한다.

### 4-4. 스킬 생성/편집 UX

Coze는 다양한 플러그인 생성 방법을 제공한다:

- **API 기반 생성**: 외부 API의 URL을 붙여넣고, 헤더/인증/HTTP 메서드를 설정하여 플러그인 생성.
- **JSON/YAML 임포트**: 기존 API 서비스의 OpenAPI 스펙 파일을 임포트.
- **Coze IDE**: 내장 IDE에서 코드를 직접 작성하여 플러그인 개발.
- **Code Parser**: 코드 분석기를 사용한 플러그인 생성.
- **OAuth/OIDC 플러그인**: 인증이 필요한 서비스를 위한 전용 생성 흐름.
- **디버그 콘솔**: 플러그인 생성 후 API 연결을 즉시 테스트하는 디버그 환경 제공.

워크플로우 내에서 플러그인 노드를 드래그앤드롭으로 배치하여 비주얼 에디터에서 조합할 수 있다.

### 4-5. 에이전트에 스킬을 할당하는 UX

봇 빌더 화면에서 "Add Plugin"을 클릭하여 스토어 또는 커스텀 플러그인을 선택한다. 봇에 연결된 플러그인은 항상 최신 버전을 자동으로 참조한다. 반면 워크플로우(앱) 내의 플러그인 노드는 특정 버전에 고정되며, 새 버전으로 업그레이드하려면 수동으로 진행해야 한다.

### 4-6. 스킬 버전 관리, 테스트/디버깅 지원 여부

- **버전 관리**: 플러그인 게시 시 버전 번호와 설명을 입력한다. 게시 이력 페이지에서 버전 리스트(버전 번호, 설명, 게시 시간)를 확인할 수 있다. 다만, 이전 버전의 상세 설정은 조회할 수 없다.
- **버전 참조 정책**: 에이전트는 항상 최신 버전을 참조. 워크플로우 앱은 특정 버전에 고정. 이전 버전을 선택하여 사용할 수는 없으며, 항상 최신 버전으로 업그레이드된다.
- **테스트**: 디버그 콘솔에서 API 연결 테스트. 봇 빌더의 Preview & Debug 모드에서 봇 전체 테스트.
- **워크플로우 버전**: 워크플로우도 별도 버전 관리가 가능하다.

### 4-7. 프로젝트/워크스페이스 단위 스킬 관리 패턴

- **워크스페이스**: 플러그인, 워크플로우, 지식 베이스, 변수 등을 워크스페이스 단위로 관리한다.
- **워크스페이스 멤버 관리**: 역할 할당, 초대, 에이전트 마이그레이션 지원.
- **리소스 라이브러리**: 워크스페이스 내에서 플러그인, 지식 베이스, 데이터베이스, 변수를 통합 관리.
- **앱 버전 관리**: 앱(워크플로우) 단위의 버전 관리가 별도로 존재한다.

### 4-8. 다른 기능과의 연결 지점

- **봇 빌더 → 플러그인 추가**: 봇 편집 화면에서 직접 플러그인 연결
- **워크플로우 → 플러그인 노드**: 비주얼 워크플로우에서 플러그인을 노드로 배치
- **워크플로우 → 지식 베이스**: 워크플로우에서 지식 베이스 참조
- **봇 → 스케줄 작업**: 봇에 예약 작업(Scheduled Tasks)을 설정하여 플러그인을 주기적으로 실행
- **봇 → 멀티 에이전트**: 여러 봇을 조합하여 Multi-Agent Mode로 협업
- **스토어 → 봇/플러그인 배포**: Bot Store와 Plugin Store에 게시
- **멀티 플랫폼 → 배포**: Discord, Telegram, Slack, LINE, Messenger, Instagram 등에 배포
- **데이터베이스 → 장기 기억**: 봇이 데이터베이스를 참조하여 사용자 선호도 기억

---

## 5. Dify

### 5-1. 스킬/도구 관리가 GNB에서 어디에 위치하는가

Dify의 워크스페이스 네비게이션에서 "Tools"가 독립 메뉴로 존재한다. 2025년 2월 v1.0.0부터 모든 모델과 도구가 Plugin 시스템으로 마이그레이션되었으며, 별도의 Marketplace(marketplace.dify.ai)가 출시되었다. 좌측 네비게이션에는 Studio(앱 빌더), Knowledge, Tools, Plugins 등이 배치되어 있다. `Cmd/Ctrl+K` 단축키로 앱, 지식 베이스, 플러그인, 워크플로우 노드를 빠르게 검색할 수 있다.

### 5-2. "내 스킬"과 "탐색/마켓" 화면의 분리 또는 통합 방식

분리되어 있다:

- **Tools 페이지(워크스페이스 내)**: 인증 자격증명 관리, 커스텀 도구 임포트, MCP 서버 설정, 워크플로우를 도구로 게시하는 기능을 제공한다.
- **Dify Marketplace (marketplace.dify.ai)**: 외부 독립 사이트로, Models, Tools, Data Sources, Agent Strategies, Extensions, Bundles 카테고리로 분류된 플러그인을 탐색한다. 120개 이상의 플러그인이 등록되어 있다(v1.0.0 기준).
- **Plugins 관리**: 워크스페이스 내에서 설치된 플러그인을 관리한다.

### 5-3. 스킬 목록 UI

Marketplace는 카드 기반 레이아웃으로, 태그 필터(All Tags)와 타입 필터(Models, Tools, Data Sources, Agent Strategies, Extensions, Bundles)를 지원한다. 워크스페이스 내 Tools 페이지는 설치된 도구를 목록으로 표시하며, 각 도구의 인증 상태를 확인할 수 있다.

### 5-4. 스킬 생성/편집 UX

- **빌트인 도구**: Dify가 유지보수하는 사전 구축 통합(Google Search, 날씨 API 등). 최소한의 설정(인증 키 입력)으로 사용 가능.
- **커스텀 도구(OpenAPI Import)**: OpenAPI/Swagger 스펙을 임포트하여 도구로 등록. 한 번 설정하면 여러 워크플로우에서 재사용 가능.
- **워크플로우를 도구로 게시**: 복잡한 멀티노드 워크플로우를 단일 노드 도구로 변환하여 다른 앱에서 재사용.
- **플러그인 개발**: Python 기반 플러그인 개발 도구 제공. `dify-tools-worker`로 Cloudflare Workers에 빠르게 배포 가능. 원격 디버깅이 IDE와 통합. `.difypkg` 패키지로 배포.
- **MCP 서버 연결**: HTTP 기반 MCP 서비스(protocol 2025-03-26)를 Tools에서 직접 설정.

### 5-5. 에이전트에 스킬을 할당하는 UX

Studio에서 앱(Chatbot, Agent, Workflow, Chatflow)을 생성할 때 "Add Tools" 단계에서 사용 가능한 도구를 선택한다. 워크플로우 캔버스에서 Tools 노드를 드래그앤드롭으로 배치하고, 입력/출력 파라미터를 설정한다. Agent 앱에서는 에이전트가 자율적으로 적절한 도구를 선택하여 호출한다.

### 5-6. 스킬 버전 관리, 테스트/디버깅 지원 여부

- **플러그인 버전**: Marketplace 게시 시 `.difypkg` 파일에 버전이 포함된다. GitHub PR 기반 리뷰 프로세스를 거쳐 게시.
- **워크플로우 노드 디버깅**: 각 노드의 입출력을 시각적으로 확인할 수 있다. 에러 핸들링으로 최대 10회 자동 재시도(최대 5000ms 간격) 설정 가능.
- **코드 노드 자동 수정**: v1.8.0에서 Code 노드 실패 시 AI가 수정 버전을 자동 생성하며, 버전 비교/복원 가능.
- **프롬프트 최적화**: LLM 노드의 프롬프트를 AI가 자동 최적화하는 기능 추가.
- **원격 디버깅**: 플러그인 개발자가 Dify SaaS에 연결하여 로컬 환경에서 플러그인을 테스트.
- **로그/분석**: 대화 로그, 어노테이션, 사용 데이터 분석 기능 내장.

### 5-7. 프로젝트/워크스페이스 단위 스킬 관리 패턴

- **워크스페이스 단위**: 모든 도구, 플러그인, 지식 베이스가 워크스페이스에 귀속된다. 워크스페이스 멤버가 공유하여 사용.
- **플러그인 격리**: 각 Marketplace 플러그인은 격리된 환경에서 실행되며, 명확한 권한이 정의된다.
- **워크스페이스 + 플러그인 레벨 저장소**: 퍼시스턴트 스토리지가 플러그인 단위와 워크스페이스 단위로 제공된다.
- **멤버 관리**: 초대, 역할 관리, 구독 관리 기능.

### 5-8. 다른 기능과의 연결 지점

- **Studio → Tools 노드**: 워크플로우/챗플로우 캔버스에서 도구를 노드로 사용
- **Agent 노드 → 도구 자동 선택**: Agent Strategy 플러그인이 도구 선택 로직을 정의 (ReAct, Chain-of-Thoughts, Tree-of-Thoughts, Function Call)
- **Knowledge → RAG 파이프라인**: 지식 베이스가 워크플로우와 연결되어 검색 증강 생성
- **Workflow → Tool로 게시**: 워크플로우를 도구로 변환하여 다른 앱에서 재사용
- **Dify → MCP 서버로 게시**: Dify 워크플로우/에이전트를 MCP 서버로 노출하여 외부 클라이언트에서 접근
- **Triggers → 자동 실행**: 스케줄, 이벤트 기반 트리거로 워크플로우 자동 실행
- **OAuth → 서드파티 인증**: Gmail, GitHub, Notion 등과의 OAuth 연결
- **Marketplace → 플러그인 배포**: 커뮤니티 플러그인 탐색, 설치, 배포

---

## 6. Microsoft Copilot Studio

### 6-1. 스킬/도구 관리가 GNB에서 어디에 위치하는가

Copilot Studio 2025년 3월 업데이트부터 "Tools"가 좌측 네비게이션에 독립 메뉴로 추가되었다. 이전에는 도구가 에이전트 빌더 내부에서만 접근 가능했으나, 이제 애플리케이션 레벨에서 도구를 생성, 관리, 할당할 수 있다. 좌측 네비게이션 구성은 Agents, Tools, Knowledge, Analytics 등이다.

에이전트 빌더 내부에서도 Tools 탭이 존재하여, 에이전트별로 도구를 추가/관리한다.

### 6-2. "내 스킬"과 "탐색/마켓" 화면의 분리 또는 통합 방식

통합 경향이다:

- **Tools 탭 (에이전트 빌더 내)**: "Add a tool" 버튼으로 Connector, MCP, Power Automate Flow, Custom Connector를 한 곳에서 탐색하고 추가. 2025년 6월 업데이트로 모든 도구를 "하나의 통합 뷰"에서 관리.
- **1,400+ Connectors**: Power Platform 커넥터 마켓플레이스와 통합. Prebuilt 커넥터(Office 365, SharePoint, Dynamics 365, Salesforce, Twitter 등)와 Custom Connector를 동일한 경로에서 탐색.
- **MCP 서버**: 퍼블릭 프리뷰로 MCP 서버 URL을 입력하면 자동으로 도구가 등록된다. 커넥터 마켓플레이스에 MCP 호환 커넥터도 포함.
- **Action Groups**: Outlook, SharePoint 등의 커넥터에서 "manage emails", "manage files" 같은 관련 도구 세트를 한 번에 추가.

### 6-3. 스킬 목록 UI

에이전트의 Tools 탭은 설치된 도구를 통합 뷰로 표시한다. Connector actions, MCP 서버, Power Automate flows, Custom connectors가 동일한 목록에 나타난다. 검색 기능으로 에이전트의 knowledge, topics, tools, skills, entities를 즉시 검색할 수 있다(키보드 단축키 지원).

커넥터 마켓플레이스는 카테고리와 검색으로 탐색한다. 40개 이상의 Copilot Connectors가 GA 또는 Public Preview 상태이다.

### 6-4. 스킬 생성/편집 UX

- **Prompts (도구)**: Copilot Studio 내에서 재사용 가능한 프롬프트를 도구로 생성. GPT 모델에 특정 작업(요약, 분류, 추출 등)을 지시하는 모듈러 프롬프트.
- **Agent Flows**: Power Automate 기반의 자동화 흐름을 에이전트 내에서 직접 생성. Prebuilt 또는 Custom Connector를 사용. 에이전트 간 재사용 가능.
- **Topics**: Low-code 오서링 캔버스에서 대화 흐름을 설계. 트리거 구문, 노드 기반 대화 분기, 변수, 엔티티 사용.
- **MCP 연결**: MCP 서버 URL을 입력하면 자동으로 actions와 knowledge가 가져와지며, 백엔드 업데이트와 동기화.
- **Custom Connector**: Power Apps 포탈에서 커스텀 커넥터를 생성하여 에이전트에 추가.
- **Generative Orchestration**: 수동으로 트리거 구문을 정의하지 않아도 AI가 자동으로 적절한 플러그인/도구를 선택하여 대화를 생성.

### 6-5. 에이전트에 스킬을 할당하는 UX

에이전트 빌더에서:
1. Agents 목록에서 에이전트 선택
2. Tools 탭 → Add a tool → Connector, MCP, Flow 등에서 선택
3. 연결 상세 정보 설정 (인증 등)
4. Topics 탭에서 특정 토픽에 도구를 노드로 삽입 가능

Generative Orchestration 모드에서는 에이전트에 도구를 등록해두면 AI가 자동으로 적절한 도구를 선택하여 사용한다.

### 6-6. 스킬 버전 관리, 테스트/디버깅 지원 여부

- **Component Collections**: Topics, Knowledge, Actions, Entities를 컬렉션으로 패키징하여 환경 간 이동(ALM). Solution Explorer에서 Export/Import.
- **테스트**: 에이전트 빌더 내에서 변경사항을 배포 없이 즉시 테스트.
- **Test Sets**: 여러 에이전트 버전을 나란히 비교하여 개선사항 확인, 회귀 감지.
- **Analytics**: 미응답 쿼리 추적, 생성 AI 응답 품질 분석, 지식 소스 분석.
- **디버깅**: 도구 에러 메시지 개선, IntelliSense 통합, flows/connector actions/MCPs 문제 식별 및 해결.
- **VS Code 확장**: Copilot Studio VS Code Extension으로 IDE에서 에이전트 빌드/편집/관리.

### 6-7. 프로젝트/워크스페이스 단위 스킬 관리 패턴

- **환경(Environment)**: Power Platform 환경 단위로 에이전트와 도구를 관리.
- **솔루션 기반 ALM**: Component Collections로 에이전트 컴포넌트를 환경 간 이동.
- **Microsoft Entra Agent ID**: 에이전트에 자동으로 ID를 할당하여 보안/관리 강화.
- **PPAC(Power Platform Admin Center)**: 관리자가 에이전트 솔루션을 대규모로 관리, 모니터링.
- **RBAC**: 역할 기반 접근 제어로 에이전트/도구별 권한 관리.

### 6-8. 다른 기능과의 연결 지점

- **Topics → Connectors**: 토픽 내에서 커넥터를 노드로 삽입
- **Generative Orchestration → 도구 자동 선택**: AI가 런타임에 적절한 도구를 자동 연결
- **Agent Flows → Power Automate**: 자동화 흐름을 에이전트에서 직접 실행
- **MCP → 외부 시스템**: MCP 프로토콜로 외부 API/데이터 소스 연결
- **Autonomous Triggers → 이벤트 반응**: 특정 이벤트 발생 시 에이전트가 자동으로 도구를 실행
- **Microsoft 365 Copilot → 에이전트 확장**: Teams, Word, Excel, PowerPoint에서 에이전트 표면화
- **Agent Builder → Copilot Studio 복사**: M365 Copilot Agent Builder에서 Copilot Studio로 에이전트 이전
- **Analytics → 개선 루프**: 미응답 쿼리 분석, 지식 갭 식별, 도구 성능 모니터링
- **Computer Use → UI 자동화**: API/MCP가 없는 앱에서 가상 마우스/키보드로 도구 실행
- **Microsoft Defender → 보안**: 실시간 보호, Entra Agent ID 기반 거버넌스

---

## 7. n8n

### 7-1. 스킬/도구 관리가 GNB에서 어디에 위치하는가

n8n에서 "노드"가 스킬/도구에 해당한다. 노드 관리는 두 곳에서 이루어진다:

- **워크플로우 캔버스 내 Nodes Panel**: `+` 버튼 또는 `N` 키로 노드 패널을 열어 빌트인 노드를 검색/추가한다. "Actions in an App" 카테고리로 서비스별 노드를 탐색.
- **Settings > Community Nodes**: 커뮤니티 노드 패키지의 설치/제거를 관리한다. 인스턴스 Owner/Admin만 접근 가능.

독립적인 "도구 관리" 메뉴가 아닌, 워크플로우 편집 맥락에서 노드를 검색/추가하고, 설정에서 커뮤니티 노드를 관리하는 구조이다.

### 7-2. "내 스킬"과 "탐색/마켓" 화면의 분리 또는 통합 방식

통합 탐색이다:

- **Nodes Panel**: 빌트인 노드와 설치된 커뮤니티 노드가 동일한 검색 결과에 나타난다. 커뮤니티 노드는 Package 아이콘으로 구분된다.
- **"More from the community" 섹션**: 노드 패널 하단에 매칭되는 Verified Community Node가 표시되어, 검색 맥락에서 바로 설치 가능.
- **npm Registry**: 커뮤니티 노드는 npm 패키지로 배포되며, n8n 내 GUI 또는 CLI로 설치.
- **Creator Portal**: 커뮤니티 노드 개발자가 검증 제출하는 별도 포탈.

### 7-3. 스킬 목록 UI

Nodes Panel은 카테고리 분류(Actions in an App, Triggers, Core Nodes)와 검색으로 구성된다. 각 노드를 선택하면 지원되는 Actions가 상세 뷰로 표시된다. 커뮤니티 노드는 Package 아이콘으로 표시되며, 동일 이름의 노드가 있을 수 있다.

Settings > Community Nodes에서는 설치된 패키지 목록이 표시되며, 각 패키지의 Options에서 Uninstall을 선택한다.

### 7-4. 스킬 생성/편집 UX

- **빌트인 노드 사용**: 노드 패널에서 선택 → 캔버스에 배치 → 파라미터 설정 (폼 기반 UI).
- **HTTP Request 노드**: 빌트인 노드가 없는 서비스를 위해 범용 HTTP 요청 노드 제공. Credential-only 노드로 인증만 설정하고 HTTP Request에서 사용.
- **커스텀 노드 개발**: `n8n-node` CLI 도구로 스캐폴딩, TypeScript 기반 개발, npm에 배포. `n8n-nodes-*` 또는 `@<scope>/n8n-nodes-*` 네이밍 규칙.
- **Verified 노드 제출**: Creator Portal에서 제출 → n8n 리뷰 → 노드 패널에 표시. 런타임 의존성 불허, UX 가이드라인 준수 필수. 2026년 5월 1일부터 GitHub Action + provenance statement 의무화.
- **Credential 관리**: Settings에서 서비스별 인증 정보를 중앙 관리. 암호화 저장.

### 7-5. 에이전트에 스킬을 할당하는 UX

n8n에서는 "에이전트"가 아닌 "워크플로우"에 노드를 배치한다. 캔버스에서 노드를 드래그앤드롭하고, 연결선으로 데이터 흐름을 정의한다. AI Agent 워크플로우에서는 Tool 노드를 AI Agent 노드에 연결하여 에이전트가 사용할 도구를 지정한다. MCP Client 커뮤니티 노드를 AI Agent의 Tool로 사용하려면 `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true` 환경변수 설정이 필요하다.

### 7-6. 스킬 버전 관리, 테스트/디버깅 지원 여부

- **워크플로우 버전**: 워크플로우 실행 기록과 Export/Import 지원. 커뮤니티에서 Git 기반 버전 관리를 사용.
- **노드 패키지 버전**: npm 패키지 버저닝을 따름. Settings > Community Nodes에서 업데이트.
- **테스트**: 워크플로우 캔버스에서 노드별 실행 및 결과 확인. 각 노드의 입출력 데이터를 시각적으로 검사.
- **디버깅**: 실행 기록에서 각 단계의 데이터를 확인. 에러 발생 시 해당 노드에 빨간색 표시.
- **Credential 마이그레이션**: 서버 이전 시 각 노드를 열어 인증 정보를 업데이트해야 하는 수동 프로세스가 알려진 불편 사항이다.

### 7-7. 프로젝트/워크스페이스 단위 스킬 관리 패턴

- **인스턴스 단위**: 커뮤니티 노드는 n8n 인스턴스 레벨에서 설치/관리. Owner/Admin만 설치 가능, 모든 멤버가 사용 가능.
- **n8n Cloud vs Self-hosted**: Unverified 커뮤니티 노드는 Self-hosted에서만 설치 가능. Cloud에서는 Verified 노드만 지원.
- **Credential 공유**: 인스턴스 내 Credential을 워크플로우에서 공유하되, Export 시 민감 정보가 복호화된 상태로 포함되므로 주의.

### 7-8. 다른 기능과의 연결 지점

- **워크플로우 캔버스 → 노드 배치**: 드래그앤드롭으로 도구 연결
- **Trigger 노드 → 워크플로우 시작**: Webhook, 스케줄, 이벤트 기반 트리거
- **AI Agent 노드 → Tool 노드**: AI 에이전트가 사용할 도구를 연결
- **Credential → 노드 인증**: 중앙 관리된 인증 정보를 노드에서 참조
- **HTTP Request → 범용 API**: 빌트인 노드 없는 서비스를 HTTP로 연결
- **Community Node → npm Registry**: npm 패키지로 배포/설치
- **Creator Portal → 검증 제출**: 커뮤니티 노드 품질 관리
- **Environment Variables → 실행 설정**: MCP 서버 API 키 등을 환경변수로 전달

---

## 시각 자료 모음

### Claude (Code + Projects/Artifacts)

- [Claude Code Skills 공식 문서](https://code.claude.com/docs/en/skills) — SKILL.md 구조, 프론트매터 설정, 디렉토리 구조 등 스킬 시스템의 공식 레퍼런스
- [Agent Skills API 문서](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) — API에서 스킬을 사용하는 방법, 3단계 로딩 아키텍처(메타데이터 → SKILL.md → 참조 파일)
- [Claude Code 스킬 역공학 분석](https://mikhail.io/2025/10/claude-code-skills/) — 실제 세션에서 캡처된 Skill 도구 정의, 호출 패턴, available_skills 블록 구조
- [스킬 아키텍처 딥다이브](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/) — 메타-도구 아키텍처, LLM 기반 라우팅, 컨텍스트 인젝션 메커니즘 상세 분석
- [Artifact Catalog](https://claude.ai/catalog/artifacts) — 퍼블리시된 아티팩트 갤러리의 실제 화면 구성과 카테고리 분류 확인용
- [Anthropic Artifacts 앱 빌딩 업데이트 (InfoQ)](https://www.infoq.com/news/2025/06/anthropic-artifacts-app/) — Artifacts 전용 워크스페이스, AI-powered 앱 빌딩 기능의 구현 방식

### ChatGPT (GPTs/Actions/GPT Store)

- [GPTs 공식 헬프센터](https://help.openai.com/en/articles/8554397-creating-a-gpt) — GPT Builder의 Create/Configure 탭, Preview 패널, 공유 설정 화면
- [GPT Store 진입 (Explore GPTs)](https://help.openai.com/en/articles/8798620-gpts-chatgpt-business-version) — GPT Store 접근 경로, 검색, 카테고리 탐색 UX
- [Enterprise GPT 관리](https://help.openai.com/en/articles/8555535-gpts-chatgpt-enterprise-version) — Admin > GPTs 탭의 테이블 뷰, 접근 제어, 워크스페이스 설정
- [GPT 공유/게시](https://help.openai.com/en/articles/8798878-building-and-publishing-a-gpt) — 공유 레벨(Private/Link/Store), Builder Profile, 권한 설정 화면
- [App Directory 업데이트 (Release Notes)](https://help.openai.com/en/articles/10128477-chatgpt-enterprise-edu-release-notes) — Connectors가 Apps로 통합된 App Directory의 새 화면

### Coze

- [Coze 공식 문서 (전체)](https://docs.coze.com/) — 홈페이지 구조, 워크스페이스, 스토어, 에이전트 빌더의 IA 개요
- [플러그인 버전 관리](https://docs.coze.com/guides/plugin_version) — 플러그인 게시 이력, 버전 번호, 에이전트 vs 워크플로우의 버전 참조 차이
- [Plugin Store 게시](https://www.coze.com/docs/guides/store_plugin?_lang=en) — 플러그인 스토어 게시 흐름
- [플러그인 생성 튜토리얼 (HackerNoon)](https://hackernoon.com/how-to-create-plugins-from-scratch-in-coze-coingecko) — API 기반 플러그인 생성 과정의 스텝바이스텝 화면 캡처
- [Coze 종합 튜토리얼 영상 요약](https://www.yeschat.ai/blog-Complete-Coze-tutorial-Building-an-AI-chatbot-from-scratch-29443) — Bot Store, 플러그인 추가, 워크플로우 설정, 데이터베이스 등 전체 화면 구성 확인

### Dify

- [Dify Marketplace](https://marketplace.dify.ai/) — 실제 마켓플레이스 화면. Models/Tools/Data Sources 필터, 카드 레이아웃
- [Dify v1.0.0 플러그인 에코시스템 블로그](https://dify.ai/blog/dify-v1-0-building-a-vibrant-plugin-ecosystem) — 플러그인 아키텍처 다이어그램, Marketplace UI, 플러그인 카테고리
- [Dify Plugins 소개 블로그](https://dify.ai/blog/introducing-dify-plugins) — 5개 플러그인 타입(Models, Tools, Agent Strategies, Extensions, Bundles) 설명과 UI
- [Tool Configuration 문서](https://docs.dify.ai/guides/tools/tool-configuration) — Tools 페이지의 설정 화면, OpenAPI import, MCP 서버 설정
- [2025 Summer Highlights](https://dify.ai/blog/2025-dify-summer-highlights) — OAuth, Multi-credential, Cmd+K 검색, 코드 자동 수정 등 최신 UI 업데이트
- [Dify 공식 플러그인 GitHub](https://github.com/langgenius/dify-official-plugins) — 플러그인 디렉토리 구조, 타입별 분류

### Microsoft Copilot Studio

- [What's New March 2025](https://www.microsoft.com/en-us/microsoft-copilot/blog/copilot-studio/whats-new-in-copilot-studio-march-2025/) — Tools 좌측 네비게이션 신설, MCP 연결, Autonomous Agents 화면
- [What's New June 2025](https://www.microsoft.com/en-us/microsoft-copilot/blog/copilot-studio/whats-new-in-copilot-studio-june-2025/) — 통합 Tools 탭, in-chat SSO, Knowledge 개선 화면
- [What's New September 2025](https://www.microsoft.com/en-us/microsoft-copilot/blog/copilot-studio/whats-new-in-copilot-studio-september-2025/) — Component Collections, MCP 리소스 지원, Computer Use 화면
- [Connectors 사용 문서](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-connectors) — 에이전트 빌더 내 커넥터 추가 화면, Topics에서 커넥터 노드 삽입
- [에이전트 확장 개요](https://learn.microsoft.com/en-us/microsoft-copilot-studio/copilot-connectors-in-copilot-studio) — Tools, Knowledge, Connectors의 관계도

### n8n

- [n8n Integrations 문서](https://docs.n8n.io/integrations/) — 노드 유형 분류(빌트인, 트리거, 커뮤니티, Credential-only), HTTP Request 노드
- [Verified Community Node 설치](https://docs.n8n.io/integrations/community-nodes/installation/verified-install/) — 노드 패널의 "More from the community" 섹션, 설치 흐름
- [Community Node 빌드 가이드](https://docs.n8n.io/integrations/community-nodes/build-community-nodes/) — npm 기반 배포, Creator Portal 제출, 검증 프로세스
- [Settings > Community Nodes](https://docs.n8n.io/integrations/community-nodes/installation/) — GUI 기반 설치/제거 화면
- [n8n Integration Node Reference (DeepWiki)](https://deepwiki.com/n8n-io/n8n-docs/3.4-integration-node-reference) — 노드 아키텍처 다이어그램, 카테고리 계층, 실행 라이프사이클
