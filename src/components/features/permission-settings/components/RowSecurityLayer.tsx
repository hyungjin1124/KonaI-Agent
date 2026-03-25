'use client';

import { useState, useMemo, useCallback } from 'react';
import { ChevronDown, Edit2, Plus, Search, Trash2 } from '../../../icons';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../ui/dialog';
import type { DomainRowFilterRule, DomainRole, RlsFilterBase } from '../../../../types';
import { DOMAIN_ROLES } from '../../../../types';
import { ROLE_LABEL_MAP } from '../data/viewTableData';
import { GROUPED_ROLES } from '../data/roleGroupUtils';
import { ConfirmDialog } from '../../../ui/confirm-dialog';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RLS_FILTER_BASE_OPTIONS: { value: RlsFilterBase; label: string }[] = [
  { value: 'dept_code',       label: '부서 (dept_code)' },
  { value: 'division_code',   label: '사업부 (division_code)' },
  { value: 'sales_dept_code', label: '영업부서 (sales_dept_code)' },
  { value: 'plant_code',      label: '공장 (plant_code)' },
  { value: 'plant_line_code', label: '공장+라인 (plant_line_code)' },
  { value: 'wh_code',         label: '창고 (wh_code)' },
  { value: 'project_code',    label: '프로젝트 (project_code)' },
  { value: 'user_id',         label: '사용자 (user_id)' },
  { value: 'none',            label: '필터 없음 (none)' },
];

// Auto-fill defaults for filterColumn and SQL pattern based on filterBase
const FILTER_BASE_DEFAULTS: Record<RlsFilterBase, { column: string; sql: string }> = {
  dept_code:       { column: 'dept_code',              sql: 'WHERE dept_code IN (SELECT dept FROM user_dept_map WHERE user_id = :current_user)' },
  division_code:   { column: 'division_code',          sql: 'WHERE division_code IN (SELECT div FROM user_div_map WHERE user_id = :current_user)' },
  sales_dept_code: { column: 'sales_dept',             sql: 'WHERE sales_dept IN (SELECT dept FROM user_dept_map WHERE user_id = :current_user)' },
  plant_code:      { column: 'plant_code',             sql: 'WHERE plant_code IN (SELECT plant FROM user_plant_map WHERE user_id = :current_user)' },
  plant_line_code: { column: 'plant_code, line_code',  sql: 'WHERE plant_code = :user_plant AND line_code = :user_line' },
  wh_code:         { column: 'wh_code',                sql: 'WHERE wh_code IN (SELECT wh FROM user_wh_map WHERE user_id = :current_user)' },
  project_code:    { column: 'project_code',           sql: 'WHERE project_code IN (SELECT pjt FROM user_pjt_map WHERE user_id = :current_user)' },
  user_id:         { column: 'created_by / assigned_to', sql: 'WHERE created_by = :current_user OR assigned_to = :current_user' },
  none:            { column: '(필터 없음)',              sql: '-- 필터 적용 안 함 → 전체 조직 데이터 조회 가능' },
};

const FILTER_BASE_STYLES: Record<RlsFilterBase, { bg: string; text: string; border: string; label: string }> = {
  dept_code:       { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   label: 'dept_code' },
  division_code:   { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'division_code' },
  sales_dept_code: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'sales_dept_code' },
  plant_code:      { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'plant_code' },
  plant_line_code: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'plant_line_code' },
  wh_code:         { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200',   label: 'wh_code' },
  project_code:    { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  label: 'project_code' },
  user_id:         { bg: 'bg-gray-100',  text: 'text-gray-700',   border: 'border-gray-300',   label: 'user_id' },
  none:            { bg: 'bg-gray-50',   text: 'text-gray-500',   border: 'border-gray-200',   label: 'none' },
};

// Grouped roles for optgroup

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

interface EditFormState {
  role: DomainRole | '';
  filterBase: RlsFilterBase | '';
  filterColumn: string;
  targetViewGroups: string;
  sqlWherePattern: string;
  example: string;
  note: string;
}

const EMPTY_FORM: EditFormState = {
  role: '',
  filterBase: '',
  filterColumn: '',
  targetViewGroups: '',
  sqlWherePattern: '',
  example: '',
  note: '',
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RowSecurityLayerProps {
  rules: DomainRowFilterRule[];
  onRulesChange: (rules: DomainRowFilterRule[]) => void;
  roleLabelMap: Record<DomainRole, string>;
}

// ---------------------------------------------------------------------------
// FilterBaseBadge
// ---------------------------------------------------------------------------

function FilterBaseBadge({ filterBase }: { filterBase: RlsFilterBase }) {
  const style = FILTER_BASE_STYLES[filterBase];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${style.bg} ${style.text} ${style.border}`}
    >
      {style.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// SqlPreview — collapsible SQL block
// ---------------------------------------------------------------------------

function SqlPreview({ pattern, label }: { pattern: string; label?: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        aria-expanded={expanded}
        aria-label={label ? `${label} SQL 조건 ${expanded ? '접기' : '보기'}` : undefined}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        <span className="font-medium">{expanded ? '접기' : 'SQL 조건 보기'}</span>
        <ChevronDown
          size={12}
          aria-hidden="true"
          className={`transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <pre className="mt-2 bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
          {pattern}
        </pre>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RuleCard — single RLS rule card with edit/delete buttons
// ---------------------------------------------------------------------------

interface RuleCardProps {
  rule: DomainRowFilterRule;
  roleLabelMap: Record<DomainRole, string>;
  onEdit: (rule: DomainRowFilterRule) => void;
  onDelete: (id: string) => void;
}

function RuleCard({ rule, roleLabelMap, onEdit, onDelete }: RuleCardProps) {
  const roleLabel = roleLabelMap[rule.role] ?? rule.role;

  return (
    <div className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
      {/* Card header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-gray-900 truncate">{roleLabel}</span>
          <FilterBaseBadge filterBase={rule.filterBase} />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(rule)}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1"
            title="편집"
            aria-label={`${roleLabel} 규칙 편집`}
          >
            <Edit2 size={13} aria-hidden="true" />
          </button>
          <button
            onClick={() => onDelete(rule.id)}
            className="text-gray-400 hover:text-red-600 transition-colors p-1"
            title="삭제"
            aria-label={`${roleLabel} 규칙 삭제`}
          >
            <Trash2 size={13} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Card body */}
      <dl className="space-y-1.5 text-xs">
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-gray-500 font-medium">필터 컬럼</dt>
          <dd className="text-gray-800 font-mono">{rule.filterColumn}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-gray-500 font-medium">적용 대상</dt>
          <dd className="text-gray-800">{rule.targetViewGroups}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-gray-500 font-medium">예시</dt>
          <dd className="text-gray-800">{rule.example}</dd>
        </div>
        {rule.note && (
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-gray-500 font-medium">비고</dt>
            <dd className="text-gray-600 italic">{rule.note}</dd>
          </div>
        )}
      </dl>

      {/* SQL collapsible */}
      <SqlPreview pattern={rule.sqlWherePattern} label={roleLabel} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export function RowSecurityLayer({ rules, onRulesChange, roleLabelMap }: RowSecurityLayerProps) {
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [editTarget, setEditTarget] = useState<EditFormState | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null); // null = create mode
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  }, []);

  // Filtered list
  const filtered = useMemo(() => {
    let result = rules;
    if (roleFilter !== 'ALL') {
      result = result.filter(r => r.role === roleFilter);
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(r =>
        (roleLabelMap[r.role] ?? r.role).toLowerCase().includes(q) ||
        r.filterBase.toLowerCase().includes(q) ||
        r.filterColumn.toLowerCase().includes(q) ||
        r.targetViewGroups.toLowerCase().includes(q),
      );
    }
    return result;
  }, [rules, roleFilter, searchText, roleLabelMap]);

  // Unique roles for filter
  const usedRoles = useMemo(
    () => [...new Set(rules.map(r => r.role))].sort(),
    [rules],
  );

  const openCreate = useCallback(() => {
    setEditTarget(structuredClone(EMPTY_FORM));
    setEditingId(null);
  }, []);

  const openEdit = useCallback((rule: DomainRowFilterRule) => {
    setEditTarget({
      role: rule.role,
      filterBase: rule.filterBase,
      filterColumn: rule.filterColumn,
      targetViewGroups: rule.targetViewGroups,
      sqlWherePattern: rule.sqlWherePattern,
      example: rule.example,
      note: rule.note ?? '',
    });
    setEditingId(rule.id);
  }, []);

  const closeDialog = useCallback(() => {
    setEditTarget(null);
    setEditingId(null);
  }, []);

  const updateField = useCallback(
    <K extends keyof EditFormState>(field: K, value: EditFormState[K]) => {
      setEditTarget(prev => {
        if (!prev) return prev;
        const next = { ...prev, [field]: value };

        // Auto-fill filterColumn and SQL when filterBase changes
        if (field === 'filterBase' && value) {
          const defaults = FILTER_BASE_DEFAULTS[value as RlsFilterBase];
          if (defaults) {
            // Only auto-fill if the current values are empty or match a previous auto-fill
            const prevDefaults = prev.filterBase ? FILTER_BASE_DEFAULTS[prev.filterBase as RlsFilterBase] : null;
            if (!prev.filterColumn || prev.filterColumn === prevDefaults?.column) {
              next.filterColumn = defaults.column;
            }
            if (!prev.sqlWherePattern || prev.sqlWherePattern === prevDefaults?.sql) {
              next.sqlWherePattern = defaults.sql;
            }
          }
        }

        return next;
      });
    },
    [],
  );

  const handleSave = useCallback(() => {
    if (!editTarget || !editTarget.role || !editTarget.filterBase) return;
    if (!(DOMAIN_ROLES as readonly string[]).includes(editTarget.role)) return;

    const built: DomainRowFilterRule = {
      id: editingId ?? `RLS-${String(Date.now()).slice(-4)}`,
      role: editTarget.role as DomainRole,
      filterBase: editTarget.filterBase as RlsFilterBase,
      filterColumn: editTarget.filterColumn,
      targetViewGroups: editTarget.targetViewGroups,
      sqlWherePattern: editTarget.sqlWherePattern,
      example: editTarget.example,
      ...(editTarget.note ? { note: editTarget.note } : {}),
    };

    if (editingId === null) {
      onRulesChange([...rules, built]);
      showToast('RLS 규칙이 추가되었습니다.');
    } else {
      onRulesChange(rules.map(r => (r.id === editingId ? built : r)));
      showToast('RLS 규칙이 수정되었습니다.');
    }
    closeDialog();
  }, [editTarget, editingId, rules, onRulesChange, closeDialog, showToast]);

  const handleDelete = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const isCreateMode = editingId === null;
  const isFormValid = !!editTarget?.role && !!editTarget?.filterBase;

  const deleteConfirmDescription = (() => {
    const rule = rules.find(r => r.id === deleteConfirmId);
    if (!rule) return '규칙을 삭제하시겠습니까?';
    const label = roleLabelMap[rule.role] ?? rule.role;
    return `"${label}" 규칙을 삭제하시겠습니까?`;
  })();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">행 보안 규칙 관리</h3>
          <p className="text-xs text-gray-500 mt-0.5">{rules.length}개 RLS 규칙</p>
        </div>
        <Button
          size="sm"
          className="bg-[#1A1A1A] hover:bg-black text-white gap-1"
          onClick={openCreate}
        >
          <Plus size={14} /> 규칙 추가
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="h-9 text-sm border border-gray-200 rounded-md px-3 bg-white"
        >
          <option value="ALL">전체 역할</option>
          {usedRoles.map(r => (
            <option key={r} value={r}>{roleLabelMap[r] ?? r}</option>
          ))}
        </select>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="역할, 필터 기준, 필터 컬럼, 적용 대상 검색"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="text-xs text-gray-400" aria-live="polite" aria-atomic="true">
        {filtered.length}건 표시 (전체 {rules.length}건)
      </div>

      {/* Card grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(rule => (
            <RuleCard
              key={rule.id}
              rule={rule}
              roleLabelMap={roleLabelMap}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-sm text-gray-400">
          {searchText || roleFilter !== 'ALL' ? '검색 결과가 없습니다.' : '등록된 RLS 규칙이 없습니다.'}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={open => { if (!open) closeDialog(); }}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{isCreateMode ? '새 RLS 규칙 추가' : 'RLS 규칙 편집'}</DialogTitle>
            <DialogDescription>
              {isCreateMode ? '역할에 적용할 행 수준 보안 규칙을 정의합니다.' : '기존 RLS 규칙을 수정합니다.'}
            </DialogDescription>
          </DialogHeader>

          {editTarget && (
            <div className="space-y-4 pt-2">
              {/* Row 1: 역할 (grouped), 필터 기준 (labeled) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500">역할</Label>
                  <select
                    value={editTarget.role}
                    onChange={e => updateField('role', e.target.value as DomainRole)}
                    autoFocus
                    className="w-full h-9 text-sm border border-gray-200 rounded-md px-2.5 bg-white"
                  >
                    <option value="">역할 선택</option>
                    {GROUPED_ROLES.map(group => (
                      <optgroup key={group.domain} label={group.label}>
                        {group.roles.map(r => (
                          <option key={r.code} value={r.code}>
                            {r.displayName}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500">필터 기준</Label>
                  <select
                    value={editTarget.filterBase}
                    onChange={e => updateField('filterBase', e.target.value as RlsFilterBase)}
                    className="w-full h-9 text-sm border border-gray-200 rounded-md px-2.5 bg-white"
                  >
                    <option value="">기준 선택</option>
                    {RLS_FILTER_BASE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: 필터 컬럼 (auto-filled), 적용 대상 뷰 그룹 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500">
                    필터 컬럼
                    {editTarget.filterBase && (
                      <span className="text-[10px] text-gray-400 font-normal ml-1">(자동 입력됨)</span>
                    )}
                  </Label>
                  <Input
                    value={editTarget.filterColumn}
                    onChange={e => updateField('filterColumn', e.target.value)}
                    placeholder="예: dept_code"
                    className="h-9 text-sm font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500">적용 대상 뷰 그룹</Label>
                  <Input
                    value={editTarget.targetViewGroups}
                    onChange={e => updateField('targetViewGroups', e.target.value)}
                    placeholder="예: AC 전표, 비용, 예산"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* Row 3: SQL WHERE 패턴 (auto-filled) */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500">
                  SQL WHERE 패턴
                  {editTarget.filterBase && (
                    <span className="text-[10px] text-gray-400 font-normal ml-1">(자동 입력됨, 수정 가능)</span>
                  )}
                </Label>
                <textarea
                  value={editTarget.sqlWherePattern}
                  onChange={e => updateField('sqlWherePattern', e.target.value)}
                  rows={3}
                  className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono"
                  placeholder="예: WHERE dept_code = :userDeptCode"
                />
              </div>

              {/* Row 4: 예시, 비고 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500">예시</Label>
                  <Input
                    value={editTarget.example}
                    onChange={e => updateField('example', e.target.value)}
                    placeholder="예: 재무팀(F100)만"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500">비고</Label>
                  <Input
                    value={editTarget.note}
                    onChange={e => updateField('note', e.target.value)}
                    placeholder="선택 사항"
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

      <ConfirmDialog
        open={!!deleteConfirmId}
        title="규칙 삭제"
        description={deleteConfirmDescription}
        confirmLabel="삭제"
        destructive
        onConfirm={() => {
          if (deleteConfirmId) {
            onRulesChange(rules.filter(r => r.id !== deleteConfirmId));
            showToast('RLS 규칙이 삭제되었습니다.');
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
