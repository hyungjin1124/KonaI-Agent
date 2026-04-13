#!/usr/bin/env python3
"""
Step 3 · C 카테고리 배치 이관 (C2, C3, C4, C5, C6, C8)

C7·C1 파일럿으로 확립된 split-default 규칙 적용.
간소 배치 모드: raw layer만 이관, 신규 synthesis 파일 생성은 스킵.

구성:
  - 9개 docs 파일 → Vault sources/에 raw-research 프론트매터 붙여 이관
  - 8개 기존 Vault synthesis에 related_raw_sources 필드 주입
  - 9개 docs 원본 삭제
  - 신규 폴더: agent-skills/sources/, knowledge-data/sources/

사용법:
    python3 step3-c-batch-migration.py               # dry-run (기본)
    python3 step3-c-batch-migration.py --execute     # 실제 실행
"""
import sys
import os
import shutil
import hashlib
from pathlib import Path

MODE = "execute" if "--execute" in sys.argv else "dry-run"

KONA_AGENT = Path("/sessions/focused-busy-ritchie/mnt/KonaI-Agent")
VAULT = Path("/sessions/focused-busy-ritchie/mnt/KonaChain")
INSIGHTS = VAULT / "리서치" / "Insights"
DOCS = KONA_AGENT / "docs"

# ────────────────────────────────────────────────────────────────
# CASE 정의: (case_id, docs_relpath, category, raw_filename, synthesis_targets[])
#   synthesis_targets는 INSIGHTS 기준 상대 경로
# ────────────────────────────────────────────────────────────────
CASES = [
    # C2: 03-skill.md + 03-skill-more.md → agent-skills/sources/
    ("C2a",
     "research/ux-patterns/03-skill.md",
     "agent-skills",
     "03-skill-ia-research.md",
     ["agent-skills/agent-skill-design.md",
      "agent-skills/agent-marketplace-ecosystem.md",
      "agent-ui/patterns/agent-marketplace-ui.md"]),
    ("C2b",
     "research/ux-patterns/03-skill-more.md",
     "agent-skills",
     "03-skill-more-ia-research.md",
     ["agent-skills/agent-skill-design.md",
      "agent-skills/agent-marketplace-ecosystem.md",
      "agent-ui/patterns/agent-marketplace-ui.md"]),
    # C3: 04-scheduled-tasks.md → agent-ui/sources/
    ("C3",
     "research/ux-patterns/04-scheduled-tasks.md",
     "agent-ui",
     "04-scheduled-tasks-ia-research.md",
     ["agent-ui/patterns/scheduled-agent-tasks.md",
      "agent-ui/patterns/agent-task-scheduling.md"]),
    # C4: rag-knowledge-base-ui-patterns → knowledge-data/sources/
    ("C4",
     "research/ux-patterns/rag-knowledge-base-ui-patterns-2026-03-11.md",
     "knowledge-data",
     "rag-knowledge-base-ui-patterns.md",
     ["knowledge-data/rag-architecture-comparison.md",
      "agent-ui/patterns/knowledge-base-management-ui.md"]),
    # C5: skill-marketplace-ux-analysis → agent-skills/sources/
    ("C5",
     "research/skill-management/skill-marketplace-ux-analysis.md",
     "agent-skills",
     "skill-marketplace-ux-analysis.md",
     ["agent-skills/agent-marketplace-ecosystem.md",
      "agent-ui/patterns/agent-marketplace-ui.md"]),
    # C6: skill-discovery-and-distribution-patterns → agent-skills/sources/
    ("C6",
     "research/skill-management/skill-discovery-and-distribution-patterns.md",
     "agent-skills",
     "skill-discovery-and-distribution-patterns.md",
     ["agent-skills/agent-skill-design.md"]),
    # C8a~c: versioning eval 3개 → agent-ui/sources/
    ("C8a",
     "research/skill-management/skill-versioning-eval-ui-patterns.md",
     "agent-ui",
     "skill-versioning-eval-ui-patterns.md",
     ["agent-ui/patterns/agent-self-review.md"]),
    ("C8b",
     "research/skill-management/skills-eval-ui-patterns.md",
     "agent-ui",
     "skills-eval-ui-patterns.md",
     ["agent-ui/patterns/agent-self-review.md"]),
    ("C8c",
     "research/skill-management/skill-versioning-with-eval-results.md",
     "agent-ui",
     "skill-versioning-with-eval-results.md",
     ["agent-ui/patterns/agent-self-review.md"]),
]


def log(msg):
    print(msg)


def action(desc, fn):
    """dry-run: 설명만 출력 / execute: 실제 실행"""
    if MODE == "execute":
        log(f"  [EXEC] {desc}")
        return fn()
    else:
        log(f"  [DRY ] {desc}")
        return None


def md5(path: Path) -> str:
    h = hashlib.md5()
    h.update(path.read_bytes())
    return h.hexdigest()


def build_raw_frontmatter(case_id, topic_id, category, docs_relpath, synthesis_targets):
    """raw-research 프론트매터 YAML 문자열 생성"""
    synthesized = "\n".join(
        f"  - {Path(t).stem}" for t in synthesis_targets
    )
    return f"""---
type: raw-research
document_level: raw
topic_id: {topic_id}
category: {category}
synthesized_into:
{synthesized}
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
  이관: 2026-04-07 (Step 3 배치 #2 - C 카테고리 split-default 규칙)
  케이스: {case_id}
  원본 내용 1:1 보존. 신규 synthesis 작성은 후속 /research 파이프라인에서 처리.
last_updated: '2026-04-07'
---

"""


def inject_related_raw_sources(synthesis_path: Path, raw_filenames: list):
    """synthesis 파일의 frontmatter에 related_raw_sources 필드 주입/병합

    raw_filenames: stem만 (확장자 없음). 예: ['03-skill-ia-research']
    이미 필드가 있으면 중복 없이 병합, 없으면 last_updated 앞에 삽입.
    """
    content = synthesis_path.read_text(encoding="utf-8")
    lines = content.split("\n")

    if not lines or lines[0].strip() != "---":
        raise ValueError(f"No frontmatter in {synthesis_path}")

    # frontmatter 종료 지점 찾기
    fm_end = None
    for i, ln in enumerate(lines[1:], start=1):
        if ln.strip() == "---":
            fm_end = i
            break
    if fm_end is None:
        raise ValueError(f"Unclosed frontmatter in {synthesis_path}")

    fm_lines = lines[1:fm_end]

    # 이미 related_raw_sources 블록이 있는지 탐지
    existing_idx = None
    existing_items = set()
    for i, ln in enumerate(fm_lines):
        if ln.startswith("related_raw_sources:"):
            existing_idx = i
            # 하위 아이템 수집
            j = i + 1
            while j < len(fm_lines) and (fm_lines[j].startswith("  -") or fm_lines[j].startswith("  - ")):
                item = fm_lines[j].strip().lstrip("-").strip().strip('"').strip("'")
                existing_items.add(item)
                j += 1
            # 기존 블록 범위
            existing_end = j
            break

    merged = sorted(existing_items | set(raw_filenames))
    new_block = ["related_raw_sources:"] + [f"  - {x}" for x in merged]

    if existing_idx is not None:
        # 기존 블록 교체
        fm_lines = fm_lines[:existing_idx] + new_block + fm_lines[existing_end:]
    else:
        # last_updated 앞에 삽입 (없으면 frontmatter 끝에)
        insert_at = len(fm_lines)
        for i, ln in enumerate(fm_lines):
            if ln.startswith("last_updated:"):
                insert_at = i
                break
        fm_lines = fm_lines[:insert_at] + new_block + fm_lines[insert_at:]

    new_content = "---\n" + "\n".join(fm_lines) + "\n---\n" + "\n".join(lines[fm_end + 1:])
    return new_content


# ────────────────────────────────────────────────────────────────
# Phase 0: 사전 검증
# ────────────────────────────────────────────────────────────────
log(f"[Phase 0] 사전 검증  (mode={MODE})")
log("")

missing = []
for case_id, rel, cat, raw_fn, targets in CASES:
    src = DOCS / rel
    if not src.exists():
        missing.append(f"    [MISS] docs: {src}")
    for t in targets:
        p = INSIGHTS / t
        if not p.exists():
            missing.append(f"    [MISS] synthesis: {p}")

if missing:
    log("  ❌ 누락 파일:")
    for m in missing:
        log(m)
    sys.exit(1)
log("  [OK] 9개 docs 원본 존재")
log("  [OK] 8개 Vault synthesis 대상 존재")
log("")

# ────────────────────────────────────────────────────────────────
# Phase 1: sources/ 폴더 생성
# ────────────────────────────────────────────────────────────────
log("[Phase 1] sources/ 폴더 생성")
for cat in ["agent-skills", "agent-ui", "knowledge-data"]:
    sources_dir = INSIGHTS / cat / "sources"
    desc = f"mkdir -p {sources_dir}"
    exists = sources_dir.exists()
    if exists:
        log(f"  [SKIP] 이미 존재: {cat}/sources/")
    else:
        action(desc, lambda p=sources_dir: p.mkdir(parents=True, exist_ok=True))
log("")

# ────────────────────────────────────────────────────────────────
# Phase 2: raw 파일 이관 (9개)
# ────────────────────────────────────────────────────────────────
log("[Phase 2] raw 파일 이관 (9개)")
raw_written = {}  # case_id -> (dest_path, md5)
for case_id, rel, cat, raw_fn, targets in CASES:
    src = DOCS / rel
    dest = INSIGHTS / cat / "sources" / raw_fn
    topic_id = raw_fn.removesuffix(".md")
    fm = build_raw_frontmatter(case_id, topic_id, cat, rel, targets)
    body = src.read_text(encoding="utf-8")
    new_content = fm + body
    desc = f"{case_id}: write {dest.relative_to(VAULT)} ({len(new_content)} bytes)"
    if MODE == "execute":
        dest.write_text(new_content, encoding="utf-8")
        raw_written[case_id] = (dest, hashlib.md5(new_content.encode("utf-8")).hexdigest())
        log(f"  [EXEC] {desc}")
    else:
        log(f"  [DRY ] {desc}")
log("")

# ────────────────────────────────────────────────────────────────
# Phase 3: Vault synthesis에 related_raw_sources 주입 (unique 8개)
# ────────────────────────────────────────────────────────────────
log("[Phase 3] synthesis 프론트매터 주입 (unique 8개)")

# synthesis_path -> [raw_stems]
synth_map = {}
for case_id, rel, cat, raw_fn, targets in CASES:
    raw_stem = raw_fn.removesuffix(".md")
    for t in targets:
        synth_map.setdefault(t, []).append(raw_stem)

for synth_rel, raw_stems in sorted(synth_map.items()):
    synth_path = INSIGHTS / synth_rel
    unique_stems = sorted(set(raw_stems))
    desc = f"inject {synth_rel} ← {unique_stems}"
    if MODE == "execute":
        new_content = inject_related_raw_sources(synth_path, unique_stems)
        synth_path.write_text(new_content, encoding="utf-8")
        log(f"  [EXEC] {desc}")
    else:
        log(f"  [DRY ] {desc}")
log("")

# ────────────────────────────────────────────────────────────────
# Phase 4: docs 원본 삭제 (9개)
# ────────────────────────────────────────────────────────────────
log("[Phase 4] docs 원본 삭제 (9개)")
for case_id, rel, cat, raw_fn, targets in CASES:
    src = DOCS / rel
    desc = f"{case_id}: rm docs/{rel}"
    if MODE == "execute":
        try:
            src.unlink()
            log(f"  [EXEC] {desc}")
        except PermissionError as e:
            log(f"  [FAIL] {desc}: {e}")
            log(f"         → cowork file delete 권한 필요")
    else:
        log(f"  [DRY ] {desc}")
log("")

# ────────────────────────────────────────────────────────────────
# Phase 5: 사후 검증
# ────────────────────────────────────────────────────────────────
log("[Phase 5] 사후 검증")
if MODE != "execute":
    log("  (dry-run: 검증 스킵)")
else:
    ok, fail = 0, 0
    # 5-1. raw 파일 존재 + 크기 > 0
    for case_id, rel, cat, raw_fn, targets in CASES:
        dest = INSIGHTS / cat / "sources" / raw_fn
        if dest.exists() and dest.stat().st_size > 0:
            log(f"  [OK] raw 존재: {cat}/sources/{raw_fn}")
            ok += 1
        else:
            log(f"  [FAIL] raw 누락: {dest}")
            fail += 1
    # 5-2. synthesis에 related_raw_sources 존재
    for synth_rel, raw_stems in sorted(synth_map.items()):
        synth_path = INSIGHTS / synth_rel
        content = synth_path.read_text(encoding="utf-8")
        if "related_raw_sources:" in content.split("---")[1]:
            log(f"  [OK] related_raw_sources 주입됨: {synth_rel}")
            ok += 1
        else:
            log(f"  [FAIL] related_raw_sources 누락: {synth_rel}")
            fail += 1
    # 5-3. docs 원본 삭제 확인
    for case_id, rel, cat, raw_fn, targets in CASES:
        src = DOCS / rel
        if not src.exists():
            log(f"  [OK] docs 삭제됨: {rel}")
            ok += 1
        else:
            log(f"  [FAIL] docs 잔존: {src}")
            fail += 1
    log("")
    log(f"  → {ok} OK / {fail} FAIL")
    if fail > 0:
        sys.exit(2)
log("")

# ────────────────────────────────────────────────────────────────
# Phase 6: 후속 안내
# ────────────────────────────────────────────────────────────────
log("[Phase 6] 후속 안내")
log("  1. 신규 synthesis 파일 작성 (후속 /research 파이프라인):")
log("     - C2: Skill 관리 IA 합성 (03-skill + 03-skill-more)")
log("     - C3: Scheduled Tasks 관찰 축 재통합")
log("     - C4: RAG Knowledge Base UI 관찰 축 재통합")
log("     - C5: Skill Marketplace UX 심층 → 기존 Vault synthesis에 흡수")
log("     - C6: Skill Discovery/Distribution 독립 synthesis")
log("     - C8: Skill Eval/Versioning UI 통합 synthesis (3개 소스)")
log("  2. component-catalog.yaml 엔트리 확인 (옵션 3)")
log("  3. _CONTEXT.md에 sources/ 하위폴더 역할 추가 (옵션 4)")
log("")

if MODE == "dry-run":
    log("💡 실행하려면: python3 step3-c-batch-migration.py --execute")
