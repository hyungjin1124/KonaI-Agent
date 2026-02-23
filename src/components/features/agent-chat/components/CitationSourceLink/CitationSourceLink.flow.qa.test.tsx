/**
 * CitationSourceLink — UX Flow QA Tests
 *
 * Tests covering integration flows, callback wiring, state propagation,
 * and terminal state scenarios across parent components.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { Citation } from '../../types';
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
// Simulated Parent Components
// -------------------------------------------------

const makeCitation = (overrides: Partial<Citation> = {}): Citation => ({
  id: 'cite-1',
  index: 1,
  title: 'Test Citation',
  url: 'https://example.com',
  domain: 'example.com',
  snippet: 'A short snippet.',
  ...overrides,
});

interface MockMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  citations?: Citation[];
}

/**
 * Simulates ChatHistoryPanel's simple text message rendering
 * (mirrors ChatHistoryPanel.tsx lines 81-95)
 */
const MockAgentChatParent: React.FC<{ messages: MockMessage[] }> = ({ messages }) => (
  <div>
    {messages.map((message) => {
      const isSimpleTextMessage = message.type === 'agent' && message.content;
      return (
        <div key={message.id}>
          {message.type === 'user' ? (
            <div data-testid={`user-msg-${message.id}`}>{message.content}</div>
          ) : isSimpleTextMessage ? (
            <div data-testid={`agent-msg-${message.id}`}>
              <p>{message.content}</p>
              {message.citations && message.citations.length > 0 && (
                <CitationSourceLink citations={message.citations} />
              )}
            </div>
          ) : null}
        </div>
      );
    })}
  </div>
);

interface MockChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

/**
 * Simulates ChatPanel's message rendering
 * (mirrors ChatPanel.tsx lines 110-157)
 */
const MockGeneralChatParent: React.FC<{ messages: MockChatMessage[] }> = ({ messages }) => (
  <div>
    {messages.map((message) => (
      <div key={message.id} data-testid={`msg-${message.id}`}>
        <p>{message.content}</p>
        {message.type === 'assistant' && message.citations && message.citations.length > 0 && (
          <CitationSourceLink citations={message.citations} />
        )}
      </div>
    ))}
  </div>
);

// =============================================
// 3.5-1. Callback Wiring Audit
// =============================================

describe('UX Flow: Callback Wiring', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('CitationBadge onClick propagates window.open in agent-chat context', async () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = userEvent.setup();

    const messages: MockMessage[] = [
      {
        id: 'msg-1',
        type: 'agent',
        content: 'Here is my answer.',
        citations: [makeCitation({ url: 'https://source.com/article' })],
      },
    ];

    render(<MockAgentChatParent messages={messages} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://source.com/article',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('CitationBadge onClick propagates window.open in general-chat context', async () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = userEvent.setup();

    const messages: MockChatMessage[] = [
      {
        id: 'msg-1',
        type: 'assistant',
        content: 'Here is the answer.',
        citations: [makeCitation({ url: 'https://other-source.com' })],
      },
    ];

    render(<MockGeneralChatParent messages={messages} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://other-source.com',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('SourceLinkList links have correct href in parent context', () => {
    const citations = [
      makeCitation({ id: 'c1', index: 1, url: 'https://a.com' }),
      makeCitation({ id: 'c2', index: 2, url: 'https://b.com' }),
    ];

    const messages: MockMessage[] = [
      { id: 'msg-1', type: 'agent', content: 'Response', citations },
    ];

    render(<MockAgentChatParent messages={messages} />);

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', 'https://a.com');
    expect(links[1]).toHaveAttribute('href', 'https://b.com');
  });
});

// =============================================
// 3.5-2. Conditional Rendering in Parent
// =============================================

describe('UX Flow: Conditional Rendering', () => {
  it('agent-chat: does NOT render CitationSourceLink for user messages', () => {
    const messages: MockMessage[] = [
      {
        id: 'msg-1',
        type: 'user',
        content: 'User question',
        citations: [makeCitation()],
      },
    ];

    render(<MockAgentChatParent messages={messages} />);

    // No citation badges should be rendered
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('general-chat: does NOT render CitationSourceLink for user messages', () => {
    const messages: MockChatMessage[] = [
      {
        id: 'msg-1',
        type: 'user',
        content: 'User question',
        citations: [makeCitation()],
      },
    ];

    render(<MockGeneralChatParent messages={messages} />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('agent-chat: renders citations only for agent messages with content', () => {
    const messages: MockMessage[] = [
      { id: 'msg-1', type: 'user', content: 'Question', citations: [makeCitation()] },
      { id: 'msg-2', type: 'agent', content: 'Answer', citations: [makeCitation({ id: 'c2', index: 2 })] },
    ];

    render(<MockAgentChatParent messages={messages} />);

    // Only agent message should have citation badge
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent('2');
  });

  it('agent-chat: does not crash when message has citations but no content', () => {
    const messages: MockMessage[] = [
      { id: 'msg-1', type: 'agent', content: '', citations: [makeCitation()] },
    ];

    // Empty content is falsy, so isSimpleTextMessage is false, no rendering
    const { container } = render(<MockAgentChatParent messages={messages} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});

// =============================================
// 3.5-3. Terminal State: No Citations
// =============================================

describe('UX Flow: Terminal States', () => {
  it('agent-chat: no citation UI when message has empty citations array', () => {
    const messages: MockMessage[] = [
      { id: 'msg-1', type: 'agent', content: 'No sources', citations: [] },
    ];

    render(<MockAgentChatParent messages={messages} />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryByText('출처')).not.toBeInTheDocument();
  });

  it('agent-chat: no citation UI when message has undefined citations', () => {
    const messages: MockMessage[] = [
      { id: 'msg-1', type: 'agent', content: 'No sources', citations: undefined },
    ];

    render(<MockAgentChatParent messages={messages} />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('general-chat: gracefully handles assistant message without citations field', () => {
    const messages: MockChatMessage[] = [
      { id: 'msg-1', type: 'assistant', content: 'Simple answer' },
    ];

    render(<MockGeneralChatParent messages={messages} />);

    expect(screen.getByText('Simple answer')).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});

// =============================================
// 3.5-4. Critical User Flows
// =============================================

describe('UX Flow: Critical User Flows', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Flow 1: Agent responds with citations → User views tooltip → User clicks source link
   */
  it('Flow 1: view citations → inspect tooltip → click source', async () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = userEvent.setup();

    const messages: MockMessage[] = [
      {
        id: 'msg-1',
        type: 'agent',
        content: 'Based on multiple sources...',
        citations: [
          makeCitation({ id: 'c1', index: 1, title: 'Wikipedia Article', url: 'https://wiki.com/article' }),
          makeCitation({ id: 'c2', index: 2, title: 'Research Paper', url: 'https://arxiv.org/paper' }),
        ],
      },
    ];

    render(<MockAgentChatParent messages={messages} />);

    // Step 1: Verify agent message with citations is visible
    expect(screen.getByText('Based on multiple sources...')).toBeInTheDocument();

    // Step 2: Verify citation badges are rendered
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent('1');
    expect(buttons[1]).toHaveTextContent('2');

    // Step 3: Verify tooltip content is accessible
    const tooltips = screen.getAllByTestId('tooltip-content');
    expect(tooltips[0]).toHaveTextContent('Wikipedia Article');
    expect(tooltips[1]).toHaveTextContent('Research Paper');

    // Step 4: Click badge to open source
    await user.click(buttons[0]);
    expect(windowOpenSpy).toHaveBeenCalledWith('https://wiki.com/article', '_blank', 'noopener,noreferrer');

    // Step 5: Verify source link list at bottom
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', 'https://wiki.com/article');
    expect(links[1]).toHaveAttribute('href', 'https://arxiv.org/paper');
  });

  /**
   * Flow 2: Multiple messages with citations → Each message independently shows its citations
   */
  it('Flow 2: multiple messages each with independent citations', () => {
    const messages: MockMessage[] = [
      {
        id: 'msg-1',
        type: 'agent',
        content: 'First answer',
        citations: [makeCitation({ id: 'c1', index: 1, title: 'Source A', url: 'https://a.com' })],
      },
      {
        id: 'msg-2',
        type: 'agent',
        content: 'Second answer',
        citations: [
          makeCitation({ id: 'c2', index: 1, title: 'Source B', url: 'https://b.com' }),
          makeCitation({ id: 'c3', index: 2, title: 'Source C', url: 'https://c.com' }),
        ],
      },
    ];

    render(<MockAgentChatParent messages={messages} />);

    // Total: 3 citation badges (1 from first, 2 from second)
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);

    // Total: 3 source links
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
  });

  /**
   * Flow 3: Mixed messages (user/agent, with/without citations)
   */
  it('Flow 3: mixed message types with selective citations', () => {
    const messages: MockMessage[] = [
      { id: 'msg-1', type: 'user', content: 'Tell me about X' },
      {
        id: 'msg-2',
        type: 'agent',
        content: 'Here is info about X',
        citations: [makeCitation({ id: 'c1', index: 1, url: 'https://x-info.com' })],
      },
      { id: 'msg-3', type: 'user', content: 'What about Y?' },
      {
        id: 'msg-4',
        type: 'agent',
        content: 'Y is different',
        // No citations for this response
      },
    ];

    render(<MockAgentChatParent messages={messages} />);

    // Only msg-2 has citations
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);

    // "출처" heading appears only once
    const headings = screen.getAllByText('출처');
    expect(headings).toHaveLength(1);
  });
});
