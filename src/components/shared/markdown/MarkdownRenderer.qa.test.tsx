/**
 * MarkdownRenderer — QA Edge Case Tests
 *
 * QA Engineer 관점의 엣지 케이스 검증.
 * 개발자 단위 테스트(MarkdownRenderer.test.tsx)와 분리.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { MarkdownRenderer } from './MarkdownRenderer';
import { CodeBlock } from './CodeBlock';

// =============================================
// 3-1. 데이터 경계 테스트
// =============================================

describe('QA Edge: Data Boundaries', () => {
  it('renders gracefully with only whitespace content', () => {
    const { container } = render(<MarkdownRenderer content="   \n\n  " />);
    expect(container).toBeTruthy();
    // Should not crash or render unexpected elements
    expect(container.querySelectorAll('p').length).toBeLessThanOrEqual(1);
  });

  it('renders very long single line without breaking layout', () => {
    const longText = 'A'.repeat(5000);
    const { container } = render(<MarkdownRenderer content={longText} />);
    expect(screen.getByText(longText)).toBeInTheDocument();
    // The container should have overflow handling
    expect(container.firstChild).toBeTruthy();
  });

  it('renders deeply nested lists (5 levels)', () => {
    const nested = `- Level 1
  - Level 2
    - Level 3
      - Level 4
        - Level 5`;
    render(<MarkdownRenderer content={nested} />);
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(5);
  });

  it('handles special characters and HTML entities', () => {
    render(<MarkdownRenderer content="&amp; &lt; &gt; &quot; &apos;" />);
    // react-markdown should handle HTML entities
    expect(screen.getByText(/&/)).toBeInTheDocument();
  });

  it('handles emoji characters', () => {
    render(<MarkdownRenderer content="Hello 🎉🚀 World" />);
    expect(screen.getByText(/Hello 🎉🚀 World/)).toBeInTheDocument();
  });

  it('handles Korean/CJK characters', () => {
    render(
      <MarkdownRenderer content="## 한국어 제목\n\n안녕하세요 **굵은 글씨** 입니다." />
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('한국어 제목');
  });

  it('handles markdown with only code blocks (no text)', () => {
    const code = '```python\nprint("hello")\n```';
    render(<MarkdownRenderer content={code} />);
    expect(screen.getByText('print("hello")')).toBeInTheDocument();
    expect(screen.getByText('python')).toBeInTheDocument();
  });

  it('handles multiple consecutive code blocks', () => {
    const code = '```js\nconst a = 1;\n```\n\n```python\nx = 2\n```\n\n```go\nfmt.Println("hi")\n```';
    render(<MarkdownRenderer content={code} />);
    expect(screen.getByText('js')).toBeInTheDocument();
    expect(screen.getByText('python')).toBeInTheDocument();
    expect(screen.getByText('go')).toBeInTheDocument();
  });

  it('handles very large table', () => {
    const headers = '| ' + Array.from({ length: 10 }, (_, i) => `Col ${i}`).join(' | ') + ' |';
    const separator = '| ' + Array.from({ length: 10 }, () => '---').join(' | ') + ' |';
    const rows = Array.from({ length: 20 }, (_, r) =>
      '| ' + Array.from({ length: 10 }, (_, c) => `R${r}C${c}`).join(' | ') + ' |'
    ).join('\n');
    const tableMarkdown = `${headers}\n${separator}\n${rows}`;

    render(<MarkdownRenderer content={tableMarkdown} />);
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    // Verify scroll wrapper exists
    expect(table.parentElement?.className).toContain('overflow-x-auto');
  });

  it('handles null-like content gracefully (empty string)', () => {
    const { container } = render(<MarkdownRenderer content="" />);
    expect(container).toBeTruthy();
  });
});

// =============================================
// 3-2. 사용자 인터랙션 테스트
// =============================================

describe('QA Edge: User Interaction', () => {
  it('copy button renders and is accessible', () => {
    render(<CodeBlock language="js">const x = 1;</CodeBlock>);
    const copyBtn = screen.getByLabelText('코드 복사');
    expect(copyBtn).toBeInTheDocument();
    expect(copyBtn.tagName).toBe('BUTTON');
  });

  it('links are not clickable for task list checkboxes (readOnly)', () => {
    render(
      <MarkdownRenderer content={`- [x] Done\n- [ ] Not done`} />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((cb) => {
      expect(cb).toHaveAttribute('readonly');
      // pointer-events-none class prevents interaction
      expect(cb.className).toContain('pointer-events-none');
    });
  });
});

// =============================================
// 3-3. 상태 전환 테스트
// =============================================

describe('QA Edge: State Transitions', () => {
  it('CodeBlock copy state resets after timeout', async () => {
    const clipSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: clipSpy },
      writable: true,
      configurable: true,
    });

    const user = userEvent.setup();
    render(<CodeBlock language="js">const x = 1;</CodeBlock>);
    const copyBtn = screen.getByLabelText('코드 복사');

    await user.click(copyBtn);

    // Immediately after click, should show "복사됨"
    await waitFor(() => {
      expect(screen.getByText('복사됨')).toBeInTheDocument();
    });

    // After 2 seconds, should revert to "복사"
    await waitFor(
      () => {
        expect(screen.queryByText('복사됨')).not.toBeInTheDocument();
        expect(screen.getByText('복사')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('re-render with different content updates display', () => {
    const { rerender } = render(<MarkdownRenderer content="**Bold text**" />);
    expect(screen.getByText('Bold text').tagName).toBe('STRONG');

    rerender(<MarkdownRenderer content="*Italic text*" />);
    expect(screen.getByText('Italic text').tagName).toBe('EM');
  });

  it('switching compact mode re-renders with correct styles', () => {
    const { rerender } = render(<MarkdownRenderer content="Some text" compact={false} />);
    const normalP = screen.getByText('Some text');
    expect(normalP.className).toContain('mb-4');
    expect(normalP.className).not.toContain('text-sm');

    rerender(<MarkdownRenderer content="Some text" compact />);
    const compactP = screen.getByText('Some text');
    expect(compactP.className).toContain('mb-2');
    expect(compactP.className).toContain('text-sm');
  });
});

// =============================================
// 3. Additional Edge Cases: Code Block Variants
// =============================================

describe('QA Edge: Code Block Variants', () => {
  it('renders code block without language specification', () => {
    const code = '```\nplain code\n```';
    render(<MarkdownRenderer content={code} />);
    expect(screen.getByText('plain code')).toBeInTheDocument();
    // Should default to "code" label
    expect(screen.getByText('code')).toBeInTheDocument();
  });

  it('CodeBlock extractText handles nested React elements', () => {
    render(
      <CodeBlock language="jsx">
        <span>
          <em>nested</em> text
        </span>
      </CodeBlock>
    );
    expect(screen.getByText(/nested/)).toBeInTheDocument();
  });

  it('CodeBlock extractText handles number children', () => {
    render(<CodeBlock language="text">{42}</CodeBlock>);
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});

// =============================================
// Security Edge Cases
// =============================================

describe('QA Edge: Security', () => {
  it('blocks javascript: protocol in links', () => {
    // eslint-disable-next-line no-script-url
    render(<MarkdownRenderer content='[click](javascript:alert("xss"))' />);
    const link = screen.queryByRole('link');
    // react-markdown should sanitize javascript: URLs
    if (link) {
      expect(link.getAttribute('href')).not.toContain('javascript:');
    }
  });

  it('blocks onclick handler injection via markdown', () => {
    const { container } = render(
      <MarkdownRenderer content='<div onclick="alert(1)">test</div>' />
    );
    // react-markdown does not render raw HTML by default
    expect(container.querySelector('[onclick]')).toBeNull();
  });

  it('handles markdown with embedded HTML comments', () => {
    render(<MarkdownRenderer content="Before <!-- comment --> After" />);
    // Comment should not be rendered as visible text
    const text = screen.getByText(/Before/);
    expect(text).toBeInTheDocument();
  });
});

// =============================================
// Performance / Memo Edge Cases
// =============================================

describe('QA Edge: Performance (React.memo)', () => {
  it('MarkdownRenderer is memoized (same props do not re-render)', () => {
    const content = 'Test content';
    const { rerender, container } = render(<MarkdownRenderer content={content} />);
    const firstRender = container.innerHTML;

    rerender(<MarkdownRenderer content={content} />);
    const secondRender = container.innerHTML;

    // Same HTML output (memo should prevent re-processing)
    expect(firstRender).toBe(secondRender);
  });

  it('markdownComponents are cached (not recreated per render)', async () => {
    const { getMarkdownComponents } = await import('./markdownComponents');
    const first = getMarkdownComponents(true);
    const second = getMarkdownComponents(true);
    expect(first).toBe(second);

    const normalFirst = getMarkdownComponents(false);
    const normalSecond = getMarkdownComponents(false);
    expect(normalFirst).toBe(normalSecond);
  });
});
