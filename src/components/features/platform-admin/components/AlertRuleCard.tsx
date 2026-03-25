import React from 'react';
import { Switch } from '../../../ui/switch';
import { Button } from '../../../ui/button';
import type { AlertRule } from '../data/platformAdminTypes';

interface AlertRuleCardProps {
  rule: AlertRule;
  onToggle: (id: string) => void;
  onEdit?: (rule: AlertRule) => void;
}

const AlertRuleCard: React.FC<AlertRuleCardProps> = ({ rule, onToggle, onEdit }) => {
  return (
    <div className={`border border-gray-200 rounded-xl p-3.5 bg-white mb-2 ${!rule.enabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch checked={rule.enabled} onCheckedChange={() => onToggle(rule.id)} />
          <span className="text-sm font-medium text-gray-900">{rule.name}</span>
        </div>
        <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => onEdit?.(rule)}>편집</Button>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {rule.thresholdSteps.map((step, i) => (
          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
            {step.threshold} → {step.channels.join('+')} ({step.target === 'tenant' ? '테넌트' : step.target === 'platform' ? '플랫폼' : '전체'})
            {step.action && ` + ${step.action}`}
            {step.webhookUrl && <span className="ml-1 text-blue-500" title={step.webhookUrl}>webhook</span>}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AlertRuleCard;
