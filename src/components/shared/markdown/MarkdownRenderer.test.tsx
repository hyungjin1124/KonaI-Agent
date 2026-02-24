/**
 * MarkdownRenderer — Unit Tests
 *
 * Tests for the shared MarkdownRenderer component.
 * Uses Vitest + React Testing Library with jsdom environment.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { MarkdownRenderer } from './MarkdownRenderer';
import { CodeBlock } from './CodeBlock';

// =============================================
// MarkdownRenderer — Smoke Tests
// =============================================

describe('MarkdownRenderer', () => {
  it('renders without error with empty content', () => {
    const { container } = render(<MarkdownRenderer content="" />);
    expect(container).toBeTruthy();
  });

  it('renders plain text content', () => {
    render(<MarkdownRenderer content="Hello World" />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <MarkdownRenderer content="test" className="my-custom-class" />
    );
    expect(container.firstChild).toHaveClass('my-custom-class');
  });
});

// =============================================
// Headings
// =============================================

describe('MarkdownRenderer — Headings', () => {
  it('renders h1', () => {
    render(<MarkdownRenderer content="# Heading 1" />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Heading 1');
  });

  it('renders h2', () => {
    render(<MarkdownRenderer content="## Heading 2" />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Heading 2');
  });

  it('renders h3', () => {
    render(<MarkdownRenderer content="### Heading 3" />);
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Heading 3');
  });

  it('renders h4', () => {
    render(<MarkdownRenderer content="#### Heading 4" />);
    const heading = screen.getByRole('heading', { level: 4 });
    expect(heading).toHaveTextContent('Heading 4');
  });

  it('renders h5', () => {
    render(<MarkdownRenderer content="##### Heading 5" />);
    const heading = screen.getByRole('heading', { level: 5 });
    expect(heading).toHaveTextContent('Heading 5');
  });

  it('renders h6', () => {
    render(<MarkdownRenderer content="###### Heading 6" />);
    const heading = screen.getByRole('heading', { level: 6 });
    expect(heading).toHaveTextContent('Heading 6');
  });

  it('headings are visually distinct (compact vs normal mode)', () => {
    const { rerender } = render(<MarkdownRenderer content="# Title" />);
    const normalH1 = screen.getByRole('heading', { level: 1 });
    expect(normalH1.className).toContain('text-2xl');

    rerender(<MarkdownRenderer content="# Title" compact />);
    const compactH1 = screen.getByRole('heading', { level: 1 });
    expect(compactH1.className).toContain('text-lg');
  });
});

// =============================================
// Inline Formatting
// =============================================

describe('MarkdownRenderer — Inline Formatting', () => {
  it('renders bold text', () => {
    render(<MarkdownRenderer content="This is **bold** text" />);
    const strong = screen.getByText('bold');
    expect(strong.tagName).toBe('STRONG');
  });

  it('renders italic text', () => {
    render(<MarkdownRenderer content="This is *italic* text" />);
    const em = screen.getByText('italic');
    expect(em.tagName).toBe('EM');
  });

  it('renders inline code', () => {
    render(<MarkdownRenderer content="Use `const x = 1` in code" />);
    const code = screen.getByText('const x = 1');
    expect(code.tagName).toBe('CODE');
    expect(code.className).toContain('font-mono');
  });

  it('renders strikethrough text (GFM)', () => {
    render(<MarkdownRenderer content="This is ~~deleted~~ text" />);
    const del = screen.getByText('deleted');
    expect(del.tagName).toBe('DEL');
  });
});

// =============================================
// Lists
// =============================================

describe('MarkdownRenderer — Lists', () => {
  it('renders unordered list', () => {
    render(
      <MarkdownRenderer content={`- Item 1\n- Item 2\n- Item 3`} />
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });

  it('renders ordered list', () => {
    render(
      <MarkdownRenderer content={`1. First\n2. Second\n3. Third`} />
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('First');
  });

  it('renders task list (GFM)', () => {
    render(
      <MarkdownRenderer
        content={`- [x] Done task\n- [ ] Pending task`}
      />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });
});

// =============================================
// Tables (GFM)
// =============================================

describe('MarkdownRenderer — Tables', () => {
  const tableMarkdown = `| Name | Age |\n|------|-----|\n| Alice | 30 |\n| Bob | 25 |`;

  it('renders table', () => {
    render(<MarkdownRenderer content={tableMarkdown} />);
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<MarkdownRenderer content={tableMarkdown} />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(2);
    expect(headers[0]).toHaveTextContent('Name');
    expect(headers[1]).toHaveTextContent('Age');
  });

  it('renders table rows', () => {
    render(<MarkdownRenderer content={tableMarkdown} />);
    const cells = screen.getAllByRole('cell');
    expect(cells).toHaveLength(4);
    expect(cells[0]).toHaveTextContent('Alice');
    expect(cells[1]).toHaveTextContent('30');
  });

  it('table has horizontal scroll wrapper', () => {
    render(<MarkdownRenderer content={tableMarkdown} />);
    const table = screen.getByRole('table');
    expect(table.parentElement?.className).toContain('overflow-x-auto');
  });
});

// =============================================
// Code Blocks
// =============================================

describe('MarkdownRenderer — Code Blocks', () => {
  it('renders code block with language label', () => {
    const code = '```javascript\nconst x = 1;\n```';
    render(<MarkdownRenderer content={code} />);
    expect(screen.getByText('javascript')).toBeInTheDocument();
  });

  it('renders code block content', () => {
    const code = '```python\nprint("hello")\n```';
    render(<MarkdownRenderer content={code} />);
    expect(screen.getByText('print("hello")')).toBeInTheDocument();
  });

  it('renders copy button in code block', () => {
    const code = '```\nsome code\n```';
    render(<MarkdownRenderer content={code} />);
    expect(screen.getByLabelText('코드 복사')).toBeInTheDocument();
  });
});

// =============================================
// Blockquote
// =============================================

describe('MarkdownRenderer — Blockquote', () => {
  it('renders blockquote with correct styling', () => {
    render(<MarkdownRenderer content="> This is a quote" />);
    const blockquote = screen.getByText('This is a quote').closest('blockquote');
    expect(blockquote).toBeTruthy();
    expect(blockquote?.className).toContain('border-l-4');
  });
});

// =============================================
// Links
// =============================================

describe('MarkdownRenderer — Links', () => {
  it('renders links that open in new tab', () => {
    render(<MarkdownRenderer content="[Example](https://example.com)" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

// =============================================
// Images
// =============================================

describe('MarkdownRenderer — Images', () => {
  it('renders images with max-width constraint', () => {
    render(
      <MarkdownRenderer content="![Alt text](https://example.com/image.png)" />
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Alt text');
    expect(img.className).toContain('max-w-full');
  });
});

// =============================================
// Security
// =============================================

describe('MarkdownRenderer — Security', () => {
  it('does not render raw HTML (react-markdown default)', () => {
    const { container } = render(
      <MarkdownRenderer content='<script>alert("xss")</script>' />
    );
    expect(container.querySelector('script')).toBeNull();
  });

  it('does not render dangerous HTML elements', () => {
    const { container } = render(
      <MarkdownRenderer content='<iframe src="https://evil.com"></iframe>' />
    );
    expect(container.querySelector('iframe')).toBeNull();
  });
});

// =============================================
// Nested Markdown
// =============================================

describe('MarkdownRenderer — Nested Markdown', () => {
  it('renders bold inside list items', () => {
    render(
      <MarkdownRenderer content="- This is **bold** in a list" />
    );
    const strong = screen.getByText('bold');
    expect(strong.tagName).toBe('STRONG');
    const li = strong.closest('li');
    expect(li).toBeTruthy();
  });

  it('renders inline code inside bold', () => {
    render(
      <MarkdownRenderer content="**Use `useState` hook**" />
    );
    const code = screen.getByText('useState');
    expect(code.tagName).toBe('CODE');
  });
});

// =============================================
// Compact Mode
// =============================================

describe('MarkdownRenderer — Compact Mode', () => {
  it('renders with compact styling when compact=true', () => {
    render(
      <MarkdownRenderer content="## Small Heading" compact />
    );
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.className).toContain('text-base');
  });

  it('renders with normal styling when compact=false', () => {
    render(<MarkdownRenderer content="## Normal Heading" />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.className).toContain('text-xl');
  });
});

// =============================================
// CodeBlock Component
// =============================================

describe('CodeBlock', () => {
  let writeTextSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeTextSpy = vi.fn().mockResolvedValue(undefined);
    // Mock clipboard API for jsdom
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextSpy },
      writable: true,
      configurable: true,
    });
  });

  it('renders code content', () => {
    render(<CodeBlock language="typescript">const x = 1;</CodeBlock>);
    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
  });

  it('displays language label', () => {
    render(<CodeBlock language="python">print("hi")</CodeBlock>);
    expect(screen.getByText('python')).toBeInTheDocument();
  });

  it('shows "code" as default language when not specified', () => {
    render(<CodeBlock>some code</CodeBlock>);
    expect(screen.getByText('code')).toBeInTheDocument();
  });

  it('shows copy button that changes to "복사됨" after click', async () => {
    const user = userEvent.setup();
    render(<CodeBlock language="js">const y = 2;</CodeBlock>);

    // 복사 버튼이 존재하는지 확인
    const copyBtn = screen.getByLabelText('코드 복사');
    expect(copyBtn).toBeInTheDocument();

    // 클릭 후 "복사됨" 텍스트로 변경되는지 확인
    await user.click(copyBtn);

    await waitFor(() => {
      expect(screen.getByText('복사됨')).toBeInTheDocument();
    });
  });
});
