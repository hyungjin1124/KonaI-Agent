import React, { useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import { SlideLayoutType } from '../../../types';

interface LayoutOption {
  type: SlideLayoutType;
  label: string;
  preview: React.ReactNode;
}

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    type: 'title-only',
    label: '제목만',
    preview: (
      <div className="w-full h-full flex flex-col items-center justify-center p-1">
        <div className="w-3/4 h-2 bg-gray-400 rounded mb-1" />
      </div>
    ),
  },
  {
    type: 'title-subtitle',
    label: '제목+부제',
    preview: (
      <div className="w-full h-full flex flex-col items-center justify-center p-1">
        <div className="w-3/4 h-2 bg-gray-400 rounded mb-1" />
        <div className="w-1/2 h-1.5 bg-gray-300 rounded" />
      </div>
    ),
  },
  {
    type: 'title-bullets',
    label: '글머리표',
    preview: (
      <div className="w-full h-full flex flex-col p-1">
        <div className="w-2/3 h-1.5 bg-gray-400 rounded mb-1" />
        <div className="space-y-0.5 mt-1">
          <div className="flex items-center gap-0.5">
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <div className="w-3/4 h-1 bg-gray-200 rounded" />
          </div>
          <div className="flex items-center gap-0.5">
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <div className="w-2/3 h-1 bg-gray-200 rounded" />
          </div>
          <div className="flex items-center gap-0.5">
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <div className="w-1/2 h-1 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    ),
  },
  {
    type: 'two-column',
    label: '2단',
    preview: (
      <div className="w-full h-full flex flex-col p-1">
        <div className="w-1/2 h-1.5 bg-gray-400 rounded mb-1" />
        <div className="flex gap-1 flex-1">
          <div className="flex-1 bg-gray-200 rounded" />
          <div className="flex-1 bg-gray-200 rounded" />
        </div>
      </div>
    ),
  },
  {
    type: 'title-image-right',
    label: '우측 이미지',
    preview: (
      <div className="w-full h-full flex flex-col p-1">
        <div className="w-1/2 h-1.5 bg-gray-400 rounded mb-1" />
        <div className="flex gap-1 flex-1">
          <div className="flex-1 flex flex-col gap-0.5">
            <div className="w-full h-1 bg-gray-200 rounded" />
            <div className="w-3/4 h-1 bg-gray-200 rounded" />
          </div>
          <div className="w-1/3 bg-blue-100 rounded flex items-center justify-center">
            <span className="text-[6px] text-blue-400">IMG</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    type: 'chart-full',
    label: '차트',
    preview: (
      <div className="w-full h-full flex flex-col p-1">
        <div className="w-1/2 h-1.5 bg-gray-400 rounded mb-1" />
        <div className="flex-1 bg-blue-50 rounded flex items-end justify-center gap-0.5 p-1">
          <div className="w-1.5 h-2 bg-blue-300 rounded-t" />
          <div className="w-1.5 h-3 bg-blue-400 rounded-t" />
          <div className="w-1.5 h-2.5 bg-blue-300 rounded-t" />
          <div className="w-1.5 h-4 bg-blue-500 rounded-t" />
        </div>
      </div>
    ),
  },
  {
    type: 'comparison',
    label: '비교',
    preview: (
      <div className="w-full h-full flex flex-col p-1">
        <div className="w-1/2 h-1.5 bg-gray-400 rounded mb-1" />
        <div className="flex gap-0.5 flex-1">
          <div className="flex-1 border border-green-200 rounded p-0.5">
            <div className="w-full h-1 bg-green-200 rounded mb-0.5" />
            <div className="w-3/4 h-0.5 bg-green-100 rounded" />
          </div>
          <div className="flex-1 border border-red-200 rounded p-0.5">
            <div className="w-full h-1 bg-red-200 rounded mb-0.5" />
            <div className="w-3/4 h-0.5 bg-red-100 rounded" />
          </div>
        </div>
      </div>
    ),
  },
  {
    type: 'section-divider',
    label: '섹션 구분',
    preview: (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
        <div className="w-2/3 h-2.5 bg-gray-400 rounded" />
      </div>
    ),
  },
];

interface LayoutSelectorProps {
  currentLayout: SlideLayoutType;
  onSelect: (layout: SlideLayoutType) => void;
  onClose: () => void;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  currentLayout,
  onSelect,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      className="absolute right-0 top-full mt-1 z-50 w-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-900">레이아웃 선택</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Layout Grid */}
      <div className="p-3 grid grid-cols-4 gap-2">
        {LAYOUT_OPTIONS.map((option) => {
          const isSelected = currentLayout === option.type;

          return (
            <button
              key={option.type}
              onClick={() => onSelect(option.type)}
              className={`
                relative flex flex-col items-center p-1.5 rounded-lg
                border-2 transition-all
                ${isSelected
                  ? 'border-[#FF3C42] bg-orange-50'
                  : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                }
              `}
              title={option.label}
            >
              {/* Preview */}
              <div className="w-12 h-9 border border-gray-200 rounded bg-white overflow-hidden">
                {option.preview}
              </div>

              {/* Label */}
              <span className="text-[10px] text-gray-600 mt-1 truncate w-full text-center">
                {option.label}
              </span>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF3C42] rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LayoutSelector;
