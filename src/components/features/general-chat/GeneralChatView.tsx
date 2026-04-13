import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, ArrowUp } from '../../icons';
import { CoworkLayout } from '../agent-chat/layouts';
import { RightSidebar } from '../agent-chat/components/RightSidebar';
import {
  ProgressTask,
  Artifact,
  ArtifactPreviewType,
  ArtifactTab,
  ContextItem,
  SidebarSection,
  AttachedFile,
} from '../agent-chat/types';
import { ArtifactPanelProvider, useArtifactPanel } from '../agent-chat/context/ArtifactPanelContext';
import { ArtifactPreviewPanel } from '../agent-chat/components/ArtifactPreviewPanel/ArtifactPreviewPanel';
import { AttachedFileChip } from '../agent-chat/components/ChatInputArea/AttachedFileChip';
import { DropZoneOverlay } from '../agent-chat/components/ChatInputArea/DropZoneOverlay';
import { ChatPanel } from './components/ChatPanel';
import { UnifiedChatInput } from './components/UnifiedChatInput';
import { LeftSidebar } from './components/LeftSidebar/LeftSidebar';
import { ChatMessage, ChatSession } from './types';
import { useBranching } from './hooks/useBranching';
import { useNLChart, NLChartRenderer, NLDashboardRenderer, isDashboardQuery } from '../nl-chart';
import { ModelSwitcher } from '../model-switcher';
import { DEFAULT_MODEL_ID } from '@/constants/models';
import { useToast } from '@/context/ToastContext';
import { useSkillDraft } from '../skill-draft/hooks/useSkillDraft';
import { useSkillIntentDetection } from '../skill-draft/hooks/useSkillIntentDetection';
import { useScriptedSkillScenario } from '../skill-draft/hooks/useScriptedSkillScenario';
import { skillDraftStore } from '../skill-draft/data/skillDraftStore';
import { mockTeamSkills } from '../skill-management/data/skillMockData';
import { SCENARIOS } from '../skill-draft/data/skillDraftScenarios';
import type { EvalRun } from '@/types/skill-draft.types';
import type { TeamSkill } from '@/types/skill-management.types';

const MOCK_SESSIONS: ChatSession[] = [
  { id: 's1', title: 'Q4 경영 실적 분석', preview: '최근 실적 데이터를 요약...', createdAt: new Date('2025-12-28'), updatedAt: new Date('2025-12-28'), messageCount: 8 },
  { id: 's2', title: 'DID 사업부 원가 진단', preview: '원가 효율성 관련 분석...', createdAt: new Date('2025-12-27'), updatedAt: new Date('2025-12-27'), messageCount: 12 },
  { id: 's3', title: '일본 지사 환율 리스크', preview: '환율 변동 대응 전략...', createdAt: new Date('2025-12-26'), updatedAt: new Date('2025-12-26'), messageCount: 5 },
  { id: 's4', title: '신규 플랫폼 기획', preview: '새 서비스 아이디어 정리...', createdAt: new Date('2025-12-20'), updatedAt: new Date('2025-12-20'), messageCount: 24 },
  { id: 's5', title: '12월 매출 심층 분석', preview: '월별 추이를 보면...', createdAt: new Date('2025-12-15'), updatedAt: new Date('2025-12-15'), messageCount: 6 },
];

const getFileType = (filename: string): AttachedFile['type'] => {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.md')) return 'markdown';
  if (lower.endsWith('.txt')) return 'text';
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.docx')) return 'docx';
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return 'xlsx';
  if (lower.endsWith('.csv')) return 'csv';
  if (lower.endsWith('.pptx') || lower.endsWith('.ppt')) return 'pptx';
  return 'other';
};

// Bridge pattern: expose ArtifactPanelContext methods via ref
const ArtifactPanelBridge: React.FC<{
  bridgeRef: React.MutableRefObject<{
    openArtifactTab: (artifact: Artifact, previewType: ArtifactPreviewType) => void;
    openTab: (tab: ArtifactTab) => void;
    switchTab: (tabId: string) => void;
    closePanel: () => void;
  } | null>;
}> = ({ bridgeRef }) => {
  const panel = useArtifactPanel();
  bridgeRef.current = {
    openArtifactTab: panel.openArtifactTab,
    openTab: panel.openTab,
    switchTab: panel.switchTab,
    closePanel: panel.closePanel,
  };
  return null;
};

// 시나리오 무관 고정 ID — 한 채팅에 하나의 skill-draft 탭만 존재
const SKILL_DRAFT_TAB_ID = 'skill-draft-panel';

export const GeneralChatView: React.FC = () => {
  // Left sidebar state
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Chat state
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Toast for file validation errors
  const { showToast } = useToast();

  // Branching
  const {
    branches,
    activeBranchId,
    activeMessages: messages,
    createBranch,
    switchBranch,
    deleteBranch,
    addMessage,
    getBranchesAtMessage,
    resetBranching,
  } = useBranching();

  // File attachment state (drag from file tree)
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  // Right sidebar state (expanded by default)
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<SidebarSection[]>([
    'progress',
    'artifacts',
  ]);

  // NL-to-Chart + Dashboard
  const {
    chartResult, processQuery, changeChartType, clearChart,
    dashboardResult, processDashboardQuery, changeWidgetChartType, clearDashboard,
  } = useNLChart();
  const [isCenterPanelOpen, setIsCenterPanelOpen] = useState(false);
  const artifactPanelRef = useRef<{
    openArtifactTab: (artifact: Artifact, previewType: ArtifactPreviewType) => void;
    openTab: (tab: ArtifactTab) => void;
    switchTab: (tabId: string) => void;
    closePanel: () => void;
  } | null>(null);

  // Model selection
  const [selectedModelId, setSelectedModelId] = useState<string>(DEFAULT_MODEL_ID);

  // Track chart artifacts for sidebar
  const [chartArtifacts, setChartArtifacts] = useState<Artifact[]>([]);

  // Skill draft (사용자 발화 기반 스킬 생성/편집)
  const skillDraftHook = useSkillDraft(activeSessionId ?? 'new');
  const intentDetection = useSkillIntentDetection();
  const scenarioRunner = useScriptedSkillScenario();

  // S9 — 편집/생성 의도를 라우트 query 에서 받아 자동 부트스트랩 (D14)
  const searchParams = useSearchParams();
  const editSkillId = searchParams?.get('editSkillId') ?? null;
  const intentParam = searchParams?.get('intent') ?? null;
  const bootstrappedQueryRef = useRef<string | null>(null);

  // Empty state for right sidebar
  const tasks: ProgressTask[] = [];
  const contextItems: ContextItem[] = [];

  // Check if in empty state (no messages)
  const isEmptyState = messages.length === 0 && !isLoading;

  // Keyboard shortcuts for branching
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Ctrl+Shift+B — create branch from last assistant message
      if (e.ctrlKey && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        const lastMsg = [...messages].reverse().find((m) => m.type === 'assistant');
        if (lastMsg) createBranch(lastMsg.id);
        return;
      }
      // Ctrl+[ — switch to previous branch
      if (e.ctrlKey && e.key === '[') {
        e.preventDefault();
        const idx = branches.findIndex((b) => b.id === activeBranchId);
        if (idx > 0) switchBranch(branches[idx - 1].id);
        return;
      }
      // Ctrl+] — switch to next branch
      if (e.ctrlKey && e.key === ']') {
        e.preventDefault();
        const idx = branches.findIndex((b) => b.id === activeBranchId);
        if (idx < branches.length - 1) switchBranch(branches[idx + 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [messages, branches, activeBranchId, createBranch, switchBranch]);

  // Handlers
  const handleNewChat = useCallback(() => {
    setActiveSessionId(null);
    resetBranching();
    setInputValue('');
    clearChart();
    clearDashboard();
    setIsCenterPanelOpen(false);
    setChartArtifacts([]);
  }, [clearChart, clearDashboard, resetBranching]);

  const handleSessionSelect = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    resetBranching();
    setAttachedFile(null);
    clearChart();
    clearDashboard();
    setIsCenterPanelOpen(false);
    setChartArtifacts([]);
  }, [clearChart, clearDashboard, resetBranching]);

  const handleToggleLeftSidebar = useCallback(() => {
    setIsLeftSidebarCollapsed((prev) => !prev);
  }, []);

  const handleToggleRightSidebar = useCallback(() => {
    setIsRightSidebarCollapsed((prev) => !prev);
  }, []);

  const handleToggleSection = useCallback((section: SidebarSection) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  }, []);

  const handleCloseCenterPanel = useCallback(() => {
    setIsCenterPanelOpen(false);
    artifactPanelRef.current?.closePanel();
  }, []);

  // ---------- Skill Draft helpers ----------
  const openSkillDraftPanel = useCallback(() => {
    artifactPanelRef.current?.openTab({
      id: SKILL_DRAFT_TAB_ID,
      artifact: null,
      previewType: 'skill-draft',
      title: '스킬 드래프트',
    });
    setIsCenterPanelOpen(true);
  }, []);

  const pushAgentText = useCallback(
    (content: string) => {
      addMessage({
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'assistant',
        content,
        timestamp: new Date(),
      });
    },
    [addMessage],
  );

  const pushSkillDraftCard = useCallback(
    (draftId: string) => {
      addMessage({
        id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'skill-draft-card',
        content: '',
        timestamp: new Date(),
        draftId,
      });
    },
    [addMessage],
  );

  /** PASS / FAIL 시나리오에 따라 자동 평가를 회차별로 진행 */
  const runSkillEval = useCallback(
    async (isFirstAttempt: boolean) => {
      const draft = skillDraftHook.draft;
      if (!draft) return;
      const draftId = draft.id;

      skillDraftHook.transitionTo('EVALUATING');

      const { pass } = await scenarioRunner.runEval(
        draft.scenarioId,
        isFirstAttempt,
        (run: EvalRun) => {
          skillDraftHook.appendEvalRun(run);
        },
      );

      if (pass) {
        skillDraftHook.transitionTo('EVAL_PASS');
        pushAgentText(
          '자동 평가 3 / 3 통과했습니다. 채팅에 "저장해줘" 라고 말씀하시면 스킬 라이브러리에 등록할게요.',
        );
        pushSkillDraftCard(draftId);
      } else {
        skillDraftHook.transitionTo('EVAL_FAIL');
        const scenario = skillDraftHook.scenario;
        pushAgentText(
          scenario?.failRecoveryHint ??
            '자동 평가 중 실패가 발생했어요. 어떻게 보완할지 말씀해주세요.',
        );
        pushSkillDraftCard(draftId);
      }
    },
    [pushAgentText, pushSkillDraftCard, scenarioRunner, skillDraftHook],
  );

  const handleSkillSave = useCallback(() => {
    const saved = skillDraftHook.save();
    if (!saved) {
      pushAgentText(
        '아직 저장할 수 없어요. 자동 평가가 모두 통과한 다음에 다시 시도해주세요.',
      );
      return;
    }
    skillDraftStore.add(saved);
    pushAgentText(
      `"${saved.name}" 스킬이 라이브러리에 저장됐어요. [/skills](/skills) 에서 확인할 수 있습니다.`,
    );
  }, [pushAgentText, skillDraftHook]);

  const handleSkillDiscard = useCallback(() => {
    skillDraftHook.discard();
    pushAgentText('드래프트를 폐기했어요. 새 요청이 있으면 언제든 말씀해주세요.');
  }, [pushAgentText, skillDraftHook]);

  const getDraftById = useCallback(
    (id: string) => {
      const d = skillDraftHook.draft;
      if (!d) return null;
      return d.id === id ? d : null;
    },
    [skillDraftHook.draft],
  );

  // S9 — query 부트스트랩: editSkillId 또는 intent=create-skill (D14)
  // 같은 query 조합에 대해 한 번만 실행하도록 ref 로 가드한다.
  useEffect(() => {
    const queryKey = `${editSkillId ?? ''}|${intentParam ?? ''}`;
    if (!queryKey || queryKey === '|') return;
    if (bootstrappedQueryRef.current === queryKey) return;
    if (skillDraftHook.draft) return;

    // 1) 편집 경로 — 원본 스킬을 찾아 originSkill 로 드래프트 생성
    if (editSkillId) {
      const fromStore = skillDraftStore.getAll().find((s) => s.id === editSkillId);
      const fromMock = mockTeamSkills.find((s) => s.id === editSkillId);
      const origin: TeamSkill | undefined = fromStore ?? fromMock;
      if (!origin) {
        bootstrappedQueryRef.current = queryKey;
        pushAgentText(
          '편집할 스킬을 찾지 못했어요. 스킬 목록에서 다시 선택해주세요.',
        );
        return;
      }

      // 편집 모드는 mock 시나리오 1개를 재사용 — 첫 번째 시나리오로 연결
      const scenario = SCENARIOS[0];
      const created = skillDraftHook.create({
        scenarioId: scenario.id,
        chatSessionId: activeSessionId ?? 'new',
        originSkill: origin,
      });
      if (created) {
        bootstrappedQueryRef.current = queryKey;
        setTimeout(() => {
          pushAgentText(
            `"${origin.name}" (${origin.version}) 스킬을 편집해요. 어떤 부분을 바꾸고 싶은지 말씀해주세요.\n\n예: "트리거 조건만 바꿔줘", "출력은 항상 표 형식으로 고정해줘"\n\n준비가 끝나면 "이대로 진행해줘" 라고 말씀하시면 자동 평가를 다시 돌릴게요.`,
          );
          pushSkillDraftCard(created.id);
          openSkillDraftPanel();
        }, 200);
      }
      return;
    }

    // 2) 생성 의도 — 안내 메시지만 한 줄
    if (intentParam === 'create-skill') {
      bootstrappedQueryRef.current = queryKey;
      setTimeout(() => {
        pushAgentText(
          '새 스킬을 만들어볼까요? 자동화하고 싶은 작업을 말씀해주세요. 예: "매출 리포트 스킬로 만들어줘", "회의록 정리 스킬 만들어줘"',
        );
      }, 200);
    }
  }, [
    editSkillId,
    intentParam,
    skillDraftHook,
    activeSessionId,
    pushAgentText,
    pushSkillDraftCard,
    openSkillDraftPanel,
  ]);

  const handleSend = useCallback((attachedFiles?: AttachedFile[]) => {
    if (!inputValue.trim() && (!attachedFiles || attachedFiles.length === 0)) return;
    if (isLoading) return;

    const fileNames = attachedFiles?.map((f) => f.name).join(', ');
    const content = fileNames
      ? `${inputValue.trim() ? inputValue.trim() + '\n\n' : ''}📎 ${fileNames}`
      : inputValue.trim();

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputValue('');
    setIsLoading(true);

    // ---------- Skill Draft 의도 분기 (다른 분기보다 우선) ----------
    const intent = intentDetection.detect(content, skillDraftHook.draft);

    // 1) 새 드래프트 생성
    if (intent.isCreateIntent && intent.scenarioId) {
      const created = skillDraftHook.create({
        scenarioId: intent.scenarioId,
        chatSessionId: activeSessionId ?? 'new',
      });
      if (created) {
        const initialMsg = scenarioRunner.start(intent.scenarioId);
        setTimeout(() => {
          pushAgentText(initialMsg);
          pushSkillDraftCard(created.id);
          openSkillDraftPanel();
          setIsLoading(false);
        }, 300);
        return;
      }
    }

    // 2) 폐기 의도
    if (intent.isDiscardIntent) {
      handleSkillDiscard();
      const id = skillDraftHook.draft?.id;
      if (id) pushSkillDraftCard(id);
      setIsLoading(false);
      return;
    }

    // 3) 저장 의도 (EVAL_PASS 일 때만)
    if (intent.isSaveIntent) {
      handleSkillSave();
      const id = skillDraftHook.draft?.id;
      if (id) pushSkillDraftCard(id);
      setIsLoading(false);
      return;
    }

    // 4) 진행 의도 → 자동 평가 시작
    if (intent.isProgressIntent) {
      const draftId = skillDraftHook.draft?.id;
      const isFirstAttempt = (skillDraftHook.draft?.evalRuns.length ?? 0) === 0;
      setTimeout(() => {
        pushAgentText('자동 평가를 시작할게요. 회차별로 결과를 표시합니다.');
        if (draftId) pushSkillDraftCard(draftId);
        setIsLoading(false);
        // 비동기 실행 (회차별 결과는 setTimeout 으로 누적)
        runSkillEval(isFirstAttempt);
      }, 200);
      return;
    }

    // 5) FAIL 후 회복 발화
    if (intent.isRecoveryIntent && skillDraftHook.draft) {
      const recovery = scenarioRunner.applyRecovery(
        skillDraftHook.draft.scenarioId,
        content,
        skillDraftHook.draft,
      );
      if (recovery) {
        skillDraftHook.applyPatch(recovery.patch);
        setTimeout(() => {
          pushAgentText(recovery.acknowledgement);
          const id = skillDraftHook.draft?.id;
          if (id) pushSkillDraftCard(id);
          setIsLoading(false);
        }, 300);
        return;
      }
    }

    // 6) CAPTURING 단계 진행 — 활성 드래프트가 있으면 사용자 입력을 6항목에 매핑
    if (
      skillDraftHook.draft &&
      skillDraftHook.draft.status === 'CAPTURING'
    ) {
      const result = scenarioRunner.advance(content, skillDraftHook.draft);
      // 6항목이 모두 채워진 후 추가 발화는 안내만 보냄 (빈 메시지 방지)
      if (result.isCaptureComplete && !result.nextAgentMessage) {
        setTimeout(() => {
          pushAgentText(
            '6항목 캡처가 끝났어요. "이대로 진행해줘" 라고 말씀하시면 자동 평가를 시작할게요.',
          );
          const id = skillDraftHook.draft?.id;
          if (id) pushSkillDraftCard(id);
          setIsLoading(false);
        }, 300);
        return;
      }
      skillDraftHook.applyPatch(result.patch);
      setTimeout(() => {
        pushAgentText(result.nextAgentMessage);
        const id = skillDraftHook.draft?.id;
        if (id) pushSkillDraftCard(id);
        setIsLoading(false);
      }, 300);
      return;
    }

    // ---------- 기존 차트/대시보드 분기 ----------

    // Try Dashboard query first, then single chart
    if (isDashboardQuery(content)) {
      clearChart(); // Clear previous chart to prevent state masking
      const dashResult = processDashboardQuery(content);
      if (dashResult) {
        const dashArtifact: Artifact = {
          id: `dashboard-${Date.now()}`,
          title: dashResult.dashboardConfig.title,
          type: 'chart',
          createdAt: new Date(),
          messageId: userMessage.id,
        };

        setChartArtifacts((prev) => [...prev, dashArtifact]);

        setTimeout(() => {
          const assistantMessage: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            type: 'assistant',
            content: `📊 **${dashResult.dashboardConfig.title}**\n\n${dashResult.reasoning}\n\n대시보드 패널에서 ${dashResult.dashboardConfig.widgets.length}개 위젯을 확인하세요.`,
            timestamp: new Date(),
          };
          addMessage(assistantMessage);
          setIsLoading(false);

          artifactPanelRef.current?.openArtifactTab(dashArtifact, 'dashboard');
          setIsCenterPanelOpen(true);
        }, 1000);

        return;
      }
    }

    // Try NL-to-Chart
    clearDashboard(); // Clear previous dashboard to prevent state masking
    const result = processQuery(content);

    if (result) {
      const chartArtifact: Artifact = {
        id: `chart-${Date.now()}`,
        title: result.config.title,
        type: 'chart',
        createdAt: new Date(),
        messageId: userMessage.id,
      };

      setChartArtifacts((prev) => [...prev, chartArtifact]);

      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          type: 'assistant',
          content: `📊 **${result.config.title}**\n\n${result.reasoning}\n\n차트 패널에서 결과를 확인하세요. 차트 상단에서 다른 차트 유형으로 변경할 수 있습니다.`,
          timestamp: new Date(),
        };
        addMessage(assistantMessage);
        setIsLoading(false);

        artifactPanelRef.current?.openArtifactTab(chartArtifact, 'chart');
        setIsCenterPanelOpen(true);
      }, 800);
    } else {
      // Non-chart query — standard response
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          type: 'assistant',
          content:
            '안녕하세요! 질문에 대해 분석을 시작하겠습니다. 잠시만 기다려 주세요.\n\n현재 데모 모드로 실행 중입니다. 실제 AI 응답은 백엔드 연동 후 제공됩니다.\n\n💡 **팁**: "월별 매출 추이 보여줘", "사업부별 비교 차트" 같은 데이터 분석 질문을 입력하면 차트를 자동 생성합니다.\n\n📋 **대시보드**: "종합 현황 대시보드", "심층 분석 대시보드" 같은 질문으로 멀티 위젯 대시보드를 생성할 수 있습니다.',
          timestamp: new Date(),
        };
        addMessage(assistantMessage);
        setIsLoading(false);
      }, 1500);
    }
  }, [
    inputValue,
    isLoading,
    attachedFile,
    processQuery,
    processDashboardQuery,
    clearChart,
    clearDashboard,
    addMessage,
    activeSessionId,
    intentDetection,
    skillDraftHook,
    scenarioRunner,
    pushAgentText,
    pushSkillDraftCard,
    openSkillDraftPanel,
    runSkillEval,
    handleSkillDiscard,
    handleSkillSave,
  ]);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleValidationError = useCallback((message: string) => {
    showToast({ type: 'error', title: '파일 첨부 오류', message });
  }, [showToast]);

  // Left Panel (Chat History Sidebar + Chat Messages)
  const leftPanelContent = (
    <div className="flex h-full">
      {/* Left Sidebar */}
      <LeftSidebar
        isCollapsed={isLeftSidebarCollapsed}
        onToggleCollapse={handleToggleLeftSidebar}
        sessions={MOCK_SESSIONS}
        activeSessionId={activeSessionId}
        onSessionSelect={handleSessionSelect}
        onNewChat={handleNewChat}
        branches={branches}
        activeBranchId={activeBranchId}
        onSwitchBranch={switchBranch}
        onDeleteBranch={deleteBranch}
      />
      {/* Chat Panel */}
      <div className="flex-1 flex flex-col bg-[#F7F9FB]">
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onSend={handleSend}
          selectedModelId={selectedModelId}
          onModelChange={setSelectedModelId}
          onValidationError={handleValidationError}
          onCreateBranch={createBranch}
          onSwitchBranch={switchBranch}
          onDeleteBranch={deleteBranch}
          getBranchesAtMessage={getBranchesAtMessage}
          activeBranchId={activeBranchId}
          getDraftById={getDraftById}
          onOpenSkillDraft={openSkillDraftPanel}
        />
      </div>
    </div>
  );

  // Center Panel (Artifact Preview for charts/dashboards)
  const dashboardComponent = dashboardResult ? (
    <NLDashboardRenderer
      dashboardConfig={dashboardResult.dashboardConfig}
      onChangeWidgetChartType={changeWidgetChartType}
    />
  ) : chartResult ? (
    <NLChartRenderer
      result={chartResult}
      onChangeChartType={changeChartType}
    />
  ) : undefined;

  const centerPanelContent = isCenterPanelOpen ? (
    <ArtifactPreviewPanel
      onClose={handleCloseCenterPanel}
      dashboardRendererProps={{
        dashboardComponent,
      }}
    />
  ) : null;

  // Input Area (only shown when there are messages)
  const inputArea = isEmptyState ? null : (
    <UnifiedChatInput
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onSend={handleSend}
      textareaRef={textareaRef}
      disabled={isLoading}
      showModelSwitcher
      selectedModelId={selectedModelId}
      onModelChange={setSelectedModelId}
      onValidationError={handleValidationError}
    />
  );

  // Right Panel
  const rightPanel = (
    <RightSidebar
      isCollapsed={isRightSidebarCollapsed}
      expandedSections={expandedSections}
      onToggleSection={handleToggleSection}
      onToggleCollapse={handleToggleRightSidebar}
      tasks={tasks}
      artifacts={chartArtifacts}
      selectedArtifactId={undefined}
      onArtifactSelect={(artifact) => {
        const previewType: ArtifactPreviewType = artifact.id.startsWith('dashboard-') ? 'dashboard' : 'chart';
        artifactPanelRef.current?.openArtifactTab(artifact, previewType);
        setIsCenterPanelOpen(true);
      }}
      onArtifactDownload={() => {}}
      contextItems={contextItems}
    />
  );

  return (
    <ArtifactPanelProvider
      markdownContents={{}}
      markdownEditingState="idle"
      skillDraft={skillDraftHook.draft}
      skillDraftHandlers={{ onSave: handleSkillSave, onDiscard: handleSkillDiscard }}
      onPanelOpenChange={(isOpen) => {
        if (!isOpen) setIsCenterPanelOpen(false);
      }}
    >
      <ArtifactPanelBridge bridgeRef={artifactPanelRef} />
      <div className="w-full h-full">
        <CoworkLayout
          leftPanel={leftPanelContent}
          centerPanel={centerPanelContent}
          isCenterPanelOpen={isCenterPanelOpen}
          rightPanel={rightPanel}
          isRightPanelCollapsed={isRightSidebarCollapsed}
          inputArea={inputArea}
        />
      </div>
    </ArtifactPanelProvider>
  );
};

export default GeneralChatView;
