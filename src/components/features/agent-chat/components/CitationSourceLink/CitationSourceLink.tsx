import React from 'react';
import { CitationBadge } from './CitationBadge';
import { SourceLinkList } from './SourceLinkList';
import { Citation } from '../../types';

interface CitationSourceLinkProps {
  citations: Citation[];
}

/**
 * CitationSourceLink — 에이전트 응답에 출처 인용 뱃지와 소스 링크 목록을 표시
 *
 * 사용법:
 * 1. 인라인 뱃지: <CitationBadge citation={...} /> 를 텍스트 중간에 삽입
 * 2. 전체 출처 블록: <CitationSourceLink citations={[...]} /> 를 응답 하단에 배치
 */
export const CitationSourceLink: React.FC<CitationSourceLinkProps> = ({
  citations,
}) => {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-2">
      {/* 인라인 뱃지 요약 */}
      <div className="flex flex-wrap items-center gap-1 mb-1">
        {citations.map((citation) => (
          <CitationBadge key={citation.id} citation={citation} />
        ))}
      </div>

      {/* 하단 소스 링크 목록 */}
      <SourceLinkList citations={citations} />
    </div>
  );
};
