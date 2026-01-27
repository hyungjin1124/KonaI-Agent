import React, { memo } from 'react';
import { User } from '../../icons';

export interface ChatBubbleProps {
  speaker: 'ai' | 'user';
  message: string;
  timestamp: string;
  isInterim?: boolean;
}

export const ChatBubble = memo<ChatBubbleProps>(({ speaker, message, timestamp, isInterim }) => {
  // Enhanced markdown parsing for lists and bold text
  const renderMessage = (text: string) => {
    return text.split('\n').map((line, lineIdx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={partIdx} className="font-bold text-gray-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      // Handle simple list items (starting with - or 1.)
      if (line.trim().startsWith('- ') || /^\d+\./.test(line.trim())) {
        return (
          <div key={lineIdx} className="pl-4 mb-1">
            {renderedParts}
          </div>
        );
      }
      // Handle headers (###)
      if (line.trim().startsWith('###')) {
        return (
          <h3 key={lineIdx} className="text-sm font-bold mt-3 mb-1 text-gray-800">
            {line.replace('###', '').trim()}
          </h3>
        );
      }

      return (
        <div key={lineIdx} className="min-h-[1.2em]">
          {renderedParts}
        </div>
      );
    });
  };

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
            className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-line ${
              speaker === 'ai'
                ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                : 'bg-[#FF3C42] text-white rounded-tr-sm'
            } ${isInterim ? 'animate-pulse text-gray-500' : ''}`}
          >
            {renderMessage(message)}
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
