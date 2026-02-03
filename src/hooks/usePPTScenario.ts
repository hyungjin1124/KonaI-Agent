import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  ScenarioMessage,
  ToolStatus,
  ToolType,
  DataValidationSummary,
  ProgressTask,
  TaskGroup,
  RenderSegment,
  GroupExpandState,
} from '../components/features/agent-chat/types';
import {
  PPT_SCENARIO_STEPS,
  DEFAULT_VALIDATION_DATA,
  createScenarioMessage,
} from '../components/features/agent-chat/scenarios/pptScenario';
import {
  DEFAULT_DATA_SOURCE_OPTIONS,
  TOOL_METADATA,
  HITL_QUESTIONS,
  HITL_OPTIONS,
} from '../components/features/agent-chat/components/ToolCall/constants';
import { PPTConfig, HitlOption } from '../types';

// stepId → toolType 매핑 (수정 2: 동적 그룹 라벨 생성용)
const STEP_TO_TOOL_TYPE: Record<string, ToolType> = {
  tool_planning: 'deep_thinking',
  tool_data_source: 'data_source_select',
  tool_erp_connect: 'erp_connect',
  tool_parallel_query: 'parallel_data_query',
  tool_data_query_1: 'data_query',
  tool_data_query_2: 'data_query',
  tool_data_query_3: 'data_query',
  tool_data_query_4: 'data_query',
  tool_data_validation: 'data_validation',
  tool_ppt_setup: 'ppt_setup',
  tool_web_search: 'web_search',
  tool_slide_planning: 'slide_planning',
  tool_slide_generation: 'slide_generation',
  tool_completion: 'completion',
};

// 그룹 라벨 동적 생성 함수 (수정 2: 내부 도구명 조합)
const generateGroupLabel = (stepIds: string[]): string => {
  const uniqueLabels: string[] = [];
  const seenToolTypes = new Set<ToolType>();

  for (const stepId of stepIds) {
    const toolType = STEP_TO_TOOL_TYPE[stepId];
    if (toolType && !seenToolTypes.has(toolType)) {
      seenToolTypes.add(toolType);
      const label = TOOL_METADATA[toolType]?.label;
      if (label) uniqueLabels.push(label);
    }
  }

  if (uniqueLabels.length === 0) return '작업';
  if (uniqueLabels.length === 1) return uniqueLabels[0];
  if (uniqueLabels.length === 2) return uniqueLabels.join(' 및 ');
  // 3개 이상: 처음과 마지막만 표시
  return `${uniqueLabels[0]} 및 ${uniqueLabels[uniqueLabels.length - 1]}`;
};

// Progress 태스크 그룹 정의 (시나리오 단계 → 진행 상황 매핑)
const PROGRESS_TASK_GROUPS = [
  { id: 'planning', label: '작업 계획 수립', stepIds: ['agent_greeting', 'tool_planning'] },
  { id: 'data_source', label: '데이터 소스 선택', stepIds: ['tool_data_source', 'agent_data_source_confirm'] },
  { id: 'data_query', label: '데이터 조회', stepIds: ['tool_erp_connect', 'tool_parallel_query', 'tool_data_query_1', 'tool_data_query_2', 'tool_data_query_3', 'tool_data_query_4'] },
  { id: 'data_validation', label: '데이터 검증', stepIds: ['tool_data_validation', 'agent_validation_confirm'] },
  { id: 'ppt_setup', label: 'PPT 설정', stepIds: ['tool_ppt_setup', 'agent_setup_confirm'] },
  { id: 'slide_generation', label: '슬라이드 생성', stepIds: ['tool_web_search', 'tool_slide_planning', 'tool_slide_generation'] },
  { id: 'completion', label: '완료', stepIds: ['tool_completion', 'agent_final'] },
];

// 렌더링용 작업 그룹 (외부 아코디언 단위 - Claude Cowork 스타일)
const RENDER_TASK_GROUPS: TaskGroup[] = [
  {
    id: 'data_source_selection',
    label: '데이터 소스 선택',
    toolStepIds: ['tool_planning', 'tool_data_source'],
    followingTextStepId: 'agent_data_source_confirm',  // 데이터 소스 선택 직후 텍스트
  },
  {
    id: 'data_collection',
    label: '데이터 수집',
    toolStepIds: ['tool_erp_connect', 'tool_parallel_query', 'tool_data_query_1', 'tool_data_query_2', 'tool_data_query_3', 'tool_data_query_4'],
    // followingTextStepId 없음 - 텍스트 없이 다음 그룹으로
  },
  {
    id: 'data_validation',
    label: '데이터 검증',
    toolStepIds: ['tool_data_validation'],
    followingTextStepId: 'agent_validation_confirm',
  },
  {
    id: 'ppt_generation',
    label: 'PPT 생성',
    toolStepIds: ['tool_ppt_setup', 'tool_web_search', 'tool_slide_planning', 'tool_slide_generation', 'tool_completion'],
    followingTextStepId: 'agent_final',
  },
];

interface UsePPTScenarioOptions {
  onStepStart?: (stepId: string) => void;
  onStepComplete?: (stepId: string) => void;
  onHitlRequired?: (stepId: string, toolType: string) => void;
  onScenarioComplete?: () => void;
  pptConfig?: PPTConfig;
  onPptConfigUpdate?: <K extends keyof PPTConfig>(key: K, value: PPTConfig[K]) => void;
}

// 수정 3: HITL 플로팅 패널용 상태 타입
interface ActiveHitl {
  stepId: string;
  toolType: ToolType;
  question: string;
  options: HitlOption[];
}

interface UsePPTScenarioReturn {
  messages: ScenarioMessage[];
  currentStepId: string | null;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;

  // 상태 데이터
  selectedDataSource: string | null;
  validationData: DataValidationSummary;
  completedStepIds: Set<string>; // 완료된 단계 ID 추적

  // Progress 동기화용 데이터
  progressTasks: ProgressTask[];

  // 수정 3: HITL 플로팅 패널 상태
  activeHitl: ActiveHitl | null;

  // Actions
  startScenario: () => void;
  resumeWithHitlSelection: (stepId: string, selectedOption: string) => void;
  confirmValidation: () => void;
  completePptSetup: () => void;
  completeSlideGeneration: () => void; // PPTGenPanel 완료 시 호출
  pauseScenario: () => void;
  resetScenario: () => void;

  // 메시지 토글 (아코디언 방식)
  toggleMessageExpand: (messageId: string) => void;
  activeToolMessageId: string | null;
  isMessageExpanded: (messageId: string) => boolean;

  // 외부 아코디언 (그룹) 상태 - Claude Cowork 스타일
  groupExpandState: GroupExpandState;
  toggleGroup: (groupId: string) => void;
  renderSegments: RenderSegment[];
}

export function usePPTScenario(options: UsePPTScenarioOptions = {}): UsePPTScenarioReturn {
  const {
    onStepStart,
    onStepComplete,
    onHitlRequired,
    onScenarioComplete,
  } = options;

  // 상태
  const [messages, setMessages] = useState<ScenarioMessage[]>([]);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // HITL 관련 상태
  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(null);
  const [validationData] = useState<DataValidationSummary>(DEFAULT_VALIDATION_DATA);

  // 수정 3: HITL 플로팅 패널 상태
  const [activeHitl, setActiveHitl] = useState<ActiveHitl | null>(null);

  // 완료된 단계 ID 추적
  const [completedStepIds, setCompletedStepIds] = useState<Set<string>>(new Set());

  // 현재 활성화된 도구 메시지 ID (아코디언 방식 - 하나만 펼쳐짐)
  const [activeToolMessageId, setActiveToolMessageId] = useState<string | null>(null);

  // 외부 아코디언(그룹) 펼침 상태 - 그룹별 독립 관리
  const [groupExpandState, setGroupExpandState] = useState<GroupExpandState>({
    data_source_selection: true,
    data_collection: true,
    data_validation: true,
    ppt_generation: true,
  });

  // 타이머 ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepIndexRef = useRef(0);

  // 이미 자동 접힘이 완료된 그룹 추적 (무한 루프 방지)
  const autoCollapsedGroupsRef = useRef<Set<string>>(new Set());

  // Progress 태스크 계산 (completedStepIds, currentStepId 기반)
  // 수정 1: 계획 수립(tool_planning) 완료 후에만 Progress Todo 표시
  const progressTasks = useMemo((): ProgressTask[] => {
    // 계획 수립이 완료되지 않았으면 빈 배열 반환
    const isPlanningComplete = completedStepIds.has('tool_planning');
    if (!isPlanningComplete) {
      return [];
    }

    return PROGRESS_TASK_GROUPS.map(group => {
      const allCompleted = group.stepIds.every(id => completedStepIds.has(id));
      const anyRunning = group.stepIds.includes(currentStepId || '');
      const someCompleted = group.stepIds.some(id => completedStepIds.has(id));

      let status: 'pending' | 'running' | 'completed' | 'error' = 'pending';
      let progress: number | undefined;

      if (allCompleted) {
        status = 'completed';
        progress = 100;
      } else if (anyRunning || someCompleted) {
        status = 'running';
        // 부분 진행률 계산
        const completedCount = group.stepIds.filter(id => completedStepIds.has(id)).length;
        progress = Math.round((completedCount / group.stepIds.length) * 100);
      }

      return {
        id: group.id,
        label: group.label,
        status,
        progress,
      };
    });
  }, [completedStepIds, currentStepId]);

  // 메시지 토글 (아코디언 방식)
  const toggleMessageExpand = useCallback((messageId: string) => {
    setActiveToolMessageId(prev => prev === messageId ? null : messageId);
  }, []);

  // 펼침 상태 확인 헬퍼
  const isMessageExpanded = useCallback((messageId: string) => {
    return activeToolMessageId === messageId;
  }, [activeToolMessageId]);

  // 외부 아코디언(그룹) 토글 - 그룹별
  const toggleGroup = useCallback((groupId: string) => {
    setGroupExpandState(prev => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  }, []);

  // 단계 실행
  const executeStep = useCallback((stepIndex: number) => {
    if (stepIndex >= PPT_SCENARIO_STEPS.length) {
      setIsComplete(true);
      setIsRunning(false);
      setActiveToolMessageId(null); // 시나리오 완료 시 모든 도구 접기
      // 시나리오 완료 시 모든 그룹 접기
      setGroupExpandState({
        data_source_selection: false,
        data_collection: false,
        data_validation: false,
        ppt_generation: false,
      });
      onScenarioComplete?.();
      return;
    }

    const step = PPT_SCENARIO_STEPS[stepIndex];
    setCurrentStepId(step.id);
    onStepStart?.(step.id);

    // 메시지 생성
    let newMessage: ScenarioMessage;

    if (step.type === 'tool-call' && step.toolType) {
      // 도구 호출 메시지
      const initialStatus: ToolStatus = step.isHitl ? 'running' : 'running';

      // data_query 단계별 queryId 매핑
      const dataQueryIdMap: Record<string, string> = {
        'tool_data_query_1': 'income_statement',
        'tool_data_query_2': 'division_performance',
        'tool_data_query_3': 'production_kpi',
        'tool_data_query_4': 'customer_analysis',
      };

      const queryInput = dataQueryIdMap[step.id] ? { queryId: dataQueryIdMap[step.id] } : undefined;

      newMessage = createScenarioMessage(step, initialStatus, {
        hitlOptions: step.toolType === 'data_source_select' ? DEFAULT_DATA_SOURCE_OPTIONS : undefined,
        input: queryInput,
      });

      setMessages(prev => [...prev, newMessage]);
      // 자동 펼침 제거 - 사용자가 클릭해야만 펼침

      // HITL 단계인 경우 일시 중지 및 플로팅 패널 활성화
      if (step.isHitl) {
        // 현재 단계 인덱스를 명시적으로 기록 (HITL 완료 시 참조)
        stepIndexRef.current = stepIndex;
        setIsPaused(true);
        // 수정 3: HITL 플로팅 패널 활성화
        setActiveHitl({
          stepId: step.id,
          toolType: step.toolType,
          question: HITL_QUESTIONS[step.toolType] || '옵션을 선택해 주세요.',
          options: HITL_OPTIONS[step.toolType] || DEFAULT_DATA_SOURCE_OPTIONS,
        });
        onHitlRequired?.(step.id, step.toolType);
        return;
      }

      // 비동기 도구 (slide_generation 등) - 외부 완료 신호 대기
      if (step.isAsyncTool) {
        // 현재 단계 인덱스를 명시적으로 기록 (completeSlideGeneration에서 참조)
        stepIndexRef.current = stepIndex;
        setIsPaused(true);
        // 초기 상태만 표시하고 대기 (completeSlideGeneration 호출 시 재개)
        return;
      }

      // 일반 도구 호출은 지연 후 완료
      timerRef.current = setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === newMessage.id
              ? { ...msg, toolStatus: 'completed' as ToolStatus }
              : msg
          )
        );
        // 완료된 단계 추가
        setCompletedStepIds(prev => new Set([...prev, step.id]));
        onStepComplete?.(step.id);
        stepIndexRef.current = stepIndex + 1;

        // 다음 단계의 의존성 확인
        const nextStep = PPT_SCENARIO_STEPS[stepIndex + 1];
        const hasDependency = nextStep?.dependsOn === step.id;

        if (hasDependency) {
          // 의존성이 있으면 현재 도구 완료 후 500ms 지연
          timerRef.current = setTimeout(() => {
            executeStep(stepIndex + 1);
          }, 500);
        } else {
          // 의존성이 없으면 즉시 실행
          executeStep(stepIndex + 1);
        }
      }, step.delayMs || 1000);
    } else {
      // 에이전트 텍스트 메시지
      newMessage = createScenarioMessage(step);
      setMessages(prev => [...prev, newMessage]);

      // 지연 후 다음 단계
      timerRef.current = setTimeout(() => {
        // 완료된 단계 추가
        setCompletedStepIds(prev => new Set([...prev, step.id]));
        onStepComplete?.(step.id);
        stepIndexRef.current = stepIndex + 1;

        // 다음 단계의 의존성 확인
        const nextStep = PPT_SCENARIO_STEPS[stepIndex + 1];
        const hasDependency = nextStep?.dependsOn === step.id;

        if (hasDependency) {
          // 의존성이 있으면 현재 단계 완료 후 500ms 지연
          timerRef.current = setTimeout(() => {
            executeStep(stepIndex + 1);
          }, 500);
        } else {
          // 의존성이 없으면 즉시 실행
          executeStep(stepIndex + 1);
        }
      }, step.delayMs || 500);
    }
  }, [onStepStart, onStepComplete, onHitlRequired, onScenarioComplete]);

  // 시나리오 시작
  const startScenario = useCallback(() => {
    setMessages([]);
    setCurrentStepId(null);
    setIsRunning(true);
    setIsPaused(false);
    setIsComplete(false);
    setSelectedDataSource(null);
    setActiveToolMessageId(null);
    // 시나리오 시작 시 모든 그룹 펼치기
    setGroupExpandState({
      data_source_selection: true,
      data_collection: true,
      data_validation: true,
      ppt_generation: true,
    });
    // 자동 접힘 추적 초기화
    autoCollapsedGroupsRef.current.clear();
    stepIndexRef.current = 0;
    executeStep(0);
  }, [executeStep]);

  // HITL 선택 후 재개 (데이터 소스 선택, 데이터 검증, PPT 설정)
  const resumeWithHitlSelection = useCallback((stepId: string, selectedOption: string) => {
    // 수정 3: HITL 플로팅 패널 비활성화
    setActiveHitl(null);

    // data_validation 특수 처리 (confirm/modify)
    if (stepId === 'tool_data_validation') {
      if (selectedOption === 'confirm' || selectedOption === 'modify') {
        // 현재는 둘 다 동일하게 진행 (추후 modify시 수정 로직 추가 가능)
        confirmValidation();
      }
      return;
    }

    // ppt_setup 특수 처리 (completePptSetup 호출)
    if (stepId === 'tool_ppt_setup') {
      // ppt_setup은 onPptSetupComplete 콜백으로 처리됨
      completePptSetup();
      return;
    }

    // data_source_select 등 기타 HITL 처리
    setSelectedDataSource(selectedOption);

    // 현재 메시지 상태 업데이트
    setMessages(prev =>
      prev.map(msg =>
        msg.id.includes(stepId)
          ? {
              ...msg,
              toolStatus: 'completed' as ToolStatus,
              hitlSelectedOption: selectedOption,
            }
          : msg
      )
    );

    // 완료된 단계 추가
    setCompletedStepIds(prev => new Set([...prev, stepId]));
    setIsPaused(false);
    onStepComplete?.(stepId);

    // 다음 단계 실행
    const nextIndex = stepIndexRef.current + 1;
    stepIndexRef.current = nextIndex;
    executeStep(nextIndex);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executeStep, onStepComplete]);  // confirmValidation, completePptSetup 제거 - 순환 의존성 방지

  // 데이터 검증 확인
  const confirmValidation = useCallback(() => {
    const stepId = 'tool_data_validation';
    // 수정 3: HITL 플로팅 패널 비활성화
    setActiveHitl(null);

    setMessages(prev =>
      prev.map(msg =>
        msg.id.includes(stepId)
          ? { ...msg, toolStatus: 'completed' as ToolStatus }
          : msg
      )
    );

    // 완료된 단계 추가
    setCompletedStepIds(prev => new Set([...prev, stepId]));
    setIsPaused(false);
    onStepComplete?.(stepId);

    const nextIndex = stepIndexRef.current + 1;
    stepIndexRef.current = nextIndex;
    executeStep(nextIndex);
  }, [executeStep, onStepComplete]);

  // PPT 설정 완료
  const completePptSetup = useCallback(() => {
    const stepId = 'tool_ppt_setup';
    // 수정 3: HITL 플로팅 패널 비활성화
    setActiveHitl(null);

    setMessages(prev =>
      prev.map(msg =>
        msg.id.includes(stepId)
          ? { ...msg, toolStatus: 'completed' as ToolStatus }
          : msg
      )
    );

    // 완료된 단계 추가
    setCompletedStepIds(prev => new Set([...prev, stepId]));
    setIsPaused(false);
    onStepComplete?.(stepId);

    const nextIndex = stepIndexRef.current + 1;
    stepIndexRef.current = nextIndex;
    executeStep(nextIndex);
  }, [executeStep, onStepComplete]);

  // 슬라이드 생성 완료 (PPTGenPanel에서 모든 슬라이드 완료 시 호출)
  const completeSlideGeneration = useCallback(() => {
    const stepId = 'tool_slide_generation';

    setMessages(prev =>
      prev.map(msg =>
        msg.id.includes(stepId)
          ? { ...msg, toolStatus: 'completed' as ToolStatus }
          : msg
      )
    );

    // 완료된 단계 추가
    setCompletedStepIds(prev => new Set([...prev, stepId]));
    setIsPaused(false);
    onStepComplete?.(stepId);

    const nextIndex = stepIndexRef.current + 1;
    stepIndexRef.current = nextIndex;
    executeStep(nextIndex);
  }, [executeStep, onStepComplete]);

  // 시나리오 일시 중지
  const pauseScenario = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPaused(true);
  }, []);

  // 시나리오 리셋
  const resetScenario = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setMessages([]);
    setCurrentStepId(null);
    setIsRunning(false);
    setIsPaused(false);
    setIsComplete(false);
    setSelectedDataSource(null);
    setCompletedStepIds(new Set());
    setActiveToolMessageId(null);
    // 리셋 시 모든 그룹 펼침 상태로
    setGroupExpandState({
      data_source_selection: true,
      data_collection: true,
      data_validation: true,
      ppt_generation: true,
    });
    // 자동 접힘 추적 초기화
    autoCollapsedGroupsRef.current.clear();
    stepIndexRef.current = 0;
  }, []);

  // 그룹 완료 시 자동 접힘 (Claude Cowork 스타일)
  // 주의: groupExpandState 의존성 제거하여 무한 루프 방지
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    RENDER_TASK_GROUPS.forEach(group => {
      const allComplete = group.toolStepIds.every(id => completedStepIds.has(id));

      // 조건: 완료됨 + 아직 자동 접힘 안 함
      if (allComplete && !autoCollapsedGroupsRef.current.has(group.id)) {
        autoCollapsedGroupsRef.current.add(group.id); // 마킹

        // 800ms 딜레이 후 접힘 (결과 확인 시간)
        const timer = setTimeout(() => {
          setGroupExpandState(prev => ({ ...prev, [group.id]: false }));
        }, 800);
        timers.push(timer);
      }
    });

    return () => timers.forEach(t => clearTimeout(t));
  }, [completedStepIds]); // groupExpandState 제거!

  // 렌더링 세그먼트 계산 (그룹 → 텍스트 → 그룹 순서)
  // 수정 2: 동적 그룹 라벨 적용
  const renderSegments = useMemo((): RenderSegment[] => {
    const segments: RenderSegment[] = [];

    RENDER_TASK_GROUPS.forEach(group => {
      // 그룹에 해당하는 도구 메시지 필터링
      const groupMessages = messages.filter(
        msg => msg.type === 'tool-call' &&
               msg.toolType !== 'todo_update' &&
               group.toolStepIds.some(stepId => msg.id.includes(stepId))
      );

      if (groupMessages.length > 0) {
        // 동적 라벨 생성하여 그룹에 적용
        const dynamicLabel = generateGroupLabel(group.toolStepIds);
        segments.push({
          type: 'tool-group',
          group: { ...group, label: dynamicLabel },
          messages: groupMessages,
        });
      }

      // 후속 텍스트 메시지 (그룹 완료 후 표시)
      if (group.followingTextStepId) {
        const textMsg = messages.find(
          msg => msg.type === 'agent-text' &&
                 msg.id.includes(group.followingTextStepId!) &&
                 msg.content !== 'final'
        );
        if (textMsg) {
          segments.push({ type: 'text', message: textMsg });
        }
      }
    });

    return segments;
  }, [messages]);

  // 클린업
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    messages,
    currentStepId,
    isRunning,
    isPaused,
    isComplete,
    selectedDataSource,
    validationData,
    completedStepIds,
    progressTasks,
    // 수정 3: HITL 플로팅 패널 상태
    activeHitl,
    startScenario,
    resumeWithHitlSelection,
    confirmValidation,
    completePptSetup,
    completeSlideGeneration,
    pauseScenario,
    resetScenario,
    toggleMessageExpand,
    activeToolMessageId,
    isMessageExpanded,
    groupExpandState,
    toggleGroup,
    renderSegments,
  };
}

export default usePPTScenario;
