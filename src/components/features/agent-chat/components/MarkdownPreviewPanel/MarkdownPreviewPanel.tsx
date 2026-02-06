import React, { useState, useCallback, useEffect, useRef } from 'react';
import { X, Eye, Pencil, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Artifact } from '../../types';
import { markdownComponents } from './markdownComponents';

interface MarkdownPreviewPanelProps {
  artifact: Artifact;
  content: string;
  mode: 'read' | 'edit';
  onModeChange: (mode: 'read' | 'edit') => void;
  onContentChange: (content: string) => void;
  onClose: () => void;
  editingState?: 'idle' | 'editing' | 'shimmer';
}

/**
 * 마크다운 미리보기/편집 패널
 * - react-markdown + remark-gfm으로 GFM(테이블, 체크박스 등) 지원
 * - 읽기/편집 모드 전환
 * - 중앙 정렬된 깔끔한 레이아웃
 */
const MarkdownPreviewPanel: React.FC<MarkdownPreviewPanelProps> = ({
  artifact,
  content,
  mode,
  onModeChange,
  onContentChange,
  onClose,
  editingState = 'idle',
}) => {
  const [localContent, setLocalContent] = useState(content);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingContentRef = useRef<string | null>(null);
  const onContentChangeRef = useRef(onContentChange);

  // onContentChange 레퍼런스 최신화
  useEffect(() => {
    onContentChangeRef.current = onContentChange;
  }, [onContentChange]);

  // 외부 content 변경 시 로컬 상태 동기화
  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  // 편집 내용 디바운스 저장 (500ms)
  const handleContentEdit = useCallback((newContent: string) => {
    setLocalContent(newContent);
    pendingContentRef.current = newContent;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onContentChangeRef.current(newContent);
      pendingContentRef.current = null;
    }, 500);
  }, []);

  // 컴포넌트 언마운트 시: 타이머 클리어 + 미저장 콘텐츠 저장
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      // 미저장 콘텐츠가 있으면 저장
      if (pendingContentRef.current !== null) {
        onContentChangeRef.current(pendingContentRef.current);
      }
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header - 세련된 디자인 */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
            <FileText size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
              {artifact.title}
            </h3>
            <span className="text-xs text-gray-500">슬라이드 개요</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Toggle - 피드백 있는 토글 */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => onModeChange('read')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === 'read'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Eye size={15} />
              <span>미리보기</span>
            </button>
            <button
              onClick={() => onModeChange('edit')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === 'edit'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Pencil size={15} />
              <span>편집</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-150"
            title="닫기"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content - 중앙 정렬 */}
      <div className="flex-1 overflow-auto bg-gray-50/30">
        <div className="flex justify-center min-h-full">
          <div className="w-full max-w-4xl">
            {mode === 'read' ? (
              <div className="p-8 md:p-12 relative">
                {/* 편집 중 오버레이 */}
                {(editingState === 'editing' || editingState === 'shimmer') && (
                  <div
                    className={`absolute inset-0 z-10 flex items-start justify-center pt-8 transition-opacity duration-300 ${
                      editingState === 'shimmer' ? 'bg-white/40' : 'bg-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200">
                      <div className="w-2 h-2 bg-[#FF3C42] rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-gray-700">
                        {editingState === 'editing' ? '파일 분석 중...' : 'KPI 테이블 수정 적용 중...'}
                      </span>
                    </div>
                  </div>
                )}
                <article className={`max-w-none transition-opacity duration-500 ${
                  editingState === 'shimmer' ? 'opacity-40' : 'opacity-100'
                }`}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {localContent}
                  </ReactMarkdown>
                </article>
              </div>
            ) : (
              <div className="p-6 md:p-8 h-full">
                <div className="h-full rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <textarea
                    value={localContent}
                    onChange={(e) => handleContentEdit(e.target.value)}
                    className="w-full h-full p-6 text-sm font-mono text-gray-800 resize-none focus:outline-none leading-relaxed"
                    placeholder="마크다운 내용을 입력하세요..."
                    spellCheck={false}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownPreviewPanel;
