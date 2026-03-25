import React, { useState, useEffect } from 'react';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Copy, RefreshCw, Trash2, ChevronDown, Edit2, Check, X, Power, RotateCcw } from '../../../icons';
import StatusChangeModal from './StatusChangeModal';
import { ConfirmDialog } from '../../../ui/confirm-dialog';
import type { Tenant, TenantStatus, SuspendedDataPolicy, ResourceLimits } from '../data/platformAdminTypes';

interface TenantDetailPanelProps {
  tenant: Tenant;
  onUpdate?: (updated: Tenant) => void;
  onClose?: () => void;
}

type SubTab = 'info' | 'keys' | 'limits';

const STATUS_STYLE: Record<TenantStatus, string> = {
  Active: 'bg-green-100 text-green-700 border-green-200',
  Trial: 'bg-blue-100 text-blue-700 border-blue-200',
  Suspended: 'bg-red-100 text-red-700 border-red-200',
  Inactive: 'bg-gray-100 text-gray-500 border-gray-200',
};

const STATUS_LABELS: Record<TenantStatus, string> = {
  Active: '정상 운영', Trial: '트라이얼', Suspended: '정지', Inactive: '비활성',
};

const INDUSTRY_LABELS: Record<string, string> = {
  finance: '금융', manufacturing: '제조', healthcare: '헬스케어',
  retail: '유통', education: '교육', other: '기타',
};

// Inline-editable number field
const EditableField: React.FC<{
  label: string;
  value: number | string;
  originalValue?: number | string;
  unit?: string;
  min?: number;
  max?: number;
  onSave: (val: string) => void;
  onUndo?: () => void;
}> = ({ label, value, originalValue, unit, min, max, onSave, onUndo }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const hasChanged = originalValue !== undefined && String(value) !== String(originalValue);

  const validate = (val: string): string => {
    const num = Number(val);
    if (isNaN(num)) return '숫자를 입력해주세요';
    if (min !== undefined && num < min) return `최소값: ${min}`;
    if (max !== undefined && num > max) return `최대값: ${max}`;
    return '';
  };

  const handleSave = () => {
    const err = validate(draft);
    if (err) { setError(err); return; }
    setError('');
    onSave(draft);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };
  const handleCancel = () => {
    setDraft(String(value));
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-2 py-1.5 text-sm group">
      <span className="text-gray-500 min-w-[100px] flex-shrink-0">{label}</span>
      {editing ? (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={draft}
              onChange={e => { setDraft(e.target.value); setError(''); }}
              className={`h-6 text-xs w-28 py-0 ${error ? 'border-red-300' : ''}`}
              autoFocus
              min={min}
              max={max}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
            />
            {unit && <span className="text-xs text-gray-400">{unit}</span>}
            <button onClick={handleSave} className="text-green-600 hover:text-green-700"><Check size={12} /></button>
            <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>
          </div>
          {error && <span className="text-[10px] text-red-500 mt-0.5">{error}</span>}
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className="text-gray-900">{value}{unit ? ` ${unit}` : ''}</span>
          {saved && <span className="text-[10px] text-green-600 font-medium">저장됨</span>}
          {hasChanged && onUndo && (
            <button
              onClick={onUndo}
              className="flex items-center gap-0.5 text-[10px] text-amber-600 hover:text-amber-700 font-medium"
              title="원래 값으로 되돌리기"
            >
              <RotateCcw size={10} />되돌리기
            </button>
          )}
          <button
            onClick={() => { setDraft(String(value)); setEditing(true); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-gray-500"
          >
            <Edit2 size={11} />
          </button>
        </div>
      )}
    </div>
  );
};

const FieldRow: React.FC<{ label: string; value: string; muted?: boolean }> = ({ label, value, muted }) => (
  <div className="flex items-baseline gap-2 py-1.5 text-sm">
    <span className="text-gray-500 min-w-[90px] flex-shrink-0">{label}</span>
    <span className={muted ? 'text-gray-400' : 'text-gray-900'}>{value}</span>
  </div>
);

const TenantDetailPanel: React.FC<TenantDetailPanelProps> = ({ tenant: initialTenant, onUpdate, onClose }) => {
  const [subTab, setSubTab] = useState<SubTab>('info');
  const [tenant, setTenant] = useState<Tenant>(initialTenant);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalPreset, setStatusModalPreset] = useState<TenantStatus | undefined>();
  const [statusChangeMsg, setStatusChangeMsg] = useState('');
  const [revokeKeyId, setRevokeKeyId] = useState<string | null>(null);
  const [reissueKeyId, setReissueKeyId] = useState<string | null>(null);
  const [keyToastMsg, setKeyToastMsg] = useState('');
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScope, setNewKeyScope] = useState('all');
  const [newKeyExpiry, setNewKeyExpiry] = useState('');
  const [limits, setLimits] = useState<ResourceLimits>(initialTenant.resourceLimits);
  const [originalLimits] = useState<ResourceLimits>(initialTenant.resourceLimits);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Task 3: beforeunload warning when there are unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handler);
      return () => window.removeEventListener('beforeunload', handler);
    }
  }, [hasUnsavedChanges]);

  const tabs: { id: SubTab; label: string }[] = [
    { id: 'info', label: '기본 정보' },
    { id: 'keys', label: 'API 키' },
    { id: 'limits', label: '리소스 제한' },
  ];

  const handleStatusConfirm = (
    newStatus: TenantStatus,
    _reason: string,
    policy?: SuspendedDataPolicy
  ) => {
    const updated: Tenant = {
      ...tenant,
      status: newStatus,
      healthLevel: newStatus === 'Suspended' || newStatus === 'Inactive' ? 'warning' : tenant.healthLevel,
      suspendedDataPolicy: policy,
    };
    setTenant(updated);
    onUpdate?.(updated);
    setStatusModalOpen(false);
    setStatusModalPreset(undefined);
    setStatusChangeMsg(`상태가 ${STATUS_LABELS[newStatus]}(으)로 변경되었습니다.`);
    setTimeout(() => setStatusChangeMsg(''), 2500);
  };

  const updateLimit = (key: keyof ResourceLimits, raw: string) => {
    const parsed = isNaN(Number(raw)) ? raw : Number(raw);
    const updated = { ...limits, [key]: parsed };
    setLimits(updated);
    setHasUnsavedChanges(true);
    const updatedTenant = { ...tenant, resourceLimits: updated };
    setTenant(updatedTenant);
    onUpdate?.(updatedTenant);
  };

  const undoLimit = (key: keyof ResourceLimits) => {
    const updated = { ...limits, [key]: originalLimits[key] };
    setLimits(updated);
    const updatedTenant = { ...tenant, resourceLimits: updated };
    setTenant(updatedTenant);
    onUpdate?.(updatedTenant);
    // Check if all limits match originals after undo
    const allMatch = (Object.keys(originalLimits) as (keyof ResourceLimits)[]).every(
      k => updated[k] === originalLimits[k]
    );
    if (allMatch) setHasUnsavedChanges(false);
  };

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white mt-3 animate-fade-in-up">
      {/* Header: name + status dropdown */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
        <h3 className="text-base font-medium text-gray-900">
          {tenant.name}
          <span className="text-xs font-normal text-gray-500 ml-2">상세 정보</span>
        </h3>

        <div className="flex items-center gap-2">
          {statusChangeMsg && (
            <span className="text-xs text-green-600 font-medium animate-fade-in-up">{statusChangeMsg}</span>
          )}
          {/* Emergency stop — only for Active / Trial tenants */}
          {(tenant.status === 'Active' || tenant.status === 'Trial') && (
            <button
              onClick={() => { setStatusModalPreset('Suspended'); setStatusModalOpen(true); }}
              className="text-xs h-7 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1"
            >
              <Power size={12} />긴급 정지
            </button>
          )}
          {/* Status change dropdown */}
          <button
            onClick={() => { setStatusModalPreset(undefined); setStatusModalOpen(true); }}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all hover:opacity-80 ${STATUS_STYLE[tenant.status]}`}
          >
            {STATUS_LABELS[tenant.status]}
            <ChevronDown size={11} />
          </button>
          {onClose && (
            <button onClick={onClose} className="ml-1 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Suspended data policy badge */}
      {tenant.status === 'Suspended' && tenant.suspendedDataPolicy && (
        <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-gray-100">
          {[
            { key: 'canViewDashboard', label: '대시보드 접근' },
            { key: 'canExportData', label: '데이터 내보내기' },
            { key: 'canAccessApi', label: 'API 호출' },
          ].map(item => {
            const allowed = tenant.suspendedDataPolicy![item.key as keyof SuspendedDataPolicy];
            return (
              <span
                key={item.key}
                className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                  allowed
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-600 border-red-200'
                }`}
              >
                {item.label}: {allowed ? '허용' : '차단'}
              </span>
            );
          })}
          <span className="text-[11px] px-2 py-0.5 rounded-full border bg-gray-50 text-gray-600 border-gray-200 font-medium">
            보존 {tenant.suspendedDataPolicy.retentionDays}일
          </span>
        </div>
      )}

      {/* Sub-tab buttons */}
      <div className="flex gap-1 mb-4">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`text-xs px-3 py-1.5 rounded-md transition-all ${
              subTab === t.id
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Basic Info */}
      {subTab === 'info' && (
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          <div>
            <FieldRow label="도메인" value={tenant.domain} />
            {tenant.industry && (
              <FieldRow label="업종" value={INDUSTRY_LABELS[tenant.industry] ?? tenant.industry} />
            )}
            <FieldRow label="요금제" value={tenant.plan} />
            <FieldRow label="계약 기간" value={`${tenant.contractPeriod.start} ~ ${tenant.contractPeriod.end}`} />
          </div>
          <div>
            <FieldRow label="담당자" value={`${tenant.contact.name} (${tenant.contact.email})`} />
            <FieldRow label="연락처" value={tenant.contact.phone} />
            <FieldRow label="메모" value={tenant.memo || '—'} muted={!tenant.memo} />
          </div>
        </div>
      )}

      {/* API Keys */}
      {subTab === 'keys' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">발급된 API 키 목록</span>
            <Button size="sm" className="h-7 text-xs bg-[#534AB7] hover:bg-[#4339a0]" onClick={() => { setNewKeyName(''); setNewKeyScope('all'); setNewKeyExpiry(''); setIssueModalOpen(true); }}>+ 키 발급</Button>
          </div>
          {tenant.apiKeys.length === 0 && (
            <p className="text-xs text-gray-400 py-4 text-center">발급된 API 키가 없습니다.</p>
          )}
          {tenant.apiKeys.map(key => (
            <div key={key.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg mb-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{key.name}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  <span className="font-mono">{key.keyPrefix}</span>
                  {' · '}
                  {key.status === 'Revoked' ? `폐기: ${key.createdAt}` : `생성: ${key.createdAt}`}
                  {key.lastUsed && ` · 마지막: ${key.lastUsed}`}
                </div>
              </div>
              <Badge
                variant="outline"
                className={`rounded-full text-xs font-medium ${
                  key.status === 'Active'
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}
              >
                {key.status}
              </Badge>
              {key.status === 'Active' && (
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => {
                      navigator.clipboard.writeText(key.keyPrefix).then(() => {
                        setKeyToastMsg('API 키가 클립보드에 복사되었습니다.');
                        setTimeout(() => setKeyToastMsg(''), 2500);
                      });
                    }}
                  >
                    <Copy size={10} className="mr-0.5" />복사
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => setReissueKeyId(key.id)}
                  >
                    <RefreshCw size={10} className="mr-0.5" />재발급
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setRevokeKeyId(key.id)}
                  >
                    <Trash2 size={10} className="mr-0.5" />폐기
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resource Limits — inline editable */}
      {subTab === 'limits' && (
        <div>
          <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
            <Edit2 size={11} /> 값을 hover하면 편집 버튼이 나타납니다
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-100 rounded-lg p-3.5">
              <div className="text-sm font-medium text-gray-900 mb-2">요청 제한</div>
              <EditableField
                label="Rate limit"
                value={limits.rateLimitPerMin.toLocaleString()}
                originalValue={originalLimits.rateLimitPerMin.toLocaleString()}
                unit="req/min"
                min={1}
                max={100000}
                onSave={v => updateLimit('rateLimitPerMin', v.replace(/,/g, ''))}
                onUndo={() => undoLimit('rateLimitPerMin')}
              />
              <EditableField
                label="토큰 한도/월"
                value={limits.tokenLimitPerMonth}
                originalValue={originalLimits.tokenLimitPerMonth}
                onSave={v => updateLimit('tokenLimitPerMonth', v)}
                onUndo={() => undoLimit('tokenLimitPerMonth')}
              />
              <EditableField
                label="동시 세션"
                value={limits.maxConcurrentSessions}
                originalValue={originalLimits.maxConcurrentSessions}
                min={1}
                max={1000}
                onSave={v => updateLimit('maxConcurrentSessions', v)}
                onUndo={() => undoLimit('maxConcurrentSessions')}
              />
            </div>
            <div className="border border-gray-100 rounded-lg p-3.5">
              <div className="text-sm font-medium text-gray-900 mb-2">스토리지 & 사용자</div>
              <EditableField
                label="최대 사용자"
                value={limits.maxUsers}
                originalValue={originalLimits.maxUsers}
                unit="명"
                min={1}
                max={10000}
                onSave={v => updateLimit('maxUsers', v)}
                onUndo={() => undoLimit('maxUsers')}
              />
              <EditableField
                label="파일 스토리지"
                value={limits.fileStorageGb}
                originalValue={originalLimits.fileStorageGb}
                unit="GB"
                min={1}
                max={10000}
                onSave={v => updateLimit('fileStorageGb', v)}
                onUndo={() => undoLimit('fileStorageGb')}
              />
              <EditableField
                label="데이터 보존"
                value={limits.dataRetentionMonths}
                originalValue={originalLimits.dataRetentionMonths}
                unit="개월"
                min={1}
                max={120}
                onSave={v => updateLimit('dataRetentionMonths', v)}
                onUndo={() => undoLimit('dataRetentionMonths')}
              />
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {statusModalOpen && (
        <StatusChangeModal
          tenant={tenant}
          presetStatus={statusModalPreset}
          onConfirm={handleStatusConfirm}
          onClose={() => { setStatusModalOpen(false); setStatusModalPreset(undefined); }}
        />
      )}

      {/* API Key Revoke Confirm */}
      <ConfirmDialog
        open={revokeKeyId !== null}
        title="API 키 폐기"
        description={
          <>
            <span className="font-medium">
              {tenant.apiKeys.find(k => k.id === revokeKeyId)?.name}
            </span>
            {' '}키를 폐기하시겠습니까? 폐기된 키는 즉시 비활성화되며 복구할 수 없습니다.
          </>
        }
        confirmLabel="폐기"
        destructive
        onConfirm={() => {
          if (revokeKeyId) {
            const updated: Tenant = {
              ...tenant,
              apiKeys: tenant.apiKeys.map(k =>
                k.id === revokeKeyId ? { ...k, status: 'Revoked' as const } : k
              ),
            };
            setTenant(updated);
            onUpdate?.(updated);
          }
          setRevokeKeyId(null);
        }}
        onCancel={() => setRevokeKeyId(null)}
      />

      {/* API Key Reissue Confirm */}
      <ConfirmDialog
        open={reissueKeyId !== null}
        title="API 키 재발급"
        description={
          <>
            <span className="font-medium">
              {tenant.apiKeys.find(k => k.id === reissueKeyId)?.name}
            </span>
            {' '}키를 재발급하시겠습니까? 기존 키는 폐기되고 새 키가 발급됩니다.
          </>
        }
        confirmLabel="재발급"
        onConfirm={() => {
          if (reissueKeyId) {
            const newKeyPrefix = `sk-new-****-${Math.random().toString(36).slice(2, 6)}`;
            const updated: Tenant = {
              ...tenant,
              apiKeys: tenant.apiKeys.map(k =>
                k.id === reissueKeyId
                  ? { ...k, keyPrefix: newKeyPrefix, createdAt: new Date().toISOString().slice(0, 10), lastUsed: undefined }
                  : k
              ),
            };
            setTenant(updated);
            onUpdate?.(updated);
            setKeyToastMsg('API 키가 재발급되었습니다.');
            setTimeout(() => setKeyToastMsg(''), 2500);
          }
          setReissueKeyId(null);
        }}
        onCancel={() => setReissueKeyId(null)}
      />

      {/* API Key Issuance Modal */}
      {issueModalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setIssueModalOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="새 API 키 발급"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">새 API 키 발급</h3>
                <button onClick={() => setIssueModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="key-name" className="block text-xs font-medium text-gray-700 mb-1">키 이름</label>
                  <Input
                    id="key-name"
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    placeholder="예: Production API Key"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="key-scope" className="block text-xs font-medium text-gray-700 mb-1">스코프</label>
                  <select
                    id="key-scope"
                    value={newKeyScope}
                    onChange={e => setNewKeyScope(e.target.value)}
                    className="w-full h-9 text-sm border border-gray-200 rounded-md px-3 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  >
                    <option value="all">전체 (Read/Write)</option>
                    <option value="read">읽기 전용 (Read Only)</option>
                    <option value="agent">에이전트 전용 (Agent)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="key-expiry" className="block text-xs font-medium text-gray-700 mb-1">만료일</label>
                  <Input
                    id="key-expiry"
                    type="date"
                    value={newKeyExpiry}
                    onChange={e => setNewKeyExpiry(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    className="text-sm"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">비워두면 만료 없음</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" size="sm" onClick={() => setIssueModalOpen(false)} className="text-xs">취소</Button>
                <Button
                  size="sm"
                  className="text-xs bg-[#534AB7] hover:bg-[#4339a0]"
                  disabled={!newKeyName.trim()}
                  onClick={() => {
                    const newKey = {
                      id: `key-${Date.now()}`,
                      name: newKeyName.trim(),
                      keyPrefix: `sk-${Math.random().toString(36).slice(2, 10)}...`,
                      status: 'Active' as const,
                      createdAt: new Date().toISOString().slice(0, 10),
                      scope: newKeyScope,
                      expiresAt: newKeyExpiry || undefined,
                    };
                    const updated: Tenant = {
                      ...tenant,
                      apiKeys: [...tenant.apiKeys, newKey],
                    };
                    setTenant(updated);
                    onUpdate?.(updated);
                    setIssueModalOpen(false);
                    setKeyToastMsg('새 API 키가 발급되었습니다.');
                    setTimeout(() => setKeyToastMsg(''), 2500);
                  }}
                >
                  발급
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Key action toast */}
      {keyToastMsg && (
        <div role="alert" className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-green-600 text-white text-sm rounded-lg shadow-lg animate-fade-in-up">
          {keyToastMsg}
        </div>
      )}
    </div>
  );
};

export default TenantDetailPanel;
