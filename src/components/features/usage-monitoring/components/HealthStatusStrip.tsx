import React from 'react';
import { Activity } from '../../../icons';
import { AGENT_HEALTH_DATA } from '../usageMonitoringData';
import type { HealthStatus } from '../usageMonitoringData';

const STATUS_CONFIG: Record<HealthStatus, { dot: string; label: string }> = {
  healthy: { dot: 'bg-green-500', label: '정상' },
  degraded: { dot: 'bg-yellow-500', label: '지연' },
  down: { dot: 'bg-red-500', label: '중단' },
};

export function HealthStatusStrip() {
  const healthyCount = AGENT_HEALTH_DATA.filter((a) => a.status === 'healthy').length;
  const total = AGENT_HEALTH_DATA.length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 animate-fade-in-up" data-testid="health-status-strip">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-gray-50 rounded-md text-gray-500">
            <Activity size={14} />
          </div>
          <span className="text-xs font-bold text-gray-900">에이전트 Health</span>
        </div>
        <span className="text-[10px] text-gray-400 font-medium">
          {healthyCount}/{total} 정상
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {AGENT_HEALTH_DATA.map((agent) => {
          const config = STATUS_CONFIG[agent.status];
          return (
            <div
              key={agent.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100"
              data-testid={`health-chip-${agent.id}`}
            >
              <div className={`w-2 h-2 rounded-full ${config.dot}`} title={config.label} />
              <span className="text-xs font-medium text-gray-700">{agent.name}</span>
              {agent.status !== 'down' && (
                <>
                  <span className="text-[10px] text-gray-400">{agent.latencyMs}ms</span>
                  <span className="text-[10px] text-gray-400">{agent.errorRate}%</span>
                </>
              )}
              {agent.status === 'down' && (
                <span className="text-[10px] text-red-500 font-medium">오프라인</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
