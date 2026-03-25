import React, { useState } from 'react';
import { X, Plus, Trash2 } from '../../../icons';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import type { AlertRule, AlertChannel, AlertAction, AlertMetric } from '../data/platformAdminTypes';

interface AlertRuleEditorModalProps {
  rule?: AlertRule;
  onSave: (rule: AlertRule) => void;
  onClose: () => void;
}

type ThresholdRow = {
  threshold: string;
  channels: AlertChannel[];
  action: AlertAction;
  webhookUrl?: string;
};

const CHANNEL_OPTIONS: { id: AlertChannel; label: string }[] = [
  { id: 'email', label: '이메일' },
  { id: 'in-app', label: '인앱' },
  { id: 'slack', label: 'Slack' },
  { id: 'webhook', label: '웹훅' },
];

const ACTION_OPTIONS: { id: AlertAction; label: string; desc: string }[] = [
  { id: 'notify', label: '알림만', desc: '알림 발송, 서비스 유지' },
  { id: 'throttle', label: '서비스 제한', desc: 'API 호출 속도 제한' },
  { id: 'block', label: '자동 차단', desc: 'API 호출 전면 차단' },
];

const METRIC_OPTIONS: { id: AlertMetric; label: string; unit: string; placeholder: string }[] = [
  { id: 'token_usage', label: '토큰 사용량', unit: '%', placeholder: '예: 75' },
  { id: 'error_rate', label: '에러율', unit: '%', placeholder: '예: 5' },
  { id: 'response_time', label: '응답 시간', unit: 'ms', placeholder: '예: 3000' },
  { id: 'cost', label: '비용', unit: '$', placeholder: '예: 10000' },
  { id: 'custom', label: '직접 입력', unit: '', placeholder: '예: 80 또는 D+7' },
];

function getMetricUnit(metric: AlertMetric): string {
  return METRIC_OPTIONS.find(m => m.id === metric)?.unit ?? '';
}

function getMetricPlaceholder(metric: AlertMetric): string {
  return METRIC_OPTIONS.find(m => m.id === metric)?.placeholder ?? '';
}

/** Strip non-numeric characters from legacy threshold strings like "80%" → "80" */
function parseNumericThreshold(raw: string): string {
  const num = raw.replace(/[^0-9.]/g, '');
  return num;
}

const AlertRuleEditorModal: React.FC<AlertRuleEditorModalProps> = ({ rule, onSave, onClose }) => {
  const [name, setName] = useState(rule?.name ?? '');
  const [metric, setMetric] = useState<AlertMetric>(rule?.metric ?? 'token_usage');
  const [target, setTarget] = useState<'all' | 'specific'>(rule ? 'all' : 'all');
  const [targetTenants, setTargetTenants] = useState('');
  const [dryRunStatus, setDryRunStatus] = useState<string | null>(null);
  const [thresholds, setThresholds] = useState<ThresholdRow[]>(
    rule?.thresholdSteps.map(s => ({
      threshold: metric !== 'custom' ? parseNumericThreshold(s.threshold) : s.threshold,
      channels: s.channels as AlertChannel[],
      action: (s.action ?? 'notify') as AlertAction,
      webhookUrl: s.webhookUrl ?? '',
    })) ?? [{ threshold: '80', channels: ['email'], action: 'notify' }]
  );

  const unit = getMetricUnit(metric);
  const isNumericMetric = metric !== 'custom';
  const hasValidThresholds = thresholds.some(t => t.threshold.trim() !== '');

  const addThreshold = () => {
    setThresholds(prev => [...prev, { threshold: '', channels: ['email'], action: 'notify' }]);
  };

  const removeThreshold = (idx: number) => {
    setThresholds(prev => prev.filter((_, i) => i !== idx));
  };

  const updateThreshold = (idx: number, field: keyof ThresholdRow, value: unknown) => {
    setThresholds(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };

  const toggleChannel = (idx: number, channel: AlertChannel) => {
    setThresholds(prev => prev.map((t, i) => {
      if (i !== idx) return t;
      const channels = t.channels.includes(channel)
        ? t.channels.filter(c => c !== channel)
        : [...t.channels, channel];
      return { ...t, channels };
    }));
  };

  const handleSave = () => {
    const updated: AlertRule = {
      id: rule?.id ?? `ar-${Date.now()}`,
      name,
      metric,
      enabled: rule?.enabled ?? true,
      thresholdSteps: thresholds.map(t => ({
        threshold: isNumericMetric && t.threshold ? `${t.threshold}${unit}` : t.threshold,
        channels: t.channels,
        target: (target === 'all' ? 'all' : 'tenant') as 'all' | 'tenant',
        action: t.action,
        ...(t.webhookUrl ? { webhookUrl: t.webhookUrl } : {}),
      })),
    };
    onSave(updated);
  };

  const handleDryRun = () => {
    setDryRunStatus('테스트 알림이 발송되었습니다.');
    setTimeout(() => setDryRunStatus(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">
            {rule ? '알림 규칙 편집' : '새 알림 규칙'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Rule name */}
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">규칙 이름</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="예: 토큰 사용량 임계 알림"
              className="h-8 text-sm"
            />
          </div>

          {/* Metric selection */}
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">메트릭</label>
            <div className="flex flex-wrap gap-1.5">
              {METRIC_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setMetric(opt.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                    metric === opt.id
                      ? 'bg-[#534AB7] text-white border-[#534AB7]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target selection */}
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">적용 대상</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTarget('all')}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  target === 'all' ? 'bg-[#534AB7] text-white border-[#534AB7]' : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                전체 테넌트
              </button>
              <button
                onClick={() => setTarget('specific')}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  target === 'specific' ? 'bg-[#534AB7] text-white border-[#534AB7]' : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                특정 테넌트
              </button>
            </div>
            {target === 'specific' && (
              <Input
                value={targetTenants}
                onChange={e => setTargetTenants(e.target.value)}
                placeholder="테넌트명 (쉼표로 구분)"
                className="h-7 text-xs mt-2"
              />
            )}
          </div>

          {/* Threshold steps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-700">임계치 단계</label>
              <Button variant="outline" size="sm" className="h-6 text-[11px] px-2" onClick={addThreshold}>
                <Plus size={10} className="mr-0.5" />단계 추가
              </Button>
            </div>

            {thresholds.map((t, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-3.5 mb-2.5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-medium text-gray-700">단계 {idx + 1}</span>
                  {thresholds.length > 1 && (
                    <button onClick={() => removeThreshold(idx)} className="text-gray-400 hover:text-red-500">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                {/* Threshold value */}
                <div className="flex items-center gap-2 mb-2.5">
                  <label className="text-xs text-gray-500 w-16 flex-shrink-0">임계치</label>
                  <div className="relative flex-1">
                    <Input
                      type={isNumericMetric ? 'number' : 'text'}
                      value={t.threshold}
                      onChange={e => updateThreshold(idx, 'threshold', e.target.value)}
                      placeholder={getMetricPlaceholder(metric)}
                      className={`h-7 text-xs w-full ${unit ? 'pr-8' : ''}`}
                      min={isNumericMetric ? 0 : undefined}
                    />
                    {unit && (
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                        {unit}
                      </span>
                    )}
                  </div>
                </div>

                {/* Channels */}
                <div className="flex items-start gap-2 mb-2.5">
                  <label className="text-xs text-gray-500 w-16 flex-shrink-0 pt-1">채널</label>
                  <div className="flex flex-wrap gap-1.5">
                    {CHANNEL_OPTIONS.map(ch => (
                      <button
                        key={ch.id}
                        onClick={() => toggleChannel(idx, ch.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                          t.channels.includes(ch.id)
                            ? 'bg-[#534AB7] text-white border-[#534AB7]'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {ch.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Webhook URL */}
                {t.channels.includes('webhook') && (
                  <div className="flex items-center gap-2 mb-2.5">
                    <label className="text-xs text-gray-500 w-16 flex-shrink-0">웹훅 URL</label>
                    <Input
                      value={t.webhookUrl ?? ''}
                      onChange={e => updateThreshold(idx, 'webhookUrl', e.target.value)}
                      placeholder="https://hooks.example.com/..."
                      className="h-7 text-xs flex-1"
                    />
                  </div>
                )}

                {/* Action */}
                <div className="flex items-start gap-2">
                  <label className="text-xs text-gray-500 w-16 flex-shrink-0 pt-1">액션</label>
                  <div className="flex gap-1.5">
                    {ACTION_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => updateThreshold(idx, 'action', opt.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                          t.action === opt.id
                            ? opt.id === 'block'
                              ? 'bg-red-600 text-white border-red-600'
                              : opt.id === 'throttle'
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-[#534AB7] text-white border-[#534AB7]'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                        title={opt.desc}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
          {dryRunStatus && (
            <div className="mb-3 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {dryRunStatus}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDryRun}
              disabled={!hasValidThresholds}
              title="테스트 알림 발송 (시뮬레이션)"
            >
              테스트 발송
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>취소</Button>
            <Button size="sm" className="bg-[#534AB7] hover:bg-[#4339a0]" onClick={handleSave} disabled={!name.trim()}>
              저장
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertRuleEditorModal;
