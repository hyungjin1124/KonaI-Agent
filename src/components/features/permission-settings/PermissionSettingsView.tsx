import React, { useState, useCallback, useMemo } from 'react';
import { Database, Filter, Lock, UserCog, Users, Eye, EyeOff } from '../../icons';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../../ui/sheet';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../ui/tabs';
import { Button } from '../../ui/button';
import type {
  DomainRole,
  AccessLevel,
  DomainAccessMatrix,
  RoleDefinition,
  OrgRoleMapping,
  RoleDomain,
  DomainRowFilterRule,
  DomainColumnMaskPolicy,
} from '../../../types';
import { DOMAIN_ROLES } from '../../../types';
import { TableAccessLayer } from './components/TableAccessLayer';
import { RowSecurityLayer } from './components/RowSecurityLayer';
import { ColumnMaskingLayer } from './components/ColumnMaskingLayer';
import { ConflictPreviewPanel } from './components/ConflictPreviewPanel';
import { RoleDefinitionManager } from './components/RoleDefinitionManager';
import { OrgRoleMappingManager } from './components/OrgRoleMappingManager';
import {
  DEFAULT_ACCESS_MATRIX,
  VIEW_SUBCATEGORIES,
  ROLE_DEFINITIONS,
} from './data/viewTableData';
import { ORG_ROLE_MAPPINGS } from './data/orgRoleMappingData';
import {
  DOMAIN_ROW_FILTER_RULES,
  DOMAIN_COLUMN_MASK_POLICIES,
  resolveEffectivePolicy,
} from './permissionSettingsData';
import {
  DOMAIN_ROLE_DEFINITIONS,
  ROLE_DOMAIN_LABELS,
} from '../user-management/data/userManagementData';

export function PermissionSettingsView() {
  // Access matrix state — 15 roles × 43 subcategories
  const [accessMatrix, setAccessMatrix] = useState<DomainAccessMatrix[]>(
    () => structuredClone(DEFAULT_ACCESS_MATRIX),
  );

  // Track modified cells for visual diff
  const [modifiedCells, setModifiedCells] = useState<Set<string>>(new Set());

  // Role definitions — mutable for CRUD
  const [roleDefinitions, setRoleDefinitions] = useState<RoleDefinition[]>(
    () => structuredClone(ROLE_DEFINITIONS),
  );

  // Org-role mappings — mutable for CRUD
  const [orgRoleMappings, setOrgRoleMappings] = useState<OrgRoleMapping[]>(
    () => structuredClone(ORG_ROLE_MAPPINGS),
  );

  // RLS rules — mutable for CRUD
  const [rlsRules, setRlsRules] = useState<DomainRowFilterRule[]>(
    () => structuredClone(DOMAIN_ROW_FILTER_RULES),
  );

  // Column masking policies — mutable for CRUD
  const [maskPolicies, setMaskPolicies] = useState<DomainColumnMaskPolicy[]>(
    () => structuredClone(DOMAIN_COLUMN_MASK_POLICIES),
  );

  // Derived role label map
  const roleLabelMap = useMemo(
    () => Object.fromEntries(roleDefinitions.map(r => [r.role, r.nameKo])) as Record<DomainRole, string>,
    [roleDefinitions],
  );

  // Sidebar — preview toggle & selected roles
  const [showPreview, setShowPreview] = useState(false);
  const [previewRoles, setPreviewRoles] = useState<DomainRole[]>([]);

  // Matrix cell toggle handler
  const handleToggleAccess = useCallback(
    (role: DomainRole, subcategoryId: string, newLevel: AccessLevel) => {
      setAccessMatrix(prev =>
        prev.map(matrix => {
          if (matrix.role !== role) return matrix;
          return {
            ...matrix,
            subcategoryAccess: {
              ...matrix.subcategoryAccess,
              [subcategoryId]: newLevel,
            },
          };
        }),
      );
      setModifiedCells(prev => {
        const next = new Set(prev);
        next.add(`${role}:${subcategoryId}`);
        return next;
      });
    },
    [],
  );

  // Reset to defaults
  const handleResetToDefault = useCallback(() => {
    setAccessMatrix(structuredClone(DEFAULT_ACCESS_MATRIX));
    setModifiedCells(new Set());
  }, []);

  // KPI stats
  const kpiStats = useMemo(() => {
    const totalCells = ROLE_DEFINITIONS.length * VIEW_SUBCATEGORIES.length;
    let accessibleCells = 0;
    for (const matrix of accessMatrix) {
      for (const level of Object.values(matrix.subcategoryAccess)) {
        if (level !== 'no_access') accessibleCells++;
      }
    }
    return {
      totalViews: VIEW_SUBCATEGORIES.reduce((sum, s) => sum + s.viewCount, 0),
      totalSubcategories: VIEW_SUBCATEGORIES.length,
      accessRate: Math.round((accessibleCells / totalCells) * 100),
      rlsRuleCount: rlsRules.length,
      maskPolicyCount: maskPolicies.length,
      modifiedCount: modifiedCells.size,
    };
  }, [accessMatrix, modifiedCells, rlsRules, maskPolicies]);

  // Build role→access map for conflict engine
  const roleAccessMap = useMemo(() => {
    const map: Record<DomainRole, Record<string, AccessLevel>> = {} as never;
    for (const m of accessMatrix) {
      map[m.role] = m.subcategoryAccess;
    }
    return map;
  }, [accessMatrix]);

  // Conflict preview result
  const previewResult = useMemo(() => {
    if (previewRoles.length === 0) return null;
    return resolveEffectivePolicy(
      previewRoles,
      roleAccessMap,
      rlsRules,
      maskPolicies,
    );
  }, [previewRoles, roleAccessMap, rlsRules, maskPolicies]);

  // Sidebar role toggle
  const handlePreviewRoleToggle = useCallback((role: DomainRole) => {
    setPreviewRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role],
    );
  }, []);

  const domainOrder: RoleDomain[] = ['exec', 'fin', 'hr', 'sales', 'pjt', 'prod', 'scm', 'sys'];

  const groupedRoles = useMemo(() => {
    const map: Partial<Record<RoleDomain, typeof DOMAIN_ROLE_DEFINITIONS>> = {};
    for (const def of DOMAIN_ROLE_DEFINITIONS) {
      if (!map[def.domain]) map[def.domain] = [];
      map[def.domain]!.push(def);
    }
    return map;
  }, []);

  const PILL_COLORS: Record<string, { selected: string; dot: string }> = {
    purple:  { selected: 'bg-purple-100 text-purple-700 border-purple-300 ring-purple-300',  dot: 'bg-purple-500'  },
    violet:  { selected: 'bg-violet-100 text-violet-700 border-violet-300 ring-violet-300',  dot: 'bg-violet-500'  },
    gray:    { selected: 'bg-gray-100 text-gray-600 border-gray-300 ring-gray-300',          dot: 'bg-gray-500'    },
    emerald: { selected: 'bg-emerald-100 text-emerald-700 border-emerald-300 ring-emerald-300', dot: 'bg-emerald-500' },
    teal:    { selected: 'bg-teal-100 text-teal-700 border-teal-300 ring-teal-300',          dot: 'bg-teal-500'    },
    pink:    { selected: 'bg-pink-100 text-pink-700 border-pink-300 ring-pink-300',          dot: 'bg-pink-500'    },
    rose:    { selected: 'bg-rose-100 text-rose-700 border-rose-300 ring-rose-300',          dot: 'bg-rose-500'    },
    blue:    { selected: 'bg-blue-100 text-blue-700 border-blue-300 ring-blue-300',          dot: 'bg-blue-500'    },
    sky:     { selected: 'bg-sky-100 text-sky-700 border-sky-300 ring-sky-300',              dot: 'bg-sky-500'     },
    indigo:  { selected: 'bg-indigo-100 text-indigo-700 border-indigo-300 ring-indigo-300',  dot: 'bg-indigo-500'  },
    orange:  { selected: 'bg-orange-100 text-orange-700 border-orange-300 ring-orange-300',  dot: 'bg-orange-500'  },
    amber:   { selected: 'bg-amber-100 text-amber-700 border-amber-300 ring-amber-300',     dot: 'bg-amber-500'   },
    lime:    { selected: 'bg-lime-100 text-lime-700 border-lime-300 ring-lime-300',          dot: 'bg-lime-500'    },
    green:   { selected: 'bg-green-100 text-green-700 border-green-300 ring-green-300',      dot: 'bg-green-500'   },
    red:     { selected: 'bg-red-100 text-red-700 border-red-300 ring-red-300',              dot: 'bg-red-500'     },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">데이터 접근 제어</h3>
          <p className="text-sm text-gray-500 mt-1">
            345개 ERP 뷰 × 15개 역할 × 3-Layer 보안 정책을 관리합니다.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(prev => !prev)}
          className={`gap-2 text-xs font-bold transition-colors ${
            showPreview
              ? 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800 hover:text-white'
              : 'hover:bg-gray-50'
          }`}
        >
          {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
          통합 권한 미리보기
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="활성 뷰" value={kpiStats.totalViews} unit="개" />
        <KpiCard label="서브카테고리" value={kpiStats.totalSubcategories} unit="개" />
        <KpiCard label="접근 허용률" value={kpiStats.accessRate} unit="%" />
        <KpiCard label="RLS 규칙" value={kpiStats.rlsRuleCount} unit="개" />
        <KpiCard label="마스킹 정책" value={kpiStats.maskPolicyCount} unit="개" />
        <KpiCard
          label="변경사항"
          value={kpiStats.modifiedCount}
          unit="건"
          highlight={kpiStats.modifiedCount > 0}
        />
      </div>

      {/* Main tabs — full width */}
      <Tabs defaultValue="role-definition">
        <TabsList className="bg-gray-100 p-1 rounded-lg h-auto flex-wrap">
          <TabsTrigger
            value="role-definition"
            className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2"
          >
            <UserCog size={14} /> 역할 정의
          </TabsTrigger>
          <TabsTrigger
            value="org-role-mapping"
            className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2"
          >
            <Users size={14} /> 조직-역할 매핑
          </TabsTrigger>
          <TabsTrigger
            value="table-access"
            className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2"
          >
            <Database size={14} /> 테이블 접근 매트릭스
          </TabsTrigger>
          <TabsTrigger
            value="row-security"
            className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2"
          >
            <Filter size={14} /> 행 수준 보안(RLS)
          </TabsTrigger>
          <TabsTrigger
            value="column-masking"
            className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2"
          >
            <Lock size={14} /> 컬럼 마스킹
          </TabsTrigger>
        </TabsList>

        <TabsContent value="role-definition" className="mt-6">
          <RoleDefinitionManager
            roleDefinitions={roleDefinitions}
            onRoleDefinitionsChange={setRoleDefinitions}
          />
        </TabsContent>

        <TabsContent value="org-role-mapping" className="mt-6">
          <OrgRoleMappingManager
            mappings={orgRoleMappings}
            onMappingsChange={setOrgRoleMappings}
            roleLabelMap={roleLabelMap}
            allRoles={[...DOMAIN_ROLES]}
          />
        </TabsContent>

        <TabsContent value="table-access" className="mt-6">
          <TableAccessLayer
            accessMatrix={accessMatrix}
            modifiedCells={modifiedCells}
            onToggleAccess={handleToggleAccess}
            onResetToDefault={handleResetToDefault}
          />
        </TabsContent>

        <TabsContent value="row-security" className="mt-6">
          <RowSecurityLayer
            rules={rlsRules}
            onRulesChange={setRlsRules}
            roleLabelMap={roleLabelMap}
          />
        </TabsContent>

        <TabsContent value="column-masking" className="mt-6">
          <ColumnMaskingLayer
            policies={maskPolicies}
            onPoliciesChange={setMaskPolicies}
            roleLabelMap={roleLabelMap}
          />
        </TabsContent>
      </Tabs>

      {/* Sheet: 통합 권한 미리보기 */}
      <Sheet open={showPreview} onOpenChange={setShowPreview}>
        <SheetContent side="right" className="sm:max-w-md w-full overflow-y-auto p-0">
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-sm font-bold text-gray-800">통합 권한 미리보기</SheetTitle>
              {previewRoles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPreviewRoles([])}
                  className="text-[11px] text-gray-400 hover:text-gray-600 font-medium"
                >
                  초기화
                </button>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              역할을 조합하여 실제 적용될 권한을 확인합니다.
            </p>
          </SheetHeader>

          <div className="p-5 space-y-4">
            {/* Domain-grouped role pills */}
            <div className="space-y-3">
              {domainOrder.map(domain => {
                const roles = groupedRoles[domain];
                if (!roles || roles.length === 0) return null;
                return (
                  <div key={domain}>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      {ROLE_DOMAIN_LABELS[domain] || domain}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {roles.map(role => {
                        const isSelected = previewRoles.includes(role.code);
                        const colors = PILL_COLORS[role.color] || PILL_COLORS.gray;
                        return (
                          <button
                            key={role.code}
                            type="button"
                            onClick={() => handlePreviewRoleToggle(role.code)}
                            title={role.description}
                            className={`
                              inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold
                              border transition-all cursor-pointer
                              ${isSelected
                                ? `${colors.selected} ring-2 ring-offset-1 shadow-sm`
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                              }
                            `}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                isSelected ? colors.dot : 'bg-gray-300'
                              }`}
                            />
                            {role.displayName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Result panel */}
            <ConflictPreviewPanel
              selectedRoles={previewRoles}
              result={previewResult}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function KpiCard({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: number;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        highlight ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'
      }`}
    >
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold mt-1">
        {value}
        <span className="text-xs text-gray-400 ml-1">{unit}</span>
      </p>
    </div>
  );
}
