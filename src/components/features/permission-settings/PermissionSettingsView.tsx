'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Database, Filter, Lock, UserCog, Users, Eye, X, Info, Save, FileText } from '../../icons';
import { ConfirmDialog } from '../../ui/confirm-dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../ui/tabs';
import type {
  DomainRole,
  AccessLevel,
  DomainAccessMatrix,
  RoleDefinition,
  OrgRoleMapping,
  RoleDomain,
  DomainRowFilterRule,
  DomainColumnMaskPolicy,
  PermissionAuditEntry,
  PermissionAuditAction,
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
  ROLE_DEFINITIONS,
  VIEW_SUBCATEGORIES,
} from './data/viewTableData';
import { VIEWS_BY_SUBCATEGORY } from './data/viewDefinitionData';
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

const AUDIT_ACTION_LABELS: Record<PermissionAuditAction, { label: string; color: string }> = {
  access_change:  { label: '접근 변경', color: 'bg-blue-100 text-blue-700' },
  view_override:  { label: '뷰 오버라이드', color: 'bg-indigo-100 text-indigo-700' },
  role_delete:    { label: '역할 삭제', color: 'bg-red-100 text-red-700' },
  rls_change:     { label: 'RLS 변경', color: 'bg-teal-100 text-teal-700' },
  mask_change:    { label: '마스킹 변경', color: 'bg-purple-100 text-purple-700' },
  role_change:    { label: '역할 정의 변경', color: 'bg-orange-100 text-orange-700' },
  mapping_change: { label: '매핑 변경', color: 'bg-amber-100 text-amber-700' },
  save:           { label: '저장', color: 'bg-green-100 text-green-700' },
  reset:          { label: '초기화', color: 'bg-gray-100 text-gray-600' },
};

function AuditActionBadge({ action }: { action: PermissionAuditAction }) {
  const config = AUDIT_ACTION_LABELS[action];
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${config.color}`}>
      {config.label}
    </span>
  );
}

const DOMAIN_ORDER: RoleDomain[] = ['exec', 'fin', 'hr', 'sales', 'pjt', 'prod', 'scm', 'sys'];

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
  amber:   { selected: 'bg-amber-100 text-amber-700 border-amber-300 ring-amber-300',      dot: 'bg-amber-500'   },
  lime:    { selected: 'bg-lime-100 text-lime-700 border-lime-300 ring-lime-300',          dot: 'bg-lime-500'    },
  green:   { selected: 'bg-green-100 text-green-700 border-green-300 ring-green-300',      dot: 'bg-green-500'   },
  red:     { selected: 'bg-red-100 text-red-700 border-red-300 ring-red-300',              dot: 'bg-red-500'     },
};

interface PermissionSettingsViewProps {
  onAccessMatrixChange?: (matrix: DomainAccessMatrix[]) => void;
}

const VALID_LAYERS = new Set([
  'role-definition', 'org-role-mapping', 'table-access',
  'row-security', 'column-masking', 'preview', 'audit-log',
]);

function getInitialLayer(): string {
  if (typeof window === 'undefined') return 'role-definition';
  const params = new URLSearchParams(window.location.search);
  const layer = params.get('layer');
  return layer && VALID_LAYERS.has(layer) ? layer : 'role-definition';
}

export function PermissionSettingsView({ onAccessMatrixChange }: PermissionSettingsViewProps = {}) {
  // Active tab for controlled navigation — initialized from URL ?layer= param
  const [activeTab, setActiveTabRaw] = useState(getInitialLayer);

  // Sync activeTab to URL ?layer= search param
  const setActiveTab = useCallback((layer: string) => {
    setActiveTabRaw(layer);
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (layer === 'role-definition') {
      params.delete('layer');
    } else {
      params.set('layer', layer);
    }
    const qs = params.toString();
    window.history.replaceState({}, '', qs ? `?${qs}` : window.location.pathname);
  }, []);

  // Onboarding guide banner
  const [showGuide, setShowGuide] = useState(true);

  // Access matrix state — 15 roles × 43 subcategories
  const [accessMatrix, setAccessMatrix] = useState<DomainAccessMatrix[]>(
    () => structuredClone(DEFAULT_ACCESS_MATRIX),
  );

  // Notify parent when access matrix changes
  useEffect(() => {
    onAccessMatrixChange?.(accessMatrix);
  }, [accessMatrix, onAccessMatrixChange]);

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

  // Collapsible audit trail panel (quick-access summary below tab content)
  const [showAuditLog, setShowAuditLog] = useState(false);

  // Preview tab — selected roles
  const [previewRoles, setPreviewRoles] = useState<DomainRole[]>([]);

  // Audit log — tracks all permission changes within this session
  const [auditLog, setAuditLog] = useState<PermissionAuditEntry[]>([]);
  const auditIdRef = useRef(0);
  const accessMatrixRef = useRef(accessMatrix);
  accessMatrixRef.current = accessMatrix;

  const addAuditEntry = useCallback((
    action: PermissionAuditAction,
    target: string,
    detail: string,
    oldValue?: string,
    newValue?: string,
  ) => {
    auditIdRef.current += 1;
    const entry: PermissionAuditEntry = {
      id: `audit-${auditIdRef.current}`,
      timestamp: new Date().toISOString(),
      actor: 'admin@konai.com',
      action,
      target,
      detail,
      oldValue,
      newValue,
    };
    setAuditLog(prev => [entry, ...prev]);
  }, []);

  // When role definitions change, auto-create access matrix rows for new roles
  const handleRoleDefinitionsChange = useCallback((newDefs: RoleDefinition[]) => {
    setRoleDefinitions(newDefs);
    const existingRoles = new Set(accessMatrix.map(m => m.role));
    for (const rd of newDefs) {
      if (!existingRoles.has(rd.role)) {
        const defaultAccess: Record<string, AccessLevel> = {};
        for (const subcat of VIEW_SUBCATEGORIES) {
          defaultAccess[subcat.id] = 'no_access';
        }
        setAccessMatrix(prev => [...prev, {
          role: rd.role,
          subcategoryAccess: defaultAccess,
          viewOverrides: {},
        }]);
        addAuditEntry('role_change', rd.role, `새 역할 추가 — 접근 매트릭스 기본 행 생성 (no_access)`);
      }
    }
  }, [accessMatrix, addAuditEntry]);

  // Dirty tracking — any data change since last "save"
  const [savedSnapshot, setSavedSnapshot] = useState(() => ({
    matrix: JSON.stringify(DEFAULT_ACCESS_MATRIX),
    roles: JSON.stringify(ROLE_DEFINITIONS),
    mappings: JSON.stringify(ORG_ROLE_MAPPINGS),
    rls: JSON.stringify(DOMAIN_ROW_FILTER_RULES),
    mask: JSON.stringify(DOMAIN_COLUMN_MASK_POLICIES),
  }));

  const isDirty = useMemo(() => {
    if (JSON.stringify(roleDefinitions) !== savedSnapshot.roles) return true;
    if (JSON.stringify(orgRoleMappings) !== savedSnapshot.mappings) return true;
    if (JSON.stringify(rlsRules) !== savedSnapshot.rls) return true;
    if (JSON.stringify(maskPolicies) !== savedSnapshot.mask) return true;
    if (modifiedCells.size > 0) return true;
    return false;
  }, [roleDefinitions, orgRoleMappings, rlsRules, maskPolicies, modifiedCells, savedSnapshot]);

  const [saveToastMsg, setSaveToastMsg] = useState('');

  // beforeunload warning when dirty
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const handleSaveAll = useCallback(() => {
    // In a real app, this would call the API. For now, snapshot current state as "saved".
    setSavedSnapshot({
      matrix: JSON.stringify(accessMatrix),
      roles: JSON.stringify(roleDefinitions),
      mappings: JSON.stringify(orgRoleMappings),
      rls: JSON.stringify(rlsRules),
      mask: JSON.stringify(maskPolicies),
    });
    setModifiedCells(new Set());
    addAuditEntry('save', '전체 설정', '모든 권한 설정 저장');
    setSaveToastMsg('모든 권한 설정이 저장되었습니다.');
    setTimeout(() => setSaveToastMsg(''), 2000);
  }, [accessMatrix, roleDefinitions, orgRoleMappings, rlsRules, maskPolicies, addAuditEntry]);

  // Matrix cell toggle handler — subcategory level
  const handleToggleAccess = useCallback(
    (role: DomainRole, subcategoryId: string, newLevel: AccessLevel) => {
      const oldLevel = accessMatrixRef.current.find(m => m.role === role)?.subcategoryAccess[subcategoryId] ?? 'no_access';
      setAccessMatrix(prev =>
        prev.map(matrix => {
          if (matrix.role !== role) return matrix;
          // Clean up view overrides that now match the new subcategory default
          const newOverrides = { ...matrix.viewOverrides };
          const viewsInSubcat = VIEWS_BY_SUBCATEGORY[subcategoryId] ?? [];
          for (const view of viewsInSubcat) {
            if (newOverrides[view.id] === newLevel) {
              delete newOverrides[view.id];
            }
          }
          return {
            ...matrix,
            subcategoryAccess: {
              ...matrix.subcategoryAccess,
              [subcategoryId]: newLevel,
            },
            viewOverrides: newOverrides,
          };
        }),
      );
      setModifiedCells(prev => {
        const next = new Set(prev);
        next.add(`${role}:${subcategoryId}`);
        return next;
      });
      if (oldLevel !== newLevel) {
        addAuditEntry('access_change', `${role} / ${subcategoryId}`, `서브카테고리 접근 수준 변경`, oldLevel, newLevel);
      }
    },
    [addAuditEntry],
  );

  // View-level override toggle handler
  const handleToggleViewAccess = useCallback(
    (role: DomainRole, viewId: string, subcategoryId: string, newLevel: AccessLevel) => {
      const matrix = accessMatrixRef.current.find(m => m.role === role);
      const oldLevel = matrix?.viewOverrides[viewId] ?? matrix?.subcategoryAccess[subcategoryId] ?? 'no_access';
      setAccessMatrix(prev =>
        prev.map(m => {
          if (m.role !== role) return m;
          const subcatDefault = m.subcategoryAccess[subcategoryId] ?? 'no_access';
          const newOverrides = { ...m.viewOverrides };
          // If new level matches subcategory default, remove override (revert to inheritance)
          if (newLevel === subcatDefault) {
            delete newOverrides[viewId];
          } else {
            newOverrides[viewId] = newLevel;
          }
          return { ...m, viewOverrides: newOverrides };
        }),
      );
      setModifiedCells(prev => {
        const next = new Set(prev);
        next.add(`${role}:view:${viewId}`);
        return next;
      });
      if (oldLevel !== newLevel) {
        addAuditEntry('view_override', `${role} / ${viewId}`, `뷰 수준 오버라이드 변경`, oldLevel, newLevel);
      }
    },
    [addAuditEntry],
  );

  // Reset to defaults
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const handleResetToDefault = useCallback(() => {
    setResetConfirmOpen(true);
  }, []);
  const confirmReset = useCallback(() => {
    setAccessMatrix(structuredClone(DEFAULT_ACCESS_MATRIX));
    setModifiedCells(new Set());
    addAuditEntry('reset', '접근 매트릭스', '테이블 접근 매트릭스 기본값 초기화');
    setResetConfirmOpen(false);
  }, [addAuditEntry]);

  // Cascade cleanup when a role is deleted
  const handleRoleDeleted = useCallback((deletedRole: DomainRole) => {
    // Remove from org-role mappings (clear primaryRole or additionalRole references)
    setOrgRoleMappings(prev =>
      prev.filter(m => m.primaryRole !== deletedRole).map(m => ({
        ...m,
        additionalRole: m.additionalRole === deletedRole ? undefined : m.additionalRole,
      })),
    );
    // Remove from access matrix
    setAccessMatrix(prev => prev.filter(m => m.role !== deletedRole));
    // Remove from RLS rules
    setRlsRules(prev => prev.filter(r => r.role !== deletedRole));
    // Remove from masking policy exposedRoles
    setMaskPolicies(prev =>
      prev.map(p => ({
        ...p,
        exposedRoles: p.exposedRoles.filter(r => r !== deletedRole),
      })),
    );
    addAuditEntry('role_delete', deletedRole, `역할 삭제 및 연쇄 참조 정리`);
  }, [addAuditEntry]);

  // Build role→access map for conflict engine
  const roleAccessMap = useMemo(() => {
    const map = {} as Record<DomainRole, Record<string, AccessLevel>>;
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

  const groupedRoles = useMemo(() => {
    const map: Partial<Record<RoleDomain, typeof DOMAIN_ROLE_DEFINITIONS>> = {};
    for (const def of DOMAIN_ROLE_DEFINITIONS) {
      if (!map[def.domain]) map[def.domain] = [];
      map[def.domain]!.push(def);
    }
    return map;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">데이터 접근 제어</h2>
        <p className="text-sm text-gray-500 mt-1">
          345개 ERP 뷰 × 15개 역할 × 3-Layer 보안 정책을 관리합니다.
        </p>
      </div>

      {/* Onboarding guide banner */}
      {showGuide && (
        <div className="relative flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info size={16} className="text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs text-blue-800 leading-relaxed">
            <span className="font-bold">권장 설정 순서: </span>
            <span className="font-medium">1. 역할 정의</span> → <span className="font-medium">2. 조직-역할 매핑</span> → <span className="font-medium">3. 테이블 접근 매트릭스</span> → 4. RLS/마스킹 → 5. 통합 미리보기
          </div>
          <button
            type="button"
            onClick={() => setShowGuide(false)}
            className="shrink-0 text-blue-400 hover:text-blue-600"
            aria-label="가이드 닫기"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main tabs — full width */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList aria-label="권한 설정 메뉴" className="bg-gray-100 p-1 rounded-lg h-auto flex-wrap">
          <TabsTrigger
            value="role-definition"
            className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2"
          >
            <UserCog size={14} aria-hidden="true" /> 역할 정의
          </TabsTrigger>
          <TabsTrigger
            value="org-role-mapping"
            className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2"
          >
            <Users size={14} aria-hidden="true" /> 조직-역할 매핑
          </TabsTrigger>
          <TabsTrigger
            value="table-access"
            className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2"
          >
            <Database size={14} aria-hidden="true" /> 테이블 접근 매트릭스
          </TabsTrigger>
          <TabsTrigger
            value="row-security"
            className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2"
          >
            <Filter size={14} aria-hidden="true" /> 행 수준 보안(RLS)
          </TabsTrigger>
          <TabsTrigger
            value="column-masking"
            className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2"
          >
            <Lock size={14} aria-hidden="true" /> 컬럼 마스킹
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2"
          >
            <Eye size={14} aria-hidden="true" /> 통합 권한 미리보기
          </TabsTrigger>
          <TabsTrigger
            value="audit-log"
            className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2"
          >
            <FileText size={14} aria-hidden="true" /> 감사 로그
            {auditLog.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-gray-200 text-gray-600 rounded-full">
                {auditLog.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="role-definition" className="mt-6">
          <RoleDefinitionManager
            roleDefinitions={roleDefinitions}
            onRoleDefinitionsChange={handleRoleDefinitionsChange}
            orgRoleMappings={orgRoleMappings}
            onRoleDeleted={handleRoleDeleted}
          />
        </TabsContent>

        <TabsContent value="org-role-mapping" className="mt-6">
          <OrgRoleMappingManager
            mappings={orgRoleMappings}
            onMappingsChange={setOrgRoleMappings}
            roleLabelMap={roleLabelMap}
            allRoles={[...DOMAIN_ROLES]}
            onNavigateToTab={setActiveTab}
          />
        </TabsContent>

        <TabsContent value="table-access" className="mt-6">
          <TableAccessLayer
            accessMatrix={accessMatrix}
            modifiedCells={modifiedCells}
            onToggleAccess={handleToggleAccess}
            onToggleViewAccess={handleToggleViewAccess}
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
        <TabsContent value="preview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            {/* Left: Role selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-700">역할 선택</p>
                {previewRoles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPreviewRoles([])}
                    className="text-xs text-gray-400 hover:text-gray-600 font-medium"
                  >
                    초기화
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {DOMAIN_ORDER.map(domain => {
                  const roles = groupedRoles[domain];
                  if (!roles || roles.length === 0) return null;
                  const labelId = `domain-label-${domain}`;
                  return (
                    <div key={domain} role="group" aria-labelledby={labelId}>
                      <div id={labelId} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
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
                              aria-pressed={isSelected}
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
            </div>

            {/* Right: Result panel */}
            <div>
              <ConflictPreviewPanel
                selectedRoles={previewRoles}
                result={previewResult}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit-log" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">권한 변경 감사 로그</h3>
                <p className="text-xs text-gray-500 mt-0.5">이 세션에서 발생한 모든 권한 변경 이력을 추적합니다.</p>
              </div>
              {auditLog.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAuditLog([])}
                  className="text-xs text-gray-400 hover:text-gray-600 font-medium"
                >
                  로그 초기화
                </button>
              )}
            </div>

            {auditLog.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FileText size={32} className="mb-3 opacity-40" />
                <p className="text-sm font-medium">변경 이력이 없습니다</p>
                <p className="text-xs mt-1">권한 설정을 변경하면 이곳에 자동으로 기록됩니다.</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-[480px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-2.5 font-bold text-gray-600 w-[140px]">시간</th>
                        <th className="text-left px-4 py-2.5 font-bold text-gray-600 w-[100px]">작업</th>
                        <th className="text-left px-4 py-2.5 font-bold text-gray-600">대상</th>
                        <th className="text-left px-4 py-2.5 font-bold text-gray-600">설명</th>
                        <th className="text-left px-4 py-2.5 font-bold text-gray-600 w-[100px]">변경 전</th>
                        <th className="text-left px-4 py-2.5 font-bold text-gray-600 w-[100px]">변경 후</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {auditLog.map(entry => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-500 font-mono whitespace-nowrap">
                            {new Date(entry.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="px-4 py-2">
                            <AuditActionBadge action={entry.action} />
                          </td>
                          <td className="px-4 py-2 text-gray-700 font-medium max-w-[200px] truncate" title={entry.target}>
                            {entry.target}
                          </td>
                          <td className="px-4 py-2 text-gray-600">{entry.detail}</td>
                          <td className="px-4 py-2">
                            {entry.oldValue && (
                              <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded font-mono">{entry.oldValue}</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {entry.newValue && (
                              <span className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded font-mono">{entry.newValue}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Collapsible audit trail — quick-access summary */}
      {auditLog.length > 0 && (
        <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAuditLog(prev => !prev)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            <span>변경 이력 ({auditLog.length}건)</span>
            <span className="text-gray-400">{showAuditLog ? '접기' : '펼치기'}</span>
          </button>
          {showAuditLog && (
            <div className="max-h-[200px] overflow-y-auto divide-y divide-gray-100">
              {auditLog.map(entry => (
                <div key={entry.id} className="px-4 py-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <AuditActionBadge action={entry.action} />
                    <span className="font-medium text-gray-800">{entry.target}</span>
                    <span>—</span>
                    <span>{entry.detail}</span>
                    <span className="ml-auto text-gray-400 font-mono whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  {(entry.oldValue || entry.newValue) && (
                    <div className="mt-1 text-[11px] font-mono bg-gray-50 px-2 py-1 rounded flex items-center gap-2">
                      {entry.oldValue && (
                        <span className="px-1 py-0.5 bg-red-50 text-red-600 rounded">{entry.oldValue}</span>
                      )}
                      {entry.oldValue && entry.newValue && (
                        <span className="text-gray-400">→</span>
                      )}
                      {entry.newValue && (
                        <span className="px-1 py-0.5 bg-green-50 text-green-600 rounded">{entry.newValue}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sticky save bar — visible when dirty */}
      {isDirty && (
        <div className="sticky bottom-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3 bg-amber-50 border-t border-amber-200 shadow-lg">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            저장되지 않은 변경사항이 있습니다.
            {(() => {
              const changes: string[] = [];
              if (JSON.stringify(roleDefinitions) !== savedSnapshot.roles) changes.push('역할 정의');
              if (JSON.stringify(accessMatrix) !== savedSnapshot.matrix) changes.push(`매트릭스 ${modifiedCells.size}건`);
              if (JSON.stringify(orgRoleMappings) !== savedSnapshot.mappings) changes.push('조직-역할 매핑');
              if (JSON.stringify(rlsRules) !== savedSnapshot.rls) changes.push('RLS 규칙');
              if (JSON.stringify(maskPolicies) !== savedSnapshot.mask) changes.push('컬럼 마스킹');
              return changes.length > 0 ? (
                <span className="text-xs text-amber-600 ml-1">({changes.join(', ')})</span>
              ) : null;
            })()}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#534AB7] rounded-md hover:bg-[#4339a0] shadow-sm"
            >
              <Save size={13} />
              저장
            </button>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              초기화
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirm Dialog */}
      <ConfirmDialog
        open={resetConfirmOpen}
        title="접근 매트릭스 초기화"
        description="테이블 접근 매트릭스만 기본값으로 초기화됩니다. 역할 정의, 조직-역할 매핑, RLS 규칙, 컬럼 마스킹 설정은 유지됩니다."
        confirmLabel="초기화"
        destructive
        onConfirm={confirmReset}
        onCancel={() => setResetConfirmOpen(false)}
      />

      {/* Save toast */}
      {saveToastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-green-600 text-white text-sm rounded-lg shadow-lg animate-fade-in-up">
          {saveToastMsg}
        </div>
      )}
    </div>
  );
}

