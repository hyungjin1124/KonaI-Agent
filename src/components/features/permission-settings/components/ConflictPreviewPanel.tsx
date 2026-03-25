'use client';

import { useState, useMemo, useCallback } from 'react';

import type {
  DomainRole,
  ResolvedEffectivePolicy,
  AccessLevel,
  SensitiveColumnCategory,
} from '../../../../types';
import {
  ROLE_LABEL_MAP,
  VIEW_SUBCATEGORIES,
  MODULE_DEFINITIONS,
  ACCESS_LEVEL_DISPLAY,
} from '../data/viewTableData';
import {
  MASKING_TYPE_LABELS,
  SENSITIVE_CATEGORY_LABELS,
} from '../permissionSettingsData';

const MASKING_BADGE_CLASS: Record<'full' | 'partial' | 'hidden', string> = {
  full:    'bg-green-50 text-green-700',
  partial: 'bg-amber-50 text-amber-700',
  hidden:  'bg-red-50 text-red-600',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ConflictPreviewPanelProps {
  selectedRoles: DomainRole[];
  result: ResolvedEffectivePolicy | null;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">{title}</h4>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

interface AccessLevelBadgeProps {
  level: AccessLevel;
}

function AccessLevelBadge({ level }: AccessLevelBadgeProps) {
  const display = ACCESS_LEVEL_DISPLAY[level];
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${display.color} ${display.bgColor}`}
    >
      <span>{display.icon}</span>
      <span>{display.label}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Sections inside result view
// ---------------------------------------------------------------------------

interface TableAccessSummaryProps {
  subcategoryAccess: Record<string, AccessLevel>;
}

function TableAccessSummary({ subcategoryAccess }: TableAccessSummaryProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const moduleStats = useMemo(() => {
    return MODULE_DEFINITIONS.map((mod) => {
      const subcats = VIEW_SUBCATEGORIES.filter((s) => s.moduleCode === mod.code);
      const accessible = subcats.filter((s) => {
        const level = subcategoryAccess[s.id];
        return level && level !== 'no_access';
      });
      return {
        mod,
        subcats,
        accessibleCount: accessible.length,
        total: subcats.length,
      };
    }).filter((entry) => entry.total > 0);
  }, [subcategoryAccess]);

  const toggleModule = useCallback((code: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }, []);

  return (
    <div className="space-y-1">
      {moduleStats.map(({ mod, subcats, accessibleCount, total }) => {
        const isExpanded = expandedModules.has(mod.code);
        const allAccessible = accessibleCount === total;
        const noneAccessible = accessibleCount === 0;

        return (
          <div key={mod.code} className="border border-gray-100 rounded-md overflow-hidden">
            {/* Module row */}
            <button
              type="button"
              onClick={() => toggleModule(mod.code)}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    noneAccessible
                      ? 'bg-red-400'
                      : allAccessible
                        ? 'bg-green-500'
                        : 'bg-amber-400'
                  }`}
                />
                <span className="text-sm font-medium text-gray-800 truncate">{mod.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span
                  className={`text-xs font-mono ${
                    noneAccessible
                      ? 'text-red-500'
                      : allAccessible
                        ? 'text-green-600'
                        : 'text-amber-600'
                  }`}
                >
                  {accessibleCount}/{total} 접근 가능
                </span>
                <span
                  aria-hidden="true"
                  className={`text-gray-400 text-xs transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`}
                >
                  ▾
                </span>
              </div>
            </button>

            {/* Subcategory detail */}
            {isExpanded && (
              <div className="border-t border-gray-100 divide-y divide-gray-50 bg-white">
                {subcats.map((sub) => {
                  const level = subcategoryAccess[sub.id] ?? 'no_access';
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between px-4 py-1.5"
                    >
                      <span className="text-xs text-gray-600">{sub.subcategoryName}</span>
                      <AccessLevelBadge level={level} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface ColumnMaskingSectionProps {
  columnMasking: Record<SensitiveColumnCategory, 'full' | 'partial' | 'hidden'>;
}

function ColumnMaskingSection({ columnMasking }: ColumnMaskingSectionProps) {
  const categories = Object.keys(SENSITIVE_CATEGORY_LABELS) as SensitiveColumnCategory[];

  return (
    <div className="space-y-1.5">
      {categories.map((cat) => {
        const maskType = columnMasking[cat];
        return (
          <div
            key={cat}
            className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-gray-50"
          >
            <span className="text-sm text-gray-700">{SENSITIVE_CATEGORY_LABELS[cat]}</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${MASKING_BADGE_CLASS[maskType]}`}
            >
              {MASKING_TYPE_LABELS[maskType]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ConflictPreviewPanel({
  selectedRoles,
  result,
}: ConflictPreviewPanelProps) {
  return (
    <div className="space-y-2">
      {/* Selected role summary */}
      {selectedRoles.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">적용 역할</span>
          {selectedRoles.map(role => (
            <span
              key={role}
              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200"
            >
              {ROLE_LABEL_MAP[role] ?? role}
            </span>
          ))}
        </div>
      )}

      {result === null ? (
        <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <div className="text-2xl mb-2 text-gray-300" aria-hidden="true">⊕</div>
          <p className="text-xs text-gray-400">
            역할을 선택하면 통합 권한을 미리 볼 수 있습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Audit warning banner */}
          {result.auditWarning && (
            <div className="flex gap-2 items-start px-3 py-2.5 rounded-lg border border-amber-300 bg-amber-50">
              <span className="text-amber-500 text-sm shrink-0 mt-0.5" aria-hidden="true">⚠️</span>
              <p className="text-xs text-amber-800 leading-relaxed">
                <span className="font-bold">감사 강화: </span>
                {(() => {
                  const hrRoles = selectedRoles.filter(r => r.includes('HR'));
                  const nonHrRoles = selectedRoles.filter(r => !r.includes('HR'));
                  const hrNames = hrRoles.map(r => ROLE_LABEL_MAP[r] ?? r).join(', ');
                  const nonHrNames = nonHrRoles.map(r => ROLE_LABEL_MAP[r] ?? r).join(', ');
                  return hrRoles.length > 0 && nonHrRoles.length > 0
                    ? `${hrNames} 역할과 ${nonHrNames} 역할이 동시 할당됨`
                    : `${selectedRoles.map(r => ROLE_LABEL_MAP[r] ?? r).join(', ')} 역할 조합 시 감사 강화 대상`;
                })()}
              </p>
            </div>
          )}

          {/* Section A: 테이블 접근 요약 */}
          <Section title="테이블 접근 요약">
            <TableAccessSummary subcategoryAccess={result.subcategoryAccess} />
          </Section>

          {/* Section B: 데이터 범위 */}
          <Section title="데이터 범위">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">행 접근 범위:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
                {result.rowScope}
              </span>
            </div>
          </Section>

          {/* Section C: RLS 필터 */}
          <Section title="RLS 필터">
            {result.rowFilters.length === 0 ? (
              <p className="text-xs text-gray-400 italic">필터 없음 (전체 접근)</p>
            ) : (
              <div className="space-y-1.5">
                {result.rowFilters.map((filter, idx) => (
                  <div key={filter}>
                    {idx > 0 && (
                      <div className="flex items-center gap-1.5 my-1">
                        <div className="flex-1 border-t border-gray-200" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase">OR</span>
                        <div className="flex-1 border-t border-gray-200" />
                      </div>
                    )}
                    <pre className="text-[11px] font-mono bg-gray-900 text-green-400 px-2.5 py-2 rounded-md overflow-x-auto overflow-y-auto max-h-20 whitespace-pre-wrap break-all leading-relaxed">
                      {filter}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Section D: 컬럼 마스킹 */}
          <Section title="컬럼 마스킹">
            <ColumnMaskingSection columnMasking={result.columnMasking} />
          </Section>
        </div>
      )}
    </div>
  );
}
