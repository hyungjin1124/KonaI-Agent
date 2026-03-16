import React, { useState, useMemo } from 'react';
import { Filter, Plus, X, Code } from '../../../icons';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { Checkbox } from '../../../ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../ui/table';
import type { OrgUnit, RowFilterRule, UserRole, OrgAttributeType } from '../../../../types';
import { ORG_ATTRIBUTE_TYPES } from '../permissionSettingsData';

interface RowSecurityLayerProps {
  orgUnits: OrgUnit[];
  rules: RowFilterRule[];
  onUpdateRule: (role: UserRole, attributeType: OrgAttributeType, orgUnitIds: string[]) => void;
}

const ROLES: UserRole[] = ['Super Admin', 'Data Manager', 'Viewer'];

const ATTR_COLUMN_MAP: Record<OrgAttributeType, string> = {
  '부서코드': 'DEPT_CD',
  '사업영역': 'BIZ_AREA',
  '법인코드': 'COMP_CD',
};

function OrgUnitCell({
  role,
  attributeType,
  rule,
  orgUnits,
  onUpdate,
}: {
  role: UserRole;
  attributeType: OrgAttributeType;
  rule: RowFilterRule | undefined;
  orgUnits: OrgUnit[];
  onUpdate: (orgUnitIds: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const availableUnits = orgUnits.filter(u => u.type === attributeType);
  const selectedIds = rule?.allowedOrgUnitIds ?? [];
  const selectedUnits = availableUnits.filter(u => selectedIds.includes(u.id));

  const isAllSelected = selectedIds.length === availableUnits.length && availableUnits.length > 0;
  const isViewerAutoApply = role === 'Viewer' && selectedIds.length === 0;

  const handleToggle = (unitId: string) => {
    const newIds = selectedIds.includes(unitId)
      ? selectedIds.filter(id => id !== unitId)
      : [...selectedIds, unitId];
    onUpdate(newIds);
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      onUpdate([]);
    } else {
      onUpdate(availableUnits.map(u => u.id));
    }
  };

  // WHERE 절 미리보기
  const columnName = ATTR_COLUMN_MAP[attributeType];
  const whereClause = selectedIds.length > 0
    ? `WHERE ${columnName} IN (${selectedUnits.map(u => `'${u.code}'`).join(', ')})`
    : null;

  return (
    <TableCell className="px-4 py-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {isAllSelected && (
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
            전체 허용
          </Badge>
        )}

        {isViewerAutoApply && (
          <span className="text-xs text-gray-400 italic">소속 기준 자동</span>
        )}

        {!isAllSelected && selectedUnits.map(unit => (
          <Badge key={unit.id} variant="outline" className="text-xs font-medium">
            {unit.name}
          </Badge>
        ))}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-blue-600"
            >
              <Plus size={14} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <div className="p-3 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase">
                {attributeType} 선택
              </p>
            </div>
            <div className="p-2 space-y-1">
              {/* 전체 선택 */}
              <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium text-gray-700">전체 선택</span>
              </label>
              <div className="border-t border-gray-100 my-1" />
              {availableUnits.map(unit => (
                <label
                  key={unit.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedIds.includes(unit.id)}
                    onCheckedChange={() => handleToggle(unit.id)}
                  />
                  <div className="flex-1">
                    <span className="text-sm text-gray-700">{unit.name}</span>
                    <span className="text-xs text-gray-400 ml-1.5">{unit.code}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* WHERE 절 미리보기 */}
            {whereClause && (
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center gap-1.5 mb-1">
                  <Code size={12} className="text-gray-400" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Generated Filter</span>
                </div>
                <code className="text-[11px] text-blue-700 font-mono break-all leading-relaxed">
                  {whereClause}
                </code>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </TableCell>
  );
}

export function RowSecurityLayer({ orgUnits, rules, onUpdateRule }: RowSecurityLayerProps) {
  const ruleMap = useMemo(() => {
    const map: Record<string, RowFilterRule> = {};
    for (const rule of rules) {
      map[`${rule.role}__${rule.attributeType}`] = rule;
    }
    return map;
  }, [rules]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <Filter size={16} className="text-gray-400" />
          <span className="text-sm font-bold text-gray-900">행 수준 보안 규칙</span>
        </div>
        <p className="text-xs text-gray-500">
          SAP 파생 역할 + Snowflake 매핑 테이블 패턴: 역할별 조직 속성(부서/사업영역/법인) 기반 WHERE 조건 자동 삽입
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider w-40">
              역할
            </TableHead>
            {ORG_ATTRIBUTE_TYPES.map(attr => (
              <TableHead key={attr} className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div>
                  {attr}
                  <span className="block text-[10px] font-mono text-gray-400 font-normal mt-0.5">
                    {ATTR_COLUMN_MAP[attr]}
                  </span>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROLES.map(role => (
            <TableRow key={role}>
              <TableCell className="px-4 py-3 font-medium text-gray-900 text-sm">
                {role}
              </TableCell>
              {ORG_ATTRIBUTE_TYPES.map(attr => (
                <OrgUnitCell
                  key={`${role}__${attr}`}
                  role={role}
                  attributeType={attr}
                  rule={ruleMap[`${role}__${attr}`]}
                  orgUnits={orgUnits}
                  onUpdate={(ids) => onUpdateRule(role, attr, ids)}
                />
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-[11px] text-gray-400">
          * 속성 값이 비어있으면 해당 조직 수준은 필터링 없음 (전체 허용). Viewer 역할은 로그인 사용자 소속 기준 자동 적용.
        </p>
      </div>
    </div>
  );
}
