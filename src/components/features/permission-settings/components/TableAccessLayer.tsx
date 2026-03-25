'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Info } from '../../../icons';
import { Popover, PopoverTrigger, PopoverContent } from '../../../ui/popover';
import { ConfirmDialog } from '../../../ui/confirm-dialog';
import type { DomainRole, AccessLevel, DomainAccessMatrix, ModuleCode } from '../../../../types';
import {
  VIEW_SUBCATEGORIES,
  MODULE_DEFINITIONS,
  ROLE_DEFINITIONS,
  ROLE_SHORT_LABEL_MAP,
  SENSITIVITY_DISPLAY,
} from '../data/viewTableData';
import { VIEWS_BY_SUBCATEGORY } from '../data/viewDefinitionData';
import { AccessMatrixCell } from './AccessMatrixCell';
import { ViewRowsSection } from './ViewRowsSection';

// ============================================================================
// Types
// ============================================================================

interface TableAccessLayerProps {
  accessMatrix: DomainAccessMatrix[];
  modifiedCells: Set<string>;
  onToggleAccess: (role: DomainRole, subcategoryId: string, newLevel: AccessLevel) => void;
  onToggleViewAccess: (role: DomainRole, viewId: string, subcategoryId: string, newLevel: AccessLevel) => void;
  onResetToDefault: () => void;
}

// Role order as defined in viewTableData
const ROLE_ORDER: DomainRole[] = ROLE_DEFINITIONS.map(r => r.role);

const STICKY_LEFT_WIDTH = 'w-[320px] min-w-[320px]';
const CELL_WIDTH = 'w-14 min-w-[56px]';

// ============================================================================
// Helpers
// ============================================================================

function getAccessLevel(
  matrixMap: Map<DomainRole, DomainAccessMatrix>,
  role: DomainRole,
  subcategoryId: string,
): AccessLevel {
  const entry = matrixMap.get(role);
  return entry?.subcategoryAccess[subcategoryId] ?? 'no_access';
}

function getTotalViewCount(moduleCode: ModuleCode): number {
  return VIEW_SUBCATEGORIES.filter(s => s.moduleCode === moduleCode).reduce(
    (sum, s) => sum + s.viewCount,
    0,
  );
}

/** Count view-level overrides across all roles for views in a subcategory */
function getOverrideCount(
  subcategoryId: string,
  accessMatrix: DomainAccessMatrix[],
): number {
  const views = VIEWS_BY_SUBCATEGORY[subcategoryId] ?? [];
  let count = 0;
  for (const view of views) {
    for (const matrix of accessMatrix) {
      if (matrix.viewOverrides[view.id] !== undefined) {
        count++;
      }
    }
  }
  return count;
}

// ============================================================================
// Filter Bar
// ============================================================================

const SENSITIVITY_CRITERIA = [
  { level: '매우높음', criteria: '개인정보보호법 직접 대상 (식별+민감정보)', examples: '급여명세, 주민번호, 계좌번호' },
  { level: '높음', criteria: '미공시 재무정보 또는 원가/단가 등 영업비밀', examples: '재무제표, 원가분석, 수익성, 세무, 연결재무' },
  { level: '중간', criteria: '부서 간 접근 제한이 필요한 업무 데이터', examples: '영업실적, 예산, 구매발주, 프로젝트 비용' },
  { level: '낮음', criteria: '공개되어도 리스크가 거의 없는 데이터', examples: '환율, 재고현황, 창고 재고' },
] as const;

const SENSITIVITY_OPTIONS = ['매우높음', '높음', '중간', '낮음'] as const;
type SensitivityOption = (typeof SENSITIVITY_OPTIONS)[number];

interface FilterBarProps {
  moduleFilter: ModuleCode | 'ALL';
  onModuleFilterChange: (v: ModuleCode | 'ALL') => void;
  sensitivityFilter: Set<SensitivityOption>;
  onSensitivityChange: (v: SensitivityOption) => void;
  searchText: string;
  onSearchChange: (v: string) => void;
  modifiedCount: number;
  onResetToDefault: () => void;
}

function FilterBar({
  moduleFilter,
  onModuleFilterChange,
  sensitivityFilter,
  onSensitivityChange,
  searchText,
  onSearchChange,
  modifiedCount,
  onResetToDefault,
}: FilterBarProps) {
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  return (
    <>
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
      {/* Module filter */}
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-medium text-gray-500 whitespace-nowrap">모듈</label>
        <select
          value={moduleFilter}
          onChange={e => onModuleFilterChange(e.target.value as ModuleCode | 'ALL')}
          className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          <option value="ALL">전체</option>
          {MODULE_DEFINITIONS.map(m => (
            <option key={m.code} value={m.code}>
              {m.code} — {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sensitivity filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500">민감도</span>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="민감도 기준 안내"
            >
              <Info size={13} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[440px] p-0" align="start" sideOffset={8}>
            <div className="px-4 py-2.5 border-b border-gray-100">
              <h4 className="text-xs font-bold text-gray-900">민감도 등급 기준</h4>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-1.5 font-bold text-gray-500 w-20">등급</th>
                  <th className="text-left px-4 py-1.5 font-bold text-gray-500">기준</th>
                  <th className="text-left px-4 py-1.5 font-bold text-gray-500 w-40">예시</th>
                </tr>
              </thead>
              <tbody>
                {SENSITIVITY_CRITERIA.map(row => {
                  const display = SENSITIVITY_DISPLAY[row.level as keyof typeof SENSITIVITY_DISPLAY];
                  return (
                    <tr key={row.level} className="border-b border-gray-50 last:border-b-0">
                      <td className="px-4 py-1.5">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${display?.bgColor ?? ''} ${display?.color ?? ''}`}>
                          {row.level}
                        </span>
                      </td>
                      <td className="px-4 py-1.5 text-gray-700">{row.criteria}</td>
                      <td className="px-4 py-1.5 text-gray-500">{row.examples}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </PopoverContent>
        </Popover>
        <div className="flex gap-1.5">
          {SENSITIVITY_OPTIONS.map(opt => {
            const display = SENSITIVITY_DISPLAY[opt];
            const checked = sensitivityFilter.has(opt);
            return (
              <label
                key={opt}
                htmlFor={`sensitivity-${opt}`}
                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border cursor-pointer select-none transition-colors focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-1 ${
                  checked
                    ? `${display.bgColor} ${display.color} border-current`
                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  id={`sensitivity-${opt}`}
                  type="checkbox"
                  checked={checked}
                  onChange={() => onSensitivityChange(opt)}
                  className="sr-only"
                />
                {opt}
              </label>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <input
        type="search"
        aria-label="서브카테고리/뷰 검색"
        placeholder="서브카테고리/뷰 검색..."
        value={searchText}
        onChange={e => onSearchChange(e.target.value)}
        className="text-xs border border-gray-200 rounded px-2.5 py-1 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 w-44"
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Modified indicator */}
      {modifiedCount > 0 && (
        <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
          변경 {modifiedCount}건
        </span>
      )}

      {/* Reset button */}
      <button
        type="button"
        onClick={() => setResetConfirmOpen(true)}
        className="text-xs px-3 py-1.5 rounded border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
      >
        기본값 복원
      </button>
    </div>
    <ConfirmDialog
      open={resetConfirmOpen}
      title="기본값 복원"
      description="모든 접근 권한 변경 사항이 초기화됩니다. 계속하시겠습니까?"
      confirmLabel="복원"
      destructive
      onConfirm={() => { onResetToDefault(); setResetConfirmOpen(false); }}
      onCancel={() => setResetConfirmOpen(false)}
    />
    </>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function TableAccessLayer({
  accessMatrix,
  modifiedCells,
  onToggleAccess,
  onToggleViewAccess,
  onResetToDefault,
}: TableAccessLayerProps) {
  // Filter state
  const [moduleFilter, setModuleFilter] = useState<ModuleCode | 'ALL'>('ALL');
  const [sensitivityFilter, setSensitivityFilter] = useState<Set<SensitivityOption>>(
    new Set(SENSITIVITY_OPTIONS),
  );
  const [searchText, setSearchText] = useState('');

  // Collapse state — all modules start collapsed
  const [collapsedModules, setCollapsedModules] = useState<Set<ModuleCode>>(
    () => new Set(MODULE_DEFINITIONS.map(m => m.code)),
  );

  // Subcategory expansion state (for view rows)
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

  const toggleModule = useCallback((code: ModuleCode) => {
    setCollapsedModules(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }, []);

  const toggleSubcategory = useCallback((subcatId: string) => {
    setExpandedSubcategories(prev => {
      const next = new Set(prev);
      if (next.has(subcatId)) {
        next.delete(subcatId);
      } else {
        next.add(subcatId);
      }
      return next;
    });
  }, []);

  const handleSensitivityChange = useCallback((opt: SensitivityOption) => {
    setSensitivityFilter(prev => {
      const next = new Set(prev);
      if (next.has(opt)) {
        next.delete(opt);
      } else {
        next.add(opt);
      }
      return next;
    });
  }, []);

  const handleCellSelect = useCallback(
    (role: DomainRole, subcategoryId: string, newLevel: AccessLevel) => {
      onToggleAccess(role, subcategoryId, newLevel);
    },
    [onToggleAccess],
  );

  // Filtered subcategory ids per module + auto-expand for view search matches
  const { filteredSubcatsByModule, viewSearchMatches } = useMemo(() => {
    const result: Record<ModuleCode, typeof VIEW_SUBCATEGORIES> = {} as Record<
      ModuleCode,
      typeof VIEW_SUBCATEGORIES
    >;
    const viewMatches = new Set<string>(); // subcategory IDs that matched via view name

    for (const mod of MODULE_DEFINITIONS) {
      if (moduleFilter !== 'ALL' && mod.code !== moduleFilter) continue;

      const subcats = VIEW_SUBCATEGORIES.filter(s => {
        if (s.moduleCode !== mod.code) return false;
        if (!sensitivityFilter.has(s.sensitivityLevel as SensitivityOption)) return false;
        if (searchText.trim()) {
          const q = searchText.trim().toLowerCase();
          const matchesSubcat = s.subcategoryName.toLowerCase().includes(q);
          const views = VIEWS_BY_SUBCATEGORY[s.id] ?? [];
          const matchesView = views.some(
            v => v.viewName.toLowerCase().includes(q) || v.displayName.toLowerCase().includes(q),
          );
          if (!matchesSubcat && !matchesView) return false;
          if (matchesView && !matchesSubcat) {
            viewMatches.add(s.id);
          }
        }
        return true;
      });

      if (subcats.length > 0) {
        result[mod.code] = subcats;
      }
    }
    return { filteredSubcatsByModule: result, viewSearchMatches: viewMatches };
  }, [moduleFilter, sensitivityFilter, searchText]);

  // Modules that survive the filter
  const visibleModules = useMemo(
    () => MODULE_DEFINITIONS.filter(m => filteredSubcatsByModule[m.code]?.length > 0),
    [filteredSubcatsByModule],
  );

  // O(1) role → matrix lookup (replaces O(n) find() calls)
  const accessMatrixMap = useMemo(
    () => new Map(accessMatrix.map(m => [m.role, m])),
    [accessMatrix],
  );

  // Pre-computed override counts per subcategory — avoids O(views×roles) per row
  const overrideCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const subcat of VIEW_SUBCATEGORIES) {
      const views = VIEWS_BY_SUBCATEGORY[subcat.id] ?? [];
      let count = 0;
      for (const view of views) {
        for (const matrix of accessMatrix) {
          if (matrix.viewOverrides[view.id] !== undefined) {
            count++;
          }
        }
      }
      map.set(subcat.id, count);
    }
    return map;
  }, [accessMatrix]);

  return (
    <div className="flex flex-col h-full overflow-hidden border border-gray-200 rounded-xl bg-white shadow-sm">
      <FilterBar
        moduleFilter={moduleFilter}
        onModuleFilterChange={setModuleFilter}
        sensitivityFilter={sensitivityFilter}
        onSensitivityChange={handleSensitivityChange}
        searchText={searchText}
        onSearchChange={setSearchText}
        modifiedCount={modifiedCells.size}
        onResetToDefault={onResetToDefault}
      />

      {/* Scrollable matrix area */}
      <div className="flex-1 overflow-auto">
        {/* Min-width wrapper so horizontal scroll works */}
        <div className="w-fit min-w-full">

          {/* ------------------------------------------------------------------ */}
          {/* Sticky column header row                                            */}
          {/* ------------------------------------------------------------------ */}
          <div className="flex sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
            {/* Left sticky label area */}
            <div
              className={`${STICKY_LEFT_WIDTH} flex items-end sticky left-0 z-30 bg-white border-r border-gray-200`}
            >
              <div className="flex w-full">
                <div className="flex-1 px-3 py-2 text-xs font-semibold text-gray-500 border-r border-gray-100">
                  서브카테고리
                </div>
                <div className="w-12 px-1 py-2 text-xs font-semibold text-gray-500 text-center border-r border-gray-100">
                  뷰수
                </div>
                <div className="w-16 px-1 py-2 text-xs font-semibold text-gray-500 text-center">
                  민감도
                </div>
              </div>
            </div>

            {/* Role columns */}
            <div className="flex">
              {ROLE_ORDER.map(role => (
                <div
                  key={role}
                  className={`${CELL_WIDTH} flex flex-col items-center justify-end pb-1.5 pt-2 border-r border-gray-100 last:border-r-0`}
                  title={ROLE_DEFINITIONS.find(r => r.role === role)?.nameKo}
                >
                  <span
                    className="text-[10px] font-semibold text-gray-600 leading-tight text-center"
                  >
                    {ROLE_SHORT_LABEL_MAP[role]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* Module groups                                                        */}
          {/* ------------------------------------------------------------------ */}
          {visibleModules.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-gray-400">
              조건에 맞는 서브카테고리가 없습니다.
            </div>
          ) : (
            visibleModules.map(mod => {
              const subcats = filteredSubcatsByModule[mod.code] ?? [];
              const isCollapsed = collapsedModules.has(mod.code);
              const totalViews = getTotalViewCount(mod.code);

              return (
                <div key={mod.code} className="border-b border-gray-100 last:border-b-0">
                  {/* ---------------------------------------------------------- */}
                  {/* Module header row                                           */}
                  {/* ---------------------------------------------------------- */}
                  <button
                    type="button"
                    onClick={() => toggleModule(mod.code)}
                    className="flex w-full items-center text-left hover:bg-gray-100 transition-colors bg-gray-50 border-b border-gray-100"
                    aria-expanded={!isCollapsed}
                    aria-controls={`module-panel-${mod.code}`}
                  >
                    {/* Sticky left: module info */}
                    <div
                      className={`${STICKY_LEFT_WIDTH} sticky left-0 z-10 bg-gray-50 border-r border-gray-200 flex items-center gap-2 px-3 py-2`}
                      style={{ backgroundClip: 'padding-box' }}
                    >
                      <span
                        aria-hidden="true"
                        className={`text-gray-400 transition-transform duration-150 text-xs ${isCollapsed ? '' : 'rotate-90'}`}
                      >
                        ▶
                      </span>
                      <span className="text-xs font-bold text-gray-700 font-mono tracking-wide">
                        {mod.code}
                      </span>
                      <span className="text-xs font-medium text-gray-600">{mod.name}</span>
                      <span className="ml-auto text-[10px] text-gray-400">
                        {subcats.length}개 · {totalViews}뷰
                      </span>
                    </div>

                    {/* Right: empty cells area (visual only) */}
                    <div className="flex">
                      {ROLE_ORDER.map(role => (
                        <div
                          key={role}
                          className={`${CELL_WIDTH} h-8 border-r border-gray-100 last:border-r-0 bg-gray-50`}
                        />
                      ))}
                    </div>
                  </button>

                  {/* ---------------------------------------------------------- */}
                  {/* Subcategory rows                                            */}
                  {/* ---------------------------------------------------------- */}
                  <div id={`module-panel-${mod.code}`}>
                  {!isCollapsed &&
                    subcats.map((subcat, rowIdx) => {
                      const sensitivityDisplay = SENSITIVITY_DISPLAY[subcat.sensitivityLevel];
                      const isSubcatExpanded =
                        expandedSubcategories.has(subcat.id) || viewSearchMatches.has(subcat.id);
                      const views = VIEWS_BY_SUBCATEGORY[subcat.id] ?? [];
                      const overrideCount = overrideCountMap.get(subcat.id) ?? 0;
                      const rowBg = rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40';

                      return (
                        <React.Fragment key={subcat.id}>
                          {/* Subcategory header row (now expandable) */}
                          <div
                            className={`flex items-center ${rowBg} hover:bg-blue-50/30 transition-colors`}
                          >
                            {/* Sticky left: subcat info */}
                            <div
                              className={`${STICKY_LEFT_WIDTH} sticky left-0 z-10 border-r border-gray-200 flex items-center ${rowBg}`}
                              style={{ backgroundClip: 'padding-box' }}
                            >
                              {/* Subcategory name with toggle */}
                              <button
                                type="button"
                                onClick={() => toggleSubcategory(subcat.id)}
                                aria-expanded={isSubcatExpanded}
                                aria-controls={`subcat-panel-${subcat.id}`}
                                aria-label={`${subcat.subcategoryName} 뷰 ${isSubcatExpanded ? '접기' : '펼치기'}`}
                                className="flex items-center gap-1.5 flex-1 px-3 py-1.5 border-r border-gray-100 text-left hover:bg-blue-50/50 transition-colors"
                              >
                                <span
                                  aria-hidden="true"
                                  className={`text-gray-400 text-[10px] transition-transform duration-150 ${
                                    isSubcatExpanded ? 'rotate-90' : ''
                                  }`}
                                >
                                  ▶
                                </span>
                                <span className="text-xs text-gray-800 leading-tight">
                                  {subcat.subcategoryName}
                                </span>
                                {overrideCount > 0 && (
                                  <span className="text-[8px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded ml-auto shrink-0">
                                    {overrideCount} 오버라이드
                                  </span>
                                )}
                              </button>

                              {/* View count badge */}
                              <div className="w-12 flex items-center justify-center border-r border-gray-100">
                                <span className="text-[10px] font-mono text-gray-500 bg-gray-100 rounded px-1 py-0.5">
                                  {subcat.viewCount}
                                </span>
                              </div>

                              {/* Sensitivity badge */}
                              <div className="w-16 flex items-center justify-center">
                                <span
                                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${sensitivityDisplay.bgColor} ${sensitivityDisplay.color}`}
                                >
                                  {sensitivityDisplay.label}
                                </span>
                              </div>
                            </div>

                            {/* Access cells — subcategory level */}
                            <div className="flex items-center">
                              {ROLE_ORDER.map(role => {
                                const level = getAccessLevel(accessMatrixMap, role, subcat.id);
                                const isModified = modifiedCells.has(`${role}:${subcat.id}`);
                                return (
                                  <div
                                    key={role}
                                    className={`${CELL_WIDTH} flex items-center justify-center py-1 border-r border-gray-100 last:border-r-0`}
                                  >
                                    <AccessMatrixCell
                                      level={level}
                                      isModified={isModified}
                                      onLevelSelect={(newLevel) => handleCellSelect(role, subcat.id, newLevel)}
                                      label={`기본값 — 하위 ${subcat.viewCount}개 뷰에 일괄 적용`}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Expanded view rows */}
                          {isSubcatExpanded && views.length > 0 && (
                            <div id={`subcat-panel-${subcat.id}`}>
                            <ViewRowsSection
                              subcategory={subcat}
                              views={views}
                              accessMatrix={accessMatrix}
                              accessMatrixMap={accessMatrixMap}
                              modifiedCells={modifiedCells}
                              onToggleViewAccess={onToggleViewAccess}
                              roleOrder={ROLE_ORDER}
                              cellWidth={CELL_WIDTH}
                              stickyLeftWidth={STICKY_LEFT_WIDTH}
                            />
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
