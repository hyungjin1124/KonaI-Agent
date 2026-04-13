#!/usr/bin/env bash
# step3-c1-migration.sh
# C1 pilot: docs/research/ux-patterns/01-dashboard.md 분리 이관 (Option A: Full Split)
#
# 작업:
#  1) Vault/.../Insights/agent-ui/sources/ 폴더 신설
#  2) c1-pilot/home-dashboard-liveboard-ia-patterns.md → Vault/.../patterns/
#  3) c1-pilot/01-dashboard-ia-research.md → Vault/.../sources/
#  4) Vault 기존 dashboard-composition.md 프론트매터에 related_patterns 주입
#  5) docs/research/ux-patterns/01-dashboard.md 삭제
#
# 사용:
#   ./step3-c1-migration.sh           # dry-run (기본)
#   ./step3-c1-migration.sh --execute # 실제 실행

set -euo pipefail

MODE="dry-run"
if [[ "${1:-}" == "--execute" ]]; then
  MODE="execute"
fi

REPO="/sessions/focused-busy-ritchie/mnt/KonaI-Agent"
VAULT="/sessions/focused-busy-ritchie/mnt/KonaChain"

PILOT_DIR="$REPO/specs/migration/c1-pilot"
SRC_PATTERN="$PILOT_DIR/home-dashboard-liveboard-ia-patterns.md"
SRC_RAW="$PILOT_DIR/01-dashboard-ia-research.md"

AGENT_UI_DIR="$VAULT/리서치/Insights/agent-ui"
SOURCES_DIR="$AGENT_UI_DIR/sources"

# dashboard-composition.md는 agent-ui/ 직접 레벨에 있으므로
# 신규 synthesis 파일도 sibling으로 같은 레벨에 배치
DEST_PATTERN="$AGENT_UI_DIR/home-dashboard-liveboard-ia-patterns.md"
DEST_RAW="$SOURCES_DIR/01-dashboard-ia-research.md"

VAULT_DC="$AGENT_UI_DIR/dashboard-composition.md"

DOCS_ORIG="$REPO/docs/research/ux-patterns/01-dashboard.md"

run() {
  if [[ "$MODE" == "execute" ]]; then
    "$@"
  else
    echo "       \$ $*"
  fi
}

hr() { echo "────────────────────────────────────────────────────────────"; }

echo "=== step3-c1-migration (MODE=$MODE) ==="
hr

# ─────────────────────────────────────────────
# Phase 0: 사전 검증
# ─────────────────────────────────────────────
echo "[Phase 0] 사전 검증"
for f in "$SRC_PATTERN" "$SRC_RAW" "$VAULT_DC" "$DOCS_ORIG"; do
  if [[ -f "$f" ]]; then
    echo "  [OK] $f"
  else
    echo "  [FAIL] 누락: $f"; exit 1
  fi
done

if [[ -e "$DEST_PATTERN" ]]; then
  echo "  [FAIL] pattern 대상이 이미 존재: $DEST_PATTERN"; exit 1
else
  echo "  [OK] pattern 대상 비어 있음"
fi

if [[ -e "$DEST_RAW" ]]; then
  echo "  [FAIL] raw 대상이 이미 존재: $DEST_RAW"; exit 1
else
  echo "  [OK] raw 대상 비어 있음"
fi

# Phase 0-1: 멱등성 체크
if grep -q "home-dashboard-liveboard-ia-patterns" "$VAULT_DC"; then
  echo "  [FAIL] dashboard-composition.md에 이미 related_patterns 주입됨"; exit 1
else
  echo "  [OK] dashboard-composition.md related_patterns 미주입 상태"
fi
hr

# ─────────────────────────────────────────────
# Phase 1: sources/ 폴더 신설
# ─────────────────────────────────────────────
echo "[Phase 1] sources/ 폴더 신설"
if [[ -d "$SOURCES_DIR" ]]; then
  echo "  [skip] 이미 존재: $SOURCES_DIR"
else
  run mkdir -p "$SOURCES_DIR"
fi
hr

# ─────────────────────────────────────────────
# Phase 2: synthesis 파일 복사 → patterns/
# ─────────────────────────────────────────────
echo "[Phase 2] synthesis 파일 복사 (patterns/)"
run cp "$SRC_PATTERN" "$DEST_PATTERN"
hr

# ─────────────────────────────────────────────
# Phase 3: raw 파일 복사 → sources/
# ─────────────────────────────────────────────
echo "[Phase 3] raw 파일 복사 (sources/)"
run cp "$SRC_RAW" "$DEST_RAW"
hr

# ─────────────────────────────────────────────
# Phase 4: dashboard-composition.md 프론트매터 주입
# ─────────────────────────────────────────────
echo "[Phase 4] dashboard-composition.md related_patterns 주입"
PY_INJECT=$(cat <<'PYEOF'
import sys, pathlib
p = pathlib.Path(sys.argv[1])
txt = p.read_text(encoding='utf-8')
lines = txt.split('\n')
if lines[0] != '---':
    sys.exit("no frontmatter")
end = None
for i in range(1, len(lines)):
    if lines[i] == '---':
        end = i
        break
if end is None:
    sys.exit("unterminated frontmatter")
fm = '\n'.join(lines[1:end])
if 'related_patterns' in fm:
    sys.exit("related_patterns already present")
insert_at = end
for i in range(1, end):
    if lines[i].startswith('last_updated'):
        insert_at = i
        break
new_lines = lines[:insert_at] + [
    'related_patterns:',
    '  - home-dashboard-liveboard-ia-patterns',
] + lines[insert_at:]
p.write_text('\n'.join(new_lines), encoding='utf-8')
print("  [OK] injected related_patterns")
PYEOF
)

if [[ "$MODE" == "execute" ]]; then
  python3 -c "$PY_INJECT" "$VAULT_DC"
else
  echo "       \$ python3 inject related_patterns into $VAULT_DC"
fi
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
  check "[[ -d '$SOURCES_DIR' ]]" "sources/ 폴더 존재"
  check "[[ -f '$DEST_PATTERN' ]]" "pattern 파일 존재"
  check "[[ -f '$DEST_RAW' ]]" "raw 파일 존재"
  check "[[ ! -f '$DOCS_ORIG' ]]" "docs 원본 삭제됨"
  check "grep -q 'home-dashboard-liveboard-ia-patterns' '$VAULT_DC'" "dashboard-composition.md related_patterns 주입됨"
  m1=$(md5sum "$SRC_PATTERN" | awk '{print $1}'); m2=$(md5sum "$DEST_PATTERN" | awk '{print $1}')
  check "[[ '$m1' == '$m2' ]]" "pattern MD5 일치"
  m1=$(md5sum "$SRC_RAW" | awk '{print $1}'); m2=$(md5sum "$DEST_RAW" | awk '{print $1}')
  check "[[ '$m1' == '$m2' ]]" "raw MD5 일치"
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
  - component-catalog.yaml에 liveboard_home, widget_grid, drill_down_interaction, chat_to_dashboard_pin 엔트리 추가
  - duplication-report.md §3 업데이트 (C 카테고리 split-default 규칙 확정)
  - 나머지 C 카테고리 (C2~C6, C8) split-default 일괄 적용 검토
  - Vault _INDEX.md 또는 _CONTEXT.md에 sources/ 하위폴더 구조 설명 추가
EOF
hr
echo "=== step3-c1-migration 완료 (MODE=$MODE) ==="
