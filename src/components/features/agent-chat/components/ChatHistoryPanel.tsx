import React from 'react';
import { PPTConfig } from '../../../../types';
import { CenterPanelState, ArtifactPreviewState } from '../types';
import ScrollToBottomButton from './ScrollToBottomButton';
import { PPTDoneResponse } from './AgentResponse';

// ChatMessage interface - extracted from AgentChatView.tsx
export interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  dashboardType?: 'financial' | 'did' | 'ppt';
  dashboardScenario?: string;
  pptStatus?: 'idle' | 'setup' | 'generating' | 'done';
}

interface ChatHistoryPanelProps {
  leftPanelRef: React.RefObject<HTMLDivElement>;
  chatHistory: ChatMessage[];
  userQuery: string;
  pptStatus: 'idle' | 'setup' | 'generating' | 'done';
  isOutlineRevisionMode: boolean;
  pptConfig: PPTConfig;
  centerPanelState: CenterPanelState;
  artifactPreview: ArtifactPreviewState;
  showScrollButton: boolean;
  unreadCount: number;
  scrollToBottom: () => void;
  renderAgentResponseForMessage: (message: ChatMessage, isLatest: boolean) => React.ReactNode;
  renderAgentResponse: () => React.ReactNode;
  onRequestSalesAnalysis: () => void;
  onOpenCenterPanel: (content: 'ppt-preview' | 'ppt-result' | 'dashboard' | 'slide-outline' | 'markdown-preview') => void;
}

const ChatHistoryPanel: React.FC<ChatHistoryPanelProps> = React.memo(({
  leftPanelRef,
  chatHistory,
  userQuery,
  pptStatus,
  isOutlineRevisionMode,
  pptConfig,
  centerPanelState,
  artifactPreview,
  showScrollButton,
  unreadCount,
  scrollToBottom,
  renderAgentResponseForMessage,
  renderAgentResponse,
  onRequestSalesAnalysis,
  onOpenCenterPanel,
}) => {
  return (
    <div ref={leftPanelRef} className="h-full overflow-y-auto custom-scrollbar scroll-smooth relative">
      <div className="py-6 max-w-3xl mx-auto px-6">
        {/* 대화 히스토리 렌더링 */}
        {chatHistory.length > 0 ? (
          chatHistory.map((message, index) => {
            // 시나리오 렌더러가 있는 마지막 에이전트 메시지 (dashboardType 있음)를 "latest"로 판단
            // 가이드/확인 메시지(dashboardType 없음)는 isLatest 판단에서 제외
            const isLatestAgent = message.type === 'agent' &&
              message.dashboardType !== undefined &&
              !chatHistory.slice(index + 1).some(m => m.type === 'agent' && m.dashboardType !== undefined);

            // 단순 텍스트 에이전트 메시지 (가이드, 확인 등) - dashboardType 없고 content 있음
            const isSimpleTextMessage = message.type === 'agent' &&
              message.dashboardType === undefined &&
              message.content;

            return (
              <div key={message.id}>
                {message.type === 'user' ? (
                  // User Query Bubble
                  <div className="flex justify-end mb-10 mt-6">
                    <div className="bg-gray-100 text-black px-5 py-4 rounded-2xl rounded-tr-sm max-w-[90%] border border-gray-200 shadow-sm">
                      <p className="text-sm leading-relaxed whitespace-pre-line font-medium">{message.content}</p>
                    </div>
                  </div>
                ) : isSimpleTextMessage ? (
                  // Simple text agent message (guide, confirmation)
                  <div className="flex gap-4 mb-4 animate-fade-in-up">
                    <div className="w-8 h-8 rounded bg-[#FF3C42] flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <span className="text-white font-bold text-xs">K</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Agent Response with scenario rendering
                  <div className="mb-6">
                    {renderAgentResponseForMessage(message, isLatestAgent)}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // Fallback: 기존 단일 메시지 렌더링 (초기 상태)
          <>
            <div className="flex justify-end mb-10 mt-6">
              <div className="bg-gray-100 text-black px-5 py-4 rounded-2xl rounded-tr-sm max-w-[90%] border border-gray-200 shadow-sm">
                <p className="text-sm leading-relaxed whitespace-pre-line font-medium">{userQuery}</p>
              </div>
            </div>
            {renderAgentResponse()}
          </>
        )}

        {/* PPT 완료 응답 - 모든 메시지 뒤에 렌더링 */}
        {pptStatus === 'done' && !isOutlineRevisionMode && (
          <div className="mb-6">
            <PPTDoneResponse
              slideCount={pptConfig.slideCount || 15}
              onRequestSalesAnalysis={onRequestSalesAnalysis}
              isCenterPanelOpen={centerPanelState.isOpen || artifactPreview.isOpen}
              onOpenCenterPanel={() => {
                onOpenCenterPanel('ppt-result');
              }}
            />
          </div>
        )}

        <div className="h-6"></div>
      </div>

      {/* Scroll to Bottom Button */}
      <ScrollToBottomButton
        isVisible={showScrollButton}
        unreadCount={unreadCount}
        onClick={scrollToBottom}
      />
    </div>
  );
});

ChatHistoryPanel.displayName = 'ChatHistoryPanel';

export default ChatHistoryPanel;
