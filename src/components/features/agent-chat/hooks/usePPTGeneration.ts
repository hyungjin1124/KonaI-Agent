import { useState, useEffect, useCallback } from 'react';
import { PPTConfig } from '../../../../types';
import { PPTStatus } from '../types';

const DEFAULT_PPT_CONFIG: PPTConfig = {
  theme: 'Corporate Blue',
  topics: ['Executive Summary', 'Q4 Revenue Overview'],
  titleFont: 'Pretendard',
  bodyFont: 'Pretendard',
  slideCount: 15,
};

interface UsePPTGenerationReturn {
  pptStatus: PPTStatus;
  pptProgress: number;
  pptCurrentStage: number;
  pptConfig: PPTConfig;
  setPptStatus: (status: PPTStatus) => void;
  handleGenerateStart: () => void;
  updatePptConfig: <K extends keyof PPTConfig>(key: K, value: PPTConfig[K]) => void;
  toggleTopic: (topic: string) => void;
}

export function usePPTGeneration(): UsePPTGenerationReturn {
  const [pptStatus, setPptStatus] = useState<PPTStatus>('idle');
  const [pptProgress, setPptProgress] = useState(0);
  const [pptCurrentStage, setPptCurrentStage] = useState(0);
  const [pptConfig, setPptConfig] = useState<PPTConfig>(DEFAULT_PPT_CONFIG);

  // Handle PPT Generation Simulation
  useEffect(() => {
    if (pptStatus === 'generating') {
      const interval = setInterval(() => {
        setPptProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setPptStatus('done');
            return 100;
          }
          // Calculate stage based on progress
          const newStage = Math.min(5, Math.floor((prev + 1) / 16));
          setPptCurrentStage(newStage);
          return prev + 1;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [pptStatus]);

  const handleGenerateStart = useCallback(() => {
    setPptStatus('generating');
    setPptProgress(0);
  }, []);

  const updatePptConfig = useCallback(<K extends keyof PPTConfig>(key: K, value: PPTConfig[K]) => {
    setPptConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleTopic = useCallback((topic: string) => {
    setPptConfig(prev => {
      const exists = prev.topics.includes(topic);
      if (exists) return { ...prev, topics: prev.topics.filter(t => t !== topic) };
      return { ...prev, topics: [...prev.topics, topic] };
    });
  }, []);

  return {
    pptStatus,
    pptProgress,
    pptCurrentStage,
    pptConfig,
    setPptStatus,
    handleGenerateStart,
    updatePptConfig,
    toggleTopic,
  };
}
