import React, { useRef, useCallback } from 'react';
import { ArrowUp } from '../../../../icons';
import { AttachedFileChip } from '../../../agent-chat/components/ChatInputArea/AttachedFileChip';
import { DropZoneOverlay } from '../../../agent-chat/components/ChatInputArea/DropZoneOverlay';
import { ModelSwitcher } from '../../../model-switcher';
import { PlusMenu } from './PlusMenu';
import { useFileAttachment } from './useFileAttachment';
import { ALLOWED_ACCEPT_ALL, ALLOWED_MIME_IMAGES } from './constants';
import type { AttachedFile } from '../../../agent-chat/types';

export interface UnifiedChatInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: (attachedFiles?: AttachedFile[]) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  disabled?: boolean;
  placeholder?: string;

  showModelSwitcher?: boolean;
  selectedModelId?: string;
  onModelChange?: (modelId: string) => void;

  variant?: 'default' | 'centered';
  className?: string;

  onValidationError?: (message: string) => void;
}

export const UnifiedChatInput: React.FC<UnifiedChatInputProps> = ({
  inputValue,
  onInputChange,
  onSend,
  textareaRef: externalTextareaRef,
  disabled,
  placeholder = '데이터 분석, 보고서 생성, 또는 업무 지시를 입력하세요...',
  showModelSwitcher,
  selectedModelId,
  onModelChange,
  variant = 'default',
  className,
  onValidationError,
}) => {
  const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalTextareaRef || internalTextareaRef;

  const {
    attachedFiles,
    isDragging,
    fileInputRef,
    imageInputRef,
    removeFile,
    clearFiles,
    handlePaste,
    handleFileInputChange,
    handleImageInputChange,
    dragHandlers,
  } = useFileAttachment({ onValidationError });

  const hasInput = !!(inputValue.trim() || attachedFiles.length > 0);

  const handleSubmit = useCallback(() => {
    if (!hasInput || disabled) return;
    onSend(attachedFiles.length > 0 ? attachedFiles : undefined);
    clearFiles();
  }, [hasInput, disabled, onSend, attachedFiles, clearFiles]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onInputChange(e.target.value);
      const textarea = e.target;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    },
    [onInputChange],
  );

  const isCentered = variant === 'centered';

  return (
    <div
      className={`${isCentered ? '' : 'border-t border-gray-200 bg-white px-4 py-3'} relative ${className ?? ''}`}
      {...dragHandlers}
    >
      <DropZoneOverlay isVisible={isDragging} />

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef as React.RefObject<HTMLInputElement>}
        type="file"
        className="hidden"
        onChange={handleFileInputChange}
        accept={ALLOWED_ACCEPT_ALL}
        multiple
        aria-hidden="true"
      />
      <input
        ref={imageInputRef as React.RefObject<HTMLInputElement>}
        type="file"
        className="hidden"
        onChange={handleImageInputChange}
        accept={ALLOWED_MIME_IMAGES}
        multiple
        aria-hidden="true"
      />

      <div className={`${isCentered ? 'w-full' : 'max-w-3xl mx-auto'}`}>
        {/* Top row: ModelSwitcher + Attached file chips */}
        {(showModelSwitcher || attachedFiles.length > 0) && (
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {showModelSwitcher && selectedModelId && onModelChange && (
              <ModelSwitcher
                value={selectedModelId}
                onValueChange={onModelChange}
                className="w-[200px]"
              />
            )}
            {attachedFiles.map((file) => (
              <AttachedFileChip
                key={file.id}
                file={file}
                onRemove={removeFile}
              />
            ))}
          </div>
        )}

        {/* Input container */}
        <div
          className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] focus-within:border-[#FF3C42] focus-within:ring-1 focus-within:ring-[#FF3C42] transition-all shadow-sm flex items-end p-2 gap-2"
          role="group"
          aria-label="메시지 입력 영역"
        >
          {/* Plus Menu */}
          <PlusMenu
            onFileClick={() => fileInputRef.current?.click()}
            onImageClick={() => imageInputRef.current?.click()}
            disabled={disabled}
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef as React.RefObject<HTMLTextAreaElement>}
            value={inputValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            rows={isCentered ? 2 : 1}
            disabled={disabled}
            className={`flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-[#000000] placeholder-[#848383] text-sm font-medium resize-none py-2.5 max-h-[120px] overflow-y-auto leading-relaxed ${
              isCentered ? 'min-h-[60px]' : ''
            }`}
            aria-label="메시지 입력"
            aria-multiline="true"
          />

          {/* Send Button */}
          <div className="flex items-center gap-1 mb-0.5">
            <button
              onClick={handleSubmit}
              disabled={!hasInput || disabled}
              className={`p-2 rounded-lg transition-all ${
                hasInput && !disabled
                  ? 'bg-[#FF3C42] text-white shadow-sm hover:bg-[#E5363B]'
                  : 'bg-gray-100 text-[#848383] cursor-not-allowed'
              }`}
              aria-label="메시지 전송"
              aria-disabled={!hasInput || disabled}
            >
              <ArrowUp size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(UnifiedChatInput);
