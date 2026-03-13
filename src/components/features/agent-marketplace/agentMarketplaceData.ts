/**
 * Agent Marketplace — Types & Mock Data
 *
 * MCP-Native Plugin Ecosystem + Workspace Skills 하이브리드 모델.
 * Phase 1: 플러그인 카탈로그 + 설치/활성화 UI (목데이터 기반).
 */

// --- Types ---

export type PluginCategory =
  | 'data_analysis'
  | 'productivity'
  | 'communication'
  | 'development'
  | 'security'
  | 'infrastructure';

export type PluginType = 'mcp_server' | 'mcp_app' | 'skill';
export type PluginStatus = 'available' | 'installed' | 'update_available';

export interface PluginPermission {
  id: string;
  name: string;
  description: string;
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
  logoColor: string;
  logoInitial: string;
  status: PluginStatus;
  isEnabled: boolean;
  rating: number;
  installs: number;
  permissions: PluginPermission[];
  tools: PluginTool[];
  lastUpdated: string;
  tags: string[];
}

// --- Constants ---

export const CATEGORY_LABELS: Record<PluginCategory, string> = {
  data_analysis: '데이터 분석',
  productivity: '생산성',
  communication: '커뮤니케이션',
  development: '개발',
  security: '보안',
  infrastructure: '인프라',
};

export const CATEGORY_LIST: PluginCategory[] = [
  'data_analysis',
  'productivity',
  'communication',
  'development',
  'security',
  'infrastructure',
];

export const TYPE_LABELS: Record<PluginType, string> = {
  mcp_server: 'MCP Server',
  mcp_app: 'MCP App',
  skill: 'Skill',
};

export const STATUS_LABELS: Record<PluginStatus, string> = {
  available: '미설치',
  installed: '설치됨',
  update_available: '업데이트',
};

// --- Helpers ---

export function filterPlugins(
  plugins: MarketplacePlugin[],
  search: string,
  category: PluginCategory | 'all',
  tab: 'catalog' | 'installed',
): MarketplacePlugin[] {
  return plugins.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.publisher.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = category === 'all' || p.category === category;
    const matchesTab =
      tab === 'catalog' || p.status === 'installed' || p.status === 'update_available';
    return matchesSearch && matchesCategory && matchesTab;
  });
}

export function formatInstalls(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// --- Mock Data ---

export const MOCK_PLUGINS: MarketplacePlugin[] = [
  {
    id: 'amplitude-analytics',
    name: 'Amplitude Analytics',
    description: '사용자 행동 분석 데이터를 에이전트가 직접 조회하고 인사이트를 생성합니다. 퍼널 분석, 리텐션, 코호트 비교를 자연어로 요청할 수 있습니다.',
    publisher: 'Amplitude',
    category: 'data_analysis',
    type: 'mcp_app',
    version: '2.1.0',
    logoColor: '#1F2937',
    logoInitial: 'Am',
    status: 'installed',
    isEnabled: true,
    rating: 4.7,
    installs: 12400,
    permissions: [
      { id: 'amp-p1', name: '분석 데이터 읽기', description: '이벤트, 세그먼트, 퍼널 데이터에 대한 읽기 접근' },
      { id: 'amp-p2', name: '차트 생성', description: '분석 결과를 인터랙티브 차트로 렌더링' },
    ],
    tools: [
      { id: 'amp-t1', name: 'query_events', description: '이벤트 데이터 조회 및 필터링', enabled: true },
      { id: 'amp-t2', name: 'funnel_analysis', description: '전환 퍼널 분석 실행', enabled: true },
      { id: 'amp-t3', name: 'cohort_compare', description: '코호트 간 비교 분석', enabled: false },
    ],
    lastUpdated: '2026-03-10',
    tags: ['분석', '사용자행동', '퍼널', '리텐션'],
  },
  {
    id: 'notion-connector',
    name: 'Notion Workspace',
    description: 'Notion 워크스페이스의 페이지, 데이터베이스, 코멘트를 에이전트가 검색하고 편집합니다. 회의록 자동 정리, 프로젝트 상태 업데이트 등에 활용하세요.',
    publisher: 'Notion Labs',
    category: 'productivity',
    type: 'mcp_server',
    version: '3.0.2',
    logoColor: '#000000',
    logoInitial: 'N',
    status: 'installed',
    isEnabled: true,
    rating: 4.8,
    installs: 45200,
    permissions: [
      { id: 'not-p1', name: '페이지 읽기/쓰기', description: 'Notion 페이지 콘텐츠 읽기 및 수정' },
      { id: 'not-p2', name: '데이터베이스 조회', description: 'Notion 데이터베이스 쿼리 및 필터링' },
    ],
    tools: [
      { id: 'not-t1', name: 'search_pages', description: '페이지 전문 검색', enabled: true },
      { id: 'not-t2', name: 'update_page', description: '페이지 콘텐츠 업데이트', enabled: true },
      { id: 'not-t3', name: 'query_database', description: '데이터베이스 쿼리 및 필터', enabled: true },
    ],
    lastUpdated: '2026-03-08',
    tags: ['문서', '위키', '프로젝트관리', '노트'],
  },
  {
    id: 'slack-integration',
    name: 'Slack Messenger',
    description: 'Slack 채널과 DM에서 메시지를 검색하고, 에이전트가 직접 메시지를 전송합니다. 주요 채널 요약, 알림 전달 등을 자동화합니다.',
    publisher: 'Salesforce',
    category: 'communication',
    type: 'mcp_server',
    version: '1.8.0',
    logoColor: '#4A154B',
    logoInitial: 'Sl',
    status: 'available',
    isEnabled: false,
    rating: 4.5,
    installs: 38700,
    permissions: [
      { id: 'sl-p1', name: '메시지 읽기', description: '채널 및 DM 메시지 읽기' },
      { id: 'sl-p2', name: '메시지 전송', description: '채널 및 DM으로 메시지 전송' },
    ],
    tools: [
      { id: 'sl-t1', name: 'search_messages', description: '메시지 검색', enabled: true },
      { id: 'sl-t2', name: 'send_message', description: '메시지 전송', enabled: true },
      { id: 'sl-t3', name: 'list_channels', description: '채널 목록 조회', enabled: true },
    ],
    lastUpdated: '2026-03-05',
    tags: ['메시징', '채팅', '알림', '협업'],
  },
  {
    id: 'github-dev',
    name: 'GitHub Developer',
    description: '리포지토리, PR, 이슈를 에이전트가 직접 조회하고 관리합니다. 코드 리뷰 요약, PR 작성, 이슈 트리아지를 자동화합니다.',
    publisher: 'GitHub',
    category: 'development',
    type: 'mcp_server',
    version: '4.2.1',
    logoColor: '#24292E',
    logoInitial: 'GH',
    status: 'installed',
    isEnabled: true,
    rating: 4.9,
    installs: 67300,
    permissions: [
      { id: 'gh-p1', name: '리포지토리 읽기', description: '코드, PR, 이슈, 리뷰 읽기' },
      { id: 'gh-p2', name: '리포지토리 쓰기', description: 'PR 생성, 이슈 업데이트, 코멘트 작성' },
    ],
    tools: [
      { id: 'gh-t1', name: 'search_code', description: '코드 검색', enabled: true },
      { id: 'gh-t2', name: 'list_prs', description: 'PR 목록 조회 및 필터', enabled: true },
      { id: 'gh-t3', name: 'create_issue', description: '이슈 생성', enabled: true },
      { id: 'gh-t4', name: 'review_pr', description: 'PR 코드 리뷰 수행', enabled: true },
    ],
    lastUpdated: '2026-03-11',
    tags: ['코드', 'PR', '이슈', '버전관리'],
  },
  {
    id: 'figma-design',
    name: 'Figma Design',
    description: 'Figma 파일의 디자인 토큰, 컴포넌트, 프레임을 에이전트가 추출합니다. 디자인 시스템 문서화, 스타일 가이드 생성에 활용하세요.',
    publisher: 'Figma',
    category: 'development',
    type: 'mcp_app',
    version: '1.3.0',
    logoColor: '#A259FF',
    logoInitial: 'Fi',
    status: 'available',
    isEnabled: false,
    rating: 4.6,
    installs: 8900,
    permissions: [
      { id: 'fig-p1', name: '파일 읽기', description: 'Figma 파일 및 컴포넌트 데이터 읽기' },
      { id: 'fig-p2', name: 'UI 렌더링', description: '디자인 프리뷰를 인터랙티브 UI로 표시' },
    ],
    tools: [
      { id: 'fig-t1', name: 'get_components', description: '컴포넌트 목록 및 속성 조회', enabled: true },
      { id: 'fig-t2', name: 'extract_tokens', description: '디자인 토큰(색상, 타이포) 추출', enabled: true },
    ],
    lastUpdated: '2026-03-07',
    tags: ['디자인', 'UI', '컴포넌트', '토큰'],
  },
  {
    id: 'hubspot-crm',
    name: 'HubSpot CRM',
    description: 'HubSpot의 연락처, 거래, 파이프라인 데이터를 에이전트가 조회하고 업데이트합니다. 영업 파이프라인 분석, 리드 우선순위화를 자동화합니다.',
    publisher: 'HubSpot',
    category: 'productivity',
    type: 'mcp_server',
    version: '2.5.0',
    logoColor: '#FF7A59',
    logoInitial: 'HS',
    status: 'update_available',
    isEnabled: true,
    rating: 4.4,
    installs: 15600,
    permissions: [
      { id: 'hs-p1', name: 'CRM 데이터 읽기', description: '연락처, 거래, 회사 데이터 읽기' },
      { id: 'hs-p2', name: 'CRM 데이터 쓰기', description: '연락처 생성, 거래 단계 업데이트' },
    ],
    tools: [
      { id: 'hs-t1', name: 'search_contacts', description: '연락처 검색 및 필터', enabled: true },
      { id: 'hs-t2', name: 'get_deals', description: '거래 파이프라인 조회', enabled: true },
      { id: 'hs-t3', name: 'update_deal', description: '거래 단계/금액 업데이트', enabled: false },
    ],
    lastUpdated: '2026-03-06',
    tags: ['CRM', '영업', '고객', '파이프라인'],
  },
  {
    id: 'snowflake-data',
    name: 'Snowflake Data Cloud',
    description: 'Snowflake 데이터 웨어하우스에 자연어로 SQL 쿼리를 실행합니다. 데이터 탐색, 리포트 생성, 이상치 탐지를 대화형으로 수행합니다.',
    publisher: 'Snowflake',
    category: 'data_analysis',
    type: 'mcp_server',
    version: '3.1.0',
    logoColor: '#29B5E8',
    logoInitial: 'SF',
    status: 'available',
    isEnabled: false,
    rating: 4.8,
    installs: 22100,
    permissions: [
      { id: 'sf-p1', name: 'SQL 쿼리 실행', description: '읽기 전용 SQL 쿼리 실행' },
      { id: 'sf-p2', name: '스키마 조회', description: '테이블 및 열 메타데이터 조회' },
    ],
    tools: [
      { id: 'sf-t1', name: 'run_query', description: '자연어 → SQL 변환 및 실행', enabled: true },
      { id: 'sf-t2', name: 'describe_table', description: '테이블 스키마 및 샘플 데이터 조회', enabled: true },
      { id: 'sf-t3', name: 'detect_anomalies', description: '데이터 이상치 자동 탐지', enabled: true },
    ],
    lastUpdated: '2026-03-09',
    tags: ['데이터웨어하우스', 'SQL', '분석', '리포트'],
  },
  {
    id: 'jira-project',
    name: 'Jira Project',
    description: 'Jira 프로젝트의 이슈, 스프린트, 보드를 에이전트가 관리합니다. 스프린트 요약, 이슈 분류, 블로커 알림을 자동화합니다.',
    publisher: 'Atlassian',
    category: 'productivity',
    type: 'mcp_server',
    version: '2.0.0',
    logoColor: '#0052CC',
    logoInitial: 'Ji',
    status: 'available',
    isEnabled: false,
    rating: 4.3,
    installs: 28400,
    permissions: [
      { id: 'ji-p1', name: '이슈 읽기/쓰기', description: '이슈 조회, 생성, 상태 변경' },
      { id: 'ji-p2', name: '스프린트 관리', description: '스프린트 보드 조회 및 관리' },
    ],
    tools: [
      { id: 'ji-t1', name: 'search_issues', description: 'JQL 기반 이슈 검색', enabled: true },
      { id: 'ji-t2', name: 'create_issue', description: '이슈 생성', enabled: true },
      { id: 'ji-t3', name: 'sprint_summary', description: '스프린트 진행 상황 요약', enabled: true },
    ],
    lastUpdated: '2026-03-04',
    tags: ['프로젝트', '스프린트', '이슈', '애자일'],
  },
  {
    id: 'code-quality-guard',
    name: 'Code Quality Guard',
    description: '코드 품질 분석 스킬. 코드 복잡도, 중복, 잠재 버그를 자동 탐지하고 개선 제안을 생성합니다.',
    publisher: 'KonaI',
    category: 'development',
    type: 'skill',
    version: '1.0.0',
    logoColor: '#10B981',
    logoInitial: 'CQ',
    status: 'installed',
    isEnabled: false,
    rating: 4.2,
    installs: 3400,
    permissions: [
      { id: 'cq-p1', name: '코드 분석', description: '소스 코드 정적 분석 실행' },
    ],
    tools: [
      { id: 'cq-t1', name: 'analyze_complexity', description: '코드 복잡도 분석', enabled: true },
      { id: 'cq-t2', name: 'find_duplicates', description: '중복 코드 탐지', enabled: true },
    ],
    lastUpdated: '2026-03-01',
    tags: ['코드품질', '정적분석', '리팩토링'],
  },
  {
    id: 'vault-secrets',
    name: 'HashiCorp Vault',
    description: '시크릿, 인증서, 암호화 키를 안전하게 관리합니다. 에이전트가 시크릿 조회 시 감사 로그를 자동 기록합니다.',
    publisher: 'HashiCorp',
    category: 'security',
    type: 'mcp_server',
    version: '1.5.0',
    logoColor: '#000000',
    logoInitial: 'HV',
    status: 'available',
    isEnabled: false,
    rating: 4.7,
    installs: 9800,
    permissions: [
      { id: 'hv-p1', name: '시크릿 읽기', description: '지정된 경로의 시크릿 값 읽기' },
      { id: 'hv-p2', name: '감사 로그', description: '시크릿 접근 시 감사 이벤트 기록' },
    ],
    tools: [
      { id: 'hv-t1', name: 'read_secret', description: '시크릿 값 조회', enabled: true },
      { id: 'hv-t2', name: 'list_secrets', description: '시크릿 경로 목록', enabled: true },
    ],
    lastUpdated: '2026-02-28',
    tags: ['시크릿', '보안', '인증', '암호화'],
  },
  {
    id: 'aws-infra',
    name: 'AWS Infrastructure',
    description: 'AWS 리소스 상태를 조회하고 간단한 인프라 작업을 수행합니다. EC2 상태 확인, CloudWatch 메트릭 조회, S3 버킷 관리 등.',
    publisher: 'Amazon',
    category: 'infrastructure',
    type: 'mcp_server',
    version: '2.3.0',
    logoColor: '#FF9900',
    logoInitial: 'AW',
    status: 'available',
    isEnabled: false,
    rating: 4.5,
    installs: 18200,
    permissions: [
      { id: 'aw-p1', name: '리소스 읽기', description: 'EC2, S3, CloudWatch 읽기 전용 접근' },
      { id: 'aw-p2', name: '인스턴스 관리', description: '인스턴스 시작/중지 (관리자 승인 필요)' },
    ],
    tools: [
      { id: 'aw-t1', name: 'describe_instances', description: 'EC2 인스턴스 상태 조회', enabled: true },
      { id: 'aw-t2', name: 'get_metrics', description: 'CloudWatch 메트릭 조회', enabled: true },
      { id: 'aw-t3', name: 'list_buckets', description: 'S3 버킷 목록 및 사용량', enabled: true },
    ],
    lastUpdated: '2026-03-02',
    tags: ['클라우드', 'AWS', '인프라', '모니터링'],
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Google Calendar의 일정을 조회하고 새 일정을 생성합니다. 일정 충돌 확인, 미팅 요약, 시간 최적화를 지원합니다.',
    publisher: 'Google',
    category: 'communication',
    type: 'mcp_server',
    version: '1.2.0',
    logoColor: '#4285F4',
    logoInitial: 'GC',
    status: 'available',
    isEnabled: false,
    rating: 4.4,
    installs: 31500,
    permissions: [
      { id: 'gc-p1', name: '일정 읽기', description: '캘린더 이벤트 조회' },
      { id: 'gc-p2', name: '일정 쓰기', description: '이벤트 생성 및 수정' },
    ],
    tools: [
      { id: 'gc-t1', name: 'list_events', description: '일정 목록 조회 및 필터', enabled: true },
      { id: 'gc-t2', name: 'create_event', description: '새 일정 생성', enabled: true },
      { id: 'gc-t3', name: 'check_availability', description: '참석자 가용 시간 확인', enabled: true },
    ],
    lastUpdated: '2026-03-03',
    tags: ['캘린더', '일정', '미팅', '시간관리'],
  },
];
