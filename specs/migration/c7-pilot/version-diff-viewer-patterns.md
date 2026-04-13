---
type: insight-synthesis
topic_id: version-diff-viewer-patterns
topic_name: "Version Diff Viewer Patterns (Prose / Non-Developer)"
category: agent-ui
document_level: specific
parent_broad:
  - skill-management-ui
  - version-history-patterns
related_patterns:
  - diff-review-patterns
catalog_components:
  - skill_version_history
  - skill_diff_viewer
tags:
  - insight
  - agent-ui
  - pattern
  - diff
  - version-history
  - skill-management
  - non-developer
status: draft
confidence: high
last_updated: "2026-03-25"
source_products:
  - GitHub
  - Google Docs
  - Notion
  - WordPress
  - Confluence
source_files:
  - docs/research/skill-management/diff-viewer-patterns-R2.md
auto_update:
  enabled: true
  keywords:
    - diff viewer
    - version compare
    - word-level diff
    - revision history
  feeds: []
  review_trigger:
    mode: "manual"
    threshold: 3
    priority_override: false
relevant_roles:
  - frontend_agent
  - design_agent
---

# Version Diff Viewer Patterns (Prose / Non-Developer)

## TL;DR

- **Confluence + Google Docs**가 비개발자 대상 자연어 diff의 올바른 참조 모델. GitHub 방식 코드 diff는 비개발자에게 시각적 노이즈가 많아 부적합 [^1][^2][^5].
- **단어 수준 하이라이트 (2단계)** — 줄/블록 배경의 연한 색 + 실제 변경 단어의 진한 색 중첩이 자연어에서 정확한 변경 위치 파악에 필수 [^1][^4].
- **접힘/펼침**은 Google Docs·Notion에는 없고 GitHub·Confluence만 제공 — 긴 문서 리뷰에서 차별화 포인트.
- **렌더링 vs 원문**: 비개발자 대상(Google Docs, Notion, Confluence)은 모두 WYSIWYG 렌더링 상태에서 diff를 보여주고, 개발자 대상(GitHub)만 원문. WordPress는 HTML 태그 노출로 혼란(반면교사) [^4].
- **Side-by-side 좁은 폭 대응**은 5개 서비스 모두 약함 — WordPress는 기본 side-by-side이지만 좁은 폭에서 레이아웃 깨짐.
- **AI 요약 ↔ diff 위치 연동**은 5개 서비스 모두 제공하지 않는 미개척 영역.

> **Related Pattern**: Agent가 생성한 artifact를 user가 선택적으로 수정하는 "edit flow"는 별도 패턴이다. [[diff-review-patterns]] 참조.

## Overview

비개발자(PM·기획자 등)가 장문 자연어 문서의 두 버전 사이 변경사항을 빠르게 파악·검토할 수 있도록 돕는 UI 패턴. 스킬 정의(SKILL.md), 위키 페이지, 보고서 등 마크다운/HTML/리치텍스트 문서의 버전 이력 비교에 사용된다. AI가 생성한 artifact의 interactive inpainting은 별개 주제(관련 패턴 참고).

패턴 스펙트럼:
- **코드형 Unified/Split** (GitHub): 줄 단위 + `+`/`-` 접두사, 접힘 지원
- **인라인 제안 모드** (Google Docs): 취소선 + 사용자색 + 댓글 풍선
- **블록 하이라이트** (Notion): 변경 블록만 단색 배경, 삭제/추가 구분 없음
- **강제 Side-by-Side** (WordPress): 좌우 이전/이후, 단어 수준 2단계
- **렌더링 인라인 + 자동 접힘** (Confluence): WYSIWYG 상태에서 변경 표시

## 경쟁사 구현 분석

### GitHub: Unified / Split 토글 [^1]

- Unified와 Split 토글 (우상단), 마지막 선택 기억, 기본값 Unified
- 색상 체계
  - 삭제: 연빨간 배경(#ffeef0) + `-` 접두사
  - 추가: 연녹색 배경(#e6ffec) + `+` 접두사
  - 단어 수준: 줄 내 실제 변경 단어를 더 진한 빨강/녹색으로 2단계 강조
- 접힘: 전후 3줄 맥락, unfold 버튼, 20줄씩 점진 확장, Alt+클릭으로 파일 전체 펼침
- 좁은 폭: Unified 유지, Split은 가로 스크롤, 모바일은 Unified만
- 한계(비개발자 관점): 줄 번호·`@@` hunk 헤더 같은 코드 전용 메타가 노이즈, `+`/`-` 접두사가 직관적이지 않음, 렌더링된 결과 비교 불가

### Google Docs: 제안 모드 + 문서 비교 [^2]

**제안 모드 (Suggesting)**
- 본문 삭제: 사용자별 색상 취소선
- 본문 추가: 사용자별 색상 텍스트
- 우측 댓글 풍선에 제안자/수락/거절
- 사용자별 색상 자동 부여 (녹색/보라/파랑 등)

**문서 비교 (Tools > Compare Documents)**: 두 버전을 비교해 새 문서 생성, 제안 모드 형태로 차이 표시

**버전 기록**: 사이드바 타임라인, 변경 부분 색상 하이라이트

- 접힘 없음 — 전체 WYSIWYG 유지, 긴 문서에서는 댓글 풍선이 네비게이션 역할
- 강점: WYSIWYG 환경에서 가장 직관적, 취소선/컬러가 종이 빨간펜 교정과 유사
- 한계: diff 전용 뷰 부재, 마크다운 원문 diff 불가

### Notion: 페이지 히스토리 [^3]

- `···` 메뉴 > Page History, 시간순 버전 목록
- 선택한 버전을 **전체 렌더링** 상태로 표시, 변경 블록만 연한 노란/베이지 배경
- 삭제/추가 구분 없음 — "이 블록이 변경됨"만 표시
- 접힘 없음, 10분 간격 자동 스냅샷
- 강점: WYSIWYG 렌더링, 블록 단위 단순성
- 한계: 진정한 diff 뷰 부재, 삭제/추가 구분 없음, side-by-side 미지원, 단어 수준 없음

### WordPress: 리비전 비교 (Side-by-Side) [^4]

5개 서비스 중 **유일하게 side-by-side를 기본값**으로 쓰는 비개발자 도구.

- 좌(이전): 연빨간 배경 단락 + 진빨간 단어 (2단계)
- 우(이후): 연녹색 배경 단락 + 진녹색 단어 (2단계)
- "삭제됨(Removed)" / "추가됨(Added)" 명시적 컬럼 헤더
- 상단 **타임라인 슬라이더**로 리비전 간 드래그 이동, "임의의 두 리비전 비교" 체크박스로 비인접 버전 비교
- 변경 없는 필드(제목·발췌 등)는 아예 숨김
- 강점: 직관적 "이전 vs 이후", 단어 수준 하이라이트 정확함, 슬라이더가 시간 흐름 탐색 지원
- 한계: **HTML 원문 노출**(`<p>`, `<a>` 태그가 보임 — 비개발자에게 혼란), 접힘/펼침 없음, 변경 요약 기능 없음, 좁은 폭에서 레이아웃 깨짐

### Confluence: 렌더링 WYSIWYG 인라인 [^5]

- **렌더링 상태**에서 인라인 diff — 5개 중 자연어 문서 diff에 가장 가까운 패턴
- 색상: 추가(녹색 배경), 삭제(분홍/빨강 배경 + 취소선), 일부 버전은 서식 변경(파랑)
- 표·목록·이미지 등 리치 콘텐츠도 렌더링 상태로 변경 표시
- 접힘: 변경 없는 대량 텍스트 자동으로 `. . .` 축약
- `<<` / `>>` 네비게이션으로 인접 버전 간 이동
- 편집기 내 `More options > View changes`로 마지막 게시 이후 변경 즉시 확인
- 한계: Side-by-side 미지원(인라인만), 변경 요약 기능 없음, 단어 수준이 아닌 블록/문단 하이라이트가 될 때가 있어 긴 단락에서 정확한 위치 파악 어려움

## 패턴 비교

### 시각 표현

| 서비스 | 삭제 | 추가 | 비교 단위 | 렌더링 |
|---|---|---|---|---|
| GitHub | 연빨간 + `-` | 연녹색 + `+` | 줄 + 단어 | 원문 |
| Google Docs | 취소선 + 사용자색 | 사용자색 텍스트 | 단어 | WYSIWYG |
| Notion | 블록 노란 배경 | 블록 노란 배경 | 블록 | WYSIWYG |
| WordPress | 연빨강 + 진빨강 단어 | 연녹색 + 진녹색 단어 | 단어 | HTML 원문 |
| Confluence | 분홍 + 취소선 | 녹색 배경 | 블록~단어 | WYSIWYG |

### 접힘/펼침

| 서비스 | 접힘 | 맥락 줄수 | 확장 방식 |
|---|---|---|---|
| GitHub | ✅ 자동 | 전후 3줄 | 20줄씩 / Alt+클릭 전체 |
| Google Docs | ❌ | 전체 | — |
| Notion | ❌ | 전체 | — |
| WordPress | △ 필드 단위만 | — | — |
| Confluence | ✅ 자동 | 변경 영역만 | 말줄임표 클릭 확장 |

### 좁은 폭(400~500px) 대응

| 서비스 | 전략 | 참조 가치 |
|---|---|---|
| GitHub | Unified 자동, Split 비활성화 | ✅ |
| Google Docs | 댓글 풍선 모바일 이동 | ✅ |
| Notion | 렌더링 기반 반응형 | 보통 |
| WordPress | 미최적화, 가로 스크롤 | ❌ |
| Confluence | 인라인 기반, 무난 | ✅ |

### 요약 ↔ 원문 연동

| 서비스 | 변경 요약 | 요약→원문 연동 |
|---|---|---|
| GitHub | PR 설명(수동) | 파일 목차 클릭 스크롤 |
| Google Docs | 제안별 댓글 | 댓글 클릭 → 본문 위치 하이라이트 |
| Notion | — | — |
| WordPress | — | — |
| Confluence | — | `<<` `>>` 인접 버전 이동만 |

### 원문 vs 렌더링

| 서비스 | 대상 | 원문 노출 | 비개발자 적합성 |
|---|---|---|---|
| GitHub | 코드/마크다운 원문 | 항상 | ❌ |
| Google Docs | 렌더링 | 없음 | ✅ |
| Notion | 렌더링 | 없음 | ✅ |
| WordPress | HTML 원문 | 태그 노출 | △ |
| Confluence | 렌더링 | 없음 | ✅ |

## 핵심 인사이트

1. **비개발자 대상 diff의 핵심은 "렌더링 상태에서의 인라인 비교"이다.** GitHub 식 코드 diff 패턴을 그대로 가져오면 안 된다. Confluence/Google Docs 패턴이 올바른 참조 모델.

2. **단어 수준 diff는 자연어에서 필수다.** 줄/블록 수준만으로는 긴 단락에서 정확한 변경 위치를 찾기 어렵다. GitHub과 WordPress가 제공하는 "2단계 하이라이트"(연한 배경 + 진한 단어)가 정답.

3. **변경 없는 영역의 접힘은 차별화 포인트다.** Google Docs·Notion은 접힘이 없어 긴 문서에서 불편. Confluence 말줄임표 + GitHub 점진 확장 결합이 적절.

4. **AI 요약 ↔ diff 위치 연동은 시장에 없는 기능이다.** 5개 서비스 모두 제공하지 않음 — 구현하면 강력한 경쟁 우위.

5. **좁은 패널(400~500px)에서는 Unified 인라인이 정답이다.** Side-by-side는 한국어 문장의 잦은 줄바꿈으로 가독성이 크게 떨어짐. 전체 확장 시에만 side-by-side 토글 제공이 합리적.

6. **용어의 비개발자 적응이 필요하다.** "Unified/Split" 대신 "한 줄 보기/나란히 보기", "diff" 대신 "원문 비교", "삭제됨/추가됨" 대신 "이전/이후" 등 자연어 레이블 사용 권장.

## KonaI-Agent 적용 결정

이 패턴을 기반으로 KonaI-Agent가 어떤 구성을 선택했는지는 ADR에서 관리한다:

→ **[ADR-0001: Skill Version Diff Viewer](../../../../KonaI-Agent/ADR/ADR-0001-skill-version-diff-viewer.md)** (docs/20-decisions/ADR-0001-skill-version-diff-viewer.md)

## References

### External

- Atlassian Support. "View page history — Confluence Cloud"
- Google Docs Help. "Track changes and make suggestions in Google Docs"
- GitHub Docs. "About comparing branches in pull requests"
- WordPress.org. "Revisions"
- Notion Help Center. "Page history"

### Internal

- [[diff-review-patterns]] — AI artifact inpainting / highlight-to-edit (edit flow, 이 파일과 상호 보완)

[^1]: GitHub의 2단계 하이라이트(줄 배경 + 단어 강조)는 자연어 diff에서도 유효한 패턴, 단 `+`/`-` 접두사와 코드 메타 정보는 비개발자 대상에는 제거 필요.
[^2]: Google Docs 제안 모드는 "종이 빨간펜 교정" 메타포로 비개발자에게 가장 친숙. 다만 diff 전용 뷰 부재로 긴 문서 리뷰에는 한계.
[^3]: Notion의 블록 단위 하이라이트는 단순하지만 삭제/추가 구분이 없어 "무엇이" 바뀌었는지 파악 어려움.
[^4]: WordPress의 side-by-side는 명시적 "이전/이후" 레이블로 방향성이 뛰어나지만 HTML 태그 노출이 반면교사.
[^5]: Confluence의 렌더링 상태 인라인 diff + 자동 접힘이 자연어 문서 diff의 가장 완성된 참조 모델.
