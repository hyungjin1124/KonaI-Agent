'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { Artifact } from '../types';
import {
  LibraryArtifact,
  ArtifactVersion,
  ArtifactFilter,
  ArtifactLibraryContextValue,
  DEFAULT_ARTIFACT_FILTER,
  SerializedLibraryArtifact,
  SerializedArtifactVersion,
} from '../../../../types/artifact-library.types';

const STORAGE_KEY_ARTIFACTS = 'konai-artifact-library';
const STORAGE_KEY_VERSIONS = 'konai-artifact-versions';

// =============================================
// Serialization
// =============================================

function serializeArtifact(a: LibraryArtifact): SerializedLibraryArtifact {
  return {
    ...a,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    lastAccessedAt: a.lastAccessedAt.toISOString(),
  };
}

function deserializeArtifact(a: SerializedLibraryArtifact): LibraryArtifact {
  return {
    ...a,
    createdAt: new Date(a.createdAt),
    updatedAt: new Date(a.updatedAt),
    lastAccessedAt: new Date(a.lastAccessedAt),
  };
}

function serializeVersion(v: ArtifactVersion): SerializedArtifactVersion {
  return { ...v, createdAt: v.createdAt.toISOString() };
}

function deserializeVersion(v: SerializedArtifactVersion): ArtifactVersion {
  return { ...v, createdAt: new Date(v.createdAt) };
}

function loadArtifacts(): LibraryArtifact[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ARTIFACTS);
    if (!raw) return [];
    return (JSON.parse(raw) as SerializedLibraryArtifact[]).map(deserializeArtifact);
  } catch {
    return [];
  }
}

function loadVersions(): Record<string, ArtifactVersion[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VERSIONS);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, SerializedArtifactVersion[]>;
    const result: Record<string, ArtifactVersion[]> = {};
    for (const [key, versions] of Object.entries(parsed)) {
      result[key] = versions.map(deserializeVersion);
    }
    return result;
  } catch {
    return {};
  }
}

function persistArtifacts(artifacts: LibraryArtifact[]) {
  try {
    localStorage.setItem(STORAGE_KEY_ARTIFACTS, JSON.stringify(artifacts.map(serializeArtifact)));
  } catch { /* quota exceeded — 무시 */ }
}

function persistVersions(versions: Record<string, ArtifactVersion[]>) {
  try {
    const serialized: Record<string, SerializedArtifactVersion[]> = {};
    for (const [key, versionList] of Object.entries(versions)) {
      serialized[key] = versionList.map(serializeVersion);
    }
    localStorage.setItem(STORAGE_KEY_VERSIONS, JSON.stringify(serialized));
  } catch { /* quota exceeded — 무시 */ }
}

// =============================================
// Context
// =============================================

const ArtifactLibraryContext = createContext<ArtifactLibraryContextValue | null>(null);

export function useArtifactLibrary() {
  const ctx = useContext(ArtifactLibraryContext);
  if (!ctx) {
    throw new Error('useArtifactLibrary must be used within ArtifactLibraryProvider');
  }
  return ctx;
}

export function useArtifactLibraryOptional() {
  return useContext(ArtifactLibraryContext);
}

// =============================================
// Provider
// =============================================

export const ArtifactLibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [libraryArtifacts, setLibraryArtifacts] = useState<LibraryArtifact[]>(loadArtifacts);
  const [versions, setVersions] = useState<Record<string, ArtifactVersion[]>>(loadVersions);
  const [filter, setFilterState] = useState<ArtifactFilter>(DEFAULT_ARTIFACT_FILTER);

  // 영속화
  useEffect(() => { persistArtifacts(libraryArtifacts); }, [libraryArtifacts]);
  useEffect(() => { persistVersions(versions); }, [versions]);

  // 필터 업데이트
  const setFilter = useCallback((partial: Partial<ArtifactFilter>) => {
    setFilterState(prev => ({ ...prev, ...partial }));
  }, []);

  // 필터링 결과
  const filteredArtifacts = useMemo(() => {
    let result = [...libraryArtifacts];

    // 유형 필터
    if (filter.types.length > 0) {
      result = result.filter(a => filter.types.includes(a.type));
    }

    // 즐겨찾기
    if (filter.favoritesOnly) {
      result = result.filter(a => a.isFavorited);
    }

    // 키워드 검색
    if (filter.searchQuery.trim()) {
      const query = filter.searchQuery.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    // 정렬
    result.sort((a, b) => {
      let cmp = 0;
      switch (filter.sortBy) {
        case 'created': cmp = a.createdAt.getTime() - b.createdAt.getTime(); break;
        case 'modified': cmp = a.updatedAt.getTime() - b.updatedAt.getTime(); break;
        case 'name': cmp = a.title.localeCompare(b.title); break;
        case 'accessed': cmp = a.lastAccessedAt.getTime() - b.lastAccessedAt.getTime(); break;
      }
      return filter.sortDirection === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [libraryArtifacts, filter]);

  // 아티팩트 저장 (자동 저장)
  const saveArtifact = useCallback((artifact: Artifact, content?: string, conversationId?: string) => {
    setLibraryArtifacts(prev => {
      const existing = prev.find(a => a.id === artifact.id);
      if (existing) {
        // 이미 저장된 아티팩트면 updatedAt만 갱신
        return prev.map(a => a.id === artifact.id
          ? { ...a, updatedAt: new Date(), lastAccessedAt: new Date() }
          : a
        );
      }

      const now = new Date();
      const newArtifact: LibraryArtifact = {
        id: artifact.id,
        title: artifact.title,
        type: artifact.type,
        createdAt: artifact.createdAt,
        updatedAt: now,
        messageId: artifact.messageId,
        conversationId: conversationId || 'default',
        fileSize: artifact.fileSize,
        isFavorited: false,
        tags: [],
        versionCount: 1,
        lastAccessedAt: now,
      };
      return [...prev, newArtifact];
    });

    // 초기 버전 저장 (콘텐츠가 있을 때만)
    if (content) {
      setVersions(prev => {
        if (prev[artifact.id]?.length) return prev; // 이미 버전 있으면 스킵
        const initialVersion: ArtifactVersion = {
          id: `${artifact.id}-v1`,
          artifactId: artifact.id,
          versionNumber: 1,
          content,
          createdAt: artifact.createdAt,
          messageId: artifact.messageId,
          changeDescription: '초기 생성',
        };
        return { ...prev, [artifact.id]: [initialVersion] };
      });
    }
  }, []);

  // 아티팩트 삭제
  const deleteArtifact = useCallback((artifactId: string) => {
    setLibraryArtifacts(prev => prev.filter(a => a.id !== artifactId));
    setVersions(prev => {
      const next = { ...prev };
      delete next[artifactId];
      return next;
    });
  }, []);

  // 즐겨찾기 토글
  const toggleFavorite = useCallback((artifactId: string) => {
    setLibraryArtifacts(prev =>
      prev.map(a => a.id === artifactId ? { ...a, isFavorited: !a.isFavorited } : a)
    );
  }, []);

  // 버전 저장
  const saveVersion = useCallback((artifactId: string, content: string, changeDescription?: string) => {
    setVersions(prev => {
      const existing = prev[artifactId] || [];
      const nextNumber = existing.length + 1;
      const newVersion: ArtifactVersion = {
        id: `${artifactId}-v${nextNumber}`,
        artifactId,
        versionNumber: nextNumber,
        content,
        createdAt: new Date(),
        changeDescription,
      };
      return { ...prev, [artifactId]: [...existing, newVersion] };
    });

    // 메타데이터 업데이트
    setLibraryArtifacts(prev =>
      prev.map(a => a.id === artifactId
        ? { ...a, updatedAt: new Date(), versionCount: (a.versionCount || 0) + 1 }
        : a
      )
    );
  }, []);

  // 버전 복원
  const restoreVersion = useCallback((artifactId: string, versionId: string) => {
    setVersions(prev => {
      const existing = prev[artifactId] || [];
      const target = existing.find(v => v.id === versionId);
      if (!target) return prev;

      const nextNumber = existing.length + 1;
      const restoredVersion: ArtifactVersion = {
        id: `${artifactId}-v${nextNumber}`,
        artifactId,
        versionNumber: nextNumber,
        content: target.content,
        createdAt: new Date(),
        changeDescription: `v${target.versionNumber}에서 복원`,
      };
      return { ...prev, [artifactId]: [...existing, restoredVersion] };
    });

    setLibraryArtifacts(prev =>
      prev.map(a => a.id === artifactId
        ? { ...a, updatedAt: new Date(), versionCount: (a.versionCount || 0) + 1 }
        : a
      )
    );
  }, []);

  // 버전 조회
  const getVersions = useCallback((artifactId: string) => {
    return versions[artifactId] || [];
  }, [versions]);

  // 대화별 아티팩트 조회
  const getArtifactsByConversation = useCallback((conversationId: string) => {
    return libraryArtifacts.filter(a => a.conversationId === conversationId);
  }, [libraryArtifacts]);

  // 메시지 ID로 아티팩트 조회
  const getArtifactByMessageId = useCallback((messageId: string) => {
    return libraryArtifacts.find(a => a.messageId === messageId);
  }, [libraryArtifacts]);

  const value: ArtifactLibraryContextValue = useMemo(() => ({
    libraryArtifacts,
    versions,
    filter,
    setFilter,
    filteredArtifacts,
    saveArtifact,
    deleteArtifact,
    toggleFavorite,
    saveVersion,
    restoreVersion,
    getVersions,
    getArtifactsByConversation,
    getArtifactByMessageId,
  }), [libraryArtifacts, versions, filter, filteredArtifacts, setFilter, saveArtifact, deleteArtifact, toggleFavorite, saveVersion, restoreVersion, getVersions, getArtifactsByConversation, getArtifactByMessageId]);

  return (
    <ArtifactLibraryContext.Provider value={value}>
      {children}
    </ArtifactLibraryContext.Provider>
  );
};
