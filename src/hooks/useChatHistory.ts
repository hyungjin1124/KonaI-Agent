import { useState, useCallback } from 'react';

/**
 * 채팅 메시지 타입 정의
 */
export interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  dashboardType?: 'financial' | 'did' | 'ppt';
  dashboardScenario?: string;
  pptStatus?: 'idle' | 'setup' | 'generating' | 'done';
  cotComplete?: boolean;
}

/**
 * 에이전트 메시지 설정 옵션
 */
interface AgentMessageConfig {
  dashboardType: 'financial' | 'did' | 'ppt';
  dashboardScenario?: string;
  pptStatus?: 'idle' | 'setup' | 'generating' | 'done';
}

/**
 * useChatHistory 훅 반환 타입
 */
interface UseChatHistoryReturn {
  chatHistory: ChatMessage[];
  cotCompleteMap: Record<string, boolean>;

  // Actions
  addUserMessage: (content: string) => ChatMessage;
  addAgentMessage: (config: AgentMessageConfig) => ChatMessage;
  addMessagePair: (content: string, config: AgentMessageConfig) => { user: ChatMessage; agent: ChatMessage };
  handleCotComplete: (messageId: string) => void;
  clearHistory: () => void;
}

/**
 * 채팅 히스토리 관리 커스텀 훅
 *
 * AgentChatView에서 채팅 메시지 상태 로직을 분리하여 관리
 */
export function useChatHistory(): UseChatHistoryReturn {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [cotCompleteMap, setCotCompleteMap] = useState<Record<string, boolean>>({});

  /**
   * 사용자 메시지 추가
   */
  const addUserMessage = useCallback((content: string): ChatMessage => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setChatHistory(prev => [...prev, userMessage]);
    return userMessage;
  }, []);

  /**
   * 에이전트 메시지 추가
   */
  const addAgentMessage = useCallback((config: AgentMessageConfig): ChatMessage => {
    const agentMessage: ChatMessage = {
      id: `agent-${Date.now()}`,
      type: 'agent',
      content: '',
      timestamp: new Date(),
      dashboardType: config.dashboardType,
      dashboardScenario: config.dashboardScenario,
      pptStatus: config.pptStatus,
    };
    setChatHistory(prev => [...prev, agentMessage]);
    return agentMessage;
  }, []);

  /**
   * 사용자 + 에이전트 메시지 쌍 동시 추가
   */
  const addMessagePair = useCallback((content: string, config: AgentMessageConfig) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
    };

    const agentMessage: ChatMessage = {
      id: `agent-${Date.now() + 1}`,
      type: 'agent',
      content: '',
      timestamp: new Date(),
      dashboardType: config.dashboardType,
      dashboardScenario: config.dashboardScenario,
      pptStatus: config.pptStatus,
    };

    setChatHistory(prev => [...prev, userMessage, agentMessage]);
    return { user: userMessage, agent: agentMessage };
  }, []);

  /**
   * Chain of Thought 완료 처리
   */
  const handleCotComplete = useCallback((messageId: string) => {
    setCotCompleteMap(prev => ({ ...prev, [messageId]: true }));
  }, []);

  /**
   * 히스토리 초기화
   */
  const clearHistory = useCallback(() => {
    setChatHistory([]);
    setCotCompleteMap({});
  }, []);

  return {
    chatHistory,
    cotCompleteMap,
    addUserMessage,
    addAgentMessage,
    addMessagePair,
    handleCotComplete,
    clearHistory,
  };
}

export default useChatHistory;
