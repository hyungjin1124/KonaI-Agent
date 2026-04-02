'use client';

import React, { useState, useCallback } from 'react';
import { Info, Pencil, ChevronRight, ChevronDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ViewTable, AccessTarget } from '../../types/data.types';
import { getCodeSecuRlsInfo, getRlsExample } from '../../data/viewTableMockData';

interface AccessPermissionTabProps {
  viewTable: ViewTable;
  accessTargets: AccessTarget[];
  onEditAccess: () => void;
}

const TYPE_BADGE_CLASSES: Record<string, string> = {
  '부서': 'border-blue-300 text-blue-700',
  '그룹': 'border-violet-300 text-violet-700',
  '사용자': 'border-amber-300 text-amber-700',
};

export function AccessPermissionTab({ viewTable, accessTargets, onEditAccess }: AccessPermissionTabProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showAllMembers, setShowAllMembers] = useState<Record<string, boolean>>({});

  const isErp = viewTable.sourceType === 'ERP';

  const toggleRow = useCallback((name: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const toggleShowAll = useCallback((name: string) => {
    setShowAllMembers((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const VISIBLE_MEMBERS = 5;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {/* 접근 가능 부서/그룹/사용자 */}
        <section>
          <h4 className="text-xs font-medium text-gray-500 mb-2">
            {isErp ? '접근 가능 부서/그룹/사용자' : '접근 가능 부서/사용자'}
          </h4>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead className="text-xs font-medium text-gray-500">대상</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 w-[60px]">유형</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 w-[60px]">인원</TableHead>
                <TableHead className="text-xs font-medium text-gray-500">권한 근거</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accessTargets.map((target) => {
                const isExpandable = target.type === '부서' || target.type === '그룹';
                const isExpanded = expandedRows.has(target.name);
                const members = target.members ?? [];
                const showAll = showAllMembers[target.name] ?? false;
                const visibleMembers = showAll ? members : members.slice(0, VISIBLE_MEMBERS);
                const hiddenCount = members.length - VISIBLE_MEMBERS;

                return (
                  <React.Fragment key={target.name}>
                    {/* Main row */}
                    <TableRow
                      className={isExpandable ? 'cursor-pointer hover:bg-gray-50/60' : ''}
                      onClick={isExpandable ? () => toggleRow(target.name) : undefined}
                    >
                      <TableCell className="py-2 text-sm text-gray-900">
                        <div className="flex items-center gap-1.5">
                          {isExpandable && (
                            isExpanded
                              ? <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                              : <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          )}
                          {target.name}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-normal ${TYPE_BADGE_CLASSES[target.type] ?? ''}`}
                        >
                          {target.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-xs text-gray-500 tabular-nums">
                        {isExpandable ? `${target.memberCount ?? 0}명` : '—'}
                      </TableCell>
                      <TableCell className="py-2 text-xs text-gray-500">
                        {target.basis}
                      </TableCell>
                    </TableRow>

                    {/* Expanded members */}
                    {isExpandable && isExpanded && members.length > 0 && (
                      <>
                        {visibleMembers.map((m) => (
                          <TableRow key={m.userId} className="bg-gray-50/40">
                            <TableCell colSpan={4} className="py-1.5 pl-10">
                              <span className="text-xs text-gray-700">{m.name}</span>
                              <span className="text-xs text-gray-400 ml-2">{m.department}</span>
                            </TableCell>
                          </TableRow>
                        ))}
                        {!showAll && hiddenCount > 0 && (
                          <TableRow className="bg-gray-50/40">
                            <TableCell colSpan={4} className="py-1.5 pl-10">
                              <button
                                className="text-xs text-gray-500 hover:text-gray-700 underline"
                                onClick={(e) => { e.stopPropagation(); toggleShowAll(target.name); }}
                              >
                                ...외 {hiddenCount}명
                              </button>
                            </TableCell>
                          </TableRow>
                        )}
                        {showAll && hiddenCount > 0 && (
                          <TableRow className="bg-gray-50/40">
                            <TableCell colSpan={4} className="py-1.5 pl-10">
                              <button
                                className="text-xs text-gray-500 hover:text-gray-700 underline"
                                onClick={(e) => { e.stopPropagation(); toggleShowAll(target.name); }}
                              >
                                접기
                              </button>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    )}
                  </React.Fragment>
                );
              })}
              {accessTargets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    {viewTable.accessSummary === '전체 허용' ? (
                      <span className="text-sm text-emerald-600">
                        전체 허용 — 모든 사용자가 이 데이터 소스에 접근할 수 있습니다.
                      </span>
                    ) : viewTable.accessSummary === '—' ? (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400">아직 접근 권한이 설정되지 않았습니다.</p>
                        <p className="text-xs text-gray-500">[편집] 버튼을 눌러 부서 또는 사용자를 추가하세요.</p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">접근 가능한 대상이 없습니다.</span>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {isErp && viewTable.authType === 'erp_derived' && (
            <div className="flex items-start gap-1.5 mt-2">
              <Info className="h-3 w-3 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400">
                erp_derived 뷰: 원천 pgmseq [{viewTable.pgmseqList.map((p) => p.pgmseq).join(', ')}]
                모두에 허용된 대상만 표시
              </p>
            </div>
          )}
        </section>

        {/* RLS 설정 — ERP 뷰만 표시 */}
        {isErp && (
          <section>
            <h4 className="text-xs font-medium text-gray-500 mb-3">RLS 설정 (데이터 범위 제한)</h4>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* ① NULL — RLS 미적용 */}
              {viewTable.rlsType === null && (
                <div className="px-4 py-3 space-y-2">
                  <div className="flex gap-2 text-xs">
                    <span className="text-gray-400 w-10 shrink-0">유형</span>
                    <span className="text-gray-700 font-medium">미적용</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    이 뷰테이블은 행 수준 보안이 적용되지 않습니다.
                    접근이 허용된 사용자는 전체 데이터를 조회할 수 있습니다.
                  </p>
                </div>
              )}

              {/* ② code_secu */}
              {viewTable.rlsType === 'code_secu' && (() => {
                const info = getCodeSecuRlsInfo(viewTable.viewId);
                const example = getRlsExample(viewTable.viewId);
                return (
                  <>
                    <div className="px-4 py-3 space-y-2">
                      <div className="flex gap-2 text-xs">
                        <span className="text-gray-400 w-20 shrink-0">유형</span>
                        <span className="text-gray-700 font-medium">ERP 코드권한 기반 필터</span>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="text-gray-400 w-20 shrink-0">코드권한그룹</span>
                        <span className="text-gray-700">{info.codeSecuGroupName}</span>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="text-gray-400 w-20 shrink-0">필터 대상 컬럼</span>
                        <code className="text-gray-700 text-[11px] bg-gray-100 px-1 py-0.5 rounded">{info.filterColumn}</code>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="text-gray-400 w-20 shrink-0">해석 방식</span>
                        <span className="text-gray-600">
                          사용자에게 허용된 {info.codeSecuGroupName}({info.filterColumn})만 조회 가능
                        </span>
                      </div>
                    </div>

                    {example?.allowedValues && (
                      <div className="bg-gray-50/80 border-t border-gray-100 px-4 py-3">
                        <p className="text-[11px] text-gray-500 mb-1.5">
                          예시) {example.userName} ({example.department})
                        </p>
                        <div className="text-[11px] text-gray-600 space-y-0.5 pl-3">
                          <p className="font-mono">
                            → WHERE {info.filterColumn} IN ({example.allowedValues.map(v => v.seq).join(', ')})
                          </p>
                          <p>
                            → {example.allowedValues.map(v => `${v.name}(${v.seq})`).join(', ')} 데이터만 조회
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-gray-100 px-4 py-2.5 flex gap-1.5 items-start">
                      <Info className="h-3 w-3 text-gray-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        ERP 코드권한 테이블(_TCACodeSecu)에서 자동 해석됩니다. 설정을 변경하려면 ERP 코드권한 관리에서 수정하세요.
                      </p>
                    </div>
                  </>
                );
              })()}

              {/* ③ mapping_table */}
              {viewTable.rlsType === 'mapping_table' && viewTable.rlsConfig && (() => {
                const config = viewTable.rlsConfig;
                const example = getRlsExample(viewTable.viewId);
                return (
                  <>
                    <div className="px-4 py-3 space-y-2">
                      <div className="flex gap-2 text-xs">
                        <span className="text-gray-400 w-20 shrink-0">유형</span>
                        <span className="text-gray-700 font-medium">전용 매핑 테이블 참조</span>
                      </div>
                      {[
                        { label: '매핑 테이블', value: config.mappingTableName },
                        { label: '뷰 조인 키', value: config.viewJoinKey },
                        { label: '매핑 조인 키', value: config.mappingJoinKey },
                        { label: '매핑 부서 키', value: config.mappingDeptKey },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex gap-2 text-xs">
                          <span className="text-gray-400 w-20 shrink-0">{label}</span>
                          <code className="text-gray-700 text-[11px] bg-gray-100 px-1 py-0.5 rounded">{value}</code>
                        </div>
                      ))}
                      <div className="flex gap-2 text-xs">
                        <span className="text-gray-400 w-20 shrink-0">전체 허용 값</span>
                        <span className="text-gray-700">
                          <code className="text-[11px] bg-gray-100 px-1 py-0.5 rounded">{config.fullAccessValue}</code>
                          <span className="text-gray-400 ml-1.5 text-[11px]">
                            ({config.mappingDeptKey}={config.fullAccessValue}이면 전 부서 조회 가능)
                          </span>
                        </span>
                      </div>
                    </div>

                    {example?.steps && (
                      <div className="bg-gray-50/80 border-t border-gray-100 px-4 py-3">
                        <p className="text-[11px] text-gray-500 mb-1.5">
                          예시) {example.userName} ({example.department}, DeptSeq={example.deptSeq})
                        </p>
                        <div className="text-[11px] text-gray-600 space-y-0.5 pl-3">
                          {example.steps.map((step, i) => (
                            <p key={i}>→ {step}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-gray-100 px-4 py-2.5 flex gap-1.5 items-start">
                      <Info className="h-3 w-3 text-gray-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        매핑 테이블의 데이터가 변경되면 조회 범위도 자동 변경됩니다.
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </section>
        )}

        {/* 안내 문구 */}
        <div className="flex gap-2 p-3 bg-blue-50/60 rounded-lg">
          <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-600 leading-relaxed">
            {isErp
              ? 'ERP 연동 뷰의 접근 권한은 ERP 부서별권한등록·그룹별권한등록·사용자별권한등록에서 관리됩니다. 위 현황은 ERP 권한 기준으로 자동 계산되었습니다.'
              : '이 데이터 소스의 접근 권한은 KonaI-Agent에서 직접 관리됩니다.'}
          </p>
        </div>
      </div>

      {/* 비ERP만 편집 버튼 */}
      {!isErp && (
        <div className="shrink-0 border-t border-gray-100 p-4">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onEditAccess}
          >
            <Pencil className="h-3.5 w-3.5" />
            편집
          </Button>
        </div>
      )}
    </div>
  );
}
