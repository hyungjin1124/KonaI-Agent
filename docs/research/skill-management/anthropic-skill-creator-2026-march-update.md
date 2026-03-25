# Anthropic 2026년 3월 skill-creator 업데이트 분석 보고서

## 요약

Anthropic은 2026년 3월 3일 skill-creator의 대규모 업데이트를 발표했다. 평가(Eval) 테스트, 벤치마킹, 블라인드 A/B 비교, 설명 최적화 기능이 추가되어 스킬이 검증 불가능한 프롬프트 파일에서 측정·반복 가능한 산출물로 전환되었다. 그러나 사용자가 문의한 세 가지 기능 — 전용 스킬 마켓플레이스, 공식 스킬 버전 관리, "SkillManagementView" 인터페이스 — 은 이번 3월 업데이트에 **포함되지 않았다**. 팀/조직 수준의 스킬 관리 기능은 존재하지만, 2025년 12월에 이미 출시된 기존 기능이다.

이번 업데이트의 전략적 배경은 명확하다. 대부분의 스킬 작성자가 엔지니어가 아닌 도메인 전문가이며, 모델 업데이트나 수정 후 스킬이 정상 작동하는지 확인할 방법이 전무했다는 점을 Anthropic이 인식한 결과다. "Improving skill-creator: Test, measure, and refine Agent Skills"라는 제목의 이번 발표는 Claude.ai, Cowork, Claude Code 전체에 동시 배포되었다.

---

## 1. 2026년 3월 3일 실제 출시된 기능

skill-creator — 다른 스킬을 생성하고 개선하는 메타 스킬 — 가 기존 단일 "Create" 모드에서 **4가지 운영 모드(Create, Eval, Improve, Benchmark)**로 확장되었다. 각 모드는 병렬로 동작하는 조합 가능한 서브 에이전트(Executor, Grader, Comparator, Analyzer)에 의해 구동된다.

### 1.1 평가(Eval) 시스템

이번 업데이트의 핵심이다. 작성자가 테스트 프롬프트를 정의하고 "좋은" 출력이 어떤 것인지 기술하면, skill-creator가 스킬의 통과 여부를 판정한다. 코딩 지식이 필요 없다. Anthropic은 자사 PDF 스킬을 사례로 제시했는데, 해당 스킬은 이전에 비작성 가능(non-fillable) 양식에서 Claude가 텍스트를 정확한 좌표에 배치하지 못해 실패했다. Eval을 통해 실패 지점을 정확히 특정하고, 추출된 텍스트 좌표에 위치를 고정하는 수정을 도출했다. 평가 결과는 로컬에 저장되며 반복 단위(iteration)별로 정리되어 팀이 시간에 따른 개선을 추적할 수 있다.

### 1.2 벤치마크 모드

**평가 통과율, 소요 시간, 토큰 사용량**을 추적하는 표준화된 성능 스냅샷을 생성한다. 이 스냅샷은 모델 업데이트나 스킬 수정 후 비교할 수 있는 기준선(baseline) 역할을 한다. 한 Medium 저자가 기술한 문제 — "화요일에는 완벽하게 작동했는데, 아무도 모르는 사이에 모델이 업데이트된 목요일부터 스킬이 매출 수치를 엉뚱한 열에 넣기 시작했다" — 를 해결하기 위한 기능이다.

### 1.3 비교 에이전트(Comparator)

두 스킬 버전(또는 스킬 유/무) 간 블라인드 A/B 테스트를 가능하게 한다. 판정 에이전트는 어떤 출력이 어떤 구성에서 나왔는지 알지 못해 주관적 편향이 제거된다. 이 기능은 Cowork과 Claude Code에서만 사용 가능하다.

### 1.4 설명 최적화(Description Optimization)

스킬의 트리거 설명을 샘플 프롬프트와 대조 분석하여 오탐(false positive)과 미탐(false negative)을 줄이는 수정 사항을 제안한다. Anthropic은 내부적으로 6개 문서 생성 스킬에 테스트하여 **6개 중 5개에서 트리거 정확도를 개선**했다. Claude가 어떤 스킬을 활성화할지 결정할 때 모든 가용 스킬의 프론트매터(frontmatter)만 로드하므로, 설명이 부실하면 콘텐츠 품질과 무관하게 스킬이 발동하지 않는다는 점에서 이 기능은 중요하다.

---

## 2. 2026년 3월 업데이트 이전 기존 스킬 시스템

업데이트의 규모를 이해하려면 3월 3일 이전에 무엇이 존재했는지 파악해야 한다.

Agent Skills는 **2025년 10월** SKILL.md 파일 — YAML 프론트매터(이름, 설명)와 자연어 지시문으로 구성된 마크다운 문서 — 형태로 출시되었다. 원래의 skill-creator는 새 스킬 초안 작성과 기존 스킬 편집을 도울 수 있었지만, 검증 기능은 전무했다. 작성자는 스킬이 올바르게 작동하는지, 안정적으로 트리거되는지, 모델 변경 후 성능이 저하되었는지 확인할 방법이 없었다.

스킬에는 스크립트, 템플릿, 예시, 참조 파일을 포함할 수 있다. 시간이 지나며 추가된 고급 기능으로는 서브에이전트 실행(`agent:` 프론트매터), 동적 컨텍스트 주입(`!command` 구문), 도구 제한(`allowed-tools:`), 모델 오버라이드, 생명주기 후크 등이 있다. 스킬은 세 위치에 저장된다: **개인**(`~/.claude/skills/`), **프로젝트**(`.claude/skills/` — 저장소 내), **엔터프라이즈**(관리형 설정을 통해 조직 전체 배포). 우선순위는 엔터프라이즈 > 개인 > 프로젝트 순이다.

비교는 극명하다. 2026년 3월 이전의 스킬 작성은 한 논평가의 표현대로 "기도하고 바라는" 방식이었다 — 스킬을 작성하고 배포한 뒤, 최종 사용자가 잘못된 출력을 보고해야만 문제를 발견했다. 3월 이후, 스킬은 테스트된 소프트웨어 산출물에 의미 있게 가까워졌다.

---

## 3. 사용자 문의 기능별 현황 점검

### 3.1 팀/조직별 스킬 관리 → 존재하지만 3월 업데이트 이전 출시

조직 전체 스킬 관리는 **2026년 3월에 도입되지 않았다**. 이 기능은 Anthropic의 **2025년 12월 Agent Skills 확장**의 일부로 출시되었다. Team 및 Enterprise 플랜의 조직 소유자(Organization Owner)는 조직 설정 > 스킬(Organization Settings > Skills)에서 중앙 집중식으로 스킬을 프로비저닝할 수 있다. 관리자가 프로비저닝한 스킬은 모든 사용자에게 기본 활성화되지만, 개인이 토글로 끌 수 있다. 조직 프로비저닝 스킬과 개인 스킬을 구분하는 시각적 표시도 존재한다.

공유 모델은 플랫폼별로 상이하다. **Claude.ai**에서 스킬은 개인 단위 — 각 팀원이 별도로 업로드한다. **Claude API**에서는 `/v1/skills` 엔드포인트를 통해 워크스페이스 전체에 적용된다. **Claude Code**에서는 개인 또는 프로젝트 기반이며, 대규모 배포를 위한 엔터프라이즈 관리형 설정도 가능하다. 주목할 점은 **P2P 스킬 공유는 현재 지원되지 않는다** — 특정 동료에게 직접 스킬을 공유할 수 없다. 배포는 조직 프로비저닝, 버전 관리(`.claude/skills/`에 커밋), 또는 플러그인 마켓플레이스를 통해 이루어진다.

2025년 12월에 Anthropic은 Notion, Figma, Atlassian, Canva 등 파트너가 구축한 스킬을 포함하는 **Skills Directory**도 출시했으며, Agent Skills를 **오픈 표준**(agentskills.io에 공개)으로 발표하여 동일한 SKILL.md 포맷이 Cursor, Gemini CLI, Codex CLI, GitHub Copilot 등 18개 이상의 AI 코딩 에이전트에서 작동하도록 했다.

### 3.2 스킬 마켓플레이스 → 공식 전용 마켓플레이스 미출시

Anthropic은 **2026년 3월에 전용 스킬 마켓플레이스를 출시하지 않았다**. Bloomberg을 통해 2026년 3월 6일 발표된 "Anthropic Marketplace"는 기업 고객이 서드파티 AI 소프트웨어(Snowflake, Harvey, Replit의 앱)를 구매하는 보다 광범위한 엔터프라이즈 플랫폼이며, 스킬 전용 마켓플레이스가 아니다.

현재 존재하는 것은 Claude Code의 **플러그인 마켓플레이스 시스템** — GitHub에 호스팅된 JSON 카탈로그 파일 기반의 분산형 접근 방식이다. 사용자는 `/plugin marketplace add anthropics/skills`로 Anthropic 공식 스킬 저장소를 추가하고 개별 스킬을 설치한다. 이 저장소는 2026년 3월 기준 **GitHub 스타 87,000개 이상**을 기록한 것으로 보고된다.

이 공백을 서드파티 에코시스템이 활발히 채우고 있다:

- **SkillsMP.com** — Claude Code, Codex CLI, ChatGPT 전반에 걸쳐 500,000개 이상의 에이전트 스킬 인덱싱
- **Antigravity의 awesome-skills** — 1,234개 이상의 스킬 큐레이션, GitHub 스타 22,000개 이상
- **Tessl Registry** — 버전 고정 평가 결과와 CI/CD 통합을 제공하는 스킬 레지스트리
- **FindSkill.ai 및 OpenAIToolsHub** — 설치 횟수와 함께 수백 개의 스킬 카탈로그
- Anthropic 자체 awesome-skills 저장소에도 명시: "현재 유료 스킬을 위한 공식 마켓플레이스는 없음"

### 3.3 스킬 버전 관리 → 공식 독립 제품 미출시, 인프라 수준에서 존재

**2026년 3월에 독립적인 스킬 버전 관리 제품은 발표되지 않았다.** 다만 여러 인프라 계층에서 버전 관리 기능이 존재한다. Messages API의 `/v1/skills` 엔드포인트는 개발자에게 커스텀 스킬 버전 관리 및 관리에 대한 프로그래밍 제어를 제공하고, Claude Console에서는 스킬 버전을 생성, 조회, 업그레이드할 수 있다. 플러그인 마켓플레이스 항목은 plugin.json에 버전 필드(`"version": "1.0.0"`)를 포함하며, `/plugin marketplace update`로 마켓플레이스 업데이트를 트리거할 수 있다.

3월 업데이트가 버전 관리에 기여한 가장 중요한 부분은 간접적이다: 스킬 버전 간 A/B 비교와 반복별 벤치마킹을 가능하게 함으로써 스킬을 claudeai.dev의 분석 표현대로 "버전 관리, 테스트, 리뷰가 가능한 산출물에 훨씬 가깝게" 만들었다. 반복 디렉토리별로 정리되는 평가 결과는 사실상의 버전 이력을 생성한다. Tessl의 Registry 같은 서드파티 솔루션은 더 나아가 특정 게시 버전(예: v1.2.0 대 v1.1.0)에 평가 결과를 연결하고 CI/CD를 통해 새 게시마다 자동으로 평가를 실행한다.

### 3.4 SkillManagementView → 공개 문서에서 확인 불가

**"SkillManagementView"라는 용어는** 조사한 모든 Anthropic 문서, 블로그 포스트, 변경 로그, GitHub 저장소, 서드파티 보도에서 **결과가 없었다**. Claude Code 문서, support.claude.com 도움말 센터, 스킬 API 문서, 커뮤니티 토론 어디에서도 나타나지 않는다. 이 컴포넌트가 존재한다면, 공개적으로 문서화되지 않은 내부 코드베이스 참조이거나 아직 출시되지 않은 기능일 가능성이 있다.

가장 유사한 공개 인터페이스는 다음과 같다:

- Claude.ai의 **설정 > 사용자 지정 > 스킬** 패널 (스킬 토글 및 ZIP 업로드)
- 조직 관리자용 **조직 설정 > 스킬** 패널 (조직 전체 프로비저닝)
- Claude Code의 CLI 기반 스킬 관리 (`/plugin install`, `/plugin marketplace` 명령어)

---

## 4. 기존 시스템 vs. 2026년 3월 업데이트 비교

| 항목 | 3월 업데이트 이전 | 3월 업데이트 이후 |
|------|-----------------|-----------------|
| **스킬 생성** | Create 모드만 가능 | Create + Improve 모드 |
| **품질 검증** | 없음 (수동 확인만 가능) | Eval 모드 — 테스트 프롬프트 기반 자동 평가 |
| **성능 측정** | 없음 | Benchmark 모드 — 통과율/시간/토큰 스냅샷 |
| **버전 비교** | 없음 | Comparator 에이전트 — 블라인드 A/B 테스트 |
| **트리거 정확도** | 작성자 직관에 의존 | 설명 최적화 — 오탐/미탐 자동 분석 |
| **서브 에이전트** | 없음 | Executor, Grader, Comparator, Analyzer |
| **결과 추적** | 없음 | 반복(iteration)별 로컬 저장 |
| **팀 관리** | 2025년 12월 출시 (변동 없음) | 변동 없음 |
| **마켓플레이스** | 플러그인 마켓플레이스 (분산형) | 변동 없음 |
| **버전 관리** | API/Console 수준 존재 | 간접 개선 (A/B 비교 + 반복별 스냅샷) |
| **SkillManagementView** | 공개 문서에 없음 | 공개 문서에 없음 |

---

## 5. 결론

2026년 3월 skill-creator 업데이트는 스킬 품질에 있어 진정한 패러다임 전환이지만, **테스트와 측정**에 집중된 범위가 좁은 업데이트다. 4개 모드 시스템(Create, Eval, Improve, Benchmark)은 "작동하는 것 같다"와 "작동함을 증명할 수 있다" 사이의 간극을 메웠으며, 이는 2025년 후반부터 Reddit과 개발자 블로그에서 지적되어 온 바로 그 역량 공백이었다.

확인되지 않은 기능들 — 공식 스킬 마켓플레이스, 네이티브 버전 관리 UI, SkillManagementView — 은 다음 단계의 논리적 발전 방향을 나타낸다. Tessl Registry와 SkillsMP 같은 서드파티 도구가 이미 이 공백을 채우고 있다. Anthropic 자체 블로그도 로드맵의 방향을 시사한다: "모델이 개선됨에 따라 '스킬'과 '명세'의 경계가 흐려질 수 있다… Eval은 이미 '무엇'을 기술한다. 결국 그 기술 자체가 스킬이 될 수 있다." 현재로서 2026년 3월 업데이트는 Anthropic이 기존의 비구조적 창작 과정에 **엔지니어링 규율**을 부여한 것으로 이해하는 것이 가장 적절하다.

---

## 참고 출처

- Anthropic 공식 블로그: "Improving skill-creator: Test, measure, and refine Agent Skills" (2026.03.03)
- Claude Help Center: "Provision and manage Skills for your organization"
- Claude Code Docs: "Extend Claude with skills", "Create and distribute a plugin marketplace"
- Anthropic News: "Introducing Agent Skills" (2025.10)
- Bloomberg: "Anthropic Unveils Amazon-Inspired Marketplace for AI Software" (2026.03.06)
- claudeai.dev: "Anthropic Skill Creator Update: Practical Guide for Teams"
- Tessl Blog: "Anthropic brings evals to skill-creator"
- GitHub: anthropics/skills 저장소
