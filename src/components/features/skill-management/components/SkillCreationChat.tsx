import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, ChevronRight, X } from 'lucide-react';
import { Skill, SkillCategory } from '@/types/skill-management.types';
import SkillCreationStepper, { CreationStep } from './SkillCreationStepper';
import SkillDraftPreview from './SkillDraftPreview';

interface SkillCreationChatProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (skill: Omit<Skill, 'id'>) => void;
}

interface ChatMessage {
  id: number;
  role: 'agent' | 'user';
  content: string;
}

const INTENT_QUESTIONS = [
  '이 스킬이 에이전트가 무엇을 할 수 있게 해야 하나요? (기능적 목표를 설명해주세요)',
  '어떤 상황에서 이 스킬이 트리거되어야 하나요? (예: "보고서 작성 요청 시", "데이터 분석이 필요할 때")',
  '예상 출력 형식은 무엇인가요? (예: "마크다운 보고서", "JSON 데이터", "슬라이드 개요")',
  '이 스킬에 태그를 지정하고 싶다면 입력해주세요. (쉼표로 구분, 예: "보고서, 분석, 자동화")',
];

const INTERVIEW_QUESTIONS = [
  '이 스킬이 처리하지 않아야 할 예외 상황(edge case)이 있나요?',
  '참고할 예시 입력/출력이 있다면 간단히 설명해주세요.',
  '성공 기준은 무엇인가요? (예: "정확도 90% 이상", "3초 이내 응답")',
];

const SkillCreationChat: React.FC<SkillCreationChatProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, role: 'agent', content: '안녕하세요! 새 스킬을 함께 만들어보겠습니다.\n\n' + INTENT_QUESTIONS[0] },
  ]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState<CreationStep>('intent');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [interviewAnswers, setInterviewAnswers] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleReset = useCallback(() => {
    setMessages([
      { id: 0, role: 'agent', content: '안녕하세요! 새 스킬을 함께 만들어보겠습니다.\n\n' + INTENT_QUESTIONS[0] },
    ]);
    setInput('');
    setStep('intent');
    setQuestionIndex(0);
    setAnswers([]);
    setInterviewAnswers([]);
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [onClose, handleReset]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now(), role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    if (step === 'intent') {
      const newAnswers = [...answers, input.trim()];
      setAnswers(newAnswers);
      const nextIdx = questionIndex + 1;

      if (nextIdx < INTENT_QUESTIONS.length) {
        setQuestionIndex(nextIdx);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { id: Date.now() + 1, role: 'agent', content: INTENT_QUESTIONS[nextIdx] },
          ]);
        }, 500);
      } else {
        setStep('interview');
        setQuestionIndex(0);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              role: 'agent',
              content: '기본 정보를 모두 수집했습니다! 더 좋은 스킬을 만들기 위해 몇 가지 추가 질문을 드릴게요.\n\n' + INTERVIEW_QUESTIONS[0] + '\n\n(건너뛰려면 "스킵"이라고 입력하세요)',
            },
          ]);
        }, 500);
      }
    } else if (step === 'interview') {
      const val = input.trim().toLowerCase() === '스킵' ? '' : input.trim();
      const newInterviewAnswers = [...interviewAnswers, val];
      setInterviewAnswers(newInterviewAnswers);
      const nextIdx = questionIndex + 1;

      if (nextIdx < INTERVIEW_QUESTIONS.length) {
        setQuestionIndex(nextIdx);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { id: Date.now() + 1, role: 'agent', content: INTERVIEW_QUESTIONS[nextIdx] + '\n\n(건너뛰려면 "스킵"이라고 입력하세요)' },
          ]);
        }, 500);
      } else {
        setStep('draft');
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              role: 'agent',
              content: '인터뷰가 완료되었습니다! 오른쪽에 SKILL.md 초안이 생성되었습니다.\n\n초안을 확인하고, 테스트를 진행하거나 바로 스킬로 저장할 수 있습니다.',
            },
          ]);
        }, 500);
      }
    }
  }, [input, step, questionIndex, answers, interviewAnswers]);

  const handleSkipInterview = useCallback(() => {
    setStep('draft');
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: 'user', content: '인터뷰를 건너뛸게요.' },
      {
        id: Date.now() + 1,
        role: 'agent',
        content: '초안을 바로 생성합니다! 오른쪽에서 SKILL.md 프리뷰를 확인하세요.',
      },
    ]);
  }, []);

  const handleComplete = useCallback(() => {
    const title = answers[0] || '새 스킬';
    const triggerCondition = answers[1] || '';
    const outputFormat = answers[2] || '';
    const tagsRaw = answers[3] || '';
    const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);

    const newSkill: Omit<Skill, 'id'> = {
      title,
      description: title,
      isEnabled: false,
      source: 'personal',
      category: 'automation' as SkillCategory,
      tags,
      author: '나',
      version: '1.0.0',
      versionHistory: [
        {
          version: '1.0.0',
          releasedAt: new Date().toISOString().slice(0, 10),
          changelog: '대화형 생성으로 최초 생성',
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
  }, [answers, onComplete, handleReset]);

  const title = answers[0] || '';
  const triggerCondition = answers[1] || '';
  const outputFormat = answers[2] || '';
  const tagsRaw = answers[3] || '';
  const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[900px] h-[600px] flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-bold text-gray-900">대화로 스킬 만들기</h3>
            <div className="mt-1">
              <SkillCreationStepper currentStep={step} />
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Body: Chat + Preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat panel */}
          <div className="flex-1 flex flex-col border-r border-gray-200">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}
                >
                  {msg.role === 'agent' && (
                    <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={12} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-gray-900 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-700 rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                      <User size={12} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Actions for draft step */}
            {step === 'draft' && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-gray-900 hover:bg-black text-white gap-1.5"
                  onClick={handleComplete}
                >
                  스킬로 저장
                  <ChevronRight size={14} />
                </Button>
              </div>
            )}

            {/* Skip interview shortcut */}
            {step === 'interview' && (
              <div className="px-4 pb-1">
                <button
                  onClick={handleSkipInterview}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  나머지 질문 건너뛰기
                </button>
              </div>
            )}

            {/* Input */}
            {(step === 'intent' || step === 'interview') && (
              <div className="px-4 py-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="답변을 입력하세요..."
                    className="flex-1 bg-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    className="h-9 w-9 bg-gray-900 hover:bg-black"
                    onClick={handleSend}
                    disabled={!input.trim()}
                  >
                    <Send size={14} className="text-white" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Preview panel */}
          <div className="w-[320px] shrink-0 bg-gray-50">
            <SkillDraftPreview
              title={title}
              description={title}
              triggerCondition={triggerCondition}
              outputFormat={outputFormat}
              tags={tags}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SkillCreationChat;
