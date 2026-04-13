# C1 Pilot 분석 — `01-dashboard.md` ↔ `dashboard-composition.md`

**판정**: **SPLIT (분리)** — 병합 아님. C7과 동일 패턴.

---

## TL;DR

두 파일은 파일명에 모두 "dashboard"가 들어가 있으나 **주제 축이 직교(orthogonal)한다**.

- **Vault `dashboard-composition.md`** = *멀티 에이전트 UI 레이아웃 패러다임* (who/what: 여러 에이전트를 어떻게 배치·감독할 것인가)
- **docs `01-dashboard.md`** = *홈/대시보드/라이브보드 IA 통합 리서치* (how: 위젯 그리드와 AI 인사이트의 정보 아키텍처를 어떻게 엮을 것인가)

공유 키워드가 "dashboard" 하나뿐이고, 문제 공간과 해결 패턴이 서로 다르다. C7 파일럿에서 확립한 휴리스틱(파일명 유사 ≠ 중복)이 재확인됨.

---

## 1. 내용 구조 비교

| 항목 | Vault `dashboard-composition.md` | docs `01-dashboard.md` |
|------|-----------------------------------|-----------------------|
| 분량 | 187줄 | 418줄 |
| 프론트매터 | ✅ insight-synthesis (완전) | ❌ 없음 |
| 구조 | TL;DR → Context → Cross-Product Analysis → 패턴 A~D → Key Findings → Source Mapping | 제품별 × 조사항목 8개 (56개 셀) → 시각 자료 모음 |
| 패턴 층위 | Layer 2 (synthesis) | Layer 1 (raw cross-product research) |
| 주 주제 | 멀티 에이전트 UI 레이아웃 | 홈/대시보드/라이브보드 IA 통합 |
| 핵심 프레임 | 4개 레이아웃 패러다임 (Sidecar / Supervisor / Registry / Dual-Pane) | 8개 조사항목 (홈 구성, 홈-대시보드 관계, 위젯 유형, AI 인사이트 통합, 채팅→대시보드 저장, 모니터링 통합, 드릴다운, 연결지점) |
| 대상 제품 | Salesforce, MS Copilot, Databricks, ServiceNow Now Assist, Workday, ThoughtSpot, Snowflake, Glean (8) | Datadog, ThoughtSpot, Databricks, Snowflake Snowsight, Dify, ServiceNow AI Control Tower, Salesforce (7) |
| 제품 중첩 | — | ThoughtSpot, Databricks, Snowflake, ServiceNow, Salesforce (5개 공유) |
| 고유 제품 | MS Copilot, Workday, Glean | Datadog, Dify, ServiceNow AI Control Tower |
| 적용 대상 | ERP 에이전트 감독 대시보드 | "대시보드↔라이브보드 통합" IA 설계 |

### 테마별 교차 검증

동일 제품(ThoughtSpot)을 두 파일에서 어떻게 다루는가:
- **Vault**: "Dual-Pane Analytics" 패러다임의 대표 사례 — SpotterViz 이중 패널, PIN 기반 점진적 대시보드
- **docs**: 8개 조사항목 매트릭스 — Home 화면 구성, Liveboard 드릴다운 모델, SpotIQ 인라인 통합, Pin→Liveboard 저장 경로

같은 제품을 **다른 렌즈**로 본다. 병합하면 두 렌즈가 서로 희석되고, 독자의 질문 ("에이전트를 어떻게 배치하지?" vs "홈과 대시보드는 어떻게 나누지?") 어느 쪽도 깔끔히 답할 수 없게 된다.

---

## 2. 왜 파일명이 같은가 (C7과 같은 패턴)

두 파일은 서로 다른 리서치 세션의 산출물이다:
- `dashboard-composition.md`: 2026-02-10 insight-synthesis (에이전트 레이아웃 중심)
- `01-dashboard.md`: 별도 IA 리서치 세션 (홈/대시보드/라이브보드 통합 맥락)

파일명 충돌의 원인은 **"dashboard"라는 단어가 두 가지 의미를 동시에 갖기 때문**:
- 의미 ①: "관제판" — 에이전트/상태를 한눈에 감독 → Vault 파일
- 의미 ②: "위젯 그리드 페이지" — 데이터 시각화 컨테이너 → docs 파일

C7과 동일한 구조: 파일명 자체가 거짓 양성(false positive)을 만든다.

---

## 3. 권장 조치

### Option A: Full Split (권장)

**3-1. Vault 신규 파일**: `home-dashboard-liveboard-ia-patterns.md`
- docs `01-dashboard.md`의 56개 셀을 8개 테마 패턴으로 재구조화
- insight-synthesis 프론트매터 적용
- confidence: **medium** — 원본에 "KonaI-Agent 적용 전략" 섹션이 없으므로 해석 여지 있음
- `related_patterns: [dashboard-composition]` 포함
- `source_files: [docs/research/ux-patterns/01-dashboard.md (이관 전)]`

**3-2. 기존 Vault 파일 업데이트**: `dashboard-composition.md`
- 프론트매터에 `related_patterns: [home-dashboard-liveboard-ia-patterns]` 주입
- C7과 동일한 상호 링크 패턴

**3-3. 원본 보존 여부 — Raw Archive**:
- Karpathy 3계층 원칙: Layer 1 (raw) → Layer 2 (synthesis) → Layer 3 (decision)
- docs `01-dashboard.md`는 Layer 1 raw에 해당. 합성 후 삭제하면 검증 가능성 상실
- **권장**: `Vault/리서치/Insights/agent-ui/sources/01-dashboard-ia-research.md` 로 이관 (새 `sources/` 하위폴더)
- 프론트매터 최소 추가: `type: raw-research`, `synthesized_into: [home-dashboard-liveboard-ia-patterns]`
- docs 원본은 이관 후 삭제

**3-4. ADR 여부**: ❌ 작성 안 함
- 원본에 의사결정 섹션 없음
- 홈/대시보드/라이브보드 통합은 실제 KonaI-Agent IA 결정 시점에 별도 ADR-0002로 작성 (향후 과제)

### Option B: Raw-Only Move (경량)

합성 없이 원본만 `Vault/.../sources/01-dashboard-ia-research.md`로 이관하고 cross-link만 추가. synthesis 작성은 후일 과제로 유보.

- 장점: C1 파일럿 스코프 최소, 빠르게 끝남
- 단점: Layer 2가 비어 있어 독자가 56개 셀을 직접 읽어야 함

### Option C: 후속으로 양대 파일 동일 Layer 승격

docs `01-dashboard.md`를 원본 그대로 `Insights/agent-ui/patterns/` 아래로 이관하고 프론트매터만 덮어 씌움. 하지만 이는 synthesis 층위를 raw로 오염시키므로 **비권장**.

---

## 4. C7과의 비교 (휴리스틱 재검증)

| 항목 | C7 | C1 |
|------|----|-----|
| 파일명 유사도 | 100% (diff-viewer / diff-review) | 100% ("dashboard") |
| 내용 중복도 | 0% | ~5% (공유 제품 5개지만 렌즈가 다름) |
| 판정 | split | split |
| 원본 위상 | synthesis + decision 섞임 | pure raw cross-product |
| ADR 작성 | ✅ ADR-0001 | ❌ (의사결정 시점 대기) |
| raw 보존 필요 | ❌ (원본이 decision 포함) | ✅ (원본이 raw layer) |

### 확정 규칙 (C7 + C1 2건)

1. **파일명 휴리스틱 한계**: "이름이 같다" = 병합 후보라는 duplication-report.md §3의 전제는 **거짓**. C 카테고리 기본 조치는 **split**이며, 병합은 예외 케이스로만 허용한다.
2. **3계층 분리 원칙**: raw / synthesis / decision은 서로 다른 파일에 분리 보관. 한 파일이 두 층위를 섞으면 분리한다.
3. **병합 허용 조건** (회수율 기준): 같은 주제 축 + 같은 층위 + 70% 이상 내용 중첩. C1은 주제 축이 다르므로 불가.
4. **raw 보존 위치**: Vault에 raw 보관 전용 위치가 아직 없음 → `Insights/{category}/sources/` 하위폴더 신설안.

---

## 5. duplication-report.md 수정 제안

§3 "C 카테고리" 파트에:

> **업데이트 (C7, C1 파일럿 후)**: C 카테고리 8쌍은 **split이 기본값**으로 재분류된다. 병합은 내용 중첩 ≥70% + 같은 층위인 경우만 허용한다. C1·C7 모두 split으로 판정되었으므로, 나머지 6쌍(C2~C6, C8)도 개별 파일럿 없이 split 절차를 default로 적용 가능하다 — 단, synthesis 작성 여부는 원본의 raw/decision 위상에 따라 결정.

---

## 6. 다음 단계

사용자 승인 필요 사항 3가지:

1. **Option A/B/C 선택** — 기본 권장: A (Full Split)
2. **`sources/` 하위폴더 신설 OK?** — Vault 디렉토리 구조 변경
3. **synthesis 작성 범위** — 8개 테마 전부 / 핵심 4개만 / skip
