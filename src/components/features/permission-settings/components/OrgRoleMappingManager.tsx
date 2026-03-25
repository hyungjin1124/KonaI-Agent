'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { ChevronDown, Edit2, Plus, Search, Trash2 } from '../../../icons';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { ConfirmDialog } from '../../../ui/confirm-dialog';
import type { OrgRoleMapping, DomainRole, PositionLevel, DataScopeType } from '../../../../types';
import { DOMAIN_ROLES } from '../../../../types';
import {
  ORG_TREE,
} from '../../user-management/data/userManagementData';
import { GROUPED_ROLES } from '../data/roleGroupUtils';
import { DATA_SCOPE_OPTIONS } from '../permissionSettingsData';
import { DomainRoleBadge } from '../../user-management/components/DomainRoleBadge';
import type { HierarchicalOrgNode } from '../../../../types';

const POSITION_LEVELS: PositionLevel[] = ['실무자', '관리자', '임원'];

// Common position titles extracted from existing mappings
const POSITION_TITLE_SUGGESTIONS = [
  '대표이사', 'CFO/부문장', '부문장', '실장', '부서장', '팀장',
  '그룹장', '팀원', '담당', '담당자', '개발자', '관리자', 'PM', 'QA', '인턴',
];

function renderGroupedRoleOptions() {
  return (
    <>
      <option value="">선택</option>
      {GROUPED_ROLES.map(group => (
        <optgroup key={group.domain} label={group.label}>
          {group.roles.map(r => (
            <option key={r.code} value={r.code}>
              {r.displayName}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );
}

// ============================================================================
// RLS filter auto-derivation
// ============================================================================

const ALL_ACCESS_ROLES = new Set<string>([
  'ROLE_SYS_ADMIN', 'ROLE_FIN_ADMIN', 'ROLE_EXEC', 'ROLE_HR_ADMIN',
]);

function deriveRlsFilter(
  primaryRole: string,
  dataScope: string,
  subOrg: string,
  division: string,
): string {
  if (!primaryRole || !dataScope) return '';
  if (ALL_ACCESS_ROLES.has(primaryRole)) return '필터 없음';
  if (dataScope === 'All') return '필터 없음';
  if (dataScope === 'Self') return 'user=본인';
  if (dataScope === 'Department' && subOrg) return `dept=${subOrg}`;
  if (dataScope === 'Division' && division) return `div=${division}`;
  if (dataScope === 'Plant' || dataScope === 'Plant+Line') return `plant=${subOrg || '(공장)'}`;
  if (dataScope === 'Warehouse') return `wh=${subOrg || '(창고)'}`;
  if (dataScope === 'Project') return 'project=담당';
  return '';
}

// ============================================================================
// Data scope display string builder
// ============================================================================

function buildDataScopeDisplay(scope: DataScopeType, subOrg: string, division: string): string {
  switch (scope) {
    case 'All': return 'All (전체)';
    case 'Division': return division ? `Div (${division})` : 'Div';
    case 'Department': return subOrg ? `Dept (${subOrg})` : 'Dept';
    case 'Plant': return subOrg ? `Plant (${subOrg})` : 'Plant';
    case 'Plant+Line': return subOrg ? `Plant+Line (${subOrg})` : 'Plant+Line';
    case 'Warehouse': return subOrg ? `WH (${subOrg})` : 'WH';
    case 'Project': return 'Project (담당)';
    case 'Self': return 'Self (본인)';
    default: return scope;
  }
}

// ============================================================================
// Parse existing dataAccessScope string to DataScopeType
// ============================================================================

function parseDataScopeType(raw: string): DataScopeType {
  const lower = raw.toLowerCase();
  if (lower.startsWith('all')) return 'All';
  if (lower.startsWith('div')) return 'Division';
  if (lower.startsWith('dept') || lower.startsWith('department')) return 'Department';
  if (lower.startsWith('plant+line') || lower.startsWith('plantline')) return 'Plant+Line';
  if (lower.startsWith('plant')) return 'Plant';
  if (lower.startsWith('wh') || lower.startsWith('warehouse')) return 'Warehouse';
  if (lower.startsWith('pjt') || lower.startsWith('project')) return 'Project';
  if (lower.startsWith('self')) return 'Self';
  return 'All';
}

// ============================================================================
// Sub-components
// ============================================================================

interface Props {
  mappings: OrgRoleMapping[];
  onMappingsChange: (mappings: OrgRoleMapping[]) => void;
  roleLabelMap: Record<DomainRole, string>;
  allRoles: DomainRole[];
  onNavigateToTab?: (tabValue: string) => void;
}


// ============================================================================
// Form state
// ============================================================================

interface EditFormState {
  id: string;
  category: string;
  division: string;
  subOrg: string;
  positionTitle: string;
  positionLevel: string;
  primaryRole: string;
  additionalRole: string;
  dataScopeType: DataScopeType;
  dataAccessScope: string;
  accessModules: string;
  rlsFilter: string;
  note: string;
}

const EMPTY_FORM: EditFormState = {
  id: '',
  category: '',
  division: '',
  subOrg: '',
  positionTitle: '',
  positionLevel: '실무자',
  primaryRole: '',
  additionalRole: '',
  dataScopeType: 'All',
  dataAccessScope: '',
  accessModules: '',
  rlsFilter: '',
  note: '',
};

// ============================================================================
// Section header
// ============================================================================

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="pb-1.5 mb-3 border-b border-gray-100">
      <h4 className="text-xs font-bold text-gray-700">{title}</h4>
      {description && <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>}
    </div>
  );
}

// ============================================================================
// Main component
// ============================================================================

export function OrgRoleMappingManager({ mappings, onMappingsChange, roleLabelMap, allRoles, onNavigateToTab }: Props) {
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [positionLevelFilter, setPositionLevelFilter] = useState('ALL');
  const [searchText, setSearchText] = useState('');
  const [editTarget, setEditTarget] = useState<EditFormState | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [autoSectionOpen, setAutoSectionOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(
    () => [...new Set(mappings.map(m => m.category))].sort(),
    [mappings],
  );

  // ORG_TREE cascade helpers
  const divisionNames = useMemo(() => ORG_TREE.map(d => d.name), []);

  const sectionsForCategory = useMemo(() => {
    if (!editTarget?.category) return [];
    const div = ORG_TREE.find(d => d.name === editTarget.category);
    return div?.children ?? [];
  }, [editTarget?.category]);

  const unitsForDivision = useMemo(() => {
    if (!editTarget?.division) return [];
    const section = sectionsForCategory.find((s: HierarchicalOrgNode) => s.name === editTarget!.division);
    return section?.children ?? [];
  }, [editTarget?.division, sectionsForCategory]);

  // Filtered list
  const filtered = useMemo(() => {
    let result = mappings;
    if (categoryFilter !== 'ALL') {
      result = result.filter(m => m.category === categoryFilter);
    }
    if (roleFilter !== 'ALL') {
      result = result.filter(
        m => m.primaryRole === roleFilter || m.additionalRole === roleFilter,
      );
    }
    if (positionLevelFilter !== 'ALL') {
      result = result.filter(m => m.positionLevel === positionLevelFilter);
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(
        m =>
          m.division.toLowerCase().includes(q) ||
          m.subOrg.toLowerCase().includes(q) ||
          m.positionTitle.toLowerCase().includes(q) ||
          m.dataAccessScope.toLowerCase().includes(q),
      );
    }
    return result;
  }, [mappings, categoryFilter, roleFilter, positionLevelFilter, searchText]);

  const openCreate = useCallback(() => {
    setEditTarget({ ...EMPTY_FORM, id: `orm-${Date.now()}` });
    setIsCreateMode(true);
    setAutoSectionOpen(false);
  }, []);

  const openEdit = useCallback((m: OrgRoleMapping) => {
    const scopeType = parseDataScopeType(m.dataAccessScope);
    setEditTarget({
      id: m.id,
      category: m.category,
      division: m.division,
      subOrg: m.subOrg,
      positionTitle: m.positionTitle,
      positionLevel: m.positionLevel,
      primaryRole: m.primaryRole,
      additionalRole: m.additionalRole ?? '',
      dataScopeType: scopeType,
      dataAccessScope: m.dataAccessScope,
      accessModules: Array.isArray(m.accessModules) ? m.accessModules.join(', ') : m.accessModules,
      rlsFilter: m.rlsFilter,
      note: m.note ?? '',
    });
    setIsCreateMode(false);
    setAutoSectionOpen(false);
  }, []);

  const handleSave = useCallback(() => {
    if (!editTarget || !editTarget.category.trim() || !editTarget.primaryRole) return;
    if (!(DOMAIN_ROLES as readonly string[]).includes(editTarget.primaryRole)) return;
    if (editTarget.additionalRole && !(DOMAIN_ROLES as readonly string[]).includes(editTarget.additionalRole)) return;

    const updated: OrgRoleMapping = {
      id: editTarget.id,
      category: editTarget.category,
      division: editTarget.division,
      subOrg: editTarget.subOrg,
      positionTitle: editTarget.positionTitle,
      positionLevel: editTarget.positionLevel as PositionLevel,
      primaryRole: editTarget.primaryRole as DomainRole,
      additionalRole: editTarget.additionalRole ? editTarget.additionalRole as DomainRole : undefined,
      dataAccessScope: editTarget.dataAccessScope,
      accessModules: editTarget.accessModules,
      rlsFilter: editTarget.rlsFilter,
      ...(editTarget.note ? { note: editTarget.note } : {}),
    };

    if (isCreateMode) {
      onMappingsChange([...mappings, updated]);
    } else {
      onMappingsChange(
        mappings.map(m => (m.id === updated.id ? updated : m)),
      );
    }
    setEditTarget(null);
  }, [editTarget, isCreateMode, mappings, onMappingsChange]);

  const handleDelete = useCallback(
    (id: string) => {
      const m = mappings.find(x => x.id === id);
      if (!m) return;
      setDeleteConfirmId(id);
    },
    [mappings],
  );

  const updateField = useCallback(
    <K extends keyof EditFormState>(field: K, value: EditFormState[K]) => {
      setEditTarget(prev => {
        if (!prev) return prev;
        const next = { ...prev, [field]: value };

        // Cascade reset: category → division → subOrg
        if (field === 'category') {
          next.division = '';
          next.subOrg = '';
        }
        if (field === 'division') {
          next.subOrg = '';
        }

        // Auto-derive dataAccessScope display and rlsFilter
        const scopeType = field === 'dataScopeType' ? (value as DataScopeType) : next.dataScopeType;
        const subOrg = field === 'subOrg' ? (value as string) : next.subOrg;
        const division = field === 'division' ? (value as string) : next.division;
        const role = field === 'primaryRole' ? (value as string) : next.primaryRole;

        if (field === 'dataScopeType' || field === 'subOrg' || field === 'division') {
          next.dataAccessScope = buildDataScopeDisplay(scopeType, subOrg, division);
        }
        if (field === 'dataScopeType' || field === 'subOrg' || field === 'division' || field === 'primaryRole') {
          next.rlsFilter = deriveRlsFilter(role, scopeType, subOrg, division);
        }

        return next;
      });
    },
    [],
  );

  const deleteConfirmDescription = (() => {
    const m = mappings.find(x => x.id === deleteConfirmId);
    if (!m) return '매핑을 삭제하시겠습니까?';
    return `"${m.division} / ${m.subOrg} / ${m.positionTitle}" 매핑을 삭제하시겠습니까? 이 조건에 해당하는 사용자의 역할 자동 할당이 변경됩니다.`;
  })();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">조직-역할 매핑 관리</h3>
          <p className="text-xs text-gray-500 mt-0.5" aria-live="polite" aria-atomic="true">
            {mappings.length}개 매핑 · {categories.length}개 카테고리
          </p>
        </div>
        <Button
          size="sm"
          className="bg-[#1A1A1A] hover:bg-black text-white gap-1"
          onClick={openCreate}
        >
          <Plus size={14} /> 매핑 추가
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="h-9 text-sm border border-gray-200 rounded-md px-3 bg-white"
        >
          <option value="ALL">전체 카테고리</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="h-9 text-sm border border-gray-200 rounded-md px-3 bg-white"
        >
          <option value="ALL">전체 역할</option>
          {allRoles.map(role => (
            <option key={role} value={role}>{roleLabelMap[role] ?? role}</option>
          ))}
        </select>
        <select
          value={positionLevelFilter}
          onChange={e => setPositionLevelFilter(e.target.value)}
          className="h-9 text-sm border border-gray-200 rounded-md px-3 bg-white"
        >
          <option value="ALL">전체 직급</option>
          {POSITION_LEVELS.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="부서, 조직, 직위 검색"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="text-xs text-gray-400">
        {filtered.length}건 표시 (전체 {mappings.length}건)
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th scope="col" className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 whitespace-nowrap">카테고리</th>
              <th scope="col" className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 whitespace-nowrap">부서</th>
              <th scope="col" className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 whitespace-nowrap">하위조직</th>
              <th scope="col" className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 whitespace-nowrap">직위</th>
              <th scope="col" className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 whitespace-nowrap">직급</th>
              <th scope="col" className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 whitespace-nowrap">주역할</th>
              <th scope="col" className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 whitespace-nowrap">추가역할</th>
              <th scope="col" className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 whitespace-nowrap">데이터범위</th>
              <th scope="col" className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 whitespace-nowrap">비고</th>
              <th scope="col" className="text-right py-2.5 px-3 text-xs font-bold text-gray-500 whitespace-nowrap">액션</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-2 px-3">
                  <span className="text-[10px] bg-gray-100 text-gray-600 rounded px-1.5 py-0.5 font-medium whitespace-nowrap">
                    {m.category}
                  </span>
                </td>
                <td className="py-2 px-3 text-xs text-gray-900 whitespace-nowrap">{m.division}</td>
                <td className="py-2 px-3 text-xs text-gray-600 whitespace-nowrap">{m.subOrg}</td>
                <td className="py-2 px-3 text-xs text-gray-600 whitespace-nowrap">{m.positionTitle}</td>
                <td className="py-2 px-3">
                  <span className={`text-[10px] rounded px-1.5 py-0.5 font-bold whitespace-nowrap ${
                    m.positionLevel === '임원' ? 'bg-purple-50 text-purple-600' :
                    m.positionLevel === '관리자' ? 'bg-blue-50 text-blue-600' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {m.positionLevel}
                  </span>
                </td>
                <td className="py-2 px-3">
                  <DomainRoleBadge
                    role={m.primaryRole}
                    label={roleLabelMap[m.primaryRole] ?? m.primaryRole}
                  />
                </td>
                <td className="py-2 px-3">
                  {m.additionalRole ? (
                    <DomainRoleBadge
                      role={m.additionalRole}
                      label={roleLabelMap[m.additionalRole] ?? m.additionalRole}
                    />
                  ) : (
                    <span className="text-[10px] text-gray-300">—</span>
                  )}
                </td>
                <td className="py-2 px-3 text-xs text-gray-500 whitespace-nowrap max-w-[160px] truncate" title={m.dataAccessScope}>
                  {m.dataAccessScope}
                </td>
                <td className="py-2 px-3 text-xs text-gray-400 max-w-[120px] truncate" title={m.note ?? ''}>
                  {m.note || '—'}
                </td>
                <td className="py-2 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(m)}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                      title="편집"
                      aria-label={`${m.division} / ${m.subOrg} 매핑 편집`}
                    >
                      <Edit2 size={13} aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      title="삭제"
                      aria-label={`${m.division} / ${m.subOrg} 매핑 삭제`}
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="py-8 text-center text-sm text-gray-400">
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit/Create Dialog — expanded to 600px, 3 sections */}
      <Dialog open={!!editTarget} onOpenChange={open => { if (!open) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isCreateMode ? '새 매핑 추가' : '매핑 편집'}</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-5 pt-2 max-h-[70vh] overflow-y-auto pr-1">
              {/* ── Section 1: 조직 & 직급 ── */}
              <div>
                <SectionHeader
                  title="조직 & 직급"
                  description="ORG_TREE 기반 3단계 조직 선택"
                />
                {/* Cascade dropdowns: category → division → subOrg */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500">사업부</Label>
                    <select
                      value={editTarget.category}
                      onChange={e => updateField('category', e.target.value)}
                      autoFocus
                      className="w-full h-9 text-sm border border-gray-200 rounded-md px-2.5 bg-white"
                    >
                      <option value="">선택</option>
                      {divisionNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500">부문</Label>
                    <select
                      value={editTarget.division}
                      onChange={e => updateField('division', e.target.value)}
                      disabled={!editTarget.category}
                      className="w-full h-9 text-sm border border-gray-200 rounded-md px-2.5 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">
                        {editTarget.category ? '선택' : '사업부를 먼저 선택'}
                      </option>
                      {sectionsForCategory.map((s: HierarchicalOrgNode) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500">팀/실</Label>
                    <select
                      value={editTarget.subOrg}
                      onChange={e => updateField('subOrg', e.target.value)}
                      disabled={!editTarget.division}
                      className="w-full h-9 text-sm border border-gray-200 rounded-md px-2.5 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">
                        {editTarget.division ? '선택' : '부문을 먼저 선택'}
                      </option>
                      {unitsForDivision.map((u: HierarchicalOrgNode) => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Position title + level */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500">직위</Label>
                    <Input
                      value={editTarget.positionTitle}
                      onChange={e => updateField('positionTitle', e.target.value)}
                      placeholder="팀장"
                      className="h-9 text-sm"
                      list="position-title-list"
                    />
                    <datalist id="position-title-list">
                      {POSITION_TITLE_SUGGESTIONS.map(t => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500">직급</Label>
                    <select
                      value={editTarget.positionLevel}
                      onChange={e => updateField('positionLevel', e.target.value)}
                      className="w-full h-9 text-sm border border-gray-200 rounded-md px-2.5 bg-white"
                    >
                      {POSITION_LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Section 2: 역할 & 권한 ── */}
              <div>
                <SectionHeader
                  title="역할 & 권한"
                  description="도메인별 역할 선택 및 데이터 접근 범위 설정"
                />
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500">주역할</Label>
                    <select
                      value={editTarget.primaryRole}
                      onChange={e => updateField('primaryRole', e.target.value)}
                      className="w-full h-9 text-sm border border-gray-200 rounded-md px-2.5 bg-white"
                    >
                      {renderGroupedRoleOptions()}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500">추가역할 <span className="text-gray-400 font-normal">(선택)</span></Label>
                    <select
                      value={editTarget.additionalRole}
                      onChange={e => updateField('additionalRole', e.target.value)}
                      className="w-full h-9 text-sm border border-gray-200 rounded-md px-2.5 bg-white"
                    >
                      <option value="">없음</option>
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
                    <Label className="text-xs font-bold text-gray-500">데이터 범위 <span className="text-[10px] text-gray-400 font-normal" title="이 역할이 접근할 수 있는 데이터의 조직 범위를 설정합니다. (예: 전체, 사업부, 부서, 본인)">(?)</span></Label>
                    <select
                      value={editTarget.dataScopeType}
                      onChange={e => updateField('dataScopeType', e.target.value as DataScopeType)}
                      className="w-full h-9 text-sm border border-gray-200 rounded-md px-2.5 bg-white"
                    >
                      {DATA_SCOPE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {editTarget.dataAccessScope && (
                      <p className="text-[10px] text-gray-400 mt-0.5 pl-1">
                        {editTarget.dataAccessScope}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Section 3: 자동 설정 (Collapsible) ── */}
              <div>
                <button
                  type="button"
                  onClick={() => setAutoSectionOpen(prev => !prev)}
                  aria-expanded={autoSectionOpen}
                  className="flex items-center gap-1.5 pb-1.5 mb-2 border-b border-gray-100 w-full text-left group"
                >
                  <ChevronDown
                    size={12}
                    className={`text-gray-400 transition-transform ${autoSectionOpen ? '' : '-rotate-90'}`}
                  />
                  <h4 className="text-xs font-bold text-gray-700">자동 설정 & 비고</h4>
                  <span className="text-[10px] text-gray-400 ml-auto">
                    {autoSectionOpen ? '접기' : '펼치기'}
                  </span>
                </button>

                {autoSectionOpen && (
                  <div className="space-y-3">
                    {/* RLS Filter — read-only, auto-derived */}
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-gray-500">
                        RLS 필터 <span className="text-[10px] text-gray-400 font-normal" title="Row-Level Security: 행 단위 보안 필터로, 사용자가 조회할 수 있는 데이터 행을 제한합니다.">(?) 자동 생성</span>
                      </Label>
                      <div className="h-9 text-sm border border-gray-100 rounded-md px-2.5 bg-gray-50 flex items-center text-gray-600">
                        {editTarget.rlsFilter || <span className="text-gray-400">역할과 조직을 선택하면 자동 설정됩니다</span>}
                      </div>
                    </div>

                    {/* Access Modules — read-only info */}
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-gray-500">
                        접근 모듈 <span className="text-[10px] text-gray-400 font-normal">(읽기 전용)</span>
                      </Label>
                      {editTarget.accessModules ? (
                        <div className="h-9 text-sm border border-gray-100 rounded-md px-2.5 bg-gray-50 flex items-center text-gray-600 truncate" title={editTarget.accessModules}>
                          {editTarget.accessModules}
                        </div>
                      ) : (
                        <div className="text-[10px] text-gray-400 bg-blue-50/50 border border-blue-100 rounded-md px-2.5 py-2">
                          접근 모듈은 &apos;테이블 접근 매트릭스&apos; 탭에서 역할별로 설정됩니다.
                          {onNavigateToTab && (
                            <button
                              type="button"
                              onClick={() => onNavigateToTab('table-access-matrix')}
                              className="ml-1 text-blue-600 hover:text-blue-800 underline underline-offset-2"
                            >
                              이동 →
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Note */}
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
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                <Button variant="outline" size="sm" onClick={() => setEditTarget(null)}>
                  취소
                </Button>
                <Button
                  size="sm"
                  className="bg-[#1A1A1A] hover:bg-black text-white"
                  onClick={handleSave}
                  disabled={!editTarget.category.trim() || !editTarget.primaryRole}
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
        title="매핑 삭제"
        description={deleteConfirmDescription}
        confirmLabel="삭제"
        destructive
        onConfirm={() => {
          if (deleteConfirmId) onMappingsChange(mappings.filter(x => x.id !== deleteConfirmId));
          setDeleteConfirmId(null);
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
