import React from 'react';
import type { Tenant } from '../data/platformAdminTypes';

interface TenantHealthCardProps {
  tenant: Tenant;
  onClick: (tenant: Tenant) => void;
}

const healthColors: Record<string, { bg: string; text: string; bar: string }> = {
  healthy: { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'bg-amber-500' },
  danger: { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' },
};

const tagColors: Record<string, string> = {
  '정상': 'bg-green-100 text-green-700',
  '에러↑': 'bg-amber-100 text-amber-700',
  '미결제': 'bg-red-100 text-red-700',
  '정지': 'bg-red-100 text-red-700',
  'default': 'bg-amber-100 text-amber-700',
};

const TenantHealthCard: React.FC<TenantHealthCardProps> = ({ tenant, onClick }) => {
  const colors = healthColors[tenant.healthLevel];
  const isSuspended = tenant.status === 'Suspended';

  return (
    <div
      onClick={() => onClick(tenant)}
      className={`relative border rounded-xl p-3.5 cursor-pointer transition-all hover:shadow-sm ${
        isSuspended
          ? 'border-gray-300 bg-gray-50 hover:border-gray-400'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      {/* Suspended overlay badge */}
      {isSuspended && (
        <div className="absolute top-2 right-2 text-[10px] font-medium bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
          정지됨
        </div>
      )}
      {/* Header: name + score */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">{tenant.plan} · {tenant.status}</div>
        </div>
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium ${colors.bg} ${colors.text}`}
          aria-label={`헬스 점수 ${tenant.healthScore}점`}
          role="img"
        >
          {tenant.healthScore}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-1 text-[11px]">
        <div className="flex justify-between text-gray-500">
          <span>에러율</span>
          <span className={`font-medium ${tenant.metrics.errorRate > 5 ? 'text-red-600' : tenant.metrics.errorRate > 2 ? 'text-amber-600' : 'text-gray-900'}`}>
            {tenant.metrics.errorRate > 0 ? `${tenant.metrics.errorRate}%` : '—'}
          </span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>응답</span>
          <span className={`font-medium ${tenant.metrics.responseTimeSec > 4 ? 'text-red-600' : 'text-gray-900'}`}>
            {tenant.metrics.responseTimeSec > 0 ? `${tenant.metrics.responseTimeSec}s` : '—'}
          </span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>한도</span>
          <span className={`font-medium ${tenant.metrics.tokenLimitUsage > 90 ? 'text-red-600' : tenant.metrics.tokenLimitUsage > 75 ? 'text-amber-600' : 'text-gray-900'}`}>
            {tenant.metrics.tokenLimitUsage}%
          </span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>접속</span>
          <span className={`font-medium ${tenant.metrics.lastActivityMinutes > 10080 ? 'text-red-600' : tenant.metrics.lastActivityMinutes > 4320 ? 'text-amber-600' : 'text-gray-900'}`}>
            {tenant.metrics.lastActivityAgo}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-2">
        <div
          className={`h-full rounded-full ${colors.bar}`}
          style={{ width: `${Math.min(tenant.metrics.tokenLimitUsage, 100)}%` }}
        />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-2">
        {tenant.tags.map(tag => (
          <span
            key={tag}
            className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md ${tagColors[tag] ?? tagColors.default}`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TenantHealthCard;
