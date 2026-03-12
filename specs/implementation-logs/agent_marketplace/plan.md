# Plan: Agent Marketplace / Store

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| `src/components/features/agent-marketplace/agentMarketplaceData.ts` | 타입 + 목데이터 + 필터 헬퍼 | 신규 |
| `src/components/features/agent-marketplace/AgentMarketplaceView.tsx` | 메인 마켓플레이스 뷰 | 신규 |
| `src/components/features/agent-marketplace/index.ts` | 배럴 export | 신규 |
| `src/components/features/agent-marketplace/AgentMarketplaceView.test.tsx` | 단위 테스트 | 신규 |
| `src/components/AdminView.tsx` | 마켓플레이스 탭 추가 | 수정 |
| `src/components/icons/index.ts` | 필요 아이콘 추가 (Store, Puzzle, ToggleLeft) | 수정 |

## Props Interface

```typescript
// AgentMarketplaceView는 self-contained — Props 없음 (admin feature 패턴)
export function AgentMarketplaceView(): React.ReactElement;
```

## 데이터 모델 (agentMarketplaceData.ts)

```typescript
// --- Types ---
export type PluginCategory = 'data_analysis' | 'productivity' | 'communication' | 'development' | 'security' | 'infrastructure';
export type PluginType = 'mcp_server' | 'mcp_app' | 'skill';
export type PluginStatus = 'available' | 'installed' | 'update_available';

export interface PluginPermission {
  id: string;
  name: string;       // e.g. "데이터 읽기"
  description: string; // e.g. "외부 데이터 소스에 대한 읽기 권한"
}

export interface PluginTool {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface MarketplacePlugin {
  id: string;
  name: string;
  description: string;
  publisher: string;
  category: PluginCategory;
  type: PluginType;
  version: string;
  logoColor: string;    // 로고 배경색 (아바타 대체)
  logoIcon: string;     // 아이콘 이름 (lucide)
  status: PluginStatus;
  isEnabled: boolean;   // 활성화 여부 (installed일 때만 의미)
  rating: number;       // 1-5
  installs: number;     // 설치 수
  permissions: PluginPermission[];
  tools: PluginTool[];
  lastUpdated: string;
  tags: string[];
}
```

## 상태 설계

- `plugins: MarketplacePlugin[]` — 전체 플러그인 목록 (mock)
- `searchQuery: string` — 검색어
- `selectedCategory: PluginCategory | 'all'` — 카테고리 필터
- `activeTab: 'catalog' | 'installed'` — 카탈로그/내 설치 탭
- `selectedPlugin: MarketplacePlugin | null` — 상세 보기 대상
- `isDetailOpen: boolean` — 상세 Sheet open 여부

## 통합 지점

- `AdminView.tsx`에 9번째 탭 `marketplace` 추가
- `TabsTrigger` + `TabsContent` 패턴 (기존 8개 탭과 동일)
- 아이콘: `Store` (lucide-react에서 추가)

## UI 구성

### 1. 카탈로그 뷰 (기본)
- 검색 바 + 카테고리 필터 칩 (all, 데이터 분석, 생산성, 커뮤니케이션, 개발, 보안, 인프라)
- 탭 전환: "카탈로그" | "내 설치"
- 카드 그리드: 3열 반응형 (lg:3, md:2, sm:1)
- 각 카드: 로고 아이콘 + 이름 + publisher + 카테고리 뱃지 + 유형 뱃지(Server/App/Skill) + 설치 CTA

### 2. 내 설치 뷰
- 설치된 플러그인만 필터
- 활성화/비활성화 Switch 토글
- 제거 버튼

### 3. 플러그인 상세 (Sheet)
- 이름, publisher, 설명, 버전
- 포함된 Tools 목록 (개별 on/off 토글)
- 필요 권한(Permissions) 표시
- 설치/제거 버튼

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 |
|---|----------|-----------|
| AC1 | 카드 그리드 + 카테고리 필터 + 검색으로 10개+ 플러그인 탐색 | AgentMarketplaceView — 카탈로그 탭, 카테고리 필터 칩, 검색바, 12개 목데이터 |
| AC2 | 플러그인 상세: MCP Servers, Skills, 권한 표시 | Sheet 사이드패널 — tools 목록, permissions 목록, type 뱃지 |
| AC3 | 원클릭 설치 → OAuth 동의 시뮬레이션 → 활성화 토글 | 카드 "설치" 버튼 → confirm → status 변경 → Switch 토글 |
| AC4 | 내 설치 목록: 활성화/비활성화/제거 관리 | "내 설치" 탭 — Switch + 제거 버튼 |
| AC5 | AdminView 마켓플레이스 탭 통합 | AdminView.tsx 수정 — TabsTrigger + TabsContent |
| AC6 | 최소 4개 카테고리 | 6개 카테고리: data_analysis, productivity, communication, development, security, infrastructure |
| AC7 | 반응형 카드 그리드 열 수 조정 | Tailwind grid-cols-1 md:grid-cols-2 lg:grid-cols-3 |
| AC8 | 플러그인 상태 뱃지: 설치됨/미설치, 활성/비활성, 업데이트 가능 | 카드 + 상세 — status 별 Badge 컴포넌트 |

## 테스트 시나리오

| # | Acceptance Criteria | 시나리오 | 테스트 방법 | 우선순위 |
|---|---------------------|---------|-----------|---------|
| 1 | AC1 | 초기 렌더 → 12개 카드 표시 | RTL render + queryAll PluginCard | must |
| 2 | AC1 | 카테고리 필터 클릭 → 해당 카테고리만 표시 | userEvent.click 필터 칩 → 카운트 확인 | must |
| 3 | AC1 | 검색어 입력 → 매칭 플러그인만 표시 | userEvent.type 검색 → 카운트 확인 | must |
| 4 | AC2 | 카드 클릭 → Sheet 열림 → 상세 정보 표시 | userEvent.click 카드 → Sheet 내 콘텐츠 확인 | must |
| 5 | AC3 | "설치" 클릭 → 상태 "installed"로 변경 | userEvent.click 설치 → Badge 텍스트 변경 | must |
| 6 | AC4 | "내 설치" 탭 → 설치된 플러그인만 표시 | userEvent.click 탭 → 필터 결과 확인 | must |
| 7 | AC4 | Switch 토글 → enabled 변경 | userEvent.click Switch → 상태 확인 | must |
| 8 | AC5 | AdminView에 마켓플레이스 탭 존재 | AdminView render → 탭 존재 확인 | must |
| 9 | AC6 | 6개 카테고리 필터 칩 존재 | 렌더 후 필터 칩 카운트 확인 | should |
| 10 | AC7 | 반응형 그리드 클래스 확인 | 그리드 컨테이너 className 확인 | should |
| 11 | AC8 | 상태별 뱃지 색상 분기 | 다양한 status 플러그인 렌더 → 뱃지 텍스트 확인 | should |
| 12 | AC4 | "제거" 클릭 → 목록에서 사라짐 | userEvent.click 제거 → 플러그인 사라짐 확인 | must |
