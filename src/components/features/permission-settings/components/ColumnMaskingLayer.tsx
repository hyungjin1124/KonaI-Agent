'use client';

import { useState, useMemo, useCallback } from 'react';
import { Edit2, Plus, Search, Trash2 } from '../../../icons';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../ui/dialog';
import { ConfirmDialog } from '../../../ui/confirm-dialog';
import type { DomainColumnMaskPolicy, DomainRole, SensitiveColumnCategory } from '../../../../types';
import { SENSITIVE_CATEGORY_LABELS, getMaskingExample } from '../permissionSettingsData';
import { GROUPED_ROLES } from '../data/roleGroupUtils';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ColumnMaskingLayerProps {
  policies: DomainColumnMaskPolicy[];
  onPoliciesChange: (policies: DomainColumnMaskPolicy[]) => void;
  roleLabelMap: Record<DomainRole, string>;
}

// ---------------------------------------------------------------------------
// Sensitivity mapping
// ---------------------------------------------------------------------------

type SensitivityLevel = '매우높음' | '높음' | '중간';

const CATEGORY_SENSITIVITY: Record<SensitiveColumnCategory, SensitivityLevel> = {
  salary_bonus:   '매우높음',
  ssn:            '매우높음',
  employee_pii:   '매우높음',
  bank_account:   '높음',
  unit_cost:      '높음',
  vendor_contact: '중간',
};

const SENSITIVITY_BADGE: Record<SensitivityLevel, { label: string; className: string }> = {
  '매우높음': { label: '매우높음', className: 'bg-red-100 text-red-700 border border-red-200' },
  '높음':     { label: '높음',     className: 'bg-orange-100 text-orange-700 border border-orange-200' },
  '중간':     { label: '중간',     className: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
};

const CARD_BORDER: Record<SensitivityLevel, string> = {
  '매우높음': 'border-l-red-500',
  '높음':     'border-l-orange-400',
  '중간':     'border-l-yellow-400',
};

// ---------------------------------------------------------------------------
// Category options
// ---------------------------------------------------------------------------

const CATEGORY_OPTIONS: { value: SensitiveColumnCategory; label: string }[] = [
  { value: 'salary_bonus',   label: '급여/상여 금액' },
  { value: 'ssn',            label: '주민등록번호' },
  { value: 'bank_account',   label: '계좌번호' },
  { value: 'unit_cost',      label: '단가/원가' },
  { value: 'vendor_contact', label: '거래처 연락처' },
  { value: 'employee_pii',   label: '사원 개인정보' },
];

// ---------------------------------------------------------------------------
// Auto-derive maskedRoles description
// ---------------------------------------------------------------------------

function deriveMaskedRolesText(exposedRoles: DomainRole[], roleLabelMap: Record<DomainRole, string>): string {
  if (exposedRoles.length === 0) return '전체 역할';
  const exposedLabels = exposedRoles.map(r => roleLabelMap[r] ?? r).join(', ');
  return `${exposedLabels} 외 전체`;
}

// ---------------------------------------------------------------------------
// Edit form state
// ---------------------------------------------------------------------------

interface EditFormState {
  category: SensitiveColumnCategory;
  maskingRule: string;
  targetViews: string;
  exposedRoles: DomainRole[];
  resultExample: string;
}

const EMPTY_FORM: EditFormState = {
  category: 'salary_bonus',
  maskingRule: '',
  targetViews: '',
  exposedRoles: [],
  resultExample: '',
};

// ---------------------------------------------------------------------------
// PolicyCard
// ---------------------------------------------------------------------------

interface PolicyCardProps {
  policy: DomainColumnMaskPolicy;
  roleLabelMap: Record<DomainRole, string>;
  onEdit: (policy: DomainColumnMaskPolicy) => void;
  onDelete: (id: string) => void;
}

function PolicyCard({ policy, roleLabelMap, onEdit, onDelete }: PolicyCardProps) {
  const sensitivity = CATEGORY_SENSITIVITY[policy.category];
  const badge = SENSITIVITY_BADGE[sensitivity];
  const borderColor = CARD_BORDER[sensitivity];

  return (
    <div
      className={`border border-gray-200 rounded-lg p-4 shadow-sm bg-white border-l-4 ${borderColor} flex flex-col gap-3`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-gray-900 leading-tight truncate">
            {SENSITIVE_CATEGORY_LABELS[policy.category]}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap flex-shrink-0 ${badge.className}`}
          >
            민감도 {badge.label}
          </span>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={() => onEdit(policy)}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1"
            title="편집"
            aria-label={`${SENSITIVE_CATEGORY_LABELS[policy.category]} 정책 편집`}
          >
            <Edit2 size={13} aria-hidden="true" />
          </button>
          <button
            onClick={() => onDelete(policy.id)}
            className="text-gray-400 hover:text-red-600 transition-colors p-1"
            title="삭제"
            aria-label={`${SENSITIVE_CATEGORY_LABELS[policy.category]} 정책 삭제`}
          >
            <Trash2 size={13} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Body rows */}
      <dl className="flex flex-col gap-2 text-sm">
        {/* 마스킹 규칙 */}
        <div className="flex flex-col gap-0.5">
          <dt className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            마스킹 규칙
          </dt>
          <dd className="text-gray-800">{policy.maskingRule}</dd>
        </div>

        {/* 대상 뷰 */}
        <div className="flex flex-col gap-0.5">
          <dt className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            대상 뷰
          </dt>
          <dd className="font-mono text-xs text-gray-600 leading-relaxed break-all">
            {policy.targetViews}
          </dd>
        </div>

        {/* 전체 노출 역할 */}
        <div className="flex flex-col gap-1">
          <dt className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            전체 노출 역할
          </dt>
          <dd className="flex flex-wrap gap-1">
            {policy.exposedRoles.length > 0 ? (
              policy.exposedRoles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[11px] font-medium text-green-700"
                >
                  {roleLabelMap[role] ?? role}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-gray-400">없음</span>
            )}
          </dd>
        </div>

        {/* 마스킹 적용 */}
        <div className="flex flex-col gap-0.5">
          <dt className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            마스킹 적용
          </dt>
          <dd className="text-gray-700 text-xs">{policy.maskedRoles}</dd>
        </div>

        {/* 결과 예시 */}
        <div className="flex flex-col gap-0.5">
          <dt className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            결과 예시
          </dt>
          <dd>
            <span className="inline-block rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700 border border-gray-200">
              {policy.resultExample}
            </span>
          </dd>
        </div>
      </dl>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ColumnMaskingLayer
// ---------------------------------------------------------------------------

export function ColumnMaskingLayer({ policies, onPoliciesChange, roleLabelMap }: ColumnMaskingLayerProps) {
  const [searchText, setSearchText] = useState('');
  const [sensitivityFilter, setSensitivityFilter] = useState<SensitivityLevel | 'ALL'>('ALL');
  const [editTarget, setEditTarget] = useState<EditFormState | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const isCreateMode = editingId === null;

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  }, []);

  // Filtered list
  const filtered = useMemo(() => {
    let result = policies;

    if (sensitivityFilter !== 'ALL') {
      result = result.filter(p => CATEGORY_SENSITIVITY[p.category] === sensitivityFilter);
    }

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(
        p =>
          SENSITIVE_CATEGORY_LABELS[p.category].toLowerCase().includes(q) ||
          p.maskingRule.toLowerCase().includes(q) ||
          p.targetViews.toLowerCase().includes(q),
      );
    }
    return result;
  }, [policies, sensitivityFilter, searchText]);

  const openCreate = useCallback(() => {
    setEditTarget({ ...EMPTY_FORM });
    setEditingId(null);
  }, []);

  const openEdit = useCallback((policy: DomainColumnMaskPolicy) => {
    setEditTarget({
      category: policy.category,
      maskingRule: policy.maskingRule,
      targetViews: policy.targetViews,
      exposedRoles: [...policy.exposedRoles],
      resultExample: policy.resultExample,
    });
    setEditingId(policy.id);
  }, []);

  const closeDialog = useCallback(() => {
    setEditTarget(null);
    setEditingId(null);
  }, []);

  const updateField = useCallback(
    <K extends keyof EditFormState>(field: K, value: EditFormState[K]) => {
      setEditTarget(prev => (prev ? { ...prev, [field]: value } : prev));
    },
    [],
  );

  const toggleExposedRole = useCallback((role: DomainRole) => {
    setEditTarget(prev => {
      if (!prev) return prev;
      const already = prev.exposedRoles.includes(role);
      return {
        ...prev,
        exposedRoles: already
          ? prev.exposedRoles.filter(r => r !== role)
          : [...prev.exposedRoles, role],
      };
    });
  }, []);

  const handleCategoryChange = useCallback((category: SensitiveColumnCategory) => {
    setEditTarget(prev => {
      if (!prev) return prev;
      // Auto-suggest result example from MASKING_EXAMPLES
      const suggestedExample = getMaskingExample(category, 'partial');
      return {
        ...prev,
        category,
        // Only auto-fill if empty or matches a previous suggestion
        resultExample: prev.resultExample || suggestedExample,
      };
    });
  }, []);

  const handleSave = useCallback(() => {
    if (!editTarget || !editTarget.category || !editTarget.maskingRule.trim()) return;

    const maskedRoles = deriveMaskedRolesText(editTarget.exposedRoles, roleLabelMap);

    const policy: DomainColumnMaskPolicy = {
      id: isCreateMode ? `MASK-${crypto.randomUUID()}` : (editingId ?? `MASK-${crypto.randomUUID()}`),
      category: editTarget.category,
      categoryName: SENSITIVE_CATEGORY_LABELS[editTarget.category],
      targetViews: editTarget.targetViews,
      maskingRule: editTarget.maskingRule,
      exposedRoles: editTarget.exposedRoles,
      maskedRoles,
      resultExample: editTarget.resultExample,
    };

    if (isCreateMode) {
      onPoliciesChange([...policies, policy]);
      showToast('마스킹 정책이 추가되었습니다.');
    } else {
      onPoliciesChange(policies.map(p => (p.id === editingId ? policy : p)));
      showToast('마스킹 정책이 수정되었습니다.');
    }

    closeDialog();
  }, [editTarget, editingId, policies, onPoliciesChange, roleLabelMap, closeDialog, showToast]);

  const handleDelete = useCallback(
    (id: string) => {
      const policy = policies.find(p => p.id === id);
      if (!policy) return;
      setDeleteConfirmId(id);
    },
    [policies],
  );

  const isFormValid = editTarget
    ? !!editTarget.category && !!editTarget.maskingRule.trim()
    : false;

  // Auto-derived maskedRoles preview in dialog
  const maskedRolesPreview = editTarget
    ? deriveMaskedRolesText(editTarget.exposedRoles, roleLabelMap)
    : '';

  // Auto-suggested result example
  const suggestedExample = editTarget
    ? getMaskingExample(editTarget.category, 'partial')
    : '';

  const deleteConfirmDescription = (() => {
    const policy = policies.find(p => p.id === deleteConfirmId);
    if (!policy) return '정책을 삭제하시겠습니까?';
    return `"${SENSITIVE_CATEGORY_LABELS[policy.category]}" 정책을 삭제하시겠습니까?`;
  })();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">컬럼 마스킹 정책</h3>
          <p className="text-xs text-gray-500 mt-0.5" aria-live="polite" aria-atomic="true">
            {policies.length}개 정책
          </p>
        </div>
        <Button
          size="sm"
          className="bg-[#1A1A1A] hover:bg-black text-white gap-1"
          onClick={openCreate}
        >
          <Plus size={14} /> 정책 추가
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={sensitivityFilter}
          onChange={e => setSensitivityFilter(e.target.value as SensitivityLevel | 'ALL')}
          className="h-9 text-sm border border-gray-200 rounded-md px-3 bg-white"
        >
          <option value="ALL">전체 민감도</option>
          <option value="매우높음">매우높음</option>
          <option value="높음">높음</option>
          <option value="중간">중간</option>
        </select>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="카테고리, 마스킹 규칙, 대상 뷰 검색"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="text-xs text-gray-400">
        {filtered.length}건 표시 (전체 {policies.length}건)
      </div>

      {/* Card Grid */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-sm">
          {searchText || sensitivityFilter !== 'ALL' ? '검색 결과가 없습니다.' : '설정된 컬럼 마스킹 정책이 없습니다.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(policy => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              roleLabelMap={roleLabelMap}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={open => { if (!open) closeDialog(); }}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{isCreateMode ? '새 마스킹 정책 추가' : '마스킹 정책 편집'}</DialogTitle>
            <DialogDescription>
              {isCreateMode ? '민감 컬럼 카테고리에 대한 마스킹 정책을 정의합니다.' : '기존 마스킹 정책을 수정합니다.'}
            </DialogDescription>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
              {/* Row 1: 카테고리 + 마스킹 규칙 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500">카테고리</Label>
                  <select
                    value={editTarget.category}
                    onChange={e => handleCategoryChange(e.target.value as SensitiveColumnCategory)}
                    autoFocus
                    className="w-full h-9 text-sm border border-gray-200 rounded-md px-2.5 bg-white"
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {editTarget.category && (
                    <p className="text-[10px] text-gray-400 mt-0.5 pl-1">
                      민감도: {CATEGORY_SENSITIVITY[editTarget.category]}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500">마스킹 규칙</Label>
                  <Input
                    value={editTarget.maskingRule}
                    onChange={e => updateField('maskingRule', e.target.value)}
                    placeholder="예: 뒷자리 마스킹"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* Row 2: 대상 뷰 */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500">대상 뷰</Label>
                <Input
                  value={editTarget.targetViews}
                  onChange={e => updateField('targetViews', e.target.value)}
                  placeholder="예: view_pr_pay_result, view_payroll_monthly"
                  className="h-9 text-sm font-mono"
                />
              </div>

              {/* Row 3: 전체 노출 역할 — domain grouped */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500">전체 노출 역할</Label>
                <div className="border border-gray-200 rounded-md p-2.5 max-h-40 overflow-y-auto">
                  {GROUPED_ROLES.map(group => (
                    <div key={group.domain} className="mb-2 last:mb-0">
                      <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">{group.label}</div>
                      <div className="flex flex-wrap gap-1">
                        {group.roles.map(r => {
                          const isSelected = editTarget.exposedRoles.includes(r.code as DomainRole);
                          return (
                            <label
                              key={r.code}
                              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border cursor-pointer select-none transition-colors ${
                                isSelected
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleExposedRole(r.code as DomainRole)}
                                className="sr-only"
                              />
                              {r.displayName}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 4: 마스킹 적용 역할 (auto-derived, read-only) */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500">
                  마스킹 적용 역할 <span className="text-[10px] text-gray-400 font-normal">(자동 생성)</span>
                </Label>
                <div className="h-9 text-sm border border-gray-100 rounded-md px-2.5 bg-gray-50 flex items-center text-gray-600">
                  {maskedRolesPreview || '노출 역할을 선택하면 자동 설정됩니다'}
                </div>
              </div>

              {/* Row 5: 결과 예시 (with auto-suggestion) */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500">
                  결과 예시
                  {suggestedExample && !editTarget.resultExample && (
                    <button
                      type="button"
                      onClick={() => updateField('resultExample', suggestedExample)}
                      className="text-[10px] text-blue-500 hover:text-blue-700 font-normal ml-2"
                    >
                      자동 채우기: {suggestedExample}
                    </button>
                  )}
                </Label>
                <Input
                  value={editTarget.resultExample}
                  onChange={e => updateField('resultExample', e.target.value)}
                  placeholder={suggestedExample || '예: 900101-*******'}
                  className="h-9 text-sm font-mono"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" size="sm" onClick={closeDialog}>
                  취소
                </Button>
                <Button
                  size="sm"
                  className="bg-[#1A1A1A] hover:bg-black text-white"
                  onClick={handleSave}
                  disabled={!isFormValid}
                >
                  {isCreateMode ? '추가' : '저장'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!deleteConfirmId}
        title="정책 삭제"
        description={deleteConfirmDescription}
        confirmLabel="삭제"
        destructive
        onConfirm={() => {
          if (deleteConfirmId) {
            onPoliciesChange(policies.filter(p => p.id !== deleteConfirmId));
            showToast('마스킹 정책이 삭제되었습니다.');
          }
          setDeleteConfirmId(null);
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-green-600 text-white text-sm rounded-lg shadow-lg animate-fade-in-up">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
