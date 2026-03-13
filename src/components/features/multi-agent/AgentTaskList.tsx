import React from 'react';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';
import { AgentDefinition, AgentTask, HandoffEvent } from './types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';
import { AgentTaskCard } from './AgentTaskCard';
import { HandoffIndicator } from './HandoffIndicator';

interface AgentTaskListProps {
  agents: AgentDefinition[];
  tasks: Record<string, AgentTask>;
  handoffs: HandoffEvent[];
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string | null) => void;
  onRetryAgent: (agentId: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export const AgentTaskList: React.FC<AgentTaskListProps> = ({
  agents,
  tasks,
  handoffs,
  selectedAgentId,
  onSelectAgent,
  onRetryAgent,
  isExpanded,
  onToggle,
}) => {
  const completedCount = agents.filter(a => tasks[a.id]?.status === 'completed').length;
  const runningCount = agents.filter(a => tasks[a.id]?.status === 'running').length;
  const agentMap = agents.reduce<Record<string, AgentDefinition>>((acc, a) => {
    acc[a.id] = a;
    return acc;
  }, {});

  // Build interleaved list: agents + handoffs sorted chronologically
  const sortedHandoffs = [...handoffs].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  );

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle} className="border-b border-gray-200">
      <CollapsibleTrigger asChild>
        <button
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
            <Users className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">에이전트</span>
          </div>
          <div className="flex items-center gap-2">
            {runningCount > 0 && (
              <span className="text-xs text-blue-600 font-medium">{runningCount}개 실행 중</span>
            )}
            <span className="text-xs text-gray-500">
              {completedCount}/{agents.length}
            </span>
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
        <div className="px-3 pb-3 space-y-2">
          {agents.map((agent) => {
            const task = tasks[agent.id];
            if (!task) return null;

            // Find handoffs that target this agent (show before the agent card)
            const incomingHandoffs = sortedHandoffs.filter(h => h.toAgentId === agent.id);

            return (
              <React.Fragment key={agent.id}>
                {incomingHandoffs.map(h => (
                  <HandoffIndicator key={h.id} handoff={h} agents={agentMap} />
                ))}
                <AgentTaskCard
                  agent={agent}
                  task={task}
                  isSelected={selectedAgentId === agent.id}
                  onSelect={() => onSelectAgent(agent.id)}
                  onRetry={task.status === 'failed' ? () => onRetryAgent(agent.id) : undefined}
                />
              </React.Fragment>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AgentTaskList;
