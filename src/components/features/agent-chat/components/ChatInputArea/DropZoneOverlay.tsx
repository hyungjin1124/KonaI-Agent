import React from 'react';
import { Upload } from 'lucide-react';

interface DropZoneOverlayProps {
  isVisible: boolean;
}

/**
 * 드래그 오버 시 표시되는 드롭존 오버레이
 * - 점선 border + 반투명 배경
 * - Upload 아이콘 + 안내 문구
 * - pulse 애니메이션
 */
export const DropZoneOverlay: React.FC<DropZoneOverlayProps> = ({
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className="absolute inset-0 z-10
                 bg-[#FF3C42]/5 backdrop-blur-[1px]
                 border-2 border-dashed border-[#FF3C42]
                 rounded-xl
                 flex flex-col items-center justify-center gap-2
                 animate-pulse"
    >
      <div className="p-3 bg-[#FF3C42]/10 rounded-full">
        <Upload size={24} className="text-[#FF3C42]" />
      </div>
      <p className="text-sm font-medium text-[#FF3C42]">
        여기에 놓으세요
      </p>
    </div>
  );
};

export default DropZoneOverlay;
