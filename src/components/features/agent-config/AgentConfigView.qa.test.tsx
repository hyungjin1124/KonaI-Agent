/**
 * AgentConfigView — QA Edge-Case Tests
 *
 * Covers boundary values, rapid interactions, empty/overflow inputs,
 * save lifecycle, and toast auto-dismiss behavior.
 * Uses Vitest + React Testing Library + userEvent.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { AgentConfigView } from './AgentConfigView';
import {
  AVAILABLE_MODELS,
  DEFAULT_CAPABILITIES,
  MODERATION_LEVELS,
  INITIAL_AGENT_CONFIG,
} from './agentConfigData';

// ---------------------------------------------------------------------------
// Radix Switch mock (same as unit tests)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Radix Select mock (same as unit tests)
// ---------------------------------------------------------------------------
vi.mock('@radix-ui/react-select', () => {
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
    <span>{AVAILABLE_MODELS.find(m => m.id === INITIAL_AGENT_CONFIG.selectedModel)?.name ?? placeholder}</span>
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

// ---------------------------------------------------------------------------
// Helper: fireEvent.change for native range sliders
// ---------------------------------------------------------------------------
import { fireEvent } from '@testing-library/react';

function setSliderValue(slider: HTMLElement, value: number) {
  fireEvent.change(slider, { target: { value: String(value) } });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('AgentConfigView — QA Edge Cases', () => {

  // == 1. Empty name field ==
  describe('Edge: Empty name field', () => {
    it('allows clearing the agent name and the form remains functional', async () => {
      const user = userEvent.setup();
      render(<AgentConfigView />);

      const nameInput = screen.getByDisplayValue(INITIAL_AGENT_CONFIG.name);
      await user.clear(nameInput);

      // Input should now be empty
      expect(nameInput).toHaveValue('');

      // The component should still render all sections without crashing
      expect(screen.getByTestId('agent-config-view')).toBeInTheDocument();
      expect(screen.getByTestId('section-basic-info')).toBeInTheDocument();

      // Save button should be enabled (config changed from initial)
      const saveBtn = screen.getByRole('button', { name: /설정 저장/ });
      expect(saveBtn).not.toBeDisabled();
    });
  });

  // == 2. Very long name/description ==
  describe('Edge: Very long name/description', () => {
    it('accepts a 500+ character name without crashing', async () => {
      const user = userEvent.setup();
      render(<AgentConfigView />);

      const longName = 'A'.repeat(550);
      const nameInput = screen.getByDisplayValue(INITIAL_AGENT_CONFIG.name);
      await user.clear(nameInput);
      await user.type(nameInput, longName);

      // The input holds the full value (no JS-side truncation)
      expect(nameInput).toHaveValue(longName);
      // Component still renders
      expect(screen.getByTestId('agent-config-view')).toBeInTheDocument();
    });

    it('accepts a 500+ character description without crashing', async () => {
      const user = userEvent.setup();
      render(<AgentConfigView />);

      const longDesc = 'B'.repeat(550);
      const descTextarea = screen.getByPlaceholderText('에이전트의 역할과 용도를 설명하세요');
      await user.clear(descTextarea);
      await user.type(descTextarea, longDesc);

      expect(descTextarea).toHaveValue(longDesc);
      expect(screen.getByTestId('agent-config-view')).toBeInTheDocument();
    });
  });

  // == 3. System prompt char count near limit (>4000) ==
  describe('Edge: System prompt char count > 4000', () => {
    it('shows amber warning styling when prompt exceeds 4000 characters', async () => {
      const user = userEvent.setup();
      render(<AgentConfigView />);

      const promptArea = screen.getByLabelText('시스템 프롬프트');
      await user.clear(promptArea);

      // Type exactly 4001 characters to exceed the 4000 threshold
      const longPrompt = 'X'.repeat(4001);
      // Use fireEvent for performance (typing 4001 chars with userEvent is very slow)
      fireEvent.change(promptArea, { target: { value: longPrompt } });

      const charCount = screen.getByTestId('char-count');
      expect(charCount).toHaveTextContent('4,001자');
      // Should have amber warning class
      expect(charCount).toHaveClass('text-amber-600');
      expect(charCount).toHaveClass('font-bold');
    });

    it('does NOT show amber styling when prompt is at or below 4000 characters', async () => {
      render(<AgentConfigView />);

      const promptArea = screen.getByLabelText('시스템 프롬프트');
      const prompt4000 = 'Y'.repeat(4000);
      fireEvent.change(promptArea, { target: { value: prompt4000 } });

      const charCount = screen.getByTestId('char-count');
      expect(charCount).toHaveTextContent('4,000자');
      expect(charCount).toHaveClass('text-gray-400');
      expect(charCount).not.toHaveClass('text-amber-600');
    });
  });

  // == 4. Empty system prompt ==
  describe('Edge: Empty system prompt', () => {
    it('allows clearing the system prompt entirely and shows 0자', async () => {
      render(<AgentConfigView />);

      const promptArea = screen.getByLabelText('시스템 프롬프트');
      fireEvent.change(promptArea, { target: { value: '' } });

      expect(promptArea).toHaveValue('');

      const charCount = screen.getByTestId('char-count');
      expect(charCount).toHaveTextContent('0자');

      // Component still renders
      expect(screen.getByTestId('agent-config-view')).toBeInTheDocument();
    });
  });

  // == 5. Rapid consecutive capability toggles ==
  describe('Edge: Rapid consecutive capability toggles', () => {
    it('settles on the correct final state after rapid toggles', async () => {
      const user = userEvent.setup();
      render(<AgentConfigView />);

      // 'web_search' starts enabled (true)
      const webSwitch = screen.getByLabelText('웹 검색 토글');
      expect(webSwitch).toHaveAttribute('aria-checked', 'true');

      // Toggle 6 times rapidly: true -> false -> true -> false -> true -> false
      await user.click(webSwitch);
      await user.click(webSwitch);
      await user.click(webSwitch);
      await user.click(webSwitch);
      await user.click(webSwitch);
      await user.click(webSwitch);

      // Even number of toggles => back to original state (true -> false after 6 clicks = false... wait, 6 toggles from true)
      // true -> click1: false -> click2: true -> click3: false -> click4: true -> click5: false -> click6: true
      // 6 toggles from true = true (even number)
      expect(webSwitch).toHaveAttribute('aria-checked', 'true');
    });

    it('settles on toggled state after odd number of rapid clicks', async () => {
      const user = userEvent.setup();
      render(<AgentConfigView />);

      // 'image_generation' starts disabled (false)
      const imageSwitch = screen.getByLabelText('이미지 생성 토글');
      expect(imageSwitch).toHaveAttribute('aria-checked', 'false');

      // Toggle 5 times: false -> true -> false -> true -> false -> true
      await user.click(imageSwitch);
      await user.click(imageSwitch);
      await user.click(imageSwitch);
      await user.click(imageSwitch);
      await user.click(imageSwitch);

      // Odd number from false => true
      expect(imageSwitch).toHaveAttribute('aria-checked', 'true');
    });
  });

  // == 6. All capabilities disabled ==
  describe('Edge: All capabilities disabled', () => {
    it('renders properly when every capability is toggled off', async () => {
      const user = userEvent.setup();
      render(<AgentConfigView />);

      // Disable every enabled capability
      const enabledCaps = DEFAULT_CAPABILITIES.filter(c => c.enabled);
      for (const cap of enabledCaps) {
        const sw = screen.getByLabelText(`${cap.name} 토글`);
        await user.click(sw);
      }

      // All switches should now be unchecked
      const allSwitches = screen.getAllByRole('switch');
      allSwitches.forEach(sw => {
        expect(sw).toHaveAttribute('aria-checked', 'false');
      });

      // Component structure intact
      expect(screen.getByTestId('section-capabilities')).toBeInTheDocument();
      expect(screen.getByTestId('agent-config-view')).toBeInTheDocument();

      // All capability names still rendered
      DEFAULT_CAPABILITIES.forEach(cap => {
        expect(screen.getByText(cap.name)).toBeInTheDocument();
      });
    });
  });

  // == 7. Save button disabled after save (isDirty resets) ==
  describe('Edge: Save resets isDirty', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('disables save button after successful save', async () => {
      render(<AgentConfigView />);

      // Make a change using fireEvent (avoids userEvent timer conflicts)
      const imageSwitch = screen.getByLabelText('이미지 생성 토글');
      fireEvent.click(imageSwitch);

      const saveBtn = screen.getByRole('button', { name: /설정 저장/ });
      expect(saveBtn).not.toBeDisabled();

      // Click save
      fireEvent.click(saveBtn);

      // Advance past the 800ms simulated API call
      await act(async () => {
        vi.advanceTimersByTime(900);
      });

      // Button should now be disabled (savedConfig === config, isDirty = false)
      const saveBtnAfter = screen.getByRole('button', { name: /설정 저장/ });
      expect(saveBtnAfter).toBeDisabled();
    });
  });

  // == 8. Temperature at boundary values ==
  describe('Edge: Temperature boundary values', () => {
    it('displays 0.0 when temperature set to minimum (0)', () => {
      render(<AgentConfigView />);
      const tempSlider = screen.getByLabelText('Temperature');
      setSliderValue(tempSlider, 0);
      expect(screen.getByTestId('temperature-value')).toHaveTextContent('0.0');
    });

    it('displays 2.0 when temperature set to maximum (2)', () => {
      render(<AgentConfigView />);
      const tempSlider = screen.getByLabelText('Temperature');
      setSliderValue(tempSlider, 2);
      expect(screen.getByTestId('temperature-value')).toHaveTextContent('2.0');
    });
  });

  // == 9. Max tokens at boundary values ==
  describe('Edge: Max tokens boundary values', () => {
    it('displays 256 when max tokens set to minimum', () => {
      render(<AgentConfigView />);
      const tokenSlider = screen.getByLabelText('Max Tokens');
      setSliderValue(tokenSlider, 256);
      expect(screen.getByTestId('max-tokens-value')).toHaveTextContent('256');
    });

    it('displays 16,384 when max tokens set to maximum', () => {
      render(<AgentConfigView />);
      const tokenSlider = screen.getByLabelText('Max Tokens');
      setSliderValue(tokenSlider, 16384);
      expect(screen.getByTestId('max-tokens-value')).toHaveTextContent('16,384');
    });
  });

  // == 10. Moderation level at boundary values ==
  describe('Edge: Moderation level boundary values', () => {
    it('displays "최소" label when moderation set to 1', () => {
      render(<AgentConfigView />);
      const modSlider = screen.getByLabelText('콘텐츠 모더레이션 감도');
      setSliderValue(modSlider, 1);
      expect(screen.getByTestId('moderation-label')).toHaveTextContent('최소');
    });

    it('displays "최대" label when moderation set to 5', () => {
      render(<AgentConfigView />);
      const modSlider = screen.getByLabelText('콘텐츠 모더레이션 감도');
      setSliderValue(modSlider, 5);
      expect(screen.getByTestId('moderation-label')).toHaveTextContent('최대');
    });

    it('applies green styling for low moderation (level 1)', () => {
      render(<AgentConfigView />);
      const modSlider = screen.getByLabelText('콘텐츠 모더레이션 감도');
      setSliderValue(modSlider, 1);
      const label = screen.getByTestId('moderation-label');
      expect(label).toHaveClass('bg-green-50');
      expect(label).toHaveClass('text-green-700');
    });

    it('applies amber styling for high moderation (level 5)', () => {
      render(<AgentConfigView />);
      const modSlider = screen.getByLabelText('콘텐츠 모더레이션 감도');
      setSliderValue(modSlider, 5);
      const label = screen.getByTestId('moderation-label');
      expect(label).toHaveClass('bg-amber-50');
      expect(label).toHaveClass('text-amber-700');
    });
  });

  // == 11. Multiple rapid saves (save disabled during save) ==
  describe('Edge: Multiple rapid saves', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('disables save button while save is in progress', async () => {
      render(<AgentConfigView />);

      // Make a change using fireEvent (avoids userEvent timer conflicts)
      const imageSwitch = screen.getByLabelText('이미지 생성 토글');
      fireEvent.click(imageSwitch);

      const saveBtn = screen.getByRole('button', { name: /설정 저장/ });
      expect(saveBtn).not.toBeDisabled();

      // Click save — use act to flush the synchronous state updates
      await act(async () => {
        fireEvent.click(saveBtn);
      });

      // During save (before 800ms timeout), button should show saving state and be disabled
      const saveBtnDuring = screen.getByRole('button', { name: /저장 중/ });
      expect(saveBtnDuring).toBeDisabled();

      // Clean up: advance past all timers to avoid leaking
      await act(async () => {
        vi.advanceTimersByTime(4000);
      });
    });

    it('shows "저장 중..." text while saving', async () => {
      render(<AgentConfigView />);

      // Make a change using fireEvent
      const imageSwitch = screen.getByLabelText('이미지 생성 토글');
      fireEvent.click(imageSwitch);

      const saveBtn = screen.getByRole('button', { name: /설정 저장/ });

      await act(async () => {
        fireEvent.click(saveBtn);
      });

      expect(screen.getByText('저장 중...')).toBeInTheDocument();

      // Clean up: advance past all timers
      await act(async () => {
        vi.advanceTimersByTime(4000);
      });
    });
  });

  // == 12. Success toast auto-dismiss ==
  describe('Edge: Success toast auto-dismiss', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('shows save success message after save completes', async () => {
      render(<AgentConfigView />);

      // Make a change using fireEvent
      const imageSwitch = screen.getByLabelText('이미지 생성 토글');
      fireEvent.click(imageSwitch);

      const saveBtn = screen.getByRole('button', { name: /설정 저장/ });

      // Click save and flush initial state
      await act(async () => {
        fireEvent.click(saveBtn);
      });

      // Advance past the 800ms API call
      await act(async () => {
        vi.advanceTimersByTime(900);
      });

      // Success message should be visible
      expect(screen.getByTestId('save-success')).toBeInTheDocument();
      expect(screen.getByText('저장 완료')).toBeInTheDocument();

      // Clean up remaining timers
      await act(async () => {
        vi.advanceTimersByTime(3100);
      });
    });

    it('auto-dismisses the success toast after 3000ms', async () => {
      render(<AgentConfigView />);

      // Make a change using fireEvent
      const imageSwitch = screen.getByLabelText('이미지 생성 토글');
      fireEvent.click(imageSwitch);

      const saveBtn = screen.getByRole('button', { name: /설정 저장/ });

      // Click save and flush initial state
      await act(async () => {
        fireEvent.click(saveBtn);
      });

      // Advance past the 800ms API call
      await act(async () => {
        vi.advanceTimersByTime(900);
      });

      // Toast visible
      expect(screen.getByTestId('save-success')).toBeInTheDocument();

      // Advance past the 3000ms auto-dismiss timeout
      await act(async () => {
        vi.advanceTimersByTime(3100);
      });

      // Toast should be gone
      expect(screen.queryByTestId('save-success')).not.toBeInTheDocument();
    });
  });
});
