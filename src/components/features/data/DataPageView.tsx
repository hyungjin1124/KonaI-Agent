'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ViewTableFilters } from './components/ViewTableFilters';
import { ViewTableList } from './components/ViewTableList';
import { ViewTableSlidePanel } from './components/ViewTableSlidePanel';
import { ViewTableFormDialog } from './components/ViewTableFormDialog';
import { AccessPermissionEditDialog } from './components/AccessPermissionEditDialog';
import { VIEW_TABLES, getAccessTargets, getAccessSummary } from './data/viewTableMockData';
import { ADMIN_USERS, TEAM_LIST } from '../admin/data/userMockData';
import type { ViewTable, ViewTableDomain, SourceType, NonErpFormData, AccessTarget } from './types/data.types';

// ── Component ─────────────────────────────────────────────────────────────────

export default function DataPageView() {
  const searchParams = useSearchParams();

  // ── State ──────────────────────────────────────────────────────────────────
  const [viewTables, setViewTables] = useState<ViewTable[]>(
    () => VIEW_TABLES.map((vt) => ({
      ...vt,
      accessSummary: vt.accessSummary ?? getAccessSummary(vt.viewId),
    })),
  );
  const [selectedViewId, setSelectedViewId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState<ViewTableDomain | 'all'>('all');
  const [sourceTypeFilter, setSourceTypeFilter] = useState<SourceType | 'all'>('all');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingViewTable, setEditingViewTable] = useState<ViewTable | null>(null);
  const [isAccessEditOpen, setIsAccessEditOpen] = useState(false);
  const [nonErpAccessMap, setNonErpAccessMap] = useState<Record<string, AccessTarget[]>>({});

  // ── Derived ────────────────────────────────────────────────────────────────
  const selectedViewTable = useMemo(
    () => viewTables.find((vt) => vt.viewId === selectedViewId) ?? null,
    [viewTables, selectedViewId],
  );

  const selectedAccessTargets = useMemo(() => {
    if (!selectedViewTable) return [];
    if (selectedViewTable.sourceType !== 'ERP' && nonErpAccessMap[selectedViewTable.viewId] !== undefined) {
      return nonErpAccessMap[selectedViewTable.viewId];
    }
    return getAccessTargets(selectedViewTable.viewId);
  }, [selectedViewTable, nonErpAccessMap]);

  const filteredViewTables = useMemo(() => {
    let result = viewTables;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (vt) =>
          vt.viewId.toLowerCase().includes(q) ||
          vt.viewName.toLowerCase().includes(q) ||
          vt.description.toLowerCase().includes(q),
      );
    }
    if (domainFilter !== 'all') {
      result = result.filter((vt) => vt.domain === domainFilter);
    }
    if (sourceTypeFilter !== 'all') {
      result = result.filter((vt) => vt.sourceType === sourceTypeFilter);
    }
    return result;
  }, [viewTables, searchQuery, domainFilter, sourceTypeFilter]);

  // ── Auto-select from URL param (cross-navigation) ─────────────────────────
  useEffect(() => {
    const viewIdParam = searchParams.get('viewId');
    if (viewIdParam && viewTables.some((vt) => vt.viewId === viewIdParam)) {
      setSelectedViewId(viewIdParam);
      setIsPanelOpen(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleRowClick = useCallback((viewId: string) => {
    setSelectedViewId(viewId);
    setIsPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setIsExpanded(false);
    setSelectedViewId(null);
  }, []);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditingViewTable(null);
    setIsFormDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback(() => {
    // 비ERP 뷰만 편집 가능
    if (selectedViewTable && selectedViewTable.sourceType !== 'ERP') {
      setEditingViewTable(selectedViewTable);
      setIsFormDialogOpen(true);
    }
  }, [selectedViewTable]);

  const handleOpenEditAccess = useCallback(() => {
    setIsAccessEditOpen(true);
  }, []);

  const handleSaveAccess = useCallback((targets: AccessTarget[]) => {
    if (!selectedViewTable) return;
    const viewId = selectedViewTable.viewId;
    setNonErpAccessMap((prev) => ({ ...prev, [viewId]: targets }));
    const deptCount = targets.filter((t) => t.type !== '사용자').length;
    const userCount = targets.filter((t) => t.type === '사용자').length;
    setViewTables((prev) =>
      prev.map((vt) =>
        vt.viewId === viewId
          ? { ...vt, accessTargetCount: deptCount, userOverrideCount: userCount }
          : vt,
      ),
    );
  }, [selectedViewTable]);

  const handleSave = useCallback((formData: NonErpFormData) => {
    if (formData.viewId && viewTables.some((vt) => vt.viewId === formData.viewId) && !editingViewTable) {
      return; // duplicate check
    }

    const today = new Date().toISOString().slice(0, 10);
    const newViewTable: ViewTable = {
      viewId: formData.viewId,
      viewName: formData.viewName,
      description: formData.description,
      domain: formData.domain,
      sourceType: formData.sourceType,
      sourceConfig: formData.sourceConfig,
      authType: 'non_erp',
      pgmseqList: [],
      rlsType: null,
      rlsConfig: null,
      isActive: formData.isActive,
      updatedAt: today,
      accessTargetCount: 0,
      userOverrideCount: 0,
    };

    setViewTables((prev) => {
      if (editingViewTable) {
        return prev.map((vt) => (vt.viewId === editingViewTable.viewId ? newViewTable : vt));
      }
      return [newViewTable, ...prev];
    });
  }, [viewTables, editingViewTable]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-gray-50/30">
      {/* Page Header */}
      <div className="shrink-0 flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2.5">
          <Database className="h-5 w-5 text-gray-700" />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">데이터</h1>
            <p className="text-xs text-gray-500">
              {filteredViewTables.length}개 뷰테이블
              {searchQuery || domainFilter !== 'all' || sourceTypeFilter !== 'all'
                ? ` (전체 ${viewTables.length}개)`
                : ''}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-[#FF3C42] hover:bg-[#e63539] text-white gap-1.5"
          onClick={handleOpenCreate}
        >
          <Plus className="h-4 w-4" />
          등록
        </Button>
      </div>

      {/* Filter bar */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-8 py-3">
        <ViewTableFilters
          searchQuery={searchQuery}
          domainFilter={domainFilter}
          sourceTypeFilter={sourceTypeFilter}
          onSearchChange={setSearchQuery}
          onDomainChange={setDomainFilter}
          onSourceTypeChange={setSourceTypeFilter}
        />
      </div>

      {/* Main content: Table + Slide Panel */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {/* Table Area */}
        <div
          className={[
            'flex flex-col min-h-0 overflow-hidden transition-all duration-300 ease-in-out',
            isPanelOpen
              ? isExpanded
                ? 'w-0 opacity-0 overflow-hidden'
                : 'w-[55%]'
              : 'w-full',
          ].join(' ')}
        >
          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <ViewTableList
                viewTables={filteredViewTables}
                totalCount={viewTables.length}
                selectedId={selectedViewId}
                isPanelOpen={isPanelOpen}
                onRowClick={handleRowClick}
              />
            </div>
          </div>
        </div>

        {/* Slide Panel Area */}
        <div
          className={[
            'shrink-0 border-l border-gray-200 bg-white overflow-hidden transition-all duration-300 ease-in-out',
            isPanelOpen
              ? isExpanded
                ? 'w-full opacity-100'
                : 'w-[45%] opacity-100'
              : 'w-0 opacity-0 pointer-events-none',
          ].join(' ')}
        >
          {isPanelOpen && selectedViewTable && (
            <ViewTableSlidePanel
              key={selectedViewId ?? undefined}
              viewTable={selectedViewTable}
              isExpanded={isExpanded}
              onClose={handleClosePanel}
              onToggleExpand={handleToggleExpand}
              onEdit={handleOpenEdit}
              onEditAccess={handleOpenEditAccess}
              accessTargets={selectedAccessTargets}
            />
          )}
        </div>
      </div>

      {/* Form Dialog — 비ERP 전용 */}
      <ViewTableFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        editingViewTable={editingViewTable}
        onSave={handleSave}
      />

      {/* Access Permission Edit Dialog — 비ERP 전용 */}
      {selectedViewTable && selectedViewTable.sourceType !== 'ERP' && (
        <AccessPermissionEditDialog
          open={isAccessEditOpen}
          onOpenChange={setIsAccessEditOpen}
          viewName={selectedViewTable.viewName}
          currentTargets={selectedAccessTargets}
          availableDepts={TEAM_LIST}
          availableUsers={ADMIN_USERS.map((u) => ({ id: u.id, name: u.name, team: u.team }))}
          onSave={handleSaveAccess}
        />
      )}
    </div>
  );
}
