/**
 * Model / Agent type definitions for model switcher
 */

export type ModelFamily = 'claude' | 'gpt' | 'gemini' | 'custom';
export type ModelSpeed = 'fast' | 'balanced' | 'thorough';

export interface Model {
  /** Unique model identifier (e.g., 'claude-opus-4-6') */
  id: string;
  /** Display name (e.g., 'Claude Opus 4.6') */
  name: string;
  /** Model provider family */
  family: ModelFamily;
  /** Context window size in thousands of tokens (e.g., 200 = 200k tokens) */
  contextWindow: number;
  /** Speed/quality tradeoff indicator */
  speed: ModelSpeed;
  /** Cost multiplier relative to baseline (1.0 = baseline) */
  costMultiplier: number;
  /** Whether model supports extended reasoning */
  supportsReasoning: boolean;
}
