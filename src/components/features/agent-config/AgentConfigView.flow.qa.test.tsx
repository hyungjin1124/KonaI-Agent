/**
 * AgentConfigView — UX Flow QA Tests
 *
 * End-to-end user flow tests verifying multi-step interactions:
 * Flow 1: Full Configuration Edit -> Save -> Verify Reset
 * Flow 2: Edit -> Save -> Re-edit -> isDirty tracking
 * Flow 3: Multiple Section Edits -> Single Save
 * Flow 4: Avatar Color Change Flow
 * Flow 5: Save State Cleanup on Subsequent Edits
 *
 * Uses Vitest + React Testing Library with jsdom environment.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { AgentConfigView } from './AgentConfigView';
import {
  INITIAL_AGENT_CONFIG,
  AVATAR_COLORS,
  MODERATION_LEVELS,
} from './agentConfigData';

// Mock Radix Switch to avoid portal issues in jsdom
vi.mock('@radix-ui/react-switch', () => {
  const MockRoot = React.forwardRef<HTMLButtonElement, {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    className?: string;
    'aria-label'?: string;
  }>(({ checked, onCheckedChange, className, 'aria-label': ariaLabel, ...props }, ref) => (
    <button
      ref={ref}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={className}
      data-state={checked ? 'checked' : 'unchecked'}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    />
  ));
  MockRoot.displayName = 'MockSwitchRoot';

  const MockThumb = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>((props, ref) => (
    <span ref={ref} {...props} />
  ));
  MockThumb.displayName = 'MockSwitchThumb';

  return { Root: MockRoot, Thumb: MockThumb };
});

// Mock Radix Select to avoid portal issues in jsdom
vi.mock('@radix-ui/react-select', async () => {
  const { AVAILABLE_MODELS, INITIAL_AGENT_CONFIG: INIT } = await vi.importActual<typeof import('./agentConfigData')>('./agentConfigData');

  const MockRoot = ({ children }: {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (v: string) => void;
  }) => <div data-testid="select-root">{children}</div>;

  const MockTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { 'data-testid'?: string }>(
    ({ children, ...props }, ref) => (
      <button ref={ref} {...props}>{children}</button>
    )
  );
  MockTrigger.displayName = 'MockSelectTrigger';

  const MockValue = ({ placeholder }: { placeholder?: string }) => (
    <span>{AVAILABLE_MODELS.find((m: { id: string; name: string }) => m.id === INIT.selectedModel)?.name ?? placeholder}</span>
  );

  const MockContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const MockItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(
    ({ children, ...props }, ref) => <div ref={ref} {...props}>{children}</div>
  );
  MockItem.displayName = 'MockSelectItem';
  const MockItemText = ({ children }: { children: React.ReactNode }) => <span>{children}</span>;

  const MockViewport = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const MockIcon = () => null;
  const MockPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  const MockGroup = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const MockLabel = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const MockSeparator = () => <hr />;
  const MockScrollUpButton = () => null;
  const MockScrollDownButton = () => null;

  return {
    Root: MockRoot,
    Trigger: MockTrigger,
    Value: MockValue,
    Content: MockContent,
    Item: MockItem,
    ItemText: MockItemText,
    Viewport: MockViewport,
    Icon: MockIcon,
    Portal: MockPortal,
    Group: MockGroup,
    Label: MockLabel,
    Separator: MockSeparator,
    ScrollUpButton: MockScrollUpButton,
    ScrollDownButton: MockScrollDownButton,
    ItemIndicator: () => null,
  };
});

describe('AgentConfigView - UX Flow QA Tests', () => {
  describe('Flow 1: Full Configuration Edit -> Save -> Verify Reset', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('edits name, toggles capability, changes prompt, saves, then verifies isDirty resets and success toast appears', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<AgentConfigView />);

      // Step 1: Verify initial state — save button should be disabled
      const saveBtn = screen.getByRole('button', { name: /설정 저장/ });
      expect(saveBtn).toBeDisabled();

      // Step 2: Change the agent name
      const nameInput = screen.getByDisplayValue(INITIAL_AGENT_CONFIG.name);
      await user.clear(nameInput);
      await user.type(nameInput, '새로운 에이전트');

      // Step 3: Toggle a capability (이미지 생성, initially OFF)
      const imageSwitch = screen.getByLabelText('이미지 생성 토글');
      expect(imageSwitch).toHaveAttribute('aria-checked', 'false');
      await user.click(imageSwitch);
      expect(imageSwitch).toHaveAttribute('aria-checked', 'true');

      // Step 4: Change system prompt
      const promptTextarea = screen.getByLabelText('시스템 프롬프트');
      await user.clear(promptTextarea);
      await user.type(promptTextarea, '새로운 시스템 프롬프트입니다.');

      // Step 5: Verify save button is enabled (isDirty = true)
      expect(saveBtn).not.toBeDisabled();

      // Step 6: Click save
      await user.click(saveBtn);

      // Step 7: Wait for save to complete (800ms simulated)
      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Step 8: Verify save button is disabled again (isDirty reset)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /설정 저장/ })).toBeDisabled();
      });

      // Step 9: Verify success toast appears
      expect(screen.getByTestId('save-success')).toBeInTheDocument();
      expect(screen.getByTestId('save-success')).toHaveTextContent('저장 완료');
    });
  });

  describe('Flow 2: Edit -> Save -> Re-edit -> isDirty tracks correctly', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('saves a name change, then re-edits to a new value (enables save), then reverts to saved value (disables save)', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<AgentConfigView />);

      const nameInput = screen.getByDisplayValue(INITIAL_AGENT_CONFIG.name);
      const saveBtn = screen.getByRole('button', { name: /설정 저장/ });

      // Step 1: Change name and save
      await user.clear(nameInput);
      await user.type(nameInput, '저장된 이름');
      expect(saveBtn).not.toBeDisabled();

      await user.click(saveBtn);
      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /설정 저장/ })).toBeDisabled();
      });

      // Step 2: Change name again to a different value
      await user.clear(nameInput);
      await user.type(nameInput, '다른 이름');

      // Step 3: Verify save button re-enables
      expect(screen.getByRole('button', { name: /설정 저장/ })).not.toBeDisabled();

      // Step 4: Change name back to the saved value
      await user.clear(nameInput);
      await user.type(nameInput, '저장된 이름');

      // Step 5: Verify save button disables (no actual change vs saved state)
      expect(screen.getByRole('button', { name: /설정 저장/ })).toBeDisabled();
    });
  });

  describe('Flow 3: Multiple Section Edits -> Single Save', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('edits name, toggles capability, changes prompt, changes moderation, then saves all at once', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<AgentConfigView />);

      // Section 1: Change name
      const nameInput = screen.getByDisplayValue(INITIAL_AGENT_CONFIG.name);
      await user.clear(nameInput);
      await user.type(nameInput, '멀티 수정 에이전트');

      // Section 3: Toggle capability (이메일 연동, initially OFF)
      const emailSwitch = screen.getByLabelText('이메일 연동 토글');
      expect(emailSwitch).toHaveAttribute('aria-checked', 'false');
      await user.click(emailSwitch);
      expect(emailSwitch).toHaveAttribute('aria-checked', 'true');

      // Section 4: Edit system prompt
      const promptTextarea = screen.getByLabelText('시스템 프롬프트');
      await user.clear(promptTextarea);
      await user.type(promptTextarea, '수정된 프롬프트');

      // Section 5: Change moderation level (from 3 to 5 via native change)
      const moderationSlider = screen.getByLabelText('콘텐츠 모더레이션 감도');
      // Programmatic fireEvent for range input since userEvent doesn't handle range well
      await act(async () => {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 'value'
        )?.set;
        nativeInputValueSetter?.call(moderationSlider, '5');
        moderationSlider.dispatchEvent(new Event('change', { bubbles: true }));
      });

      // Verify all changes are reflected in the UI before save
      expect(nameInput).toHaveValue('멀티 수정 에이전트');
      expect(emailSwitch).toHaveAttribute('aria-checked', 'true');
      expect(promptTextarea).toHaveValue('수정된 프롬프트');
      // Moderation label should show '최대' (level 5)
      expect(screen.getByTestId('moderation-label')).toHaveTextContent('최대');

      // Verify save is enabled
      const saveBtn = screen.getByRole('button', { name: /설정 저장/ });
      expect(saveBtn).not.toBeDisabled();

      // Single save
      await user.click(saveBtn);
      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Verify all changes persist after save completes
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /설정 저장/ })).toBeDisabled();
      });
      expect(nameInput).toHaveValue('멀티 수정 에이전트');
      expect(emailSwitch).toHaveAttribute('aria-checked', 'true');
      expect(promptTextarea).toHaveValue('수정된 프롬프트');
      expect(screen.getByTestId('moderation-label')).toHaveTextContent('최대');
    });
  });

  describe('Flow 4: Avatar Color Change Flow', () => {
    it('changes avatar color via color button and enables save', async () => {
      const user = userEvent.setup();
      render(<AgentConfigView />);

      // Step 1: Find the avatar element, verify initial color
      const avatar = screen.getByTestId('agent-avatar');
      expect(avatar).toHaveStyle({ backgroundColor: INITIAL_AGENT_CONFIG.avatarColor });
      expect(INITIAL_AGENT_CONFIG.avatarColor).toBe('#3B82F6'); // blue

      // Step 2: Pick a different color — use the second color (#10B981 = green)
      const newColor = AVATAR_COLORS[1]; // '#10B981'
      expect(newColor).not.toBe(INITIAL_AGENT_CONFIG.avatarColor);
      const colorButton = screen.getByLabelText(`아바타 색상 ${newColor}`);
      await user.click(colorButton);

      // Step 3: Verify avatar changes to new color
      expect(avatar).toHaveStyle({ backgroundColor: newColor });

      // Step 4: Verify save button enables
      const saveBtn = screen.getByRole('button', { name: /설정 저장/ });
      expect(saveBtn).not.toBeDisabled();
    });
  });

  describe('Flow 5: Save State Cleanup on Subsequent Edits', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('hides success toast immediately when a new change is made after save', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<AgentConfigView />);

      // Step 1: Make a change and save
      const nameInput = screen.getByDisplayValue(INITIAL_AGENT_CONFIG.name);
      await user.clear(nameInput);
      await user.type(nameInput, '토스트 테스트');

      const saveBtn = screen.getByRole('button', { name: /설정 저장/ });
      await user.click(saveBtn);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Verify success toast appears
      await waitFor(() => {
        expect(screen.getByTestId('save-success')).toBeInTheDocument();
      });

      // Step 2: Make a new change
      await user.clear(nameInput);
      await user.type(nameInput, '토스트 사라짐');

      // Step 3: Verify the success toast is immediately hidden
      expect(screen.queryByTestId('save-success')).not.toBeInTheDocument();
    });
  });
});
