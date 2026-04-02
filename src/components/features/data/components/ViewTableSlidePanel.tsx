'use client';

import React, { useState } from 'react';
import { X, Maximize2, Minimize2, ArrowLeft } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { OverviewTab } from './tabs/OverviewTab';
import { SchemaTab } from './tabs/SchemaTab';
import { DataPreviewTab } from './tabs/DataPreviewTab';
import { AccessPermissionTab } from './tabs/AccessPermissionTab';
import { getViewSchema, getDataPreview } from '../data/viewTableMockData';
import type { ViewTable, AccessTarget } from '../types/data.types';

interface ViewTableSlidePanelProps {
  viewTable: ViewTable;
  isExpanded: boolean;
  onClose: () => void;
  onToggleExpand: () => void;
  onEdit: () => void;
  onEditAccess: () => void;
  accessTargets: AccessTarget[];
}

export function ViewTableSlidePanel({
  viewTable,
  isExpanded,
  onClose,
  onToggleExpand,
  onEdit,
  onEditAccess,
  accessTargets,
}: ViewTableSlidePanelProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const schema = getViewSchema(viewTable.viewId);
  const dataPreview = getDataPreview(viewTable.viewId);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        {isExpanded ? (
          <button
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            onClick={onToggleExpand}
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로
          </button>
        ) : (
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {viewTable.viewName}
            </h3>
            <p className="text-xs text-gray-400 truncate">{viewTable.viewId}</p>
          </div>
        )}

        <div className="flex items-center gap-1 ml-2">
          {isExpanded ? (
            <span className="text-sm font-semibold text-gray-900 flex-1 ml-2">
              {viewTable.viewName}
            </span>
          ) : (
            <button
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
              onClick={onToggleExpand}
              title="전체 확장"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          )}
          <button
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col flex-1 min-h-0"
      >
        <TabsList className="shrink-0 bg-transparent p-0 h-auto gap-0 rounded-none border-b border-gray-200 px-4">
          {(viewTable.sourceType === 'ERP'
            ? [
                { value: 'overview', label: '개요' },
                { value: 'schema', label: `스키마 (${schema.length})` },
                { value: 'data', label: '데이터' },
                { value: 'access', label: '접근 권한' },
              ]
            : [
                { value: 'overview', label: '개요' },
                { value: 'access', label: '접근 권한' },
              ]
          ).map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent px-3 pb-2.5 pt-2 text-xs font-medium text-gray-500 hover:text-gray-700 data-[state=active]:border-[#FF3C42] data-[state=active]:text-[#FF3C42] data-[state=active]:shadow-none"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="flex-1 min-h-0 mt-0">
          <OverviewTab viewTable={viewTable} onEdit={onEdit} />
        </TabsContent>

        {viewTable.sourceType === 'ERP' && (
          <TabsContent value="schema" className="flex-1 min-h-0 mt-0">
            <SchemaTab columns={schema} />
          </TabsContent>
        )}

        {viewTable.sourceType === 'ERP' && (
          <TabsContent value="data" className="flex-1 min-h-0 mt-0">
            <DataPreviewTab
              dataPreview={dataPreview}
              isTabActive={activeTab === 'data'}
              onExpand={onToggleExpand}
            />
          </TabsContent>
        )}

        <TabsContent value="access" className="flex-1 min-h-0 mt-0">
          <AccessPermissionTab
            viewTable={viewTable}
            accessTargets={accessTargets}
            onEditAccess={onEditAccess}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
