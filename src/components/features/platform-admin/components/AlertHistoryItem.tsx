import React from 'react';
import type { AlertHistoryItem as AlertHistoryItemType } from '../data/platformAdminTypes';

interface AlertHistoryItemProps {
  item: AlertHistoryItemType;
}

const severityColor: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
};

const AlertHistoryItem: React.FC<AlertHistoryItemProps> = ({ item }) => {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-b-0">
      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${severityColor[item.severity]}`} aria-hidden="true" />
      <span className="sr-only">{item.severity === 'critical' ? '위험' : item.severity === 'warning' ? '주의' : '정보'}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-900 leading-relaxed">
          <strong className="font-medium">{item.tenantName}</strong> — {item.message}
        </div>
        <div className="text-[11px] text-gray-400 mt-0.5">
          {item.timestamp} · {item.channels}
        </div>
      </div>
    </div>
  );
};

export default AlertHistoryItem;
