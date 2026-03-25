import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../ui/dialog';
import type { EnhancedUser, DomainRole, AccessLevel, DomainAccessMatrix } from '../../../../types';
import { DomainRoleBadge } from './DomainRoleBadge';
import {
  DEFAULT_ACCESS_MATRIX,
  VIEW_SUBCATEGORIES,
  MODULE_DEFINITIONS,
  SENSITIVITY_DISPLAY,
} from '../../permission-settings/data/viewTableData';

// ============================================================================
// Access Level Helpers
// ============================================================================

const ACCESS_PRIORITY: Record<AccessLevel, number> = {
  full: 4, dept_restricted: 3, column_masked: 2, summary_only: 1, no_access: 0,
};

const LEVEL_DISPLAY: Record<AccessLevel, { icon: string; label: string; color: string; bgColor: string }> = {
  full:            { icon: '●', label: '전체접근',   color: 'text-green-700',  bgColor: 'bg-green-100' },
  dept_restricted: { icon: '◐', label: '부서제한',   color: 'text-blue-700',   bgColor: 'bg-blue-100' },
  column_masked:   { icon: '🔒', label: '컬럼마스킹', color: 'text-amber-700',  bgColor: 'bg-amber-100' },
  summary_only:    { icon: '○', label: '요약만',     color: 'text-gray-600',   bgColor: 'bg-gray-100' },
  no_access:       { icon: '—', label: '접근불가',   color: 'text-red-400',    bgColor: 'bg-red-50' },
};

function getEffectiveAccess(
  roles: DomainRole[],
  accessMatrix: DomainAccessMatrix[],
  subcatId: string,
): AccessLevel {
  let maxLevel: AccessLevel = 'no_access';
  for (const role of roles) {
    const entry = accessMatrix.find(m => m.role === role);
    const level = entry?.subcategoryAccess[subcatId] ?? 'no_access';
    if (ACCESS_PRIORITY[level] > ACCESS_PRIORITY[maxLevel]) maxLevel = level;
  }
  return maxLevel;
}

// ============================================================================
// Component
// ============================================================================

interface UserAccessViewModalProps {
  user: EnhancedUser | null;
  open: boolean;
  onClose: () => void;
  accessMatrix?: DomainAccessMatrix[];
  onNavigateToPermissions?: () => void;
}

export function UserAccessViewModal({ user, open, onClose, accessMatrix, onNavigateToPermissions }: UserAccessViewModalProps) {
  const matrix = accessMatrix ?? DEFAULT_ACCESS_MATRIX;
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleModule = (code: string) => {
    setCollapsedModules(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  // Compute effective access for all subcategories
  const accessData = useMemo(() => {
    if (!user) return null;

    const subcatAccess = VIEW_SUBCATEGORIES.map(subcat => ({
      ...subcat,
      effectiveLevel: getEffectiveAccess(user.roles, matrix, subcat.id),
    }));

    // Summary stats
    const summary: Record<AccessLevel, { count: number; viewCount: number }> = {
      full: { count: 0, viewCount: 0 },
      dept_restricted: { count: 0, viewCount: 0 },
      column_masked: { count: 0, viewCount: 0 },
      summary_only: { count: 0, viewCount: 0 },
      no_access: { count: 0, viewCount: 0 },
    };

    for (const s of subcatAccess) {
      summary[s.effectiveLevel].count++;
      summary[s.effectiveLevel].viewCount += s.viewCount;
    }

    // Group by module
    const byModule = MODULE_DEFINITIONS
      .map(mod => ({
        ...mod,
        subcats: subcatAccess.filter(s => s.moduleCode === mod.code),
      }))
      .filter(mod => mod.subcats.length > 0);

    return { subcatAccess, summary, byModule };
  }, [user, matrix]);

  const filteredModules = useMemo(() => {
    if (!accessData) return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return accessData.byModule;
    return accessData.byModule
      .map(mod => ({
        ...mod,
        subcats: mod.subcats.filter(s =>
          s.subcategoryName.toLowerCase().includes(q) ||
          mod.name.toLowerCase().includes(q) ||
          mod.code.toLowerCase().includes(q)
        ),
      }))
      .filter(mod => mod.subcats.length > 0);
  }, [accessData, searchQuery]);

  if (!user || !accessData) return null;

  const { summary, byModule } = accessData;

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[560px] max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-5 pt-5 pb-3 shrink-0">
          <DialogTitle className="text-base">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: user.avatarColor }}
              >
                {user.name[0]}
              </div>
              <div>
                <div>{user.name} — 접근 가능 뷰</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.roles.map(role => (
                    <DomainRoleBadge key={role} role={role} />
                  ))}
                </div>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Summary Banner */}
        <div className="px-5 pb-3 shrink-0">
          <div className="flex flex-wrap gap-3 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
            {(['full', 'dept_restricted', 'summary_only', 'no_access'] as AccessLevel[]).map(level => {
              const display = LEVEL_DISPLAY[level];
              const stat = summary[level];
              return (
                <div key={level} className="flex items-center gap-1.5">
                  <span className={`text-sm ${display.color}`}>{display.icon}</span>
                  <span className="text-xs text-gray-600">{display.label}</span>
                  <span className="text-xs font-bold text-gray-900">{stat.viewCount}뷰</span>
                </div>
              );
            })}
            {summary.column_masked.viewCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className={`text-sm ${LEVEL_DISPLAY.column_masked.color}`}>{LEVEL_DISPLAY.column_masked.icon}</span>
                <span className="text-xs text-gray-600">{LEVEL_DISPLAY.column_masked.label}</span>
                <span className="text-xs font-bold text-gray-900">{summary.column_masked.viewCount}뷰</span>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pb-2 shrink-0">
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="모듈 또는 카테고리 검색..."
            className="w-full h-8 text-xs border border-gray-200 rounded-lg px-3 bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>

        {/* Module Groups */}
        <div className="flex-1 overflow-y-auto px-5 pb-3">
          <div className="space-y-1">
            {filteredModules.map(mod => {
              const isCollapsed = collapsedModules.has(mod.code);
              const modViewCount = mod.subcats.reduce((sum, s) => sum + s.viewCount, 0);
              const accessibleCount = mod.subcats.filter(s => s.effectiveLevel !== 'no_access').length;

              return (
                <div key={mod.code} className="border border-gray-100 rounded-lg overflow-hidden">
                  {/* Module Header */}
                  <button
                    type="button"
                    onClick={() => toggleModule(mod.code)}
                    className="flex w-full items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <span className={`text-gray-400 transition-transform duration-150 text-[10px] ${isCollapsed ? '' : 'rotate-90'}`}>
                      ▶
                    </span>
                    <span className="text-xs font-bold text-gray-700 font-mono">{mod.code}</span>
                    <span className="text-xs text-gray-600">{mod.name}</span>
                    <span className="ml-auto text-[10px] text-gray-400">
                      {accessibleCount}/{mod.subcats.length}개 · {modViewCount}뷰
                    </span>
                  </button>

                  {/* Subcategory Rows */}
                  {!isCollapsed && (
                    <div>
                      {mod.subcats.map((subcat, idx) => {
                        const display = LEVEL_DISPLAY[subcat.effectiveLevel];
                        const isNoAccess = subcat.effectiveLevel === 'no_access';
                        const sensitivityDisplay = SENSITIVITY_DISPLAY[subcat.sensitivityLevel];

                        return (
                          <div
                            key={subcat.id}
                            className={`flex items-center px-3 py-1.5 border-t border-gray-50 ${
                              idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                            } ${isNoAccess ? 'opacity-50' : ''}`}
                          >
                            <span className={`text-xs flex-1 ${isNoAccess ? 'text-gray-400' : 'text-gray-800'}`}>
                              {subcat.subcategoryName}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400 w-10 text-right mr-3">
                              {subcat.viewCount}뷰
                            </span>
                            {sensitivityDisplay && (
                              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full mr-3 ${sensitivityDisplay.bgColor} ${sensitivityDisplay.color}`}>
                                {sensitivityDisplay.label}
                              </span>
                            )}
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${display.bgColor} ${display.color} min-w-[72px] justify-center`}>
                              {display.icon} {display.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer link */}
        {onNavigateToPermissions && (
          <div className="px-5 pb-4 pt-2 border-t border-gray-100 shrink-0">
            <button
              type="button"
              onClick={() => { onClose(); onNavigateToPermissions(); }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2"
            >
              이 사용자의 권한 수정 →
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
