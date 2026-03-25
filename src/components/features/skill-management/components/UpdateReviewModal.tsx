import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skill } from '@/types/skill-management.types';
import { ArrowRight, CheckCircle, XCircle, TrendingUp, Clock, Zap } from 'lucide-react';
import EvalQualityBadge from './EvalQualityBadge';

interface UpdateReviewModalProps {
  isOpen: boolean;
  skill: Skill | null;
  onClose: () => void;
  onAccept: (skillId: string) => void;
  onSkip: () => void;
}

const UpdateReviewModal: React.FC<UpdateReviewModalProps> = ({
  isOpen,
  skill,
  onClose,
  onAccept,
  onSkip,
}) => {
  if (!skill || !skill.pendingUpdate) return null;

  const currentVersion = skill.versionHistory.find((v) => v.isActive);
  const currentPassRate = currentVersion?.evalPassRate ?? skill.evalPassRate;

  // Simulated new version eval data (since we don't have real eval data for the pending version)
  const estimatedNewPassRate = currentPassRate !== null
    ? Math.min(1, currentPassRate + 0.05 + Math.random() * 0.1)
    : null;

  const passRateDelta = currentPassRate !== null && estimatedNewPassRate !== null
    ? estimatedNewPassRate - currentPassRate
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-base">업데이트 리뷰</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            &quot;{skill.title}&quot;의 새 버전을 확인하고 적용 여부를 결정하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Version comparison header */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex-1 text-center bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">현재 버전</p>
              <p className="text-lg font-bold text-gray-900">v{skill.version}</p>
              {currentPassRate !== null && (
                <div className="mt-1.5 flex justify-center">
                  <EvalQualityBadge passRate={currentPassRate} size="sm" />
                </div>
              )}
            </div>
            <ArrowRight size={20} className="text-gray-400 shrink-0" />
            <div className="flex-1 text-center bg-blue-50 rounded-xl p-3 border border-blue-200">
              <p className="text-xs text-blue-500 mb-1">새 버전</p>
              <p className="text-lg font-bold text-blue-700">v{skill.pendingUpdate.version}</p>
              {estimatedNewPassRate !== null && (
                <div className="mt-1.5 flex justify-center">
                  <EvalQualityBadge passRate={estimatedNewPassRate} size="sm" />
                </div>
              )}
            </div>
          </div>

          {/* Changelog */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-500 mb-2">변경 내역</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {skill.pendingUpdate.changelog}
            </p>
          </div>

          {/* Eval comparison */}
          {passRateDelta !== null && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500">성능 비교 (예상)</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <TrendingUp size={14} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500 mb-0.5">통과율 변화</p>
                  <p className={`text-sm font-bold ${passRateDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {passRateDelta >= 0 ? '+' : ''}{Math.round(passRateDelta * 100)}%p
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Clock size={14} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500 mb-0.5">응답 시간</p>
                  <p className="text-sm font-bold text-green-600">-0.8s</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Zap size={14} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500 mb-0.5">토큰 사용</p>
                  <p className="text-sm font-bold text-gray-600">~동일</p>
                </div>
              </div>
            </div>
          )}

          {/* Impact */}
          <div className="flex items-start gap-2 text-xs text-gray-500 bg-amber-50 rounded-lg p-3 border border-amber-100">
            <span className="text-amber-500 mt-0.5">⚠️</span>
            <span>
              업데이트 적용 시 현재 설정은 유지되며, 새 버전의 기능이 즉시 적용됩니다.
              문제가 발생하면 버전 이력에서 롤백할 수 있습니다.
            </span>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-gray-500"
          >
            <XCircle size={14} className="mr-1.5" />
            이번엔 건너뛰기
          </Button>
          <Button
            size="sm"
            onClick={() => onAccept(skill.id)}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
          >
            <CheckCircle size={14} />
            업데이트 적용
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateReviewModal;
