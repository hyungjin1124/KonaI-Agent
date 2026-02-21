// Re-export canonical Citation from agent-chat
export type { Citation } from '../agent-chat/types';

import type { Citation } from '../agent-chat/types';

// Chat message type
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: Citation[];
}

// Chat session type (for history sidebar)
export interface ChatSession {
  id: string;
  title: string;
  preview: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

// Left sidebar expanded sections
export type LeftSidebarSection = 'today' | 'yesterday' | 'previous7days' | 'older';
