import React, { memo, useState, useEffect, useRef } from 'react';
import { Search, PlusCircle, ChevronRight, ChevronLeft } from '../../../icons';

interface DrillDownContextMenuProps {
  x: number;
  y: number;
  elementName: string;
  formattedValue: string;
  dimensions: { id: string; label: string }[];
  onDrillDown: (dimensionId: string) => void;
  onAddToContext: () => void;
  onClose: () => void;
}

const MENU_WIDTH = 220;

export const DrillDownContextMenu = memo<DrillDownContextMenuProps>(
  ({ x, y, elementName, formattedValue, dimensions, onDrillDown, onAddToContext, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [depth, setDepth] = useState<0 | 1>(0);

    // Vercel client-event-listeners: single listener + cleanup
    useEffect(() => {
      const handleMouseDown = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          onClose();
        }
      };
      document.addEventListener('mousedown', handleMouseDown);
      return () => document.removeEventListener('mousedown', handleMouseDown);
    }, [onClose]);

    // Viewport-aware positioning (use measured height after render)
    const adjustedX = x + MENU_WIDTH > window.innerWidth ? x - MENU_WIDTH - 4 : x;
    const adjustedY = Math.min(y, window.innerHeight - 200);

    return (
      <div
        ref={menuRef}
        className="fixed z-50 bg-white rounded-xl shadow-lg border border-gray-200 py-1 min-w-[220px] animate-fade-in-up"
        style={{ left: adjustedX, top: adjustedY }}
      >
        {depth === 0 ? (
          <>
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-900 truncate">{elementName}</p>
              <p className="text-[10px] text-gray-500">{formattedValue}</p>
            </div>
            <button
              onClick={() => setDepth(1)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Search size={14} className="text-[#FF3C42] shrink-0" />
              <span>상세 분석</span>
              <ChevronRight size={14} className="ml-auto text-gray-400" />
            </button>
            <button
              onClick={onAddToContext}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <PlusCircle size={14} className="text-gray-400 shrink-0" />
              <span>에이전트 컨텍스트에 추가</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setDepth(0)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <ChevronLeft size={14} />
              <span>상세 분석</span>
            </button>
            {dimensions.map((dim) => (
              <button
                key={dim.id}
                onClick={() => onDrillDown(dim.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Search size={14} className="text-[#FF3C42] shrink-0" />
                <span>{dim.label}</span>
              </button>
            ))}
          </>
        )}
      </div>
    );
  }
);

DrillDownContextMenu.displayName = 'DrillDownContextMenu';
