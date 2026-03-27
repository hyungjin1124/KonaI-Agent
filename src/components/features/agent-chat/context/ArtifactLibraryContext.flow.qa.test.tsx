import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
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

const createArtifact = (id: string, title: string, type: Artifact['type'] = 'markdown'): Artifact => ({
  id,
  title,
  type,
  createdAt: new Date('2026-03-26T10:00:00Z'),
  messageId: `msg-${id}`,
  fileSize: '1 KB',
});

describe('ArtifactLibraryContext — Flow QA Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // =============================================
  // Flow 1: 아티팩트 생성 → 라이브러리 저장 → 버전 추가 → 필터링 조회
  // 가장 흔한 사용 시나리오
  // =============================================

  describe('Flow 1: 생성 → 저장 → 버전 → 필터링', () => {
    it('전체 플로우가 정상 동작한다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      // 1. 아티팩트 생성 + 자동 저장
      act(() => {
        result.current.saveArtifact(createArtifact('art-1', '매출 보고서', 'markdown'), '# 매출 보고서\n\n초기 내용', 'conv-1');
        result.current.saveArtifact(createArtifact('art-2', '매출 차트', 'chart'), undefined, 'conv-1');
      });

      expect(result.current.libraryArtifacts).toHaveLength(2);
      expect(result.current.getVersions('art-1')).toHaveLength(1);

      // 2. 마크다운 편집 → 버전 저장
      act(() => {
        result.current.saveVersion('art-1', '# 매출 보고서\n\n수정된 내용', '내용 수정');
      });

      expect(result.current.getVersions('art-1')).toHaveLength(2);
      expect(result.current.libraryArtifacts.find(a => a.id === 'art-1')?.versionCount).toBe(2);

      // 3. 유형 필터로 마크다운만 조회
      act(() => {
        result.current.setFilter({ types: ['markdown'] });
      });

      expect(result.current.filteredArtifacts).toHaveLength(1);
      expect(result.current.filteredArtifacts[0].id).toBe('art-1');

      // 4. 필터 해제
      act(() => {
        result.current.setFilter({ types: [] });
      });

      expect(result.current.filteredArtifacts).toHaveLength(2);
    });
  });

  // =============================================
  // Flow 2: 마지막 아티팩트 삭제 (종료 상태 시나리오)
  // 가장 파괴적인 시나리오
  // =============================================

  describe('Flow 2: 마지막 아티팩트 삭제', () => {
    it('마지막 아티팩트 삭제 후 빈 상태로 전환된다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      // 아티팩트 1개만 저장
      act(() => {
        result.current.saveArtifact(createArtifact('art-1', '유일한 문서'), '내용', 'conv-1');
      });

      expect(result.current.libraryArtifacts).toHaveLength(1);
      expect(result.current.filteredArtifacts).toHaveLength(1);

      // 삭제
      act(() => {
        result.current.deleteArtifact('art-1');
      });

      // 빈 상태 확인
      expect(result.current.libraryArtifacts).toHaveLength(0);
      expect(result.current.filteredArtifacts).toHaveLength(0);
      expect(result.current.getVersions('art-1')).toHaveLength(0);
    });

    it('필터 활성화 상태에서 마지막 매칭 아티팩트 삭제', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      act(() => {
        result.current.saveArtifact(createArtifact('art-1', '문서', 'markdown'), '', 'c1');
        result.current.saveArtifact(createArtifact('art-2', '차트', 'chart'), '', 'c1');
      });

      // markdown 필터 활성화
      act(() => { result.current.setFilter({ types: ['markdown'] }); });
      expect(result.current.filteredArtifacts).toHaveLength(1);

      // markdown 아티팩트 삭제
      act(() => { result.current.deleteArtifact('art-1'); });

      // filteredArtifacts가 빈 배열이지만 libraryArtifacts에는 chart가 남아있음
      expect(result.current.filteredArtifacts).toHaveLength(0);
      expect(result.current.libraryArtifacts).toHaveLength(1);
    });
  });

  // =============================================
  // Flow 3: 대화별 아티팩트 격리 검증
  // 대화 독립 생명주기 검증
  // =============================================

  describe('Flow 3: 대화별 아티팩트 격리', () => {
    it('서로 다른 대화의 아티팩트가 독립적으로 조회된다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      act(() => {
        result.current.saveArtifact(createArtifact('art-1', '대화1 문서'), '내용1', 'conv-1');
        result.current.saveArtifact(createArtifact('art-2', '대화2 문서'), '내용2', 'conv-2');
        result.current.saveArtifact(createArtifact('art-3', '대화1 차트'), undefined, 'conv-1');
      });

      // 전체 라이브러리
      expect(result.current.libraryArtifacts).toHaveLength(3);

      // 대화별 조회
      expect(result.current.getArtifactsByConversation('conv-1')).toHaveLength(2);
      expect(result.current.getArtifactsByConversation('conv-2')).toHaveLength(1);

      // conv-1 아티팩트 삭제해도 conv-2는 유지
      act(() => {
        result.current.deleteArtifact('art-1');
        result.current.deleteArtifact('art-3');
      });

      expect(result.current.getArtifactsByConversation('conv-1')).toHaveLength(0);
      expect(result.current.getArtifactsByConversation('conv-2')).toHaveLength(1);
    });
  });

  // =============================================
  // 이중 상태 동기화 검증
  // versionCount와 실제 versions 배열의 동기화
  // =============================================

  describe('이중 상태 동기화: versionCount vs versions', () => {
    it('saveVersion 후 versionCount와 실제 versions 길이가 일치한다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      act(() => {
        result.current.saveArtifact(createArtifact('art-1', '문서'), '초기', 'c1');
      });

      // 초기: versionCount=1, versions.length=1
      expect(result.current.libraryArtifacts[0].versionCount).toBe(1);
      expect(result.current.getVersions('art-1')).toHaveLength(1);

      // 버전 추가
      act(() => { result.current.saveVersion('art-1', 'v2', '수정'); });
      expect(result.current.libraryArtifacts[0].versionCount).toBe(2);
      expect(result.current.getVersions('art-1')).toHaveLength(2);

      // 복원 (새 버전 추가)
      act(() => {
        const v1 = result.current.getVersions('art-1')[0];
        result.current.restoreVersion('art-1', v1.id);
      });
      expect(result.current.libraryArtifacts[0].versionCount).toBe(3);
      expect(result.current.getVersions('art-1')).toHaveLength(3);
    });
  });

  // =============================================
  // 즐겨찾기 + 삭제 복합 플로우
  // =============================================

  describe('즐겨찾기 + 삭제 복합 플로우', () => {
    it('즐겨찾기 상태의 아티팩트가 삭제된다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      act(() => {
        result.current.saveArtifact(createArtifact('art-1', '중요 문서'), '내용', 'c1');
        result.current.toggleFavorite('art-1');
      });

      expect(result.current.libraryArtifacts[0].isFavorited).toBe(true);

      act(() => { result.current.deleteArtifact('art-1'); });

      expect(result.current.libraryArtifacts).toHaveLength(0);
    });

    it('즐겨찾기 필터 활성화 중 즐겨찾기 해제 시 목록에서 사라진다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      act(() => {
        result.current.saveArtifact(createArtifact('art-1', '문서1'), '', 'c1');
        result.current.saveArtifact(createArtifact('art-2', '문서2'), '', 'c1');
        result.current.toggleFavorite('art-1');
        result.current.toggleFavorite('art-2');
      });

      // 즐겨찾기 필터 활성화
      act(() => { result.current.setFilter({ favoritesOnly: true }); });
      expect(result.current.filteredArtifacts).toHaveLength(2);

      // art-1 즐겨찾기 해제
      act(() => { result.current.toggleFavorite('art-1'); });
      expect(result.current.filteredArtifacts).toHaveLength(1);
      expect(result.current.filteredArtifacts[0].id).toBe('art-2');
    });
  });
});
