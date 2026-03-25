import React, { useState } from 'react';
import { X, AlertTriangle } from '../../../icons';
import { Button } from '../../../ui/button';
import type { Tenant, TenantStatus, SuspendedDataPolicy } from '../data/platformAdminTypes';

interface StatusChangeModalProps {
  tenant: Tenant;
  presetStatus?: TenantStatus;
  onConfirm: (newStatus: TenantStatus, reason: string, policy?: SuspendedDataPolicy) => void;
  onClose: () => void;
}

const REASON_OPTIONS: Record<string, string[]> = {
  Suspended: ['계약 위반', '보안 위협', '악성 사용 감지', '결제 미납', '기타'],
  Inactive: ['계약 종료', '고객 요청', '시범 기간 만료', '기타'],
  Active: ['문제 해결 완료', '결제 완료', '기타'],
  Trial: ['플랜 변경', '기타'],
};

const STATUS_LABELS: Record<TenantStatus, string> = {
  Active: '정상 운영',
  Trial: '트라이얼',
  Suspended: '정지',
  Inactive: '비활성',
};

const DEFAULT_POLICY: SuspendedDataPolicy = {
  canViewDashboard: true,
  canExportData: true,
  canAccessApi: false,
  retentionDays: 90,
};

const StatusChangeModal: React.FC<StatusChangeModalProps> = ({ tenant, presetStatus, onConfirm, onClose }) => {
  const nextStatuses: TenantStatus[] = (['Active', 'Trial', 'Suspended', 'Inactive'] as TenantStatus[])
    .filter(s => s !== tenant.status);
  const [newStatus, setNewStatus] = useState<TenantStatus>(presetStatus && nextStatuses.includes(presetStatus) ? presetStatus : nextStatuses[0]);
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [policy, setPolicy] = useState<SuspendedDataPolicy>(
    tenant.suspendedDataPolicy ?? DEFAULT_POLICY
  );

  const isSuspend = newStatus === 'Suspended';
  const finalReason = reason === '기타' ? customReason : reason;
  const canConfirm = finalReason.trim().length > 0;

  const togglePolicy = (key: keyof Omit<SuspendedDataPolicy, 'retentionDays'>) => {
    setPolicy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirm = () => {
    onConfirm(newStatus, finalReason, isSuspend ? policy : undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">테넌트 상태 변경</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Tenant info */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-medium">
              {tenant.name[0]}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
              <div className="text-xs text-gray-500">현재: {STATUS_LABELS[tenant.status]}</div>
            </div>
          </div>

          {/* New status selector */}
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-2">변경할 상태<span className="text-red-500 ml-0.5">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {nextStatuses.map(s => (
                <button
                  key={s}
                  onClick={() => { setNewStatus(s); setReason(''); }}
                  className={`text-sm px-3 py-2 rounded-xl border-2 text-left transition-all ${
                    newStatus === s
                      ? s === 'Suspended' || s === 'Inactive'
                        ? 'border-red-400 bg-red-50 text-red-700'
                        : 'border-[#534AB7] bg-indigo-50 text-[#534AB7]'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-2">변경 사유<span className="text-red-500 ml-0.5">*</span></label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(REASON_OPTIONS[newStatus] ?? ['기타']).map(r => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                    reason === r
                      ? 'bg-[#534AB7] text-white border-[#534AB7]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            {reason === '기타' && (
              <textarea
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                placeholder="사유를 직접 입력하세요..."
                rows={2}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none"
              />
            )}
          </div>

          {/* Suspended policy */}
          {isSuspend && (
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-2">데이터 접근 범위</label>
              <div className="space-y-2">
                {([
                  { key: 'canViewDashboard' as const, label: '대시보드 읽기 전용 접근 허용' },
                  { key: 'canExportData' as const, label: 'CSV/API 데이터 내보내기 허용' },
                  { key: 'canAccessApi' as const, label: 'API 호출 허용' },
                ]).map(item => (
                  <div key={item.key} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-700">{item.label}</span>
                    <button
                      role="switch"
                      aria-checked={policy[item.key]}
                      aria-label={item.label}
                      onClick={() => togglePolicy(item.key)}
                      className={`relative w-8 h-4 rounded-full transition-colors ${policy[item.key] ? 'bg-[#534AB7]' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${policy[item.key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <AlertTriangle size={11} className="text-amber-500" />
                  데이터 보존 기간: <span className="font-medium text-gray-700">{policy.retentionDays}일</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>취소</Button>
          <Button
            size="sm"
            className={`${
              (newStatus === 'Suspended' || newStatus === 'Inactive')
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#534AB7] hover:bg-[#4339a0]'
            }`}
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            상태 변경 확인
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeModal;
