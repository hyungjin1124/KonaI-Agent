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

const mockArtifact: Artifact = {
  id: 'art-1',
  title: '테스트 문서',
  type: 'markdown',
  createdAt: new Date('2026-03-26T10:00:00Z'),
  messageId: 'msg-1',
  fileSize: '1.5 KB',
};

describe('ArtifactLibraryContext — QA Edge Cases', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // =============================================
  // 데이터 경계 테스트
  // =============================================

  describe('빈 데이터 경계', () => {
    it('빈 라이브러리에서 filteredArtifacts는 빈 배열이다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });
      expect(result.current.filteredArtifacts).toEqual([]);
    });

    it('존재하지 않는 artifactId로 getVersions 호출 시 빈 배열 반환', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });
      expect(result.current.getVersions('nonexistent')).toEqual([]);
    });

    it('존재하지 않는 conversationId로 getArtifactsByConversation 호출 시 빈 배열 반환', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });
      expect(result.current.getArtifactsByConversation('nonexistent')).toEqual([]);
    });

    it('존재하지 않는 messageId로 getArtifactByMessageId 호출 시 undefined 반환', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });
      expect(result.current.getArtifactByMessageId('nonexistent')).toBeUndefined();
    });

    it('content 없이 saveArtifact 호출 시 초기 버전이 생성되지 않는다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });
      act(() => {
        result.current.saveArtifact(mockArtifact, undefined, 'conv-1');
      });
      expect(result.current.libraryArtifacts).toHaveLength(1);
      expect(result.current.getVersions('art-1')).toHaveLength(0);
    });
  });

  describe('대량 데이터', () => {
    it('100개 아티팩트 저장 후 필터링이 정상 동작한다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.saveArtifact(
            { ...mockArtifact, id: `art-${i}`, title: `문서 ${i}`, type: i % 2 === 0 ? 'markdown' : 'pdf' },
            undefined,
            'conv-1'
          );
        }
      });

      expect(result.current.libraryArtifacts).toHaveLength(100);

      act(() => {
        result.current.setFilter({ types: ['pdf'] });
      });

      expect(result.current.filteredArtifacts).toHaveLength(50);
    });
  });

  describe('특수 문자 및 긴 텍스트', () => {
    it('특수 문자가 포함된 제목으로 검색이 동작한다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      const specialArtifact: Artifact = {
        ...mockArtifact,
        id: 'art-special',
        title: '<script>alert("XSS")</script> 문서 & "따옴표"',
      };

      act(() => {
        result.current.saveArtifact(specialArtifact, '', 'conv-1');
      });

      act(() => {
        result.current.setFilter({ searchQuery: 'script' });
      });

      expect(result.current.filteredArtifacts).toHaveLength(1);
    });

    it('매우 긴 제목의 아티팩트가 정상 저장된다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      const longTitle = 'A'.repeat(1000);
      act(() => {
        result.current.saveArtifact(
          { ...mockArtifact, id: 'art-long', title: longTitle },
          '',
          'conv-1'
        );
      });

      expect(result.current.libraryArtifacts[0].title).toBe(longTitle);
    });

    it('이모지가 포함된 제목으로 검색이 동작한다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      act(() => {
        result.current.saveArtifact(
          { ...mockArtifact, id: 'art-emoji', title: '📊 매출 분석 보고서 🔥' },
          '',
          'conv-1'
        );
      });

      act(() => {
        result.current.setFilter({ searchQuery: '매출' });
      });

      expect(result.current.filteredArtifacts).toHaveLength(1);
    });
  });

  // =============================================
  // 상태 전환 테스트
  // =============================================

  describe('상태 전환', () => {
    it('삭제 후 동일 ID로 재저장이 가능하다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      act(() => {
        result.current.saveArtifact(mockArtifact, '내용1', 'conv-1');
      });
      expect(result.current.libraryArtifacts).toHaveLength(1);

      act(() => {
        result.current.deleteArtifact('art-1');
      });
      expect(result.current.libraryArtifacts).toHaveLength(0);

      act(() => {
        result.current.saveArtifact(mockArtifact, '내용2', 'conv-1');
      });
      expect(result.current.libraryArtifacts).toHaveLength(1);
    });

    it('존재하지 않는 아티팩트 삭제 시 에러가 발생하지 않는다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      expect(() => {
        act(() => {
          result.current.deleteArtifact('nonexistent');
        });
      }).not.toThrow();
    });

    it('존재하지 않는 아티팩트에 toggleFavorite 호출 시 에러가 발생하지 않는다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      expect(() => {
        act(() => {
          result.current.toggleFavorite('nonexistent');
        });
      }).not.toThrow();
    });

    it('존재하지 않는 아티팩트에 saveVersion 호출 시 에러가 발생하지 않는다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      expect(() => {
        act(() => {
          result.current.saveVersion('nonexistent', '내용');
        });
      }).not.toThrow();
    });

    it('존재하지 않는 versionId로 restoreVersion 호출 시 에러가 발생하지 않는다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      act(() => {
        result.current.saveArtifact(mockArtifact, '내용', 'conv-1');
      });

      expect(() => {
        act(() => {
          result.current.restoreVersion('art-1', 'nonexistent-version');
        });
      }).not.toThrow();
    });
  });

  // =============================================
  // 복합 필터 테스트
  // =============================================

  describe('복합 필터', () => {
    it('유형 필터 + 검색어 + 즐겨찾기를 동시에 적용한다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      act(() => {
        result.current.saveArtifact({ ...mockArtifact, id: 'a1', title: '매출 보고서', type: 'markdown' }, '', 'c1');
        result.current.saveArtifact({ ...mockArtifact, id: 'a2', title: '매출 차트', type: 'chart' }, '', 'c1');
        result.current.saveArtifact({ ...mockArtifact, id: 'a3', title: '매출 PDF', type: 'pdf' }, '', 'c1');
        result.current.saveArtifact({ ...mockArtifact, id: 'a4', title: '기타 문서', type: 'markdown' }, '', 'c1');
      });

      // a1만 즐겨찾기
      act(() => { result.current.toggleFavorite('a1'); });

      // 복합 필터: markdown + 검색어 '매출' + 즐겨찾기
      act(() => {
        result.current.setFilter({
          types: ['markdown'],
          searchQuery: '매출',
          favoritesOnly: true,
        });
      });

      expect(result.current.filteredArtifacts).toHaveLength(1);
      expect(result.current.filteredArtifacts[0].id).toBe('a1');
    });

    it('빈 검색어로 필터 적용 시 모든 아티팩트가 반환된다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      act(() => {
        result.current.saveArtifact(mockArtifact, '', 'c1');
      });

      act(() => {
        result.current.setFilter({ searchQuery: '   ' }); // 공백만
      });

      expect(result.current.filteredArtifacts).toHaveLength(1);
    });
  });

  // =============================================
  // 정렬 테스트
  // =============================================

  describe('정렬', () => {
    it('이름 기준 오름차순 정렬이 동작한다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      act(() => {
        result.current.saveArtifact({ ...mockArtifact, id: 'a1', title: 'C 문서' }, '', 'c1');
        result.current.saveArtifact({ ...mockArtifact, id: 'a2', title: 'A 문서' }, '', 'c1');
        result.current.saveArtifact({ ...mockArtifact, id: 'a3', title: 'B 문서' }, '', 'c1');
      });

      act(() => {
        result.current.setFilter({ sortBy: 'name', sortDirection: 'asc' });
      });

      expect(result.current.filteredArtifacts.map(a => a.title)).toEqual(['A 문서', 'B 문서', 'C 문서']);
    });
  });

  // =============================================
  // 버전 히스토리 엣지 케이스
  // =============================================

  describe('버전 히스토리 엣지 케이스', () => {
    it('동일 버전 연속 저장 시 버전 번호가 순차 증가한다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      act(() => {
        result.current.saveArtifact(mockArtifact, '초기', 'c1');
      });

      for (let i = 2; i <= 5; i++) {
        act(() => {
          result.current.saveVersion('art-1', `내용 v${i}`, `수정 ${i}`);
        });
      }

      const versions = result.current.getVersions('art-1');
      expect(versions).toHaveLength(5); // 초기 1 + 추가 4
      expect(versions.map(v => v.versionNumber)).toEqual([1, 2, 3, 4, 5]);
    });

    it('복원 후 다시 복원할 수 있다 (연쇄 복원)', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      act(() => {
        result.current.saveArtifact(mockArtifact, '초기', 'c1');
        result.current.saveVersion('art-1', 'v2 내용', 'v2');
        result.current.saveVersion('art-1', 'v3 내용', 'v3');
      });

      // v1로 복원
      act(() => {
        const versions = result.current.getVersions('art-1');
        result.current.restoreVersion('art-1', versions[0].id);
      });

      // 복원된 것(v4)이 최신
      let versions = result.current.getVersions('art-1');
      expect(versions).toHaveLength(4);
      expect(versions[3].content).toBe('초기');

      // v2로 다시 복원
      act(() => {
        result.current.restoreVersion('art-1', versions[1].id);
      });

      versions = result.current.getVersions('art-1');
      expect(versions).toHaveLength(5);
      expect(versions[4].content).toBe('v2 내용');
    });
  });

  // =============================================
  // localStorage 엣지 케이스
  // =============================================

  describe('localStorage 엣지 케이스', () => {
    it('localStorage에 잘못된 JSON이 있어도 에러 없이 빈 배열로 시작한다', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'konai-artifact-library') return 'invalid json{{{';
        return null;
      });

      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });
      expect(result.current.libraryArtifacts).toEqual([]);
    });

    it('localStorage quota exceeded 시 에러가 발생하지 않는다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      localStorageMock.setItem.mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });

      expect(() => {
        act(() => {
          result.current.saveArtifact(mockArtifact, '내용', 'c1');
        });
      }).not.toThrow();
    });
  });

  // =============================================
  // 태그 검색 테스트
  // =============================================

  describe('태그 검색', () => {
    it('태그가 없는 아티팩트도 제목으로 검색된다', () => {
      const { result } = renderHook(() => useArtifactLibrary(), { wrapper });

      act(() => {
        result.current.saveArtifact(mockArtifact, '', 'c1');
      });

      // tags는 빈 배열로 생성됨
      expect(result.current.libraryArtifacts[0].tags).toEqual([]);

      act(() => {
        result.current.setFilter({ searchQuery: '테스트' });
      });

      expect(result.current.filteredArtifacts).toHaveLength(1);
    });
  });
});
