import { memo, useCallback, useRef } from 'react';
import { ListTree, X } from 'lucide-react';
import type { TOCItem } from './types';

interface DocumentTOCSidebarProps {
  items: TOCItem[];
  activeTOCId: string | null;
  onItemClick: (id: string) => void;
  onClose: () => void;
}

const INDENT_MAP: Record<number, string> = {
  1: 'pl-3',
  2: 'pl-5',
  3: 'pl-7',
  4: 'pl-9',
  5: 'pl-11',
  6: 'pl-11',
};

const FONT_MAP: Record<number, string> = {
  1: 'font-semibold text-[13px]',
  2: 'font-medium text-[12.5px]',
  3: 'text-[12px]',
  4: 'text-[11.5px] text-gray-500',
  5: 'text-[11px] text-gray-400',
  6: 'text-[11px] text-gray-400',
};

export const DocumentTOCSidebar = memo(function DocumentTOCSidebar({
  items,
  activeTOCId,
  onItemClick,
  onClose,
}: DocumentTOCSidebarProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let nextIndex: number | null = null;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = Math.min(index + 1, items.length - 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = Math.max(index - 1, 0);
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = items.length - 1;
      }

      if (nextIndex !== null && listRef.current) {
        const buttons = listRef.current.querySelectorAll<HTMLButtonElement>('[role="treeitem"]');
        buttons[nextIndex]?.focus();
      }
    },
    [items.length]
  );

  if (items.length === 0) {
    return (
      <div className="w-56 shrink-0 border-r border-gray-200 bg-gray-50/50 flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
            <ListTree className="w-3.5 h-3.5" />
            목차
          </div>
          <button
            onClick={onClose}
            className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
            aria-label="목차 닫기"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <p className="text-xs text-gray-400 text-center">
            이 문서에서 heading을 찾을 수 없습니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <nav
      className="w-56 shrink-0 border-r border-gray-200 bg-gray-50/50 flex flex-col overflow-hidden"
      aria-label="문서 목차"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
          <ListTree className="w-3.5 h-3.5" />
          목차
        </div>
        <button
          onClick={onClose}
          className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
          aria-label="목차 닫기"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto py-1.5" role="tree" aria-label="문서 목차 항목">
        {items.map((item, index) => {
          const isActive = activeTOCId === item.id;
          return (
            <button
              key={item.id}
              role="treeitem"
              tabIndex={isActive ? 0 : -1}
              onClick={() => onItemClick(item.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`
                w-full text-left py-1.5 pr-3 transition-colors duration-150 outline-none
                focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset
                ${INDENT_MAP[item.level] || 'pl-3'}
                ${FONT_MAP[item.level] || 'text-xs'}
                ${
                  isActive
                    ? 'text-blue-700 bg-blue-50 border-l-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100 border-l-2 border-transparent'
                }
              `}
              aria-current={isActive ? 'location' : undefined}
              aria-level={item.level}
              title={item.text}
            >
              <span className="line-clamp-2">{item.text}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});
