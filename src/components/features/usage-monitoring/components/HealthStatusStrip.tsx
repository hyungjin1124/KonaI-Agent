import React from 'react';
import { Activity } from '../../../icons';
import { AGENT_HEALTH_DATA } from '../usageMonitoringData';
import type { HealthStatus } from '../usageMonitoringData';

const STATUS_CONFIG: Record<HealthStatus, { dot: string; label: string; text: string }> = {
  healthy: { dot: 'bg-green-500', label: '정상', text: 'text-green-700' },
  degraded: { dot: 'bg-yellow-500', label: '지연', text: 'text-yellow-700' },
  down: { dot: 'bg-red-500', label: '중단', text: 'text-red-700' },
};

export function HealthStatusStrip() {
  const agent = AGENT_HEALTH_DATA[0];
  const config = STATUS_CONFIG[agent.status];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 animate-fade-in-up" data-testid="health-status-strip">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gray-50 rounded-md text-gray-500">
            <Activity size={14} />
          </div>
          <span className="text-xs font-bold text-gray-900">에이전트 서비스 상태</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
            <div className={`w-2 h-2 rounded-full ${config.dot}`} aria-hidden="true" />
            <span className={`text-xs font-bold ${config.text}`} aria-label={`에이전트 상태: ${config.label}`}>{config.label}</span>
            {agent.status !== 'down' && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-[10px] text-gray-500">응답 {agent.latencyMs}ms</span>
                <span className="text-[10px] text-gray-500">오류 {agent.errorRate}%</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
