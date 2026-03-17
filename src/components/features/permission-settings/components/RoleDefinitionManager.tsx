import React, { useState, useMemo, useCallback } from 'react';
import { Edit2, Plus, Search, Shield, Trash2 } from '../../../icons';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Badge } from '../../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../ui/dialog';
import type { RoleDefinition, DomainRole } from '../../../../types';

const DATA_SCOPE_OPTIONS = ['All', 'Division', 'Department', 'Plant', 'Plant+Line', 'Warehouse', 'Project', 'Self'] as const;

interface Props {
  roleDefinitions: RoleDefinition[];
  onRoleDefinitionsChange: (roles: RoleDefinition[]) => void;
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

interface EditFormState {
  role: string;
  nameKo: string;
  nameEn: string;
  description: string;
  dataScope: string;
  targetExample: string;
  note: string;
}

const EMPTY_FORM: EditFormState = {
  role: '',
  nameKo: '',
  nameEn: '',
  description: '',
  dataScope: 'Department',
  targetExample: '',
  note: '',
};

export function RoleDefinitionManager({ roleDefinitions, onRoleDefinitionsChange }: Props) {
  const [searchText, setSearchText] = useState('');
  const [editTarget, setEditTarget] = useState<EditFormState | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  // Filtered list
  const filtered = useMemo(() => {
    if (!searchText.trim()) return roleDefinitions;
    const q = searchText.toLowerCase();
    return roleDefinitions.filter(
      r =>
        r.role.toLowerCase().includes(q) ||
        r.nameKo.includes(q) ||
        r.nameEn.toLowerCase().includes(q) ||
        r.description.includes(q),
    );
  }, [roleDefinitions, searchText]);

  const openCreate = useCallback(() => {
    setEditTarget({ ...EMPTY_FORM });
    setIsCreateMode(true);
  }, []);

  const openEdit = useCallback((rd: RoleDefinition) => {
    setEditTarget({
      role: rd.role,
      nameKo: rd.nameKo,
      nameEn: rd.nameEn,
      description: rd.description,
      dataScope: rd.dataScope,
      targetExample: rd.targetExample,
      note: rd.note ?? '',
    });
    setIsCreateMode(false);
  }, []);

  const handleSave = useCallback(() => {
    if (!editTarget || !editTarget.role.trim() || !editTarget.nameKo.trim()) return;

    const updated: RoleDefinition = {
      role: editTarget.role as DomainRole,
      nameKo: editTarget.nameKo,
      nameEn: editTarget.nameEn,
      description: editTarget.description,
      dataScope: editTarget.dataScope,
      targetExample: editTarget.targetExample,
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
  }, [editTarget, isCreateMode, roleDefinitions, onRoleDefinitionsChange]);

  const handleDelete = useCallback(
    (role: DomainRole) => {
      const rd = roleDefinitions.find(r => r.role === role);
      if (!rd) return;
      if (!confirm(`"${rd.nameKo}" 역할을 삭제하시겠습니까?`)) return;
      onRoleDefinitionsChange(roleDefinitions.filter(r => r.role !== role));
    },
    [roleDefinitions, onRoleDefinitionsChange],
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
          <h4 className="text-sm font-bold text-gray-900">역할 정의 관리</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            {roleDefinitions.length}개 역할
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

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="역할 검색 (코드, 이름, 설명)"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500">역할 코드</th>
              <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500">한국어명</th>
              <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500">영문명</th>
              <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500">데이터 범위</th>
              <th className="text-right py-2.5 px-3 text-xs font-bold text-gray-500">액션</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(rd => {
              return (
                <tr key={rd.role} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-2 px-3">
                    <RoleBadge role={rd.role} />
                  </td>
                  <td className="py-2 px-3 text-xs font-medium text-gray-900">{rd.nameKo}</td>
                  <td className="py-2 px-3 text-xs text-gray-600">{rd.nameEn}</td>
                  <td className="py-2 px-3">
                    <span className="text-[10px] bg-gray-100 text-gray-600 rounded px-1.5 py-0.5 font-medium">
                      {rd.dataScope}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(rd)}
                        className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                        title="편집"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(rd.role)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="삭제"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={!!editTarget} onOpenChange={open => { if (!open) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{isCreateMode ? '새 역할 추가' : '역할 편집'}</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">역할 코드</Label>
                  <Input
                    value={editTarget.role}
                    onChange={e => updateField('role', e.target.value)}
                    disabled={!isCreateMode}
                    placeholder="ROLE_CUSTOM"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">데이터 범위</Label>
                  <select
                    value={editTarget.dataScope}
                    onChange={e => updateField('dataScope', e.target.value)}
                    className="w-full h-9 text-sm border border-gray-200 rounded-md px-3 bg-white"
                  >
                    {DATA_SCOPE_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">한국어명</Label>
                  <Input
                    value={editTarget.nameKo}
                    onChange={e => updateField('nameKo', e.target.value)}
                    placeholder="역할 이름"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">영문명</Label>
                  <Input
                    value={editTarget.nameEn}
                    onChange={e => updateField('nameEn', e.target.value)}
                    placeholder="Role Name"
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500 uppercase">설명</Label>
                <textarea
                  value={editTarget.description}
                  onChange={e => updateField('description', e.target.value)}
                  rows={3}
                  className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="역할에 대한 설명"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">대상 예시</Label>
                  <Input
                    value={editTarget.targetExample}
                    onChange={e => updateField('targetExample', e.target.value)}
                    placeholder="예: 재무팀장, 회계팀장"
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
                  disabled={!editTarget.role.trim() || !editTarget.nameKo.trim()}
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
