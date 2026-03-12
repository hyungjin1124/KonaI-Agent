'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  History,
  Play,
  Eye,
  Sparkles,
} from '@/components/icons';
import {
  type PromptTemplate,
  type PromptCategory,
  type PromptStatus,
  MOCK_TEMPLATES,
  PROMPT_CATEGORIES,
  PROMPT_STATUSES,
  STATUS_STYLES,
  CATEGORY_STYLES,
  filterTemplates,
  extractVariables,
  getCategoryLabel,
  getStatusLabel,
} from './promptManagementData';

// ── Badge Sub-Components ──────────────────────────────

function StatusBadge({ status }: { status: PromptStatus }) {
  return (
    <Badge variant="outline" className={STATUS_STYLES[status]} data-testid="status-badge">
      {getStatusLabel(status)}
    </Badge>
  );
}

function CategoryBadge({ category }: { category: PromptCategory }) {
  return (
    <Badge variant="outline" className={CATEGORY_STYLES[category]} data-testid="category-badge">
      {getCategoryLabel(category)}
    </Badge>
  );
}

// ── Variable Highlight ────────────────────────────────

function VariableTag({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
      {'{{' + name + '}}'}
    </span>
  );
}

// ── Main Component ────────────────────────────────────

export function PromptManagementView() {
  // CRUD state
  const [templates, setTemplates] = useState<PromptTemplate[]>(MOCK_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PromptTemplate | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialog state
  const [activeTab, setActiveTab] = useState<'edit' | 'versions' | 'test'>('edit');
  const [editForm, setEditForm] = useState({
    name: '',
    category: 'system' as PromptCategory,
    description: '',
    content: '',
    status: 'draft' as PromptStatus,
  });

  // Test state
  const [testVariables, setTestVariables] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<string | null>(null);

  // ── Derived state ───────────────────────────────────

  const filteredTemplates = useMemo(
    () => filterTemplates(templates, { search: searchQuery, category: categoryFilter, status: statusFilter }),
    [templates, searchQuery, categoryFilter, statusFilter],
  );

  const editVariables = useMemo(() => extractVariables(editForm.content), [editForm.content]);

  // ── Handlers ────────────────────────────────────────

  const openCreateDialog = useCallback(() => {
    setSelectedTemplate(null);
    setEditForm({ name: '', category: 'system', description: '', content: '', status: 'draft' });
    setActiveTab('edit');
    setTestResult(null);
    setTestVariables({});
    setIsDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((template: PromptTemplate) => {
    setSelectedTemplate(template);
    setEditForm({
      name: template.name,
      category: template.category,
      description: template.description,
      content: template.content,
      status: template.status,
    });
    setActiveTab('edit');
    setTestResult(null);
    setTestVariables({});
    setIsDialogOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    const vars = extractVariables(editForm.content);
    if (selectedTemplate) {
      // Update existing
      setTemplates((prev) =>
        prev.map((t) => {
          if (t.id !== selectedTemplate.id) return t;
          const newVersion = t.currentVersion + 1;
          return {
            ...t,
            name: editForm.name,
            category: editForm.category,
            description: editForm.description,
            content: editForm.content,
            status: editForm.status,
            variables: vars,
            currentVersion: newVersion,
            charCount: editForm.content.length,
            updatedAt: new Date().toISOString().slice(0, 10),
            versions: [
              ...t.versions,
              {
                version: newVersion,
                content: editForm.content,
                createdAt: new Date().toISOString().slice(0, 10),
                createdBy: '김관리',
                changeSummary: '수정됨',
              },
            ],
          };
        }),
      );
    } else {
      // Create new
      const newTemplate: PromptTemplate = {
        id: `pt-${String(templates.length + 1).padStart(3, '0')}`,
        name: editForm.name,
        category: editForm.category,
        status: editForm.status,
        currentVersion: 1,
        content: editForm.content,
        variables: vars,
        description: editForm.description,
        versions: [
          {
            version: 1,
            content: editForm.content,
            createdAt: new Date().toISOString().slice(0, 10),
            createdBy: '김관리',
            changeSummary: '초기 버전',
          },
        ],
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
        createdBy: '김관리',
        charCount: editForm.content.length,
      };
      setTemplates((prev) => [...prev, newTemplate]);
    }
    setIsDialogOpen(false);
  }, [editForm, selectedTemplate, templates.length]);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    setTemplates((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    setIsDeleteDialogOpen(false);
    setDeleteTarget(null);
  }, [deleteTarget]);

  const openDeleteDialog = useCallback((template: PromptTemplate) => {
    setDeleteTarget(template);
    setIsDeleteDialogOpen(true);
  }, []);

  const runTest = useCallback(() => {
    let result = editForm.content;
    for (const [key, value] of Object.entries(testVariables)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || `[${key}]`);
    }
    setTestResult(result);
  }, [editForm.content, testVariables]);

  // ── Render ──────────────────────────────────────────

  return (
    <div className="p-6 space-y-6" data-testid="prompt-management">
      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap" data-testid="filter-bar">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="프롬프트 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="search-input"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[140px]" data-testid="category-filter">
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 카테고리</SelectItem>
            {PROMPT_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px]" data-testid="status-filter">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            {PROMPT_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={openCreateDialog} data-testid="create-button">
          <Plus size={16} className="mr-1" /> 새 프롬프트
        </Button>
      </div>

      {/* Template Table */}
      <div className="border rounded-xl overflow-hidden" data-testid="prompt-table">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[260px]">이름</TableHead>
              <TableHead className="w-[100px]">카테고리</TableHead>
              <TableHead className="w-[80px]">상태</TableHead>
              <TableHead className="w-[60px] text-center">버전</TableHead>
              <TableHead className="w-[100px]">최종 수정</TableHead>
              <TableHead className="w-[140px] text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTemplates.map((template) => (
              <TableRow key={template.id} data-testid="prompt-row">
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900">{template.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{template.description}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <CategoryBadge category={template.category} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={template.status} />
                </TableCell>
                <TableCell className="text-center text-sm text-gray-600">
                  v{template.currentVersion}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {template.updatedAt}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(template)} data-testid="edit-button">
                      <Edit2 size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { openEditDialog(template); setActiveTab('versions'); }} data-testid="versions-button">
                      <History size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { openEditDialog(template); setActiveTab('test'); }} data-testid="test-button">
                      <Play size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(template)} className="text-red-500 hover:text-red-700" data-testid="delete-button">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredTemplates.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="text-sm text-gray-500" data-testid="template-count">
        총 {filteredTemplates.length}개 프롬프트 {filteredTemplates.length !== templates.length && `(전체 ${templates.length}개)`}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" data-testid="prompt-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles size={20} />
              {selectedTemplate ? '프롬프트 편집' : '새 프롬프트 생성'}
            </DialogTitle>
          </DialogHeader>

          {/* Dialog Tabs */}
          <div className="flex gap-1 border-b mb-4" data-testid="dialog-tabs">
            {([
              { key: 'edit' as const, label: '편집', icon: Edit2 },
              { key: 'versions' as const, label: '버전 이력', icon: History },
              { key: 'test' as const, label: '테스트', icon: Play },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                data-testid={`tab-${tab.key}`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Edit Tab */}
          {activeTab === 'edit' && (
            <div className="space-y-4" data-testid="edit-panel">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prompt-name">이름</Label>
                  <Input
                    id="prompt-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="프롬프트 이름"
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <Label>카테고리</Label>
                  <Select
                    value={editForm.category}
                    onValueChange={(v) => setEditForm((prev) => ({ ...prev, category: v as PromptCategory }))}
                  >
                    <SelectTrigger data-testid="input-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROMPT_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="prompt-desc">설명</Label>
                <Input
                  id="prompt-desc"
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="프롬프트에 대한 간단한 설명"
                  data-testid="input-description"
                />
              </div>

              <div>
                <Label>상태</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) => setEditForm((prev) => ({ ...prev, status: v as PromptStatus }))}
                >
                  <SelectTrigger data-testid="input-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROMPT_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="prompt-content">프롬프트 내용</Label>
                  <span className="text-xs text-gray-500" data-testid="char-count">
                    {editForm.content.length}자
                  </span>
                </div>
                <Textarea
                  id="prompt-content"
                  value={editForm.content}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="시스템 프롬프트를 입력하세요. 변수는 {{variable_name}} 형식으로 삽입합니다."
                  className="min-h-[160px] font-mono text-sm"
                  data-testid="input-content"
                />
              </div>

              {editVariables.length > 0 && (
                <div data-testid="variables-display">
                  <Label className="text-xs text-gray-500 mb-1 block">감지된 변수</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {editVariables.map((v) => (
                      <VariableTag key={v} name={v} />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
                <Button onClick={handleSave} disabled={!editForm.name || !editForm.content} data-testid="save-button">
                  {selectedTemplate ? '저장' : '생성'}
                </Button>
              </div>
            </div>
          )}

          {/* Versions Tab */}
          {activeTab === 'versions' && (
            <div data-testid="versions-panel">
              {selectedTemplate ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">총 {selectedTemplate.versions.length}개 버전</p>
                  {[...selectedTemplate.versions].reverse().map((ver) => (
                    <div
                      key={ver.version}
                      className="border rounded-lg p-4 space-y-2"
                      data-testid="version-row"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            v{ver.version}
                          </Badge>
                          <span className="text-sm font-medium">{ver.changeSummary}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {ver.createdAt} · {ver.createdBy}
                        </span>
                      </div>
                      <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-wrap font-mono">
                        {ver.content}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-4 text-center">새 프롬프트를 먼저 저장하세요.</p>
              )}
            </div>
          )}

          {/* Test Tab */}
          {activeTab === 'test' && (
            <div className="space-y-4" data-testid="test-panel">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Eye size={14} />
                  프롬프트 미리보기
                </div>
                <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono bg-white p-3 rounded border">
                  {editForm.content || '프롬프트 내용을 입력하세요.'}
                </pre>
              </div>

              {editVariables.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">변수 입력</Label>
                  {editVariables.map((v) => (
                    <div key={v} className="flex items-center gap-3">
                      <VariableTag name={v} />
                      <Input
                        value={testVariables[v] || ''}
                        onChange={(e) =>
                          setTestVariables((prev) => ({ ...prev, [v]: e.target.value }))
                        }
                        placeholder={`${v} 값을 입력하세요`}
                        className="flex-1"
                        data-testid={`test-var-${v}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <Button onClick={runTest} className="w-full" data-testid="run-test-button">
                <Play size={14} className="mr-1" /> 테스트 실행
              </Button>

              {testResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4" data-testid="test-result">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-700 mb-2">
                    <Sparkles size={14} />
                    결과 미리보기
                  </div>
                  <pre className="text-sm text-green-800 whitespace-pre-wrap font-mono">
                    {testResult}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm" data-testid="delete-dialog">
          <DialogHeader>
            <DialogTitle>프롬프트 삭제</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            <strong>{deleteTarget?.name}</strong>을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>취소</Button>
            <Button variant="destructive" onClick={handleDelete} data-testid="confirm-delete">
              삭제
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
