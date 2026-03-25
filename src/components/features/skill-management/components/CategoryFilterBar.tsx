import React from 'react';
import { SkillCategory, SKILL_CATEGORIES } from '@/types/skill-management.types';

interface CategoryFilterBarProps {
  selected: SkillCategory | 'all';
  onChange: (category: SkillCategory | 'all') => void;
  counts?: Partial<Record<SkillCategory | 'all', number>>;
}

const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({ selected, onChange, counts }) => {
  return (
    <div className="flex items-center gap-2 flex-wrap" role="radiogroup" aria-label="카테고리 필터">
      {SKILL_CATEGORIES.map((cat) => {
        const isActive = selected === cat.id;
        const count = counts?.[cat.id as SkillCategory | 'all'];
        return (
          <button
            key={cat.id}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(cat.id as SkillCategory | 'all')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              isActive
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat.emoji && <span>{cat.emoji}</span>}
            {cat.label}
            {count !== undefined && (
              <span
                className={`ml-0.5 ${
                  isActive ? 'text-gray-300' : 'text-gray-400'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilterBar;
