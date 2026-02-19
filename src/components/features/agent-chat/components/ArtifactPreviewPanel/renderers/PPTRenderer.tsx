import React from 'react';
import PPTGenPanel, { PPTConfig } from '../../../../../PPTGenPanel';
import { SlideItem } from '../../../types';

export interface PPTRendererProps {
  pptConfig: PPTConfig;
  pptStatus: 'setup' | 'generating' | 'done';
  pptProgress: number;
  pptCurrentStageIndex: number;
  pptSlides: SlideItem[];
  onPptSlidesChange: (slides: SlideItem[]) => void;
  onPptProgressChange?: (progress: number) => void;
  onPptComplete?: () => void;
  onPptSlideStart?: (slideId: number, totalSlides: number) => void;
  onPptSlideComplete?: (slideId: number, totalSlides: number) => void;
  onPptCancel: () => void;
  onClose: () => void;
}

export const PPTRenderer: React.FC<PPTRendererProps> = ({
  pptConfig,
  pptStatus,
  pptProgress,
  pptCurrentStageIndex,
  pptSlides,
  onPptSlidesChange,
  onPptProgressChange,
  onPptComplete,
  onPptSlideStart,
  onPptSlideComplete,
  onPptCancel,
  onClose,
}) => {
  return (
    <PPTGenPanel
      status={pptStatus}
      config={pptConfig}
      progress={pptProgress}
      currentStageIndex={pptCurrentStageIndex}
      slides={pptSlides}
      onSlidesChange={onPptSlidesChange}
      onProgressChange={onPptProgressChange}
      onComplete={onPptComplete}
      onSlideStart={onPptSlideStart}
      onSlideComplete={onPptSlideComplete}
      onCancel={onPptCancel}
      onTogglePanel={onClose}
    />
  );
};

export default PPTRenderer;
