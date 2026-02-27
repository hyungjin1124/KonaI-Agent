import React from 'react';
import { FileText, Image, Link } from 'lucide-react';
import { Plus } from '../../../../icons';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../../../../ui/dropdown-menu';

interface PlusMenuProps {
  onFileClick: () => void;
  onImageClick: () => void;
  onWebLinkClick?: () => void;
  disabled?: boolean;
}

export const PlusMenu: React.FC<PlusMenuProps> = ({
  onFileClick,
  onImageClick,
  onWebLinkClick,
  disabled,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          className="p-2 mb-0.5 text-[#848383] hover:text-[#FF3C42] hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="첨부 메뉴 열기"
        >
          <Plus size={20} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-48">
        <DropdownMenuItem onClick={onFileClick}>
          <FileText className="mr-2 h-4 w-4" />
          파일 첨부
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onImageClick}>
          <Image className="mr-2 h-4 w-4" />
          이미지 업로드
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onWebLinkClick} disabled={!onWebLinkClick}>
          <Link className="mr-2 h-4 w-4" />
          웹 링크 추가
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
