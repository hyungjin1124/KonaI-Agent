# QA Report: Agent Marketplace / Store

## 판정: PASS

---

## Acceptance Criteria 검증

| # | Criteria | Dev 판정 | QA 판정 | 불일치 | 비고 |
|---|----------|---------|---------|--------|------|
| AC1 | 카드 그리드 + 카테고리 필터 + 검색 (10개+) | PASS | PASS | - | 12개 플러그인, 6개 카테고리, 태그/publisher/description 검색 확인 |
| AC2 | 플러그인 상세: MCP Servers, Skills, 권한 표시 | PASS | PASS | - | PluginDetailSheet: 도구 목록+토글, 권한 목록, TypeBadge(Server/App/Skill) 확인 |
| AC3 | 원클릭 설치 → OAuth 동의 시뮬레이션 → 활성화 토글 | PASS | PARTIAL | ⚠️ | 설치+활성화 정상 동작. OAuth 동의 시뮬레이션 미구현 (confirm 대신 즉시 설치). dev-test.md에 Phase 2 연기 명시. Minor 수준 |
| AC4 | 내 설치 목록: 활성화/비활성화/제거 관리 | PASS | PASS | - | installed 탭 필터, Switch 토글, 제거+카운트 업데이트 확인 |
| AC5 | AdminView 마켓플레이스 탭 통합 | PASS | PASS | - | TabsTrigger value="marketplace" + Store 아이콘 + TabsContent 확인 |
| AC6 | 최소 4개 카테고리 | PASS | PASS | - | 6개 카테고리 (데이터분석/생산성/커뮤니케이션/개발/보안/인프라) |
| AC7 | 반응형 카드 그리드 열 수 조정 | PASS | PASS | - | grid-cols-1 md:grid-cols-2 lg:grid-cols-3 확인 |
| AC8 | 플러그인 상태 뱃지 (설치됨/미설치/업데이트) | PASS | PASS | - | StatusBadge 3가지 상태 + 색상 분기 확인 |

- Dev 일치율: 87.5% (AC3에서 불일치)
- QA 독립 판정: 7/8 passed, 1 partial

---

## 엣지 케이스 테스트

| # | 시나리오 | 결과 | 심각도 | 상세 |
|---|---------|------|--------|------|
| 1 | 빈 데이터 (검색 매칭 0건) | PASS | - | "검색 결과가 없습니다." 빈 상태 메시지 정상 표시 |
| 2 | 빈 데이터 (설치 플러그인 0건) | PASS | - | "설치된 플러그인이 없습니다." 빈 상태 메시지 정상 표시 |
| 3 | 긴 텍스트 (설명) | PASS | - | line-clamp-2로 잘림 처리 |
| 4 | 태그 검색 | PASS | - | filterPlugins에서 tags 배열 검색 구현 확인 |
| 5 | publisher 검색 | PASS | - | publisher.toLowerCase() 포함 |
| 6 | 대소문자 무시 검색 | PASS | - | toLowerCase() 일관 적용 |
| 7 | 검색 + 카테고리 필터 조합 | PASS | - | 두 필터 AND 조합 정상 동작 |
| 8 | 검색 클리어 후 결과 복원 | PASS | - | 전체 목록 복원 확인 |
| 9 | 빠른 설치/제거 반복 | PASS | - | 상태 정합성 유지 |
| 10 | 빠른 카테고리 전환 | PASS | - | 최종 선택 카테고리 기준 필터 정상 |
| 11 | Enter 키 카드 열기 | PASS | - | onKeyDown Enter → Sheet 열림 확인 |
| 12 | 카드 tabIndex=0 | PASS | - | 키보드 포커스 가능 |
| 13 | 상세 Sheet 설치 상태 동기화 | PASS | - | 카드에서 설치 → Sheet에 반영 (currentSelectedPlugin) |
| 14 | 설치 후 installed 카운트 증가 | PASS | - | `내 설치 (N+1)` 확인 |
| 15 | 제거 후 installed 카운트 감소 | PASS | - | `내 설치 (N-1)` 확인 |
| 16 | 탭 전환 후 카테고리 필터 유지 | PASS | - | installed → catalog 복귀 시 필터 유지 |
| 17 | filterPlugins: 전체 필터 없음 | PASS | - | 12개 전체 반환 |
| 18 | filterPlugins: installed 탭에 update_available 포함 | PASS | - | update_available도 설치 목록에 표시 |
| 19 | filterPlugins: installed 탭에 available 제외 | PASS | - | available 플러그인 제외 확인 |
| 20 | formatInstalls: 백만 단위 | PASS | - | 1.5M 확인 |
| 21 | formatInstalls: 천 단위 | PASS | - | 12.4K 확인 |
| 22 | formatInstalls: 소수 | PASS | - | 999 확인 |
| 23 | 설치된 플러그인만 도구 토글 표시 | PASS | - | isInstalled 조건부 렌더링 확인 |
| 24 | 미설치 플러그인 도구 토글 숨김 | PASS | - | Switch 미렌더링 확인 |
| 25 | 상세 Sheet 버전/평점/설치수/도구수 표시 | PASS | - | v4.2.1, 4.9, 67.3K, 4 확인 |
| 26 | 상세 Sheet 태그 표시 | PASS | - | 코드, PR 태그 확인 |
| 27 | Sheet 제거 버튼으로 제거 | PASS | - | 카드에 미설치 반영 확인 |
| 28 | 카드 클릭 시 카드 내부 버튼 전파 차단 | PASS | - | stopPropagation 확인 |

- 추가 테스트 작성: 28개 (AgentMarketplaceView.qa.test.tsx)
- 통과: 28개, 실패: 0개

---

## UX 플로우 검증

### 콜백 배선 감사

| # | Provider/Component | 콜백 Prop | 연결 상태 | 심각도 | 비고 |
|---|-------------------|-----------|----------|--------|------|
| 1 | PluginCard | onSelect | ✅ | - | handleSelect → setSelectedPlugin + setIsDetailOpen |
| 2 | PluginCard | onInstall | ✅ | - | handleInstall → plugins + selectedPlugin 동시 업데이트 |
| 3 | PluginCard | onUninstall | ✅ | - | handleUninstall → plugins + selectedPlugin 동시 업데이트 |
| 4 | PluginCard | onToggle | ✅ | - | handleToggle → plugins + selectedPlugin 동시 업데이트 |
| 5 | PluginDetailSheet | onInstall | ✅ | - | handleInstall 공유 |
| 6 | PluginDetailSheet | onUninstall | ✅ | - | handleUninstall + onOpenChange(false) |
| 7 | PluginDetailSheet | onToggle | ✅ | - | handleToggle 공유 |
| 8 | PluginDetailSheet | onToolToggle | ✅ | - | handleToolToggle → plugins + selectedPlugin tools 동시 업데이트 |
| 9 | PluginDetailSheet | onOpenChange | ✅ | - | setIsDetailOpen |

- plan.md 통합 지점 대조: 1/1 연결 확인 (AdminView 탭 통합)

### 이중 상태 동기화

| # | 상태 A | 상태 B | A→B 경로 | B→A 경로 | 결과 |
|---|--------|--------|---------|---------|------|
| 1 | plugins (useState) | selectedPlugin (useState) | handleInstall/Uninstall/Toggle에서 동시 업데이트 | currentSelectedPlugin (useMemo) plugins 기반 재파생 | ✅ |

비고: `selectedPlugin`은 직접 상태이지만, 실제 Sheet 렌더링은 `currentSelectedPlugin` (plugins에서 find)을 사용하여 동기화를 보장. 단, `handleInstall/Uninstall/Toggle`에서 `setSelectedPlugin`도 직접 업데이트하여 이중 경로 존재. 현재 구현에서는 두 경로 모두 동일 결과를 보장하므로 문제 없음.

### 종료 상태 시나리오

| # | 시나리오 | 기대 동작 | 실제 동작 | 결과 | 심각도 |
|---|---------|----------|----------|------|--------|
| 1 | 설치된 플러그인 전부 제거 (installed 탭) | 빈 상태 UI + 카운트 0 | "설치된 플러그인이 없습니다." + 내 설치 (0) | PASS | - |
| 2 | 카테고리 필터로 0건 시나리오 | 카테고리 내 모든 항목이 없을 경우 빈 상태 | 현재 모든 카테고리에 1개+ 플러그인 존재. 빈 카테고리 시나리오는 발생하지 않음 | N/A | - |

### 핵심 사용자 플로우

#### Flow 1: Browse → Filter → Select → Install → Manage
```
[카탈로그 방문] → [12개 카드 렌더] → [카테고리 필터 클릭] → [필터링] →
[카드 클릭] → [handleSelect] → [Sheet 열림] →
[설치 클릭] → [handleInstall] → [status: installed, isEnabled: true] →
[내 설치 탭] → [installed 필터] → [플러그인 확인]
```
기대: 설치된 플러그인이 내 설치 탭에 표시
결과: PASS

#### Flow 2: Install → Configure Tools → Disable → Uninstall
```
[설치 클릭] → [handleInstall] → [상세 열기] →
[도구 토글] → [handleToolToggle] → [tools[i].enabled 변경] →
[비활성화] → [handleToggle] → [isEnabled: false] →
[제거] → [handleUninstall + onOpenChange(false)] → [status: available]
```
기대: 제거 후 카드에 "미설치" 뱃지, Sheet 닫힘
결과: PASS

#### Flow 3: Search → No results → Clear → Restore
```
[검색 입력] → [filterPlugins] → [0건 매칭] →
[빈 상태 UI 표시] → [검색 클리어] →
[filterPlugins(no search)] → [전체 12개 복원]
```
기대: 전체 목록 복원
결과: PASS

- 플로우 테스트 작성: 15개 (AgentMarketplaceView.flow.qa.test.tsx)
- 통과: 15개, 실패: 0개

---

## 통합 테스트

- 컴포넌트 통합: PASS (AdminView.tsx — TabsTrigger "marketplace" + TabsContent + AgentMarketplaceView import 확인)
- 빌드 통합: PASS (Next.js build 성공)
- 타입 호환성: PASS (tsc --noEmit에서 agent-marketplace 관련 에러 0건)

---

## 접근성 검증

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | ARIA 속성 | PASS | Switch에 aria-label, 제거 버튼에 aria-label, 도구 토글에 aria-label |
| 2 | 키보드 접근성 | PASS | 카드: role="button" + tabIndex=0 + Enter 핸들러. Sheet/Switch/Button: Radix 기본 지원 |
| 3 | 포커스 관리 | PASS | Sheet: Radix 포커스 트래핑. 카드 내 액션: stopPropagation으로 분리 |
| 4 | 색상 대비 | PASS | gray-900/600/500 텍스트, green/amber/blue 뱃지 모두 적절한 대비 |
| 5 | 스크린리더 | PASS | SheetTitle, aria-label, role="button" 구조 |

Minor 참고: 제거 버튼이 `opacity-0 group-hover:opacity-100`으로 hover 시에만 보이지만, aria-label이 있어 스크린리더 접근 가능. `focus-within:opacity-100` 추가 시 키보드 사용자 UX 개선 가능.

---

## 발견된 이슈

### 심각도: Critical (배포 차단)
(없음)

### 심각도: Major (수정 강력 권고)
(없음)

### 심각도: Minor (후속 수정 가능)
- [ ] AC3 OAuth 동의 시뮬레이션 미구현 — 즉시 설치로 대체. Phase 2에서 동의 모달 추가 예정 (dev-test.md 명시)
- [ ] 제거 버튼 키보드 포커스 시 시각적 표시 부재 — `AgentMarketplaceView.tsx:133` `opacity-0 group-hover:opacity-100`에 `group-focus-within:opacity-100` 추가 권장
- [ ] 검색 Input에 `aria-label` 미설정 — placeholder("플러그인 검색...")가 대체하나, 명시적 aria-label 권장

---

## 수정 요청

PASS 판정이므로 수정 사이클 불필요.
