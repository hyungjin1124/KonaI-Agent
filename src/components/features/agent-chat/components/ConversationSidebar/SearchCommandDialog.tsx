'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Search, MessageSquare, FileText, Loader2 } from 'lucide-react';
import { ScrollArea } from '../../../../ui/scroll-area';
import { Separator } from '../../../../ui/separator';
import { cn } from '@/lib/utils';
import { AgentChatSession } from './mockSessions';
import { FileTreeNode } from './types';
import { MOCK_FILE_TREE } from './mockFileTree';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SearchCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: AgentChatSession[];
  onSessionSelect: (sessionId: string) => void;
  onFileSelect?: (file: FileTreeNode) => void;
}

type ResultCategory = 'conversation' | 'file';

interface SearchResult {
  id: string;
  category: ResultCategory;
  title: string;
  subtitle?: string;
  tags?: string[];
  status?: AgentChatSession['status'];
  raw: AgentChatSession | FileTreeNode;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const isMac =
  typeof navigator !== 'undefined' &&
  /mac/i.test(navigator.platform);

const statusDot: Record<string, string> = {
  running: 'bg-blue-500',
  hitl_pending: 'bg-orange-500',
  completed: 'bg-green-500',
};

type FlatFile = FileTreeNode & { path: string };

function flattenFileTree(nodes: FileTreeNode[], parentPath = ''): FlatFile[] {
  const result: FlatFile[] = [];
  for (const node of nodes) {
    const currentPath = parentPath ? `${parentPath} / ${node.name}` : node.name;
    if (node.type === 'file') {
      result.push({ ...node, path: currentPath });
    }
    if (node.children) {
      result.push(...flattenFileTree(node.children, currentPath));
    }
  }
  return result;
}

const MAX_PER_CATEGORY = 5;

/* ------------------------------------------------------------------ */
/*  SearchResultItem                                                   */
/* ------------------------------------------------------------------ */

function SearchResultItem({
  result,
  isSelected,
  onClick,
}: {
  result: SearchResult;
  isSelected: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isSelected) ref.current?.scrollIntoView({ block: 'nearest' });
  }, [isSelected]);

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-colors',
        isSelected
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-600 hover:bg-gray-50',
      )}
    >
      {/* Icon */}
      <span className="shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
        {result.category === 'conversation' ? (
          <MessageSquare className="w-4 h-4 text-gray-500" />
        ) : (
          <FileText className="w-4 h-4 text-gray-500" />
        )}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium truncate">{result.title}</div>
        {result.subtitle && (
          <div className="text-[11px] text-gray-400 truncate">{result.subtitle}</div>
        )}
      </div>

      {/* Tags */}
      {result.tags && result.tags.length > 0 && (
        <div className="flex gap-1 shrink-0">
          {result.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-[10px] font-medium text-gray-500 bg-gray-100 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Status dot */}
      {result.status && statusDot[result.status] && (
        <span className={cn('shrink-0 w-2 h-2 rounded-full', statusDot[result.status])} />
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  SearchCommandDialog                                                */
/* ------------------------------------------------------------------ */

export function SearchCommandDialog({
  open,
  onOpenChange,
  sessions,
  onSessionSelect,
  onFileSelect,
}: SearchCommandDialogProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten file tree once
  const flatFiles = useMemo(() => flattenFileTree(MOCK_FILE_TREE), []);

  // Filter results
  const { conversationResults, fileResults, allResults } = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return { conversationResults: [], fileResults: [], allResults: [] };

    const conversations: SearchResult[] = sessions
      .filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.tags?.some((t) => t.toLowerCase().includes(q)),
      )
      .slice(0, MAX_PER_CATEGORY)
      .map((s) => ({
        id: s.id,
        category: 'conversation' as const,
        title: s.title,
        subtitle: s.date,
        tags: s.tags,
        status: s.status,
        raw: s,
      }));

    const files: SearchResult[] = flatFiles
      .filter((f) => f.name.toLowerCase().includes(q))
      .slice(0, MAX_PER_CATEGORY)
      .map((f) => ({
        id: f.id,
        category: 'file' as const,
        title: f.name,
        subtitle: f.path !== f.name ? f.path.replace(` / ${f.name}`, '') : undefined,
        raw: f,
      }));

    return {
      conversationResults: conversations,
      fileResults: files,
      allResults: [...conversations, ...files],
    };
  }, [query, sessions, flatFiles]);

  // Reset selection when results change
  useEffect(() => setSelectedIndex(0), [allResults]);

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  // Handle result selection
  const handleSelect = useCallback(
    (result: SearchResult) => {
      if (result.category === 'conversation') {
        onSessionSelect(result.id);
      } else {
        onFileSelect?.(result.raw as FileTreeNode);
      }
      onOpenChange(false);
    },
    [onSessionSelect, onFileSelect, onOpenChange],
  );

  // Keyboard navigation inside the dialog
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, allResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allResults[selectedIndex]) handleSelect(allResults[selectedIndex]);
      }
    },
    [allResults, selectedIndex, handleSelect],
  );

  const hasQuery = query.trim().length > 0;
  const hasResults = allResults.length > 0;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Overlay — lighter than default */}
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />

        {/* Content — positioned at upper-third (Spotlight convention) */}
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[30%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-30%]
                     bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden
                     data-[state=open]:animate-in data-[state=closed]:animate-out
                     data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0
                     data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95
                     data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[32%]
                     data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[32%]
                     duration-200"
          onKeyDown={handleKeyDown}
        >
          {/* Accessible title (hidden) */}
          <DialogPrimitive.Title className="sr-only">검색</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            대화 및 파일을 검색합니다
          </DialogPrimitive.Description>

          {/* ---- Search Input ---- */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="대화 및 파일 검색..."
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-400"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 rounded border border-gray-200">
              {isMac ? '⌘' : 'Ctrl'}K
            </kbd>
          </div>

          {/* ---- Results Area ---- */}
          <ScrollArea className="max-h-[320px]">
            {/* Empty query state */}
            {!hasQuery && (
              <div className="px-4 py-10 text-center text-sm text-gray-400">
                대화 이름, 태그, 파일 이름으로 검색하세요
              </div>
            )}

            {/* No results */}
            {hasQuery && !hasResults && (
              <div className="px-4 py-10 text-center text-sm text-gray-400">
                검색 결과 없음
              </div>
            )}

            {/* Conversation results */}
            {conversationResults.length > 0 && (
              <div className="px-2 pt-2">
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  대화
                </div>
                {conversationResults.map((result, i) => (
                  <SearchResultItem
                    key={result.id}
                    result={result}
                    isSelected={i === selectedIndex}
                    onClick={() => handleSelect(result)}
                  />
                ))}
              </div>
            )}

            {/* File results */}
            {fileResults.length > 0 && (
              <div className="px-2 pb-2">
                {conversationResults.length > 0 && (
                  <Separator className="my-1 mx-2" />
                )}
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  파일
                </div>
                {fileResults.map((result, i) => (
                  <SearchResultItem
                    key={result.id}
                    result={result}
                    isSelected={conversationResults.length + i === selectedIndex}
                    onClick={() => handleSelect(result)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          {/* ---- Footer Hints ---- */}
          <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-4 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px] border border-gray-200">↑↓</kbd>
              이동
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px] border border-gray-200">↵</kbd>
              선택
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px] border border-gray-200">esc</kbd>
              닫기
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
