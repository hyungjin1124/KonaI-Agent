'use client';

import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getMarkdownComponents } from './markdownComponents';

export interface MarkdownRendererProps {
  content: string;
  className?: string;
  /** 채팅 버블 내부용 컴팩트 모드 (더 작은 여백/글꼴) */
  compact?: boolean;
}

// 모듈 레벨 상수 — 매 렌더마다 새 배열 생성 방지
const remarkPlugins = [remarkGfm];

export const MarkdownRenderer = memo<MarkdownRendererProps>(
  ({ content, className, compact = false }) => {
    const components = getMarkdownComponents(compact);

    return (
      <div className={className}>
        <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }
);

MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer;
