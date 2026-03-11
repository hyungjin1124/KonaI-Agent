/**
 * KnowledgeBaseView — Knowledge Base Management
 *
 * Collection-based knowledge management with:
 * - Collection grid (overview)
 * - Document list table (per collection)
 * - Upload dialog
 * - Search + type filter
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  FolderOpen, FileText, ArrowLeft, Search, Upload, Plus, Database,
  Check, Clock, AlertTriangle, X, Globe, Lock, Users,
} from '../../../components/icons';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import {
  type KnowledgeCollection,
  type KnowledgeDocument,
  type DocumentStatus,
  MOCK_COLLECTIONS,
  formatFileSize,
  getDocumentTypeLabel,
  filterDocuments,
} from './knowledgeBaseData';

// --- Status Badge ---
function StatusBadge({ status }: { status: DocumentStatus }) {
  const styles: Record<DocumentStatus, { className: string; icon: React.ReactNode; label: string }> = {
    indexed: { className: 'bg-green-50 text-green-700 border-green-200', icon: <Check size={10} />, label: '완료' },
    processing: { className: 'bg-blue-50 text-blue-700 border-blue-200', icon: <Clock size={10} />, label: '처리 중' },
    failed: { className: 'bg-red-50 text-red-700 border-red-200', icon: <AlertTriangle size={10} />, label: '실패' },
    pending: { className: 'bg-gray-50 text-gray-500 border-gray-200', icon: <Clock size={10} />, label: '대기 중' },
  };
  const s = styles[status];
  return (
    <Badge variant="outline" className={`text-xs font-medium gap-1 ${s.className}`}>
      {s.icon} {s.label}
    </Badge>
  );
}

// --- Collection Status Badge ---
function CollectionStatusBadge({ status }: { status: KnowledgeCollection['status'] }) {
  const styles = {
    active: 'bg-green-50 text-green-700 border-green-200',
    updating: 'bg-blue-50 text-blue-700 border-blue-200',
    error: 'bg-red-50 text-red-700 border-red-200',
  };
  const labels = { active: '활성', updating: '업데이트 중', error: '오류' };
  return (
    <Badge variant="outline" className={`text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </Badge>
  );
}

// --- Access Level Badge ---
function AccessBadge({ level }: { level: KnowledgeCollection['accessLevel'] }) {
  const config = {
    public: { icon: <Globe size={10} />, label: '공개', className: 'text-green-600' },
    private: { icon: <Lock size={10} />, label: '비공개', className: 'text-gray-500' },
    restricted: { icon: <Users size={10} />, label: '제한', className: 'text-amber-600' },
  };
  const c = config[level];
  return (
    <span className={`flex items-center gap-1 text-xs ${c.className}`}>
      {c.icon} {c.label}
    </span>
  );
}

// --- File Type Icon color ---
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    pdf: 'text-red-500',
    docx: 'text-blue-500',
    xlsx: 'text-green-500',
    csv: 'text-green-600',
    txt: 'text-gray-500',
    md: 'text-purple-500',
    pptx: 'text-orange-500',
    html: 'text-cyan-500',
  };
  return colors[type] ?? 'text-gray-400';
}

// --- Main Component ---
export function KnowledgeBaseView() {
  const [collections] = useState<KnowledgeCollection[]>(MOCK_COLLECTIONS);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const selectedCollection = useMemo(
    () => collections.find(c => c.id === selectedCollectionId) ?? null,
    [collections, selectedCollectionId]
  );

  const filteredDocs = useMemo(() => {
    if (!selectedCollection) return [];
    return filterDocuments(selectedCollection.documents, searchQuery, typeFilter);
  }, [selectedCollection, searchQuery, typeFilter]);

  const totalDocuments = collections.reduce((sum, c) => sum + c.documentCount, 0);
  const totalSize = collections.reduce((sum, c) => sum + c.totalSize, 0);

  const handleBack = useCallback(() => {
    setSelectedCollectionId(null);
    setSearchQuery('');
    setTypeFilter('all');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Mock: just close the dialog
    setIsUploadOpen(false);
  }, []);

  // --- Collection Grid View ---
  if (!selectedCollection) {
    return (
      <div className="space-y-6" data-testid="knowledge-base-view">
        {/* Summary Bar */}
        <div className="grid grid-cols-3 gap-4" data-testid="summary-bar">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500 font-medium">컬렉션</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{collections.length}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500 font-medium">총 문서</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{totalDocuments}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500 font-medium">총 용량</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{formatFileSize(totalSize)}</div>
          </div>
        </div>

        {/* Collection Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">지식 컬렉션</h3>
            <Button className="bg-[#1A1A1A] hover:bg-black text-white shadow-sm" size="sm">
              <Plus size={14} className="mr-1.5" /> 컬렉션 추가
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4" data-testid="collection-grid">
            {collections.map(col => (
              <button
                key={col.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all text-left"
                onClick={() => setSelectedCollectionId(col.id)}
                data-testid={`collection-${col.id}`}
                aria-label={`${col.name} 컬렉션 열기`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: col.color }}
                  >
                    <FolderOpen size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-gray-900 truncate">{col.name}</h4>
                      <CollectionStatusBadge status={col.status} />
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">{col.description}</p>
                    <div className="flex items-center gap-4 mt-2.5">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <FileText size={12} /> {col.documentCount}개 문서
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Database size={12} /> {formatFileSize(col.totalSize)}
                      </span>
                      <AccessBadge level={col.accessLevel} />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Document List View ---
  return (
    <div className="space-y-4" data-testid="knowledge-base-view">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8" aria-label="컬렉션 목록으로 돌아가기">
          <ArrowLeft size={18} />
        </Button>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
          style={{ backgroundColor: selectedCollection.color }}
        >
          <FolderOpen size={16} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{selectedCollection.name}</h3>
          <p className="text-xs text-gray-500">{selectedCollection.description}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <CollectionStatusBadge status={selectedCollection.status} />
          <AccessBadge level={selectedCollection.accessLevel} />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="문서명 검색..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
            aria-label="문서 검색"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32 h-9" aria-label="파일 타입 필터">
            <SelectValue placeholder="타입" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="docx">Word</SelectItem>
            <SelectItem value="xlsx">Excel</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="txt">Text</SelectItem>
            <SelectItem value="md">Markdown</SelectItem>
            <SelectItem value="pptx">PowerPoint</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => setIsUploadOpen(true)}
          className="bg-[#1A1A1A] hover:bg-black text-white shadow-sm h-9"
          size="sm"
        >
          <Upload size={14} className="mr-1.5" /> 업로드
        </Button>
      </div>

      {/* Document Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase">파일명</TableHead>
              <TableHead className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase">타입</TableHead>
              <TableHead className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase">크기</TableHead>
              <TableHead className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase">업로드일</TableHead>
              <TableHead className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocs.map(doc => (
              <TableRow key={doc.id}>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className={getTypeColor(doc.type)} />
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[260px]">{doc.name}</span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge variant="outline" className="text-xs">{getDocumentTypeLabel(doc.type)}</Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-gray-500 font-mono">
                  {formatFileSize(doc.size)}
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-gray-500">
                  {doc.uploadedAt}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <StatusBadge status={doc.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredDocs.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm" data-testid="empty-state">
            검색 조건에 맞는 문서가 없습니다.
          </div>
        )}
      </div>

      <div className="text-xs text-gray-400">
        {filteredDocs.length}개 문서 · {formatFileSize(selectedCollection.totalSize)}
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>문서 업로드</DialogTitle>
          </DialogHeader>
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'
            }`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            data-testid="upload-dropzone"
          >
            <Upload size={32} className="mx-auto text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              파일을 여기에 드래그하거나
            </p>
            <Button variant="outline" size="sm" onClick={() => setIsUploadOpen(false)}>
              파일 선택
            </Button>
            <p className="text-xs text-gray-400 mt-3">
              PDF, DOCX, XLSX, CSV, TXT, MD, PPTX, HTML · 최대 100MB
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>취소</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
