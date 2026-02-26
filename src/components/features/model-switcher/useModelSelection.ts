/**
 * Model selection state management hook
 * Phase 1: localStorage-based state
 * Phase 2+: React Context for global state
 */

import { useState, useCallback, useMemo } from 'react';
import { Model } from '@/types/model';
import { MODELS, DEFAULT_MODEL_ID } from '@/constants/models';

const STORAGE_KEY = 'konai-selected-model';

export function useModelSelection(defaultModelId: string = DEFAULT_MODEL_ID) {
  const [selectedModelId, setSelectedModelId] = useState<string>(() => {
    // SSR-safe: return default on server
    if (typeof window === 'undefined') return defaultModelId;

    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      // Validate cached ID exists in MODELS
      const isValid = MODELS.some(m => m.id === cached);
      if (isValid) return cached;
    }
    return defaultModelId;
  });

  const selectedModel = useMemo<Model>(() => {
    const model = MODELS.find(m => m.id === selectedModelId);
    // Fallback to first model if somehow invalid
    return model || MODELS[0];
  }, [selectedModelId]);

  const handleModelChange = useCallback((modelId: string) => {
    setSelectedModelId(modelId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, modelId);
    }
  }, []);

  return {
    selectedModelId,
    selectedModel,
    models: MODELS,
    handleModelChange,
  };
}
