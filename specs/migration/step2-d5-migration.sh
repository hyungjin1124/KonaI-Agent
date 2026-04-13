#!/usr/bin/env bash
# ------------------------------------------------------------------
# Step 2: D-5 IA 설계 문서 8개 이관 스크립트
# ------------------------------------------------------------------
# duplication-report.md §D-5 "wiki 계층의 핵심" 8개 파일을
# docs/design/ia-design/ (+ ia-research-plan.md)에서
# Vault/KonaI-Agent/설계/ 로 복사한다.
#
# Step 1과 달리 Vault 쪽에 기존 파일이 없는 순수 신규 복사이므로
# 삭제/이동 단계가 없다. docs/ 원본은 그대로 유지한다
# (Step 4의 심볼릭 링크 정리까지 docs/가 repo SoT).
#
# 대상:
#   1. information-architecture.md
#   2. feature-architecture.md
#   3. menu-structure.md
#   4. admin-ia.md             (한글 원본)
#   5. skill-creation-protocol.md
#   6. skill-creation-protocol-critique.md
#   7. reference-from-plan.md
#   8. ia-research-plan.md     (docs/design/ 직하에 위치)
#
# 사용법:
#   ./step2-d5-migration.sh            # dry-run (기본)
#   ./step2-d5-migration.sh --execute  # 실제 실행
#
# 종료 코드: 0=성공, 1=충돌(덮어쓰기 위험), 2=파일 없음
# ------------------------------------------------------------------

set -euo pipefail

MODE="dry-run"
if [[ "${1:-}" == "--execute" ]]; then
  MODE="execute"
fi

REPO="/sessions/focused-busy-ritchie/mnt/KonaI-Agent"
VAULT="/sessions/focused-busy-ritchie/mnt/KonaChain"

DOCS_IA="$REPO/docs/design/ia-design"
DOCS_DESIGN="$REPO/docs/design"
VAULT_KONAI_DESIGN="$VAULT/KonaI-Agent/설계"

R='\033[0;31m'; G='\033[0;32m'; Y='\033[1;33m'; B='\033[0;34m'; N='\033[0m'
log()  { echo -e "${B}[info]${N} $*"; }
ok()   { echo -e "${G}[ ok ]${N} $*"; }
warn() { echo -e "${Y}[warn]${N} $*"; }
err()  { echo -e "${R}[err ]${N} $*" >&2; }
plan() { echo -e "${Y}[PLAN]${N} $*"; }

run() {
  if [[ "$MODE" == "execute" ]]; then
    "$@"
  else
    echo "       \$ $*"
  fi
}

echo "================================================================"
echo "  Step 2 D-5 Migration  |  Mode: $MODE"
echo "================================================================"
log "REPO : $REPO"
log "VAULT: $VAULT"
echo

# 이관 대상 리스트: src_abs|dest_filename
# 대부분 파일명 그대로, admin-ia.md는 한글 원본이므로 그대로 유지
declare -a MAPPING=(
  "$DOCS_IA/information-architecture.md|information-architecture.md"
  "$DOCS_IA/feature-architecture.md|feature-architecture.md"
  "$DOCS_IA/menu-structure.md|menu-structure.md"
  "$DOCS_IA/admin-ia.md|admin-ia.md"
  "$DOCS_IA/skill-creation-protocol.md|skill-creation-protocol.md"
  "$DOCS_IA/skill-creation-protocol-critique.md|skill-creation-protocol-critique.md"
  "$DOCS_IA/reference-from-plan.md|reference-from-plan.md"
  "$DOCS_DESIGN/ia-research-plan.md|ia-research-plan.md"
)

# ---------------------------------------------------------------
# Phase 0: 원본 존재 확인
# ---------------------------------------------------------------
log "Phase 0: 원본 파일 존재 확인"
missing=0
for entry in "${MAPPING[@]}"; do
  src="${entry%%|*}"
  if [[ -f "$src" ]]; then
    size=$(stat -c%s "$src")
    ok "$(basename "$src")  (${size} B)"
  else
    err "누락: $src"
    missing=$((missing+1))
  fi
done
(( missing > 0 )) && { err "원본 ${missing}개 누락 — 중단"; exit 2; }

# ---------------------------------------------------------------
# Phase 0-1: 충돌 확인 (dest에 기존 파일이 있으면 경고/중단)
# ---------------------------------------------------------------
echo
log "Phase 0-1: 대상 디렉토리 충돌 확인"
conflicts=0
collision_policy=()   # skip | overwrite 식별용 (현재는 중단 정책)
for entry in "${MAPPING[@]}"; do
  src="${entry%%|*}"; name="${entry##*|}"
  dest="$VAULT_KONAI_DESIGN/$name"
  if [[ -f "$dest" ]]; then
    # Step 1에서 이미 복사된 파일(admin-ia.en/data-ia.en/data-ia/skill-ia)은
    # D-5 대상에 포함되지 않으므로 이번 단계에서 충돌은 발생하지 않아야 함.
    smd5=$(md5sum "$src" | awk '{print $1}')
    dmd5=$(md5sum "$dest" | awk '{print $1}')
    if [[ "$smd5" == "$dmd5" ]]; then
      warn "이미 동일 MD5 존재 — 건너뛰기 가능: $name"
    else
      err "충돌(다른 MD5): $dest"
      conflicts=$((conflicts+1))
    fi
  fi
done
if (( conflicts > 0 )); then
  err "${conflicts}개 파일이 대상에 이미 존재(다른 내용). 수동 확인 필요 — 중단"
  exit 1
fi
ok "충돌 없음 — 순수 신규 복사"

# ---------------------------------------------------------------
# Phase 1: 대상 디렉토리 확인 (Step 1에서 이미 만들어져 있어야 함)
# ---------------------------------------------------------------
echo
log "Phase 1: 대상 디렉토리 확인"
if [[ -d "$VAULT_KONAI_DESIGN" ]]; then
  ok "$VAULT_KONAI_DESIGN 존재"
else
  plan "mkdir -p  $VAULT_KONAI_DESIGN"
  run mkdir -p "$VAULT_KONAI_DESIGN"
fi

# ---------------------------------------------------------------
# Phase 2: 복사
# ---------------------------------------------------------------
echo
log "Phase 2: docs → Vault/KonaI-Agent/설계/ 복사"
for entry in "${MAPPING[@]}"; do
  src="${entry%%|*}"; name="${entry##*|}"
  dest="$VAULT_KONAI_DESIGN/$name"
  plan "cp -p  $src  $dest"
  run cp -p "$src" "$dest"
done

# ---------------------------------------------------------------
# Phase 3: 사후 검증
# ---------------------------------------------------------------
echo
log "Phase 3: 사후 검증"
if [[ "$MODE" == "execute" ]]; then
  for entry in "${MAPPING[@]}"; do
    src="${entry%%|*}"; name="${entry##*|}"
    dest="$VAULT_KONAI_DESIGN/$name"
    if [[ -f "$dest" ]]; then
      smd5=$(md5sum "$src" | awk '{print $1}')
      dmd5=$(md5sum "$dest" | awk '{print $1}')
      if [[ "$smd5" == "$dmd5" ]]; then
        ok "MD5 일치: $name"
      else
        err "MD5 불일치: $name"
      fi
    else
      err "복사 누락: $dest"
    fi
  done
else
  warn "dry-run 모드 — 실제 변경 없음."
fi

# ---------------------------------------------------------------
# Phase 4: 후속 작업 안내
# ---------------------------------------------------------------
echo
log "Phase 4: 후속 작업 안내"
cat <<'EOF'

이번 Step 2는 순수 복사. 후속 할 일:

  1) Vault 쪽에서 각 파일 상단 프론트매터에 `source: docs/design/...` 메타
     추가 가능 (Step 5 스키마 갱신과 함께 일괄 처리 가능).

  2) specs/component-catalog.yaml 은 이번 8개 파일을 obsidian_sources로
     직접 참조하지 않으므로 경로 치환 불필요.
     (이미 Step 4a 검증에서 확인됨 — D-5 파일들은 catalog에 언급 없음)

  3) docs/ 원본은 Step 4(심볼릭 링크)까지 그대로 유지. Vault 쪽은 아직
     뷰/사본 역할.

EOF

echo "================================================================"
ok "Step 2 $MODE 종료"
echo "================================================================"
