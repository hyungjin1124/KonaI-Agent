#!/usr/bin/env bash
# step3-c7-migration.sh
# C7 pilot: diff-viewer-patterns-R2.md ↔ diff-review-patterns.md 분리 이관
#
# 작업:
#  1) c7-pilot/version-diff-viewer-patterns.md → Vault/리서치/Insights/agent-ui/patterns/
#  2) Vault 기존 diff-review-patterns.md 프론트매터에 related_patterns 추가
#  3) docs/20-decisions/ 생성 + ADR-0001 복사
#  4) docs/research/skill-management/diff-viewer-patterns-R2.md 삭제
#
# 사용:
#   ./step3-c7-migration.sh           # dry-run (기본)
#   ./step3-c7-migration.sh --execute # 실제 실행

set -euo pipefail

MODE="dry-run"
if [[ "${1:-}" == "--execute" ]]; then
  MODE="execute"
fi

REPO="/sessions/focused-busy-ritchie/mnt/KonaI-Agent"
VAULT="/sessions/focused-busy-ritchie/mnt/KonaChain"

PILOT_DIR="$REPO/specs/migration/c7-pilot"
SRC_VDVP="$PILOT_DIR/version-diff-viewer-patterns.md"
SRC_ADR="$PILOT_DIR/ADR-0001-skill-version-diff-viewer.md"

DEST_VDVP="$VAULT/리서치/Insights/agent-ui/patterns/version-diff-viewer-patterns.md"
VAULT_DRP="$VAULT/리서치/Insights/agent-ui/patterns/diff-review-patterns.md"

ADR_DIR="$REPO/docs/20-decisions"
DEST_ADR="$ADR_DIR/ADR-0001-skill-version-diff-viewer.md"

DOCS_ORIG="$REPO/docs/research/skill-management/diff-viewer-patterns-R2.md"

run() {
  if [[ "$MODE" == "execute" ]]; then
    "$@"
  else
    echo "       \$ $*"
  fi
}

hr() { echo "────────────────────────────────────────────────────────────"; }

echo "=== step3-c7-migration (MODE=$MODE) ==="
hr

# ─────────────────────────────────────────────
# Phase 0: 사전 검증
# ─────────────────────────────────────────────
echo "[Phase 0] 사전 검증"
for f in "$SRC_VDVP" "$SRC_ADR" "$VAULT_DRP" "$DOCS_ORIG"; do
  if [[ -f "$f" ]]; then
    echo "  [OK] $f"
  else
    echo "  [FAIL] 누락: $f"; exit 1
  fi
done

if [[ -e "$DEST_VDVP" ]]; then
  echo "  [FAIL] 대상이 이미 존재: $DEST_VDVP"; exit 1
else
  echo "  [OK] 대상 비어 있음: $DEST_VDVP"
fi

if [[ -e "$DEST_ADR" ]]; then
  echo "  [FAIL] ADR 대상이 이미 존재: $DEST_ADR"; exit 1
else
  echo "  [OK] ADR 대상 비어 있음: $DEST_ADR"
fi

# Phase 0-1: 멱등성 체크 (related_patterns 아직 없는지)
if grep -q "version-diff-viewer-patterns" "$VAULT_DRP"; then
  echo "  [FAIL] Vault diff-review-patterns.md에 이미 related_patterns 주입됨 (중복 실행 의심)"; exit 1
else
  echo "  [OK] diff-review-patterns.md related_patterns 미주입 상태"
fi
hr

# ─────────────────────────────────────────────
# Phase 1: docs/20-decisions/ 폴더 생성
# ─────────────────────────────────────────────
echo "[Phase 1] docs/20-decisions/ 생성"
if [[ -d "$ADR_DIR" ]]; then
  echo "  [skip] 이미 존재: $ADR_DIR"
else
  run mkdir -p "$ADR_DIR"
fi
hr

# ─────────────────────────────────────────────
# Phase 2: version-diff-viewer-patterns.md → Vault
# ─────────────────────────────────────────────
echo "[Phase 2] Vault 신규 파일 복사"
run cp "$SRC_VDVP" "$DEST_VDVP"
hr

# ─────────────────────────────────────────────
# Phase 3: Vault diff-review-patterns.md 프론트매터에 related_patterns 주입
# ─────────────────────────────────────────────
echo "[Phase 3] diff-review-patterns.md 프론트매터 업데이트"
# python으로 안전 주입: YAML frontmatter 내 last_updated 바로 위에 삽입
PY_INJECT=$(cat <<'PYEOF'
import sys, pathlib
p = pathlib.Path(sys.argv[1])
txt = p.read_text(encoding='utf-8')
lines = txt.split('\n')
# find frontmatter bounds
if lines[0] != '---':
    sys.exit("no frontmatter")
end = None
for i in range(1, len(lines)):
    if lines[i] == '---':
        end = i
        break
if end is None:
    sys.exit("unterminated frontmatter")
# check already present
fm = '\n'.join(lines[1:end])
if 'related_patterns' in fm:
    sys.exit("related_patterns already present")
# insert before last_updated (or before closing ---)
insert_at = end
for i in range(1, end):
    if lines[i].startswith('last_updated'):
        insert_at = i
        break
new_lines = lines[:insert_at] + [
    'related_patterns:',
    '  - version-diff-viewer-patterns',
] + lines[insert_at:]
p.write_text('\n'.join(new_lines), encoding='utf-8')
print("  [OK] injected related_patterns")
PYEOF
)

if [[ "$MODE" == "execute" ]]; then
  python3 -c "$PY_INJECT" "$VAULT_DRP"
else
  echo "       \$ python3 inject related_patterns into $VAULT_DRP"
fi
hr

# ─────────────────────────────────────────────
# Phase 4: ADR-0001 복사
# ─────────────────────────────────────────────
echo "[Phase 4] ADR 복사"
run cp "$SRC_ADR" "$DEST_ADR"
hr

# ─────────────────────────────────────────────
# Phase 5: docs 원본 삭제
# ─────────────────────────────────────────────
echo "[Phase 5] docs 원본 삭제"
run rm "$DOCS_ORIG"
hr

# ─────────────────────────────────────────────
# Phase 6: 사후 검증
# ─────────────────────────────────────────────
echo "[Phase 6] 사후 검증"
if [[ "$MODE" == "execute" ]]; then
  ok=0; fail=0
  check() {
    if eval "$1"; then
      echo "  [OK] $2"; ok=$((ok+1))
    else
      echo "  [FAIL] $2"; fail=$((fail+1))
    fi
  }
  check "[[ -f '$DEST_VDVP' ]]" "Vault 신규 파일 존재"
  check "[[ -f '$DEST_ADR' ]]" "ADR 파일 존재"
  check "[[ ! -f '$DOCS_ORIG' ]]" "docs 원본 삭제됨"
  check "grep -q 'version-diff-viewer-patterns' '$VAULT_DRP'" "related_patterns 주입됨"
  # MD5 동일성
  md5_src=$(md5sum "$SRC_VDVP" | awk '{print $1}')
  md5_dst=$(md5sum "$DEST_VDVP" | awk '{print $1}')
  check "[[ '$md5_src' == '$md5_dst' ]]" "VDVP MD5 일치"
  md5_src=$(md5sum "$SRC_ADR" | awk '{print $1}')
  md5_dst=$(md5sum "$DEST_ADR" | awk '{print $1}')
  check "[[ '$md5_src' == '$md5_dst' ]]" "ADR MD5 일치"
  echo "  → $ok OK / $fail FAIL"
  [[ $fail -eq 0 ]] || exit 1
else
  echo "  (dry-run: 검증 스킵)"
fi
hr

# ─────────────────────────────────────────────
# Phase 7: 후속 안내
# ─────────────────────────────────────────────
echo "[Phase 7] 후속 작업"
cat <<EOF
  - specs/component-catalog.yaml에 skill_version_history / skill_diff_viewer 엔트리 추가 (별도 PR)
  - ADR 상태: proposed → 구현 착수 시 accepted로 변경
  - C1 파일럿 실시 (01-dashboard.md ↔ dashboard-composition.md)
  - duplication-report.md §3 C 카테고리 재분류
EOF
hr
echo "=== step3-c7-migration 완료 (MODE=$MODE) ==="
