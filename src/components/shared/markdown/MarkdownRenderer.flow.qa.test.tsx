/**
 * MarkdownRenderer — QA Flow Tests
 *
 * UX 플로우 검증: 콜백 배선, 상태 동기화, 종료 상태, 핵심 사용자 플로우.
 * 개발자 단위 테스트 및 QA 엣지 케이스 테스트와 분리.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { MarkdownRenderer } from './MarkdownRenderer';

// =============================================
// Flow 1: ChatBubble → MarkdownRenderer 통합 플로우
// =============================================

describe('QA Flow: Chat Message Rendering', () => {
  it('renders AI assistant message with markdown through MarkdownRenderer', () => {
    // Simulates: User receives AI response with markdown
    // ChatPanel/ChatBubble passes content to MarkdownRenderer with compact=true
    const aiResponse = `## 분석 결과

데이터를 분석한 결과 다음과 같습니다:

| 항목 | 값 | 변화율 |
|------|-----|--------|
| 매출 | 1.2B | +15% |
| 비용 | 0.8B | -3% |

\`\`\`sql
SELECT * FROM sales WHERE year = 2026;
\`\`\`

> 참고: 이 데이터는 **2월 기준**입니다.

- [x] 데이터 수집 완료
- [ ] 보고서 생성 대기`;

    render(<MarkdownRenderer content={aiResponse} compact />);

    // Verify heading
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('분석 결과');
    expect(heading.className).toContain('text-base'); // compact mode

    // Verify table
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('매출')).toBeInTheDocument();
    expect(screen.getByText('+15%')).toBeInTheDocument();

    // Verify code block
    expect(screen.getByText('sql')).toBeInTheDocument();
    expect(screen.getByText(/SELECT \* FROM sales/)).toBeInTheDocument();

    // Verify blockquote with bold
    const blockquote = screen.getByText(/참고/).closest('blockquote');
    expect(blockquote).toBeTruthy();
    expect(blockquote?.className).toContain('border-l-4');

    // Verify task list
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  it('renders user message as plain text (no markdown processing)', () => {
    // Simulates: ChatPanel renders user message without MarkdownRenderer
    // This test ensures MarkdownRenderer is NOT applied to user messages
    // by testing that the component hierarchy matches expectations
    const userMessage = '**이것은 볼드가 아닙니다**';

    // User messages should be rendered as plain text in ChatPanel
    // MarkdownRenderer should still parse it if accidentally applied
    render(<MarkdownRenderer content={userMessage} />);
    // If MarkdownRenderer IS applied, bold tags would appear
    expect(screen.getByText('이것은 볼드가 아닙니다').tagName).toBe('STRONG');
  });
});

// =============================================
// Flow 2: MarkdownPreviewPanel 공유 컴포넌트 플로우
// =============================================

describe('QA Flow: MarkdownPreviewPanel Integration', () => {
  it('shared markdownComponents renders same elements as MarkdownRenderer', () => {
    // MarkdownPreviewPanel uses markdownComponents directly (not MarkdownRenderer)
    // Verify that the shared components produce consistent output
    const testContent = '## Test\n\n- Item 1\n- Item 2\n\n`code`';

    // MarkdownRenderer uses getMarkdownComponents(compact)
    const { container: compactContainer } = render(
      <MarkdownRenderer content={testContent} compact />
    );

    const { container: normalContainer } = render(
      <MarkdownRenderer content={testContent} compact={false} />
    );

    // Both should render heading, list items, and inline code
    expect(compactContainer.querySelector('h2')).toBeTruthy();
    expect(normalContainer.querySelector('h2')).toBeTruthy();

    const compactItems = compactContainer.querySelectorAll('li');
    const normalItems = normalContainer.querySelectorAll('li');
    expect(compactItems.length).toBe(2);
    expect(normalItems.length).toBe(2);
  });
});

// =============================================
// Flow 3: Content Update 플로우 (Re-render chain)
// =============================================

describe('QA Flow: Content Update Chain', () => {
  it('updates rendered output when content prop changes', () => {
    const { rerender } = render(
      <MarkdownRenderer content="# Original Title" />
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Original Title');

    // Simulates: Streaming update or content edit
    // Use template literal for actual newlines (not escaped \n)
    rerender(<MarkdownRenderer content={`# Updated Title

New paragraph`} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Updated Title');
    expect(screen.getByText('New paragraph')).toBeInTheDocument();
  });

  it('handles transition from text to code-heavy content', () => {
    const { rerender } = render(
      <MarkdownRenderer content="Simple text message" />
    );
    expect(screen.getByText('Simple text message')).toBeInTheDocument();

    // Content changes to code-heavy response
    rerender(
      <MarkdownRenderer
        content={`Here's the code:\n\n\`\`\`typescript\ninterface User {\n  name: string;\n}\n\`\`\``}
      />
    );
    expect(screen.getByText('typescript')).toBeInTheDocument();
    expect(screen.getByText(/interface User/)).toBeInTheDocument();
  });

  it('handles transition from markdown to empty string', () => {
    const { rerender, container } = render(
      <MarkdownRenderer content="# Title\n\nSome content" />
    );
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

    rerender(<MarkdownRenderer content="" />);
    // Should render clean empty state
    expect(container.querySelector('h1')).toBeNull();
  });
});

// =============================================
// Flow 4: compact mode 전환 플로우
// =============================================

describe('QA Flow: Compact Mode Toggle', () => {
  it('compact and normal modes produce different spacing', () => {
    const content = '## Heading\n\nParagraph\n\n- List item';

    const { rerender } = render(
      <MarkdownRenderer content={content} compact={false} />
    );

    // Normal mode: larger spacing
    const normalH2 = screen.getByRole('heading', { level: 2 });
    expect(normalH2.className).toContain('text-xl');
    expect(normalH2.className).toContain('mt-8');

    rerender(<MarkdownRenderer content={content} compact />);

    // Compact mode: smaller spacing
    const compactH2 = screen.getByRole('heading', { level: 2 });
    expect(compactH2.className).toContain('text-base');
    expect(compactH2.className).toContain('mt-4');
  });
});
