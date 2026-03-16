import React, { useState, useCallback } from 'react';
import { Database, Filter, Lock } from '../../icons';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../ui/tabs';
import type { UserRole, OrgAttributeType, MaskingType } from '../../../types';
import { TableAccessLayer } from './components/TableAccessLayer';
import { RowSecurityLayer } from './components/RowSecurityLayer';
import { ColumnMaskingLayer } from './components/ColumnMaskingLayer';
import {
  ERP_VIEW_TABLES,
  INITIAL_TABLE_ACCESS,
  ORG_UNITS,
  ROW_FILTER_RULES,
  COLUMN_MASK_POLICIES,
  getMaskingExample,
} from './permissionSettingsData';

export function PermissionSettingsView() {
  // Layer 1 state
  const [tableAccess, setTableAccess] = useState(
    () => structuredClone(INITIAL_TABLE_ACCESS),
  );

  // Layer 2 state
  const [rowRules, setRowRules] = useState(
    () => structuredClone(ROW_FILTER_RULES),
  );

  // Layer 3 state
  const [maskPolicies, setMaskPolicies] = useState(
    () => structuredClone(COLUMN_MASK_POLICIES),
  );

  // Layer 1 handler
  const handleToggleTableAccess = useCallback(
    (role: UserRole, tableId: string) => {
      setTableAccess(prev =>
        prev.map(policy => {
          if (policy.role !== role) return policy;
          const has = policy.allowedTableIds.includes(tableId);
          return {
            ...policy,
            allowedTableIds: has
              ? policy.allowedTableIds.filter(id => id !== tableId)
              : [...policy.allowedTableIds, tableId],
          };
        }),
      );
    },
    [],
  );

  // Layer 2 handler
  const handleUpdateRowRule = useCallback(
    (role: UserRole, attributeType: OrgAttributeType, newOrgUnitIds: string[]) => {
      setRowRules(prev =>
        prev.map(rule => {
          if (rule.role !== role || rule.attributeType !== attributeType) return rule;
          return { ...rule, allowedOrgUnitIds: newOrgUnitIds };
        }),
      );
    },
    [],
  );

  // Layer 3 handler
  const handleUpdateMaskPolicy = useCallback(
    (policyId: string, role: UserRole, maskingType: MaskingType) => {
      setMaskPolicies(prev =>
        prev.map(policy => {
          if (policy.id !== policyId) return policy;
          return {
            ...policy,
            maskingRules: policy.maskingRules.map(rule =>
              rule.role === role
                ? {
                    ...rule,
                    maskingType,
                    maskingExample: getMaskingExample(policy.columnName, maskingType),
                  }
                : rule,
            ),
          };
        }),
      );
    },
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900">데이터 접근 제어</h3>
        <p className="text-sm text-gray-500 mt-1">
          ERP 뷰 테이블 접근, 행 수준 필터, 컬럼 마스킹 정책을 관리합니다.
        </p>
      </div>

      <Tabs defaultValue="table-access">
        <TabsList className="bg-gray-100 p-1 rounded-lg h-auto">
          <TabsTrigger
            value="table-access"
            className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2"
          >
            <Database size={14} /> 테이블 접근
          </TabsTrigger>
          <TabsTrigger
            value="row-security"
            className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2"
          >
            <Filter size={14} /> 행 수준 보안
          </TabsTrigger>
          <TabsTrigger
            value="column-masking"
            className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2"
          >
            <Lock size={14} /> 컬럼 마스킹
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table-access" className="mt-6">
          <TableAccessLayer
            tables={ERP_VIEW_TABLES}
            policies={tableAccess}
            onToggle={handleToggleTableAccess}
          />
        </TabsContent>

        <TabsContent value="row-security" className="mt-6">
          <RowSecurityLayer
            orgUnits={ORG_UNITS}
            rules={rowRules}
            onUpdateRule={handleUpdateRowRule}
          />
        </TabsContent>

        <TabsContent value="column-masking" className="mt-6">
          <ColumnMaskingLayer
            tables={ERP_VIEW_TABLES}
            policies={maskPolicies}
            onUpdatePolicy={handleUpdateMaskPolicy}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
