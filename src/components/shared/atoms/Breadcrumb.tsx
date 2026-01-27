import React, { memo } from 'react';
import { ChevronRight } from '../../icons';

interface BreadcrumbProps {
  path: string[];
  onBack: (index: number) => void;
}

export const Breadcrumb = memo<BreadcrumbProps>(({ path, onBack }) => (
  <nav className="flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
    {path.map((item, idx) => (
      <React.Fragment key={idx}>
        <span
          onClick={() => onBack(idx)}
          className={`cursor-pointer transition-colors ${
            idx === path.length - 1 ? 'text-[#FF3C42]' : 'hover:text-gray-600'
          }`}
        >
          {item}
        </span>
        {idx < path.length - 1 && <ChevronRight size={10} />}
      </React.Fragment>
    ))}
  </nav>
));

Breadcrumb.displayName = 'Breadcrumb';

export default Breadcrumb;
