import React, { memo } from 'react';
import { User } from '../../icons';
import { MarkdownRenderer } from '@/components/shared/markdown';

export interface ChatBubbleProps {
  speaker: 'ai' | 'user';
  message: string;
  timestamp: string;
  isInterim?: boolean;
}

export const ChatBubble = memo<ChatBubbleProps>(({ speaker, message, timestamp, isInterim }) => {
  return (
    <div
      className={`flex w-full mb-6 animate-fade-in-up ${
        speaker === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`flex max-w-[90%] ${
          speaker === 'user' ? 'flex-row-reverse' : 'flex-row'
        } gap-3`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
            speaker === 'ai' ? 'bg-gray-900 text-white' : 'bg-[#FF3C42] text-white'
          }`}
        >
          {speaker === 'ai' ? (
            <span className="font-bold text-xs">AI</span>
          ) : (
            <User size={16} />
          )}
        </div>
        <div
          className={`flex flex-col ${speaker === 'user' ? 'items-end' : 'items-start'}`}
        >
          <div
            className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
              speaker === 'ai'
                ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                : 'bg-[#FF3C42] text-white rounded-tr-sm whitespace-pre-line'
            } ${isInterim ? 'animate-pulse text-gray-500' : ''}`}
          >
            {speaker === 'ai' ? (
              <MarkdownRenderer content={message} compact />
            ) : (
              message
            )}
          </div>
          <span className="text-[10px] text-gray-400 mt-1.5 px-1 flex items-center gap-1">
            {timestamp}
          </span>
        </div>
      </div>
    </div>
  );
});

ChatBubble.displayName = 'ChatBubble';

export default ChatBubble;
