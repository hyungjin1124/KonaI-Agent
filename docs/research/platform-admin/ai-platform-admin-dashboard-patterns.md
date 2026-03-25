# AI 에이전트 플랫폼 관리자 대시보드 UX 패턴 조사 보고서

> **조사 대상**: OpenAI Platform, Anthropic Console, AWS Bedrock, LangSmith/LangFuse, Helicone/PromptLayer  
> **목적**: 멀티테넌트 AI 에이전트 플랫폼(코나체인) PlatformAdminView 개선을 위한 벤치마크  
> **작성일**: 2026-03-18

---

## 1. 플랫폼별 대시보드 분석

### 1.1 OpenAI Platform Dashboard

#### 핵심 메트릭 & KPI 카드

OpenAI의 새로운 Usage Dashboard(2025년 리뉴얼)는 상단에 **Cost(비용)** 뷰와 **Activity(활동)** 뷰를 탭으로 분리한다. Cost 뷰에서는 일별 비용, 월간 총 지출, 크레딧 잔액을 요약 카드로 보여준다. Activity 뷰에서는 요청 수, 토큰 소비량, 컨텍스트 토큰 수를 표시한다.

- **차트 유형**: 일별 비용 추세를 **스택 바 차트**(모델별 색상 구분)로 표시. 모델 분포는 **파이 차트**로 보여줌.
- **테넌트 브레이크다운**: Organization → Project 2단 계층 구조. 새 대시보드는 현재 선택된 Organization/Sub-org의 데이터만 표시하며, 프로젝트 필터와 API capability별 상세 드릴다운을 지원한다.
- **드릴다운 경로**: Landing(전체 비용) → API Capability 선택(Completions, Embeddings 등) → 모델별 또는 사용자별 상세 데이터

#### 비용 추적

| 항목 | OpenAI 방식 |
|------|-------------|
| **모델별 비용 분리** | Capability별 상세 페이지에서 모델/사용자 정보 제공. Usage API에서 `group_by: ["model"]` 파라미터로 모델별 집계 가능 |
| **입력/출력 구분** | Usage API에서 input_tokens, output_tokens, cache_read_tokens 등 세분화된 토큰 카테고리 제공 |
| **비용 제한 UI** | Project > Limits에서 **Hard limit**(절대 차단선)과 **Soft limit**(경고 임계치) 설정. 월간 단위만 지원 |
| **초과 시 액션** | Hard limit 도달 시 API 호출 자동 차단. Soft limit 도달 시 이메일 알림 발송. Organization 레벨과 Project 레벨 이중 제한 가능 |

#### 주요 UX 특징

- **Scale Tier 전용 페이지**: 대규모 사용자를 위한 별도 비용 뷰 제공
- **1분 단위 TPM 모니터링**: 상세 페이지에서 분 단위 간격 선택으로 Rate Limit 히트 패턴 파악 가능
- **CSV 내보내기**: 비용/활동 데이터를 CSV로 다운로드 가능 (최대 60일)
- **Usage API**: 프로그래밍 방식으로 project_ids, user_ids, api_key_ids, models 등으로 필터링하여 커스텀 대시보드 구축 가능

---

### 1.2 Anthropic Console (Admin Dashboard)

#### 핵심 메트릭 & KPI 카드

Anthropic Console은 **Usage** 탭과 **Cost** 탭을 분리 운영한다. Usage 탭에서는 토큰 소비량과 요청 수를, Cost 탭에서는 모델별 비용과 도구 사용 비용을 보여준다.

- **차트 유형**: 일별 토큰 사용량을 **라인 차트**로 표시. Rate Limit 사용률은 **면적 차트**(시간별 최대 ITPM/OTPM) 형태.
- **테넌트 브레이크다운**: Organization → Workspace(최대 100개) 계층. 드롭다운으로 Workspace 선택하거나 "All Workspaces" 전체 조회. API Key별 추가 필터링 가능.
- **필터 체계**: Workspace → Model → 기간(월/일) → API Key 4단 계층 필터

#### 비용 추적

| 항목 | Anthropic 방식 |
|------|----------------|
| **모델별 비용 분리** | "All Models" 또는 특정 모델(Claude Opus 4, Sonnet 4 등) 선택. 토큰 비용과 도구 사용 비용을 분리 표시 |
| **입력/출력 구분** | Rate Limit 섹션에서 Input Tokens(ITPM)과 Output Tokens(OTPM)을 별도 차트로 시각화. 캐시 비율(cache rate)도 함께 표시 |
| **비용 제한 UI** | Workspace 단위로 월간 Spend Limit 설정. Organization 전체 Rate Limit 내에서 Workspace별 Rate Limit 독립 조정 |
| **초과 시 액션** | Spend Limit 도달 시 해당 Workspace의 API 호출 차단. Admin API를 통해 프로그래밍 방식으로 모니터링/제어 가능 |

#### 주요 UX 특징

- **캐시 효율 시각화**: Rate Limit 차트에 cache rate를 오버레이하여 캐싱 최적화 여부를 직관적으로 파악
- **Admin API**: 1분/1시간/1일 bucket 단위로 사용량/비용 데이터를 프로그래밍 방식 조회. model, workspace, api_key, service_tier, geography 필터 지원
- **서비스 티어 구분**: Standard, Batch, Priority 티어별 비용 귀속
- **Grafana/Datadog 통합**: 공식 연동을 통해 gen_ai_cost, gen_ai_usage_tokens_total 메트릭을 Prometheus 형식으로 수집 가능
- **감사 로그(Audit Log)**: API 키 생성, Workspace 변경, 빌링 업데이트 등 관리 이벤트를 타임스탬프/카테고리별로 기록

---

### 1.3 AWS Bedrock Console

#### 핵심 메트릭 & KPI 카드

AWS Bedrock은 CloudWatch와 네이티브 통합되어 **자동 대시보드(Automatic Dashboard)**를 제공한다. 호출 수(Invocations), 호출 지연시간(InvocationLatency), 입/출력 토큰 수, 에러 수(InvocationClientErrors, InvocationServerErrors), 쓰로틀 수(InvocationThrottles)를 핵심 메트릭으로 보여준다.

- **차트 유형**: 모델별 호출 수를 **스택 면적 차트**, 지연시간을 **라인 차트**(모델별 비교), 토큰을 **입력/출력 분리 바 차트**로 표시
- **테넌트 브레이크다운**: ModelId 차원(dimension)으로 기본 분리. Application Inference Profile에 태그를 부착하여 워크로드/테넌트별 비용 추적 가능. 크로스 계정 옵저버빌리티로 다중 계정 통합 대시보드 구축 가능

#### 비용 추적

| 항목 | AWS Bedrock 방식 |
|------|------------------|
| **모델별 비용 분리** | Cost Explorer에서 모델/리전별 비용 필터링. Application Inference Profile 태그로 비용 할당(cost allocation tags) |
| **입력/출력 구분** | CloudWatch 메트릭에서 InputTokenCount, OutputTokenCount를 별도 메트릭으로 게시. 인보이스는 토큰 수 기반 |
| **비용 제한 UI** | AWS Budgets를 통해 Bedrock 서비스 사용량 기반 예산 알림. TPM/RPM 쿼터로 요청 속도 제한(비용 직접 캡은 미지원) |
| **초과 시 액션** | 쿼터 초과 시 쓰로틀링(지연). AWS Budgets 알림 + EventBridge 연동으로 Lambda 트리거 가능(자동 대응). CloudWatch Alarms로 커스텀 임계치 알림 |

#### 에이전트 특화 기능

Bedrock Agents 전용 CloudWatch 메트릭이 2025년에 출시되었다.

- **에이전트 메트릭**: InvokeAgent, InvokeInlineAgent 오퍼레이션별 호출 수, 지연시간, 토큰 사용량, 에러율
- **세분화 차원**: operation type, model ID, agent alias ARN으로 필터링
- **TTFT(Time to First Token)**: 에이전트 응답 시작 시간 추적으로 사용자 체감 성능 모니터링
- **모델 호출 로깅**: 요청/응답 메타데이터를 CloudWatch Logs/S3에 저장. identity.arn으로 사용자 귀속(attribution) 가능
- **Live Tail**: 실시간 로그 스트리밍으로 인보케이션 즉시 디버깅

#### 주요 UX 특징

- **인프라 중심 접근**: 대시보드 자체보다 CloudWatch 생태계 활용에 의존. 커스텀 대시보드 자유도는 높으나 초기 설정 비용이 큼
- **크로스 리전 주의**: 리전별로 별도 로그 그룹/메트릭 스트림을 생성해야 하므로 멀티리전 운영 시 복잡도 증가
- **이상 탐지**: CloudWatch Anomaly Detection으로 ML 기반 기준선 자동 학습 및 이상 감지

---

### 1.4 LangSmith / LangFuse (에이전트 관찰 도구)

#### 1.4.1 LangSmith

##### 핵심 메트릭 & KPI 카드

LangSmith는 에이전트 관찰에 특화된 플랫폼으로, 프로젝트별 자동 생성되는 대시보드에서 trace 수, 에러율, 토큰 사용량, 비용, 피드백 점수를 추적한다. 커스텀 대시보드 빌더를 통해 원하는 메트릭 조합의 차트를 직접 구성할 수 있다.

- **차트 유형**: 추세 라인 차트(P50/P99 레이턴시), 바 차트(토큰/비용), 히트맵(에러 분포)
- **레이턴시 추적**: P50, P99 백분위 지연시간 모니터링
- **Insights 섹션**: 이상 탐지 및 사전적 알림 기능

##### 에이전트 트레이스 시각화

| 기능 | LangSmith 구현 |
|------|----------------|
| **트레이스 트리** | 계층적 트리 뷰로 전체 에이전트 실행 경로 시각화. 각 run(LLM 호출, 도구 호출, 체인)을 부모-자식 관계로 표시 |
| **단계별 상세** | 각 노드 클릭 시 입력/출력 데이터, 토큰 수, 비용, 실행 시간을 상세 패널에 표시 |
| **성공/실패/타임아웃** | 프로젝트 대시보드에서 success rate, error rate를 시계열로 추적. 필터로 실패 트레이스만 조회 가능 |
| **도구/스킬 분석** | 도구 호출 빈도, 도구별 평균 레이턴시, 도구 성공률을 프로젝트 통계 패널에서 제공 |
| **자동 클러스터링** | 트레이스를 자동으로 분석·군집화하여 사용 패턴, 공통 에이전트 동작, 실패 모드를 감지 |

##### 비용 추적

- **3단 분류**: Input(prompt, cache reads, image tokens) / Output(생성 토큰) / 기타로 세분화
- **트레이스 레벨**: 개별 트레이스의 총 비용과 하위 run별 비용 분해 제공
- **프로젝트 통계 패널**: 프로젝트 전체 누적 토큰/비용
- **커스텀 대시보드**: 시간대별 비용 추세, 모델별 비용 비교 차트 자유 구성
- **스레드 비용**: 대화 스레드 메타데이터 연결 시 스레드 단위 비용 집계

##### 알림

- Slack, email, webhook으로 알림 전송
- 조건 예시: "> 5% 에러율이 5분간 지속" 등 조건 정의 가능
- Automation engine과 연동하여 자동 대응 워크플로 구성

#### 1.4.2 LangFuse

##### 핵심 메트릭 & KPI 카드

LangFuse(오픈소스, MIT 라이선스)는 Trace, Observation, Score 3개 뷰를 기반으로 메트릭을 제공한다. Metrics API를 통해 다양한 차원(모델명, 메타데이터 키 등)으로 집계할 수 있다.

- **차트 유형**: 시계열 라인/바 차트(추세), 테이블 뷰(상세 목록)
- **지원 집계**: count, sum, avg, p50, p90, p95, p99
- **시간 단위**: hour, day, week, month, auto

##### 에이전트 트레이스 시각화

| 기능 | LangFuse 구현 |
|------|---------------|
| **트레이스 구조** | Trace → Span → Generation → Event 4레벨 계층. OpenTelemetry 기반으로 분산 트레이스 지원 |
| **Generation 상세** | LLM 호출의 입출력, 모델 파라미터, 토큰 수, 비용을 특화된 Generation 타입으로 자동 캡처 |
| **성공/실패율** | 대시보드에서 세션별 에이전트 성능을 시각화. 온라인 평가(LLM-as-judge, 사용자 피드백 등)로 품질 점수 추적 |
| **비용 추적** | Metrics API로 totalCost를 providedModelName별로 집계 가능. 300+ 모델의 가격 정보 내장 |
| **Score Analytics** | 평가 점수를 시계열로 추적하여 품질 트렌드 파악 |

##### 주요 차별점

- **셀프 호스팅**: MIT 라이선스로 완전 셀프 호스팅 가능 (데이터 레지던시 요구사항 대응)
- **프레임워크 비종속**: Python/JS 네이티브 SDK + LangChain, LlamaIndex 등 50+ 프레임워크 커넥터
- **프롬프트 버전 관리**: 빌트인 프롬프트 플레이그라운드와 버전 히스토리
- **Webhook 기반 알림**: 트레이스 이벤트 구독 및 Metrics API 기반 커스텀 알림 구축

---

### 1.5 Helicone / PromptLayer (LLM 프록시/모니터링)

#### 1.5.1 Helicone

##### 핵심 메트릭 & KPI 카드

Helicone은 프록시 기반 아키텍처로 LLM 요청을 투명하게 가로채어 메트릭을 수집한다. 대시보드 상단에 **비용 추세**, **요청 수**, **레이턴시**, **TTFT(Time to First Token)**, **상위 모델**, **상위 국가**를 비주얼 카드로 표시한다.

- **차트 유형**: 비용/요청 추세를 **라인 차트**, 모델/사용자 분포를 **바 차트/도넛 차트**로 표시
- **브레이크다운 기준**: 사용자(Helicone-User-Id), 세션(Helicone-Session-Id), 커스텀 속성(Helicone-Property-*), 환경(production/staging/dev)별 분석
- **세션 트레이싱**: 세션 ID와 세션 경로(parent/child)로 다단계 에이전트 인터랙션을 계층적으로 추적

##### 비용 추적

| 항목 | Helicone 방식 |
|------|---------------|
| **요청별 비용** | 모든 LLM 요청에 자동으로 비용 계산. 300+ 모델 가격 데이터베이스(오픈소스) 내장 |
| **세션별 비용** | 관련 요청을 세션으로 그룹화하여 사용자 인터랙션의 실제 비용 산출 |
| **캐시 히트율** | 프록시 레벨 캐싱 지원. 캐시 히트 시 LLM API 호출 생략으로 비용/레이턴시 절감. 캐시 효율 메트릭 제공 |
| **비용 알림** | 지출 임계치 설정 가능. 정기 비용 리포트를 이메일/Slack으로 자동 발송 |
| **비용 기반 라우팅** | AI Gateway가 자동으로 가장 저렴한 프로바이더 선택 (BYOK 우선, Cost-Based Routing) |

##### 주요 차별점

- **1줄 통합**: baseURL 변경만으로 통합 (코드 변경 최소화)
- **언어 무관**: HTTP 요청을 보낼 수 있는 모든 언어/프레임워크 지원
- **프롬프트 관리**: 프롬프트 ID로 버전별 성능 비교
- **Rate Limiting**: 사용자별 속도 제한 정책 설정 (예: `10;w=60;s=user`)
- **커스텀 대시보드**: Product analytics 스타일로 자유로운 대시보드 구성

#### 1.5.2 PromptLayer

PromptLayer는 프롬프트 버전 관리와 A/B 테스트에 특화된 도구로, 비용 추적보다는 **프롬프트 성능 최적화**에 초점을 맞춘다. 프롬프트 템플릿별 토큰 사용량, 레이턴시, 성공률을 비교하는 뷰를 제공하며, 프롬프트 변경이 비용에 미치는 영향을 A/B 테스트로 측정할 수 있다.

---

## 2. 크로스-플랫폼 비교 매트릭스

### 2.1 핵심 메트릭 비교

| 메트릭 카테고리 | OpenAI | Anthropic | AWS Bedrock | LangSmith | LangFuse | Helicone |
|----------------|--------|-----------|-------------|-----------|----------|----------|
| 토큰 사용량 (입/출 분리) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 모델별 비용 분리 | ✅ | ✅ | ✅ (태그) | ✅ | ✅ | ✅ |
| 캐시 토큰 추적 | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| 레이턴시 (P50/P99) | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| TTFT | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| 에러율 | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| 에이전트 트레이스 | ❌ | ❌ | ✅ (제한적) | ✅✅ | ✅✅ | ✅ |
| 도구/스킬 분석 | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| 비용 예측/알림 | Soft limit | Spend limit | AWS Budgets | Webhook | Webhook | Threshold |
| 자동 차단 | Hard limit | Spend limit | 쓰로틀링 | ❌ | ❌ | ❌ |

### 2.2 비용 제한 UI 패턴 비교

| 플랫폼 | 제한 단위 | 설정 위치 | 제한 유형 | 초과 시 동작 |
|--------|----------|----------|----------|-------------|
| **OpenAI** | Organization/Project 월간 | Settings > Limits | Hard limit + Soft limit | 차단 + 이메일 알림 |
| **Anthropic** | Workspace 월간 | Workspace Settings | Spend Limit + Rate Limit | 차단 + API 제어 |
| **AWS Bedrock** | 서비스/태그 기반 | AWS Budgets | 예산 알림 (Hard cap 미지원) | 알림 + EventBridge 자동화 |
| **LangSmith** | 프로젝트 | Dashboard > Alerts | Webhook 기반 조건 알림 | 알림만 (차단 미지원) |
| **Helicone** | 사용자/프로젝트 | Dashboard > Alerts | 지출 임계치 | 알림 + 리포트 |

### 2.3 에이전트 트레이스 시각화 패턴 비교

| 패턴 | LangSmith | LangFuse | AWS Bedrock | Helicone |
|------|-----------|----------|-------------|----------|
| **표현 방식** | 계층 트리 뷰 | Span 기반 워터폴 | CloudWatch 로그 | 세션 경로 트리 |
| **데이터 모델** | Run (LLM/Tool/Chain) | Trace > Span > Generation > Event | 인보케이션 로그 | Session > Request |
| **입출력 표시** | 각 run별 전체 I/O | 각 span/generation별 I/O | 로그 이벤트 (100KB 제한) | 요청/응답 전문 |
| **도구 호출 분석** | 도구별 빈도/레이턴시/성공률 | 커스텀 메트릭으로 집계 | 별도 구현 필요 | 커스텀 속성으로 태깅 |
| **자동 분석** | 자동 클러스터링/이상탐지 | Score Analytics | CloudWatch Anomaly Detection | 기본 분석 |

---

## 3. 코나체인 PlatformAdminView 개선 권장사항

### 3.1 현재 강점 (유지할 요소)

코나체인의 현재 구현은 이미 경쟁력 있는 기반을 갖추고 있다.

1. **4개 KPI 카드** (API 호출 수, 토큰 소비량, 에이전트 세션 수, 임계치 초과 테넌트 수) — OpenAI/Anthropic 수준의 핵심 요약을 제공
2. **테넌트별 스택 면적 차트** (30일 API 호출 추세) — AWS Bedrock의 모델별 스택 면적 차트와 유사한 효과적 패턴
3. **입력/출력 스택 바 차트** (30일 토큰 소비) — Anthropic의 입출력 분리 시각화와 동일한 접근
4. **테넌트별 상세 테이블** — OpenAI의 프로젝트별 브레이크다운과 유사
5. **5개 알림 규칙** — 다양한 알림 유형을 이미 구현

### 3.2 추가 권장 메트릭 & UI

#### Priority 1: 모델별 비용 분리 (단기 구현)

**벤치마크 근거**: OpenAI, Anthropic, Helicone 모두 모델별 비용 분리를 핵심 기능으로 제공한다.

**구현 권장사항**:

- **KPI 카드 추가**: "총 비용 (이번 달)" 카드를 추가하고, 전월 대비 변화율(%) 표시
- **모델별 비용 파이 차트**: Anthropic 스타일로 "All Models" 드롭다운 + 모델별 비용 비율 도넛 차트
- **비용 추세 차트**: 기존 토큰 바 차트 아래에 일별 비용 스택 바 차트 추가 (모델별 색상 구분)
- **테넌트 테이블 확장**: 기존 테이블에 "모델별 비용" 열 추가, 확장(expand) 시 모델별 세부 내역 표시

```
┌─────────────────────────────────────────────────┐
│  KPI 카드 영역 (기존 4개 + 신규 2개)              │
│  [API 호출] [토큰] [세션] [초과 테넌트]             │
│  [총 비용 ▲12%] [비용 효율 ($/세션)]  ← 신규       │
├─────────────────────────────────────────────────┤
│  모델별 비용 분포        │  테넌트별 비용 Top 5      │
│  ┌──────────────┐       │  ████████████ 테넌트A    │
│  │  도넛 차트     │       │  █████████░░ 테넌트B    │
│  │  (모델별)     │       │  ███████░░░░ 테넌트C    │
│  └──────────────┘       │  █████░░░░░░ 테넌트D    │
├─────────────────────────────────────────────────┤
│  일별 비용 추세 (모델별 스택 바 차트)               │
│  ▓▓▓▓▓▓ GPT-4o  ░░░░░ Claude  ▒▒▒ 기타          │
└─────────────────────────────────────────────────┘
```

#### Priority 2: 에이전트 실행 트레이스 (중기 구현)

**벤치마크 근거**: LangSmith와 LangFuse가 에이전트 관찰의 사실상 표준을 정의하고 있다. AWS Bedrock도 에이전트 전용 메트릭을 추가했다.

**구현 권장사항**:

- **트레이스 목록 뷰**: LangSmith 스타일의 실행 이력 테이블. 각 행에 에이전트명, 상태(성공/실패/타임아웃), 총 시간, 토큰 수, 비용 표시
- **트레이스 트리 상세**: 클릭 시 LangFuse의 Trace > Span > Generation 계층 구조를 워터폴 다이어그램으로 시각화
  - 각 노드: 단계명, 실행 시간, 토큰 수, 상태 아이콘
  - 노드 클릭: 입력/출력 데이터, 사용 모델, 파라미터 상세
- **실행 상태 대시보드**: 성공/실패/타임아웃 비율을 도넛 차트 + 시계열 추세로 표시

```
에이전트 실행 트레이스 뷰
┌──────────────────────────────────────────────────┐
│ 상태 요약: ✅ 94.2% 성공  ❌ 3.1% 실패  ⏰ 2.7% 타임아웃 │
├──────────────────────────────────────────────────┤
│ 트레이스 목록                                      │
│ ┌────────┬──────┬───────┬───────┬──────┬───────┐ │
│ │에이전트  │상태   │시간    │토큰    │비용   │스킬 수 │ │
│ │고객상담  │✅ 성공│2.3s   │1,247  │$0.02 │3      │ │
│ │문서분석  │❌ 실패│15.0s  │3,892  │$0.08 │5      │ │
│ │코드리뷰  │✅ 성공│4.1s   │2,156  │$0.04 │2      │ │
│ └────────┴──────┴───────┴───────┴──────┴───────┘ │
├──────────────────────────────────────────────────┤
│ 트레이스 상세 (워터폴)                               │
│                                                    │
│ ▶ 고객상담 에이전트 (2.3s, $0.02)                    │
│   ├─ 🧠 LLM: 의도 분류 (0.3s, 342 tokens)          │
│   ├─ 🔧 도구: FAQ 검색 (0.8s)                       │
│   ├─ 🧠 LLM: 답변 생성 (0.9s, 689 tokens)          │
│   └─ 🔧 도구: 응답 포맷팅 (0.3s)                     │
└──────────────────────────────────────────────────┘
```

#### Priority 3: 스킬별 사용 빈도 분석 (중기 구현)

**벤치마크 근거**: LangSmith는 도구별 빈도/레이턴시/성공률을 프로젝트 통계에서 제공한다. Helicone은 커스텀 속성으로 유사한 분석을 지원한다.

**구현 권장사항**:

- **스킬 사용 랭킹**: 수평 바 차트로 호출 빈도 상위 N개 스킬 표시
- **스킬 성능 매트릭스**: 스킬별 (호출 수, 평균 레이턴시, 성공률, 평균 비용)을 테이블로 제공
- **스킬-테넌트 히트맵**: 어떤 테넌트가 어떤 스킬을 얼마나 사용하는지 히트맵으로 시각화
- **스킬 추세**: 시간별 스킬 사용 패턴 변화를 스택 면적 차트로 표시

#### Priority 4: 예측적 비용 알림 (장기 구현)

**벤치마크 근거**: AWS CloudWatch의 Anomaly Detection, Grafana의 AnthropicDailyCostSpike 알림(전일 대비 50% 증가 감지), AnthropicTokenRateAnomaly(7일 평균 대비 3배 초과 감지) 패턴을 참고한다.

**구현 권장사항**:

- **비용 예측 차트**: 최근 7/14/30일 추세 기반으로 월말 예상 비용을 점선으로 표시
- **이상 탐지 알림**: 일일 비용이 이동 평균 대비 N배 초과 시 자동 경고 (Grafana의 AnthropicDailyCostSpike 패턴 참조)
- **테넌트별 예산 소진 예측**: 현재 사용 속도 기준 예산 소진 예상일 표시
- **비용 최적화 제안**: 캐시 적중률이 낮은 테넌트, 고비용 모델 과사용 테넌트에 대한 자동 인사이트 제공

```
예측적 비용 뷰
┌────────────────────────────────────────────┐
│ 월간 비용 예측                                │
│                                              │
│ $5,000 ┤                          ╱ ⚠️ 예상   │
│        │                      ╱╱╱  $4,800    │
│ $3,000 ┤              ████╱╱╱                 │
│        │          ████████                    │
│ $1,000 ┤  ████████████████     예산: $4,000   │
│        ├───────────────────────────────────── │
│        1일    10일    18일(오늘)    30일        │
│                                              │
│ ⚠️ 현재 추세로 월말 $4,800 예상 (예산 20% 초과) │
└────────────────────────────────────────────┘
```

### 3.3 추가 UX 개선 권장사항

#### 테넌트 드릴다운 경험

Anthropic의 Workspace → Model → 기간 → API Key 4단 필터 체계를 참고하여 다음과 같은 드릴다운 경로를 구성한다.

```
전체 플랫폼 (KPI 요약)
  └→ 테넌트 선택 (테넌트 상세)
       └→ 에이전트 선택 (에이전트별 메트릭)
            └→ 실행 선택 (트레이스 상세)
                 └→ 단계 선택 (입출력/토큰/비용 상세)
```

#### 비용 제한 설정 UI

OpenAI의 Hard/Soft limit 이중 구조와 Anthropic의 Workspace별 Spend Limit를 결합한다.

- **테넌트별 월간 예산**: Hard limit (초과 시 차단) + Soft limit (경고 임계치, 예: 예산의 80%)
- **모델별 접근 제어**: OpenAI 스타일로 테넌트별 허용 모델 목록 설정. 비허용 모델은 Rate Limit 0으로 차단
- **기간별 유연성**: OpenAI의 월간 제한을 보완하여 일간/주간 제한도 지원 (Helicone 프록시 패턴 참조)
- **초과 시 액션 옵션**: (1) 알림만, (2) 하위 모델로 자동 다운그레이드, (3) 즉시 차단 — 테넌트별 정책 설정 가능

#### 데이터 내보내기 & API

Anthropic의 Admin API 패턴을 참고하여 플랫폼 사용량/비용 데이터를 프로그래밍 방식으로 조회할 수 있는 관리 API를 제공한다.

- **버킷 단위**: 1분/1시간/1일 (Anthropic Admin API 참조)
- **필터**: tenant_id, agent_id, skill_id, model, date_range
- **집계**: group_by 파라미터로 다차원 집계 지원
- **외부 통합**: Grafana, Datadog 등 기존 모니터링 인프라와 연동 가능한 Prometheus 엔드포인트 또는 Webhook

### 3.4 구현 우선순위 로드맵

| 우선순위 | 항목 | 난이도 | 영향도 | 참조 플랫폼 |
|---------|------|--------|--------|------------|
| **P1** | 모델별 비용 분리 차트 + KPI 카드 | 중 | 높음 | OpenAI, Anthropic |
| **P1** | 테넌트별 예산 Hard/Soft limit UI | 중 | 높음 | OpenAI, Anthropic |
| **P2** | 에이전트 실행 트레이스 목록/워터폴 | 높음 | 높음 | LangSmith, LangFuse |
| **P2** | 스킬별 사용 빈도/성능 테이블 | 중 | 중간 | LangSmith |
| **P2** | 비용 초과 시 자동 다운그레이드 옵션 | 중 | 중간 | OpenAI Hard limit + 확장 |
| **P3** | 비용 예측 차트 (추세 기반) | 중 | 중간 | Grafana Anthropic 알림 |
| **P3** | 이상 탐지 알림 (ML 기반) | 높음 | 중간 | AWS CloudWatch Anomaly |
| **P3** | 관리 API (Usage/Cost 조회) | 높음 | 높음 | Anthropic Admin API |
| **P4** | 캐시 효율 모니터링 | 낮음 | 낮음 | Anthropic, Helicone |
| **P4** | 외부 모니터링 통합 (Grafana/Datadog) | 높음 | 중간 | Anthropic, AWS |

---

## 4. 핵심 설계 원칙 요약

조사한 5개 플랫폼 카테고리에서 반복적으로 나타나는 설계 원칙은 다음과 같다.

1. **계층적 필터링 (Progressive Disclosure)**: 전체 → 테넌트 → 에이전트 → 실행 → 단계로 점진적으로 상세 수준을 높이는 드릴다운. OpenAI(Org → Project → Capability → Model)와 Anthropic(All → Workspace → Model → Key)이 이 패턴을 가장 잘 구현하고 있다.

2. **비용과 사용량의 이중 뷰**: 비용(Cost)과 활동(Activity/Usage)을 별도 탭이나 뷰로 분리하되, 동일한 필터 체계를 공유한다. 관리자는 "얼마나 쓰는가"와 "얼마나 사용하는가"를 독립적으로 조회하면서도 상호 참조할 수 있어야 한다.

3. **예방적 비용 제어 (Guard Rails)**: 사후 모니터링뿐 아니라 사전적 비용 제한(Hard/Soft limit, Spend limit)을 제공한다. OpenAI의 이중 임계치 패턴(경고 → 차단)이 가장 실용적이다.

4. **프로그래밍 가능한 관리 (API-First)**: 대시보드 UI와 병행하여 Admin API를 제공함으로써 커스텀 대시보드, 외부 모니터링 통합, 자동화 워크플로를 지원한다. Anthropic과 OpenAI 모두 이 방향으로 진화 중이다.

5. **에이전트 실행의 투명성 (Trace-First)**: LLM API 호출뿐 아니라 에이전트의 추론 과정, 도구 호출, 의사결정 경로를 계층적으로 시각화한다. 이것이 단순 API 모니터링과 에이전트 플랫폼 모니터링의 핵심적 차이점이다.

---

## 5. 참고 출처

- OpenAI Help Center — Usage Dashboard, Rate Limits
- Anthropic — Console Cost/Usage Reporting, Admin API, Workspaces
- AWS — Bedrock CloudWatch Monitoring, Bedrock Agents Metrics
- LangChain Docs — LangSmith Cost Tracking, Observability
- LangFuse Docs — Metrics API, Agent Tracing
- Helicone Docs — Cost Tracking & Optimization
- Datadog — Anthropic Usage and Costs Integration
- Grafana Labs — Anthropic Integration for Grafana Cloud
