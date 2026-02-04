import React, { useRef, useEffect } from 'react';
import { Bot, User, Plus, ArrowUp } from '../../../../icons';
import { ChatMessage } from '../../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  // Input props for empty state
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onSend?: () => void;
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
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange?.(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend?.();
    }
  };

  // Empty state with KonaAgent branding - positioned at bottom center
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-end px-8 pb-8">
        {/* Content wrapper - centered horizontally, left-aligned internally */}
        <div className="w-full max-w-2xl flex flex-col items-start">
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

          {/* Input Area - Dashboard Style */}
          <div className="w-full">
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] focus-within:border-[#FF3C42] focus-within:ring-1 focus-within:ring-[#FF3C42] transition-all shadow-sm flex items-end p-2 gap-2">
            <button className="p-2 mb-0.5 text-[#848383] hover:text-[#FF3C42] hover:bg-gray-50 rounded-lg transition-colors">
              <Plus size={20} />
            </button>

            <textarea
              ref={textareaRef}
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-[#000000] placeholder-[#848383] text-sm font-medium resize-none py-2.5 min-h-[60px] max-h-[120px] overflow-y-auto leading-relaxed"
              placeholder="데이터 분석, 보고서 생성, 또는 업무 지시를 입력하세요..."
              rows={2}
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
            />

            <div className="flex items-center gap-1 mb-0.5">
              <button
                className={`p-2 rounded-lg transition-all ${
                  inputValue.trim()
                    ? 'bg-[#FF3C42] text-white shadow-sm hover:bg-[#E5363B]'
                    : 'bg-gray-100 text-[#848383] cursor-not-allowed'
                }`}
                disabled={!inputValue.trim()}
                onClick={onSend}
              >
                <ArrowUp size={20} />
              </button>
            </div>
          </div>
        </div>
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
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
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
