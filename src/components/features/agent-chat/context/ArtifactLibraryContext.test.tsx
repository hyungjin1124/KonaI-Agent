import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { ArtifactLibraryProvider, useArtifactLibrary } from './ArtifactLibraryContext';
import { Artifact } from '../types';

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ArtifactLibraryProvider>{children}</ArtifactLibraryProvider>
);

const mockArtifact: Artifact = {
  id: 'art-1',
  title: '테스트 문서',
  type: 'markdown',
  createdAt: new Date('2026-03-26T10:00:00Z'),
  messageId: 'msg-1',
  fileSize: '1.5 KB',
};

describe('ArtifactLibraryContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('renders without error', () => {
    const { result } = renderHook(() => useArtifactLibrary(), { wrapper });
    expect(result.current).toBeDefined();
    expect(result.current.libraryArtifacts).toEqual([]);
  });

  describe('AC2: saveArtifact — 자동 저장', () => {
    it('아티팩트를 라이브러리에 저장한다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      act(() => {
        result.current.saveArtifact(mockArtifact, '# 제목\n\n본문', 'conv-1');
      });

      expect(result.current.libraryArtifacts).toHaveLength(1);
      expect(result.current.libraryArtifacts[0].id).toBe('art-1');
      expect(result.current.libraryArtifacts[0].conversationId).toBe('conv-1');
    });

    it('중복 저장 시 updatedAt만 갱신한다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      act(() => {
        result.current.saveArtifact(mockArtifact, '내용1', 'conv-1');
      });

      const firstUpdatedAt = result.current.libraryArtifacts[0].updatedAt;

      act(() => {
        result.current.saveArtifact(mockArtifact, '내용2', 'conv-1');
      });

      expect(result.current.libraryArtifacts).toHaveLength(1);
      expect(result.current.libraryArtifacts[0].updatedAt.getTime()).toBeGreaterThanOrEqual(firstUpdatedAt.getTime());
    });
  });

  describe('AC3: 유형별 필터링', () => {
    it('유형 필터 적용 시 해당 타입만 반환한다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      const pdfArtifact: Artifact = { ...mockArtifact, id: 'art-2', title: 'PDF파일', type: 'pdf' };

      act(() => {
        result.current.saveArtifact(mockArtifact, '마크다운', 'conv-1');
        result.current.saveArtifact(pdfArtifact, undefined, 'conv-1');
      });

      expect(result.current.filteredArtifacts).toHaveLength(2);

      act(() => {
        result.current.setFilter({ types: ['pdf'] });
      });

      expect(result.current.filteredArtifacts).toHaveLength(1);
      expect(result.current.filteredArtifacts[0].type).toBe('pdf');
    });
  });

  describe('AC4: 키워드 검색', () => {
    it('검색어로 제목을 필터링한다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      const anotherArtifact: Artifact = { ...mockArtifact, id: 'art-3', title: '매출 분석 보고서' };

      act(() => {
        result.current.saveArtifact(mockArtifact, '', 'conv-1');
        result.current.saveArtifact(anotherArtifact, '', 'conv-1');
      });

      act(() => {
        result.current.setFilter({ searchQuery: '매출' });
      });

      expect(result.current.filteredArtifacts).toHaveLength(1);
      expect(result.current.filteredArtifacts[0].title).toBe('매출 분석 보고서');
    });
  });

  describe('AC5: 버전 히스토리', () => {
    it('버전 저장 후 getVersions로 조회한다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      act(() => {
        result.current.saveArtifact(mockArtifact, '초기 내용', 'conv-1');
      });

      act(() => {
        result.current.saveVersion('art-1', '수정된 내용', '내용 변경');
      });

      const versions = result.current.getVersions('art-1');
      expect(versions).toHaveLength(2); // 초기 + 수정
      expect(versions[1].content).toBe('수정된 내용');
      expect(versions[1].changeDescription).toBe('내용 변경');
    });
  });

  describe('AC6: 이전 버전 복원', () => {
    it('restoreVersion으로 이전 버전을 복원한다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      act(() => {
        result.current.saveArtifact(mockArtifact, '초기 내용', 'conv-1');
      });

      act(() => {
        result.current.saveVersion('art-1', '수정 내용', '수정');
      });

      const versionsBeforeRestore = result.current.getVersions('art-1');
      const firstVersionId = versionsBeforeRestore[0].id;

      act(() => {
        result.current.restoreVersion('art-1', firstVersionId);
      });

      const versionsAfterRestore = result.current.getVersions('art-1');
      expect(versionsAfterRestore).toHaveLength(3); // 초기 + 수정 + 복원
      const lastVersion = versionsAfterRestore[versionsAfterRestore.length - 1];
      expect(lastVersion.content).toBe('초기 내용');
      expect(lastVersion.changeDescription).toContain('복원');
    });
  });

  describe('AC9: localStorage 영속화', () => {
    it('아티팩트 저장 시 localStorage에 기록된다', async () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      act(() => {
        result.current.saveArtifact(mockArtifact, '내용', 'conv-1');
      });

      // useEffect 비동기 처리 대기
      await waitFor(() => {
        // 마지막 호출에서 아티팩트가 포함된 데이터 확인
        const calls = localStorageMock.setItem.mock.calls.filter(
          (c: string[]) => c[0] === 'konai-artifact-library'
        );
        const lastCall = calls[calls.length - 1];
        expect(lastCall).toBeDefined();
        const stored = JSON.parse(lastCall[1]);
        expect(stored.length).toBeGreaterThan(0);
      });

      const calls = localStorageMock.setItem.mock.calls.filter(
        (c: string[]) => c[0] === 'konai-artifact-library'
      );
      const lastCall = calls[calls.length - 1];
      const stored = JSON.parse(lastCall[1]);
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('art-1');
    });
  });

  describe('toggleFavorite', () => {
    it('즐겨찾기를 토글한다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      act(() => {
        result.current.saveArtifact(mockArtifact, '', 'conv-1');
      });

      expect(result.current.libraryArtifacts[0].isFavorited).toBe(false);

      act(() => {
        result.current.toggleFavorite('art-1');
      });

      expect(result.current.libraryArtifacts[0].isFavorited).toBe(true);
    });
  });

  describe('deleteArtifact', () => {
    it('아티팩트와 버전을 모두 삭제한다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      act(() => {
        result.current.saveArtifact(mockArtifact, '내용', 'conv-1');
      });

      expect(result.current.libraryArtifacts).toHaveLength(1);

      act(() => {
        result.current.deleteArtifact('art-1');
      });

      expect(result.current.libraryArtifacts).toHaveLength(0);
      expect(result.current.getVersions('art-1')).toHaveLength(0);
    });
  });
});
