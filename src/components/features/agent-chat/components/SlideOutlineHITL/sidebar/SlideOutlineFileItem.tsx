import React from 'react';
import { FileText, Check, Circle, AlertCircle } from 'lucide-react';
import { SlideOutline, SlideOutlineStatus } from '../../../types';
import { Button } from '../../../../../ui/button';
import { Badge } from '../../../../../ui/badge';

interface SlideOutlineFileItemProps {
  outline: SlideOutline;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onQuickApprove?: (id: string) => void;
}

// 상태별 아이콘 및 스타일
const getStatusConfig = (status: SlideOutlineStatus) => {
  switch (status) {
    case 'approved':
      return {
        icon: <Check className="w-3.5 h-3.5" />,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-50',
        label: '승인',
      };
    case 'needs-revision':
      return {
        icon: <AlertCircle className="w-3.5 h-3.5" />,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        label: '수정 필요',
      };
    case 'pending-review':
      return {
        icon: <Circle className="w-3.5 h-3.5" />,
        color: 'text-gray-400',
        bgColor: 'bg-gray-50',
        label: '대기',
      };
    case 'draft':
    default:
      return {
        icon: <Circle className="w-3.5 h-3.5 opacity-50" />,
        color: 'text-gray-300',
        bgColor: 'bg-gray-50',
        label: '초안',
      };
  }
};

export const SlideOutlineFileItem: React.FC<SlideOutlineFileItemProps> = ({
  outline,
  isSelected,
  onSelect,
  onQuickApprove,
}) => {
  const statusConfig = getStatusConfig(outline.status);

  return (
    <div
      className={`
        group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer
        transition-all duration-150 ease-out
        ${isSelected
          ? 'bg-orange-50 border border-orange-200 shadow-sm'
          : 'hover:bg-gray-50 border border-transparent'
        }
      `}
      onClick={() => onSelect(outline.id)}
    >
      {/* 좌측: 아이콘 + 파일명 */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* 파일 아이콘 */}
        <div className={`
          flex-shrink-0 p-1 rounded
          ${isSelected ? 'text-orange-600' : 'text-gray-400'}
        `}>
          <FileText className="w-4 h-4" />
        </div>

        {/* 파일명 */}
        <span className={`
          text-sm truncate
          ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}
        `}>
          {outline.fileName}
        </span>
      </div>

      {/* 우측: 상태 표시 */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* 퀵 승인 버튼 (호버 시 표시, 아직 승인되지 않은 경우만) */}
        {outline.status !== 'approved' && onQuickApprove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onQuickApprove(outline.id);
            }}
            className="opacity-0 group-hover:opacity-100 h-7 w-7 hover:bg-emerald-100 text-emerald-600"
            title="승인"
          >
            <Check className="w-3.5 h-3.5" />
          </Button>
        )}

        {/* 상태 뱃지 */}
        <Badge
          variant="outline"
          className={`text-xs border-0 gap-1 ${statusConfig.color} ${statusConfig.bgColor}`}
          title={statusConfig.label}
        >
          {statusConfig.icon}
          <span className="hidden sm:inline">{statusConfig.label}</span>
        </Badge>
      </div>
    </div>
  );
};

export default SlideOutlineFileItem;
