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
import { Button } from '../../../../../ui/button';
import { Textarea } from '../../../../../ui/textarea';

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
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="h-8 w-8"
            title="이전 슬라이드"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={currentIndex >= totalCount - 1}
            className="h-8 w-8"
            title="다음 슬라이드"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </Button>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLayoutSelector(!showLayoutSelector)}
              className="text-xs font-medium text-gray-600"
            >
              레이아웃: {outline.layoutType}
            </Button>
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
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="미리보기"
          >
            <Eye className="w-4 h-4 text-gray-500" />
          </Button>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            title="닫기"
          >
            <X className="w-4 h-4 text-gray-500" />
          </Button>
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
          <Textarea
            ref={textareaRef}
            value={localContent}
            onChange={(e) => handleContentChange(e.target.value)}
            onSelect={handleSelect}
            className="w-full h-full p-6 bg-transparent resize-none border-none focus-visible:ring-0 shadow-none font-mono text-sm text-gray-800 leading-relaxed min-h-0"
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddToContext}
              className="text-xs font-medium text-blue-700 border-blue-200 hover:bg-blue-50"
            >
              <Paperclip className="w-3.5 h-3.5" />
              채팅에 추가
            </Button>
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
          <Button
            variant="ghost"
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="text-sm text-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
            이전
          </Button>

          {/* Center: Approval Actions */}
          <div className="flex items-center gap-2">
            {/* 수정 필요 버튼 */}
            <Button
              variant="outline"
              onClick={() => {
                onMarkNeedsRevision(outline.id);
                onEnterRevisionMode?.(outline.id);
              }}
              className={
                needsRevision
                  ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100'
                  : 'text-gray-600 hover:bg-gray-50'
              }
            >
              <AlertCircle className="w-4 h-4" />
              수정 필요
            </Button>

            {/* 승인 버튼 */}
            <Button
              onClick={() => onApprove(outline.id)}
              className={
                isApproved
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-[#FF3C42] text-white hover:bg-[#E63538]'
              }
            >
              <Check className="w-4 h-4" />
              {isApproved ? '승인됨' : '승인'}
            </Button>
          </div>

          {/* Right: Navigation */}
          <Button
            variant="ghost"
            onClick={onNext}
            disabled={currentIndex >= totalCount - 1}
            className="text-sm text-gray-600"
          >
            다음
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SlideOutlineEditor;
