'use client';

import { useEffect, useRef } from 'react';
import { Artifact } from '../../types';
import { useArtifactLibraryOptional } from '../../context/ArtifactLibraryContext';

interface ArtifactAutoSaveBridgeProps {
  artifacts: Artifact[];
  markdownContents: Record<string, string>;
  conversationId?: string;
}

/**
 * 브릿지 컴포넌트: AgentChatView의 artifacts 상태 변경을 감지하여
 * ArtifactLibraryContext에 자동 저장합니다.
 *
 * ArtifactLibraryProvider 내부에 렌더링되어야 합니다.
 */
export function ArtifactAutoSaveBridge({
  artifacts,
  markdownContents,
  conversationId = 'default',
}: ArtifactAutoSaveBridgeProps) {
  const library = useArtifactLibraryOptional();
  const prevArtifactsRef = useRef<Set<string>>(new Set());
  const prevMarkdownRef = useRef<Record<string, string>>({});

  // 새 아티팩트 감지 → 라이브러리에 자동 저장
  useEffect(() => {
    if (!library) return;

    const prevIds = prevArtifactsRef.current;
    for (const artifact of artifacts) {
      if (!prevIds.has(artifact.id)) {
        const content = markdownContents[artifact.id];
        library.saveArtifact(artifact, content, conversationId);
      }
    }
    prevArtifactsRef.current = new Set(artifacts.map(a => a.id));
  }, [artifacts, library, conversationId, markdownContents]);

  // 마크다운 콘텐츠 변경 감지 → 버전 저장
  useEffect(() => {
    if (!library) return;

    const prev = prevMarkdownRef.current;
    for (const [id, content] of Object.entries(markdownContents)) {
      if (prev[id] && prev[id] !== content) {
        library.saveVersion(id, content, '내용 수정');
      }
    }
    prevMarkdownRef.current = { ...markdownContents };
  }, [markdownContents, library]);

  return null;
}
