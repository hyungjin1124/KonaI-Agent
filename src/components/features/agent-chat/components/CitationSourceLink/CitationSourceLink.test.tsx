/**
 * CitationSourceLink — Unit Tests
 *
 * Tests for CitationBadge, SourceLinkList, and CitationSourceLink components.
 * Uses Vitest + React Testing Library with jsdom environment.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { Citation } from '../../types';
import { CitationBadge } from './CitationBadge';
import { SourceLinkList } from './SourceLinkList';
import { CitationSourceLink } from './CitationSourceLink';

// -------------------------------------------------
// Mock Radix UI Tooltip (not functional in jsdom)
// -------------------------------------------------
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
// Test Fixtures
// -------------------------------------------------

const makeCitation = (overrides: Partial<Citation> = {}): Citation => ({
  id: 'cite-1',
  index: 1,
  title: 'Test Citation',
  url: 'https://example.com/article',
  domain: 'example.com',
  snippet: 'This is a snippet of the citation.',
  ...overrides,
});

const citationWithUrl = makeCitation();

const citationWithoutUrl = makeCitation({
  id: 'cite-2',
  index: 2,
  title: 'Citation Without URL',
  url: undefined,
  domain: undefined,
  snippet: undefined,
});

const citationWithoutDomain = makeCitation({
  id: 'cite-3',
  index: 3,
  title: 'No Domain Citation',
  domain: undefined,
});

const citationWithoutSnippet = makeCitation({
  id: 'cite-4',
  index: 4,
  title: 'No Snippet Citation',
  snippet: undefined,
});

const multipleCitations: Citation[] = [
  makeCitation({ id: 'cite-1', index: 1, title: 'First Source', url: 'https://first.com', domain: 'first.com' }),
  makeCitation({ id: 'cite-2', index: 2, title: 'Second Source', url: 'https://second.com', domain: 'second.com' }),
  makeCitation({ id: 'cite-3', index: 3, title: 'Third Source', url: 'https://third.com', domain: 'third.com' }),
];

const mixedCitations: Citation[] = [
  makeCitation({ id: 'cite-1', index: 1, title: 'With URL', url: 'https://with-url.com', domain: 'with-url.com' }),
  makeCitation({ id: 'cite-2', index: 2, title: 'Without URL', url: undefined, domain: undefined }),
  makeCitation({ id: 'cite-3', index: 3, title: 'Also With URL', url: 'https://also.com', domain: 'also.com' }),
];

// =============================================
// CitationBadge Tests
// =============================================

describe('CitationBadge', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the citation index number', () => {
    render(<CitationBadge citation={citationWithUrl} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('1');
  });

  it('renders different index numbers correctly', () => {
    const citation = makeCitation({ index: 42 });
    render(<CitationBadge citation={citation} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('42');
  });

  it('has the correct aria-label with index and title', () => {
    render(<CitationBadge citation={citationWithUrl} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', '출처 1: Test Citation');
  });

  it('has the correct aria-label for a different citation', () => {
    const citation = makeCitation({ index: 5, title: 'Advanced Guide' });
    render(<CitationBadge citation={citation} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', '출처 5: Advanced Guide');
  });

  it('calls window.open with correct arguments when clicked and URL exists', async () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = userEvent.setup();

    render(<CitationBadge citation={citationWithUrl} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(windowOpenSpy).toHaveBeenCalledTimes(1);
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://example.com/article',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('does NOT call window.open when citation has no URL', async () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = userEvent.setup();

    render(<CitationBadge citation={citationWithoutUrl} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(windowOpenSpy).not.toHaveBeenCalled();
  });

  it('renders tooltip content with title', () => {
    render(<CitationBadge citation={citationWithUrl} />);

    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent).toHaveTextContent('Test Citation');
  });

  it('renders tooltip content with snippet when available', () => {
    render(<CitationBadge citation={citationWithUrl} />);

    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent).toHaveTextContent('This is a snippet of the citation.');
  });

  it('does not render snippet when not provided', () => {
    render(<CitationBadge citation={citationWithoutSnippet} />);

    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent).not.toHaveTextContent('This is a snippet');
  });

  it('renders domain in tooltip when available', () => {
    render(<CitationBadge citation={citationWithUrl} />);

    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent).toHaveTextContent('example.com');
  });

  it('renders domain initial letter uppercased', () => {
    render(<CitationBadge citation={citationWithUrl} />);

    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent).toHaveTextContent('E');
  });

  it('does not render domain when not provided', () => {
    render(<CitationBadge citation={citationWithoutDomain} />);

    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent).not.toHaveTextContent('example.com');
  });
});

// =============================================
// SourceLinkList Tests
// =============================================

describe('SourceLinkList', () => {
  it('renders nothing when no citations have URLs', () => {
    const citations = [
      makeCitation({ id: 'a', index: 1, url: undefined }),
      makeCitation({ id: 'b', index: 2, url: undefined }),
    ];

    const { container } = render(<SourceLinkList citations={citations} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing for an empty citations array', () => {
    const { container } = render(<SourceLinkList citations={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the "출처" heading', () => {
    render(<SourceLinkList citations={multipleCitations} />);
    expect(screen.getByText('출처')).toBeInTheDocument();
  });

  it('renders only citations that have URLs', () => {
    render(<SourceLinkList citations={mixedCitations} />);

    const links = screen.getAllByRole('link');
    // mixedCitations has 2 with URLs ("With URL" and "Also With URL")
    expect(links).toHaveLength(2);

    expect(screen.getByText('With URL')).toBeInTheDocument();
    expect(screen.getByText('Also With URL')).toBeInTheDocument();
    // "Without URL" should not appear as a link
    expect(screen.queryByText('Without URL')).not.toBeInTheDocument();
  });

  it('renders all citations when all have URLs', () => {
    render(<SourceLinkList citations={multipleCitations} />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);

    expect(screen.getByText('First Source')).toBeInTheDocument();
    expect(screen.getByText('Second Source')).toBeInTheDocument();
    expect(screen.getByText('Third Source')).toBeInTheDocument();
  });

  it('each link opens in a new tab with security attributes', () => {
    render(<SourceLinkList citations={multipleCitations} />);

    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('each link has the correct href', () => {
    render(<SourceLinkList citations={multipleCitations} />);

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', 'https://first.com');
    expect(links[1]).toHaveAttribute('href', 'https://second.com');
    expect(links[2]).toHaveAttribute('href', 'https://third.com');
  });

  it('each link has the correct aria-label', () => {
    render(<SourceLinkList citations={multipleCitations} />);

    expect(screen.getByLabelText('출처 1: First Source')).toBeInTheDocument();
    expect(screen.getByLabelText('출처 2: Second Source')).toBeInTheDocument();
    expect(screen.getByLabelText('출처 3: Third Source')).toBeInTheDocument();
  });

  it('renders the citation index badge inside each link', () => {
    render(<SourceLinkList citations={[multipleCitations[0]]} />);

    const link = screen.getByRole('link');
    // The index badge is a span inside the link
    expect(link).toHaveTextContent('1');
  });

  it('shows domain when available', () => {
    render(<SourceLinkList citations={multipleCitations} />);

    expect(screen.getByText('· first.com')).toBeInTheDocument();
    expect(screen.getByText('· second.com')).toBeInTheDocument();
    expect(screen.getByText('· third.com')).toBeInTheDocument();
  });

  it('does not show domain when not available', () => {
    const citations = [
      makeCitation({ id: 'no-domain', index: 1, title: 'No Domain', domain: undefined, url: 'https://example.com' }),
    ];

    render(<SourceLinkList citations={citations} />);

    const link = screen.getByRole('link');
    expect(link).not.toHaveTextContent('·');
  });
});

// =============================================
// CitationSourceLink (Main Component) Tests
// =============================================

describe('CitationSourceLink', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns null for an empty citations array', () => {
    const { container } = render(<CitationSourceLink citations={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when citations is undefined', () => {
    // TypeScript would complain, but we test runtime safety
    const { container } = render(
      <CitationSourceLink citations={undefined as unknown as Citation[]} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('returns null when citations is null', () => {
    const { container } = render(
      <CitationSourceLink citations={null as unknown as Citation[]} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders citation badges for all citations', () => {
    render(<CitationSourceLink citations={multipleCitations} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);

    expect(buttons[0]).toHaveTextContent('1');
    expect(buttons[1]).toHaveTextContent('2');
    expect(buttons[2]).toHaveTextContent('3');
  });

  it('renders source link list for citations with URLs', () => {
    render(<CitationSourceLink citations={multipleCitations} />);

    // All 3 citations have URLs, so there should be 3 links
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
  });

  it('renders correctly with mixed citations (some with URL, some without)', () => {
    render(<CitationSourceLink citations={mixedCitations} />);

    // All 3 citations should render badges (buttons)
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);

    // Only 2 citations have URLs, so only 2 links
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
  });

  it('renders a single citation correctly', () => {
    render(<CitationSourceLink citations={[citationWithUrl]} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('1');

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com/article');
  });

  it('does not render SourceLinkList when no citations have URLs', () => {
    const citations = [
      citationWithoutUrl,
      makeCitation({ id: 'cite-x', index: 5, title: 'Also no URL', url: undefined }),
    ];

    render(<CitationSourceLink citations={citations} />);

    // Badges should still be rendered
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);

    // No links should be rendered (SourceLinkList returns null)
    const links = screen.queryAllByRole('link');
    expect(links).toHaveLength(0);

    // The "출처" heading should not appear
    expect(screen.queryByText('출처')).not.toBeInTheDocument();
  });

  it('clicking a badge with URL opens the link', async () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = userEvent.setup();

    render(<CitationSourceLink citations={[citationWithUrl]} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://example.com/article',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('renders the "출처" section heading when citations with URLs exist', () => {
    render(<CitationSourceLink citations={multipleCitations} />);
    expect(screen.getByText('출처')).toBeInTheDocument();
  });
});
