# KonaI-Agent 심층 리서치 프롬프트 세트

> **목적**: 엔터프라이즈 AI 에이전트 대시보드(KonaI-Agent)에 추가할 화면/기능을 도출하기 위한 병렬 리서치
> **실행 방법**: 각 리서치를 별도 Claude Web 대화에서 병렬 실행
> **산출물 형식**: 각 리서치 결과를 마크다운으로 받아서 통합 분석에 활용

---

## 리서치 전략 개요

### 왜 6개 관점인가?

단순 gap-analysis는 "현재 없는 것"만 보여줍니다. 하지만 진짜 필요한 건 "왜 필요한지"와 "어떻게 만들어야 하는지"입니다. 이 6개 관점은 서로 다른 렌즈로 같은 질문을 봅니다:

```
[R1] 엔터프라이즈 AI 플랫폼 ──┐
[R2] AI 네이티브 제품 ──────────┼── "시장이 뭘 만들고 있나?"
[R3] 에이전트 옵저버빌리티 ────┘
                                    ↕ 교차 검증
[R4] 거버넌스 & 보안 ──────────┐
[R5] 에이전틱 워크플로우 UX ────┼── "사용자가 뭘 기대하나?"
[R6] 내부 Gap 심층 분석 ────────┘
```

### 실행 순서 및 의존성

```
Phase 1 (병렬, 즉시 시작):
  R1, R2, R3, R4, R5 → 각각 독립 실행

Phase 2 (Phase 1 완료 후):
  R6 → R1~R5 결과를 입력으로 받아 내부 Gap과 교차 분석

Phase 3 (통합):
  모든 결과를 종합하여 최종 화면/기능 리스트 도출 (Cowork에서 수행)
```

---

## R1. 엔터프라이즈 AI 플랫폼 벤치마크

### 프롬프트

```
당신은 엔터프라이즈 AI 플랫폼 UX 전문 리서처입니다.

## 배경
우리는 "KonaI-Agent"라는 엔터프라이즈 AI 에이전트 대시보드를 개발하고 있습니다.
현재 구현된 핵심 기능:
- 채팅 인터페이스 (일반 + 에이전트)
- 멀티에이전트 오케스트레이션 UI
- 위젯 기반 대시보드 (Liveboard)
- 관리자 패널 (사용자/권한/시스템 설정)
- 에이전트 시나리오 (PPT 생성, 분석)
- 프롬프트 관리, 지식베이스 관리
- 사용량 모니터링
- 에이전트 마켓플레이스

현재 미구현이지만 추적 중인 주요 항목:
- 스트리밍 타이핑 애니메이션
- 에이전트 사고 과정 표시 (Thinking/Reasoning)
- 병렬 실행 뷰
- 에러 & 재시도 UI
- 에이전트 실행 트레이스 뷰
- 모델별 비용 분석
- 통합 관리 (Integration Management)
- 비주얼 워크플로우 빌더
- 샌드박스/프리뷰 모드

## 리서치 대상 제품
다음 엔터프라이즈 AI 플랫폼들을 심층 분석해주세요:

1. **Microsoft Copilot Studio** (2025-2026 최신 버전)
2. **Salesforce Einstein / Agentforce**
3. **ServiceNow Now Assist / AI Agents**
4. **IBM watsonx Orchestrate**
5. **Google Vertex AI Agent Builder**
6. **AWS Bedrock Agents Console**

## 분석 프레임워크

각 제품에 대해 다음을 분석해주세요:

### A. 화면 인벤토리
각 제품이 제공하는 **모든 화면/뷰**를 나열하고, 각 화면의:
- 핵심 목적 (1줄)
- 주요 기능 요소 3-5개
- 대상 사용자 (개발자/관리자/비즈니스사용자/운영자)
- KonaI-Agent에 해당 화면이 있는지 여부 (있음/부분/없음)

### B. 차별화 기능
각 제품에서 KonaI-Agent에 **없는** 독특한 기능이나 UX 패턴을 도출:
- 기능 설명
- 해당 기능이 해결하는 사용자 문제
- 구현 복잡도 추정 (간단/보통/복잡)

### C. 공통 패턴 도출
6개 제품 중 **3개 이상**에서 공통으로 존재하는 화면이나 기능을 정리:
- 기능명
- 존재하는 제품 목록
- 엔터프라이즈에서 이 기능이 필수인 이유
- KonaI-Agent 적용 우선순위 (P0/P1/P2)

### D. 2025-2026 신규 트렌드
각 제품의 최근 릴리즈나 발표에서 확인된 새로운 방향성:
- 어떤 새로운 화면/기능을 추가했는가?
- 그 이유는 무엇인가?
- KonaI-Agent에 시사하는 바

## 산출물 형식
마크다운으로 작성하되, 최종적으로 다음 구조를 따라주세요:

1. **Executive Summary** (핵심 발견 5개)
2. **제품별 분석** (A~D 프레임워크 적용)
3. **크로스 제품 비교표** (화면/기능 × 제품 매트릭스)
4. **KonaI-Agent 추천 화면/기능 리스트** (우선순위 포함)
5. **참고 자료 / URL**

모든 내용은 한글로 작성해주세요. 기술 용어는 영문 병기.
```

---

## R2. AI 네이티브 제품 UX 혁신 패턴

### 프롬프트

```
당신은 AI 네이티브 제품의 UX/UI 트렌드를 분석하는 전문 리서처입니다.

## 배경
"KonaI-Agent"는 엔터프라이즈용 AI 에이전트 대시보드입니다.
현재 구현 상태:
- 채팅 기반 인터페이스 (텍스트 + 생성형 UI 컴포넌트)
- 멀티에이전트 오케스트레이션 (ReactFlow 기반 비주얼)
- 인라인 선택 UI (HITL: Human-in-the-Loop)
- 아티팩트 패널 (에이전트 생성물 표시)
- 위젯 기반 대시보드
- 자연어→차트 변환

미구현 주요 항목:
- 스트리밍 타이핑 효과
- 에이전트 사고 과정 (Thinking) 표시
- 인라인 편집 / 제안 수정
- 코드 블록 (실행 가능)
- 메시지 액션 메뉴
- 컨텍스트 윈도우 인디케이터
- 피드백 수집
- 음성 입출력

## 리서치 대상 제품
소비자/개발자 대상 AI 네이티브 제품의 최신 UI/UX를 분석:

1. **ChatGPT** (GPT-4o, Canvas, Memory, GPTs 등 2025-2026 최신)
2. **Claude** (Artifacts, Projects, Computer Use, Analysis Tool 등)
3. **Google Gemini** (Gems, Deep Research, Extensions 등)
4. **Perplexity** (Pro Search, Spaces, Collections 등)
5. **Cursor / Windsurf** (AI 코딩 에이전트 UI)
6. **v0 by Vercel** (생성형 UI 에디터)
7. **Devin / Replit Agent** (자율 에이전트 UI)

## 분석 프레임워크

### A. UX 혁신 패턴 카탈로그
각 제품에서 발견되는 혁신적인 UI/UX 패턴을 카탈로그화:
- 패턴 이름 (직접 명명)
- 어떤 제품에서 확인되는가
- 스크린샷/와이어프레임 수준의 상세 텍스트 설명
- 해결하는 사용자 문제
- 전통적 방식 대비 혁신 포인트

### B. 대화형 인터페이스 진화
채팅 UI를 넘어서는 새로운 상호작용 패턴:
- "채팅 + X" 형태의 하이브리드 UI 패턴들
- 에이전트가 생성한 결과물의 표시/편집 패턴
- 사용자 개입(HITL) 패턴의 진화
- 멀티모달 상호작용 (텍스트+이미지+코드+음성)

### C. 에이전트 투명성 & 신뢰 구축 UI
사용자가 AI를 신뢰할 수 있도록 돕는 UI 패턴:
- 사고 과정(Reasoning) 표시 방식
- 소스 인용(Citation) UI
- 불확실성/신뢰도 표현
- 에이전트 행동 설명 (Explainability)
- 사용자 제어감 (Controllability) 확보 패턴

### D. 엔터프라이즈 적용 가능성 평가
각 패턴에 대해:
- B2C에서만 유효한가, B2B에서도 적용 가능한가?
- 엔터프라이즈 환경에 맞게 변형이 필요한 부분은?
- KonaI-Agent에 적용 시 기대 효과

## 산출물 형식
1. **트렌드 요약** (2025-2026 AI UI/UX 5대 메가 트렌드)
2. **혁신 패턴 카탈로그** (패턴별 상세 분석)
3. **대화형 인터페이스 진화 맵** (시간순 또는 복잡도순)
4. **엔터프라이즈 적용 추천** (우선순위 포함)
5. **KonaI-Agent에 없는 화면/기능** (구체적 리스트)

모든 내용은 한글로 작성. 기술 용어 영문 병기.
```

---

## R3. 에이전트 옵저버빌리티 & 운영 도구

### 프롬프트

```
당신은 AI 에이전트 운영(AIOps) 및 옵저버빌리티 전문 리서처입니다.

## 배경
"KonaI-Agent"는 엔터프라이즈 AI 에이전트를 운영하는 대시보드입니다.
현재 구현된 운영 관련 기능:
- 사용량 모니터링 (토큰, 호출 수, 비용)
- 감사 로그 (Audit Log)
- 모델/에이전트 전환기
- 피드백 품질 관리

미구현 운영 관련 항목:
- 에이전트 실행 트레이스 뷰 (Agent Trace View)
- 모델별 비용 분석 (Cost Breakdown)
- 에이전트 레지스트리 (Agent Registry)
- 에러 & 재시도 UI
- 병렬 실행 뷰
- 에이전트 메모리 관리

## 리서치 대상 도구/플랫폼
에이전트 옵저버빌리티 및 운영 도구를 분석:

1. **LangSmith** (LangChain의 옵저버빌리티 플랫폼)
2. **Arize Phoenix** (오픈소스 LLM 옵저버빌리티)
3. **Braintrust** (평가 + 옵저버빌리티)
4. **AgentOps** (에이전트 모니터링)
5. **Helicone** (LLM 게이트웨이 + 모니터링)
6. **Langfuse** (오픈소스 LLM 옵저버빌리티)
7. **Smith.langchain.com / Trace Viewer UIs** 전반

## 분석 프레임워크

### A. 트레이스 시각화
- 각 도구의 트레이스 표현 방식 (워터폴, 트리, 타임라인, 플레임 그래프 등)
- LLM 호출 ↔ 도구 호출 ↔ 에이전트 결정의 계층 표현
- 스팬(Span) 상세 뷰에 어떤 정보를 보여주는가
- 에러/실패 지점 하이라이트 방식

### B. 비용 & 성능 대시보드
- 비용 시각화 방식 (모델별, 에이전트별, 시간별)
- 레이턴시 분석 화면
- 토큰 사용량 분석
- A/B 테스트 / 실험 비교 화면

### C. 평가 & 품질
- 에이전트 응답 품질 평가 화면
- 자동 평가(Auto-eval) 설정 UI
- 휴먼 평가(Human annotation) 워크플로우
- 회귀 테스트 / 벤치마크 화면

### D. 에이전트 운영
- 에이전트 배포/버전 관리 화면
- A/B 테스트 설정
- 알림/경고 설정 화면
- 프롬프트 버전 관리 & 롤백

### E. KonaI-Agent 적용 추천
위 분석을 바탕으로:
- 현재 미구현 항목 중 필수적인 것
- 카탈로그에 없지만 추가해야 할 새로운 화면/기능
- 구현 우선순위와 복잡도

## 산출물 형식
1. **핵심 발견** (옵저버빌리티 업계 표준 5개)
2. **도구별 화면 인벤토리** (스크린/기능 매트릭스)
3. **UX 패턴 분석** (트레이스, 비용, 평가 각각)
4. **KonaI-Agent 추가 화면/기능 추천** (우선순위 포함)

모든 내용은 한글로 작성. 기술 용어 영문 병기.
```

---

## R4. 엔터프라이즈 AI 거버넌스 & 보안 화면

### 프롬프트

```
당신은 엔터프라이즈 AI 거버넌스 및 보안 전문 리서처입니다.

## 배경
"KonaI-Agent"는 엔터프라이즈 환경에서 AI 에이전트를 운영하는 대시보드입니다.
현재 구현된 관리/보안 관련 기능:
- 관리자 대시보드 (사용자/역할/권한 기본)
- 감사 로그
- 프롬프트 관리
- 지식베이스 관리
- 사용량 모니터링
- 테넌트 관리 (부분 구현)

미구현 관리/보안 항목:
- 데이터 보존 & 프라이버시 (Data Retention & Privacy)
- 통합 관리 (Integration Management)
- 에이전트 레지스트리
- 자율성 제어 (Variable Autonomy Control)
- 샌드박스/프리뷰 모드

## 리서치 관점

엔터프라이즈 AI 거버넌스에서 필수적인 화면/기능을 찾아야 합니다.
다음 제품들의 관리자/거버넌스 기능을 분석해주세요:

### 대상 제품
1. **Microsoft Copilot (M365) Admin Center** - AI 거버넌스 설정
2. **Salesforce Einstein Trust Layer / Shield**
3. **ServiceNow AI Governance**
4. **AWS Bedrock Guardrails**
5. **Google Vertex AI - Model Garden + Safety**
6. **Anthropic Claude - Admin Console (Teams/Enterprise)**
7. **OpenAI Platform - Organization Settings**

### 분석 프레임워크

#### A. 접근 제어 & 권한 (Access Control)
- RBAC / ABAC / 컨텍스트 기반 접근 제어
- 에이전트별 권한 설정 (어떤 에이전트가 어떤 도구 사용 가능)
- 데이터 소스별 접근 권한
- 승인 워크플로우 (에이전트 배포, 도구 접근 등)

#### B. 데이터 보안 & 프라이버시
- PII 탐지 & 마스킹 화면
- 데이터 보존 정책 설정
- DLP (Data Loss Prevention) 규칙
- 컨텍스트 격리 (테넌트 간, 부서 간)
- GDPR/CCPA 준수 도구

#### C. AI 안전 가드레일
- 입출력 필터링 규칙 설정 화면
- 토픽 제한 (금지 주제 설정)
- 응답 품질 임계값 설정
- 할루시네이션 탐지 & 경고
- 그라운딩(Grounding) 정책

#### D. 감사 & 규정 준수
- 감사 로그 상세 화면 (필터링, 검색, 내보내기)
- 규정 준수 대시보드
- 리스크 점수 / 위험 지표
- 인시던트 관리 화면

#### E. 비용 거버넌스
- 부서/팀/사용자별 예산 한도 설정
- 비용 경고 & 알림 규칙
- 사용량 할당(Quota) 관리
- 비용 최적화 추천

## 산출물 형식
1. **엔터프라이즈 AI 거버넌스 필수 화면 목록** (공통 기준)
2. **제품별 거버넌스 기능 비교표**
3. **KonaI-Agent에 없는 거버넌스 화면/기능** (상세 설명)
4. **구현 우선순위** (규제 대응 필수 vs 경쟁력 강화)
5. **화면 설계 시 고려사항** (UX 패턴, 주의점)

모든 내용은 한글로 작성. 기술 용어 영문 병기.
```

---

## R5. 에이전틱 워크플로우 UX 패턴

### 프롬프트

```
당신은 에이전틱 AI 워크플로우의 UX 설계 전문가입니다.

## 배경
"KonaI-Agent"는 멀티스텝 AI 에이전트 워크플로우를 지원하는 엔터프라이즈 대시보드입니다.
현재 구현된 워크플로우 관련 기능:
- 멀티에이전트 오케스트레이션 UI (ReactFlow 기반 시각화)
- HITL (Human-in-the-Loop) 인라인 선택
- 에이전트 시나리오 (PPT 생성, 분석 파이프라인)
- 승인/거부 메커니즘 (needs_update 상태)
- 예약 에이전트 작업
- 멀티스텝 진행 표시 (부분 구현)

미구현 워크플로우 관련 항목:
- 비주얼 워크플로우 빌더
- 에이전트 사고 과정 표시
- 병렬 실행 뷰
- 에러 & 재시도 UI
- 자율성 제어
- 샌드박스/프리뷰 모드
- 세션 분기/지속성

## 리서치 대상

### 에이전트 프레임워크/플랫폼
1. **CrewAI** (멀티에이전트 오케스트레이션)
2. **AutoGen / AG2** (Microsoft의 에이전트 프레임워크)
3. **LangGraph Studio** (상태기반 에이전트 그래프)
4. **Dify.AI** (LLMOps 플랫폼)
5. **n8n AI Agents** (워크플로우 자동화)
6. **Make.com / Zapier AI Actions** (노코드 자동화)

### 에이전트 네이티브 제품
7. **Devin** (자율 코딩 에이전트)
8. **Replit Agent** (코드 생성 에이전트)
9. **Manus AI** (범용 자율 에이전트)
10. **OpenAI Operator** (브라우저 자동화 에이전트)

## 분석 프레임워크

### A. 워크플로우 설계 UX
- 워크플로우를 어떻게 정의하는가? (비주얼/코드/자연어/하이브리드)
- 노드 타입들 (에이전트, 도구, 조건분기, 루프, 사람개입 등)
- 에이전트 간 핸드오프 표현 방식
- 동적 워크플로우 (런타임에 에이전트가 플랜 수정)의 UX

### B. 실행 중 UX (Runtime UX)
- 실행 중인 워크플로우를 사용자에게 어떻게 보여주는가
- 진행률/상태 표시 패턴
- 실시간 로그/출력 스트리밍
- 사용자 개입 포인트 (승인, 입력, 선택, 수정)
- 에이전트 "생각 중" 상태 표현

### C. 에러 핸들링 & 복구
- 실패 시 사용자에게 어떤 정보를 주는가
- 자동 재시도 vs 수동 재시도 UX
- 부분 실행 결과 저장 & 이어하기
- 폴백(Fallback) 경로 표현

### D. Human-in-the-Loop 패턴 심화
- 승인 게이트 (단순 승인 vs 조건부 승인)
- 사용자 입력 요청 (파라미터, 선택지, 자유입력)
- 에이전트 제안 검토 & 수정 (Suggested Edits)
- 자율성 스펙트럼 (완전자동↔매번승인) 조절 UI
- 에스컬레이션 (에이전트→사람→더 상위 에이전트)

### E. 결과물 관리
- 워크플로우 결과물(Artifact) 표시/관리
- 버전 관리 (같은 워크플로우 반복 실행 비교)
- 결과물 내보내기/공유
- 실행 이력 & 비교

## 산출물 형식
1. **에이전틱 워크플로우 UX 패턴 카탈로그** (패턴별 상세)
2. **제품별 워크플로우 UX 비교표**
3. **HITL 패턴 진화 맵** (단순→복잡 스펙트럼)
4. **KonaI-Agent 추가 화면/기능 추천** (워크플로우 관점)
5. **UX 설계 원칙** (에이전트 워크플로우에 특화된)

모든 내용은 한글로 작성. 기술 용어 영문 병기.
```

---

## R6. 내부 Gap 심층 분석 & 통합 (Phase 2)

### 프롬프트

> ⚠️ 이 리서치는 R1~R5 결과가 모두 나온 후 실행합니다.
> R1~R5 결과를 이 프롬프트의 `[여기에 R1~R5 결과 붙여넣기]` 부분에 삽입하세요.

```
당신은 엔터프라이즈 소프트웨어 프로덕트 매니저이자 UX 아키텍트입니다.

## 미션
5개 병렬 리서치(R1~R5) 결과와 현재 프로젝트 상태를 교차 분석하여,
KonaI-Agent에 추가할 화면/기능의 최종 우선순위 리스트를 도출합니다.

## 현재 프로젝트 상태

### 구현 완료 (35개)
- message_bubble, markdown_renderer, tool_call_display, citation_source_link
- multi_step_progress(부분), file_upload, rich_media, typing_indicator
- chat_input, natural_language_chart, model_agent_switcher
- generative_ui, approval_rejection(needs_update), session_history_navigation
- data_source_connection, widget_library, drill_down
- document_viewer(needs_update), user_management, role_permission
- audit_log, usage_monitoring, prompt_management, knowledge_base_management
- feedback_quality_management, multi_agent_orchestration_ui, agent_marketplace
- scheduled_agent_tasks, notification_center(부분), sidebar_navigation
- global_search, skill_management(needs_update), breadcrumb

### 미구현 (27개) — 카탈로그 추적 중
[Critical]
- streaming_typing: 스트리밍 타이핑 애니메이션

[High]
- code_block: 구문 강조 + 복사 + 실행 가능 코드 블록
- message_actions: 메시지별 액션 메뉴
- agent_thinking: 에이전트 사고 과정 표시
- parallel_execution_view: 병렬 실행 상태 뷰
- error_retry_ui: 에러 & 재시도 UI
- inline_edit: 인라인 편집/제안 수정
- agent_trace_view: 에이전트 실행 트레이스 뷰
- model_cost_breakdown: 모델별 비용 분석

[Medium]
- message_edit_regenerate, suggested_prompts, agent_status_indicator
- feedback_collection, variable_autonomy_control, dashboard_builder
- mermaid_diagram, context_window_indicator, agent_registry
- integration_management, data_retention_privacy, workflow_builder
- sandbox_mode

[Low]
- memory_management, realtime_collaboration, onboarding_wizard
- voice_io, dark_mode

### 부분 구현 (6개)
- multi_step_progress, inline_selection, confirmation_dialog
- interactive_table, notification_center, tenant_management

## R1~R5 리서치 결과

[여기에 R1~R5 결과를 붙여넣으세요]

## 분석 요청

### Step 1: 교차 검증
R1~R5에서 반복적으로 언급된 화면/기능을 추출하여,
"언급 빈도 × 중요도" 매트릭스를 만드세요.

### Step 2: Gap 재분류
현재 카탈로그의 27개 미구현 항목을:
- 리서치 결과로 **우선순위가 올라가야 하는 것**
- 리서치 결과로 **우선순위가 내려가도 되는 것**
- 리서치 결과로 **범위/정의가 변경되어야 하는 것**
으로 재분류하세요.

### Step 3: 신규 항목 도출
카탈로그에 없지만 R1~R5에서 공통적으로 발견된 새로운 화면/기능을 도출하세요.
각 항목에 대해:
- 화면/기능 이름
- 목적 (1~2문장)
- 근거 (어떤 리서치에서 발견)
- 대상 사용자
- 추정 복잡도
- 우선순위 (P0/P1/P2)

### Step 4: 최종 로드맵 제안
모든 항목(기존 미구현 + 신규 도출)을 통합하여:

**Phase 1 (즉시, 1-2주)**: 핵심 채팅 경험 완성
**Phase 2 (3-4주)**: 에이전트 운영 기반
**Phase 3 (1-2개월)**: 엔터프라이즈 거버넌스
**Phase 4 (2-3개월)**: 차별화 기능

각 Phase에 포함할 항목과 이유를 명시하세요.

## 산출물 형식
1. **교차 검증 매트릭스** (R1~R5 언급 빈도 × 중요도)
2. **Gap 재분류 결과** (우선순위 변경 사항)
3. **신규 화면/기능 리스트** (카탈로그에 추가할 항목)
4. **통합 로드맵** (Phase 1~4)
5. **의사결정 근거 요약** (왜 이 순서인지)

모든 내용은 한글로 작성. 기술 용어 영문 병기.
```

---

## 리서치 실행 가이드

### Phase 1 실행 (병렬)

| 탭 | 리서치 | 예상 소요 | 핵심 키워드 |
|----|--------|----------|-----------|
| 탭1 | R1: 엔터프라이즈 AI 플랫폼 | 15-20분 | Copilot Studio, Agentforce, watsonx |
| 탭2 | R2: AI 네이티브 제품 | 15-20분 | ChatGPT Canvas, Claude Artifacts, Cursor |
| 탭3 | R3: 옵저버빌리티 도구 | 10-15분 | LangSmith, Arize, Langfuse |
| 탭4 | R4: 거버넌스 & 보안 | 10-15분 | Guardrails, Trust Layer, DLP |
| 탭5 | R5: 워크플로우 UX | 15-20분 | LangGraph, CrewAI, Dify, HITL |

### Phase 2 실행 (순차)

R1~R5 결과를 복사하여 R6 프롬프트에 삽입 → 통합 분석 실행

### Phase 3: 최종 통합 (Cowork)

R6 결과를 Cowork에 전달하면:
- 마크다운 리포트 생성
- 기존 component-catalog.yaml 업데이트 제안
- 실행 계획 도출
