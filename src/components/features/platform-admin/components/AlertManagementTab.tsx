import React, { useState } from 'react';
import { Bell, Plus, Edit2, Trash2, AlertCircle, Activity } from '../../../icons';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { ConfirmDialog } from '../../../ui/confirm-dialog';
import AlertRuleCard from './AlertRuleCard';
import AlertHistoryItem from './AlertHistoryItem';
import AlertRuleEditorModal from './AlertRuleEditorModal';
import {
  MOCK_ENHANCED_ALERT_RULES,
  MOCK_ANOMALY_RULES,
  MOCK_ALERT_HISTORY_EXTENDED,
} from '../data/alertsData';
import type { AlertRule, AnomalyDetectionRule } from '../data/platformAdminTypes';

const sensitivityLabel = {
  low: { label: '낮음', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  medium: { label: '중간', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  high: { label: '높음', cls: 'bg-red-100 text-red-700 border-red-200' },
};

const metricTypeLabel: Record<string, string> = {
  cost_spike: '비용 급증',
  error_rate: '에러율 스파이크',
  latency: '레이턴시 이상',
  api_call: 'API 호출 폭증',
};

const AlertManagementTab: React.FC = () => {
  const [alertRules, setAlertRules] = useState<AlertRule[]>(MOCK_ENHANCED_ALERT_RULES);
  const [anomalyRules, setAnomalyRules] = useState<AnomalyDetectionRule[]>(MOCK_ANOMALY_RULES);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | undefined>(undefined);
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const handleToggleRule = (id: string) => {
    setAlertRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleToggleAnomaly = (id: string) => {
    setAnomalyRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleOpenEditor = (rule?: AlertRule) => {
    setEditingRule(rule);
    setEditorOpen(true);
  };

  const handleSaveRule = (updated: AlertRule) => {
    setAlertRules(prev => {
      const exists = prev.find(r => r.id === updated.id);
      return exists
        ? prev.map(r => r.id === updated.id ? updated : r)
        : [updated, ...prev];
    });
    setEditorOpen(false);
    setToastMsg('알림 규칙이 저장되었습니다.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div>
      {/* Data freshness */}
      <div className="flex justify-end mb-2">
        <span className="text-[11px] text-gray-400">마지막 업데이트: {new Date().toLocaleString('ko-KR')}</span>
      </div>

      {/* Alert Rules section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
            <Bell size={14} className="text-gray-600" /> 알림 규칙
            <span className="text-xs font-normal text-gray-400 ml-1">다단계 임계치 기반</span>
          </span>
          <Button
            size="sm"
            className="h-7 text-xs bg-[#534AB7] hover:bg-[#4339a0]"
            onClick={() => handleOpenEditor(undefined)}
          >
            <Plus size={12} className="mr-0.5" />규칙 추가
          </Button>
        </div>

        {alertRules.map(rule => (
          <div key={rule.id} className="relative group">
            <AlertRuleCard rule={rule} onToggle={handleToggleRule} onEdit={handleOpenEditor} />
            {/* Action buttons overlay */}
            <div className="absolute top-3 right-12 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleOpenEditor(rule)}
                className="text-gray-400 hover:text-gray-700 p-1"
                title="편집"
                aria-label={`${rule.name} 규칙 편집`}
              >
                <Edit2 size={13} />
              </button>
              <button
                onClick={() => setDeleteRuleId(rule.id)}
                className="text-gray-400 hover:text-red-600 p-1"
                title="삭제"
                aria-label={`${rule.name} 규칙 삭제`}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="h-px bg-gray-200 my-5" />

      {/* Anomaly Detection section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
            <Activity size={14} className="text-gray-600" /> 이상 감지 규칙
            <span className="text-xs font-normal text-gray-400 ml-1">베이스라인 대비 자동 탐지</span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {anomalyRules.map(rule => {
            const sens = sensitivityLabel[rule.sensitivity];
            return (
              <div
                key={rule.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <AlertCircle size={15} className={rule.enabled ? 'text-[#534AB7] mt-0.5' : 'text-gray-300 mt-0.5'} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        {metricTypeLabel[rule.metricType]}
                      </span>
                      <Badge variant="outline" className={`rounded-full text-xs ${sens.cls}`}>
                        감도: {sens.label}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        기준선 {rule.baselineWindowDays}일
                      </span>
                    </div>
                  </div>
                </div>
                {/* Toggle */}
                <button
                  role="switch"
                  aria-checked={rule.enabled}
                  aria-label={`${rule.name} 활성화 토글`}
                  onClick={() => handleToggleAnomaly(rule.id)}
                  className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 mt-0.5 ${
                    rule.enabled ? 'bg-[#534AB7]' : 'bg-gray-200'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                    rule.enabled ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-gray-200 my-5" />

      {/* Alert History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-900">최근 알림 이력</span>
          <Button variant="outline" size="sm" className="h-7 text-[11px]">전체 이력 →</Button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          {MOCK_ALERT_HISTORY_EXTENDED.map(item => (
            <AlertHistoryItem key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Editor Modal */}
      {editorOpen && (
        <AlertRuleEditorModal
          rule={editingRule}
          onSave={handleSaveRule}
          onClose={() => setEditorOpen(false)}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteRuleId}
        title="알림 규칙 삭제"
        description={`"${alertRules.find(r => r.id === deleteRuleId)?.name ?? ''}" 규칙을 삭제하시겠습니까?`}
        confirmLabel="삭제"
        destructive
        onConfirm={() => {
          if (deleteRuleId) {
            setAlertRules(prev => prev.filter(r => r.id !== deleteRuleId));
            setToastMsg('알림 규칙이 삭제되었습니다.');
            setTimeout(() => setToastMsg(''), 3000);
          }
          setDeleteRuleId(null);
        }}
        onCancel={() => setDeleteRuleId(null)}
      />

      {/* Toast */}
      {toastMsg && (
        <div role="alert" className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-green-600 text-white text-sm rounded-lg shadow-lg animate-fade-in-up">
          {toastMsg}
        </div>
      )}
    </div>
  );
};

export default AlertManagementTab;
