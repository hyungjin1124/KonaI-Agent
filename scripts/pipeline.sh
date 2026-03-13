#!/bin/bash
# ============================================================================
# KonaI-Agent Development Pipeline Orchestrator
# ============================================================================
# 사용법:
#   ./scripts/pipeline.sh                    # 전체 파이프라인 (discover부터, main 기준)
#   ./scripts/pipeline.sh --from=review      # review 단계부터 시작
#   ./scripts/pipeline.sh --from=research    # research 단계부터 시작
#   ./scripts/pipeline.sh --base=develop     # develop 브랜치 기준으로 실행
#   ./scripts/pipeline.sh --discover-only    # discover만 실행
#
# 각 단계는 별도 Claude Code 세션으로 실행되어 컨텍스트 윈도우를 분리한다.
# 파일 기반 핸드오프: discovery report → review decision → catalog → impl logs → qa report
# ============================================================================

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 타임스탬프
TODAY=$(date +%Y-%m-%d)
LOG_DIR="specs/pipeline-logs"
LOG_FILE="${LOG_DIR}/${TODAY}-pipeline.log"

mkdir -p "$LOG_DIR"
mkdir -p "specs/discovery-reports"
mkdir -p "specs/review-decisions"
mkdir -p "specs/implementation-logs"

# ============================================================================
# 유틸리티 함수
# ============================================================================

log() {
    local msg="[$(date '+%H:%M:%S')] $1"
    echo -e "$msg" | tee -a "$LOG_FILE"
}

header() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
    echo -e "${CYAN} $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
    echo ""
    log "=== $1 ==="
}

success() {
    echo -e "${GREEN}✓ $1${NC}"
    log "✓ $1"
}

warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
    log "⚠ $1"
}

error() {
    echo -e "${RED}✗ $1${NC}"
    log "✗ $1"
}

run_claude() {
    local command="$1"
    local args="${2:-}"
    log "Running: claude -p '/${command} ${args}'"

    if caffeinate -i claude -p "/${command} ${args}" --dangerously-skip-permissions --disallowedTools "EnterPlanMode,ExitPlanMode,AskUserQuestion" 2>&1 | tee -a "$LOG_FILE"; then
        return 0
    else
        return 1
    fi
}

# 파이프라인 단계 산출물을 커밋하여 clean working tree 유지
commit_pipeline_artifacts() {
    local stage="$1"
    local msg="$2"

    local files_to_add=()
    case $stage in
        discover)
            files_to_add=(specs/discovery-reports/ specs/pipeline-logs/.last_discovery_report)
            ;;
        review)
            files_to_add=(specs/review-decisions/ specs/component-catalog.yaml specs/pipeline-logs/.last_review_decision)
            ;;
        research)
            files_to_add=(specs/component-catalog.yaml)
            ;;
    esac

    git add "${files_to_add[@]}" 2>/dev/null || true
    if ! git diff --cached --quiet 2>/dev/null; then
        git commit -m "pipeline(${stage}): ${msg}" --no-verify
        success "파이프라인 산출물 커밋: pipeline(${stage}): ${msg}"
    else
        log "커밋할 변경 사항 없음 (${stage})"
    fi
}

# subprocess 후 예상 브랜치 복귀 보장
ensure_on_branch() {
    local target_branch="$1"
    local current_branch
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [ "$current_branch" != "$target_branch" ]; then
        warn "예상 브랜치($target_branch)가 아닌 $current_branch에 있습니다. 복귀합니다."
        git checkout "$target_branch" || {
            error "$target_branch 로 복귀할 수 없습니다."
            return 1
        }
    fi
}

# ============================================================================
# 인자 파싱
# ============================================================================

FROM_STAGE="discover"
DISCOVER_ONLY=false
BASE_BRANCH="main"

for arg in "$@"; do
    case $arg in
        --from=*)
            FROM_STAGE="${arg#*=}"
            ;;
        --base=*)
            BASE_BRANCH="${arg#*=}"
            ;;
        --discover-only)
            DISCOVER_ONLY=true
            ;;
        --help|-h)
            echo "Usage: ./scripts/pipeline.sh [options]"
            echo ""
            echo "Options:"
            echo "  --from=STAGE        시작 단계 (discover|review|research|implement|qa)"
            echo "  --base=BRANCH       기준 브랜치 (기본값: main)"
            echo "  --discover-only     discover만 실행하고 종료"
            echo "  --help, -h          이 도움말 표시"
            exit 0
            ;;
        *)
            echo "Unknown option: $arg"
            exit 1
            ;;
    esac
done

# ============================================================================
# Stage 1: DISCOVER
# ============================================================================

run_discover() {
    header "Stage 1: DISCOVER — 외부 동향 스캔"

    run_claude "discover" || {
        error "Discover 실패"
        return 1
    }

    # 최신 리포트 확인
    local latest_report=$(ls -t specs/discovery-reports/*.md 2>/dev/null | head -1)
    if [ -z "$latest_report" ]; then
        warn "Discovery 리포트가 생성되지 않았습니다."
        return 1
    fi

    success "Discovery 완료: $latest_report"
    echo "$latest_report" > "${LOG_DIR}/.last_discovery_report"

    # 산출물 커밋 — clean working tree 유지
    commit_pipeline_artifacts "discover" "${TODAY} discovery report"

    if [ "$DISCOVER_ONLY" = true ]; then
        header "파이프라인 종료 (--discover-only)"
        echo -e "${YELLOW}리포트를 검토한 뒤 다음 단계를 실행하세요:${NC}"
        echo "  ./scripts/pipeline.sh --from=review"
        return 0
    fi
}

# ============================================================================
# Stage 2: REVIEW (사용자 체크포인트)
# ============================================================================

run_review() {
    header "Stage 2: REVIEW — 발견 항목 검토"

    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW} 📋 사용자 체크포인트: Discovery 리포트를 검토합니다.${NC}"
    echo -e "${YELLOW} Review 과정에서 항목 선별 및 실행 여부를 확인합니다.${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    run_claude "review" || {
        error "Review 실패"
        return 1
    }

    # 최신 review decision 확인
    local latest_review=$(ls -t specs/review-decisions/*.md 2>/dev/null | head -1)
    if [ -z "$latest_review" ]; then
        warn "Review decision이 생성되지 않았습니다."
        return 1
    fi

    success "Review 완료: $latest_review"
    echo "$latest_review" > "${LOG_DIR}/.last_review_decision"

    # 산출물 커밋 — clean working tree 유지
    commit_pipeline_artifacts "review" "${TODAY} review decision"
}

# ============================================================================
# Stage 3: RESEARCH → IMPLEMENT → QA (자동 체이닝)
# ============================================================================

run_research_implement_qa() {
    header "Stage 3-5: RESEARCH → IMPLEMENT → QA"

    local latest_review=$(cat "${LOG_DIR}/.last_review_decision" 2>/dev/null)

    if [ -z "$latest_review" ] || [ ! -f "$latest_review" ]; then
        warn "Review decision을 찾을 수 없습니다. --from=review로 다시 시작해주세요."
        return 1
    fi

    log "Review decision에서 실행 계획을 확인합니다."

    # 기준 브랜치 (인자로 전달받은 값 사용)
    local base_branch="$BASE_BRANCH"
    log "Base branch: $base_branch"

    # Review decision에서 모든 Batch 항목을 순차 추출·실행
    # 형식: N. `/research {topic}` → `/implement {component_id}`
    local current_batch=""
    local batch_item_count=0
    local total_count=0
    local skipped_count=0

    while IFS= read -r line; do
        # Batch 헤더 감지 (### Batch 1, ### Batch 2, ...)
        if echo "$line" | grep -qE '^### Batch [0-9]+'; then
            current_batch=$(echo "$line" | sed -n 's/.*Batch \([0-9]*\).*/\1/p')
            batch_item_count=0
            continue
        fi
        # Batch 섹션 밖의 ### 헤더를 만나면 현재 Batch 종료 (다음 Batch가 올 수 있으므로 break 대신 reset)
        if [[ -n "$current_batch" && "$line" == "### "* ]]; then
            current_batch=""
            continue
        fi
        # 번호 매긴 항목만 처리 (예: "1. `/research ...` → `/implement ...`")
        if [[ -n "$current_batch" ]] && echo "$line" | grep -qE '^[0-9]+\.'; then
            local research_topic=$(echo "$line" | sed -n 's/.*`\/research \([^`]*\)`.*/\1/p')
            local component_id=$(echo "$line" | sed -n 's/.*`\/implement \([^`]*\)`.*/\1/p')

            if [ -n "$research_topic" ] && [ -n "$component_id" ]; then
                batch_item_count=$((batch_item_count + 1))
                total_count=$((total_count + 1))
                log "항목 감지 [Batch ${current_batch}]: research=$research_topic, implement=$component_id"

                header "Batch ${current_batch}-${batch_item_count}: ${component_id}"

                # Step 1: Research (base branch에서 실행 — 공유 문서 갱신)
                echo -e "  ${BLUE}→ /research ${research_topic}${NC}"
                run_claude "research" "$research_topic" || {
                    error "Research 실패: $research_topic"
                    continue
                }
                success "Research 완료: $research_topic"

                # 리서치 산출물 커밋 — implement의 branch switch 전에 clean tree 보장
                commit_pipeline_artifacts "research" "${research_topic} research brief"

                # Step 2: Implement (implement가 feature branch를 자체 관리)
                local feature_branch="feature/${component_id}"
                echo -e "  ${BLUE}→ /implement ${component_id}${NC}"
                run_claude "implement" "$component_id" || {
                    error "Implement 실패: $component_id"
                    ensure_on_branch "$base_branch"
                    continue
                }

                # dev-test.md 존재 확인 — 실질적 구현 완료 검증
                if [ ! -f "specs/implementation-logs/${component_id}/dev-test.md" ]; then
                    error "Implement가 완료되지 않았습니다 (dev-test.md 미생성): $component_id"
                    ensure_on_branch "$base_branch"
                    continue
                fi
                success "Implement 완료: $component_id"

                # Step 3: QA (feature branch에서 실행)
                echo -e "  ${BLUE}→ /qa ${component_id}${NC}"
                run_qa "$component_id" || {
                    error "QA 실패: $component_id — 파이프라인을 중단합니다."
                    error "브랜치 $feature_branch 에서 수정 후 재실행하세요."
                    ensure_on_branch "$base_branch"
                    return 1
                }

                # QA 통과 후 base branch로 복귀
                ensure_on_branch "$base_branch"
                success "브랜치 $feature_branch 작업 완료, $base_branch 로 복귀"
            else
                skipped_count=$((skipped_count + 1))
                warn "파싱 실패 — Batch 항목이 '/research X → /implement Y' 형식이 아닙니다: $line"
            fi
        fi
    done < "$latest_review"

    if [ "$total_count" -eq 0 ]; then
        warn "실행 가능한 Batch 항목이 없습니다."
    fi
    if [ "$skipped_count" -gt 0 ]; then
        warn "${skipped_count}건의 항목이 형식 불일치로 건너뛰어졌습니다."
    fi

    # 이전 실행에서 QA 미완료된 컴포넌트 확인
    local pending_qa=""
    for dir in specs/implementation-logs/*/; do
        [ -d "$dir" ] || continue
        local comp_id=$(basename "$dir")
        if [ -f "${dir}dev-test.md" ] && [ ! -f "${dir}qa-report.md" ]; then
            pending_qa="$pending_qa $comp_id"
        fi
    done

    if [ -n "$pending_qa" ]; then
        header "QA 검증 대기 중인 컴포넌트"
        for comp_id in $pending_qa; do
            echo -e "  ${CYAN}→ /qa ${comp_id}${NC}"
            run_qa "$comp_id"
        done
    fi

    success "전체 파이프라인 완료"
}

# ============================================================================
# QA + Fix Loop
# ============================================================================

run_qa() {
    local component_id="${1:-}"
    local max_fix_attempts=3
    local attempt=0
    local last_verdict=""

    while [ $attempt -lt $max_fix_attempts ]; do
        log "QA 실행: $component_id (시도 $((attempt+1))/$max_fix_attempts)"

        run_claude "qa" "$component_id" || {
            error "QA 실행 실패: $component_id"
            return 1
        }

        local qa_report="specs/implementation-logs/${component_id}/qa-report.md"

        if [ ! -f "$qa_report" ]; then
            warn "QA 리포트가 생성되지 않았습니다."
            return 1
        fi

        # QA 판정 확인 (CONDITIONAL PASS를 먼저 체크 — PASS 부분 문자열 매칭 방지)
        if grep -q "## 판정: CONDITIONAL PASS" "$qa_report" 2>/dev/null; then
            last_verdict="CONDITIONAL_PASS"
            warn "QA CONDITIONAL PASS: $component_id"
        elif grep -q "## 판정: PASS" "$qa_report" 2>/dev/null; then
            success "QA PASS: $component_id"
            return 0
        elif grep -q "## 판정: FAIL" "$qa_report" 2>/dev/null; then
            last_verdict="FAIL"
            warn "QA FAIL: $component_id"
        else
            warn "QA 판정을 파싱할 수 없습니다: $component_id"
            return 1
        fi

        # FAIL 또는 CONDITIONAL PASS → 수정 사이클
        attempt=$((attempt + 1))

        if [ $attempt -lt $max_fix_attempts ]; then
            warn "수정 사이클 시작 (시도 $attempt/$max_fix_attempts) — 판정: $last_verdict"

            # fix-request.md가 생성되어 있어야 함 (qa 커맨드가 생성)
            if [ -f "specs/implementation-logs/${component_id}/fix-request.md" ]; then
                run_claude "implement" "$component_id" || {
                    error "수정 실패: $component_id"
                    return 1
                }
            else
                warn "fix-request.md가 없습니다."
                # CONDITIONAL PASS인데 fix-request가 없으면 → Minor만 남은 것으로 수락
                if [ "$last_verdict" = "CONDITIONAL_PASS" ]; then
                    warn "CONDITIONAL PASS — fix-request 없이 현재 상태로 수락"
                    return 0
                fi
                return 1
            fi
        fi
    done

    # 최대 시도 횟수 초과
    if [ "$last_verdict" = "CONDITIONAL_PASS" ]; then
        warn "수정 사이클 ${max_fix_attempts}회 후에도 CONDITIONAL PASS: $component_id"
        warn "잔여 이슈를 기록하고 파이프라인을 계속합니다."
        return 0
    else
        error "수정 사이클 ${max_fix_attempts}회 초과 (FAIL): $component_id"
        return 1
    fi
}

# ============================================================================
# 메인 실행
# ============================================================================

# 스크립트 종료 시 base branch로 복귀 시도
cleanup() {
    local exit_code=$?
    local current
    current=$(git rev-parse --abbrev-ref HEAD 2>/dev/null) || true
    if [ "$current" != "$BASE_BRANCH" ] && [ "$current" != "HEAD" ]; then
        echo -e "${YELLOW}⚠ 스크립트 종료 — $BASE_BRANCH 로 복귀합니다.${NC}"
        git checkout "$BASE_BRANCH" 2>/dev/null || true
    fi
    exit $exit_code
}
trap cleanup EXIT

header "KonaI-Agent Development Pipeline"
log "시작 단계: $FROM_STAGE"
log "기준 브랜치: $BASE_BRANCH"
log "프로젝트: $PROJECT_DIR"
log "날짜: $TODAY"

# 기준 브랜치로 이동 — feature branch에서 시작하는 상황 방지
if [ "$(git rev-parse --abbrev-ref HEAD)" != "$BASE_BRANCH" ]; then
    log "현재 브랜치가 $BASE_BRANCH가 아닙니다. 체크아웃합니다."
    git checkout "$BASE_BRANCH" || {
        error "$BASE_BRANCH 브랜치로 체크아웃할 수 없습니다. 변경사항을 커밋하거나 스태시하세요."
        exit 1
    }
fi

case $FROM_STAGE in
    discover)
        run_discover
        if [ "$DISCOVER_ONLY" = false ]; then
            run_review
            run_research_implement_qa
        fi
        ;;
    review)
        run_review
        run_research_implement_qa
        ;;
    research)
        run_research_implement_qa
        ;;
    implement)
        echo -e "${YELLOW}개별 구현은 직접 실행해주세요: claude -p '/implement {component_id}'${NC}"
        ;;
    qa)
        echo -e "${YELLOW}QA 대기 중인 컴포넌트를 검색합니다...${NC}"
        run_research_implement_qa
        ;;
    *)
        error "알 수 없는 단계: $FROM_STAGE"
        echo "사용 가능: discover, review, research, implement, qa"
        exit 1
        ;;
esac

header "Pipeline Log: $LOG_FILE"
