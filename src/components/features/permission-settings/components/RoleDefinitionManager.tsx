'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Edit2, Plus, Search, Shield, Trash2 } from '../../../icons';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Badge } from '../../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { ConfirmDialog } from '../../../ui/confirm-dialog';
import type { RoleDefinition, DomainRole, OrgRoleMapping } from '../../../../types';
import {
  DOMAIN_ROLE_DEFINITIONS,
  ROLE_DOMAIN_LABELS,
} from '../../user-management/data/userManagementData';
import { DATA_SCOPE_OPTIONS } from '../permissionSettingsData';

// ============================================================================
// Constants
// ============================================================================

const SCOPE_LABEL_MAP: Record<string, string> = Object.fromEntries(
  DATA_SCOPE_OPTIONS.map(o => [o.value, o.label]),
);

// Domain order for display
const DOMAIN_ORDER = ['exec', 'fin', 'hr', 'sales', 'pjt', 'prod', 'scm', 'sys'];

// Build role → domain lookup from DOMAIN_ROLE_DEFINITIONS
const ROLE_DOMAIN_MAP: Record<string, string> = Object.fromEntries(
  DOMAIN_ROLE_DEFINITIONS.map(r => [r.code, r.domain]),
);

function getDomainForRole(role: string): string {
  return ROLE_DOMAIN_MAP[role] ?? 'etc';
}

function getDomainLabel(domain: string): string {
  return ROLE_DOMAIN_LABELS[domain] ?? domain;
}

// ============================================================================
// Sub-components
// ============================================================================

interface Props {
  roleDefinitions: RoleDefinition[];
  onRoleDefinitionsChange: (roles: RoleDefinition[]) => void;
  orgRoleMappings?: OrgRoleMapping[];
  onRoleDeleted?: (deletedRole: DomainRole) => void;
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role.includes('ADMIN') || role === 'ROLE_EXEC';
  const isMgr = role.includes('MGR');
  const style = isAdmin
    ? 'text-purple-600 bg-purple-50 border-purple-100'
    : isMgr
      ? 'text-blue-600 bg-blue-50 border-blue-100'
      : 'text-gray-600 bg-gray-50 border-gray-100';
  return (
    <Badge variant="outline" className={`font-medium text-[10px] ${style}`}>
      {isAdmin && <Shield size={9} className="mr-0.5" />}
      {role.replace('ROLE_', '')}
    </Badge>
  );
}

function DomainBadge({ domain }: { domain: string }) {
  const colorMap: Record<string, string> = {
    exec: 'bg-purple-50 text-purple-600',
    fin: 'bg-emerald-50 text-emerald-600',
    hr: 'bg-pink-50 text-pink-600',
    sales: 'bg-blue-50 text-blue-600',
    pjt: 'bg-indigo-50 text-indigo-600',
    prod: 'bg-orange-50 text-orange-600',
    scm: 'bg-lime-50 text-lime-600',
    sys: 'bg-red-50 text-red-600',
  };
  return (
    <span className={`text-[10px] rounded px-1.5 py-0.5 font-medium whitespace-nowrap ${colorMap[domain] ?? 'bg-gray-50 text-gray-500'}`}>
      {getDomainLabel(domain)}
    </span>
  );
}

// ============================================================================
// Form state
// ============================================================================

interface EditFormState {
  role: string;
  roleSuffix: string; // suffix after ROLE_ for creation
  nameKo: string;
  nameEn: string;
  description: string;
  dataScope: string;
  note: string;
}

const EMPTY_FORM: EditFormState = {
  role: '',
  roleSuffix: '',
  nameKo: '',
  nameEn: '',
  description: '',
  dataScope: 'Department',
  note: '',
};

// ============================================================================
// Main component
// ============================================================================

export function RoleDefinitionManager({ roleDefinitions, onRoleDefinitionsChange, orgRoleMappings = [], onRoleDeleted }: Props) {
  const [searchText, setSearchText] = useState('');
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [editTarget, setEditTarget] = useState<EditFormState | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');
  const [deleteConfirmRole, setDeleteConfirmRole] = useState<DomainRole | null>(null);

  // Build reference count per role from org-role mappings
  const roleRefCount = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of orgRoleMappings) {
      counts[m.primaryRole] = (counts[m.primaryRole] ?? 0) + 1;
      if (m.additionalRole) {
        counts[m.additionalRole] = (counts[m.additionalRole] ?? 0) + 1;
      }
    }
    return counts;
  }, [orgRoleMappings]);

  // Available domains from data
  const availableDomains = useMemo(() => {
    const domains = new Set(roleDefinitions.map(r => getDomainForRole(r.role)));
    return DOMAIN_ORDER.filter(d => domains.has(d));
  }, [roleDefinitions]);

  // Filtered list
  const filtered = useMemo(() => {
    let result = roleDefinitions;

    if (domainFilter !== 'ALL') {
      result = result.filter(r => getDomainForRole(r.role) === domainFilter);
    }

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(
        r =>
          r.role.toLowerCase().includes(q) ||
          r.nameKo.includes(q) ||
          r.nameEn.toLowerCase().includes(q) ||
          r.description.includes(q),
      );
    }
    return result;
  }, [roleDefinitions, domainFilter, searchText]);

  const openCreate = useCallback(() => {
    setEditTarget({ ...EMPTY_FORM });
    setIsCreateMode(true);
    setDuplicateError('');
  }, []);

  const openEdit = useCallback((rd: RoleDefinition) => {
    setEditTarget({
      role: rd.role,
      roleSuffix: rd.role.replace(/^ROLE_/, ''),
      nameKo: rd.nameKo,
      nameEn: rd.nameEn,
      description: rd.description,
      dataScope: rd.dataScope,
      note: rd.note ?? '',
    });
    setIsCreateMode(false);
    setDuplicateError('');
  }, []);

  const handleSave = useCallback(() => {
    if (!editTarget || !editTarget.nameKo.trim()) return;

    const roleCode = isCreateMode
      ? `ROLE_${editTarget.roleSuffix.toUpperCase().replace(/\s+/g, '_')}`
      : editTarget.role;

    if (!roleCode || roleCode === 'ROLE_') return;

    // Duplicate check for create
    if (isCreateMode && roleDefinitions.some(r => r.role === roleCode)) {
      setDuplicateError(`"${roleCode}" 코드가 이미 존재합니다.`);
      return;
    }

    const updated: RoleDefinition = {
      role: roleCode as DomainRole,
      nameKo: editTarget.nameKo,
      nameEn: editTarget.nameEn,
      description: editTarget.description,
      dataScope: editTarget.dataScope as RoleDefinition['dataScope'],
      ...(editTarget.note ? { note: editTarget.note } : {}),
    };

    if (isCreateMode) {
      onRoleDefinitionsChange([...roleDefinitions, updated]);
    } else {
      onRoleDefinitionsChange(
        roleDefinitions.map(r => (r.role === updated.role ? updated : r)),
      );
    }
    setEditTarget(null);
    setDuplicateError('');
  }, [editTarget, isCreateMode, roleDefinitions, onRoleDefinitionsChange]);

  const handleDelete = useCallback(
    (role: DomainRole) => {
      const rd = roleDefinitions.find(r => r.role === role);
      if (!rd) return;
      setDeleteConfirmRole(role);
    },
    [roleDefinitions],
  );

  const updateField = useCallback(
    <K extends keyof EditFormState>(field: K, value: EditFormState[K]) => {
      setEditTarget(prev => (prev ? { ...prev, [field]: value } : prev));
      if (field === 'roleSuffix') setDuplicateError('');
    },
    [],
  );

  const deleteConfirmDescription = (() => {
    if (!deleteConfirmRole) return '역할을 삭제하시겠습니까?';
    const rd = roleDefinitions.find(r => r.role === deleteConfirmRole);
    const refCount = roleRefCount[deleteConfirmRole] ?? 0;
    const base = rd ? `"${rd.nameKo}" (${deleteConfirmRole}) 역할을 삭제하시겠습니까?` : '역할을 삭제하시겠습니까?';
    return refCount > 0
      ? `${base} 이 역할은 조직-역할 매핑에서 ${refCount}건 참조되고 있어 삭제 시 해당 매핑의 참조가 깨질 수 있습니다.`
      : base;
  })();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">역할 정의 관리</h3>
          <p className="text-xs text-gray-500 mt-0.5" aria-live="polite" aria-atomic="true">
            {roleDefinitions.length}개 역할 · {availableDomains.length}개 도메인
          </p>
        </div>
        <Button
          size="sm"
          className="bg-[#1A1A1A] hover:bg-black text-white gap-1"
          onClick={openCreate}
        >
          <Plus size={14} /> 역할 추가
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={domainFilter}
          onChange={e => setDomainFilter(e.target.value)}
          className="h-9 text-sm border border-gray-200 rounded-md px-3 bg-white"
        >
          <option value="ALL">전체 도메인</option>
          {availableDomains.map(d => (
            <option key={d} value={d}>{getDomainLabel(d)}</option>
          ))}
        </select>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="역할 검색 (코드, 이름, 설명)"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="text-xs text-gray-400">
        {filtered.length}건 표시 (전체 {roleDefinitions.length}건)
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th scope="col" className="text-left py-2.5 px-3 text-xs font-bold text-gray-500">도메인</th>
              <th scope="col" className="text-left py-2.5 px-3 text-xs font-bold text-gray-500">역할 코드</th>
              <th scope="col" className="text-left py-2.5 px-3 text-xs font-bold text-gray-500">한국어명</th>
              <th scope="col" className="text-left py-2.5 px-3 text-xs font-bold text-gray-500">영문명</th>
              <th scope="col" className="text-left py-2.5 px-3 text-xs font-bold text-gray-500">설명</th>
              <th scope="col" className="text-left py-2.5 px-3 text-xs font-bold text-gray-500">데이터 범위</th>
              <th scope="col" className="text-left py-2.5 px-3 text-xs font-bold text-gray-500">참조</th>
              <th scope="col" className="text-left py-2.5 px-3 text-xs font-bold text-gray-500">비고</th>
              <th scope="col" className="text-right py-2.5 px-3 text-xs font-bold text-gray-500">액션</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(rd => {
              const domain = getDomainForRole(rd.role);
              const refCount = roleRefCount[rd.role] ?? 0;
              return (
                <tr key={rd.role} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-2 px-3">
                    <DomainBadge domain={domain} />
                  </td>
                  <td className="py-2 px-3">
                    <RoleBadge role={rd.role} />
                  </td>
                  <td className="py-2 px-3 text-xs font-medium text-gray-900">{rd.nameKo}</td>
                  <td className="py-2 px-3 text-xs text-gray-500">{rd.nameEn}</td>
                  <td className="py-2 px-3 text-xs text-gray-500 max-w-[240px] truncate" title={rd.description}>
                    {rd.description}
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-[10px] bg-gray-100 text-gray-600 rounded px-1.5 py-0.5 font-medium whitespace-nowrap">
                      {SCOPE_LABEL_MAP[rd.dataScope] ?? rd.dataScope}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    {refCount > 0 ? (
                      <span className="text-[10px] bg-blue-50 text-blue-600 rounded px-1.5 py-0.5 font-medium">
                        {refCount}건
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-400 max-w-[120px] truncate" title={rd.note ?? ''}>
                    {rd.note || '—'}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(rd)}
                        className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                        title="편집"
                        aria-label={`${rd.nameKo} 역할 편집`}
                      >
                        <Edit2 size={13} aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleDelete(rd.role)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="삭제"
                        aria-label={`${rd.nameKo} 역할 삭제`}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-sm text-gray-400">
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={!!editTarget} onOpenChange={open => { if (!open) { setEditTarget(null); setDuplicateError(''); } }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{isCreateMode ? '새 역할 추가' : '역할 편집'}</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-4 pt-2">
              {/* Role code + data scope */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500">역할 코드</Label>
                  {isCreateMode ? (
                    <div>
                      <div className="flex items-center">
                        <span className="h-9 inline-flex items-center px-2.5 text-sm bg-gray-100 text-gray-500 border border-r-0 border-gray-200 rounded-l-md font-mono">
                          ROLE_
                        </span>
                        <Input
                          value={editTarget.roleSuffix}
                          onChange={e => updateField('roleSuffix', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                          placeholder="CUSTOM_NAME"
                          autoFocus
                          className="h-9 text-sm rounded-l-none font-mono"
                        />
                      </div>
                      {duplicateError && (
                        <p role="alert" className="text-[10px] text-red-500 mt-0.5">{duplicateError}</p>
                      )}
                      {editTarget.roleSuffix && !duplicateError && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          코드: ROLE_{editTarget.roleSuffix}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="h-9 text-sm border border-gray-100 rounded-md px-2.5 bg-gray-50 flex items-center text-gray-600 font-mono">
                      {editTarget.role}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500">데이터 범위</Label>
                  <select
                    value={editTarget.dataScope}
                    onChange={e => updateField('dataScope', e.target.value)}
                    className="w-full h-9 text-sm border border-gray-200 rounded-md px-2.5 bg-white"
                  >
                    {DATA_SCOPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.value} — {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500">한국어명</Label>
                  <Input
                    value={editTarget.nameKo}
                    onChange={e => updateField('nameKo', e.target.value)}
                    placeholder="역할 이름"
                    autoFocus={!isCreateMode}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500">영문명</Label>
                  <Input
                    value={editTarget.nameEn}
                    onChange={e => updateField('nameEn', e.target.value)}
                    placeholder="Role Name"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500">설명</Label>
                <textarea
                  value={editTarget.description}
                  onChange={e => updateField('description', e.target.value)}
                  rows={3}
                  className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="역할에 대한 설명"
                />
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

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => { setEditTarget(null); setDuplicateError(''); }}>
                  취소
                </Button>
                <Button
                  size="sm"
                  className="bg-[#1A1A1A] hover:bg-black text-white"
                  onClick={handleSave}
                  disabled={
                    (isCreateMode ? !editTarget.roleSuffix.trim() : false) ||
                    !editTarget.nameKo.trim()
                  }
                >
                  {isCreateMode ? '추가' : '저장'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!deleteConfirmRole}
        title="역할 삭제"
        description={deleteConfirmDescription}
        confirmLabel="삭제"
        destructive
        onConfirm={() => {
          if (deleteConfirmRole) {
            onRoleDefinitionsChange(roleDefinitions.filter(r => r.role !== deleteConfirmRole));
            onRoleDeleted?.(deleteConfirmRole);
          }
          setDeleteConfirmRole(null);
        }}
        onCancel={() => setDeleteConfirmRole(null)}
      />
    </div>
  );
}
