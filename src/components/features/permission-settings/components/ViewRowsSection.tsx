'use client';

import React, { useMemo } from 'react';
import type {
  DomainRole,
  AccessLevel,
  DomainAccessMatrix,
  ViewSubcategory,
  ViewDefinition,
} from '../../../../types';
import { AccessMatrixCell } from './AccessMatrixCell';
import { resolveViewAccessLevel } from '../data/viewDefinitionData';

// ============================================================================
// Types
// ============================================================================

interface ViewRowsSectionProps {
  subcategory: ViewSubcategory;
  views: ViewDefinition[];
  accessMatrix: DomainAccessMatrix[];
  accessMatrixMap: Map<DomainRole, DomainAccessMatrix>;
  modifiedCells: Set<string>;
  onToggleViewAccess: (
    role: DomainRole,
    viewId: string,
    subcategoryId: string,
    newLevel: AccessLevel,
  ) => void;
  roleOrder: DomainRole[];
  cellWidth: string;
  stickyLeftWidth: string;
}

// ============================================================================
// Helpers
// ============================================================================

const ACCESS_PRIORITY: Record<AccessLevel, number> = {
  full: 4,
  dept_restricted: 3,
  summary_only: 2,
  column_masked: 1,
  no_access: 0,
};

function getOverrideDirection(
  parentLevel: AccessLevel,
  childLevel: AccessLevel,
): 'upgrade' | 'downgrade' | null {
  const diff = ACCESS_PRIORITY[childLevel] - ACCESS_PRIORITY[parentLevel];
  if (diff > 0) return 'upgrade';
  if (diff < 0) return 'downgrade';
  return null;
}

// ============================================================================
// Component
// ============================================================================

export const ViewRowsSection = React.memo(function ViewRowsSection({
  subcategory,
  views,
  accessMatrix,
  accessMatrixMap,
  modifiedCells,
  onToggleViewAccess,
  roleOrder,
  cellWidth,
  stickyLeftWidth,
}: ViewRowsSectionProps) {
  // Check if any role has an override for each view
  const viewOverrideStatus = useMemo(() => {
    const status: Record<string, boolean> = {};
    for (const view of views) {
      status[view.id] = accessMatrix.some(
        m => m.viewOverrides[view.id] !== undefined,
      );
    }
    return status;
  }, [views, accessMatrix]);

  return (
    <div className="border-t border-gray-100 bg-slate-50/30">
      {/* Subcategory default label row */}
      <div className="flex items-center border-b border-gray-100 bg-indigo-50/40">
        <div
          className={`${stickyLeftWidth} sticky left-0 z-10 border-r border-gray-200 bg-indigo-50/40`}
          style={{ backgroundClip: 'padding-box' }}
        >
          <div className="px-3 py-1.5 pl-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-indigo-500">📁</span>
              <span className="text-[10px] font-semibold text-indigo-600">
                {subcategory.subcategoryName} (서브카테고리 기본값)
              </span>
            </div>
            <span className="text-[9px] text-gray-400 pl-5">
              하위 {subcategory.viewCount}개 뷰에 일괄 적용됩니다
            </span>
          </div>
        </div>
        <div className="flex">
          {roleOrder.map(role => (
            <div
              key={role}
              className={`${cellWidth} h-8 border-r border-gray-100 last:border-r-0 bg-indigo-50/40`}
            />
          ))}
        </div>
      </div>

      {/* Individual view rows */}
      {views.map((view, viewIdx) => {
        const hasAnyOverride = viewOverrideStatus[view.id];

        return (
          <div
            key={view.id}
            className={`flex items-center ${
              viewIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
            } hover:bg-blue-50/20 transition-colors`}
          >
            {/* Sticky left: view info */}
            <div
              className={`${stickyLeftWidth} sticky left-0 z-10 border-r border-gray-200 flex items-center ${
                viewIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
              }`}
              style={{ backgroundClip: 'padding-box' }}
            >
              {/* View name (indented) */}
              <div className="flex-1 px-3 py-1 border-r border-gray-100 pl-10">
                <div className="text-[11px] text-gray-600 font-mono leading-tight">
                  {view.viewName}
                </div>
                <div className="text-[9px] text-gray-400">{view.displayName}</div>
              </div>

              {/* Override indicator (in place of view count column) */}
              <div className="w-12 flex items-center justify-center border-r border-gray-100">
                {/* empty — no view count for individual views */}
              </div>

              {/* Inheritance status badge (in place of sensitivity column) */}
              <div className="w-16 flex items-center justify-center">
                {hasAnyOverride ? (
                  <span className="text-[8px] px-1 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium whitespace-nowrap">
                    오버라이드
                  </span>
                ) : (
                  <span className="text-[8px] px-1 py-0.5 rounded-full bg-gray-50 text-gray-400 whitespace-nowrap">
                    상속됨
                  </span>
                )}
              </div>
            </div>

            {/* Access cells */}
            <div className="flex items-center">
              {roleOrder.map(role => {
                const matrix = accessMatrixMap.get(role);
                if (!matrix) return null;

                const { level, isOverride } = resolveViewAccessLevel(
                  matrix,
                  subcategory.id,
                  view.id,
                );
                const subcatDefault =
                  matrix.subcategoryAccess[subcategory.id] ?? 'no_access';
                const direction = isOverride
                  ? getOverrideDirection(subcatDefault, level)
                  : null;
                const isModified = modifiedCells.has(`${role}:view:${view.id}`);

                return (
                  <div
                    key={role}
                    className={`${cellWidth} relative flex items-center justify-center py-1 border-r border-gray-100 last:border-r-0 ${
                      direction === 'upgrade'
                        ? 'bg-green-50/60'
                        : direction === 'downgrade'
                          ? 'bg-red-50/60'
                          : ''
                    }`}
                  >
                    {direction && (
                      <span
                        aria-hidden="true"
                        className={`absolute top-0.5 right-0.5 text-[7px] leading-none font-bold ${
                          direction === 'upgrade' ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {direction === 'upgrade' ? '▲' : '▼'}
                      </span>
                    )}
                    <AccessMatrixCell
                      level={level}
                      isModified={isModified}
                      isOverride={isOverride}
                      inheritedLevel={subcatDefault}
                      onLevelSelect={newLevel =>
                        onToggleViewAccess(role, view.id, subcategory.id, newLevel)
                      }
                      onRevertToInherited={() =>
                        onToggleViewAccess(
                          role,
                          view.id,
                          subcategory.id,
                          subcatDefault,
                        )
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
});
