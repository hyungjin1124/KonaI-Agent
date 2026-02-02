import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  ScenarioMessage,
  ToolStatus,
  DataValidationSummary,
  ProgressTask,
} from '../components/features/agent-chat/types';
import {
  PPT_SCENARIO_STEPS,
  DEFAULT_VALIDATION_DATA,
  createScenarioMessage,
} from '../components/features/agent-chat/scenarios/pptScenario';
import { DEFAULT_DATA_SOURCE_OPTIONS } from '../components/features/agent-chat/components/ToolCall/constants';
import { PPTConfig } from '../types';

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

interface UsePPTScenarioOptions {
  onStepStart?: (stepId: string) => void;
  onStepComplete?: (stepId: string) => void;
  onHitlRequired?: (stepId: string, toolType: string) => void;
  onScenarioComplete?: () => void;
  pptConfig?: PPTConfig;
  onPptConfigUpdate?: <K extends keyof PPTConfig>(key: K, value: PPTConfig[K]) => void;
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

  // 외부 아코디언 (그룹) 상태
  isGroupExpanded: boolean;
  toggleGroup: () => void;
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

  // 완료된 단계 ID 추적
  const [completedStepIds, setCompletedStepIds] = useState<Set<string>>(new Set());

  // 현재 활성화된 도구 메시지 ID (아코디언 방식 - 하나만 펼쳐짐)
  const [activeToolMessageId, setActiveToolMessageId] = useState<string | null>(null);

  // 외부 아코디언(그룹) 펼침 상태
  const [isGroupExpanded, setIsGroupExpanded] = useState<boolean>(true);

  // 타이머 ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepIndexRef = useRef(0);

  // Progress 태스크 계산 (completedStepIds, currentStepId 기반)
  const progressTasks = useMemo((): ProgressTask[] => {
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

  // 외부 아코디언(그룹) 토글
  const toggleGroup = useCallback(() => {
    setIsGroupExpanded(prev => !prev);
  }, []);

  // 단계 실행
  const executeStep = useCallback((stepIndex: number) => {
    if (stepIndex >= PPT_SCENARIO_STEPS.length) {
      setIsComplete(true);
      setIsRunning(false);
      setActiveToolMessageId(null); // 시나리오 완료 시 모든 도구 접기
      setIsGroupExpanded(false); // 시나리오 완료 시 외부 아코디언 접기
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
      // 새 도구 호출 메시지를 활성화 (아코디언 - 하나만 펼침)
      setActiveToolMessageId(newMessage.id);

      // HITL 단계인 경우 일시 중지
      if (step.isHitl) {
        setIsPaused(true);
        onHitlRequired?.(step.id, step.toolType);
        return;
      }

      // 비동기 도구 (slide_generation 등) - 외부 완료 신호 대기
      if (step.isAsyncTool) {
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
    setIsGroupExpanded(true); // 시나리오 시작 시 외부 아코디언 펼치기
    stepIndexRef.current = 0;
    executeStep(0);
  }, [executeStep]);

  // HITL 선택 후 재개 (데이터 소스 선택)
  const resumeWithHitlSelection = useCallback((stepId: string, selectedOption: string) => {
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
  }, [executeStep, onStepComplete]);

  // 데이터 검증 확인
  const confirmValidation = useCallback(() => {
    const stepId = 'tool_data_validation';

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
    setIsGroupExpanded(true); // 리셋 시 외부 아코디언 펼침 상태로
    stepIndexRef.current = 0;
  }, []);

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
    isGroupExpanded,
    toggleGroup,
  };
}

export default usePPTScenario;
