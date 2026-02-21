'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { ArtifactTab, Artifact, ArtifactPreviewType, Citation } from '../types';

const MAX_TABS = 8;

interface ArtifactPanelContextValue {
  // 탭 상태
  tabs: ArtifactTab[];
  activeTabId: string | null;
  activeTab: ArtifactTab | null;
  // 탭 액션
  openTab: (tab: ArtifactTab) => void;
  closeTab: (tabId: string) => void;
  switchTab: (tabId: string) => void;
  // 편의 메서드: Artifact에서 바로 탭 열기
  openArtifactTab: (artifact: Artifact, previewType: ArtifactPreviewType) => void;
  // 패널 상태
  isMaximized: boolean;
  toggleMaximize: () => void;
  isPanelOpen: boolean;
  closePanel: () => void;
  // 탭별 데이터 (AgentChatView에서 주입)
  documentData?: ArrayBuffer;
  csvContent?: string;
  citations?: Citation[];
  markdownContents: Record<string, string>;
  markdownEditingState: 'idle' | 'editing' | 'shimmer';
}

const ArtifactPanelContext = createContext<ArtifactPanelContextValue | null>(null);

export function useArtifactPanel() {
  const ctx = useContext(ArtifactPanelContext);
  if (!ctx) {
    throw new Error('useArtifactPanel must be used within ArtifactPanelProvider');
  }
  return ctx;
}

export function useArtifactPanelOptional() {
  return useContext(ArtifactPanelContext);
}

interface ArtifactPanelProviderProps {
  children: React.ReactNode;
  onPanelOpenChange?: (isOpen: boolean) => void;
  onActiveTabChange?: (tab: ArtifactTab | null) => void;
  // 외부 데이터 주입 (AgentChatView에서 전달)
  documentData?: ArrayBuffer;
  csvContent?: string;
  citations?: Citation[];
  markdownContents: Record<string, string>;
  markdownEditingState: 'idle' | 'editing' | 'shimmer';
}

export const ArtifactPanelProvider: React.FC<ArtifactPanelProviderProps> = ({
  children,
  onPanelOpenChange,
  onActiveTabChange,
  documentData,
  csvContent,
  citations,
  markdownContents,
  markdownEditingState,
}) => {
  const [tabs, setTabs] = useState<ArtifactTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const onPanelOpenChangeRef = useRef(onPanelOpenChange);
  onPanelOpenChangeRef.current = onPanelOpenChange;
  const onActiveTabChangeRef = useRef(onActiveTabChange);
  onActiveTabChangeRef.current = onActiveTabChange;

  const isPanelOpen = tabs.length > 0;

  const activeTab = tabs.find(t => t.id === activeTabId) || null;

  const openTab = useCallback((tab: ArtifactTab) => {
    setTabs(prev => {
      // 이미 열린 탭이면 활성화만
      const existing = prev.find(t => t.id === tab.id);
      if (existing) {
        setActiveTabId(tab.id);
        return prev;
      }

      // 최대 탭 수 초과 시 가장 오래된 비활성 탭 제거
      let next = [...prev];
      if (next.length >= MAX_TABS) {
        const removeIdx = next.findIndex(t => t.id !== tab.id);
        if (removeIdx >= 0) {
          next.splice(removeIdx, 1);
        }
      }

      next.push(tab);
      setActiveTabId(tab.id);
      return next;
    });
  }, []);

  const openArtifactTab = useCallback((artifact: Artifact, previewType: ArtifactPreviewType) => {
    openTab({
      id: artifact.id,
      artifact,
      previewType,
      title: artifact.title,
    });
  }, [openTab]);

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === tabId);
      if (idx === -1) return prev;

      const next = prev.filter(t => t.id !== tabId);

      setActiveTabId(currentActive => {
        if (currentActive === tabId) {
          if (next.length === 0) return null;
          const newIdx = Math.min(idx, next.length - 1);
          return next[newIdx].id;
        }
        return currentActive;
      });

      return next;
    });
  }, []);

  const switchTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const toggleMaximize = useCallback(() => {
    setIsMaximized(prev => !prev);
  }, []);

  const closePanel = useCallback(() => {
    setTabs([]);
    setActiveTabId(null);
    setIsMaximized(false);
  }, []);

  // 패널 open/close 상태 변경 알림
  useEffect(() => {
    onPanelOpenChangeRef.current?.(isPanelOpen);
  }, [isPanelOpen]);

  // 활성 탭 변경 알림
  useEffect(() => {
    const tab = tabs.find(t => t.id === activeTabId) || null;
    onActiveTabChangeRef.current?.(tab);
  }, [activeTabId, tabs]);

  // 키보드 내비게이션 (패널 열린 상태에서만)
  useEffect(() => {
    if (!isPanelOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      // Ctrl+W: 현재 탭 닫기
      if (isCtrl && e.key === 'w' && activeTabId) {
        e.preventDefault();
        closeTab(activeTabId);
        return;
      }

      // Ctrl+Tab / Ctrl+Shift+Tab: 탭 전환
      if (isCtrl && e.key === 'Tab') {
        e.preventDefault();
        setTabs(currentTabs => {
          if (currentTabs.length <= 1) return currentTabs;

          setActiveTabId(currentActive => {
            const currentIdx = currentTabs.findIndex(t => t.id === currentActive);
            if (currentIdx === -1) return currentActive;

            const direction = e.shiftKey ? -1 : 1;
            const nextIdx = (currentIdx + direction + currentTabs.length) % currentTabs.length;
            return currentTabs[nextIdx].id;
          });

          return currentTabs;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, activeTabId, closeTab]);

  const value: ArtifactPanelContextValue = {
    tabs,
    activeTabId,
    activeTab,
    openTab,
    closeTab,
    switchTab,
    openArtifactTab,
    isMaximized,
    toggleMaximize,
    isPanelOpen,
    closePanel,
    documentData,
    csvContent,
    citations,
    markdownContents,
    markdownEditingState,
  };

  return (
    <ArtifactPanelContext.Provider value={value}>
      {children}
    </ArtifactPanelContext.Provider>
  );
};
