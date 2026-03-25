import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SkillVersion } from '@/types/skill-management.types';

interface RollbackConfirmModalProps {
  isOpen: boolean;
  targetVersion: SkillVersion | null;
  skillTitle: string;
  currentVersion: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const RollbackConfirmModal: React.FC<RollbackConfirmModalProps> = ({
  isOpen,
  targetVersion,
  skillTitle,
  currentVersion,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState('');

  if (!targetVersion) return null;

  const handleCancel = () => {
    setReason('');
    onCancel();
  };

  const handleConfirm = () => {
    setReason('');
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw size={18} className="text-amber-500" />
            이전 버전으로 되돌리기
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-gray-600">
            <span className="font-bold text-gray-900">{skillTitle}</span>을(를) 이전 버전으로
            되돌립니다. 현재 버전의 설정과 동작이 선택한 버전으로 변경됩니다.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">현재 버전</span>
              <span className="font-medium text-gray-900">v{currentVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">되돌릴 버전</span>
              <span className="font-bold text-amber-600">v{targetVersion.version}</span>
            </div>
          </div>

          {/* P1-10: 롤백 사유 입력 */}
          <div>
            <label htmlFor="rollback-reason" className="text-xs font-medium text-gray-600 mb-1 block">
              롤백 사유 (선택)
            </label>
            <textarea
              id="rollback-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="예: 최신 버전에서 응답 품질 저하 발생"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              rows={2}
            />
          </div>

          <p className="text-xs text-gray-500">
            되돌린 후에도 현재 버전 기록은 보존됩니다. 언제든 다시 최신 버전으로 변경할 수 있습니다.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <RotateCcw size={14} className="mr-1" />
            되돌리기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RollbackConfirmModal;
