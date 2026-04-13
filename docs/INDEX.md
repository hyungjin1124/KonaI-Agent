# KonaI-Agent 문서 인덱스 (Stub)

> 최종 갱신: 2026-04-07
> 상태: **REDIRECT** — 문서 단일 출처는 Obsidian Vault로 이관됨 (Karpathy LLM Wiki 원칙)

---

## 어디서 무엇을 찾는가

KonaI-Agent의 모든 비-코드 산출물은 **Obsidian Vault**에서 단일 출처로 관리한다. `docs/`에는 코드 변경 컨텍스트와 직결된 산출물만 잔류한다.

### Vault (1차 출처) — `KonaChain/`

| 카테고리 | 경로 | 내용 |
|---------|------|------|
| 설계 (IA·와이어프레임·프로토콜) | `KonaI-Agent/설계/` (+ `archive/`) | information-architecture, menu-structure, skill-creation-protocol 등 |
| 기획 (제품 방향성·정책) | `KonaI-Agent/기획/` | 상세기획서, data-access-policy, service-plan, skill-ia-review 등 |
| ADR (아키텍처 결정) | `KonaI-Agent/ADR/` | `ADR-XXXX-*.md` |
| 참조 (외부 자료·다이어그램) | `KonaI-Agent/참조/` (+ `archive/`, `admin/`) | Cowork 슬라이드, permission-system, SVG/PNG 다이어그램 |
| 리서치 — synthesis | `리서치/Insights/{agent-ui,agent-skills,knowledge-data,platform-admin,skill-management-ux,market,open-source}/` | 패턴 분석·트레이드오프·적용 전략 |
| 리서치 — raw | 위 카테고리 하위 `sources/` | 경쟁사·UX 패턴 원문 |
| Vault 메타 가이드 | `KonaI-Agent/_CONTEXT.md`, `리서치/Insights/_CONTEXT.md`, `리서치/AGENTS.md` | 폴더 규약·라우팅 |

Vault 루트 절대경로: `/Users/hyungjin/Documents/Obsidian Vault/KonaChain`

### docs/ (코드 저장소 잔존)

| 경로 | 내용 | 사유 |
|------|------|------|
| `reports/` | 코드리뷰·UX리뷰·우선순위·진행 리포트 | 코드 변경 컨텍스트와 직결 |
| `references/*.{xlsx,docx,html}` | 데이터 권한 모델, 관리자 HTML 프로토타입, 데모 시나리오 | 바이너리/오피스 파일 (Vault 텍스트·이미지 원칙) |
| `INDEX.md` | (본 문서) Vault 리다이렉트 스텁 | |

---

## catalog ↔ 문서 매핑

`specs/component-catalog.yaml`의 `obsidian_sources` 필드는 Vault 루트(`KonaChain`) 기준 상대 경로다. 예:

```yaml
obsidian_sources:
  - "리서치/Insights/agent-ui/patterns/markdown-renderer.md"
  - "KonaI-Agent/설계/menu-structure.md"
```

상세 가이드: 본 저장소의 `CLAUDE.md` § Obsidian Vault 섹션 참조.

---

## 이관 이력

- **2026-04-07** Karpathy Wiki 통합 이관: design(31) + planning(7) + 20-decisions(1) + references md/이미지(30) + 잔존 research(30) → Vault 99파일 이전. 스크립트: `specs/migration/step3-konai-wiki-unification.py`. 빈 폴더 정리 완료.
- **2026-04-07** C2~C8 batch (9파일) → `리서치/Insights/{agent-ui,agent-skills,knowledge-data}/sources/`. 스크립트: `specs/migration/step3-c-batch-migration.py`.
