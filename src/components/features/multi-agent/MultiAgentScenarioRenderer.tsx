import React, { useEffect, useCallback, useState } from 'react';
import { useMultiAgentOrchestration } from './useMultiAgentOrchestration';
import { AgentTaskList } from './AgentTaskList';
import { AgentDetailView } from './AgentDetailView';
import { OrchestrationSummaryBanner } from './OrchestrationSummaryBanner';
import { AgentResultsSummary } from './AgentResultsSummary';
import { DEFAULT_SCENARIO_ID } from './constants';

interface MultiAgentScenarioRendererProps {
  scenarioId?: string;
  onComplete?: () => void;
}

export const MultiAgentScenarioRenderer: React.FC<MultiAgentScenarioRendererProps> = ({
  scenarioId = DEFAULT_SCENARIO_ID,
  onComplete,
}) => {
  const {
    orchestration,
    startOrchestration,
    selectAgent,
    retryAgent,
    activeScenario,
  } = useMultiAgentOrchestration();

  const [isAgentListExpanded, setIsAgentListExpanded] = useState(true);
  const hasStartedRef = React.useRef(false);

  // Auto-start on mount
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startOrchestration(scenarioId);
    }
  }, [scenarioId, startOrchestration]);

  // Notify parent on completion
  useEffect(() => {
    if (orchestration.status === 'completed' && onComplete) {
      onComplete();
    }
  }, [orchestration.status, onComplete]);

  const handleBack = useCallback(() => {
    selectAgent(null);
  }, [selectAgent]);

  if (!activeScenario) return null;

  const agents = activeScenario.agents;
  const selectedAgent = orchestration.selectedAgentId
    ? agents.find(a => a.id === orchestration.selectedAgentId) ?? null
    : null;
  const selectedTask = orchestration.selectedAgentId
    ? orchestration.agents[orchestration.selectedAgentId] ?? null
    : null;

  const agentDefMap = agents.reduce<Record<string, typeof agents[0]>>((acc, a) => {
    acc[a.id] = a;
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {/* Summary Banner */}
      <OrchestrationSummaryBanner
        orchestration={orchestration}
        agents={agents}
      />

      {/* Two-panel layout: Agent List (sidebar) + Detail (main) */}
      <div className="flex gap-3">
        {/* Agent List Sidebar */}
        <div className="w-72 flex-shrink-0 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <AgentTaskList
            agents={agents}
            tasks={orchestration.agents}
            handoffs={orchestration.handoffs}
            selectedAgentId={orchestration.selectedAgentId}
            onSelectAgent={selectAgent}
            onRetryAgent={retryAgent}
            isExpanded={isAgentListExpanded}
            onToggle={() => setIsAgentListExpanded(prev => !prev)}
          />
        </div>

        {/* Detail View */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden min-h-[300px]">
          {selectedAgent && selectedTask ? (
            <AgentDetailView
              agent={selectedAgent}
              task={selectedTask}
              onBack={handleBack}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              에이전트를 선택하면 상세 실행 로그를 확인할 수 있습니다.
            </div>
          )}
        </div>
      </div>

      {/* Results Summary (after completion) */}
      {orchestration.status === 'completed' && (
        <AgentResultsSummary
          agents={agents}
          tasks={orchestration.agents}
        />
      )}
    </div>
  );
};

export default MultiAgentScenarioRenderer;
