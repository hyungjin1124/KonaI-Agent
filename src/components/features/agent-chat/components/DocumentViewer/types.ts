export interface TOCItem {
  id: string;
  level: number;
  text: string;
  element?: HTMLElement;
}

export interface Citation {
  id: string;
  number: number;
  title: string;
  url?: string;
  excerpt?: string;
}

export type ViewMode = 'embedded' | 'maximized' | 'fullscreen';
