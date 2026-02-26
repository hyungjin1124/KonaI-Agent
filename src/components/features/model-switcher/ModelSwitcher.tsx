/**
 * Model / Agent Switcher Component
 * Phase 1: Radix Select dropdown with inline metadata
 *
 * Features:
 * - 5-7 model options with name, context window, speed badges
 * - localStorage persistence
 * - Keyboard navigation (Radix Select built-in)
 * - Responsive width
 */

import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useModelSelection } from './useModelSelection';
import { ModelSelectItem } from './ModelSelectItem';

export interface ModelSwitcherProps {
  /** Controlled value: selected model ID */
  value?: string;
  /** Uncontrolled default value */
  defaultValue?: string;
  /** Selection change callback */
  onValueChange?: (modelId: string) => void;
  /** Optional className for styling */
  className?: string;
  /** Disable selection */
  disabled?: boolean;
}

export function ModelSwitcher({
  value,
  defaultValue,
  onValueChange,
  className,
  disabled,
}: ModelSwitcherProps) {
  const { models, selectedModelId, handleModelChange } = useModelSelection(defaultValue);

  // Support both controlled and uncontrolled usage
  const controlledValue = value ?? selectedModelId;
  const handleChange = onValueChange ?? handleModelChange;

  return (
    <Select value={controlledValue} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger className={cn('w-[240px]', className)}>
        <SelectValue placeholder="Select model" />
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <ModelSelectItem key={model.id} model={model} />
        ))}
      </SelectContent>
    </Select>
  );
}
