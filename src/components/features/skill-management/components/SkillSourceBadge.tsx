import React from 'react';
import { SkillSource } from '@/types/skill-management.types';

interface SkillSourceBadgeProps {
  source: SkillSource;
  size?: 'sm' | 'md';
}

const SOURCE_CONFIG: Record<SkillSource, { label: string; emoji: string; colorClass: string }> = {
  platform: {
    label: '플랫폼',
    emoji: '🛡️',
    colorClass: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  org: {
    label: '조직',
    emoji: '⭐',
    colorClass: 'bg-orange-50 text-orange-700 border border-orange-200',
  },
  personal: {
    label: '내가 추가',
    emoji: '👤',
    colorClass: 'bg-gray-100 text-gray-600 border border-gray-200',
  },
};

const SkillSourceBadge: React.FC<SkillSourceBadgeProps> = ({ source, size = 'sm' }) => {
  const config = SOURCE_CONFIG[source];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.colorClass} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
    >
      <span>{config.emoji}</span>
      {config.label}
    </span>
  );
};

export default SkillSourceBadge;
