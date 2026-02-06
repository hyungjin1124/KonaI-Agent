import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Paperclip,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { SlideOutline, SlideLayoutType } from '../../../types';
import { LayoutSelector } from './LayoutSelector';

interface SlideOutlineEditorProps {
  outline: SlideOutline | null;
  currentIndex: number;
  totalCount: number;
  onContentChange: (id: string, content: string) => void;
  onLayoutChange: (id: string, layout: SlideLayoutType) => void;
  onApprove: (id: string) => void;
  onMarkNeedsRevision: (id: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
  onAddToContext?: (text: string) => void;
  onEnterRevisionMode?: (outlineId: string) => void;
}

export const SlideOutlineEditor: React.FC<SlideOutlineEditorProps> = ({
  outline,
  currentIndex,
  totalCount,
  onContentChange,
  onLayoutChange,
  onApprove,
  onMarkNeedsRevision,
  onPrevious,
  onNext,
  onClose,
  onAddToContext,
  onEnterRevisionMode,
}) => {
  const [localContent, setLocalContent] = useState(outline?.markdownContent || '');
  const [selectedText, setSelectedText] = useState('');
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 개요가 변경되면 로컬 컨텐츠 업데이트
  useEffect(() => {
    if (outline) {
      setLocalContent(outline.markdownContent);
    }
  }, [outline?.id, outline?.markdownContent]);

  // 자동 저장 (debounced)
  const handleContentChange = useCallback((value: string) => {
    setLocalContent(value);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (outline) {
        onContentChange(outline.id, value);
      }
    }, 500);
  }, [outline, onContentChange]);

  // 클린업
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // 텍스트 선택 감지
  const handleSelect = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const selected = textarea.value.substring(
        textarea.selectionStart,
        textarea.selectionEnd
      );
      setSelectedText(selected);
    }
  }, []);

  // 선택 영역을 채팅에 추가
  const handleAddToContext = useCallback(() => {
    if (selectedText && onAddToContext) {
      onAddToContext(selectedText);
      setSelectedText('');
    }
  }, [selectedText, onAddToContext]);

  if (!outline) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">슬라이드를 선택해주세요</p>
      </div>
    );
  }

  const isApproved = outline.status === 'approved';
  const needsRevision = outline.status === 'needs-revision';

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/50">
        {/* Left: Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="이전 슬라이드"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={onNext}
            disabled={currentIndex >= totalCount - 1}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="다음 슬라이드"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-900 ml-2">
            {outline.fileName}
          </span>
          <span className="text-xs text-gray-400">
            ({currentIndex + 1}/{totalCount})
          </span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* Layout Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLayoutSelector(!showLayoutSelector)}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              레이아웃: {outline.layoutType}
            </button>
            {showLayoutSelector && (
              <LayoutSelector
                currentLayout={outline.layoutType}
                onSelect={(layout) => {
                  onLayoutChange(outline.id, layout);
                  setShowLayoutSelector(false);
                }}
                onClose={() => setShowLayoutSelector(false)}
              />
            )}
          </div>

          {/* Preview Button */}
          <button
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="미리보기"
          >
            <Eye className="w-4 h-4 text-gray-500" />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="닫기"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden p-4">
        <div
          className="h-full rounded-xl border border-gray-200 overflow-hidden"
          style={{
            backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            backgroundColor: '#FAFAF9',
          }}
        >
          <textarea
            ref={textareaRef}
            value={localContent}
            onChange={(e) => handleContentChange(e.target.value)}
            onSelect={handleSelect}
            className="w-full h-full p-6 bg-transparent resize-none focus:outline-none font-mono text-sm text-gray-800 leading-relaxed"
            placeholder="마크다운 형식으로 슬라이드 내용을 작성하세요..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Footer: Status + Actions */}
      <div className="border-t border-gray-200">
        {/* Context Action Bar (텍스트 선택 시 표시) */}
        {selectedText && onAddToContext && (
          <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border-b border-blue-100">
            <span className="text-xs text-blue-700">
              "{selectedText.slice(0, 30)}{selectedText.length > 30 ? '...' : ''}" 선택됨
            </span>
            <button
              onClick={handleAddToContext}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Paperclip className="w-3.5 h-3.5" />
              채팅에 추가
            </button>
          </div>
        )}

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50/50 text-xs text-gray-500">
          <span>Markdown 지원 | 자동 저장</span>
          {outline.estimatedDuration && (
            <span>예상 시간: {outline.estimatedDuration}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Navigation */}
          <button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            이전
          </button>

          {/* Center: Approval Actions */}
          <div className="flex items-center gap-2">
            {/* 수정 필요 버튼 */}
            <button
              onClick={() => {
                onMarkNeedsRevision(outline.id);
                onEnterRevisionMode?.(outline.id);
              }}
              className={`
                flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg
                transition-colors
                ${needsRevision
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <AlertCircle className="w-4 h-4" />
              수정 필요
            </button>

            {/* 승인 버튼 */}
            <button
              onClick={() => onApprove(outline.id)}
              className={`
                flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg
                transition-colors
                ${isApproved
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-[#FF3C42] text-white hover:bg-[#E63538]'
                }
              `}
            >
              <Check className="w-4 h-4" />
              {isApproved ? '승인됨' : '승인'}
            </button>
          </div>

          {/* Right: Navigation */}
          <button
            onClick={onNext}
            disabled={currentIndex >= totalCount - 1}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            다음
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlideOutlineEditor;
