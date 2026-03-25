import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft, Wrench, CheckCircle2 } from 'lucide-react';
import { Skill, SkillCategory, ChatHistoryEntry } from '@/types/skill-management.types';
import ChatHistorySelector from './ChatHistorySelector';

interface WorkflowCaptureWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (skill: Omit<Skill, 'id'>) => void;
}

const MOCK_CHAT_HISTORY: ChatHistoryEntry[] = [
  {
    id: 'chat-1',
    title: '월간 매출 보고서 작성',
    timestamp: '2026-03-18 14:30',
    toolCalls: ['read_file', 'analyze_data', 'create_chart', 'write_document'],
    messageCount: 12,
  },
  {
    id: 'chat-2',
    title: 'Jira 이슈 요약 및 슬랙 전송',
    timestamp: '2026-03-17 10:15',
    toolCalls: ['jira_search', 'summarize', 'slack_post'],
    messageCount: 8,
  },
  {
    id: 'chat-3',
    title: '고객 피드백 데이터 분석',
    timestamp: '2026-03-16 16:45',
    toolCalls: ['read_csv', 'sentiment_analysis', 'create_chart', 'write_report', 'export_pdf'],
    messageCount: 15,
  },
];

type WizardStep = 'select' | 'preview' | 'edit';

const WorkflowCaptureWizard: React.FC<WorkflowCaptureWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [wizardStep, setWizardStep] = useState<WizardStep>('select');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const selectedChat = MOCK_CHAT_HISTORY.find((c) => c.id === selectedChatId);

  const handleReset = useCallback(() => {
    setWizardStep('select');
    setSelectedChatId(null);
    setTitle('');
    setDescription('');
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [onClose, handleReset]);

  const handleNext = useCallback(() => {
    if (wizardStep === 'select' && selectedChat) {
      setTitle(selectedChat.title);
      setDescription(`${selectedChat.toolCalls.join(' → ')} 워크플로우를 자동화합니다.`);
      setWizardStep('preview');
    } else if (wizardStep === 'preview') {
      setWizardStep('edit');
    }
  }, [wizardStep, selectedChat]);

  const handleBack = useCallback(() => {
    if (wizardStep === 'preview') setWizardStep('select');
    else if (wizardStep === 'edit') setWizardStep('preview');
  }, [wizardStep]);

  const handleComplete = useCallback(() => {
    if (!selectedChat) return;
    const newSkill: Omit<Skill, 'id'> = {
      title: title || selectedChat.title,
      description: description || selectedChat.title,
      isEnabled: false,
      source: 'personal',
      category: 'automation' as SkillCategory,
      tags: selectedChat.toolCalls.slice(0, 3),
      author: '나',
      version: '1.0.0',
      versionHistory: [
        {
          version: '1.0.0',
          releasedAt: new Date().toISOString().slice(0, 10),
          changelog: '워크플로우 캡처로 자동 생성',
          evalPassRate: null,
          evalDelta: null,
          isActive: true,
          activeUserCount: 0,
        },
      ],
      lastUpdated: new Date().toISOString().slice(0, 10),
      evalPassRate: null,
      evalStdDev: null,
      evalDelta: null,
      evalLastRun: null,
      evalScenarios: [],
      evalResults: [],
      benchmarkSummary: null,
      deployPolicy: 'allowed',
      orgId: null,
      targetScope: 'personal',
      teamIds: [],
      requiresMcp: [],
      pendingUpdate: null,
      publishMetadata: null,
      activeUserCount: 0,
    };
    onComplete(newSkill);
    handleReset();
  }, [selectedChat, title, description, onComplete, handleReset]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-base">워크플로우 캡처</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            {wizardStep === 'select' && '스킬로 변환할 채팅 세션을 선택하세요.'}
            {wizardStep === 'preview' && '추출된 패턴을 확인하세요.'}
            {wizardStep === 'edit' && '스킬 정보를 수정하고 저장하세요.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs">
            {(['select', 'preview', 'edit'] as WizardStep[]).map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1 ${
                  s === wizardStep ? 'text-gray-900 font-bold' :
                  (['select', 'preview', 'edit'].indexOf(wizardStep) > i) ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {(['select', 'preview', 'edit'].indexOf(wizardStep) > i) ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${
                      s === wizardStep ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>{i + 1}</span>
                  )}
                  {s === 'select' ? '세션 선택' : s === 'preview' ? '패턴 확인' : '저장'}
                </div>
                {i < 2 && <div className="w-8 h-px bg-gray-200" />}
              </React.Fragment>
            ))}
          </div>

          {/* Step content */}
          {wizardStep === 'select' && (
            <ChatHistorySelector
              entries={MOCK_CHAT_HISTORY}
              selectedId={selectedChatId}
              onSelect={setSelectedChatId}
            />
          )}

          {wizardStep === 'preview' && selectedChat && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 mb-2">추출된 도구 사용 패턴</p>
                <div className="flex items-center gap-1 flex-wrap">
                  {selectedChat.toolCalls.map((tool, i) => (
                    <React.Fragment key={tool}>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700">
                        <Wrench size={11} className="text-gray-400" />
                        {tool}
                      </span>
                      {i < selectedChat.toolCalls.length - 1 && (
                        <ArrowRight size={12} className="text-gray-300" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 mb-1">자동 생성된 설명</p>
                <p className="text-sm text-gray-700">{description}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-700 border border-amber-100">
                이 패턴이 정확한지 확인하세요. 다음 단계에서 수정할 수 있습니다.
              </div>
            </div>
          )}

          {wizardStep === 'edit' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">스킬 이름</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="스킬 이름을 입력하세요"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">설명</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
          {wizardStep !== 'select' ? (
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1">
              <ArrowLeft size={14} />
              이전
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleClose}>
              취소
            </Button>
            {wizardStep === 'edit' ? (
              <Button
                size="sm"
                className="bg-gray-900 hover:bg-black text-white gap-1"
                onClick={handleComplete}
                disabled={!title.trim()}
              >
                스킬로 저장
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-gray-900 hover:bg-black text-white gap-1"
                onClick={handleNext}
                disabled={wizardStep === 'select' && !selectedChatId}
              >
                다음
                <ArrowRight size={14} />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowCaptureWizard;
