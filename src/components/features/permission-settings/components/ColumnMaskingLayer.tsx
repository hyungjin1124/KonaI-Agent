import React, { useState, useMemo } from 'react';
import { Lock, ChevronDown, ChevronRight, Eye, EyeOff } from '../../../icons';
import { Badge } from '../../../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../../ui/collapsible';
import type { ErpViewTable, ColumnMaskPolicy, UserRole, MaskingType } from '../../../../types';
import { MASKING_TYPE_LABELS } from '../permissionSettingsData';

interface ColumnMaskingLayerProps {
  tables: ErpViewTable[];
  policies: ColumnMaskPolicy[];
  onUpdatePolicy: (policyId: string, role: UserRole, maskingType: MaskingType) => void;
}

const SENSITIVITY_STYLES: Record<string, string> = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-gray-50 text-gray-600 border-gray-200',
};

const SENSITIVITY_LABELS: Record<string, string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
};

const MASKING_TYPE_STYLES: Record<MaskingType, string> = {
  full: 'text-green-700',
  partial: 'text-amber-700',
  hidden: 'text-red-700',
};

function TableMaskSection({
  table,
  policies,
  onUpdatePolicy,
}: {
  table: ErpViewTable;
  policies: ColumnMaskPolicy[];
  onUpdatePolicy: (policyId: string, role: UserRole, maskingType: MaskingType) => void;
}) {
  const [open, setOpen] = useState(policies.length > 0);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors text-left">
        <div className="flex items-center gap-3">
          {open ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
          <span className="text-sm font-bold text-gray-900">{table.name}</span>
          <span className="text-xs text-gray-500">{table.displayName}</span>
        </div>
        <Badge variant="outline" className="text-xs">
          민감 컬럼 {policies.length}개
        </Badge>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-6 pb-4">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider w-44">
                    컬럼
                  </TableHead>
                  <TableHead className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider w-32">
                    역할
                  </TableHead>
                  <TableHead className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider w-40">
                    마스킹 유형
                  </TableHead>
                  <TableHead className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    미리보기
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) =>
                  policy.maskingRules.map((rule, ruleIdx) => (
                    <TableRow key={`${policy.id}-${rule.role}`}>
                      {ruleIdx === 0 && (
                        <TableCell
                          className="px-4 py-3 align-top"
                          rowSpan={policy.maskingRules.length}
                        >
                          <div className="flex items-center gap-2">
                            <Lock
                              size={14}
                              className={policy.sensitivity === 'high' ? 'text-red-500' : 'text-amber-500'}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {policy.columnDisplayName}
                              </div>
                              <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                                {policy.columnName}
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-[10px] mt-1 ${SENSITIVITY_STYLES[policy.sensitivity]}`}
                              >
                                민감도: {SENSITIVITY_LABELS[policy.sensitivity]}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="px-4 py-3 text-sm text-gray-700">
                        {rule.role}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Select
                          value={rule.maskingType}
                          onValueChange={(value: MaskingType) =>
                            onUpdatePolicy(policy.id, rule.role, value)
                          }
                        >
                          <SelectTrigger className="h-8 w-36 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">
                              <span className="flex items-center gap-1.5">
                                <Eye size={12} className="text-green-600" />
                                {MASKING_TYPE_LABELS.full}
                              </span>
                            </SelectItem>
                            <SelectItem value="partial">
                              <span className="flex items-center gap-1.5">
                                <EyeOff size={12} className="text-amber-600" />
                                {MASKING_TYPE_LABELS.partial}
                              </span>
                            </SelectItem>
                            <SelectItem value="hidden">
                              <span className="flex items-center gap-1.5">
                                <EyeOff size={12} className="text-red-600" />
                                {MASKING_TYPE_LABELS.hidden}
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <code className={`text-sm font-mono ${MASKING_TYPE_STYLES[rule.maskingType]}`}>
                          {rule.maskingExample}
                        </code>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ColumnMaskingLayer({ tables, policies, onUpdatePolicy }: ColumnMaskingLayerProps) {
  const policiesByTable = useMemo(() => {
    const map: Record<string, ColumnMaskPolicy[]> = {};
    for (const policy of policies) {
      if (!map[policy.tableId]) map[policy.tableId] = [];
      map[policy.tableId].push(policy);
    }
    return map;
  }, [policies]);

  const tablesWithPolicies = useMemo(
    () => tables.filter(t => policiesByTable[t.id]?.length > 0),
    [tables, policiesByTable],
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <Lock size={16} className="text-gray-400" />
          <span className="text-sm font-bold text-gray-900">컬럼 마스킹 정책</span>
        </div>
        <p className="text-xs text-gray-500">
          Databricks 스타일: 민감 컬럼의 역할별 마스킹 정책. 쿼리 시점에 역할에 따라 컬럼 값이 마스킹됩니다.
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {tablesWithPolicies.map(table => (
          <TableMaskSection
            key={table.id}
            table={table}
            policies={policiesByTable[table.id]}
            onUpdatePolicy={onUpdatePolicy}
          />
        ))}
      </div>

      {tablesWithPolicies.length === 0 && (
        <div className="p-8 text-center text-gray-500 text-sm">
          마스킹 정책이 설정된 테이블이 없습니다.
        </div>
      )}
    </div>
  );
}
