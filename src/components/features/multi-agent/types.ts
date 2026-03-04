// =============================================
// Multi-Agent Orchestration Types
// =============================================

/** 에이전트 실행 상태 */
export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed';

/** 오케스트레이션 전체 상태 */
export type OrchestrationStatus = 'idle' | 'running' | 'completed' | 'failed';

/** 에이전트 정의 (역할/메타데이터) */
export interface AgentDefinition {
  id: string;
  name: string;
  role: string;
  icon: string;
  color: string; // Tailwind color prefix (e.g., 'blue', 'emerald')
}

/** 에이전트의 개별 도구 호출 */
export interface AgentToolCall {
  id: string;
  toolName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input?: string;
  output?: string;
  startedAt: Date;
  completedAt?: Date;
}

/** 에이전트 결과 */
export interface AgentResult {
  summary: string;
  artifacts?: string[];
}

/** 실행 중인 에이전트 인스턴스 */
export interface AgentTask {
  agentId: string;
  status: AgentStatus;
  currentAction: string;
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  toolCalls: AgentToolCall[];
  result?: AgentResult;
}

/** 핸드오프 이벤트 */
export interface HandoffEvent {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  reason: string;
  timestamp: Date;
}

/** 오케스트레이션 전체 상태 */
export interface OrchestrationState {
  status: OrchestrationStatus;
  agents: Record<string, AgentTask>;
  handoffs: HandoffEvent[];
  selectedAgentId: string | null;
  startedAt?: Date;
  completedAt?: Date;
}

/** 시뮬레이션 시나리오 단계 */
export interface SimulationStep {
  agentId: string;
  delayMs: number;
  action: string;
  toolName?: string;
  toolOutput?: string;
  handoffTo?: string;
  handoffReason?: string;
  isFinal?: boolean;
  isError?: boolean;
  errorMessage?: string;
  result?: AgentResult;
}

/** 시뮬레이션 시나리오 정의 */
export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  agents: AgentDefinition[];
  steps: SimulationStep[];
}
