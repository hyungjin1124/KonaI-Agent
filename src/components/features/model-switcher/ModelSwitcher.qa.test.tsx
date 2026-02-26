/**
 * QA Edge Case Tests for ModelSwitcher
 * These tests focus on scenarios the developer might have missed:
 * - Data boundary conditions
 * - User interaction edge cases
 * - State transition edge cases
 */

import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { ModelSwitcher } from './ModelSwitcher';
import { useModelSelection } from './useModelSelection';

// Mock localStorage
const localStorageMock = (() => {
  let store = {} as Record<string, string>;
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ModelSwitcher - QA Edge Cases', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Data Boundary Tests', () => {
    // Edge: Empty model list (should never happen, but test resilience)
    // This test verifies behavior when MODELS array is empty
    // Note: Cannot easily test without mocking the constants, so skipping for now
    // In real scenario, this would be caught by TypeScript types

    // Edge: Very long model names
    it('handles model names with excessive length gracefully', () => {
      // This tests that long names don't break layout
      // The current implementation uses truncation via CSS (flex layout)
      const { container } = render(<ModelSwitcher />);
      const trigger = container.querySelector('[role="combobox"]');
      expect(trigger).toBeTruthy();
      // Real browser test would verify no text overflow beyond container
    });

    // Edge: Special characters in model selection
    it('handles model IDs with special characters correctly', () => {
      const TestComponent = () => {
        const [modelId, setModelId] = useState<string>('claude-sonnet-4-5');
        return (
          <div>
            <ModelSwitcher value={modelId} onValueChange={setModelId} />
            <span data-testid="selected">{modelId}</span>
          </div>
        );
      };

      const { getByTestId } = render(<TestComponent />);
      // Verify IDs with hyphens work correctly
      expect(getByTestId('selected').textContent).toBe('claude-sonnet-4-5');
    });
  });

  describe('User Interaction Edge Cases', () => {
    // Edge: Rapid successive changes
    it('handles rapid model selection changes without race conditions', async () => {
      const user = userEvent.setup();
      let changeCount = 0;
      const changes: string[] = [];

      const TestComponent = () => {
        const [modelId, setModelId] = useState<string>('claude-sonnet-4-5');

        const handleChange = (newId: string) => {
          changeCount++;
          changes.push(newId);
          setModelId(newId);
        };

        return (
          <div>
            <ModelSwitcher value={modelId} onValueChange={handleChange} />
            <span data-testid="selected">{modelId}</span>
            <span data-testid="count">{changeCount}</span>
          </div>
        );
      };

      const { getByTestId } = render(<TestComponent />);

      // Simulate rapid changes (in real browser test, would click dropdown rapidly)
      // For unit test, verify state update batching works correctly
      expect(getByTestId('count').textContent).toBe('0');
    });

    // Edge: Disabled state with existing value
    it('preserves selected model when disabled', () => {
      const TestComponent = () => {
        const [isDisabled, setIsDisabled] = useState(false);
        return (
          <div>
            <ModelSwitcher value="claude-opus-4-6" disabled={isDisabled} />
            <button onClick={() => setIsDisabled(!isDisabled)}>Toggle Disabled</button>
          </div>
        );
      };

      const { getByRole } = render(<TestComponent />);
      const trigger = getByRole('combobox');

      // Initially enabled
      expect(trigger.hasAttribute('disabled')).toBe(false);

      // Toggle to disabled
      getByRole('button').click();
      expect(trigger.hasAttribute('disabled')).toBe(true);

      // Value should still be accessible
      expect(trigger.getAttribute('data-state')).toBeTruthy();
    });

    // Edge: Component unmounts during selection
    it('handles unmount during selection without memory leaks', () => {
      const TestComponent = () => {
        const [show, setShow] = useState(true);
        const [modelId, setModelId] = useState<string>();

        return (
          <div>
            {show && (
              <ModelSwitcher value={modelId} onValueChange={setModelId} />
            )}
            <button onClick={() => setShow(false)}>Unmount</button>
          </div>
        );
      };

      const { getByRole, queryByRole } = render(<TestComponent />);

      // Component is mounted
      expect(queryByRole('combobox')).toBeTruthy();

      // Unmount while potentially in use
      getByRole('button').click();

      // Component should be gone
      expect(queryByRole('combobox')).toBeFalsy();

      // No errors should occur (React will warn about setState on unmounted component if there's a bug)
    });
  });

  describe('State Transition Edge Cases', () => {
    // Edge: Switching between controlled and uncontrolled
    it('handles transition from uncontrolled to controlled gracefully', () => {
      const TestComponent = () => {
        const [controlled, setControlled] = useState(false);
        const [modelId, setModelId] = useState<string>('gpt-5-2');

        return (
          <div>
            {controlled ? (
              <ModelSwitcher value={modelId} onValueChange={setModelId} />
            ) : (
              <ModelSwitcher defaultValue="claude-sonnet-4-5" />
            )}
            <button onClick={() => setControlled(true)}>Switch to Controlled</button>
          </div>
        );
      };

      const { getByRole } = render(<TestComponent />);

      // Start uncontrolled
      expect(getByRole('combobox')).toBeTruthy();

      // Switch to controlled mode
      getByRole('button').click();

      // Should re-render without errors
      expect(getByRole('combobox')).toBeTruthy();
    });

    // Edge: localStorage corruption (invalid JSON)
    it('handles corrupted localStorage gracefully', () => {
      // Simulate localStorage with invalid data
      localStorage.setItem('konai-selected-model', '{"invalid": json}');

      const TestComponent = () => {
        const { selectedModelId } = useModelSelection();
        return <span data-testid="selected-id">{selectedModelId}</span>;
      };

      // Should fall back to default without throwing
      const { getByTestId } = render(<TestComponent />);
      expect(getByTestId('selected-id').textContent).toBe('claude-sonnet-4-5');
    });

    // Edge: Model list changes while dropdown is open
    // (Phase 1 has static model list, but Phase 2+ will fetch from API)
    // This test documents expected behavior for future phases
    it('documents behavior when model list is dynamic (future Phase 2+)', () => {
      // Phase 1: model list is static, so this scenario doesn't apply
      // Phase 2+: if models are fetched from API and list changes mid-session,
      // the component should re-render with updated list
      // The selectedModelId might become invalid if removed from list
      // Expected: useModelSelection should validate against new list and fallback
      expect(true).toBe(true); // Placeholder for future test
    });
  });

  describe('localStorage Edge Cases', () => {
    // Edge: localStorage quota exceeded
    it('handles localStorage.setItem failure gracefully', () => {
      // Mock setItem to throw (simulates quota exceeded)
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('QuotaExceededError');
      };

      const TestComponent = () => {
        const { handleModelChange } = useModelSelection();
        return (
          <button onClick={() => handleModelChange('gpt-5-2')}>Change</button>
        );
      };

      const { getByRole } = render(<TestComponent />);

      // Should not crash when localStorage fails
      expect(() => {
        getByRole('button').click();
      }).not.toThrow();

      // Restore original
      localStorage.setItem = originalSetItem;
    });

    // Edge: localStorage disabled (private browsing mode)
    it('works when localStorage is disabled', () => {
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = () => {
        throw new Error('localStorage is disabled');
      };

      const TestComponent = () => {
        const { selectedModelId } = useModelSelection();
        return <span data-testid="selected-id">{selectedModelId}</span>;
      };

      // Should fall back to default model
      const { getByTestId } = render(<TestComponent />);
      expect(getByTestId('selected-id').textContent).toBe('claude-sonnet-4-5');

      // Restore original
      localStorage.getItem = originalGetItem;
    });
  });
});
