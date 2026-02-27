import React, { useRef, useEffect } from 'react';
import { User } from '../../../../icons';
import { ChatMessage } from '../../types';
import { CitationSourceLink } from '../../../agent-chat/components/CitationSourceLink';
import { MarkdownRenderer } from '@/components/shared/markdown';
import { UnifiedChatInput } from '../UnifiedChatInput';
import type { AttachedFile } from '../../../agent-chat/types';

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  // Input props for empty state
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onSend?: (attachedFiles?: AttachedFile[]) => void;
  // Model switcher props (passed to UnifiedChatInput)
  selectedModelId?: string;
  onModelChange?: (modelId: string) => void;
  onValidationError?: (message: string) => void;
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isLoading,
  inputValue = '',
  onInputChange,
  onSend,
  selectedModelId,
  onModelChange,
  onValidationError,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Empty state with KonaAgent branding - positioned at bottom center
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Content wrapper - centered */}
        <div className="w-full max-w-2xl flex flex-col items-center">
          {/* KonaAgent Logo and Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FF3C42] rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="text-xl font-semibold text-gray-800">KonaAgent</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            무엇을 도와드릴까요?
          </h2>

          {/* Input Area - Unified Component */}
          <UnifiedChatInput
            inputValue={inputValue}
            onInputChange={onInputChange ?? (() => {})}
            onSend={onSend ?? (() => {})}
            variant="centered"
            showModelSwitcher={!!selectedModelId}
            selectedModelId={selectedModelId}
            onModelChange={onModelChange}
            onValidationError={onValidationError}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.type === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user'
                  ? 'bg-gray-200'
                  : 'bg-[#FF3C42]'
              }`}
            >
              {message.type === 'user' ? (
                <User size={16} className="text-gray-600" />
              ) : (
                <span className="text-white font-bold text-xs">K</span>
              )}
            </div>

            {/* Message Content */}
            <div
              className={`flex flex-col max-w-[80%] ${
                message.type === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`px-4 py-2.5 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-[#FF3C42] text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}
              >
                {message.type === 'assistant' ? (
                  <>
                    <MarkdownRenderer content={message.content} compact />
                    {message.citations && message.citations.length > 0 && (
                      <CitationSourceLink citations={message.citations} />
                    )}
                  </>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                )}
              </div>
              <span className="text-[10px] text-gray-400 mt-1 px-1">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FF3C42] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">K</span>
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatPanel;
