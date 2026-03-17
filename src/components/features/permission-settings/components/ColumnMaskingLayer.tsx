import { useState, useMemo, useCallback } from 'react';
import { Edit2, Plus, Search, Trash2 } from '../../../icons';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../ui/dialog';
import type { DomainColumnMaskPolicy, DomainRole, SensitiveColumnCategory } from '../../../../types';
import { DOMAIN_ROLES } from '../../../../types';
import { SENSITIVE_CATEGORY_LABELS } from '../permissionSettingsData';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ColumnMaskingLayerProps {
  policies: DomainColumnMaskPolicy[];
  onPoliciesChange: (policies: DomainColumnMaskPolicy[]) => void;
  roleLabelMap: Record<string, string>;
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
// Edit form state
// ---------------------------------------------------------------------------

interface EditFormState {
  category: SensitiveColumnCategory;
  maskingRule: string;
  targetViews: string;
  exposedRoles: DomainRole[];
  maskedRoles: string;
  resultExample: string;
}

const EMPTY_FORM: EditFormState = {
  category: 'salary_bonus',
  maskingRule: '',
  targetViews: '',
  exposedRoles: [],
  maskedRoles: '',
  resultExample: '',
};

// ---------------------------------------------------------------------------
// PolicyCard
// ---------------------------------------------------------------------------

interface PolicyCardProps {
  policy: DomainColumnMaskPolicy;
  roleLabelMap: Record<string, string>;
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
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(policy.id)}
            className="text-gray-400 hover:text-red-600 transition-colors p-1"
            title="삭제"
          >
            <Trash2 size={13} />
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
  const [editTarget, setEditTarget] = useState<EditFormState | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  // Filtered list
  const filtered = useMemo(() => {
    if (!searchText.trim()) return policies;
    const q = searchText.toLowerCase();
    return policies.filter(
      p =>
        SENSITIVE_CATEGORY_LABELS[p.category].toLowerCase().includes(q) ||
        p.maskingRule.toLowerCase().includes(q) ||
        p.targetViews.toLowerCase().includes(q),
    );
  }, [policies, searchText]);

  const openCreate = useCallback(() => {
    setEditTarget({ ...EMPTY_FORM });
    setEditingId(null);
    setIsCreateMode(true);
  }, []);

  const openEdit = useCallback((policy: DomainColumnMaskPolicy) => {
    setEditTarget({
      category: policy.category,
      maskingRule: policy.maskingRule,
      targetViews: policy.targetViews,
      exposedRoles: [...policy.exposedRoles],
      maskedRoles: policy.maskedRoles,
      resultExample: policy.resultExample,
    });
    setEditingId(policy.id);
    setIsCreateMode(false);
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
    setEditTarget(prev => (prev ? { ...prev, category } : prev));
  }, []);

  const handleSave = useCallback(() => {
    if (!editTarget || !editTarget.category || !editTarget.maskingRule.trim()) return;

    const policy: DomainColumnMaskPolicy = {
      id: isCreateMode ? `MASK-${String(Date.now()).slice(-4)}` : (editingId ?? `MASK-${String(Date.now()).slice(-4)}`),
      category: editTarget.category,
      categoryName: SENSITIVE_CATEGORY_LABELS[editTarget.category],
      targetViews: editTarget.targetViews,
      maskingRule: editTarget.maskingRule,
      exposedRoles: editTarget.exposedRoles,
      maskedRoles: editTarget.maskedRoles,
      resultExample: editTarget.resultExample,
    };

    if (isCreateMode) {
      onPoliciesChange([...policies, policy]);
    } else {
      onPoliciesChange(policies.map(p => (p.id === editingId ? policy : p)));
    }

    closeDialog();
  }, [editTarget, isCreateMode, editingId, policies, onPoliciesChange, closeDialog]);

  const handleDelete = useCallback(
    (id: string) => {
      const policy = policies.find(p => p.id === id);
      if (!policy) return;
      if (!confirm(`"${SENSITIVE_CATEGORY_LABELS[policy.category]}" 정책을 삭제하시겠습니까?`)) return;
      onPoliciesChange(policies.filter(p => p.id !== id));
    },
    [policies, onPoliciesChange],
  );

  const isFormValid = editTarget
    ? !!editTarget.category && !!editTarget.maskingRule.trim()
    : false;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-gray-900">컬럼 마스킹 정책</h4>
          <p className="text-xs text-gray-500 mt-0.5">
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

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="카테고리, 마스킹 규칙, 대상 뷰 검색"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Card Grid */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-sm">
          {searchText ? '검색 결과가 없습니다.' : '설정된 컬럼 마스킹 정책이 없습니다.'}
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
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{isCreateMode ? '새 마스킹 정책 추가' : '마스킹 정책 편집'}</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-4 pt-2">
              {/* Row 1: 카테고리 + 마스킹 규칙 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">카테고리</Label>
                  <select
                    value={editTarget.category}
                    onChange={e => handleCategoryChange(e.target.value as SensitiveColumnCategory)}
                    className="w-full h-9 text-sm border border-gray-200 rounded-md px-3 bg-white"
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">마스킹 규칙</Label>
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
                <Label className="text-xs font-bold text-gray-500 uppercase">대상 뷰</Label>
                <Input
                  value={editTarget.targetViews}
                  onChange={e => updateField('targetViews', e.target.value)}
                  placeholder="예: view_pr_pay_result, view_payroll_monthly"
                  className="h-9 text-sm"
                />
              </div>

              {/* Row 3: 전체 노출 역할 */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500 uppercase">전체 노출 역할</Label>
                <div className="border border-gray-200 rounded-md p-2 max-h-32 overflow-y-auto">
                  <div className="flex flex-wrap gap-1.5">
                    {DOMAIN_ROLES.map(role => {
                      const isSelected = editTarget.exposedRoles.includes(role);
                      return (
                        <label
                          key={role}
                          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border cursor-pointer select-none transition-colors ${
                            isSelected
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleExposedRole(role)}
                            className="sr-only"
                          />
                          {roleLabelMap[role] ?? role}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Row 4: 마스킹 적용 역할 설명 + 결과 예시 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">마스킹 적용 역할 설명</Label>
                  <Input
                    value={editTarget.maskedRoles}
                    onChange={e => updateField('maskedRoles', e.target.value)}
                    placeholder="예: 기타 전체"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">결과 예시</Label>
                  <Input
                    value={editTarget.resultExample}
                    onChange={e => updateField('resultExample', e.target.value)}
                    placeholder="예: 900101-*******"
                    className="h-9 text-sm"
                  />
                </div>
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
    </div>
  );
}
