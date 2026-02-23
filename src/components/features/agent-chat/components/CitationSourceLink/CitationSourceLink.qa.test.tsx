/**
 * CitationSourceLink — QA Edge Case Tests
 *
 * QA-authored tests focusing on boundary conditions, large data sets,
 * special characters, rapid interactions, and defensive rendering.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { Citation } from '../../types';
import { CitationBadge } from './CitationBadge';
import { SourceLinkList } from './SourceLinkList';
import { CitationSourceLink } from './CitationSourceLink';

// Mock Radix UI Tooltip
vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: React.forwardRef<HTMLElement, { children: React.ReactNode; asChild?: boolean }>(
    ({ children }, _ref) => <>{children}</>,
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
}));

// -------------------------------------------------
// Helpers
// -------------------------------------------------

const makeCitation = (overrides: Partial<Citation> = {}): Citation => ({
  id: 'cite-1',
  index: 1,
  title: 'Test Citation',
  url: 'https://example.com/article',
  domain: 'example.com',
  snippet: 'A short snippet.',
  ...overrides,
});

const generateCitations = (count: number): Citation[] =>
  Array.from({ length: count }, (_, i) => makeCitation({
    id: `cite-${i + 1}`,
    index: i + 1,
    title: `Source ${i + 1}`,
    url: `https://source-${i + 1}.com/page`,
    domain: `source-${i + 1}.com`,
  }));

// =============================================
// 3-1. Data Boundary Tests
// =============================================

describe('QA Edge Cases: Data Boundaries', () => {
  it('handles a very large number of citations (20+)', () => {
    const citations = generateCitations(20);
    render(<CitationSourceLink citations={citations} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(20);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(20);
  });

  it('handles citation with very long title without layout break', () => {
    const longTitle = 'A'.repeat(500);
    const citation = makeCitation({ title: longTitle });
    render(<CitationBadge citation={citation} />);

    const tooltip = screen.getByTestId('tooltip-content');
    expect(tooltip).toHaveTextContent(longTitle);
  });

  it('SourceLinkList truncates long titles via CSS class', () => {
    const longTitle = 'This is a very very very very very long title that should be truncated';
    const citation = makeCitation({ title: longTitle });
    render(<SourceLinkList citations={[citation]} />);

    const truncatedSpan = screen.getByText(longTitle);
    expect(truncatedSpan).toHaveClass('truncate');
  });

  it('handles citation with very long snippet', () => {
    const longSnippet = 'Lorem ipsum '.repeat(100);
    const citation = makeCitation({ snippet: longSnippet });
    render(<CitationBadge citation={citation} />);

    const tooltip = screen.getByTestId('tooltip-content');
    expect(tooltip).toHaveTextContent(longSnippet.trim());
  });

  it('handles citation with very long domain', () => {
    const longDomain = 'subdomain.' + 'a'.repeat(200) + '.example.com';
    const citation = makeCitation({ domain: longDomain });
    render(<CitationBadge citation={citation} />);

    const tooltip = screen.getByTestId('tooltip-content');
    expect(tooltip).toHaveTextContent(longDomain);
  });

  it('handles citation with special characters in title', () => {
    const specialTitle = '<script>alert("xss")</script> & "quotes" \'single\' <div>';
    const citation = makeCitation({ title: specialTitle });
    render(<CitationBadge citation={citation} />);

    const tooltip = screen.getByTestId('tooltip-content');
    // React escapes HTML - it should render as text, not execute
    expect(tooltip).toHaveTextContent(specialTitle);
  });

  it('handles citation with emoji in title', () => {
    const emojiTitle = '🔬 Research Paper 📊 with Emoji 🎉';
    const citation = makeCitation({ title: emojiTitle });
    render(<CitationBadge citation={citation} />);

    const tooltip = screen.getByTestId('tooltip-content');
    expect(tooltip).toHaveTextContent(emojiTitle);
  });

  it('handles citation with Korean/CJK text', () => {
    const koreanTitle = '한국어 논문 제목입니다';
    const citation = makeCitation({ title: koreanTitle, domain: 'ko.wikipedia.org' });
    render(<CitationBadge citation={citation} />);

    const tooltip = screen.getByTestId('tooltip-content');
    expect(tooltip).toHaveTextContent(koreanTitle);
  });

  it('handles citation with index number 0', () => {
    const citation = makeCitation({ index: 0 });
    render(<CitationBadge citation={citation} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('0');
  });

  it('handles citation with very large index number', () => {
    const citation = makeCitation({ index: 99999 });
    render(<CitationBadge citation={citation} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('99999');
  });

  it('handles citation with empty string title', () => {
    const citation = makeCitation({ title: '' });
    render(<CitationBadge citation={citation} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', '출처 1: ');
  });

  it('handles citation with URL containing special characters', () => {
    const specialUrl = 'https://example.com/path?q=hello%20world&lang=ko#section';
    const citation = makeCitation({ url: specialUrl });
    render(<SourceLinkList citations={[citation]} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', specialUrl);
  });

  it('handles all citations with same id (duplicate keys)', () => {
    const citations = [
      makeCitation({ id: 'same-id', index: 1, title: 'First' }),
      makeCitation({ id: 'same-id', index: 2, title: 'Second' }),
    ];
    // Should render without crashing (React will warn about duplicate keys)
    const { container } = render(<CitationSourceLink citations={citations} />);
    expect(container).toBeTruthy();
  });
});

// =============================================
// 3-2. User Interaction Tests
// =============================================

describe('QA Edge Cases: User Interactions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('handles rapid consecutive clicks on badge', async () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = userEvent.setup();
    const citation = makeCitation();

    render(<CitationBadge citation={citation} />);
    const button = screen.getByRole('button');

    // Rapid triple click
    await user.click(button);
    await user.click(button);
    await user.click(button);

    // Each click should open a new tab (no debounce by design)
    expect(windowOpenSpy).toHaveBeenCalledTimes(3);
  });

  it('handles click on badge with invalid URL gracefully', async () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = userEvent.setup();
    const citation = makeCitation({ url: 'not-a-valid-url' });

    render(<CitationBadge citation={citation} />);
    const button = screen.getByRole('button');
    await user.click(button);

    // Should still call window.open (browser handles validation)
    expect(windowOpenSpy).toHaveBeenCalledWith('not-a-valid-url', '_blank', 'noopener,noreferrer');
  });

  it('badge is keyboard-accessible via Enter key', async () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = userEvent.setup();
    const citation = makeCitation();

    render(<CitationBadge citation={citation} />);
    const button = screen.getByRole('button');

    button.focus();
    await user.keyboard('{Enter}');

    expect(windowOpenSpy).toHaveBeenCalledTimes(1);
  });

  it('badge is keyboard-accessible via Space key', async () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = userEvent.setup();
    const citation = makeCitation();

    render(<CitationBadge citation={citation} />);
    const button = screen.getByRole('button');

    button.focus();
    await user.keyboard(' ');

    expect(windowOpenSpy).toHaveBeenCalledTimes(1);
  });
});

// =============================================
// 3-3. State Transition Tests
// =============================================

describe('QA Edge Cases: State Transitions', () => {
  it('re-renders correctly when citations prop changes from empty to populated', () => {
    const { rerender } = render(<CitationSourceLink citations={[]} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);

    const citations = generateCitations(3);
    rerender(<CitationSourceLink citations={citations} />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('re-renders correctly when citations prop changes from populated to empty', () => {
    const citations = generateCitations(3);
    const { rerender, container } = render(<CitationSourceLink citations={citations} />);
    expect(screen.getAllByRole('button')).toHaveLength(3);

    rerender(<CitationSourceLink citations={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('updates when citation data changes (new title)', () => {
    const citation = makeCitation({ title: 'Original Title' });
    const { rerender } = render(<CitationBadge citation={citation} />);

    const tooltip1 = screen.getByTestId('tooltip-content');
    expect(tooltip1).toHaveTextContent('Original Title');

    const updatedCitation = { ...citation, title: 'Updated Title' };
    rerender(<CitationBadge citation={updatedCitation} />);

    const tooltip2 = screen.getByTestId('tooltip-content');
    expect(tooltip2).toHaveTextContent('Updated Title');
  });

  it('handles transition from URL to no-URL citation', () => {
    const withUrl = makeCitation({ url: 'https://example.com' });
    const { rerender } = render(<SourceLinkList citations={[withUrl]} />);
    expect(screen.getAllByRole('link')).toHaveLength(1);

    const withoutUrl = makeCitation({ url: undefined });
    rerender(<SourceLinkList citations={[withoutUrl]} />);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
});

// =============================================
// Additional: Defensive Rendering
// =============================================

describe('QA Edge Cases: Defensive Rendering', () => {
  it('CitationSourceLink handles citations with minimal data (only required fields)', () => {
    const minimalCitation: Citation = {
      id: 'min-1',
      index: 1,
      title: 'Minimal',
    };
    render(<CitationSourceLink citations={[minimalCitation]} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent('1');

    // No links because no URL
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    // No "출처" heading because no URLs
    expect(screen.queryByText('출처')).not.toBeInTheDocument();
  });

  it('SourceLinkList handles citation with empty string URL', () => {
    const citation = makeCitation({ url: '' });
    const { container } = render(<SourceLinkList citations={[citation]} />);
    // Empty string is falsy, so filter should exclude it
    expect(container.innerHTML).toBe('');
  });

  it('domain initial letter extraction handles single character domain', () => {
    const citation = makeCitation({ domain: 'a' });
    render(<CitationBadge citation={citation} />);

    const tooltip = screen.getByTestId('tooltip-content');
    expect(tooltip).toHaveTextContent('A');
  });

  it('renders correctly when all citations are identical except id', () => {
    const citations: Citation[] = [
      makeCitation({ id: 'a', index: 1, title: 'Same' }),
      makeCitation({ id: 'b', index: 2, title: 'Same' }),
      makeCitation({ id: 'c', index: 3, title: 'Same' }),
    ];
    render(<CitationSourceLink citations={citations} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });
});
