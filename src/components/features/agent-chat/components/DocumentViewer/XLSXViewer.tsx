'use client';

import React, { useMemo, useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { DocumentViewerToolbar } from './DocumentViewerToolbar';

const MAX_VISIBLE_ROWS = 500;

interface XLSXViewerProps {
  fileData: ArrayBuffer;
  fileName: string;
  onClose: () => void;
  toolbarExtras?: Record<string, unknown>;
}

export const XLSXViewer: React.FC<XLSXViewerProps> = ({ fileData, fileName, onClose, toolbarExtras }) => {
  const workbook = useMemo(() => XLSX.read(fileData, { type: 'array' }), [fileData]);
  const [activeSheet, setActiveSheet] = useState(workbook.SheetNames[0]);
  const [zoom, setZoom] = useState(1.0);
  const [isMaximized, setIsMaximized] = useState(false);

  const data = useMemo(() => {
    const sheet = workbook.Sheets[activeSheet];
    return XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(sheet, { header: 1 });
  }, [workbook, activeSheet]);

  const headers = (data[0] as (string | number | boolean | null)[] | undefined) || [];
  const allRows = data.slice(1);
  const visibleRows = allRows.slice(0, MAX_VISIBLE_ROWS);
  const hasMore = allRows.length > MAX_VISIBLE_ROWS;

  const handleDownload = useCallback(() => {
    const blob = new Blob([fileData], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [fileData, fileName]);

  return (
    <div className={`h-full flex flex-col bg-white ${isMaximized ? 'fixed inset-0 z-50' : ''}`}>
      <DocumentViewerToolbar
        fileName={fileName}
        fileType="xlsx"
        zoom={zoom}
        onZoomChange={setZoom}
        onDownload={handleDownload}
        onClose={onClose}
        isMaximized={isMaximized}
        onToggleMaximize={() => setIsMaximized(!isMaximized)}
        {...toolbarExtras}
      />

      {/* Sheet tabs */}
      {workbook.SheetNames.length > 1 && (
        <div className="flex border-b border-gray-200 bg-gray-50 px-2 gap-1 overflow-x-auto shrink-0">
          {workbook.SheetNames.map((name) => (
            <button
              key={name}
              onClick={() => setActiveSheet(name)}
              className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors whitespace-nowrap ${
                activeSheet === name
                  ? 'bg-white border-t border-x border-gray-200 text-gray-900 -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 border border-gray-200 text-gray-500 text-xs font-medium w-10">#</th>
                {headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 border border-gray-200 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                    {h ?? ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, ri) => (
                <tr key={ri} className="hover:bg-blue-50/30">
                  <td className="px-3 py-1.5 border border-gray-200 text-gray-400 text-xs text-center">{ri + 1}</td>
                  {headers.map((_, ci) => (
                    <td key={ci} className="px-3 py-1.5 border border-gray-200 text-gray-700 text-xs whitespace-nowrap">
                      {(row as (string | number | boolean | null)[])?.[ci] ?? ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {hasMore && (
          <div className="py-3 text-center text-xs text-gray-400 border-t border-gray-200">
            {MAX_VISIBLE_ROWS}행까지 표시 중 (전체 {allRows.length.toLocaleString()}행) — 전체 데이터는 다운로드하여 확인하세요
          </div>
        )}
      </div>
    </div>
  );
};
