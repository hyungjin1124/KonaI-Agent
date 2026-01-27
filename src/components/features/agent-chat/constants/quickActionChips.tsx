import React from 'react';
import { FileText, Globe, Box, Palette, MoreHorizontal } from '../../../icons';
import { QuickActionChip } from '../types';

export const quickActionChips: QuickActionChip[] = [
  { icon: <FileText size={14} />, label: '슬라이드 제작' },
  { icon: <Globe size={14} />, label: '데이터 시각화' },
  { icon: <Box size={14} />, label: 'Wide Research' },
  { icon: <Palette size={14} />, label: '비디오 생성' },
  { icon: <MoreHorizontal size={14} />, label: '더보기' },
];
