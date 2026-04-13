# Tasks

## 2026-04-06 — 스킬 생성 프로토콜 v3 후속 작업 (6 → 1 → 2)

### 완료

- [x] (6) `skill-creation-protocol-walkthrough.md` 작성 — 4개 시나리오 dry run, 22개 회색지대 식별
- [x] (1) `skill-creation-protocol-critique-v3.md` 작성 — v2 비판 응답 매트릭스 + P0/P1/P2/P3 분류 + 8개 권고
- [x] (2) `skill-ia.md` v12 갱신 — 부분 PASS 표기, 7절 에이전트 제안 진입 경로, 3회 실행 명시, Coexistence drift Monitoring 후순위, [복사 후 대체] 자동 폴백, 4절 단일 출처 노트

### 검토 (Review)

**산출물**

| 파일 | 라인 | 역할 |
|------|------|------|
| `docs/design/ia-design/skill-creation-protocol-walkthrough.md` | 597 | v3 시나리오 워크스루 (4개) + 22개 회색지대 + 본 워크스루 한계 |
| `docs/design/ia-design/skill-creation-protocol-critique-v3.md` | 419 | v2 응답 매트릭스 + 워크스루 발견의 P0/P1/P2/P3 분류 + 우선순위 권고 |
| `docs/design/ia-design/skill-ia.md` | 1103 (+19) | v11 → v12. 프로토콜 9절 5항목 + critique-v3 IA-1/IA-2 반영 |

**핵심 발견 — P0 4건 (즉시 처리 필요)**

1. **Coexistence [1] 대체 + 작성자 권한 충돌** — 프로토콜과 skill-ia.md 사이 직접 충돌. → skill-ia.md 5.2절에 [복사 후 대체] 자동 폴백 명시로 해소
2. 데이터 동등 대체 판정 알고리즘 부재 → 사용자 확인 단계로 강등 권고
3. 경계 프롬프트 "비호출" 측정 불가 → 항목 제거 권고
4. PARTIAL/FAIL 경계 미정의 → 3회 중 N회 매핑표 권고

**남은 작업 (다음 세션 이후 후보)**

- [ ] 프로토콜 v3.1 작성 — critique-v3 §8.1 P0 4건 + §8.2 부트스트랩 명세 반영
- [ ] `default-skills-spec.md` 신설 — 선탑재 스킬 카탈로그 (프로토콜 10절 위임)
- [ ] Eval 인프라 기술 설계서 — Executor/Grader 서브에이전트 실행 모델
- [ ] UI 와이어프레임 — 1단계 채팅 6항목 + 2단계 아티팩트 패널 (A)~(F)
- [ ] menu-structure / feature-architecture와의 정합성 검토 — skill-ia.md v12 연쇄 영향 확인

**검증**

세 파일 간 상호 참조 일관성:
- walkthrough 22개 회색지대 → critique-v3 부록 A 매핑표에서 1:1 추적 가능
- critique-v3 §8.5 IA 6항목 → skill-ia.md v12 변경 6건과 1:1 대응
- skill-ia.md v12 변경 모두 프로토콜 v3 + critique-v3 양쪽 출처 표기

본 작업의 변경 전후 동작 차이: skill-ia.md만 실제 IA가 변경됨. walkthrough/critique-v3는 신규 분석 문서로 기존 동작 변경 없음.

---

## 2026-04-07 — 스킬 생성 IA 설계 (와이어프레임 사전 작업)

### 완료

- [x] Phase 1: `skill-ia-creation-flow.md` v1 작성 — 7개 사용자 결정 + 4개 블로커 결정 + 3개 귀결을 바탕으로 드래프트 엔티티 모델, 3.2/3.3/3.5 플로우, skill_draft 아티팩트 타입 스펙, skill-ia.md §3·§4 연계 사양 확정
- [x] Phase 2: `skill-ia.md` v12 → v13 surgical edit 8건 적용

### 산출물

| 파일 | 라인 | 역할 |
|------|------|------|
| `docs/design/ia-design/skill-ia-creation-flow.md` | 544 | **신규**. 드래프트 lifecycle·내비게이션·아티팩트 타입 스펙의 단일 출처 |
| `docs/design/ia-design/skill-ia.md` | 1110 (+7 net) | v12 → v13. partial_pass 전면 제거 + 진입 경로 단일화 + 편집 경로 구체화 |

### v13 적용 편집 8건

1. 메타데이터 v12 → v13 (연계 문서에 `skill-ia-creation-flow.md` v1 추가)
2. §3.1 "새 스킬은 AI 채팅에서 →" 안내 링크 신설 (빈 상태 + 테이블 상단)
3. §3.2 헤더에서 "검증 상태 뱃지" 행 삭제 (partial_pass 제거)
4. §3.2 [채팅에서 편집] 동작 상세화 (D14 — 새 채팅 세션 + 드래프트 복제 + 새 버전 누적)
5. §3.2 Coexistence 폴백 문구 "역할 이어받기"/"합치기"로 교체 (D4)
6. §3.2 품질 테스트 "PASS/FAIL 이진 판정 (v13)" 단락 신설 — v12 "부분 PASS 처리" 단락 대체, PARTIAL 개념 폐기
7. §4.3 진입 경로 표 전면 재구성 — 사용자 발화 행 신설, §3 안내 링크 행 신설, [채팅에서 편집] 행 신설, v13 설계 변경 노트 추가
8. §8 후순위 4개 항목 신설 — 인터럽트 카드(v12 이동), 다중 드래프트, FAIL 루프 상한, 아티팩트 선택적 편집 모드

### 확정된 결정 14건 요약

**사용자 결정 7건**: D1 범위 / D2 진입 / D3 UI surface / D4 Coexistence 문구 / D5 단계 전환 / D6 데이터 권한 3분면 / D7 3/3 PASS

**블로커 결정 4건**: B1 드래프트 lifecycle α / B2 단일 드래프트 / B3 채팅 발화 수정만 / B4 새 버전 누적

**귀결 3건**: D13 §3 버튼 제거 + 안내 / D14 편집=새 채팅 재사용 / v11 버전 모델 재사용 정합 확인

### 검증

- `skill-ia-creation-flow.md` §5 연계 사양이 `skill-ia.md` v13 편집 8건과 1:1 대응 확인
- 드래프트 lifecycle 6상태(CAPTURING/EVALUATING/EVAL_PASS/EVAL_FAIL/SAVED/DISCARDED) 모두 플로우 내 도달 가능
- v11 버전 모델(`§2 버전 관리`)과 B4 "새 버전 누적" 결정 충돌 없음 (편집 시 새 버전 자동 생성 = v11이 이미 정의)
- `partial_pass` / `PARTIAL` / "부분 PASS" 참조가 v13 문서에 의도적 폐기 노트 외 전혀 남아있지 않음을 grep으로 확인
- Coexistence "대체" 문구는 폴백 설명(사용자에게 안내되는 한 줄)에 1건 남아 있으나, 컨텍스트상 "복사 후 통합합니다" 한글 문구이므로 허용 가능. 사용자 대면 CTA 문구는 모두 "역할 이어받기"/"합치기"로 교체됨

### 남은 작업 (다음 세션)

- [ ] Phase 3: `skill-creation-protocol.md` v3 → v3.1 패치 (§2.3 B 분기 제거, §3.1 3/3 PASS 명시, Coexistence 문구 교체, critique-v3 P0 반영)
- [ ] 와이어프레임 작업 (Low-fi 4~6매): 1단계 CAPTURING, EVALUATING, EVAL_PASS, EVAL_FAIL, 편집 모드, §3 안내 링크
- [ ] Eval 인프라 기술 설계서 (Executor/Grader 데이터 흐름, SLA, 재시도)
- [ ] FAIL 루프 상한 정책 (skill-ia-creation-flow.md §7.1)
- [ ] `menu-structure` / `feature-architecture`와 v13 정합성 검토 (§3 버튼 제거 연쇄 영향)

### 변경 전후 동작 차이

- `skill-ia.md` §3에 "새 스킬은 AI 채팅에서" 안내 링크가 생김 (빈 상태 + 테이블 상단 2개소)
- 저장 시 "부분 PASS" 상태가 더 이상 불가능. 3/3 PASS만 저장 가능하며 1회라도 FAIL 발생 시 재검증 루프 진입
- [채팅에서 편집] 클릭 시 현재 채팅에 로드되지 않고 **새 채팅 세션**이 열림 (D14)
- §4.3 진입 경로에서 v12의 "AI 채팅 — 에이전트 제안" 행이 사라지고 §8 후순위로 이동
- Coexistence 사용자 대면 CTA가 "기존 스킬 대체" → "기존 스킬의 역할 이어받기"로 변경

### 불필요한 복잡도 체크 (세션 종료 전 1회)

체크 결과: 추가된 복잡도는 (a) skill-ia-creation-flow.md 신규 문서 1건, (b) skill-ia.md v13 편집 8건. 신규 문서는 "IA 결정의 단일 출처"라는 명확한 역할을 부여받았고, v13 편집은 모두 기존 내용의 교체·제거·구체화로 순증가가 없다. v12에서 추가됐던 `partial_pass` 메타데이터와 "부분 PASS" 뱃지는 오히려 제거되어 IA가 단순해졌다. 단순화 기회 있음: 없음.

