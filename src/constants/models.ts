/**
 * Model definitions for model switcher
 * Phase 1: Static model list
 * Phase 2+: Fetch from API
 */

import { Model } from '@/types/model';

export const MODELS: Model[] = [
  {
    id: 'claude-opus-4-6',
    name: 'Claude Opus 4.6',
    family: 'claude',
    contextWindow: 200,
    speed: 'thorough',
    costMultiplier: 2.0,
    supportsReasoning: true,
  },
  {
    id: 'claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    family: 'claude',
    contextWindow: 200,
    speed: 'balanced',
    costMultiplier: 1.0,
    supportsReasoning: false,
  },
  {
    id: 'gpt-5-2',
    name: 'GPT-5.2',
    family: 'gpt',
    contextWindow: 128,
    speed: 'balanced',
    costMultiplier: 1.5,
    supportsReasoning: true,
  },
  {
    id: 'gpt-5-3-flash',
    name: 'GPT-5.3 Flash',
    family: 'gpt',
    contextWindow: 128,
    speed: 'fast',
    costMultiplier: 0.5,
    supportsReasoning: false,
  },
  {
    id: 'gemini-3-flash',
    name: 'Gemini 3 Flash',
    family: 'gemini',
    contextWindow: 100,
    speed: 'fast',
    costMultiplier: 0.3,
    supportsReasoning: false,
  },
];

export const DEFAULT_MODEL_ID = 'claude-sonnet-4-5';
