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
  SALES_ANALYSIS_SCENARIO_STEPS,
  SALES_ANALYSIS_PROGRESS_TASK_GROUPS,
  SALES_ANALYSIS_RENDER_TASK_GROUPS,
  DEFAULT_ANALYSIS_VALIDATION_DATA,
  DEFAULT_ANALYSIS_SCOPE_DATA,
  DEFAULT_DATA_VERIFICATION_DATA,
  createScenarioMessage,
} from '../components/features/agent-chat/scenarios/salesAnalysisScenario';
import {
  AnalysisScopeData,
  DataVerificationData,
} from '../components/features/agent-chat/components/HITLFloatingPanel';
import {
  DEFAULT_DATA_SOURCE_OPTIONS,
  TOOL_METADATA,
  HITL_QUESTIONS,
  HITL_OPTIONS,
} from '../components/features/agent-chat/components/ToolCall/constants';
import { HitlOption } from '../types';

// stepId → toolType 매핑 (동적 그룹 라벨 생성용) - 신규 시나리오
const STEP_TO_TOOL_TYPE: Record<string, ToolType> = {
  // Phase 1: 분석 준비
  tool_request_analysis: 'request_analysis',
  tool_analysis_scope_confirm: 'analysis_scope_confirm',
  tool_data_source_connect: 'data_source_connect',
  // Phase 2: 데이터 수집
  tool_financial_data_collection: 'financial_data_collection',
  tool_division_data_collection: 'division_data_collection',
  tool_operation_data_collection: 'operation_data_collection',
  // Phase 3: 데이터 분석
  tool_revenue_driver_analysis: 'revenue_driver_analysis',
  tool_profitability_analysis: 'profitability_analysis',
  tool_anomaly_detection: 'anomaly_detection',
  tool_data_verification: 'data_verification',
  // Phase 4: 인사이트 도출
  tool_key_insight_generation: 'key_insight_generation',
  tool_visualization_generation: 'visualization_generation',
  // Phase 5: 결과 정리
  tool_analysis_completion: 'analysis_completion',
};

// 그룹 라벨 동적 생성 함수
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

interface UseSalesAnalysisScenarioOptions {
  onStepStart?: (stepId: string) => void;
  onStepComplete?: (stepId: string) => void;
  onHitlRequired?: (stepId: string, toolType: string) => void;
  onScenarioComplete?: () => void;
  onVisualizationStart?: () => void; // 시각화 시작 시 대시보드 오픈용
}

// HITL 플로팅 패널용 상태 타입
interface ActiveHitl {
  stepId: string;
  toolType: ToolType;
  question: string;
  options: HitlOption[];
}

interface UseSalesAnalysisScenarioReturn {
  messages: ScenarioMessage[];
  currentStepId: string | null;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;

  // 상태 데이터
  selectedDataSource: string | null;
  validationData: DataValidationSummary;
  completedStepIds: Set<string>;
  isVisualizationComplete: boolean; // Skeleton 제어용

  // 매출 분석 시나리오 HITL 데이터
  analysisScopeData: AnalysisScopeData;
  dataVerificationData: DataVerificationData;

  // Progress 동기화용 데이터
  progressTasks: ProgressTask[];

  // HITL 플로팅 패널 상태
  activeHitl: ActiveHitl | null;

  // Actions
  startScenario: () => void;
  resumeWithHitlSelection: (stepId: string, selectedOption: string) => void;
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

export function useSalesAnalysisScenario(options: UseSalesAnalysisScenarioOptions = {}): UseSalesAnalysisScenarioReturn {
  const {
    onStepStart,
    onStepComplete,
    onHitlRequired,
    onScenarioComplete,
    onVisualizationStart,
  } = options;

  // 상태
  const [messages, setMessages] = useState<ScenarioMessage[]>([]);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // HITL 관련 상태
  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(null);
  const [validationData] = useState<DataValidationSummary>(DEFAULT_ANALYSIS_VALIDATION_DATA);

  // 매출 분석 시나리오 HITL 데이터
  const [analysisScopeData] = useState<AnalysisScopeData>(DEFAULT_ANALYSIS_SCOPE_DATA);
  const [dataVerificationData] = useState<DataVerificationData>(DEFAULT_DATA_VERIFICATION_DATA);

  // HITL 플로팅 패널 상태
  const [activeHitl, setActiveHitl] = useState<ActiveHitl | null>(null);

  // 완료된 단계 ID 추적
  const [completedStepIds, setCompletedStepIds] = useState<Set<string>>(new Set());

  // 시각화 완료 상태 (Skeleton 제어용)
  const [isVisualizationComplete, setIsVisualizationComplete] = useState(false);

  // 현재 활성화된 도구 메시지 ID (아코디언 방식 - 하나만 펼쳐짐)
  const [activeToolMessageId, setActiveToolMessageId] = useState<string | null>(null);

  // 외부 아코디언(그룹) 펼침 상태 - 그룹별 독립 관리 (기본 접힘) - 신규 시나리오 그룹 ID
  const [groupExpandState, setGroupExpandState] = useState<GroupExpandState>({
    analysis_preparation: false,
    data_collection: false,
    data_analysis: false,
    insight_generation: false,
    completion: false,
  });

  // 타이머 ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepIndexRef = useRef(0);

  // 이미 자동 접힘이 완료된 그룹 추적 (무한 루프 방지)
  const autoCollapsedGroupsRef = useRef<Set<string>>(new Set());

  // Progress 태스크 계산 (completedStepIds, currentStepId 기반)
  const progressTasks = useMemo((): ProgressTask[] => {
    // 요청 분석이 완료되지 않았으면 빈 배열 반환
    const isRequestAnalysisComplete = completedStepIds.has('tool_request_analysis');
    if (!isRequestAnalysisComplete) {
      return [];
    }

    return SALES_ANALYSIS_PROGRESS_TASK_GROUPS.map(group => {
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
    if (stepIndex >= SALES_ANALYSIS_SCENARIO_STEPS.length) {
      setIsComplete(true);
      setIsRunning(false);
      setActiveToolMessageId(null);
      // 시나리오 완료 시 모든 그룹 접기 - 신규 시나리오 그룹 ID
      setGroupExpandState({
        analysis_preparation: false,
        data_collection: false,
        data_analysis: false,
        insight_generation: false,
        completion: false,
      });
      onScenarioComplete?.();
      return;
    }

    const step = SALES_ANALYSIS_SCENARIO_STEPS[stepIndex];
    setCurrentStepId(step.id);
    onStepStart?.(step.id);

    // 시각화 생성 단계 시작 시 콜백 호출
    if (step.id === 'tool_visualization_generation') {
      onVisualizationStart?.();
    }

    // 메시지 생성
    let newMessage: ScenarioMessage;

    if (step.type === 'tool-call' && step.toolType) {
      // 도구 호출 메시지
      const initialStatus: ToolStatus = step.isHitl ? 'running' : 'running';

      newMessage = createScenarioMessage(step, initialStatus, {
        hitlOptions: step.toolType === 'data_source_select' ? DEFAULT_DATA_SOURCE_OPTIONS : undefined,
      });

      setMessages(prev => [...prev, newMessage]);

      // HITL 단계인 경우 일시 중지 및 플로팅 패널 활성화
      if (step.isHitl) {
        stepIndexRef.current = stepIndex;
        setIsPaused(true);
        setActiveHitl({
          stepId: step.id,
          toolType: step.toolType,
          question: HITL_QUESTIONS[step.toolType] || '옵션을 선택해 주세요.',
          options: HITL_OPTIONS[step.toolType] || DEFAULT_DATA_SOURCE_OPTIONS,
        });
        onHitlRequired?.(step.id, step.toolType);
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

        // 시각화 생성 완료 시 상태 업데이트
        if (step.id === 'tool_visualization_generation') {
          setIsVisualizationComplete(true);
        }

        // 완료된 단계 추가
        setCompletedStepIds(prev => new Set([...prev, step.id]));
        onStepComplete?.(step.id);
        stepIndexRef.current = stepIndex + 1;

        // 다음 단계의 의존성 확인
        const nextStep = SALES_ANALYSIS_SCENARIO_STEPS[stepIndex + 1];
        const hasDependency = nextStep?.dependsOn === step.id;

        if (hasDependency) {
          timerRef.current = setTimeout(() => {
            executeStep(stepIndex + 1);
          }, 500);
        } else {
          executeStep(stepIndex + 1);
        }
      }, step.delayMs || 1000);
    } else {
      // 에이전트 텍스트 메시지
      newMessage = createScenarioMessage(step);
      setMessages(prev => [...prev, newMessage]);

      // 지연 후 다음 단계
      timerRef.current = setTimeout(() => {
        setCompletedStepIds(prev => new Set([...prev, step.id]));
        onStepComplete?.(step.id);
        stepIndexRef.current = stepIndex + 1;

        const nextStep = SALES_ANALYSIS_SCENARIO_STEPS[stepIndex + 1];
        const hasDependency = nextStep?.dependsOn === step.id;

        if (hasDependency) {
          timerRef.current = setTimeout(() => {
            executeStep(stepIndex + 1);
          }, 500);
        } else {
          executeStep(stepIndex + 1);
        }
      }, step.delayMs || 500);
    }
  }, [onStepStart, onStepComplete, onHitlRequired, onScenarioComplete, onVisualizationStart]);

  // 시나리오 시작
  const startScenario = useCallback(() => {
    setMessages([]);
    setCurrentStepId(null);
    setIsRunning(true);
    setIsPaused(false);
    setIsComplete(false);
    setSelectedDataSource(null);
    setActiveToolMessageId(null);
    setIsVisualizationComplete(false);
    setGroupExpandState({
      analysis_preparation: false,
      data_collection: false,
      data_analysis: false,
      insight_generation: false,
      completion: false,
    });
    autoCollapsedGroupsRef.current.clear();
    stepIndexRef.current = 0;
    executeStep(0);
  }, [executeStep]);

  // HITL 선택 후 재개
  const resumeWithHitlSelection = useCallback((stepId: string, selectedOption: string) => {
    setActiveHitl(null);

    // data_source_select 처리
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
    setIsVisualizationComplete(false);
    setGroupExpandState({
      analysis_preparation: false,
      data_collection: false,
      data_analysis: false,
      insight_generation: false,
      completion: false,
    });
    autoCollapsedGroupsRef.current.clear();
    stepIndexRef.current = 0;
  }, []);

  // 그룹 완료 시 자동 접힘 (Claude Cowork 스타일)
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    SALES_ANALYSIS_RENDER_TASK_GROUPS.forEach(group => {
      const allComplete = group.toolStepIds.every(id => completedStepIds.has(id));

      if (allComplete && !autoCollapsedGroupsRef.current.has(group.id)) {
        autoCollapsedGroupsRef.current.add(group.id);

        const timer = setTimeout(() => {
          setGroupExpandState(prev => ({ ...prev, [group.id]: false }));
        }, 800);
        timers.push(timer);
      }
    });

    return () => timers.forEach(t => clearTimeout(t));
  }, [completedStepIds]);

  // 렌더링 세그먼트 계산
  const renderSegments = useMemo((): RenderSegment[] => {
    const segments: RenderSegment[] = [];

    SALES_ANALYSIS_RENDER_TASK_GROUPS.forEach(group => {
      const groupMessages = messages.filter(
        msg => msg.type === 'tool-call' &&
               msg.toolType !== 'todo_update' &&
               group.toolStepIds.some(stepId => msg.id.includes(stepId))
      );

      if (groupMessages.length > 0) {
        const dynamicLabel = generateGroupLabel(group.toolStepIds);
        segments.push({
          type: 'tool-group',
          group: { ...group, label: dynamicLabel },
          messages: groupMessages,
        });
      }

      // 후속 텍스트 메시지
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
    isVisualizationComplete,
    analysisScopeData,
    dataVerificationData,
    progressTasks,
    activeHitl,
    startScenario,
    resumeWithHitlSelection,
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

export default useSalesAnalysisScenario;
