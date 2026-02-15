// Citation reference for agent responses
export interface Citation {
  id: string;
  index: number;
  title: string;
  url?: string;
  domain?: string;
  snippet?: string;
}

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
