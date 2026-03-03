import React, { useState, useCallback } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnifiedChatInput } from './UnifiedChatInput';
import type { AttachedFile } from '../../../agent-chat/types';

// Shared mocks
vi.mock('@/context/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn(), dismissToast: vi.fn(), clearAllToasts: vi.fn(), toasts: [] }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../../model-switcher', () => ({
  ModelSwitcher: ({ value, onValueChange, className }: { value?: string; onValueChange?: (v: string) => void; className?: string }) => (
    <select
      data-testid="model-switcher"
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={className}
    >
      <option value="claude-sonnet-4-5">Claude Sonnet</option>
      <option value="gpt-4o">GPT-4o</option>
    </select>
  ),
}));

vi.mock('../../../agent-chat/components/ChatInputArea/DropZoneOverlay', () => ({
  DropZoneOverlay: ({ isVisible }: { isVisible: boolean }) =>
    isVisible ? <div data-testid="drop-zone-overlay">Drop zone</div> : null,
}));

vi.mock('../../../agent-chat/components/ChatInputArea/AttachedFileChip', () => ({
  AttachedFileChip: ({ file, onRemove }: { file: { id: string; name: string }; onRemove: (id: string) => void }) => (
    <div data-testid={`file-chip-${file.id}`}>
      <span>{file.name}</span>
      <button aria-label={`${file.name} 제거`} onClick={() => onRemove(file.id)}>X</button>
    </div>
  ),
}));

vi.mock('../../../../icons', () => ({
  ArrowUp: () => <span data-testid="arrow-up-icon">↑</span>,
  Plus: () => <span data-testid="plus-icon">+</span>,
}));

vi.mock('lucide-react', () => ({
  FileText: () => <span>FileText</span>,
  Image: () => <span>Image</span>,
  Link: () => <span>Link</span>,
}));

/**
 * Wrapper component that simulates GeneralChatView's state management
 * for UnifiedChatInput, mimicking the actual parent behavior.
 */
const ParentSimulator: React.FC<{
  variant?: 'default' | 'centered';
  showModelSwitcher?: boolean;
  initialValue?: string;
  onSendCapture?: (text: string, files?: AttachedFile[]) => void;
  onValidationErrorCapture?: (msg: string) => void;
}> = ({ variant = 'default', showModelSwitcher, initialValue = '', onSendCapture, onValidationErrorCapture }) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [selectedModelId, setSelectedModelId] = useState('claude-sonnet-4-5');
  const [sentMessages, setSentMessages] = useState<string[]>([]);

  const handleSend = useCallback((attachedFiles?: AttachedFile[]) => {
    if (!inputValue.trim() && (!attachedFiles || attachedFiles.length === 0)) return;
    const content = inputValue.trim();
    setSentMessages((prev) => [...prev, content]);
    setInputValue('');
    onSendCapture?.(content, attachedFiles);
  }, [inputValue, onSendCapture]);

  const handleValidationError = useCallback((message: string) => {
    onValidationErrorCapture?.(message);
  }, [onValidationErrorCapture]);

  return (
    <div>
      <div data-testid="sent-count">{sentMessages.length}</div>
      <div data-testid="current-model">{selectedModelId}</div>
      <UnifiedChatInput
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSend={handleSend}
        variant={variant}
        showModelSwitcher={showModelSwitcher}
        selectedModelId={selectedModelId}
        onModelChange={setSelectedModelId}
        onValidationError={handleValidationError}
      />
    </div>
  );
};

describe('QA Flow Tests: UnifiedChatInput + Parent Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // Flow 1: Standard message send (most common)
  // ==========================================
  describe('Flow 1: Standard message send', () => {
    it('type → Enter → input cleared → parent receives message', async () => {
      const onSendCapture = vi.fn();
      render(<ParentSimulator onSendCapture={onSendCapture} />);

      const textarea = screen.getByLabelText('메시지 입력') as HTMLTextAreaElement;

      // Type a message
      await userEvent.type(textarea, '분석 요청합니다');
      expect(textarea.value).toBe('분석 요청합니다');

      // Press Enter
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      // Input should be cleared
      expect(textarea.value).toBe('');

      // Parent should have received the message
      expect(onSendCapture).toHaveBeenCalledWith('분석 요청합니다', undefined);
      expect(screen.getByTestId('sent-count').textContent).toBe('1');
    });

    it('type → click send → input cleared', async () => {
      const onSendCapture = vi.fn();
      render(<ParentSimulator onSendCapture={onSendCapture} />);

      const textarea = screen.getByLabelText('메시지 입력');
      await userEvent.type(textarea, '보고서 생성');

      const sendButton = screen.getByLabelText('메시지 전송');
      await userEvent.click(sendButton);

      expect(onSendCapture).toHaveBeenCalledWith('보고서 생성', undefined);
      expect((textarea as HTMLTextAreaElement).value).toBe('');
    });
  });

  // ==========================================
  // Flow 2: File attach → send → files cleared
  // ==========================================
  describe('Flow 2: File attach then send', () => {
    it('paste image → type text → send → both delivered, files cleared', async () => {
      const onSendCapture = vi.fn();
      render(<ParentSimulator onSendCapture={onSendCapture} />);

      const textarea = screen.getByLabelText('메시지 입력');

      // Paste an image
      const file = new File(['img-data'], 'screenshot.png', { type: 'image/png' });
      fireEvent.paste(textarea, {
        clipboardData: {
          items: [{ type: 'image/png', getAsFile: () => file }],
        },
      });

      await waitFor(() => {
        expect(screen.queryByText('screenshot.png')).toBeTruthy();
      });

      // Type text
      await userEvent.type(textarea, '이 이미지를 분석해주세요');

      // Send
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      // Verify parent received text + files
      expect(onSendCapture).toHaveBeenCalledWith(
        '이 이미지를 분석해주세요',
        expect.arrayContaining([
          expect.objectContaining({ name: 'screenshot.png' }),
        ])
      );

      // Files should be cleared after send
      await waitFor(() => {
        expect(screen.queryByText('screenshot.png')).toBeNull();
      });
    });
  });

  // ==========================================
  // Flow 3: Remove all files (terminal state)
  // ==========================================
  describe('Flow 3: Terminal state - remove all files', () => {
    it('add file → remove file → send button disabled (no text, no files)', async () => {
      render(<ParentSimulator />);

      const textarea = screen.getByLabelText('메시지 입력');

      // Add a file
      const file = new File(['data'], 'test.png', { type: 'image/png' });
      fireEvent.paste(textarea, {
        clipboardData: {
          items: [{ type: 'image/png', getAsFile: () => file }],
        },
      });

      await waitFor(() => {
        expect(screen.queryByText('test.png')).toBeTruthy();
      });

      // Send button should be enabled (file present)
      expect(screen.getByLabelText('메시지 전송')).toHaveProperty('disabled', false);

      // Remove the file
      const removeButton = screen.getByLabelText('test.png 제거');
      await userEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText('test.png')).toBeNull();
      });

      // Send button should now be disabled (no text, no files)
      expect(screen.getByLabelText('메시지 전송')).toHaveProperty('disabled', true);
    });
  });

  // ==========================================
  // Flow 4: Model change persists across sends
  // ==========================================
  describe('Flow 4: Model change persists', () => {
    it('change model → send message → model selection preserved', async () => {
      const onSendCapture = vi.fn();
      render(<ParentSimulator showModelSwitcher onSendCapture={onSendCapture} />);

      // Change model
      const modelSelect = screen.getByTestId('model-switcher');
      await userEvent.selectOptions(modelSelect, 'gpt-4o');

      expect(screen.getByTestId('current-model').textContent).toBe('gpt-4o');

      // Send a message
      const textarea = screen.getByLabelText('메시지 입력');
      await userEvent.type(textarea, 'test');
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      // Model should still be gpt-4o after send
      expect(screen.getByTestId('current-model').textContent).toBe('gpt-4o');
    });
  });

  // ==========================================
  // Flow 5: Validation error then recovery
  // ==========================================
  describe('Flow 5: Validation error → recovery', () => {
    it('invalid file rejected → valid file accepted → send succeeds', async () => {
      const onValidationErrorCapture = vi.fn();
      const onSendCapture = vi.fn();
      render(
        <ParentSimulator
          onValidationErrorCapture={onValidationErrorCapture}
          onSendCapture={onSendCapture}
        />
      );

      const container = screen.getByRole('group', { name: '메시지 입력 영역' }).parentElement!;
      const textarea = screen.getByLabelText('메시지 입력');

      // Drop invalid file
      const badFile = new File(['binary'], 'virus.exe', { type: 'application/x-msdownload' });
      fireEvent.drop(container, {
        dataTransfer: {
          files: [badFile],
          getData: () => '',
        },
      });

      await waitFor(() => {
        expect(onValidationErrorCapture).toHaveBeenCalled();
      });

      // Now add a valid file
      const goodFile = new File(['data'], 'report.png', { type: 'image/png' });
      fireEvent.paste(textarea, {
        clipboardData: {
          items: [{ type: 'image/png', getAsFile: () => goodFile }],
        },
      });

      await waitFor(() => {
        expect(screen.queryByText('report.png')).toBeTruthy();
      });

      // Type and send
      await userEvent.type(textarea, '분석');
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      expect(onSendCapture).toHaveBeenCalledWith(
        '분석',
        expect.arrayContaining([
          expect.objectContaining({ name: 'report.png' }),
        ])
      );
    });
  });

  // ==========================================
  // Dual State Sync: input controlled by parent
  // ==========================================
  describe('Dual State: Parent-controlled input', () => {
    it('parent clearing input reflects in textarea', () => {
      const { rerender } = render(
        <UnifiedChatInput
          inputValue="initial"
          onInputChange={vi.fn()}
          onSend={vi.fn()}
        />
      );

      expect((screen.getByLabelText('메시지 입력') as HTMLTextAreaElement).value).toBe('initial');

      // Parent clears
      rerender(
        <UnifiedChatInput
          inputValue=""
          onInputChange={vi.fn()}
          onSend={vi.fn()}
        />
      );

      expect((screen.getByLabelText('메시지 입력') as HTMLTextAreaElement).value).toBe('');
    });
  });

  // ==========================================
  // Variant switch (ChatPanel empty → messages)
  // ==========================================
  describe('Variant: centered vs default consistency', () => {
    it('both variants have same functional elements', () => {
      const { unmount } = render(
        <UnifiedChatInput
          inputValue="test"
          onInputChange={vi.fn()}
          onSend={vi.fn()}
          variant="centered"
        />
      );

      expect(screen.getByLabelText('메시지 입력')).toBeTruthy();
      expect(screen.getByLabelText('메시지 전송')).toBeTruthy();
      expect(screen.getByLabelText('첨부 메뉴 열기')).toBeTruthy();

      unmount();

      render(
        <UnifiedChatInput
          inputValue="test"
          onInputChange={vi.fn()}
          onSend={vi.fn()}
          variant="default"
        />
      );

      expect(screen.getByLabelText('메시지 입력')).toBeTruthy();
      expect(screen.getByLabelText('메시지 전송')).toBeTruthy();
      expect(screen.getByLabelText('첨부 메뉴 열기')).toBeTruthy();
    });
  });
});
