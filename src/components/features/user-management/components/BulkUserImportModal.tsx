'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, AlertTriangle, CheckCircle2, FileText, Download } from '../../../icons';
import { Button } from '../../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../ui/table';
import type { EnhancedUser, DomainRole } from '../../../../types';
import { DOMAIN_ROLES } from '../../../../types';

interface BulkUserImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (users: EnhancedUser[]) => void;
}

interface ParsedRow {
  rowNum: number;
  name: string;
  email: string;
  department: string;
  division: string;
  position: string;
  positionLevel: string;
  roles: string;
  errors: string[];
}

const REQUIRED_HEADERS = ['name', 'email', 'department', 'division', 'position', 'roles'];
const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
  const rows = lines.slice(1).map(line => {
    // Simple CSV parser handling quoted fields
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
  return { headers, rows };
}

function validateRow(headers: string[], values: string[], rowNum: number): ParsedRow {
  const get = (key: string) => {
    const idx = headers.indexOf(key);
    return idx >= 0 && idx < values.length ? values[idx].trim() : '';
  };

  const errors: string[] = [];
  const name = get('name');
  const email = get('email');
  const department = get('department');
  const division = get('division');
  const position = get('position');
  const positionLevel = get('positionlevel') || get('position_level') || '';
  const rolesStr = get('roles');

  if (!name) errors.push('이름 누락');
  if (!email) errors.push('이메일 누락');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('이메일 형식 오류');
  if (!department) errors.push('부서 누락');
  if (!rolesStr) errors.push('역할 누락');
  else {
    const roleList = rolesStr.split(';').map(r => r.trim());
    const invalid = roleList.filter(r => !(DOMAIN_ROLES as readonly string[]).includes(r));
    if (invalid.length > 0) errors.push(`유효하지 않은 역할: ${invalid.join(', ')}`);
  }

  return { rowNum, name, email, department, division, position, positionLevel, roles: rolesStr, errors };
}

export function BulkUserImportModal({ open, onClose, onImport }: BulkUserImportModalProps) {
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [headerError, setHeaderError] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setStep('upload');
    setParsedRows([]);
    setHeaderError('');
    setFileName('');
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, rows } = parseCSV(text);

      // Validate headers
      const missing = REQUIRED_HEADERS.filter(h => !headers.includes(h));
      if (missing.length > 0) {
        setHeaderError(`필수 열 누락: ${missing.join(', ')}`);
        return;
      }
      setHeaderError('');

      const parsed = rows.map((values, idx) => validateRow(headers, values, idx + 2));
      // Email duplicate check within the CSV
      const emailCounts = new Map<string, number[]>();
      for (const row of parsed) {
        if (row.email) {
          const key = row.email.toLowerCase();
          const existing = emailCounts.get(key) ?? [];
          existing.push(row.rowNum);
          emailCounts.set(key, existing);
        }
      }
      for (const row of parsed) {
        if (row.email) {
          const dups = emailCounts.get(row.email.toLowerCase());
          if (dups && dups.length > 1) {
            row.errors.push(`이메일 중복 (행 ${dups.filter(n => n !== row.rowNum).join(', ')})`);
          }
        }
      }
      setParsedRows(parsed);
      setStep('preview');
    };
    reader.readAsText(file, 'UTF-8');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const validRows = parsedRows.filter(r => r.errors.length === 0);
  const errorRows = parsedRows.filter(r => r.errors.length > 0);

  const handleImport = useCallback(() => {
    const newUsers: EnhancedUser[] = validRows.map((row, idx) => ({
      id: `import-${Date.now()}-${idx}`,
      name: row.name,
      email: row.email,
      department: row.department,
      division: row.division,
      position: row.position,
      positionLevel: (['실무자', '관리자', '임원'].includes(row.positionLevel)
        ? row.positionLevel as '실무자' | '관리자' | '임원'
        : undefined),
      roles: row.roles.split(';').map(r => r.trim()) as DomainRole[],
      status: 'Active' as const,
      lastLogin: '-',
      avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
    }));
    onImport(newUsers);
    handleClose();
  }, [validRows, onImport, handleClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>사용자 CSV 일괄 임포트</DialogTitle>
          <DialogDescription>
            CSV 파일을 업로드하여 사용자를 일괄 등록합니다.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="flex-1 space-y-4">
            {/* Drop zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 py-16 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
            >
              <Upload size={32} className="text-gray-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  CSV 파일을 드래그하거나 <span className="text-blue-600 underline">클릭하여 선택</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">UTF-8 인코딩, 최대 500행</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            {headerError && (
              <div className="flex items-start gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">헤더 검증 실패</p>
                  <p className="text-xs mt-0.5">{headerError}</p>
                </div>
              </div>
            )}

            {/* Template info */}
            <div className="px-4 py-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-600">CSV 템플릿 형식</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[11px] h-7 gap-1"
                  onClick={() => {
                    const csv = 'name,email,department,division,position,positionLevel,roles\n홍길동,hong@konai.com,재무팀,경영지원본부,과장,관리자,ROLE_FIN_USER\n김영희,kim@konai.com,영업1팀,사업부,대리,실무자,ROLE_SALES_USER;ROLE_DEPT_MGR';
                    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'user_import_template.csv';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download size={12} /> 템플릿 다운로드
                </Button>
              </div>
              <code className="block text-[11px] text-gray-500 font-mono leading-relaxed bg-white px-3 py-2 rounded border border-gray-200 overflow-x-auto">
                name,email,department,division,position,positionLevel,roles{'\n'}
                홍길동,hong@konai.com,재무팀,경영지원본부,과장,관리자,ROLE_FIN_USER{'\n'}
                김영희,kim@konai.com,영업1팀,사업부,대리,실무자,ROLE_SALES_USER;ROLE_DEPT_MGR
              </code>
              <p className="text-[10px] text-gray-400 mt-1.5">
                * 다중 역할은 세미콜론(;)으로 구분합니다. positionLevel은 선택 항목입니다.
              </p>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="flex-1 flex flex-col gap-4 min-h-0">
            {/* Summary */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <FileText size={14} className="text-gray-400" />
                <span className="font-medium text-gray-700">{fileName}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 size={13} /> {validRows.length}건 유효
                </span>
                {errorRows.length > 0 && (
                  <span className="flex items-center gap-1 text-red-600">
                    <AlertTriangle size={13} /> {errorRows.length}건 오류
                  </span>
                )}
              </div>
            </div>

            {/* Preview table */}
            <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden min-h-0">
              <div className="max-h-[360px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="px-3 py-2 text-xs font-bold w-10">#</TableHead>
                      <TableHead className="px-3 py-2 text-xs font-bold">이름</TableHead>
                      <TableHead className="px-3 py-2 text-xs font-bold">이메일</TableHead>
                      <TableHead className="px-3 py-2 text-xs font-bold">부서</TableHead>
                      <TableHead className="px-3 py-2 text-xs font-bold">직급</TableHead>
                      <TableHead className="px-3 py-2 text-xs font-bold">역할</TableHead>
                      <TableHead className="px-3 py-2 text-xs font-bold w-24">상태</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.map(row => (
                      <TableRow key={row.rowNum} className={row.errors.length > 0 ? 'bg-red-50' : ''}>
                        <TableCell className="px-3 py-2 text-xs text-gray-400">{row.rowNum}</TableCell>
                        <TableCell className="px-3 py-2 text-xs font-medium">{row.name || '-'}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-gray-600">{row.email || '-'}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-gray-600">{row.department || '-'}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-gray-600">{row.position || '-'}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-gray-600 max-w-[160px] truncate" title={row.roles}>
                          {row.roles || '-'}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-xs">
                          {row.errors.length > 0 ? (
                            <span className="text-red-600 font-medium" title={row.errors.join(', ')}>
                              {row.errors[0]}
                              {row.errors.length > 1 && ` 외 ${row.errors.length - 1}건`}
                            </span>
                          ) : (
                            <span className="text-green-600 font-medium">OK</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {errorRows.length > 0 && (
              <p className="text-xs text-amber-600">
                * 오류가 있는 {errorRows.length}건은 제외하고 {validRows.length}건만 임포트됩니다.
              </p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => { resetState(); }} className="text-xs">
                다시 선택
              </Button>
              <Button
                onClick={handleImport}
                disabled={validRows.length === 0}
                className="bg-[#1A1A1A] hover:bg-black text-white text-xs"
              >
                {validRows.length}명 임포트
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
