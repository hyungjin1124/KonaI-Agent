/**
 * PromptManagementView — Prompt Template Registry
 *
 * Phase 1 MVP: Template CRUD, immutable snapshot versioning,
 * inline test panel, model binding, content moderation sensitivity.
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Search, Plus, Edit2, Trash2, Clock, Check, History,
  Play, FileText, Shield, AlertTriangle, X,
} from '../../icons';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../../ui/sheet';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../ui/tabs';
import {
  type PromptTemplate,
  type PromptStatus,
  type ModerationLevel,
  type PromptCategory,
  type PromptManagementMode,
  type DeploymentLabel,
  MOCK_TEMPLATES,
  CATEGORY_OPTIONS,
  ADMIN_CATEGORIES,
  USER_CATEGORIES,
  STATUS_OPTIONS,
  MODERATION_OPTIONS,
  MODEL_OPTIONS,
  CATEGORY_COLORS,
  STATUS_STYLES,
  DEPLOYMENT_LABEL_OPTIONS,
  DEPLOYMENT_LABEL_STYLES,
  filterTemplates,
  extractVariables,
  estimateTokens,
  getModelName,
  getMockResponse,
  computeSimpleDiff,
} from './promptManagementData';

// --- Sub-Components ---

function StatusBadge({ status }: { status: PromptStatus }) {
  const icons: Record<PromptStatus, React.ReactNode> = {
    draft: <Edit2 size={10} />,
    active: <Check size={10} />,
    archived: <Clock size={10} />,
  };
  const labels: Record<PromptStatus, string> = {
    draft: '초안',
    active: '활성',
    archived: '보관',
  };
  return (
    <Badge variant="outline" className={`text-xs font-medium gap-1 ${STATUS_STYLES[status]}`} data-testid={`status-badge-${status}`}>
      {icons[status]} {labels[status]}
    </Badge>
  );
}

function CategoryBadge({ category }: { category: PromptCategory }) {
  const labels: Record<PromptCategory, string> = {
    system: '시스템',
    task: '태스크',
    safety: '안전',
    persona: '페르소나',
    custom: '커스텀',
  };
  return (
    <Badge variant="outline" className={`text-xs font-medium ${CATEGORY_COLORS[category]}`}>
      {labels[category]}
    </Badge>
  );
}

function DeploymentBadge({ label }: { label?: DeploymentLabel }) {
  if (!label) return null;
  const text = label === 'production' ? 'Prod' : 'Staging';
  return (
    <Badge variant="outline" className={`text-[10px] font-bold ${DEPLOYMENT_LABEL_STYLES[label]}`}>
      {text}
    </Badge>
  );
}

function VariableHighlight({ content }: { content: string }) {
  const parts = content.split(/(\{\{\w+\}\})/g);
  return (
    <div className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed" data-testid="variable-highlight">
      {parts.map((part, i) =>
        /^\{\{\w+\}\}$/.test(part) ? (
          <span key={i} className="bg-blue-100 text-blue-700 rounded px-1 py-0.5 font-semibold text-xs">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </div>
  );
}

// --- Main View ---

interface PromptManagementViewProps {
  mode?: PromptManagementMode;
}

export function PromptManagementView({ mode }: PromptManagementViewProps) {
  // Mode-based category filtering
  const allowedCategories = mode === 'admin' ? ADMIN_CATEGORIES : mode === 'user' ? USER_CATEGORIES : undefined;
  const visibleCategoryOptions = allowedCategories
    ? CATEGORY_OPTIONS.filter(opt => allowedCategories.includes(opt.value))
    : CATEGORY_OPTIONS;

  // State
  const [templates, setTemplates] = useState<PromptTemplate[]>(MOCK_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PromptCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<PromptStatus | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PromptTemplate | null>(null);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');

  // Editor form state
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<PromptCategory>('system');
  const [editContent, setEditContent] = useState('');
  const [editModelId, setEditModelId] = useState(MODEL_OPTIONS[0]?.value ?? '');
  const [editModeration, setEditModeration] = useState<ModerationLevel>('medium');
  const [editStatus, setEditStatus] = useState<PromptStatus>('draft');
  const [editChangeNote, setEditChangeNote] = useState('');
  const [editDeploymentLabel, setEditDeploymentLabel] = useState<DeploymentLabel | 'none'>('none');

  // Test state
  const [testVariables, setTestVariables] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Diff state
  const [diffLeftVersion, setDiffLeftVersion] = useState<number | null>(null);
  const [diffRightVersion, setDiffRightVersion] = useState<number | null>(null);

  // Derived
  const filteredTemplates = useMemo(
    () => filterTemplates(templates, searchQuery, categoryFilter, statusFilter, allowedCategories),
    [templates, searchQuery, categoryFilter, statusFilter, allowedCategories],
  );

  const editVariables = useMemo(() => extractVariables(editContent), [editContent]);

  // Handlers
  const openCreateEditor = useCallback(() => {
    setEditorMode('create');
    setEditName('');
    setEditCategory(allowedCategories?.[0] ?? 'system');
    setEditContent('');
    setEditModelId(MODEL_OPTIONS[0]?.value ?? '');
    setEditModeration('medium');
    setEditStatus('draft');
    setEditChangeNote('');
    setEditDeploymentLabel('none');
    setSelectedTemplate(null);
    setTestResult(null);
    setTestVariables({});
    setIsEditorOpen(true);
  }, [allowedCategories]);

  const openEditEditor = useCallback((template: PromptTemplate) => {
    setEditorMode('edit');
    setSelectedTemplate(template);
    setEditName(template.name);
    setEditCategory(template.category);
    setEditContent(template.content);
    setEditModelId(template.modelId);
    setEditModeration(template.moderationLevel);
    setEditStatus(template.status);
    setEditChangeNote('');
    setEditDeploymentLabel(template.deploymentLabel ?? 'none');
    setTestResult(null);
    setTestVariables({});
    setDiffLeftVersion(template.versions.length >= 2 ? template.versions[template.versions.length - 2].version : null);
    setDiffRightVersion(template.versions[template.versions.length - 1].version);
    setIsEditorOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!editName.trim() || !editContent.trim()) return;

    if (editorMode === 'create') {
      const newTemplate: PromptTemplate = {
        id: `pt-${Date.now()}`,
        name: editName.trim(),
        category: editCategory,
        content: editContent,
        status: editStatus,
        modelId: editModelId,
        moderationLevel: editModeration,
        deploymentLabel: editDeploymentLabel === 'none' ? undefined : editDeploymentLabel,
        currentVersion: 1,
        versions: [
          {
            version: 1,
            content: editContent,
            modelId: editModelId,
            moderationLevel: editModeration,
            changeNote: editChangeNote || '최초 생성',
            createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            createdBy: '현재 사용자',
          },
        ],
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
        createdBy: '현재 사용자',
      };
      setTemplates(prev => [newTemplate, ...prev]);
    } else if (selectedTemplate) {
      const newVersion = selectedTemplate.currentVersion + 1;
      setTemplates(prev =>
        prev.map(t =>
          t.id === selectedTemplate.id
            ? {
                ...t,
                name: editName.trim(),
                category: editCategory,
                content: editContent,
                status: editStatus,
                modelId: editModelId,
                moderationLevel: editModeration,
                deploymentLabel: editDeploymentLabel === 'none' ? undefined : editDeploymentLabel,
                currentVersion: newVersion,
                updatedAt: new Date().toISOString().slice(0, 10),
                versions: [
                  ...t.versions,
                  {
                    version: newVersion,
                    content: editContent,
                    modelId: editModelId,
                    moderationLevel: editModeration,
                    changeNote: editChangeNote || '변경사항 없음',
                    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
                    createdBy: '현재 사용자',
                  },
                ],
              }
            : t,
        ),
      );
    }

    setIsEditorOpen(false);
    setSelectedTemplate(null);
  }, [editorMode, editName, editCategory, editContent, editStatus, editModelId, editModeration, editDeploymentLabel, editChangeNote, selectedTemplate]);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    setTemplates(prev => prev.filter(t => t.id !== deleteTarget.id));
    setIsDeleteDialogOpen(false);
    setDeleteTarget(null);
  }, [deleteTarget]);

  const openDeleteDialog = useCallback((template: PromptTemplate) => {
    setDeleteTarget(template);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleRunTest = useCallback(() => {
    setIsTesting(true);
    setTestResult(null);
    // Simulate API call delay
    setTimeout(() => {
      setTestResult(getMockResponse(editCategory));
      setIsTesting(false);
    }, 1200);
  }, [editCategory]);

  // --- Render ---

  return (
    <div data-testid="prompt-management-view">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6" data-testid="prompt-toolbar">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="프롬프트 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
              aria-label="프롬프트 검색"
              data-testid="search-input"
            />
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={v => setCategoryFilter(v as PromptCategory | 'all')}>
            <SelectTrigger className="w-28 h-9" aria-label="카테고리 필터" data-testid="category-filter">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {visibleCategoryOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as PromptStatus | 'all')}>
            <SelectTrigger className="w-24 h-9" aria-label="상태 필터" data-testid="status-filter">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          className="bg-[#1A1A1A] hover:bg-black text-white shadow-sm h-9"
          size="sm"
          onClick={openCreateEditor}
          data-testid="create-prompt-button"
        >
          <Plus size={14} className="mr-1.5" /> 새 프롬프트
        </Button>
      </div>

      {/* Prompt Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden" data-testid="prompt-table">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase">이름</TableHead>
              <TableHead className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase">카테고리</TableHead>
              <TableHead className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase">모델</TableHead>
              <TableHead className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase">버전</TableHead>
              <TableHead className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase">상태</TableHead>
              <TableHead className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase">배포</TableHead>
              <TableHead className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase">수정일</TableHead>
              <TableHead className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTemplates.map(template => (
              <TableRow key={template.id} className="cursor-pointer hover:bg-gray-50" data-testid={`prompt-row-${template.id}`}>
                <TableCell className="px-4 py-3">
                  <button
                    className="text-left w-full"
                    onClick={() => openEditEditor(template)}
                    aria-label={`${template.name} 편집`}
                  >
                    <div className="text-sm font-bold text-gray-900">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[240px]">{template.content.slice(0, 60)}...</div>
                  </button>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <CategoryBadge category={template.category} />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <span className="text-xs text-gray-600 font-medium">{getModelName(template.modelId)}</span>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <span className="text-xs text-gray-600 font-mono">v{template.currentVersion}</span>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <StatusBadge status={template.status} />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <DeploymentBadge label={template.deploymentLabel} />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <span className="text-xs text-gray-500 font-mono">{template.updatedAt}</span>
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-blue-600 hover:bg-blue-50"
                      onClick={() => openEditEditor(template)}
                      title="편집"
                      aria-label={`${template.name} 편집`}
                      data-testid={`edit-button-${template.id}`}
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-600 hover:bg-red-50"
                      onClick={() => openDeleteDialog(template)}
                      title="삭제"
                      aria-label={`${template.name} 삭제`}
                      data-testid={`delete-button-${template.id}`}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredTemplates.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm" data-testid="empty-state">
            검색 조건에 맞는 프롬프트가 없습니다.
          </div>
        )}
      </div>

      {/* Editor Sheet */}
      <Sheet open={isEditorOpen} onOpenChange={open => { if (!open) { setIsEditorOpen(false); setSelectedTemplate(null); } }}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0" data-testid="prompt-editor">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
            <SheetTitle className="text-lg font-bold text-gray-900">
              {editorMode === 'create' ? '새 프롬프트 생성' : `프롬프트 편집: ${selectedTemplate?.name ?? ''}`}
            </SheetTitle>
          </SheetHeader>

          <Tabs defaultValue="edit" className="flex flex-col h-[calc(100%-80px)]">
            <TabsList className="bg-gray-100 mx-6 mt-4 p-1 rounded-lg h-auto w-fit">
              <TabsTrigger value="edit" className="px-3 py-1.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-1.5" data-testid="tab-edit">
                <Edit2 size={12} /> 편집
              </TabsTrigger>
              {editorMode === 'edit' && (
                <TabsTrigger value="versions" className="px-3 py-1.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-1.5" data-testid="tab-versions">
                  <History size={12} /> 버전 이력
                </TabsTrigger>
              )}
              {editorMode === 'edit' && selectedTemplate && selectedTemplate.versions.length >= 2 && (
                <TabsTrigger value="diff" className="px-3 py-1.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-1.5" data-testid="tab-diff">
                  <FileText size={12} /> 비교
                </TabsTrigger>
              )}
              <TabsTrigger value="test" className="px-3 py-1.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-1.5" data-testid="tab-test">
                <Play size={12} /> 테스트
              </TabsTrigger>
            </TabsList>

            {/* Edit Tab */}
            <TabsContent value="edit" className="flex-1 overflow-y-auto px-6 py-4 mt-0">
              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">프롬프트 이름</Label>
                  <Input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="예: 고객 응대 기본 프롬프트"
                    data-testid="edit-name"
                  />
                </div>

                {/* Category + Status + Deployment row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500 uppercase">카테고리</Label>
                    <Select value={editCategory} onValueChange={v => setEditCategory(v as PromptCategory)}>
                      <SelectTrigger data-testid="edit-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {visibleCategoryOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500 uppercase">상태</Label>
                    <Select value={editStatus} onValueChange={v => setEditStatus(v as PromptStatus)}>
                      <SelectTrigger data-testid="edit-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500 uppercase">배포 환경</Label>
                    <Select value={editDeploymentLabel} onValueChange={v => setEditDeploymentLabel(v as DeploymentLabel | 'none')}>
                      <SelectTrigger data-testid="edit-deployment-label">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPLOYMENT_LABEL_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Model Binding */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">모델 바인딩</Label>
                  <Select value={editModelId} onValueChange={setEditModelId}>
                    <SelectTrigger data-testid="edit-model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODEL_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Moderation Level */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase">콘텐츠 모더레이션 감도</Label>
                  <div className="flex gap-2" data-testid="edit-moderation">
                    {MODERATION_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setEditModeration(opt.value)}
                        className={`flex-1 px-3 py-2 rounded-lg border text-left transition-all ${
                          editModeration === opt.value
                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        aria-pressed={editModeration === opt.value}
                        data-testid={`moderation-${opt.value}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Shield size={12} className={editModeration === opt.value ? 'text-blue-600' : 'text-gray-400'} />
                          <span className={`text-xs font-bold ${editModeration === opt.value ? 'text-blue-700' : 'text-gray-700'}`}>
                            {opt.label}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{opt.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt Content */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">시스템 프롬프트</Label>
                  <Textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    placeholder="시스템 프롬프트를 입력하세요. 변수는 {{변수명}} 형태로 입력합니다."
                    className="min-h-[200px] font-mono text-sm"
                    data-testid="edit-content"
                  />
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>{editContent.length}자 / ~{estimateTokens(editContent)} tokens</span>
                    {editVariables.length > 0 && (
                      <span className="flex items-center gap-1">
                        변수: {editVariables.map(v => (
                          <Badge key={v} variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200 px-1 py-0">
                            {`{{${v}}}`}
                          </Badge>
                        ))}
                      </span>
                    )}
                  </div>
                </div>

                {/* Variable Preview */}
                {editContent && (
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500 uppercase">미리보기</Label>
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-[120px] overflow-y-auto">
                      <VariableHighlight content={editContent} />
                    </div>
                  </div>
                )}

                {/* Change Note (edit mode only) */}
                {editorMode === 'edit' && (
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500 uppercase">변경 요약</Label>
                    <Input
                      type="text"
                      value={editChangeNote}
                      onChange={e => setEditChangeNote(e.target.value)}
                      placeholder="이 버전의 변경 사항을 요약해 주세요"
                      data-testid="edit-change-note"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-2 pb-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setIsEditorOpen(false); setSelectedTemplate(null); }}
                  >
                    취소
                  </Button>
                  <Button
                    className="bg-[#1A1A1A] hover:bg-black text-white shadow-sm"
                    onClick={handleSave}
                    disabled={!editName.trim() || !editContent.trim()}
                    data-testid="save-button"
                  >
                    {editorMode === 'create' ? '생성' : '저장 (새 버전 생성)'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Versions Tab */}
            {editorMode === 'edit' && selectedTemplate && (
              <TabsContent value="versions" className="flex-1 overflow-y-auto px-6 py-4 mt-0">
                <div className="space-y-3" data-testid="version-history">
                  {[...selectedTemplate.versions].reverse().map(ver => (
                    <div key={ver.version} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">v{ver.version}</span>
                          {ver.version === selectedTemplate.currentVersion && (
                            <Badge className="text-[10px] bg-green-50 text-green-700 border-green-200">현재</Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 font-mono">{ver.createdAt}</span>
                      </div>
                      <div className="text-xs text-gray-600 mb-1.5">
                        <span className="font-medium">{ver.createdBy}</span> · {getModelName(ver.modelId)} · 모더레이션 {ver.moderationLevel}
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1.5">
                        {ver.changeNote}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}

            {/* Diff Tab */}
            {editorMode === 'edit' && selectedTemplate && selectedTemplate.versions.length >= 2 && (
              <TabsContent value="diff" className="flex-1 overflow-y-auto px-6 py-4 mt-0">
                <div className="space-y-4" data-testid="diff-panel">
                  {/* Version Selectors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-gray-500 uppercase">이전 버전</Label>
                      <Select value={String(diffLeftVersion ?? '')} onValueChange={v => setDiffLeftVersion(Number(v))}>
                        <SelectTrigger data-testid="diff-left-select">
                          <SelectValue placeholder="버전 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedTemplate.versions.map(ver => (
                            <SelectItem key={ver.version} value={String(ver.version)}>v{ver.version} — {ver.changeNote}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-gray-500 uppercase">현재 버전</Label>
                      <Select value={String(diffRightVersion ?? '')} onValueChange={v => setDiffRightVersion(Number(v))}>
                        <SelectTrigger data-testid="diff-right-select">
                          <SelectValue placeholder="버전 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedTemplate.versions.map(ver => (
                            <SelectItem key={ver.version} value={String(ver.version)}>v{ver.version} — {ver.changeNote}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Diff Output */}
                  {diffLeftVersion && diffRightVersion && (() => {
                    const leftVer = selectedTemplate.versions.find(v => v.version === diffLeftVersion);
                    const rightVer = selectedTemplate.versions.find(v => v.version === diffRightVersion);
                    if (!leftVer || !rightVer) return null;
                    const diffLines = computeSimpleDiff(leftVer.content, rightVer.content);
                    return (
                      <div className="border border-gray-200 rounded-lg overflow-hidden" data-testid="diff-output">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-600">v{diffLeftVersion} → v{diffRightVersion}</span>
                          <div className="flex items-center gap-3 text-[10px]">
                            <span className="text-green-600 font-bold">+{diffLines.filter(l => l.type === 'added').length} 추가</span>
                            <span className="text-red-600 font-bold">-{diffLines.filter(l => l.type === 'removed').length} 삭제</span>
                          </div>
                        </div>
                        <div className="font-mono text-xs leading-relaxed max-h-[400px] overflow-y-auto">
                          {diffLines.map((line, i) => (
                            <div
                              key={i}
                              className={`px-4 py-0.5 ${
                                line.type === 'added'
                                  ? 'bg-green-50 text-green-800'
                                  : line.type === 'removed'
                                    ? 'bg-red-50 text-red-800 line-through'
                                    : 'text-gray-600'
                              }`}
                            >
                              <span className="inline-block w-4 text-gray-400 select-none">
                                {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                              </span>
                              {line.text || '\u00A0'}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </TabsContent>
            )}

            {/* Test Tab */}
            <TabsContent value="test" className="flex-1 overflow-y-auto px-6 py-4 mt-0">
              <div className="space-y-4" data-testid="test-panel">
                {/* Variable Inputs */}
                {editVariables.length > 0 ? (
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-gray-500 uppercase">변수 입력</Label>
                    {editVariables.map(varName => (
                      <div key={varName} className="space-y-1">
                        <Label className="text-xs text-gray-600">{`{{${varName}}}`}</Label>
                        <Input
                          type="text"
                          value={testVariables[varName] ?? ''}
                          onChange={e => setTestVariables(prev => ({ ...prev, [varName]: e.target.value }))}
                          placeholder={`${varName} 값을 입력하세요`}
                          data-testid={`test-var-${varName}`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                    프롬프트에 {`{{변수}}`} 가 없습니다. 편집 탭에서 변수를 추가하면 여기에 입력 폼이 나타납니다.
                  </div>
                )}

                {/* Model & Moderation info */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>모델: <strong className="text-gray-700">{getModelName(editModelId)}</strong></span>
                  <span>·</span>
                  <span>모더레이션: <strong className="text-gray-700">{editModeration}</strong></span>
                </div>

                {/* Run Test */}
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm w-full"
                  onClick={handleRunTest}
                  disabled={isTesting || !editContent.trim()}
                  data-testid="run-test-button"
                >
                  {isTesting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      테스트 실행 중...
                    </>
                  ) : (
                    <>
                      <Play size={14} className="mr-1.5" /> 테스트 실행
                    </>
                  )}
                </Button>

                {/* Test Result */}
                {testResult && (
                  <div className="space-y-1" data-testid="test-result">
                    <Label className="text-xs font-bold text-gray-500 uppercase">모의 응답</Label>
                    <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Check size={12} className="text-green-600" />
                        <span className="text-xs font-bold text-green-700">응답 생성 완료</span>
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">{testResult}</div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={open => { if (!open) { setIsDeleteDialogOpen(false); setDeleteTarget(null); } }}>
        <DialogContent className="sm:max-w-[400px]" data-testid="delete-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              프롬프트 삭제
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-gray-600">
              <strong>{deleteTarget?.name}</strong>을(를) 삭제하시겠습니까?
            </p>
            <p className="text-xs text-gray-500 mt-1">
              이 작업은 되돌릴 수 없으며, 모든 버전 이력이 함께 삭제됩니다.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => { setIsDeleteDialogOpen(false); setDeleteTarget(null); }}>
              취소
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
              data-testid="confirm-delete-button"
            >
              삭제
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
