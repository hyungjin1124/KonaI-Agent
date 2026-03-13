/**
 * AgentConfigView — Unit Tests
 *
 * Tests for Agent Configuration component.
 * Uses Vitest + React Testing Library with jsdom environment.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
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
vi.mock('@radix-ui/react-select', () => {
  const MockRoot = ({ children, value, onValueChange }: {
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

describe('AgentConfigView', () => {
  it('renders without error', () => {
    render(<AgentConfigView />);
    expect(screen.getByTestId('agent-config-view')).toBeInTheDocument();
  });

  describe('Section 1: Basic Info', () => {
    it('displays agent name and description fields', () => {
      render(<AgentConfigView />);
      const section = screen.getByTestId('section-basic-info');
      expect(within(section).getByText('기본 정보')).toBeInTheDocument();
      expect(within(section).getByDisplayValue(INITIAL_AGENT_CONFIG.name)).toBeInTheDocument();
    });

    it('displays avatar with correct color', () => {
      render(<AgentConfigView />);
      const avatar = screen.getByTestId('agent-avatar');
      expect(avatar).toHaveStyle({ backgroundColor: INITIAL_AGENT_CONFIG.avatarColor });
    });
  });

  describe('Section 2: Model Settings', () => {
    it('displays selected model name', () => {
      render(<AgentConfigView />);
      const section = screen.getByTestId('section-model');
      expect(within(section).getByText('모델 설정')).toBeInTheDocument();
      // The selected model name should be visible (may appear multiple times in mock select)
      const modelTexts = screen.getAllByText('Claude Sonnet 4');
      expect(modelTexts.length).toBeGreaterThanOrEqual(1);
    });

    it('displays temperature and max tokens sliders', () => {
      render(<AgentConfigView />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders.length).toBeGreaterThanOrEqual(2);
    });

    it('shows temperature value', () => {
      render(<AgentConfigView />);
      expect(screen.getByTestId('temperature-value')).toHaveTextContent('0.7');
    });

    it('shows max tokens value', () => {
      render(<AgentConfigView />);
      expect(screen.getByTestId('max-tokens-value')).toHaveTextContent('4,096');
    });
  });

  describe('Section 3: Capabilities', () => {
    it('displays capability toggles', () => {
      render(<AgentConfigView />);
      const switches = screen.getAllByRole('switch');
      expect(switches.length).toBeGreaterThanOrEqual(5);
    });

    it('displays all capability names', () => {
      render(<AgentConfigView />);
      DEFAULT_CAPABILITIES.forEach(cap => {
        expect(screen.getByText(cap.name)).toBeInTheDocument();
      });
    });

    it('toggles capability on click', async () => {
      const user = userEvent.setup();
      render(<AgentConfigView />);
      // Find the image generation switch (initially OFF)
      const imageSwitch = screen.getByLabelText('이미지 생성 토글');
      expect(imageSwitch).toHaveAttribute('aria-checked', 'false');

      await user.click(imageSwitch);
      expect(imageSwitch).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Section 4: System Prompt', () => {
    it('displays system prompt textarea', () => {
      render(<AgentConfigView />);
      const section = screen.getByTestId('section-prompt');
      expect(within(section).getByText('시스템 프롬프트')).toBeInTheDocument();
    });

    it('shows character count', () => {
      render(<AgentConfigView />);
      const charCount = screen.getByTestId('char-count');
      expect(charCount).toBeInTheDocument();
      // Should contain a number followed by 자
      expect(charCount.textContent).toMatch(/\d+자/);
    });
  });

  describe('Section 5: Content Moderation', () => {
    it('displays moderation section with level label', () => {
      render(<AgentConfigView />);
      const section = screen.getByTestId('section-moderation');
      expect(within(section).getByText('콘텐츠 모더레이션')).toBeInTheDocument();
      // '보통' appears both in the badge and in the slider labels
      const moderationLabel = screen.getByTestId('moderation-label');
      expect(moderationLabel).toHaveTextContent('보통');
    });

    it('displays all moderation level labels', () => {
      render(<AgentConfigView />);
      MODERATION_LEVELS.forEach(level => {
        // Some labels may appear twice (badge + slider), so use getAllByText
        const matches = screen.getAllByText(level.label);
        expect(matches.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Save Functionality', () => {
    it('displays save button', () => {
      render(<AgentConfigView />);
      expect(screen.getByRole('button', { name: /설정 저장/ })).toBeInTheDocument();
    });

    it('save button is disabled when no changes', () => {
      render(<AgentConfigView />);
      const saveBtn = screen.getByRole('button', { name: /설정 저장/ });
      expect(saveBtn).toBeDisabled();
    });

    it('save button enables after making changes', async () => {
      const user = userEvent.setup();
      render(<AgentConfigView />);

      // Toggle a capability to make changes
      const imageSwitch = screen.getByLabelText('이미지 생성 토글');
      await user.click(imageSwitch);

      const saveBtn = screen.getByRole('button', { name: /설정 저장/ });
      expect(saveBtn).not.toBeDisabled();
    });

    it('displays last modified info', () => {
      render(<AgentConfigView />);
      expect(screen.getByTestId('save-bar')).toHaveTextContent('홍길동');
    });
  });

  describe('Card Sections', () => {
    it('renders 5 section cards', () => {
      render(<AgentConfigView />);
      expect(screen.getByTestId('section-basic-info')).toBeInTheDocument();
      expect(screen.getByTestId('section-model')).toBeInTheDocument();
      expect(screen.getByTestId('section-capabilities')).toBeInTheDocument();
      expect(screen.getByTestId('section-prompt')).toBeInTheDocument();
      expect(screen.getByTestId('section-moderation')).toBeInTheDocument();
    });
  });

  describe('Mock Data Validation', () => {
    it('has at least 3 available models', () => {
      expect(AVAILABLE_MODELS.length).toBeGreaterThanOrEqual(3);
    });

    it('has 5 moderation levels', () => {
      expect(MODERATION_LEVELS.length).toBe(5);
    });

    it('has at least 5 capabilities', () => {
      expect(DEFAULT_CAPABILITIES.length).toBeGreaterThanOrEqual(5);
    });

    it('initial config has all required fields', () => {
      expect(INITIAL_AGENT_CONFIG.name).toBeTruthy();
      expect(INITIAL_AGENT_CONFIG.selectedModel).toBeTruthy();
      expect(INITIAL_AGENT_CONFIG.systemPrompt).toBeTruthy();
      expect(INITIAL_AGENT_CONFIG.moderationLevel).toBeGreaterThanOrEqual(1);
    });
  });
});
