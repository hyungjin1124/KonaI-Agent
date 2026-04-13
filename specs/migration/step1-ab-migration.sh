#!/usr/bin/env bash
# ------------------------------------------------------------------
# Step 1: A·B 카테고리 리스크 제로 이관 스크립트
# ------------------------------------------------------------------
# 대상 (duplication-report.md §1, §2):
#   A1. Vault/UI/admin-ia.en.md   (MD5 동일, 삭제)
#   A2. Vault/UI/data-ia.en.md    (MD5 동일, 삭제)
#   B1. Vault/UI/data-ia.md       (docs가 SoT → archive로 이동)
#   B2. Vault/UI/03-skill-ia.md   (docs가 SoT → archive로 이동)
#
# 그 후 docs 측 정본 4개를 Vault/KonaI-Agent/설계/로 복사:
#   docs/design/ia-design/admin-ia.en.md
#   docs/design/ia-design/data-ia.en.md
#   docs/design/ia-design/data-ia.md
#   docs/design/ia-design/skill-ia.md
#
# 사용법:
#   ./step1-ab-migration.sh            # dry-run (기본, 아무것도 변경 안 함)
#   ./step1-ab-migration.sh --execute  # 실제 실행
#
# 종료 코드: 0=성공, 1=검증 실패, 2=파일 없음
# ------------------------------------------------------------------

set -euo pipefail

# --- 모드 결정 ---
MODE="dry-run"
if [[ "${1:-}" == "--execute" ]]; then
  MODE="execute"
fi

# --- 경로 설정 (sandbox 마운트 기준) ---
REPO="/sessions/focused-busy-ritchie/mnt/KonaI-Agent"
VAULT="/sessions/focused-busy-ritchie/mnt/KonaChain"

DOCS_IA="$REPO/docs/design/ia-design"
VAULT_UI="$VAULT/UI"
VAULT_UI_ARCHIVE="$VAULT_UI/archive"
VAULT_KONAI_DESIGN="$VAULT/KonaI-Agent/설계"

# --- 색상 ---
R='\033[0;31m'; G='\033[0;32m'; Y='\033[1;33m'; B='\033[0;34m'; N='\033[0m'

log()   { echo -e "${B}[info]${N} $*"; }
ok()    { echo -e "${G}[ ok ]${N} $*"; }
warn()  { echo -e "${Y}[warn]${N} $*"; }
err()   { echo -e "${R}[err ]${N} $*" >&2; }
plan()  { echo -e "${Y}[PLAN]${N} $*"; }

run() {
  # dry-run 모드면 커맨드만 출력, execute 모드면 실행
  if [[ "$MODE" == "execute" ]]; then
    "$@"
  else
    echo "       \$ $*"
  fi
}

# --- 헤더 ---
echo "================================================================"
echo "  Step 1 A·B Migration  |  Mode: $MODE"
echo "================================================================"
log "REPO : $REPO"
log "VAULT: $VAULT"
echo

# ---------------------------------------------------------------
# Phase 0: 사전 검증 (dry-run/execute 공통)
# ---------------------------------------------------------------
log "Phase 0: 사전 검증"

REQUIRED_FILES=(
  "$DOCS_IA/admin-ia.en.md"
  "$DOCS_IA/data-ia.en.md"
  "$DOCS_IA/data-ia.md"
  "$DOCS_IA/skill-ia.md"
  "$VAULT_UI/admin-ia.en.md"
  "$VAULT_UI/data-ia.en.md"
  "$VAULT_UI/data-ia.md"
  "$VAULT_UI/03-skill-ia.md"
)

missing=0
for f in "${REQUIRED_FILES[@]}"; do
  if [[ -f "$f" ]]; then
    ok "존재: $f"
  else
    err "누락: $f"
    missing=$((missing+1))
  fi
done
if (( missing > 0 )); then
  err "필수 파일 ${missing}개 누락 — 중단"
  exit 2
fi

# MD5 검증 — A 카테고리 바이너리 동일성 재확인
echo
log "Phase 0-1: A 카테고리 MD5 재검증 (삭제 전 안전장치)"
declare -A PAIRS_A=(
  ["$VAULT_UI/admin-ia.en.md"]="$DOCS_IA/admin-ia.en.md"
  ["$VAULT_UI/data-ia.en.md"]="$DOCS_IA/data-ia.en.md"
)
for v in "${!PAIRS_A[@]}"; do
  d="${PAIRS_A[$v]}"
  vmd5=$(md5sum "$v" | awk '{print $1}')
  dmd5=$(md5sum "$d" | awk '{print $1}')
  if [[ "$vmd5" == "$dmd5" ]]; then
    ok "MD5 일치 ($vmd5) : $(basename "$v")"
  else
    err "MD5 불일치!  Vault=$vmd5  docs=$dmd5  ($(basename "$v"))"
    err "A 카테고리 가정이 깨짐 — 수동 diff 리뷰 필요. 중단."
    exit 1
  fi
done

# B 카테고리는 divergence 확인 (diff 있어야 정상)
echo
log "Phase 0-2: B 카테고리 divergence 확인 (diff가 있어야 정상)"
for pair in "$VAULT_UI/data-ia.md:$DOCS_IA/data-ia.md" \
            "$VAULT_UI/03-skill-ia.md:$DOCS_IA/skill-ia.md"; do
  v="${pair%%:*}"; d="${pair##*:}"
  diff_lines=$({ diff "$v" "$d" || true; } | wc -l | tr -d ' ')
  if (( diff_lines > 0 )); then
    ok "diff=$diff_lines 라인  : $(basename "$v") vs $(basename "$d")"
  else
    warn "diff=0  — 두 파일이 동일. archive 이동 대신 A 카테고리로 처리 검토."
  fi
done

# ---------------------------------------------------------------
# Phase 1: 대상 디렉토리 생성
# ---------------------------------------------------------------
echo
log "Phase 1: 대상 디렉토리 준비"
plan "mkdir -p  $VAULT_UI_ARCHIVE"
run mkdir -p "$VAULT_UI_ARCHIVE"
plan "mkdir -p  $VAULT_KONAI_DESIGN"
run mkdir -p "$VAULT_KONAI_DESIGN"

# ---------------------------------------------------------------
# Phase 2: A 카테고리 삭제 (MD5 동일 검증 완료)
# ---------------------------------------------------------------
echo
log "Phase 2: A 카테고리 Vault 사본 삭제"
for f in "$VAULT_UI/admin-ia.en.md" "$VAULT_UI/data-ia.en.md"; do
  plan "rm  $f"
  run rm "$f"
done

# ---------------------------------------------------------------
# Phase 3: B 카테고리 → Vault archive 이동
# ---------------------------------------------------------------
echo
log "Phase 3: B 카테고리 Vault 구버전 → archive 이동"
for f in "$VAULT_UI/data-ia.md" "$VAULT_UI/03-skill-ia.md"; do
  dest="$VAULT_UI_ARCHIVE/$(basename "$f")"
  plan "mv  $f  $dest"
  run mv "$f" "$dest"
done

# ---------------------------------------------------------------
# Phase 4: docs 정본 4개 → Vault/KonaI-Agent/설계/ 복사
# ---------------------------------------------------------------
# 주의: docs/는 여전히 repo SoT로 남김. Vault는 Obsidian에서 뷰로 사용.
# Step 4(파이프라인 정합성)에서 심볼릭 링크로 정리하기 전까지는 복사본 유지.
echo
log "Phase 4: docs 정본 → Vault/KonaI-Agent/설계/ 복사"
SOURCES=(
  "$DOCS_IA/admin-ia.en.md"
  "$DOCS_IA/data-ia.en.md"
  "$DOCS_IA/data-ia.md"
  "$DOCS_IA/skill-ia.md"
)
for src in "${SOURCES[@]}"; do
  dest="$VAULT_KONAI_DESIGN/$(basename "$src")"
  plan "cp -p  $src  $dest"
  run cp -p "$src" "$dest"
done

# ---------------------------------------------------------------
# Phase 5: 사후 검증 (execute 모드에서만 의미 있음)
# ---------------------------------------------------------------
echo
log "Phase 5: 사후 검증"
if [[ "$MODE" == "execute" ]]; then
  # 삭제 확인
  for f in "$VAULT_UI/admin-ia.en.md" "$VAULT_UI/data-ia.en.md"; do
    if [[ ! -e "$f" ]]; then ok "삭제 확인: $(basename "$f")"; else err "삭제 실패: $f"; fi
  done
  # 이동 확인
  for f in "data-ia.md" "03-skill-ia.md"; do
    if [[ -f "$VAULT_UI_ARCHIVE/$f" && ! -e "$VAULT_UI/$f" ]]; then
      ok "archive 이동 확인: $f"
    else
      err "archive 이동 실패: $f"
    fi
  done
  # 복사본 MD5 일치 확인
  for src in "${SOURCES[@]}"; do
    dest="$VAULT_KONAI_DESIGN/$(basename "$src")"
    if [[ -f "$dest" ]]; then
      smd5=$(md5sum "$src" | awk '{print $1}')
      dmd5=$(md5sum "$dest" | awk '{print $1}')
      if [[ "$smd5" == "$dmd5" ]]; then
        ok "복사 MD5 일치: $(basename "$src")"
      else
        err "복사 MD5 불일치: $src → $dest"
      fi
    else
      err "복사 누락: $dest"
    fi
  done
else
  warn "dry-run 모드 — 실제 변경 없음. 위 PLAN 라인들이 실제 실행 시 수행될 명령."
fi

# ---------------------------------------------------------------
# Phase 6: 후속 작업 안내 (catalog 경로 치환)
# ---------------------------------------------------------------
echo
log "Phase 6: 후속 작업 안내 (Step 4에서 처리)"
cat <<'EOF'

이 스크립트는 파일 시스템 이관만 수행합니다. 다음은 별도 작업:

  1) specs/component-catalog.yaml 의 source_files 경로 참조 중
     - "Vault/UI/admin-ia.en.md"   → "KonaI-Agent/설계/admin-ia.en.md"
     - "Vault/UI/data-ia.en.md"    → "KonaI-Agent/설계/data-ia.en.md"
     - "Vault/UI/data-ia.md"       → "KonaI-Agent/설계/data-ia.md"
     - "Vault/UI/03-skill-ia.md"   → "KonaI-Agent/설계/skill-ia.md"
     (obsidian_sources 필드도 동일 치환)

  2) docs/ 측은 이 단계에서 건드리지 않음 — Step 4(심볼릭 링크)까지
     docs/가 여전히 repo의 SoT이고, Vault는 Obsidian 뷰 사본.

  3) 이 스크립트를 --execute로 실행한 직후에는 반드시:
       git -C "$REPO" status
       (cd "$VAULT" && git status)       # Vault가 git 추적 중이면
     로 변경 집합을 커밋 전에 확인할 것.

EOF

echo "================================================================"
ok "Step 1 $MODE 종료"
echo "================================================================"
