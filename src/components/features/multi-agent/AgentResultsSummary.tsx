import React from 'react';
import { CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { AgentDefinition, AgentTask } from './types';
import { STATUS_CONFIG } from './constants';

interface AgentResultsSummaryProps {
  agents: AgentDefinition[];
  tasks: Record<string, AgentTask>;
}

export const AgentResultsSummary: React.FC<AgentResultsSummaryProps> = ({
  agents,
  tasks,
}) => {
  const completedAgents = agents.filter(a => tasks[a.id]?.status === 'completed');
  const failedAgents = agents.filter(a => tasks[a.id]?.status === 'failed');
  const allArtifacts = completedAgents.flatMap(
    a => tasks[a.id]?.result?.artifacts ?? [],
  );

  return (
    <div data-testid="agent-results-summary" className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">결과 종합</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {completedAgents.length}개 에이전트 완료
          {failedAgents.length > 0 && `, ${failedAgents.length}개 실패`}
        </p>
      </div>

      {/* Agent Results */}
      <div className="divide-y divide-gray-100">
        {agents.map((agent) => {
          const task = tasks[agent.id];
          if (!task) return null;
          const config = STATUS_CONFIG[task.status];

          return (
            <div key={agent.id} className="px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{agent.icon}</span>
                <span className="text-sm font-medium text-gray-900">{agent.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ml-auto ${config.badgeClass}`}>
                  {config.label}
                </span>
              </div>
              {task.result ? (
                <p className="text-xs text-gray-600 pl-6">{task.result.summary}</p>
              ) : task.error ? (
                <div className="flex items-center gap-1 pl-6">
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  <p className="text-xs text-red-600">{task.error}</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Artifacts */}
      {allArtifacts.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center gap-1.5 mb-2">
            <FileText className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-600">
              생성된 산출물 ({allArtifacts.length}건)
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allArtifacts.map((artifact) => (
              <span
                key={artifact}
                className="text-xs bg-white text-gray-700 px-2 py-1 rounded border border-gray-200"
              >
                {artifact}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentResultsSummary;
