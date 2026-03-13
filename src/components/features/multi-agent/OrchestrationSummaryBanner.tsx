import React from 'react';
import { Users, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { OrchestrationState } from './types';
import { AgentDefinition } from './types';

interface OrchestrationSummaryBannerProps {
  orchestration: OrchestrationState;
  agents: AgentDefinition[];
}

export const OrchestrationSummaryBanner: React.FC<OrchestrationSummaryBannerProps> = ({
  orchestration,
  agents,
}) => {
  if (orchestration.status === 'idle') return null;

  const runningCount = agents.filter(a => orchestration.agents[a.id]?.status === 'running').length;
  const completedCount = agents.filter(a => orchestration.agents[a.id]?.status === 'completed').length;
  const failedCount = agents.filter(a => orchestration.agents[a.id]?.status === 'failed').length;
  const totalCount = agents.length;

  const isComplete = orchestration.status === 'completed';
  const hasFailed = failedCount > 0;

  return (
    <div
      data-testid="orchestration-summary-banner"
      role="status"
      aria-live="polite"
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border ${
        isComplete
          ? hasFailed
            ? 'bg-amber-50 border-amber-200'
            : 'bg-green-50 border-green-200'
          : 'bg-blue-50 border-blue-200'
      }`}
    >
      {/* Icon */}
      {isComplete ? (
        hasFailed ? (
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
        )
      ) : (
        <Loader2 className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />
      )}

      {/* Message */}
      <div className="flex-1 min-w-0">
        {isComplete ? (
          <span className={`text-sm font-medium ${hasFailed ? 'text-amber-800' : 'text-green-800'}`}>
            {hasFailed
              ? `${totalCount}개 에이전트 중 ${completedCount}개 완료, ${failedCount}개 실패`
              : `${totalCount}개 에이전트 모두 작업 완료`
            }
          </span>
        ) : (
          <span className="text-sm font-medium text-blue-800">
            {runningCount}개 에이전트가 작업 중 ({completedCount}/{totalCount} 완료)
          </span>
        )}
      </div>

      {/* Agent Avatars */}
      <div className="flex -space-x-1 flex-shrink-0">
        {agents.slice(0, 5).map((agent) => {
          const task = orchestration.agents[agent.id];
          const status = task?.status ?? 'pending';
          return (
            <span
              key={agent.id}
              className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full border-2 border-white ${
                status === 'running' ? 'bg-blue-100' :
                status === 'completed' ? 'bg-green-100' :
                status === 'failed' ? 'bg-red-100' :
                'bg-gray-100'
              }`}
              aria-label={`${agent.name}: ${status}`}
            >
              {agent.icon}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default OrchestrationSummaryBanner;
