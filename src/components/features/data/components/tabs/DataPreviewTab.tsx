'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Maximize2 } from 'lucide-react';
import type { DataPreview } from '../../types/data.types';

interface DataPreviewTabProps {
  dataPreview: DataPreview;
  isTabActive: boolean;
  onExpand: () => void;
}

export function DataPreviewTab({ dataPreview, isTabActive, onExpand }: DataPreviewTabProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isTabActive && !isLoaded) {
      // Simulate lazy loading delay
      const timer = setTimeout(() => setIsLoaded(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isTabActive, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FF3C42]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Hints */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">RLS 미적용</Badge>
          <span className="text-xs text-gray-400">
            최대 50행 · 관리자 전체 데이터 확인용
          </span>
        </div>
        <button
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          onClick={onExpand}
        >
          <Maximize2 className="h-3 w-3" />
          전체 화면에서 보기
        </button>
      </div>

      {/* Data table */}
      <div className="flex-1 overflow-auto p-4">
        <table className="w-full text-sm border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-50">
              {dataPreview.columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-b border-gray-200 whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataPreview.rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50/60">
                {dataPreview.columns.map((col) => (
                  <td
                    key={col}
                    className="px-3 py-1.5 text-xs text-gray-700 border-b border-gray-100 whitespace-nowrap"
                  >
                    {row[col] === null ? (
                      <span className="text-gray-300">NULL</span>
                    ) : (
                      String(row[col])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
