import React, { useState, useMemo } from 'react';
import { Database, Check, Minus } from '../../../icons';
import { Badge } from '../../../ui/badge';
import { Checkbox } from '../../../ui/checkbox';
import type { ErpViewTable, TableAccessPolicy, UserRole } from '../../../../types';
import { TABLE_CATEGORIES } from '../permissionSettingsData';

interface TableAccessLayerProps {
  tables: ErpViewTable[];
  policies: TableAccessPolicy[];
  onToggle: (role: UserRole, tableId: string) => void;
}

const ROLES: UserRole[] = ['Super Admin', 'Data Manager', 'Viewer'];

const ROLE_STYLES: Record<UserRole, { active: string; idle: string }> = {
  'Super Admin': {
    active: 'bg-purple-50 border-purple-200 text-purple-900',
    idle: 'bg-white border-gray-200 text-gray-700 hover:border-gray-300',
  },
  'Data Manager': {
    active: 'bg-blue-50 border-blue-200 text-blue-900',
    idle: 'bg-white border-gray-200 text-gray-700 hover:border-gray-300',
  },
  'Viewer': {
    active: 'bg-gray-100 border-gray-300 text-gray-900',
    idle: 'bg-white border-gray-200 text-gray-700 hover:border-gray-300',
  },
};

export function TableAccessLayer({ tables, policies, onToggle }: TableAccessLayerProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('Data Manager');

  const currentPolicy = policies.find(p => p.role === selectedRole);
  const allowedSet = useMemo(
    () => new Set(currentPolicy?.allowedTableIds ?? []),
    [currentPolicy],
  );

  const tablesByCategory = useMemo(() => {
    const grouped: Record<string, ErpViewTable[]> = {};
    for (const cat of TABLE_CATEGORIES) {
      grouped[cat] = tables.filter(t => t.category === cat);
    }
    return grouped;
  }, [tables]);

  const handleCategoryToggle = (category: string) => {
    const categoryTables = tablesByCategory[category];
    const allChecked = categoryTables.every(t => allowedSet.has(t.id));
    for (const t of categoryTables) {
      if (allChecked) {
        if (allowedSet.has(t.id)) onToggle(selectedRole, t.id);
      } else {
        if (!allowedSet.has(t.id)) onToggle(selectedRole, t.id);
      }
    }
  };

  const getCategoryState = (category: string): boolean | 'indeterminate' => {
    const categoryTables = tablesByCategory[category];
    const checkedCount = categoryTables.filter(t => allowedSet.has(t.id)).length;
    if (checkedCount === 0) return false;
    if (checkedCount === categoryTables.length) return true;
    return 'indeterminate';
  };

  const totalAllowed = allowedSet.size;
  const totalTables = tables.length;

  return (
    <div className="flex gap-6">
      {/* Role Selector */}
      <div className="w-56 shrink-0 space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">역할 선택</p>
        {ROLES.map(role => {
          const isActive = role === selectedRole;
          const rolePolicy = policies.find(p => p.role === role);
          const count = rolePolicy?.allowedTableIds.length ?? 0;
          return (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                isActive ? ROLE_STYLES[role].active : ROLE_STYLES[role].idle
              }`}
            >
              <div className="text-sm font-bold">{role}</div>
              <div className="text-xs mt-0.5 opacity-70">{count}/{totalTables} 테이블</div>
            </button>
          );
        })}
      </div>

      {/* Table List */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-gray-400" />
            <span className="text-sm font-bold text-gray-900">{selectedRole}</span>
            <span className="text-xs text-gray-500">의 테이블 접근 권한</span>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            {totalAllowed} / {totalTables}
          </Badge>
        </div>

        <div className="divide-y divide-gray-100">
          {TABLE_CATEGORIES.map(category => {
            const categoryState = getCategoryState(category);
            const categoryTables = tablesByCategory[category];
            return (
              <div key={category}>
                {/* Category Header */}
                <div className="px-6 py-3 bg-gray-50 flex items-center gap-3">
                  <Checkbox
                    checked={categoryState}
                    onCheckedChange={() => handleCategoryToggle(category)}
                    className="data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
                  />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{category}</span>
                  <span className="text-xs text-gray-400">
                    ({categoryTables.filter(t => allowedSet.has(t.id)).length}/{categoryTables.length})
                  </span>
                </div>

                {/* Table Rows */}
                {categoryTables.map(table => (
                  <label
                    key={table.id}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={allowedSet.has(table.id)}
                      onCheckedChange={() => onToggle(selectedRole, table.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{table.displayName}</span>
                        <span className="text-xs font-mono text-gray-400">{table.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{table.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
