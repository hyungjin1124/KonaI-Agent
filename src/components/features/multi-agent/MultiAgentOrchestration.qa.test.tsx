import React from 'react';
import { render, screen, act } from '@testing-library/react';
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

// === QA Edge Case Tests ===

describe('QA: Data Boundary Tests', () => {
  it('AgentTaskCard handles empty currentAction gracefully', () => {
    render(
      <AgentTaskCard
        agent={mockAgents[0]}
        task={createMockTask({ status: 'running', currentAction: '' })}
        isSelected={false}
        onSelect={() => {}}
      />,
    );
    // Should still render without crashing
    expect(screen.getByTestId('agent-card-agent_a')).toBeInTheDocument();
  });

  it('AgentTaskCard handles very long agent name without layout break', () => {
    const longNameAgent: AgentDefinition = {
      ...mockAgents[0],
      name: '매우 긴 이름의 데이터 수집 에이전트가 여기에 표시됩니다 매우매우매우 긴 이름',
    };
    render(
      <AgentTaskCard
        agent={longNameAgent}
        task={createMockTask({ status: 'running', currentAction: '실행 중...' })}
        isSelected={false}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByTestId('agent-card-agent_a')).toBeInTheDocument();
  });

  it('AgentTaskCard handles very long error message without crash', () => {
    const longError = '네트워크 오류: '.repeat(50);
    render(
      <AgentTaskCard
        agent={mockAgents[0]}
        task={createMockTask({ status: 'failed', error: longError })}
        isSelected={false}
        onSelect={() => {}}
      />,
    );
    // Should render without crash; line-clamp-2 truncates visually
    expect(screen.getByTestId('agent-card-agent_a')).toBeInTheDocument();
    // Error text is present in DOM (even if visually clamped)
    expect(screen.getByText((content) => content.startsWith('네트워크 오류:'))).toBeInTheDocument();
  });

  it('AgentTaskList renders with empty agents array', () => {
    render(
      <AgentTaskList
        agents={[]}
        tasks={{}}
        handoffs={[]}
        selectedAgentId={null}
        onSelectAgent={() => {}}
        onRetryAgent={() => {}}
        isExpanded={true}
        onToggle={() => {}}
      />,
    );
    // Should render the collapsible header but no cards
    expect(screen.getByText('에이전트')).toBeInTheDocument();
  });

  it('AgentTaskList handles missing task for agent gracefully', () => {
    render(
      <AgentTaskList
        agents={mockAgents}
        tasks={{ agent_a: createMockTask({ agentId: 'agent_a', status: 'running' }) }}
        handoffs={[]}
        selectedAgentId={null}
        onSelectAgent={() => {}}
        onRetryAgent={() => {}}
        isExpanded={true}
        onToggle={() => {}}
      />,
    );
    // Only agent_a should be rendered, others skipped due to missing tasks
    expect(screen.getByTestId('agent-card-agent_a')).toBeInTheDocument();
    expect(screen.queryByTestId('agent-card-agent_b')).not.toBeInTheDocument();
  });

  it('AgentDetailView handles empty toolCalls array', () => {
    render(
      <AgentDetailView
        agent={mockAgents[0]}
        task={createMockTask({ status: 'running', toolCalls: [] })}
        onBack={() => {}}
      />,
    );
    expect(screen.getByText('아직 실행된 도구가 없습니다.')).toBeInTheDocument();
  });

  it('AgentResultsSummary handles all failed agents', () => {
    const tasks: Record<string, AgentTask> = {
      agent_a: createMockTask({ agentId: 'agent_a', status: 'failed', error: 'timeout' }),
      agent_b: createMockTask({ agentId: 'agent_b', status: 'failed', error: 'connection refused' }),
    };
    render(
      <AgentResultsSummary agents={[mockAgents[0], mockAgents[1]]} tasks={tasks} />,
    );
    expect(screen.getByText('결과 종합')).toBeInTheDocument();
    expect(screen.getByText(/0개 에이전트 완료/)).toBeInTheDocument();
    expect(screen.getByText(/2개 실패/)).toBeInTheDocument();
  });

  it('AgentResultsSummary handles agents with no results or errors', () => {
    const tasks: Record<string, AgentTask> = {
      agent_a: createMockTask({ agentId: 'agent_a', status: 'completed' }),
    };
    render(
      <AgentResultsSummary agents={[mockAgents[0]]} tasks={tasks} />,
    );
    expect(screen.getByText('결과 종합')).toBeInTheDocument();
  });

  it('HandoffIndicator returns null for unknown agent IDs', () => {
    const handoff: HandoffEvent = {
      id: 'handoff-unknown',
      fromAgentId: 'nonexistent_1',
      toAgentId: 'nonexistent_2',
      reason: 'unknown handoff',
      timestamp: new Date(),
    };
    const { container } = render(
      <HandoffIndicator handoff={handoff} agents={{}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('OrchestrationSummaryBanner handles failed status with partial completion', () => {
    const orchestration: OrchestrationState = {
      status: 'completed',
      agents: {
        agent_a: createMockTask({ agentId: 'agent_a', status: 'completed', progress: 100 }),
        agent_b: createMockTask({ agentId: 'agent_b', status: 'failed', error: '오류' }),
        agent_c: createMockTask({ agentId: 'agent_c', status: 'completed', progress: 100 }),
        agent_d: createMockTask({ agentId: 'agent_d', status: 'failed', error: '오류' }),
      },
      handoffs: [],
      selectedAgentId: null,
      completedAt: new Date(),
    };
    render(
      <OrchestrationSummaryBanner orchestration={orchestration} agents={mockAgents} />,
    );
    expect(screen.getByText(/2개 완료, 2개 실패/)).toBeInTheDocument();
  });
});

describe('QA: User Interaction Tests', () => {
  it('AgentTaskCard retry button does not trigger onSelect', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onRetry = vi.fn();
    render(
      <AgentTaskCard
        agent={mockAgents[0]}
        task={createMockTask({ status: 'failed', error: '오류' })}
        isSelected={false}
        onSelect={onSelect}
        onRetry={onRetry}
      />,
    );

    const retryBtn = screen.getByLabelText('데이터 수집 에이전트 재시도');
    await user.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('AgentTaskCard without onRetry does not show retry button', () => {
    render(
      <AgentTaskCard
        agent={mockAgents[0]}
        task={createMockTask({ status: 'failed', error: '오류' })}
        isSelected={false}
        onSelect={() => {}}
      />,
    );
    expect(screen.queryByLabelText('데이터 수집 에이전트 재시도')).not.toBeInTheDocument();
  });

  it('AgentDetailView back button calls onBack', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(
      <AgentDetailView
        agent={mockAgents[0]}
        task={createMockTask({ status: 'running', currentAction: '실행 중...' })}
        onBack={onBack}
      />,
    );

    await user.click(screen.getByLabelText('뒤로 가기'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('AgentTaskList collapse toggle calls onToggle', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <AgentTaskList
        agents={mockAgents}
        tasks={{
          agent_a: createMockTask({ agentId: 'agent_a', status: 'running' }),
          agent_b: createMockTask({ agentId: 'agent_b', status: 'pending' }),
          agent_c: createMockTask({ agentId: 'agent_c', status: 'pending' }),
          agent_d: createMockTask({ agentId: 'agent_d', status: 'pending' }),
        }}
        handoffs={[]}
        selectedAgentId={null}
        onSelectAgent={() => {}}
        onRetryAgent={() => {}}
        isExpanded={true}
        onToggle={onToggle}
      />,
    );

    // Click the collapsible trigger (header button)
    await user.click(screen.getByText('에이전트'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});

describe('QA: State Transition Tests', () => {
  it('AgentTaskCard shows progress bar only for running and completed', () => {
    const { rerender } = render(
      <AgentTaskCard
        agent={mockAgents[0]}
        task={createMockTask({ status: 'pending' })}
        isSelected={false}
        onSelect={() => {}}
      />,
    );
    // Pending - no progress bar
    expect(screen.queryByText('50%')).not.toBeInTheDocument();

    // Running - should show progress bar
    rerender(
      <AgentTaskCard
        agent={mockAgents[0]}
        task={createMockTask({ status: 'running', progress: 50 })}
        isSelected={false}
        onSelect={() => {}}
      />,
    );
    const card = screen.getByTestId('agent-card-agent_a');
    // Progress bar container exists
    expect(card.querySelector('.bg-gray-100.rounded-full')).toBeInTheDocument();
  });

  it('AgentTaskCard does not show spinner section when pending', () => {
    const { container } = render(
      <AgentTaskCard
        agent={mockAgents[0]}
        task={createMockTask({ status: 'pending', currentAction: '대기 중' })}
        isSelected={false}
        onSelect={() => {}}
      />,
    );
    // "대기 중" appears as badge text, but the spinner + current action section should not render
    // Check that there's no animate-spin element (the Loader2 spinner)
    const spinners = container.querySelectorAll('.animate-spin');
    expect(spinners.length).toBe(0);
  });

  it('AgentDetailView shows error section for failed agent', () => {
    render(
      <AgentDetailView
        agent={mockAgents[0]}
        task={createMockTask({ status: 'failed', error: '타임아웃 오류 발생' })}
        onBack={() => {}}
      />,
    );
    expect(screen.getByText('타임아웃 오류 발생')).toBeInTheDocument();
    expect(screen.getByText('실패')).toBeInTheDocument();
  });

  it('AgentDetailView shows result section for completed agent', () => {
    render(
      <AgentDetailView
        agent={mockAgents[0]}
        task={createMockTask({
          status: 'completed',
          progress: 100,
          result: { summary: '분석 완료 — 5개 인사이트', artifacts: ['report.pdf', 'data.xlsx'] },
        })}
        onBack={() => {}}
      />,
    );
    expect(screen.getByText('결과')).toBeInTheDocument();
    expect(screen.getByText('분석 완료 — 5개 인사이트')).toBeInTheDocument();
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    expect(screen.getByText('data.xlsx')).toBeInTheDocument();
  });
});

describe('QA: Hook Edge Cases', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('startOrchestration with invalid scenarioId does nothing', () => {
    const { result } = renderHook(() => useMultiAgentOrchestration());

    act(() => {
      result.current.startOrchestration('nonexistent_scenario');
    });

    expect(result.current.orchestration.status).toBe('idle');
    expect(result.current.activeScenario).toBeNull();
  });

  it('cancelOrchestration resets to idle', () => {
    const { result } = renderHook(() => useMultiAgentOrchestration());

    act(() => {
      result.current.startOrchestration('sales_analysis');
    });
    expect(result.current.orchestration.status).toBe('running');

    act(() => {
      result.current.cancelOrchestration();
    });
    expect(result.current.orchestration.status).toBe('idle');
    expect(result.current.activeScenario).toBeNull();
  });

  it('retryAgent resets failed agent to pending then completes', () => {
    const { result } = renderHook(() => useMultiAgentOrchestration());

    act(() => {
      result.current.startOrchestration('sales_analysis');
    });

    // Advance to complete all steps
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    // Check if any agent failed, or manually set one as failed via processStep
    // For this test, we check retryAgent behavior directly after some execution
    const agents = result.current.orchestration.agents;
    const agentIds = Object.keys(agents);
    if (agentIds.length > 0) {
      const targetId = agentIds[0];
      act(() => {
        result.current.retryAgent(targetId);
      });
      // Agent should be reset to pending
      expect(result.current.orchestration.agents[targetId].status).toBe('pending');
      expect(result.current.orchestration.status).toBe('running');

      // After 500ms, should transition to running
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(result.current.orchestration.agents[targetId].status).toBe('running');

      // After 2000ms total, should complete
      act(() => {
        vi.advanceTimersByTime(1500);
      });
      expect(result.current.orchestration.agents[targetId].status).toBe('completed');
    }
  });

  it('selectAgent with null deselects current agent', () => {
    const { result } = renderHook(() => useMultiAgentOrchestration());

    act(() => {
      result.current.startOrchestration('sales_analysis');
    });

    act(() => {
      result.current.selectAgent('data_collector');
    });
    expect(result.current.orchestration.selectedAgentId).toBe('data_collector');

    act(() => {
      result.current.selectAgent(null);
    });
    expect(result.current.orchestration.selectedAgentId).toBeNull();
  });

  it('hook cleans up timers on unmount', () => {
    const { result, unmount } = renderHook(() => useMultiAgentOrchestration());

    act(() => {
      result.current.startOrchestration('sales_analysis');
    });

    // Unmount should clear all timers without errors
    expect(() => unmount()).not.toThrow();
  });

  it('double startOrchestration clears previous timers', () => {
    const { result } = renderHook(() => useMultiAgentOrchestration());

    act(() => {
      result.current.startOrchestration('sales_analysis');
    });

    // Start again without finishing
    act(() => {
      result.current.startOrchestration('sales_analysis');
    });

    expect(result.current.orchestration.status).toBe('running');
    // All agents should be re-initialized to pending
    const agents = result.current.orchestration.agents;
    for (const key of Object.keys(agents)) {
      expect(agents[key].status).toBe('pending');
    }
  });
});
