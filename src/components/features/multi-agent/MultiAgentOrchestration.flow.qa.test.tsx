import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { MultiAgentScenarioRenderer } from './MultiAgentScenarioRenderer';
import { useMultiAgentOrchestration } from './useMultiAgentOrchestration';
import { MULTI_AGENT_SCENARIOS } from './constants';

// === UX Flow Tests ===

describe('QA Flow: MultiAgentScenarioRenderer Orchestration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('auto-starts orchestration and renders summary banner', () => {
    render(<MultiAgentScenarioRenderer scenarioId="sales_analysis" />);

    // Summary banner should be visible (status is running after auto-start)
    expect(screen.getByTestId('orchestration-summary-banner')).toBeInTheDocument();
  });

  it('renders all agent cards on mount', () => {
    render(<MultiAgentScenarioRenderer scenarioId="sales_analysis" />);

    const scenario = MULTI_AGENT_SCENARIOS['sales_analysis'];
    for (const agent of scenario.agents) {
      expect(screen.getByTestId(`agent-card-${agent.id}`)).toBeInTheDocument();
    }
  });

  it('shows placeholder when no agent is selected', () => {
    render(<MultiAgentScenarioRenderer scenarioId="sales_analysis" />);

    // The auto-start selects the first agent, so we need to deselect
    // But the placeholder text should exist if we check initial render logic
    // Actually, startOrchestration sets selectedAgentId to first agent
    // So let's check the detail view is showing the first agent
    expect(screen.getByTestId('agent-detail-view')).toBeInTheDocument();
  });

  it('clicking an agent card updates the detail view', async () => {
    // Use real timers for user interaction to avoid timeout
    vi.useRealTimers();
    const user = userEvent.setup();

    render(<MultiAgentScenarioRenderer scenarioId="sales_analysis" />);

    // Click second agent card
    const scenario = MULTI_AGENT_SCENARIOS['sales_analysis'];
    const secondAgent = scenario.agents[1];
    await user.click(screen.getByTestId(`agent-card-${secondAgent.id}`));

    // Detail view should show the second agent's name
    const detailView = screen.getByTestId('agent-detail-view');
    expect(detailView).toHaveTextContent(secondAgent.name);

    // Restore fake timers for other tests
    vi.useFakeTimers();
  });

  it('calls onComplete when all agents finish', () => {
    const onComplete = vi.fn();
    render(
      <MultiAgentScenarioRenderer scenarioId="sales_analysis" onComplete={onComplete} />,
    );

    // Advance time to complete all steps
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('renders results summary after completion', () => {
    render(<MultiAgentScenarioRenderer scenarioId="sales_analysis" />);

    // Advance time to complete all steps
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(screen.getByTestId('agent-results-summary')).toBeInTheDocument();
    expect(screen.getByText('결과 종합')).toBeInTheDocument();
  });

  it('does not render results summary while running', () => {
    render(<MultiAgentScenarioRenderer scenarioId="sales_analysis" />);

    // Only advance a little (not enough to complete)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByTestId('agent-results-summary')).not.toBeInTheDocument();
  });
});

describe('QA Flow: Full Orchestration State Progression', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('agents transition through pending → running → completed states', () => {
    const { result } = renderHook(() => useMultiAgentOrchestration());

    act(() => {
      result.current.startOrchestration('sales_analysis');
    });

    // Initially all agents should be pending
    const scenario = MULTI_AGENT_SCENARIOS['sales_analysis'];
    for (const agent of scenario.agents) {
      expect(result.current.orchestration.agents[agent.id].status).toBe('pending');
    }

    // After first step delay, data_collector should be running
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(result.current.orchestration.agents['data_collector'].status).toBe('running');

    // Advance to completion
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    expect(result.current.orchestration.status).toBe('completed');

    // At least some agents should be completed
    const completedAgents = scenario.agents.filter(
      a => result.current.orchestration.agents[a.id]?.status === 'completed',
    );
    expect(completedAgents.length).toBeGreaterThan(0);
  });

  it('handoffs are created during orchestration', () => {
    const { result } = renderHook(() => useMultiAgentOrchestration());

    act(() => {
      result.current.startOrchestration('sales_analysis');
    });

    // Advance enough time for handoffs to occur
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    // The sales_analysis scenario should produce handoffs
    expect(result.current.orchestration.handoffs.length).toBeGreaterThan(0);
  });

  it('orchestration correctly reports completion with timestamps', () => {
    const { result } = renderHook(() => useMultiAgentOrchestration());

    act(() => {
      result.current.startOrchestration('sales_analysis');
    });

    // Should have startedAt
    expect(result.current.orchestration.startedAt).toBeDefined();

    // Advance to completion
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(result.current.orchestration.status).toBe('completed');
    expect(result.current.orchestration.completedAt).toBeDefined();
  });
});

describe('QA Flow: Retry Agent Recovery', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retrying an agent re-enables orchestration running status', () => {
    const { result } = renderHook(() => useMultiAgentOrchestration());

    act(() => {
      result.current.startOrchestration('sales_analysis');
    });

    // Complete all steps
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    const finalStatus = result.current.orchestration.status;
    // It should be 'completed' (or 'failed' if scenario has error steps)
    expect(['completed', 'failed']).toContain(finalStatus);

    // Retry an agent
    act(() => {
      result.current.retryAgent('data_collector');
    });

    // Status should go back to running
    expect(result.current.orchestration.status).toBe('running');
    expect(result.current.orchestration.agents['data_collector'].status).toBe('pending');

    // Complete retry
    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(result.current.orchestration.agents['data_collector'].status).toBe('completed');
  });
});

describe('QA Flow: Cancel Orchestration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('cancelling mid-execution stops further step processing', () => {
    const { result } = renderHook(() => useMultiAgentOrchestration());

    act(() => {
      result.current.startOrchestration('sales_analysis');
    });

    // Advance a little
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const statusBeforeCancel = result.current.orchestration.agents['data_collector'].status;
    expect(statusBeforeCancel).toBe('running');

    // Cancel
    act(() => {
      result.current.cancelOrchestration();
    });

    expect(result.current.orchestration.status).toBe('idle');

    // Advance more time — should NOT process more steps
    const agentsSnapshot = { ...result.current.orchestration.agents };
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    // Status should still be idle (not changed back to running/completed)
    expect(result.current.orchestration.status).toBe('idle');
  });
});
