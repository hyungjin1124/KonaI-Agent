'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import type { ViewTable } from '../../types/data.types';

interface OverviewTabProps {
  viewTable: ViewTable;
  onEdit: () => void;
}

const SOURCE_BADGE_CLASSES: Record<string, string> = {
  Jira: 'bg-purple-50 text-purple-700 border-purple-200',
  Excel: 'bg-green-50 text-green-700 border-green-200',
  API: 'bg-orange-50 text-orange-700 border-orange-200',
  기타: 'bg-gray-50 text-gray-600 border-gray-200',
};

export function OverviewTab({ viewTable, onEdit }: OverviewTabProps) {
  const isErp = viewTable.sourceType === 'ERP';

  const erpFields: { label: string; value: React.ReactNode }[] = [
    {
      label: '뷰테이블 ID',
      value: <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">{viewTable.viewId}</code>,
    },
    { label: '표시명', value: viewTable.viewName },
    {
      label: '설명',
      value: viewTable.description || <span className="text-gray-400">-</span>,
    },
    {
      label: '도메인',
      value: <Badge variant="outline" className="text-xs font-normal">{viewTable.domain}</Badge>,
    },
    {
      label: 'auth_type',
      value: viewTable.authType === 'erp_pgm' ? 'ERP 프로그램 (erp_pgm)' : 'ERP 파생 (erp_derived)',
    },
    {
      label: '원천 ERP 화면',
      value: (
        <div className="space-y-1">
          {viewTable.pgmseqList.map((p) => (
            <div key={p.pgmseq} className="text-sm">
              <span className="text-gray-500">[{p.pgmseq}]</span>{' '}
              {p.erpScreenName}
            </div>
          ))}
        </div>
      ),
    },
    {
      label: 'rls_type',
      value: viewTable.rlsType
        ? viewTable.rlsType === 'code_secu'
          ? 'ERP 코드권한 (code_secu)'
          : '매핑 테이블 (mapping_table)'
        : <span className="text-gray-400">미적용</span>,
    },
    {
      label: '활성 여부',
      value: viewTable.isActive ? (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">활성</Badge>
      ) : (
        <Badge variant="secondary">비활성</Badge>
      ),
    },
  ];

  const nonErpFields: { label: string; value: React.ReactNode }[] = [
    {
      label: '뷰테이블 ID',
      value: <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">{viewTable.viewId}</code>,
    },
    { label: '표시명', value: viewTable.viewName },
    {
      label: '설명',
      value: viewTable.description || <span className="text-gray-400">-</span>,
    },
    {
      label: '소스 유형',
      value: (
        <Badge
          variant="outline"
          className={`text-xs font-normal ${SOURCE_BADGE_CLASSES[viewTable.sourceType] ?? ''}`}
        >
          {viewTable.sourceType}
        </Badge>
      ),
    },
    {
      label: '도메인',
      value: <Badge variant="outline" className="text-xs font-normal">{viewTable.domain}</Badge>,
    },
    {
      label: '활성 여부',
      value: viewTable.isActive ? (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">활성</Badge>
      ) : (
        <Badge variant="secondary">비활성</Badge>
      ),
    },
  ];

  const fields = isErp ? erpFields : nonErpFields;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <dl className="space-y-4">
          {fields.map((field) => (
            <div key={field.label}>
              <dt className="text-xs font-medium text-gray-500 mb-1">{field.label}</dt>
              <dd className="text-sm text-gray-900">{field.value}</dd>
            </div>
          ))}
        </dl>

        {isErp && (
          <p className="mt-4 text-xs text-gray-400">
            ERP에서 관리되는 데이터이므로 이 화면에서 수정할 수 없습니다.
          </p>
        )}
      </div>

      {/* 비ERP만 편집 버튼 표시 */}
      {!isErp && (
        <div className="shrink-0 border-t border-gray-100 p-4">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
            편집
          </Button>
        </div>
      )}
    </div>
  );
}
