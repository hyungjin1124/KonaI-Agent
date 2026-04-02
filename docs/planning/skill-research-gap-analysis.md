# 스킬 기획 vs 리서치 갭 분석 — 추가 반영 아이디어

> **분석 대상**: `service-plan.md` §3.3 + `03-skill-ia.md` v7
> **리서치 출처**: `docs/research/skill-management/` 15개 문서
> **작성일**: 2026-03-27
> **방법론**: PM · Designer · Engineer 3관점 Product Trio 아이디어 도출 → Top 5 우선순위 선정

---

## 분석 요약

v7 기획은 팀 공유 드라이브 모델, 활성화/복사 모델, 버전 이력 + AI 변경 요약, 테이블 + 슬라이드 패널 UI를 확정했다. 리서치 15개 문서를 교차 분석한 결과, **기획에 반영되지 않았거나 보강이 필요한 15개 영역**을 발견했으며, 이 중 **5개를 우선 반영 권장 아이디어**로 선정했다.

---

## PM 관점 — 비즈니스 가치 & 전략 정합성 (5개)

### 1. 스킬 품질 보증 체계 (Eval/Benchmark) ⭐ Top 5
Anthropic 2026.03 업데이트가 Create → Eval → Improve → Benchmark 4-mode를 도입했으나, v7에는 스킬 품질 측정 구조가 전혀 없음. 호출 수·활성 멤버만으로는 "잘 작동하는지" 판단 불가. 리서치에서 pass rate 뱃지, baseline vs with-skill 비교, 시나리오별 결과 어코디언 패턴이 상세 설계됨.

**출처**: `anthropic-skill-creator-2026-march-update.md`, `skill-versioning-eval-ui-patterns.md`, `skill-versioning-with-eval-results.md`, `skills-eval-ui-patterns.md`

### 2. 멀티테넌트 거버넌스 확장 경로
현재 "1팀=1스코프, 승인 없음"이나, Teams 3-tier 정책(Global → Permission Policy → Setup Policy), Slack 요청-승인, 필수/권장/허용/차단 4단계 모델이 도출됨. 후순위 항목의 확장 설계가 리서치로 준비된 상태.

**출처**: `multi-tenant-extension-management-patterns.md`

### 3. 스킬 발견·분배 4단계 라이프사이클
개인 → 팀 → 조직 → 퍼블릭 4단계 모델이 제시되었으나, v7은 "팀" 단일 레이어만 존재. Figma Library 3-tier publish + 업데이트 알림이 가장 성숙한 참조 모델.

**출처**: `skill-discovery-and-distribution-patterns.md`, `team-skill-sharing-patterns.md`

### 4. 복사본 난립 방지
v7에 방지 메커니즘 없음. 30일 미사용 흐리게 표시, 원본 5개+ 복사 시 경고, 90일 자동 아카이브 등 구체적 대안이 리서치에 있음.

**출처**: `supplemental-research-G1-G4.md` (G3)

### 5. 트렌드 감지 로직
호출 수 컬럼은 있으나 트렌드 표시 없음. 소규모 데이터(0–200건)에서의 이중 조건(최소 임계값 + 변화율) 알고리즘 설계됨.

**출처**: `supplemental-research-G1-G4.md` (G2)

---

## Designer 관점 — 사용자 경험 & 유용성 (5개)

### 6. Diff 뷰어 렌더링 방식 확정 ⭐ Top 5
[원문 비교 →]의 렌더링 방식 미정. 비개발자에게는 렌더링된 WYSIWYG + 2-tier 하이라이팅이 최적. Confluence 인라인 diff가 산문의 골드 스탠다드. 컬러 스킴까지 설계 완료.

- 삭제: `#ffeef0`(라인) + `#fdb8c0`(워드)
- 추가: `#e6ffec`(라인) + `#acf2bd`(워드)

**출처**: `diff-viewer-patterns-R2.md`

### 7. 파일 탐색기 적응형 레이아웃
400–500px 패널에서의 배치 미정. 파일 수 기반 적응형 전략(1개: 리스트 생략, 2–4개: 플랫, 5+: 트리) + 수직 스택 + YAML frontmatter 메타데이터 카드 변환 설계됨.

**출처**: `file-explorer-and-viewer-R6.md`

### 8. 패널 너비·리사이즈·반응형 스펙 ⭐ Top 5
패널 너비 전혀 미정. 기본 480px / 최소 400px / 최대 640px / 드래그 리사이즈 / <1024px 풀스크린 오버레이 권장.

**출처**: `supplemental-research-G1-G4.md` (G4)

### 9. 아바타 스택 세부 스펙
"이니셜 아바타 최대 2개 + +N"만 명시. 사이즈 20px, 오버랩 -8px, 2px 화이트 보더, 이니셜+배경색 폴백, GitHub Primer 표준 참조 설계됨.

**출처**: `supplemental-research-G1-G4.md` (G1)

### 10. 복사 후 마이크로 인터랙션 ⭐ Top 5
토스트만 명시. ① 행 하이라이트 삽입 → ② 패널 자동 열림 + 이름 필드 포커스/전체선택 → ③ 2초 페이드 패턴 권장. 30일 미사용 흐림 + "복사 출처" 메타데이터 링크 추가.

**출처**: `usage-metrics-and-copy-ux-R3-R5.md`, `supplemental-research-G1-G4.md`

---

## Engineer 관점 — 기술 가능성 & 확장성 (5개)

### 11. Eval 데이터 구조 활용
Anthropic evals.json, grading.json, benchmark.json, comparison.json, history.json 스키마 완전 분석됨. 스킬 상세 패널 연동으로 pass rate 뱃지, 개선율, 시나리오별 결과 즉시 표시 가능.

**출처**: `skill-creator-ux-workflow-patterns.md`

### 12. 설명(description) 최적화 자동화
run_loop.py 기반: 20개 트리거 쿼리 생성 → 60/40 train/test 분할 → 5회 반복 → 과적합 방지. 트리거 정확도 자동 개선.

**출처**: `skill-creator-ux-workflow-patterns.md`

### 13. 블라인드 A/B 비교
comparator.md: Output A vs B 블라인드 + 루브릭 채점(Content 3축 + Structure 3축, 1–5점). 버전 간 객관적 품질 비교.

**출처**: `skill-creator-ux-workflow-patterns.md`

### 14. 호출 수 포맷 및 트렌드 구현 ⭐ Top 5 (일부)
0–999 정확한 숫자, ↑ #22C55E (주간 +100% AND ≥5건), ↓ #F59E0B (-50% AND 전주 ≥10건), 신규 2주 미만 제외. 키보드 네비게이션: Linear 표준(↑↓ Enter Esc Space).

**출처**: `usage-metrics-and-copy-ux-R3-R5.md`, `table-panel-layout-and-team-discovery-R1-R4.md`

### 15. 테이블-패널 키보드 네비게이션
v7에 키보드 인터랙션 명세 없음. Linear 표준(↑↓ 행 이동, Enter 패널 열기, Esc 닫기, Space 퀵피크) 분석 완료.

**출처**: `table-panel-layout-and-team-discovery-R1-R4.md` (R1)

---

## Top 5 우선 반영 아이디어

| 순위 | 아이디어 | 관점 | 반영 난이도 | 영향도 |
|:----:|---------|:----:|:----------:|:-----:|
| 1 | 스킬 품질 뱃지 (Eval Pass Rate) | PM | 높음 (백엔드 연동) | ★★★★★ |
| 2 | Diff 뷰어 WYSIWYG + 2-Tier 하이라이팅 | Designer | 중간 (프론트엔드) | ★★★★ |
| 3 | 복사 후 마이크로 인터랙션 + 복사본 관리 | Designer | 낮음~중간 | ★★★★ |
| 4 | 패널 너비·리사이즈·반응형 + 파일 탐색기 적응형 | Designer+Eng | 중간 | ★★★★ |
| 5 | 호출 수 트렌드 + 키보드 네비게이션 | Engineer | 낮음 | ★★★ |

### 반영 시점 제안

- **v7 기획 즉시 보강** (기획 문서에 스펙 추가): #2, #3, #4, #5 — 리서치에서 구체적 수치와 패턴이 준비됨
- **v8 기획 시 설계**: #1 — Eval 인프라 구축이 선행되어야 하므로 별도 기획 필요

### 추가로 기획 문서에서 참조할 리서치 (반영은 아니나 인지 필요)

| 리서치 문서 | 현재 기획과의 관계 |
|-----------|----------------|
| `multi-tenant-extension-management-patterns.md` | 후순위 "관리자 검토·승인" 재검토 시 Teams 3-tier 모델 참조 |
| `skill-discovery-and-distribution-patterns.md` | 후순위 "교차 팀 스킬 탐색" 재검토 시 Figma Library 3-tier publish 참조 |
| `skill-marketplace-ux-analysis.md` | 스킬 수 50개 이상 도달 시 검색·카테고리·추천 UI 설계 참조 |
| `skill-creator-ux-workflow-patterns.md` | 채팅 기반 스킬 생성 플로우 상세 설계 시 5-stage 워크플로우 참조 |

---

## 검증할 핵심 가정 (Top 5 공통)

1. **현업 사용자가 pass rate 수치를 직관적으로 이해하는가** — 숫자 vs 라벨("양호"/"주의") 중 어느 것이 의사결정에 유효한지
2. **복사 직후 패널 자동 열림이 맥락 전환으로 느껴지지 않는가** — 프로토타입 A/B 테스트 필요
3. **SKILL.md의 자연어 vs 코드 블록 비중** — Diff 뷰어 렌더링 전략의 전제 조건
4. **1024px 미만 뷰포트 사용 빈도** — 풀스크린 오버레이 전환 빈도 추정
5. **주간 5건 미만 스킬 비율** — 트렌드 미표시 비율이 너무 높으면 기능 무용화
