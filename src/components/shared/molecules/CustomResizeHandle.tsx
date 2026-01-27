import React, { forwardRef, memo } from 'react';
import { ArrowDownRight } from '../../icons';

interface CustomResizeHandleProps {
  handleAxis?: string;
  [key: string]: unknown;
}

export const CustomResizeHandle = memo(
  forwardRef<HTMLDivElement, CustomResizeHandleProps>(
    ({ handleAxis: _handleAxis, ...props }, ref) => {
      return (
        <div
          ref={ref}
          className="absolute bottom-0 right-0 cursor-se-resize z-[50] p-1.5 transition-colors group hover:bg-gray-100 rounded-tl-lg"
          {...props}
        >
          <ArrowDownRight
            size={16}
            strokeWidth={3}
            className="text-gray-300 group-hover:text-[#FF3C42] transition-colors"
          />
        </div>
      );
    }
  )
);

CustomResizeHandle.displayName = 'CustomResizeHandle';

export default CustomResizeHandle;
