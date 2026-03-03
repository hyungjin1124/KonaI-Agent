import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnifiedChatInput } from './UnifiedChatInput';

// Mock the ToastContext - not needed directly, but the hook may be called
vi.mock('@/context/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn(), dismissToast: vi.fn(), clearAllToasts: vi.fn(), toasts: [] }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock ModelSwitcher to avoid Radix Select complexities in tests
vi.mock('../../../model-switcher', () => ({
  ModelSwitcher: ({ value, onValueChange, className }: { value?: string; onValueChange?: (v: string) => void; className?: string }) => (
    <select
      data-testid="model-switcher"
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={className}
    >
      <option value="claude-sonnet-4-5">Claude Sonnet</option>
    </select>
  ),
}));

// Mock DropZoneOverlay
vi.mock('../../../agent-chat/components/ChatInputArea/DropZoneOverlay', () => ({
  DropZoneOverlay: ({ isVisible }: { isVisible: boolean }) =>
    isVisible ? <div data-testid="drop-zone-overlay">Drop zone</div> : null,
}));

// Mock AttachedFileChip
vi.mock('../../../agent-chat/components/ChatInputArea/AttachedFileChip', () => ({
  AttachedFileChip: ({ file, onRemove }: { file: { id: string; name: string }; onRemove: (id: string) => void }) => (
    <div data-testid={`file-chip-${file.id}`}>
      <span>{file.name}</span>
      <button aria-label={`${file.name} 제거`} onClick={() => onRemove(file.id)}>X</button>
    </div>
  ),
}));

// Mock icons
vi.mock('../../../../icons', () => ({
  ArrowUp: () => <span data-testid="arrow-up-icon">↑</span>,
  Plus: () => <span data-testid="plus-icon">+</span>,
}));

vi.mock('lucide-react', () => ({
  FileText: () => <span>FileText</span>,
  Image: () => <span>Image</span>,
  Link: () => <span>Link</span>,
}));

const defaultProps = {
  inputValue: '',
  onInputChange: vi.fn(),
  onSend: vi.fn(),
};

describe('UnifiedChatInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC1: Single input component - default variant
  describe('Rendering', () => {
    it('renders with textarea and send button in default variant', () => {
      render(<UnifiedChatInput {...defaultProps} />);

      const textarea = screen.getByLabelText('메시지 입력');
      expect(textarea).toBeTruthy();
      expect(textarea.tagName).toBe('TEXTAREA');

      const sendButton = screen.getByLabelText('메시지 전송');
      expect(sendButton).toBeTruthy();
    });

    // AC1: Single input component - centered variant
    it('renders centered variant without border-t', () => {
      const { container } = render(<UnifiedChatInput {...defaultProps} variant="centered" />);
      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv.className).not.toContain('border-t');
    });

    it('renders default variant with border-t', () => {
      const { container } = render(<UnifiedChatInput {...defaultProps} variant="default" />);
      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv.className).toContain('border-t');
    });

    // AC2: Plus menu button exists
    it('renders plus menu trigger button', () => {
      render(<UnifiedChatInput {...defaultProps} />);
      const plusButton = screen.getByLabelText('첨부 메뉴 열기');
      expect(plusButton).toBeTruthy();
    });
  });

  // AC8: ModelSwitcher integration
  describe('ModelSwitcher', () => {
    it('renders ModelSwitcher when showModelSwitcher is true', () => {
      render(
        <UnifiedChatInput
          {...defaultProps}
          showModelSwitcher
          selectedModelId="claude-sonnet-4-5"
          onModelChange={vi.fn()}
        />
      );
      expect(screen.getByTestId('model-switcher')).toBeTruthy();
    });

    it('does not render ModelSwitcher when showModelSwitcher is false', () => {
      render(<UnifiedChatInput {...defaultProps} />);
      expect(screen.queryByTestId('model-switcher')).toBeNull();
    });
  });

  // AC9: Accessibility
  describe('Accessibility', () => {
    it('textarea has aria-label', () => {
      render(<UnifiedChatInput {...defaultProps} />);
      const textarea = screen.getByLabelText('메시지 입력');
      expect(textarea.getAttribute('aria-multiline')).toBe('true');
    });

    it('send button has aria-label', () => {
      render(<UnifiedChatInput {...defaultProps} />);
      const sendButton = screen.getByLabelText('메시지 전송');
      expect(sendButton).toBeTruthy();
    });

    it('plus menu has aria-label', () => {
      render(<UnifiedChatInput {...defaultProps} />);
      const plusButton = screen.getByLabelText('첨부 메뉴 열기');
      expect(plusButton).toBeTruthy();
    });
  });

  // AC11: Enter key sends
  describe('Keyboard interaction', () => {
    it('calls onSend when Enter is pressed', async () => {
      const onSend = vi.fn();
      render(<UnifiedChatInput {...defaultProps} inputValue="hello" onSend={onSend} />);

      const textarea = screen.getByLabelText('메시지 입력');
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      expect(onSend).toHaveBeenCalledTimes(1);
    });

    // AC12: Shift+Enter does not send
    it('does not call onSend when Shift+Enter is pressed', () => {
      const onSend = vi.fn();
      render(<UnifiedChatInput {...defaultProps} inputValue="hello" onSend={onSend} />);

      const textarea = screen.getByLabelText('메시지 입력');
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

      expect(onSend).not.toHaveBeenCalled();
    });

    it('does not call onSend when input is empty', () => {
      const onSend = vi.fn();
      render(<UnifiedChatInput {...defaultProps} inputValue="" onSend={onSend} />);

      const textarea = screen.getByLabelText('메시지 입력');
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      expect(onSend).not.toHaveBeenCalled();
    });
  });

  // Send button interaction
  describe('Send button', () => {
    it('send button is disabled when no input', () => {
      render(<UnifiedChatInput {...defaultProps} inputValue="" />);
      const sendButton = screen.getByLabelText('메시지 전송');
      expect(sendButton).toHaveProperty('disabled', true);
    });

    it('send button is enabled when there is input', () => {
      render(<UnifiedChatInput {...defaultProps} inputValue="hello" />);
      const sendButton = screen.getByLabelText('메시지 전송');
      expect(sendButton).toHaveProperty('disabled', false);
    });

    it('calls onSend when send button is clicked with input', async () => {
      const onSend = vi.fn();
      render(<UnifiedChatInput {...defaultProps} inputValue="hello" onSend={onSend} />);

      const sendButton = screen.getByLabelText('메시지 전송');
      await userEvent.click(sendButton);

      expect(onSend).toHaveBeenCalledTimes(1);
    });
  });

  // AC3: Clipboard paste
  describe('Clipboard paste', () => {
    it('handles image paste from clipboard', async () => {
      render(<UnifiedChatInput {...defaultProps} inputValue="" />);
      const textarea = screen.getByLabelText('메시지 입력');

      const file = new File(['image-data'], 'screenshot.png', { type: 'image/png' });
      const clipboardData = {
        items: [
          { type: 'image/png', getAsFile: () => file },
        ],
      };

      fireEvent.paste(textarea, { clipboardData });

      // The file should be processed (async) and a chip should appear
      await waitFor(() => {
        const chips = screen.queryAllByText('screenshot.png');
        expect(chips.length).toBeGreaterThan(0);
      });
    });
  });

  // AC14: File removal
  describe('File removal', () => {
    it('removes file chip when X is clicked', async () => {
      render(<UnifiedChatInput {...defaultProps} />);
      const textarea = screen.getByLabelText('메시지 입력');

      // Paste an image to add a file
      const file = new File(['image-data'], 'test.png', { type: 'image/png' });
      const clipboardData = {
        items: [
          { type: 'image/png', getAsFile: () => file },
        ],
      };
      fireEvent.paste(textarea, { clipboardData });

      await waitFor(() => {
        expect(screen.queryByText('test.png')).toBeTruthy();
      });

      // Click remove button
      const removeButton = screen.getByLabelText('test.png 제거');
      await userEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText('test.png')).toBeNull();
      });
    });
  });

  // Disabled state
  describe('Disabled state', () => {
    it('disables textarea and send button when disabled', () => {
      render(<UnifiedChatInput {...defaultProps} inputValue="hello" disabled />);
      const textarea = screen.getByLabelText('메시지 입력') as HTMLTextAreaElement;
      expect(textarea.disabled).toBe(true);

      const sendButton = screen.getByLabelText('메시지 전송');
      expect(sendButton).toHaveProperty('disabled', true);
    });
  });
});

describe('useFileAttachment', () => {
  // AC7: File type validation
  it('calls onValidationError for unsupported file types', async () => {
    const onValidationError = vi.fn();
    render(
      <UnifiedChatInput
        {...defaultProps}
        onValidationError={onValidationError}
      />
    );
    const textarea = screen.getByLabelText('메시지 입력');

    // Simulate drop of unsupported file
    const exeFile = new File(['binary'], 'malware.exe', { type: 'application/x-msdownload' });
    fireEvent.drop(textarea.closest('[class*="border-t"]') || textarea, {
      dataTransfer: {
        files: [exeFile],
        getData: () => '',
      },
    });

    await waitFor(() => {
      expect(onValidationError).toHaveBeenCalledWith(
        expect.stringContaining('지원하지 않는 파일 형식')
      );
    });
  });

  // AC8: File size validation
  it('calls onValidationError for oversized files', async () => {
    const onValidationError = vi.fn();
    render(
      <UnifiedChatInput
        {...defaultProps}
        onValidationError={onValidationError}
      />
    );
    const textarea = screen.getByLabelText('메시지 입력');

    // Create a file that exceeds 10MB
    const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

    // Simulate drop on the container
    const container = textarea.closest('[class*="border-t"]') || textarea.parentElement;
    fireEvent.drop(container!, {
      dataTransfer: {
        files: [largeFile],
        getData: () => '',
      },
    });

    await waitFor(() => {
      expect(onValidationError).toHaveBeenCalledWith(
        expect.stringContaining('10MB')
      );
    });
  });
});
