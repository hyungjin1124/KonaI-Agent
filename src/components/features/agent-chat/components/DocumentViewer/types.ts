export interface TOCItem {
  id: string;
  level: number;
  text: string;
  element?: HTMLElement;
}

// Citation 타입은 agent-chat/types.ts의 canonical 정의를 re-export
export type { Citation } from '../../types';

export type ViewMode = 'embedded' | 'maximized' | 'fullscreen';
