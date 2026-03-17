import React, { useState, useMemo, useCallback } from 'react';
import { Edit2, Plus, Search, Shield, Trash2 } from '../../../icons';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Badge } from '../../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../ui/dialog';
import type { OrgRoleMapping, DomainRole, PositionLevel } from '../../../../types';

const POSITION_LEVELS: PositionLevel[] = ['실무자', '관리자', '임원'];

interface Props {
  mappings: OrgRoleMapping[];
  onMappingsChange: (mappings: OrgRoleMapping[]) => void;
  roleLabelMap: Record<string, string>;
  allRoles: DomainRole[];
}

function DomainRoleBadge({ role, label }: { role: string; label: string }) {
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
      {label}
    </Badge>
  );
}

interface EditFormState {
  id: string;
  category: string;
  division: string;
  subOrg: string;
  positionTitle: string;
  positionLevel: string;
  primaryRole: string;
  additionalRole: string;
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
  dataAccessScope: '',
  accessModules: '',
  rlsFilter: '',
  note: '',
};

export function OrgRoleMappingManager({ mappings, onMappingsChange, roleLabelMap, allRoles }: Props) {
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [positionLevelFilter, setPositionLevelFilter] = useState('ALL');
  const [searchText, setSearchText] = useState('');
  const [editTarget, setEditTarget] = useState<EditFormState | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  // Extract unique categories
  const categories = useMemo(
    () => [...new Set(mappings.map(m => m.category))].sort(),
    [mappings],
  );

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
  }, []);

  const openEdit = useCallback((m: OrgRoleMapping) => {
    setEditTarget({
      id: m.id,
      category: m.category,
      division: m.division,
      subOrg: m.subOrg,
      positionTitle: m.positionTitle,
      positionLevel: m.positionLevel,
      primaryRole: m.primaryRole,
      additionalRole: m.additionalRole ?? '',
      dataAccessScope: m.dataAccessScope,
      accessModules: Array.isArray(m.accessModules) ? m.accessModules.join(', ') : m.accessModules,
      rlsFilter: m.rlsFilter,
      note: m.note ?? '',
    });
    setIsCreateMode(false);
  }, []);

  const handleSave = useCallback(() => {
    if (!editTarget || !editTarget.category.trim() || !editTarget.primaryRole) return;

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
      if (!confirm(`"${m.division} / ${m.subOrg} / ${m.positionTitle}" 매핑을 삭제하시겠습니까?`)) return;
      onMappingsChange(mappings.filter(x => x.id !== id));
    },
    [mappings, onMappingsChange],
  );

  const updateField = useCallback(
    <K extends keyof EditFormState>(field: K, value: EditFormState[K]) => {
      setEditTarget(prev => (prev ? { ...prev, [field]: value } : prev));
    },
    [],
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-gray-900">조직-역할 매핑 관리</h4>
          <p className="text-xs text-gray-500 mt-0.5">
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
              <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 whitespace-nowrap">카테고리</th>
              <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 whitespace-nowrap">부서</th>
              <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 whitespace-nowrap">하위조직</th>
              <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 whitespace-nowrap">직위</th>
              <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 whitespace-nowrap">직급</th>
              <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 whitespace-nowrap">주역할</th>
              <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 whitespace-nowrap">추가역할</th>
              <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 whitespace-nowrap">데이터범위</th>
              <th className="text-right py-2.5 px-3 text-xs font-bold text-gray-500 whitespace-nowrap">액션</th>
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
                <td className="py-2 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(m)}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                      title="편집"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      title="삭제"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
      <Dialog open={!!editTarget} onOpenChange={open => { if (!open) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{isCreateMode ? '새 매핑 추가' : '매핑 편집'}</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-4 pt-2">
              {/* Row 1: category, division */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">카테고리</Label>
                  <Input
                    value={editTarget.category}
                    onChange={e => updateField('category', e.target.value)}
                    placeholder="경영지원"
                    className="h-9 text-sm"
                    list="category-options"
                  />
                  <datalist id="category-options">
                    {categories.map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">부서</Label>
                  <Input
                    value={editTarget.division}
                    onChange={e => updateField('division', e.target.value)}
                    placeholder="경영기획부문"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* Row 2: subOrg, positionTitle, positionLevel */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">하위조직</Label>
                  <Input
                    value={editTarget.subOrg}
                    onChange={e => updateField('subOrg', e.target.value)}
                    placeholder="경영기획실"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">직위</Label>
                  <Input
                    value={editTarget.positionTitle}
                    onChange={e => updateField('positionTitle', e.target.value)}
                    placeholder="팀장"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">직급</Label>
                  <select
                    value={editTarget.positionLevel}
                    onChange={e => updateField('positionLevel', e.target.value)}
                    className="w-full h-9 text-sm border border-gray-200 rounded-md px-3 bg-white"
                  >
                    {POSITION_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: primaryRole, additionalRole */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">주역할</Label>
                  <select
                    value={editTarget.primaryRole}
                    onChange={e => updateField('primaryRole', e.target.value)}
                    className="w-full h-9 text-sm border border-gray-200 rounded-md px-3 bg-white"
                  >
                    <option value="">선택</option>
                    {allRoles.map(role => (
                      <option key={role} value={role}>{roleLabelMap[role] ?? role}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">추가역할 (선택)</Label>
                  <select
                    value={editTarget.additionalRole}
                    onChange={e => updateField('additionalRole', e.target.value)}
                    className="w-full h-9 text-sm border border-gray-200 rounded-md px-3 bg-white"
                  >
                    <option value="">없음</option>
                    {allRoles.map(role => (
                      <option key={role} value={role}>{roleLabelMap[role] ?? role}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: dataAccessScope, accessModules */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">데이터 접근 범위</Label>
                  <Input
                    value={editTarget.dataAccessScope}
                    onChange={e => updateField('dataAccessScope', e.target.value)}
                    placeholder="All (전체)"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">접근 모듈</Label>
                  <Input
                    value={editTarget.accessModules}
                    onChange={e => updateField('accessModules', e.target.value)}
                    placeholder="EIS(●), AC(○)"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* Row 5: rlsFilter, note */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">RLS 필터</Label>
                  <Input
                    value={editTarget.rlsFilter}
                    onChange={e => updateField('rlsFilter', e.target.value)}
                    placeholder="dept=경영기획실"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">비고</Label>
                  <Input
                    value={editTarget.note}
                    onChange={e => updateField('note', e.target.value)}
                    placeholder="선택 사항"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
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
    </div>
  );
}
