import React from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Play } from 'lucide-react';
import { SlideOutlineDeck } from '../../../types';
import { SlideOutlineFileItem } from './SlideOutlineFileItem';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../../../ui/collapsible';
import { Button } from '../../../../../ui/button';
import { Badge } from '../../../../../ui/badge';
import { Separator } from '../../../../../ui/separator';

interface SlideOutlineFileListProps {
  deck: SlideOutlineDeck | null;
  selectedOutlineId: string | null;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectOutline: (id: string) => void;
  onQuickApprove: (id: string) => void;
  onApproveAll: () => void;
  onGeneratePPT: () => void;
  isAllApproved: boolean;
  approvedCount: number;
  totalCount: number;
}

export const SlideOutlineFileList: React.FC<SlideOutlineFileListProps> = ({
  deck,
  selectedOutlineId,
  isExpanded,
  onToggle,
  onSelectOutline,
  onQuickApprove,
  onApproveAll,
  onGeneratePPT,
  isAllApproved,
  approvedCount,
  totalCount,
}) => {
  if (!deck) return null;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle} className="border-b border-gray-200">
      {/* Section Header */}
      <CollapsibleTrigger asChild>
        <button
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
            <span className="text-sm font-medium text-gray-900">슬라이드 개요</span>
          </div>
          <div className="flex items-center gap-2">
            {/* 승인 진행 상태 */}
            <Badge
              variant="outline"
              className={`text-xs rounded-full border-0 ${
                isAllApproved
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {approvedCount}/{totalCount}
            </Badge>
          </div>
        </button>
      </CollapsibleTrigger>

      {/* Section Content */}
      <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
        <div className="px-3 pb-3">
          {/* File List */}
          <div className="space-y-1 mb-3">
            {deck.outlines.map((outline) => (
              <SlideOutlineFileItem
                key={outline.id}
                outline={outline}
                isSelected={selectedOutlineId === outline.id}
                onSelect={onSelectOutline}
                onQuickApprove={onQuickApprove}
              />
            ))}
          </div>

          {/* Divider */}
          <Separator className="my-3" />

          {/* Actions */}
          <div className="space-y-2">
            {/* 승인 상태 요약 */}
            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
              <span>승인: {approvedCount}/{totalCount}</span>
              {isAllApproved && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  모두 승인됨
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* 모두 승인 버튼 */}
              {!isAllApproved && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onApproveAll}
                  className="flex-1 text-xs font-medium"
                >
                  모두 승인
                </Button>
              )}

              {/* PPT 생성 버튼 */}
              <Button
                size="sm"
                onClick={onGeneratePPT}
                disabled={!isAllApproved}
                className={`flex-1 text-xs font-medium ${
                  isAllApproved
                    ? 'bg-[#FF3C42] text-white hover:bg-[#E63538]'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                PPT 생성
              </Button>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SlideOutlineFileList;
