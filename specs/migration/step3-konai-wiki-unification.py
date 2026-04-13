#!/usr/bin/env python3
"""
Step 3 · KonaI-Agent docs/ → Vault 통합 이관 (Karpathy LLM Wiki 패턴 완성형)

사용자 결정 (2026-04-07):
  1. ADR → Vault KonaI-Agent/ADR/로 이관
  2. references → markdown + 이미지만 Vault, 바이너리(xlsx, docx, html)는 잔류
  3. reports → 전체 잔류

Phase 구조:
  Phase 0: 사전 검증
  Phase 1: Vault 신규 폴더 생성 (KonaI-Agent/{설계,기획,ADR,참조} + 신규 sources/)
  Phase 2: Phase A — design/ → KonaI-Agent/설계/ (D-5 + D-6)
  Phase 3: Phase B — planning/ → KonaI-Agent/기획/ (D-7)
  Phase 4: Phase C — 20-decisions/ → KonaI-Agent/ADR/
  Phase 5: Phase D — references/ md+이미지 → KonaI-Agent/참조/ (구조 유지)
  Phase 6: Phase E — 잔존 research/ → Insights/{category}/sources/ (D-1~D-4, raw-research frontmatter)
  Phase 7: docs 원본 삭제
  Phase 8: 사후 검증 + 통계

사용법:
    python3 step3-konai-wiki-unification.py               # dry-run (기본)
    python3 step3-konai-wiki-unification.py --execute     # 실제 실행
"""
import sys
import shutil
import hashlib
from pathlib import Path

MODE = "execute" if "--execute" in sys.argv else "dry-run"

KONA_AGENT = Path("/sessions/focused-busy-ritchie/mnt/KonaI-Agent")
VAULT = Path("/sessions/focused-busy-ritchie/mnt/KonaChain")
INSIGHTS = VAULT / "리서치" / "Insights"
KONA_VAULT = VAULT / "KonaI-Agent"  # 신규 루트
DOCS = KONA_AGENT / "docs"


# ────────────────────────────────────────────────────────────────
# Phase A·B·C·D 정의: (src_relative, dest_under_kona_vault)
#   1:1 복사 (frontmatter 변경 없음)
# ────────────────────────────────────────────────────────────────

# Phase A: design/ 전체 → 설계/
PHASE_A = [
    # design/ia-design/ root
    ("design/ia-design/admin-ia.en.md", "설계/admin-ia.en.md"),
    ("design/ia-design/admin-ia.md", "설계/admin-ia.md"),
    ("design/ia-design/data-ia.en.md", "설계/data-ia.en.md"),
    ("design/ia-design/data-ia.md", "설계/data-ia.md"),
    ("design/ia-design/feature-architecture.md", "설계/feature-architecture.md"),
    ("design/ia-design/feature-map.html", "설계/feature-map.html"),
    ("design/ia-design/information-architecture.md", "설계/information-architecture.md"),
    ("design/ia-design/menu-structure.md", "설계/menu-structure.md"),
    ("design/ia-design/reference-from-plan.md", "설계/reference-from-plan.md"),
    ("design/ia-design/skill-creation-protocol-critique-v3.md", "설계/skill-creation-protocol-critique-v3.md"),
    ("design/ia-design/skill-creation-protocol-critique.md", "설계/skill-creation-protocol-critique.md"),
    ("design/ia-design/skill-creation-protocol-walkthrough.md", "설계/skill-creation-protocol-walkthrough.md"),
    ("design/ia-design/skill-creation-protocol.md", "설계/skill-creation-protocol.md"),
    ("design/ia-design/skill-creation-wireframe-prompt.md", "설계/skill-creation-wireframe-prompt.md"),
    ("design/ia-design/skill-ia-creation-flow.md", "설계/skill-ia-creation-flow.md"),
    ("design/ia-design/skill-ia.md", "설계/skill-ia.md"),
    # design/ root
    ("design/ia-research-plan.md", "설계/ia-research-plan.md"),
    ("design/ia-tree.html", "설계/ia-tree.html"),
    # design/ia-design/archive/
    ("design/ia-design/archive/admin-ia.md", "설계/archive/ia-design-admin-ia.md"),
    ("design/ia-design/archive/cross-menu-connections.md", "설계/archive/cross-menu-connections.md"),
    ("design/ia-design/archive/dashboard-ia.md", "설계/archive/dashboard-ia.md"),
    ("design/ia-design/archive/data-ia.md", "설계/archive/ia-design-data-ia.md"),
    ("design/ia-design/archive/skill-ia-v5.md", "설계/archive/skill-ia-v5.md"),
    ("design/ia-design/archive/skill-ia-v6.md", "설계/archive/skill-ia-v6.md"),
    ("design/ia-design/archive/skill-ia.md", "설계/archive/ia-design-skill-ia.md"),
    # design/archive/
    ("design/archive/ia-design-prompts.md", "설계/archive/ia-design-prompts.md"),
    ("design/archive/improvement-plan-2026-03-19.md", "설계/archive/improvement-plan-2026-03-19.md"),
    ("design/archive/phase2-implementation-plan.md", "설계/archive/phase2-implementation-plan.md"),
    ("design/archive/platform-admin-ia.md", "설계/archive/platform-admin-ia.md"),
    ("design/archive/skill-management-ia-v2.md", "설계/archive/skill-management-ia-v2.md"),
    ("design/archive/skill-management-ia.md", "설계/archive/skill-management-ia.md"),
]

# Phase B: planning/ → 기획/
PHASE_B = [
    ("planning/KonaI-Agent-상세기획서.md", "기획/KonaI-Agent-상세기획서.md"),
    ("planning/data-access-policy.en.md", "기획/data-access-policy.en.md"),
    ("planning/data-access-policy.md", "기획/data-access-policy.md"),
    ("planning/service-plan.md", "기획/service-plan.md"),
    ("planning/skill-ia-review.md", "기획/skill-ia-review.md"),
    ("planning/skill-menu-brainstorm.md", "기획/skill-menu-brainstorm.md"),
    ("planning/skill-research-gap-analysis.md", "기획/skill-research-gap-analysis.md"),
]

# Phase C: 20-decisions/ → ADR/
PHASE_C = [
    ("20-decisions/ADR-0001-skill-version-diff-viewer.md", "ADR/ADR-0001-skill-version-diff-viewer.md"),
]

# Phase D: references/ md + 이미지 → 참조/ (구조 유지)
PHASE_D = [
    # root md
    ("references/permission-system.md", "참조/permission-system.md"),
    # Claude-Cowork md (16개)
    ("references/Claude-Cowork/2026_AI_Trend_Slides/00_metadata.md", "참조/Claude-Cowork/2026_AI_Trend_Slides/00_metadata.md"),
    ("references/Claude-Cowork/2026_AI_Trend_Slides/01_cover.md", "참조/Claude-Cowork/2026_AI_Trend_Slides/01_cover.md"),
    ("references/Claude-Cowork/2026_AI_Trend_Slides/02_agenda.md", "참조/Claude-Cowork/2026_AI_Trend_Slides/02_agenda.md"),
    ("references/Claude-Cowork/2026_AI_Trend_Slides/03_market_overview.md", "참조/Claude-Cowork/2026_AI_Trend_Slides/03_market_overview.md"),
    ("references/Claude-Cowork/2026_AI_Trend_Slides/04_what_is_agentic_ai.md", "참조/Claude-Cowork/2026_AI_Trend_Slides/04_what_is_agentic_ai.md"),
    ("references/Claude-Cowork/2026_AI_Trend_Slides/05_trend_1_operationalization.md", "참조/Claude-Cowork/2026_AI_Trend_Slides/05_trend_1_operationalization.md"),
    ("references/Claude-Cowork/2026_AI_Trend_Slides/06_trend_2_multi_agent.md", "참조/Claude-Cowork/2026_AI_Trend_Slides/06_trend_2_multi_agent.md"),
    ("references/Claude-Cowork/2026_AI_Trend_Slides/07_trend_3_bounded_autonomy.md", "참조/Claude-Cowork/2026_AI_Trend_Slides/07_trend_3_bounded_autonomy.md"),
    ("references/Claude-Cowork/2026_AI_Trend_Slides/08_trend_4_workflow_redesign.md", "참조/Claude-Cowork/2026_AI_Trend_Slides/08_trend_4_workflow_redesign.md"),
    ("references/Claude-Cowork/2026_AI_Trend_Slides/09_trend_5_governance.md", "참조/Claude-Cowork/2026_AI_Trend_Slides/09_trend_5_governance.md"),
    ("references/Claude-Cowork/2026_AI_Trend_Slides/10_case_studies.md", "참조/Claude-Cowork/2026_AI_Trend_Slides/10_case_studies.md"),
    ("references/Claude-Cowork/2026_AI_Trend_Slides/11_adoption_strategy.md", "참조/Claude-Cowork/2026_AI_Trend_Slides/11_adoption_strategy.md"),
    ("references/Claude-Cowork/2026_AI_Trend_Slides/12_implications_next_steps.md", "참조/Claude-Cowork/2026_AI_Trend_Slides/12_implications_next_steps.md"),
    ("references/Claude-Cowork/2026_AI_Trend_Slides/13_qna.md", "참조/Claude-Cowork/2026_AI_Trend_Slides/13_qna.md"),
    ("references/Claude-Cowork/2026_AI_Trend_Slides/99_design_guidelines.md", "참조/Claude-Cowork/2026_AI_Trend_Slides/99_design_guidelines.md"),
    # references/archive md (5개)
    ("references/archive/PPT 생성 시나리오.md", "참조/archive/PPT 생성 시나리오.md"),
    ("references/archive/chatui-refactoring-plan.md", "참조/archive/chatui-refactoring-plan.md"),
    ("references/archive/menu-access.md", "참조/archive/menu-access.md"),
    ("references/archive/tool-ui-refactoring-plan-v2.md", "참조/archive/tool-ui-refactoring-plan-v2.md"),
    ("references/archive/tool-ui-refactoring-plan.md", "참조/archive/tool-ui-refactoring-plan.md"),
    # 이미지 (jpg/png/svg)
    ("references/Claude Cowork with Artifacts.jpg", "참조/Claude Cowork with Artifacts.jpg"),
    ("references/Claude-Cowork/HITL_step_by_step.png", "참조/Claude-Cowork/HITL_step_by_step.png"),
    ("references/Claude-Cowork/file_list.png", "참조/Claude-Cowork/file_list.png"),
    ("references/Claude-Cowork/gen_ppt_tool_calls.png", "참조/Claude-Cowork/gen_ppt_tool_calls.png"),
    ("references/Claude-Cowork/markdown_preview.png", "참조/Claude-Cowork/markdown_preview.png"),
    ("references/multi_layer_data_security_model.svg", "참조/multi_layer_data_security_model.svg"),
    ("references/role_org_mapping_architecture.svg", "참조/role_org_mapping_architecture.svg"),
    ("references/admin/multi_layer_data_security_model.svg", "참조/admin/multi_layer_data_security_model.svg"),
    ("references/admin/role_org_mapping_architecture.svg", "참조/admin/role_org_mapping_architecture.svg"),
]

# ────────────────────────────────────────────────────────────────
# Phase E: 잔존 research/ → Insights sources/ (raw-research frontmatter)
#   (case_id, src_relpath, category, raw_filename)
# ────────────────────────────────────────────────────────────────
PHASE_E = [
    # D-1: ux-patterns 잔존 4개
    ("D1a", "research/ux-patterns/02-data.md", "knowledge-data", "02-data-ia-research.md"),
    ("D1b", "research/ux-patterns/05-admin.md", "platform-admin", "05-admin-ia-research.md"),
    ("D1c", "research/ux-patterns/06-gnb.md", "agent-ui", "06-gnb-ia-research.md"),
    ("D1d", "research/ux-patterns/ai-summary-block-ui-patterns.md", "agent-ui", "ai-summary-block-ui-patterns.md"),
    # D-2: platform-admin 5개
    ("D2a", "research/platform-admin/ai-platform-admin-dashboard-patterns.md", "platform-admin", "ai-platform-admin-dashboard-patterns.md"),
    ("D2b", "research/platform-admin/multi-tenant-lifecycle-and-extension-governance.md", "platform-admin", "multi-tenant-lifecycle-and-extension-governance.md"),
    ("D2c", "research/platform-admin/platform-admin-patterns.md", "platform-admin", "platform-admin-patterns.md"),
    ("D2d", "research/platform-admin/task2-supplementary-research-prompts.md", "platform-admin", "platform-admin-task2-supplementary-research-prompts.md"),
    ("D2e", "research/platform-admin/tenant-lifecycle-ux-patterns.md", "platform-admin", "tenant-lifecycle-ux-patterns.md"),
    # D-3: skill-management 잔존 16개 → skill-management-ux 신규 카테고리
    ("D3a", "research/skill-management/agent-skills-open-standard-analysis.md", "skill-management-ux", "agent-skills-open-standard-analysis.md"),
    ("D3b", "research/skill-management/agent-skills-research.md", "skill-management-ux", "agent-skills-research.md"),
    ("D3c", "research/skill-management/anthropic-skill-creator-2026-march-update.md", "skill-management-ux", "anthropic-skill-creator-2026-march-update.md"),
    ("D3d", "research/skill-management/file-explorer-and-viewer-R6.md", "skill-management-ux", "file-explorer-and-viewer-R6.md"),
    ("D3e", "research/skill-management/multi-tenant-extension-management-patterns.md", "skill-management-ux", "multi-tenant-extension-management-patterns.md"),
    ("D3f", "research/skill-management/research-prompts.md", "skill-management-ux", "research-prompts.md"),
    ("D3g", "research/skill-management/skill-creator-ux-workflow-patterns.md", "skill-management-ux", "skill-creator-ux-workflow-patterns.md"),
    ("D3h", "research/skill-management/skill-ux-research-plan.md", "skill-management-ux", "skill-ux-research-plan.md"),
    ("D3i", "research/skill-management/skill-ux-research-prompts.md", "skill-management-ux", "skill-ux-research-prompts.md"),
    ("D3j", "research/skill-management/skill-ux-supplemental-research.md", "skill-management-ux", "skill-ux-supplemental-research.md"),
    ("D3k", "research/skill-management/supplemental-research-G1-G4.md", "skill-management-ux", "supplemental-research-G1-G4.md"),
    ("D3l", "research/skill-management/table-panel-layout-and-team-discovery-R1-R4.md", "skill-management-ux", "table-panel-layout-and-team-discovery-R1-R4.md"),
    ("D3m", "research/skill-management/task2-supplementary-research-prompts.md", "skill-management-ux", "skill-management-task2-supplementary-research-prompts.md"),
    ("D3n", "research/skill-management/task3-supplementary-research-prompts.md", "skill-management-ux", "task3-supplementary-research-prompts.md"),
    ("D3o", "research/skill-management/team-skill-sharing-patterns.md", "skill-management-ux", "team-skill-sharing-patterns.md"),
    ("D3p", "research/skill-management/usage-metrics-and-copy-ux-R3-R5.md", "skill-management-ux", "usage-metrics-and-copy-ux-R3-R5.md"),
    # D-4: competitor + nvidia
    ("D4a", "research/competitor/competitor-changelog-2026-03-26.md", "market", "competitor-changelog-2026-03-26.md"),
    ("D4b", "research/competitor/competitor-changelog-2026-03-27.md", "market", "competitor-changelog-2026-03-27.md"),
    ("D4c", "research/competitor/supplementary-web-search-2026-03-28.md", "market", "supplementary-web-search-2026-03-28.md"),
    ("D4d", "research/nvidia/nvidia-agent-toolkit.md", "open-source", "nvidia-agent-toolkit.md"),
    ("D4e", "research/nvidia/nvidia-agent-toolkit-deep.md", "open-source", "nvidia-agent-toolkit-deep.md"),
]


def log(msg):
    print(msg)


def build_raw_frontmatter(case_id, topic_id, category, docs_relpath):
    return f"""---
type: raw-research
document_level: raw
topic_id: {topic_id}
category: {category}
synthesized_into: []
tags:
  - raw-research
  - archived
  - {category}
status: archived
confidence: n/a
source_products: []
source_files:
  - '{docs_relpath}'
auto_update:
  enabled: false
note: |
  원본: KonaI-Agent/docs/{docs_relpath}
  이관: 2026-04-07 (Step 3 통합 이관 - Karpathy LLM Wiki 패턴 완성형)
  케이스: {case_id}
  원본 내용 1:1 보존. 신규 synthesis 작성은 후속 /research 파이프라인에서 처리.
last_updated: '2026-04-07'
---

"""


# ────────────────────────────────────────────────────────────────
# Phase 0: 사전 검증
# ────────────────────────────────────────────────────────────────
log(f"[Phase 0] 사전 검증  (mode={MODE})")
log("")

missing = []
all_pairs = []
for src, dst in PHASE_A:
    all_pairs.append(("A", src, KONA_VAULT / dst))
for src, dst in PHASE_B:
    all_pairs.append(("B", src, KONA_VAULT / dst))
for src, dst in PHASE_C:
    all_pairs.append(("C", src, KONA_VAULT / dst))
for src, dst in PHASE_D:
    all_pairs.append(("D", src, KONA_VAULT / dst))
for cid, src, cat, raw_fn in PHASE_E:
    all_pairs.append(("E", src, INSIGHTS / cat / "sources" / raw_fn))

for phase, src_rel, dest in all_pairs:
    src = DOCS / src_rel
    if not src.exists():
        missing.append(f"  [MISS] {phase}: {src}")

if missing:
    log("❌ 누락:")
    for m in missing:
        log(m)
    sys.exit(1)

log(f"  [OK] 총 {len(all_pairs)}개 source 파일 존재")
log(f"       - Phase A (design): {len(PHASE_A)}")
log(f"       - Phase B (planning): {len(PHASE_B)}")
log(f"       - Phase C (ADR): {len(PHASE_C)}")
log(f"       - Phase D (references md+이미지): {len(PHASE_D)}")
log(f"       - Phase E (research → sources/): {len(PHASE_E)}")
log("")

# ────────────────────────────────────────────────────────────────
# Phase 1: Vault 신규 폴더 생성
# ────────────────────────────────────────────────────────────────
log("[Phase 1] Vault 신규 폴더 생성")
new_folders = [
    KONA_VAULT,
    KONA_VAULT / "설계",
    KONA_VAULT / "설계" / "archive",
    KONA_VAULT / "기획",
    KONA_VAULT / "ADR",
    KONA_VAULT / "참조",
    KONA_VAULT / "참조" / "Claude-Cowork" / "2026_AI_Trend_Slides",
    KONA_VAULT / "참조" / "archive",
    KONA_VAULT / "참조" / "admin",
    INSIGHTS / "platform-admin" / "sources",
    INSIGHTS / "skill-management-ux" / "sources",
    INSIGHTS / "market" / "sources",
    INSIGHTS / "open-source" / "sources",
]
for d in new_folders:
    if d.exists():
        log(f"  [SKIP] {d.relative_to(VAULT)} (이미 존재)")
    elif MODE == "execute":
        d.mkdir(parents=True, exist_ok=True)
        log(f"  [EXEC] mkdir {d.relative_to(VAULT)}")
    else:
        log(f"  [DRY ] mkdir {d.relative_to(VAULT)}")
log("")

# ────────────────────────────────────────────────────────────────
# Phase 2~5: 1:1 복사 (Phase A·B·C·D)
# ────────────────────────────────────────────────────────────────
def do_copy(phase_name, pairs, dest_root):
    log(f"[Phase {phase_name}] 1:1 복사 ({len(pairs)}개)")
    for src_rel, dst_rel in pairs:
        src = DOCS / src_rel
        dest = dest_root / dst_rel
        desc = f"{src_rel} → {dest.relative_to(VAULT)}"
        if MODE == "execute":
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dest)
            log(f"  [EXEC] {desc}")
        else:
            log(f"  [DRY ] {desc}")
    log("")


do_copy("A · design → 설계/", PHASE_A, KONA_VAULT)
do_copy("B · planning → 기획/", PHASE_B, KONA_VAULT)
do_copy("C · 20-decisions → ADR/", PHASE_C, KONA_VAULT)
do_copy("D · references → 참조/", PHASE_D, KONA_VAULT)


# ────────────────────────────────────────────────────────────────
# Phase 6: Phase E — 잔존 research/ → Insights sources/ (raw frontmatter)
# ────────────────────────────────────────────────────────────────
log(f"[Phase E] 잔존 research/ → sources/ (raw-research frontmatter, {len(PHASE_E)}개)")
for case_id, src_rel, cat, raw_fn in PHASE_E:
    src = DOCS / src_rel
    dest = INSIGHTS / cat / "sources" / raw_fn
    topic_id = raw_fn.removesuffix(".md")
    fm = build_raw_frontmatter(case_id, topic_id, cat, src_rel)
    body = src.read_text(encoding="utf-8")
    new_content = fm + body
    desc = f"{case_id}: {src_rel} → {dest.relative_to(VAULT)} ({len(new_content)} bytes)"
    if MODE == "execute":
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(new_content, encoding="utf-8")
        log(f"  [EXEC] {desc}")
    else:
        log(f"  [DRY ] {desc}")
log("")

# ────────────────────────────────────────────────────────────────
# Phase 7: docs 원본 삭제
# ────────────────────────────────────────────────────────────────
log("[Phase 7] docs 원본 삭제")
delete_failures = []
for phase, src_rel, dest in all_pairs:
    src = DOCS / src_rel
    desc = f"rm docs/{src_rel}"
    if MODE == "execute":
        try:
            src.unlink()
            log(f"  [EXEC] {desc}")
        except PermissionError as e:
            log(f"  [FAIL] {desc}: {e}")
            delete_failures.append(src_rel)
    else:
        log(f"  [DRY ] {desc}")
log("")

# ────────────────────────────────────────────────────────────────
# Phase 8: 사후 검증
# ────────────────────────────────────────────────────────────────
log("[Phase 8] 사후 검증")
if MODE != "execute":
    log("  (dry-run: 검증 스킵)")
else:
    ok = fail = 0
    # 8-1. dest 존재 + 크기 > 0
    for phase, src_rel, dest in all_pairs:
        if dest.exists() and dest.stat().st_size > 0:
            ok += 1
        else:
            log(f"  [FAIL] dest 누락: {dest}")
            fail += 1
    log(f"  → dest 검증: {ok} OK / {fail} FAIL")

    # 8-2. docs 원본 삭제 확인
    deleted_ok = deleted_fail = 0
    for phase, src_rel, dest in all_pairs:
        src = DOCS / src_rel
        if not src.exists():
            deleted_ok += 1
        else:
            log(f"  [FAIL] docs 잔존: {src_rel}")
            deleted_fail += 1
    log(f"  → 삭제 검증: {deleted_ok} OK / {deleted_fail} FAIL")

    if delete_failures:
        log("")
        log("⚠️  삭제 실패 목록:")
        for f in delete_failures:
            log(f"     {f}")
        log("  → cowork file delete 권한 필요")
        sys.exit(2)

    if fail > 0 or deleted_fail > 0:
        sys.exit(3)

    log("")
    log(f"  ✅ 전체 통과: {len(all_pairs)}개 파일 이관 + 원본 삭제")
log("")

# ────────────────────────────────────────────────────────────────
# Phase 9: 후속 안내
# ────────────────────────────────────────────────────────────────
log("[Phase 9] 후속 안내")
log("  1. Vault/KonaI-Agent/_CONTEXT.md 작성 (구조 메타 가이드)")
log("  2. docs/ 잔존:")
log("     - references/*.{xlsx,docx,html} (사용자 결정에 따라 잔류)")
log("     - reports/** (전체 잔류)")
log("     - INDEX.md (메타파일, Vault 인덱스로 대체 후속)")
log("     - 비어진 폴더(research/, design/, planning/, 20-decisions/) 수동 정리 후속")
log("  3. component-catalog.yaml의 source_files 경로 docs→Vault 일괄 치환 (Step 4)")
log("  4. CLAUDE.md, WIKI.md 업데이트 (Step 5)")
log("")

if MODE == "dry-run":
    log("💡 실행: python3 step3-konai-wiki-unification.py --execute")
