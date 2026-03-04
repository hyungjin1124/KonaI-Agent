import React from 'react';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { AgentTaskCard } from './AgentTaskCard';
import { AgentTaskList } from './AgentTaskList';
import { AgentDetailView } from './AgentDetailView';
import { OrchestrationSummaryBanner } from './OrchestrationSummaryBanner';
import { HandoffIndicator } from './HandoffIndicator';
import { AgentResultsSummary } from './AgentResultsSummary';
import { useMultiAgentOrchestration } from './useMultiAgentOrchestration';
import { MULTI_AGENT_SCENARIOS } from './constants';
import { AgentDefinition, AgentTask, HandoffEvent, OrchestrationState } from './types';

// === Test Fixtures ===
const mockAgents: AgentDefinition[] = [
  { id: 'agent_a', name: '데이터 수집 에이전트', role: '데이터 수집 전문가', icon: '📊', color: 'blue' },
  { id: 'agent_b', name: '분석 에이전트', role: '데이터 분석 전문가', icon: '🔬', color: 'purple' },
  { id: 'agent_c', name: '시각화 에이전트', role: '시각화 전문가', icon: '📈', color: 'emerald' },
  { id: 'agent_d', name: '보고서 에이전트', role: '보고서 작성 전문가', icon: '📝', color: 'amber' },
];

function createMockTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    agentId: 'agent_a',
    status: 'pending',
    currentAction: '대기 중',
    progress: 0,
    toolCalls: [],
    ...overrides,
  };
}

const mockHandoff: HandoffEvent = {
  id: 'handoff-1',
  fromAgentId: 'agent_a',
  toAgentId: 'agent_b',
  reason: '데이터 수집 완료, 분석 시작',
  timestamp: new Date(),
};

// === Smoke Test ===
describe('MultiAgentOrchestration - Smoke Tests', () => {
  it('renders AgentTaskCard without crashing', () => {
    render(
      <AgentTaskCard
        agent={mockAgents[0]}
        task={createMockTask()}
        isSelected={false}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText('데이터 수집 에이전트')).toBeInTheDocument();
  });

  it('renders AgentDetailView without crashing', () => {
    render(
      <AgentDetailView
        agent={mockAgents[0]}
        task={createMockTask({ status: 'running', currentAction: '데이터 조회 중...' })}
        onBack={() => {}}
      />,
    );
    expect(screen.getByTestId('agent-detail-view')).toBeInTheDocument();
  });

  it('renders HandoffIndicator without crashing', () => {
    const agentMap = { agent_a: mockAgents[0], agent_b: mockAgents[1] };
    render(<HandoffIndicator handoff={mockHandoff} agents={agentMap} />);
    expect(screen.getByTestId(`handoff-${mockHandoff.id}`)).toBeInTheDocument();
  });
});

// === AC1: 2+ agents displayed in sidebar list ===
describe('AC1: Agent sidebar list displays multiple agents', () => {
  it('renders all 4 agent cards in the task list', () => {
    const tasks: Record<string, AgentTask> = {
      agent_a: createMockTask({ agentId: 'agent_a', status: 'running', progress: 50 }),
      agent_b: createMockTask({ agentId: 'agent_b', status: 'running', progress: 20 }),
      agent_c: createMockTask({ agentId: 'agent_c', status: 'pending' }),
      agent_d: createMockTask({ agentId: 'agent_d', status: 'pending' }),
    };

    render(
      <AgentTaskList
        agents={mockAgents}
        tasks={tasks}
        handoffs={[]}
        selectedAgentId={null}
        onSelectAgent={() => {}}
        onRetryAgent={() => {}}
        isExpanded={true}
        onToggle={() => {}}
      />,
    );

    expect(screen.getByTestId('agent-card-agent_a')).toBeInTheDocument();
    expect(screen.getByTestId('agent-card-agent_b')).toBeInTheDocument();
    expect(screen.getByTestId('agent-card-agent_c')).toBeInTheDocument();
    expect(screen.getByTestId('agent-card-agent_d')).toBeInTheDocument();
  });
});

// === AC2: Status badge transitions ===
describe('AC2: Agent status badge real-time transitions', () => {
  it('shows pending badge for pending agent', () => {
    render(
      <AgentTaskCard
        agent={mockAgents[0]}
        task={createMockTask({ status: 'pending' })}
        isSelected={false}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText('대기 중')).toBeInTheDocument();
  });

  it('shows running badge for running agent', () => {
    render(
      <AgentTaskCard
        agent={mockAgents[0]}
        task={createMockTask({ status: 'running', currentAction: '데이터 조회 중...' })}
        isSelected={false}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText('실행 중')).toBeInTheDocument();
  });

  it('shows completed badge for completed agent', () => {
    render(
      <AgentTaskCard
        agent={mockAgents[0]}
        task={createMockTask({
          status: 'completed',
          progress: 100,
          result: { summary: '수집 완료' },
        })}
        isSelected={false}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText('완료')).toBeInTheDocument();
  });

  it('shows failed badge for failed agent', () => {
    render(
      <AgentTaskCard
        agent={mockAgents[0]}
        task={createMockTask({ status: 'failed', error: '연결 오류' })}
        isSelected={false}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText('실패')).toBeInTheDocument();
  });
});

// === AC3: Current action real-time update ===
describe('AC3: Current action display updates', () => {
  it('displays current action text when agent is running', () => {
    render(
      <AgentTaskCard
        agent={mockAgents[0]}
        task={createMockTask({ status: 'running', currentAction: 'ERP 시스템 연결 중...' })}
        isSelected={false}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText('ERP 시스템 연결 중...')).toBeInTheDocument();
  });
});

// === AC4: Agent card click → detail view ===
describe('AC4: Agent card click navigates to detail view', () => {
  it('calls onSelect when agent card is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <AgentTaskCard
        agent={mockAgents[0]}
        task={createMockTask({ status: 'running' })}
        isSelected={false}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByTestId('agent-card-agent_a'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('renders tool calls in detail view', () => {
    render(
      <AgentDetailView
        agent={mockAgents[0]}
        task={createMockTask({
          status: 'running',
          currentAction: '데이터 조회 중...',
          toolCalls: [
            {
              id: 'tc-1',
              toolName: 'erp_connect',
              status: 'completed',
              input: 'ERP 연결',
              output: '연결 성공',
              startedAt: new Date(),
              completedAt: new Date(),
            },
          ],
        })}
        onBack={() => {}}
      />,
    );
    expect(screen.getByText('erp_connect')).toBeInTheDocument();
    expect(screen.getByText('연결 성공')).toBeInTheDocument();
  });
});

// === AC5: Handoff visual indicator ===
describe('AC5: Handoff indicator displays between agents', () => {
  it('renders handoff reason text', () => {
    const agentMap = { agent_a: mockAgents[0], agent_b: mockAgents[1] };
    render(<HandoffIndicator handoff={mockHandoff} agents={agentMap} />);
    expect(screen.getByText('데이터 수집 완료, 분석 시작')).toBeInTheDocument();
  });

  it('shows handoff indicators in agent task list', () => {
    const tasks: Record<string, AgentTask> = {
      agent_a: createMockTask({ agentId: 'agent_a', status: 'completed', progress: 100 }),
      agent_b: createMockTask({ agentId: 'agent_b', status: 'running', progress: 30 }),
    };

    render(
      <AgentTaskList
        agents={[mockAgents[0], mockAgents[1]]}
        tasks={tasks}
        handoffs={[mockHandoff]}
        selectedAgentId={null}
        onSelectAgent={() => {}}
        onRetryAgent={() => {}}
        isExpanded={true}
        onToggle={() => {}}
      />,
    );

    expect(screen.getByTestId(`handoff-${mockHandoff.id}`)).toBeInTheDocument();
  });
});

// === AC6: Results summary after completion ===
describe('AC6: Results summary renders after all agents complete', () => {
  it('renders results summary with agent results', () => {
    const tasks: Record<string, AgentTask> = {
      agent_a: createMockTask({
        agentId: 'agent_a',
        status: 'completed',
        result: { summary: '데이터 5,892건 수집', artifacts: ['data.csv'] },
      }),
      agent_b: createMockTask({
        agentId: 'agent_b',
        status: 'completed',
        result: { summary: '5개 인사이트 도출', artifacts: ['analysis.md'] },
      }),
    };

    render(
      <AgentResultsSummary agents={[mockAgents[0], mockAgents[1]]} tasks={tasks} />,
    );

    expect(screen.getByTestId('agent-results-summary')).toBeInTheDocument();
    expect(screen.getByText('결과 종합')).toBeInTheDocument();
    expect(screen.getByText('데이터 5,892건 수집')).toBeInTheDocument();
    expect(screen.getByText('5개 인사이트 도출')).toBeInTheDocument();
    expect(screen.getByText('data.csv')).toBeInTheDocument();
    expect(screen.getByText('analysis.md')).toBeInTheDocument();
  });
});

// === AC7: Failed agent error + retry ===
describe('AC7: Failed agent shows error and retry button', () => {
  it('displays error message and retry button for failed agent', () => {
    const onRetry = vi.fn();
    render(
      <AgentTaskCard
        agent={mockAgents[0]}
        task={createMockTask({ status: 'failed', error: '네트워크 오류 발생' })}
        isSelected={false}
        onSelect={() => {}}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText('네트워크 오류 발생')).toBeInTheDocument();
    expect(screen.getByLabelText('데이터 수집 에이전트 재시도')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const onSelect = vi.fn();

    render(
      <AgentTaskCard
        agent={mockAgents[0]}
        task={createMockTask({ status: 'failed', error: '오류' })}
        isSelected={false}
        onSelect={onSelect}
        onRetry={onRetry}
      />,
    );

    await user.click(screen.getByLabelText('데이터 수집 에이전트 재시도'));
    expect(onRetry).toHaveBeenCalledTimes(1);
    // onSelect should NOT be called (stopPropagation)
    expect(onSelect).not.toHaveBeenCalled();
  });
});

// === AC8: Summary banner shows running agent count ===
describe('AC8: Orchestration summary banner', () => {
  it('shows running agent count during execution', () => {
    const orchestration: OrchestrationState = {
      status: 'running',
      agents: {
        agent_a: createMockTask({ agentId: 'agent_a', status: 'running' }),
        agent_b: createMockTask({ agentId: 'agent_b', status: 'running' }),
        agent_c: createMockTask({ agentId: 'agent_c', status: 'pending' }),
        agent_d: createMockTask({ agentId: 'agent_d', status: 'pending' }),
      },
      handoffs: [],
      selectedAgentId: null,
    };

    render(
      <OrchestrationSummaryBanner orchestration={orchestration} agents={mockAgents} />,
    );

    expect(screen.getByTestId('orchestration-summary-banner')).toBeInTheDocument();
    expect(screen.getByText(/2개 에이전트가 작업 중/)).toBeInTheDocument();
  });

  it('shows completion message when all agents are done', () => {
    const orchestration: OrchestrationState = {
      status: 'completed',
      agents: {
        agent_a: createMockTask({ agentId: 'agent_a', status: 'completed', progress: 100 }),
        agent_b: createMockTask({ agentId: 'agent_b', status: 'completed', progress: 100 }),
      },
      handoffs: [],
      selectedAgentId: null,
      completedAt: new Date(),
    };

    render(
      <OrchestrationSummaryBanner orchestration={orchestration} agents={[mockAgents[0], mockAgents[1]]} />,
    );

    expect(screen.getByText(/모두 작업 완료/)).toBeInTheDocument();
  });

  it('does not render when idle', () => {
    const orchestration: OrchestrationState = {
      status: 'idle',
      agents: {},
      handoffs: [],
      selectedAgentId: null,
    };

    const { container } = render(
      <OrchestrationSummaryBanner orchestration={orchestration} agents={mockAgents} />,
    );

    expect(container.firstChild).toBeNull();
  });
});

// === Hook Test ===
describe('useMultiAgentOrchestration Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with idle status', () => {
    const { result } = renderHook(() => useMultiAgentOrchestration());
    expect(result.current.orchestration.status).toBe('idle');
    expect(result.current.activeScenario).toBeNull();
  });

  it('transitions to running after startOrchestration', () => {
    const { result } = renderHook(() => useMultiAgentOrchestration());

    act(() => {
      result.current.startOrchestration('sales_analysis');
    });

    expect(result.current.orchestration.status).toBe('running');
    expect(result.current.activeScenario).toBeTruthy();
    expect(result.current.activeScenario?.id).toBe('sales_analysis');

    // All 4 agents should be initialized
    const scenario = MULTI_AGENT_SCENARIOS['sales_analysis'];
    for (const agent of scenario.agents) {
      expect(result.current.orchestration.agents[agent.id]).toBeDefined();
      expect(result.current.orchestration.agents[agent.id].status).toBe('pending');
    }
  });

  it('selects an agent', () => {
    const { result } = renderHook(() => useMultiAgentOrchestration());

    act(() => {
      result.current.startOrchestration('sales_analysis');
    });

    act(() => {
      result.current.selectAgent('analyst');
    });

    expect(result.current.orchestration.selectedAgentId).toBe('analyst');
  });

  it('processes steps over time', () => {
    const { result } = renderHook(() => useMultiAgentOrchestration());

    act(() => {
      result.current.startOrchestration('sales_analysis');
    });

    // Advance time to trigger first step
    act(() => {
      vi.advanceTimersByTime(900);
    });

    // data_collector should now be running
    const dataCollector = result.current.orchestration.agents['data_collector'];
    expect(dataCollector.status).toBe('running');
    expect(dataCollector.toolCalls.length).toBeGreaterThan(0);
  });
});
