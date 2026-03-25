import React from 'react';
import { MessageSquare, Wrench, Check } from 'lucide-react';
import { ChatHistoryEntry } from '@/types/skill-management.types';

interface ChatHistorySelectorProps {
  entries: ChatHistoryEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const ChatHistorySelector: React.FC<ChatHistorySelectorProps> = ({
  entries,
  selectedId,
  onSelect,
}) => {
  if (entries.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <MessageSquare size={24} className="mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">캡처 가능한 채팅 이력이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
        최근 채팅 세션 ({entries.length})
      </p>
      {entries.map((entry) => {
        const isSelected = selectedId === entry.id;
        return (
          <div
            key={entry.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(entry.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(entry.id);
              }
            }}
            className={`rounded-xl border p-4 cursor-pointer transition-all ${
              isSelected
                ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-900 truncate">
                    {entry.title}
                  </span>
                  {isSelected && <Check size={14} className="text-green-500 shrink-0" />}
                </div>
                <p className="text-xs text-gray-400 mb-2">{entry.timestamp} · {entry.messageCount}개 메시지</p>
                <div className="flex flex-wrap gap-1">
                  {entry.toolCalls.slice(0, 4).map((tool) => (
                    <span
                      key={tool}
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs"
                    >
                      <Wrench size={10} />
                      {tool}
                    </span>
                  ))}
                  {entry.toolCalls.length > 4 && (
                    <span className="text-xs text-gray-400">+{entry.toolCalls.length - 4}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatHistorySelector;
