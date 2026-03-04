import { useState, useCallback, useRef, useEffect } from 'react';
import {
  AgentTask,
  AgentToolCall,
  HandoffEvent,
  OrchestrationState,
  SimulationScenario,
  SimulationStep,
} from './types';
import { MULTI_AGENT_SCENARIOS } from './constants';

function createInitialAgentTask(agentId: string): AgentTask {
  return {
    agentId,
    status: 'pending',
    currentAction: '대기 중',
    progress: 0,
    toolCalls: [],
  };
}

export interface UseMultiAgentOrchestrationReturn {
  orchestration: OrchestrationState;
  startOrchestration: (scenarioId?: string) => void;
  selectAgent: (agentId: string | null) => void;
  retryAgent: (agentId: string) => void;
  cancelOrchestration: () => void;
  activeScenario: SimulationScenario | null;
}

export function useMultiAgentOrchestration(): UseMultiAgentOrchestrationReturn {
  const [orchestration, setOrchestration] = useState<OrchestrationState>({
    status: 'idle',
    agents: {},
    handoffs: [],
    selectedAgentId: null,
  });

  const [activeScenario, setActiveScenario] = useState<SimulationScenario | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isCancelledRef = useRef(false);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const selectAgent = useCallback((agentId: string | null) => {
    setOrchestration(prev => ({ ...prev, selectedAgentId: agentId }));
  }, []);

  const cancelOrchestration = useCallback(() => {
    isCancelledRef.current = true;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setOrchestration(prev => ({
      ...prev,
      status: 'idle',
    }));
    setActiveScenario(null);
  }, []);

  const startOrchestration = useCallback((scenarioId: string = 'sales_analysis') => {
    const scenario = MULTI_AGENT_SCENARIOS[scenarioId];
    if (!scenario) return;

    isCancelledRef.current = false;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    setActiveScenario(scenario);

    // Initialize all agents
    const initialAgents: Record<string, AgentTask> = {};
    for (const agent of scenario.agents) {
      initialAgents[agent.id] = createInitialAgentTask(agent.id);
    }

    setOrchestration({
      status: 'running',
      agents: initialAgents,
      handoffs: [],
      selectedAgentId: scenario.agents[0]?.id ?? null,
      startedAt: new Date(),
    });

    // Schedule steps with cumulative delay per agent
    const agentDelays: Record<string, number> = {};
    for (const agent of scenario.agents) {
      agentDelays[agent.id] = 0;
    }

    // Track total steps per agent for progress calculation
    const agentTotalSteps: Record<string, number> = {};
    const agentCurrentStep: Record<string, number> = {};
    for (const step of scenario.steps) {
      agentTotalSteps[step.agentId] = (agentTotalSteps[step.agentId] || 0) + 1;
    }
    for (const agent of scenario.agents) {
      agentCurrentStep[agent.id] = 0;
    }

    for (const step of scenario.steps) {
      agentDelays[step.agentId] += step.delayMs;
      const delay = agentDelays[step.agentId];
      agentCurrentStep[step.agentId]++;
      const stepIndex = agentCurrentStep[step.agentId];
      const totalSteps = agentTotalSteps[step.agentId];

      const timer = setTimeout(() => {
        if (isCancelledRef.current) return;
        processStep(step, stepIndex, totalSteps, scenario);
      }, delay);

      timersRef.current.push(timer);
    }
  }, []);

  function processStep(
    step: SimulationStep,
    stepIndex: number,
    totalSteps: number,
    scenario: SimulationScenario,
  ) {
    setOrchestration(prev => {
      const agents = { ...prev.agents };
      const agent = { ...agents[step.agentId] };
      const handoffs = [...prev.handoffs];

      // Update agent status
      if (step.isError) {
        agent.status = 'failed';
        agent.error = step.errorMessage || '알 수 없는 오류가 발생했습니다.';
        agent.currentAction = '오류 발생';
      } else if (step.isFinal) {
        agent.status = 'completed';
        agent.progress = 100;
        agent.currentAction = step.action;
        agent.completedAt = new Date();
        agent.result = step.result;
      } else {
        agent.status = 'running';
        agent.startedAt = agent.startedAt || new Date();
        agent.currentAction = step.action;
        agent.progress = Math.round((stepIndex / totalSteps) * 100);
      }

      // Add tool call if present
      if (step.toolName) {
        const toolCall: AgentToolCall = {
          id: `${step.agentId}-${step.toolName}-${Date.now()}`,
          toolName: step.toolName,
          status: step.isFinal || step.isError ? (step.isError ? 'failed' : 'completed') : 'completed',
          input: step.action,
          output: step.toolOutput,
          startedAt: new Date(),
          completedAt: new Date(),
        };
        agent.toolCalls = [...agent.toolCalls, toolCall];
      }

      agents[step.agentId] = agent;

      // Handle handoff
      if (step.handoffTo && step.handoffReason) {
        const handoff: HandoffEvent = {
          id: `handoff-${step.agentId}-${step.handoffTo}-${Date.now()}`,
          fromAgentId: step.agentId,
          toAgentId: step.handoffTo,
          reason: step.handoffReason,
          timestamp: new Date(),
        };
        handoffs.push(handoff);
      }

      // Check if all agents are done
      const allDone = scenario.agents.every(
        a => agents[a.id]?.status === 'completed' || agents[a.id]?.status === 'failed',
      );

      const hasFailed = scenario.agents.some(a => agents[a.id]?.status === 'failed');

      return {
        ...prev,
        agents,
        handoffs,
        status: allDone ? (hasFailed ? 'failed' : 'completed') : 'running',
        completedAt: allDone ? new Date() : undefined,
      };
    });
  }

  const retryAgent = useCallback((agentId: string) => {
    setOrchestration(prev => {
      const agents = { ...prev.agents };
      agents[agentId] = createInitialAgentTask(agentId);
      return { ...prev, agents, status: 'running', completedAt: undefined };
    });

    // For demo purposes, simulate a quick recovery
    const recoveryTimer = setTimeout(() => {
      if (isCancelledRef.current) return;
      setOrchestration(prev => {
        const agents = { ...prev.agents };
        const agent = { ...agents[agentId] };
        agent.status = 'running';
        agent.startedAt = new Date();
        agent.currentAction = '재시도 중...';
        agent.progress = 30;
        agent.toolCalls = [{
          id: `${agentId}-retry-${Date.now()}`,
          toolName: 'retry_recovery',
          status: 'running',
          input: '이전 작업 복구 중...',
          startedAt: new Date(),
        }];
        agents[agentId] = agent;
        return { ...prev, agents };
      });
    }, 500);
    timersRef.current.push(recoveryTimer);

    const completionTimer = setTimeout(() => {
      if (isCancelledRef.current) return;
      setOrchestration(prev => {
        const agents = { ...prev.agents };
        const agent = { ...agents[agentId] };
        agent.status = 'completed';
        agent.progress = 100;
        agent.currentAction = '복구 완료';
        agent.completedAt = new Date();
        agent.result = { summary: '재시도 후 작업 완료' };
        agent.toolCalls = agent.toolCalls.map(tc =>
          tc.status === 'running' ? { ...tc, status: 'completed' as const, completedAt: new Date(), output: '복구 성공' } : tc,
        );
        agents[agentId] = agent;

        const scenario = activeScenario;
        const allDone = scenario
          ? scenario.agents.every(a => agents[a.id]?.status === 'completed' || agents[a.id]?.status === 'failed')
          : true;
        const hasFailed = scenario
          ? scenario.agents.some(a => agents[a.id]?.status === 'failed')
          : false;

        return {
          ...prev,
          agents,
          status: allDone ? (hasFailed ? 'failed' : 'completed') : prev.status,
          completedAt: allDone ? new Date() : prev.completedAt,
        };
      });
    }, 2000);
    timersRef.current.push(completionTimer);
  }, [activeScenario]);

  return {
    orchestration,
    startOrchestration,
    selectAgent,
    retryAgent,
    cancelOrchestration,
    activeScenario,
  };
}
