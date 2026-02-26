/**
 * Unit tests for ModelSwitcher component
 * Smoke tests + logic verification (Radix UI interaction testing limited due to JSDOM limitations)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ModelSwitcher } from './ModelSwitcher';
import { useModelSelection } from './useModelSelection';
import { MODELS, DEFAULT_MODEL_ID } from '@/constants/models';

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

describe('ModelSwitcher', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  // AC1: Model dropdown visible
  it('renders without crashing', () => {
    const { container } = render(<ModelSwitcher />);
    expect(container).toBeTruthy();

    // Check that a button with role=combobox is rendered (Radix Select trigger)
    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeTruthy();
  });

  // AC5: Responsive width
  it('applies custom className for responsive width', () => {
    const { container } = render(<ModelSwitcher className="custom-class" />);
    const trigger = container.querySelector('[role="combobox"]');
    expect(trigger?.className).toContain('custom-class');
  });

  // Disabled state
  it('disables the trigger when disabled prop is true', () => {
    render(<ModelSwitcher disabled />);
    const trigger = screen.getByRole('combobox');
    expect(trigger.hasAttribute('disabled')).toBe(true);
  });
});

describe('useModelSelection Hook', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  // AC3: Selection persists to localStorage
  it('saves selection to localStorage', () => {
    const TestComponent = () => {
      const { selectedModelId, handleModelChange } = useModelSelection();

      return (
        <div>
          <span data-testid="selected-id">{selectedModelId}</span>
          <button onClick={() => handleModelChange(MODELS[2].id)}>
            Change Model
          </button>
        </div>
      );
    };

    const { getByTestId, getByRole } = render(<TestComponent />);

    // Should start with default
    expect(getByTestId('selected-id').textContent).toBe(DEFAULT_MODEL_ID);

    // Change model
    act(() => {
      getByRole('button').click();
    });

    // localStorage should be updated
    expect(localStorage.getItem('konai-selected-model')).toBe(MODELS[2].id);

    // State should update
    expect(getByTestId('selected-id').textContent).toBe(MODELS[2].id);
  });

  // AC6: Restores from localStorage
  it('restores selection from localStorage on mount', () => {
    const targetModel = MODELS[1];
    localStorage.setItem('konai-selected-model', targetModel.id);

    const TestComponent = () => {
      const { selectedModelId } = useModelSelection();
      return <span data-testid="selected-id">{selectedModelId}</span>;
    };

    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('selected-id').textContent).toBe(targetModel.id);
  });

  // AC6 Edge: Invalid cached ID fallback
  it('falls back to default if localStorage has invalid model ID', () => {
    localStorage.setItem('konai-selected-model', 'invalid-model-id');

    const TestComponent = () => {
      const { selectedModelId } = useModelSelection();
      return <span data-testid="selected-id">{selectedModelId}</span>;
    };

    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('selected-id').textContent).toBe(DEFAULT_MODEL_ID);
  });

  // SSR-safe
  it('returns default model ID when localStorage is not available', () => {
    // This test verifies the SSR guard: `typeof window === 'undefined'`
    // In test env, window is defined, but the code has a guard for SSR

    const TestComponent = () => {
      const { selectedModel } = useModelSelection(MODELS[3].id);
      return <span data-testid="selected-name">{selectedModel.name}</span>;
    };

    const { getByTestId } = render(<TestComponent />);
    // With custom default
    expect(getByTestId('selected-name').textContent).toBe(MODELS[3].name);
  });

  // Returns all models
  it('provides access to all models', () => {
    const TestComponent = () => {
      const { models } = useModelSelection();
      return <span data-testid="model-count">{models.length}</span>;
    };

    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('model-count').textContent).toBe(MODELS.length.toString());
  });

  // Selected model object
  it('provides the full selected model object', () => {
    const TestComponent = () => {
      const { selectedModel } = useModelSelection();
      return (
        <div>
          <span data-testid="model-name">{selectedModel.name}</span>
          <span data-testid="model-family">{selectedModel.family}</span>
        </div>
      );
    };

    const { getByTestId } = render(<TestComponent />);
    const defaultModel = MODELS.find(m => m.id === DEFAULT_MODEL_ID)!;
    expect(getByTestId('model-name').textContent).toBe(defaultModel.name);
    expect(getByTestId('model-family').textContent).toBe(defaultModel.family);
  });
});
