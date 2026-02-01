import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ScenarioMessage,
  ToolStatus,
  HitlOption,
  DataValidationSummary,
} from '../components/features/agent-chat/types';
import {
  PPT_SCENARIO_STEPS,
  DEFAULT_VALIDATION_DATA,
  findStepById,
  findNextStep,
  createScenarioMessage,
} from '../components/features/agent-chat/scenarios/pptScenario';
import { DEFAULT_DATA_SOURCE_OPTIONS, findTodoByStepId, SCENARIO_TODOS } from '../components/features/agent-chat/components/ToolCall/constants';
import { PPTConfig } from '../types';

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

  // Actions
  startScenario: () => void;
  resumeWithHitlSelection: (stepId: string, selectedOption: string) => void;
  confirmValidation: () => void;
  completePptSetup: () => void;
  completeSlideGeneration: () => void; // PPTGenPanel 완료 시 호출
  pauseScenario: () => void;
  resetScenario: () => void;

  // 메시지 토글
  toggleMessageExpand: (messageId: string) => void;
  expandedMessageIds: Set<string>;
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

  // 확장된 메시지 ID 추적
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<string>>(new Set());

  // 타이머 ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepIndexRef = useRef(0);

  // Task 완료 시 Todo 메시지 삽입 (마지막 step인 경우에만)
  const insertTodoUpdateIfTaskCompleted = useCallback((stepId: string, newCompletedStepIds: Set<string>) => {
    const todo = findTodoByStepId(stepId);
    if (!todo) return;

    // 이 stepId가 해당 Task의 마지막 step인지 확인
    const isLastStepOfTask = todo.stepIds[todo.stepIds.length - 1] === stepId;
    if (!isLastStepOfTask) return;

    // 해당 Task의 모든 step이 완료되었는지 확인
    const allStepsCompleted = todo.stepIds.every(id => newCompletedStepIds.has(id));
    if (!allStepsCompleted) return;

    // Todo 업데이트 메시지 삽입
    const todoMessage: ScenarioMessage = {
      id: `msg-todo-${todo.id}-${Date.now()}`,
      type: 'tool-call',
      timestamp: new Date(),
      toolType: 'todo_update',
      toolStatus: 'completed',
    };
    setMessages(prev => [...prev, todoMessage]);
    // 기본적으로 펼침 상태로 설정
    setExpandedMessageIds(prev => new Set([...prev, todoMessage.id]));
  }, []);

  // 메시지 토글
  const toggleMessageExpand = useCallback((messageId: string) => {
    setExpandedMessageIds(prev => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  }, []);

  // 단계 실행
  const executeStep = useCallback((stepIndex: number) => {
    if (stepIndex >= PPT_SCENARIO_STEPS.length) {
      setIsComplete(true);
      setIsRunning(false);
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
      // 새 도구 호출 메시지는 기본적으로 펼침
      setExpandedMessageIds(prev => new Set([...prev, newMessage.id]));

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
        setCompletedStepIds(prev => {
          const newSet = new Set([...prev, step.id]);
          // Task 완료 시 Todo 메시지 삽입
          insertTodoUpdateIfTaskCompleted(step.id, newSet);
          return newSet;
        });
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
  }, [onStepStart, onStepComplete, onHitlRequired, onScenarioComplete, insertTodoUpdateIfTaskCompleted]);

  // 시나리오 시작
  const startScenario = useCallback(() => {
    setMessages([]);
    setCurrentStepId(null);
    setIsRunning(true);
    setIsPaused(false);
    setIsComplete(false);
    setSelectedDataSource(null);
    setExpandedMessageIds(new Set());
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
    setCompletedStepIds(prev => {
      const newSet = new Set([...prev, stepId]);
      // Task 완료 시 Todo 메시지 삽입
      insertTodoUpdateIfTaskCompleted(stepId, newSet);
      return newSet;
    });
    setIsPaused(false);
    onStepComplete?.(stepId);

    // 다음 단계 실행
    const nextIndex = stepIndexRef.current + 1;
    stepIndexRef.current = nextIndex;
    executeStep(nextIndex);
  }, [executeStep, onStepComplete, insertTodoUpdateIfTaskCompleted]);

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
    setCompletedStepIds(prev => {
      const newSet = new Set([...prev, stepId]);
      // Task 완료 시 Todo 메시지 삽입
      insertTodoUpdateIfTaskCompleted(stepId, newSet);
      return newSet;
    });
    setIsPaused(false);
    onStepComplete?.(stepId);

    const nextIndex = stepIndexRef.current + 1;
    stepIndexRef.current = nextIndex;
    executeStep(nextIndex);
  }, [executeStep, onStepComplete, insertTodoUpdateIfTaskCompleted]);

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
    setCompletedStepIds(prev => {
      const newSet = new Set([...prev, stepId]);
      // Task 완료 시 Todo 메시지 삽입
      insertTodoUpdateIfTaskCompleted(stepId, newSet);
      return newSet;
    });
    setIsPaused(false);
    onStepComplete?.(stepId);

    const nextIndex = stepIndexRef.current + 1;
    stepIndexRef.current = nextIndex;
    executeStep(nextIndex);
  }, [executeStep, onStepComplete, insertTodoUpdateIfTaskCompleted]);

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
    setCompletedStepIds(prev => {
      const newSet = new Set([...prev, stepId]);
      // Task 완료 시 Todo 메시지 삽입
      insertTodoUpdateIfTaskCompleted(stepId, newSet);
      return newSet;
    });
    setIsPaused(false);
    onStepComplete?.(stepId);

    const nextIndex = stepIndexRef.current + 1;
    stepIndexRef.current = nextIndex;
    executeStep(nextIndex);
  }, [executeStep, onStepComplete, insertTodoUpdateIfTaskCompleted]);

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
    setExpandedMessageIds(new Set());
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
    startScenario,
    resumeWithHitlSelection,
    confirmValidation,
    completePptSetup,
    completeSlideGeneration,
    pauseScenario,
    resetScenario,
    toggleMessageExpand,
    expandedMessageIds,
  };
}

export default usePPTScenario;
