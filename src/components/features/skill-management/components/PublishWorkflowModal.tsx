import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skill, PublishMetadata } from '@/types/skill-management.types';
import { Share2, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

interface PublishWorkflowModalProps {
  isOpen: boolean;
  skill: Skill | null;
  onClose: () => void;
  onPublish: (skillId: string, metadata: PublishMetadata) => void;
}

type PublishStep = 'changelog' | 'scope' | 'confirm';

const STEPS: { id: PublishStep; label: string }[] = [
  { id: 'changelog', label: '변경 요약' },
  { id: 'scope', label: '범위 선택' },
  { id: 'confirm', label: '확인' },
];

const PublishWorkflowModal: React.FC<PublishWorkflowModalProps> = ({
  isOpen,
  skill,
  onClose,
  onPublish,
}) => {
  const [currentStep, setCurrentStep] = useState<PublishStep>('changelog');
  const [changelog, setChangelog] = useState('');
  const [scope, setScope] = useState<'team' | 'org'>('team');

  if (!skill) return null;

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const handleNext = () => {
    if (currentStep === 'changelog') setCurrentStep('scope');
    else if (currentStep === 'scope') setCurrentStep('confirm');
  };

  const handleBack = () => {
    if (currentStep === 'scope') setCurrentStep('changelog');
    else if (currentStep === 'confirm') setCurrentStep('scope');
  };

  const handlePublish = () => {
    const metadata: PublishMetadata = {
      publishedAt: new Date().toISOString().slice(0, 10),
      changelog: changelog || `${skill.title} v${skill.version} 공유`,
      scope,
      publishedBy: skill.author,
      status: 'published',
    };
    onPublish(skill.id, metadata);
    handleReset();
  };

  const handleReset = () => {
    setCurrentStep('changelog');
    setChangelog('');
    setScope('team');
    onClose();
  };

  const canProceed = currentStep === 'changelog' ? changelog.trim().length > 0 : true;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleReset()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Share2 size={16} className="text-blue-600" />
            팀에 공유
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            &quot;{skill.title}&quot; v{skill.version}을 팀과 공유합니다.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1 py-2">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.id}>
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                  i <= stepIndex
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-gray-50 text-gray-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < stepIndex
                    ? 'bg-blue-600 text-white'
                    : i === stepIndex
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-200 text-gray-400'
                }`}>
                  {i < stepIndex ? <CheckCircle2 size={12} /> : i + 1}
                </span>
                {step.label}
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight size={12} className="text-gray-300 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[140px] py-2">
          {currentStep === 'changelog' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                변경 요약 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                placeholder="이 버전에서 변경된 내용을 간단히 설명해주세요."
                rows={4}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-400">팀원들이 업데이트 시 이 내용을 확인합니다.</p>
            </div>
          )}

          {currentStep === 'scope' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">공유 범위</label>
              <div className="space-y-2">
                {([
                  { value: 'team' as const, label: '팀에 공유', desc: '소속 팀 멤버만 열람/설치 가능' },
                  { value: 'org' as const, label: '조직 전체 공유', desc: '조직 내 모든 구성원이 열람/설치 가능' },
                ]).map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      scope === opt.value
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="publish-scope"
                      value={opt.value}
                      checked={scope === opt.value}
                      onChange={() => setScope(opt.value)}
                      className="mt-0.5 accent-blue-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'confirm' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">스킬</p>
                  <p className="text-sm font-bold text-gray-900">{skill.title} v{skill.version}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">변경 요약</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{changelog}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">공유 범위</p>
                  <p className="text-sm text-gray-700">
                    {scope === 'team' ? '팀에 공유' : '조직 전체 공유'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                공유하면 {scope === 'team' ? '팀 멤버' : '조직 내 모든 구성원'}가 이 스킬을 설치할 수 있습니다.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
          <div>
            {stepIndex > 0 && (
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1">
                <ChevronLeft size={14} />
                이전
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              취소
            </Button>
            {currentStep === 'confirm' ? (
              <Button size="sm" onClick={handlePublish} className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
                <Share2 size={13} />
                공유하기
              </Button>
            ) : (
              <Button size="sm" onClick={handleNext} disabled={!canProceed} className="gap-1">
                다음
                <ChevronRight size={14} />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PublishWorkflowModal;
