import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquare, Upload, RotateCw } from 'lucide-react';
import { SkillCreationPath } from '@/types/skill-management.types';

interface SkillCreateHubProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPath: (path: SkillCreationPath) => void;
}

const CREATION_PATHS: {
  id: SkillCreationPath;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
}[] = [
  {
    id: 'chat',
    icon: <MessageSquare size={24} />,
    title: '대화로 만들기',
    description: '에이전트와 대화하며 스킬을 단계별로 생성합니다. 목표, 트리거 조건, 출력 형식을 인터뷰 방식으로 정의합니다.',
    cta: '시작하기',
  },
  {
    id: 'upload',
    icon: <Upload size={24} />,
    title: '파일 업로드',
    description: '.zip 또는 .skill 파일을 드래그 앤 드롭으로 업로드합니다. 기존에 만든 스킬 파일이 있을 때 사용하세요.',
    cta: '업로드하기',
  },
  {
    id: 'capture',
    icon: <RotateCw size={24} />,
    title: '워크플로우 캡처',
    description: '채팅에서 수행한 작업을 자동으로 스킬로 변환합니다. 도구 사용 패턴과 입출력 형식을 추출합니다.',
    cta: '캡처하기',
  },
];

const SkillCreateHub: React.FC<SkillCreateHubProps> = ({
  isOpen,
  onClose,
  onSelectPath,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle className="text-base">스킬 추가</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            스킬을 만드는 방법을 선택하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
          {CREATION_PATHS.map((path) => (
            <div
              key={path.id}
              className="flex flex-col items-center text-center border border-gray-200 rounded-2xl p-5 hover:border-gray-400 hover:shadow-md transition-all group cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => onSelectPath(path.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectPath(path.id);
                }
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-gray-900 group-hover:text-white transition-colors mb-3">
                {path.icon}
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-1.5">
                {path.title}
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4 flex-1">
                {path.description}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                tabIndex={-1}
              >
                {path.cta}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SkillCreateHub;
