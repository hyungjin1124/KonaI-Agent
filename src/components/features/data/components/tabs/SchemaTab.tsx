'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ViewColumn } from '../../types/data.types';

interface SchemaTabProps {
  columns: ViewColumn[];
}

export function SchemaTab({ columns }: SchemaTabProps) {
  return (
    <div className="p-4 overflow-y-auto h-full">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/80">
            <TableHead className="text-xs font-medium text-gray-500">컬럼명</TableHead>
            <TableHead className="text-xs font-medium text-gray-500">데이터 타입</TableHead>
            <TableHead className="text-xs font-medium text-gray-500">설명</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {columns.map((col) => (
            <TableRow key={col.columnName}>
              <TableCell className="py-2 text-sm font-mono text-gray-900">
                {col.columnName}
              </TableCell>
              <TableCell className="py-2 text-xs text-gray-500 font-mono">
                {col.dataType}
              </TableCell>
              <TableCell className="py-2 text-sm text-gray-600">
                {col.description}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
