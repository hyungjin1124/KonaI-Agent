import { useState, useCallback } from 'react';
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
  HITL_QUESTIONS,
  HITL_OPTIONS,
} from '../components/features/agent-chat/components/ToolCall/constants';
import { HitlOption } from '../types';
import { useScenarioOrchestration, ActiveHitl } from './useScenarioOrchestration';

// stepId -> toolType mapping (for dynamic group label generation) - Sales Analysis scenario
const STEP_TO_TOOL_TYPE: Record<string, ToolType> = {
  // Phase 1: Analysis Preparation
  tool_request_analysis: 'request_analysis',
  tool_analysis_scope_confirm: 'analysis_scope_confirm',
  tool_data_source_connect: 'data_source_connect',
  // Phase 2: Data Collection
  tool_financial_data_collection: 'financial_data_collection',
  tool_division_data_collection: 'division_data_collection',
  tool_operation_data_collection: 'operation_data_collection',
  // Phase 3: Data Analysis
  tool_revenue_driver_analysis: 'revenue_driver_analysis',
  tool_profitability_analysis: 'profitability_analysis',
  tool_anomaly_detection: 'anomaly_detection',
  tool_data_verification: 'data_verification',
  // Phase 4: Insight Generation
  tool_key_insight_generation: 'key_insight_generation',
  tool_visualization_generation: 'visualization_generation',
  // Phase 5: Completion
  tool_analysis_completion: 'analysis_completion',
};

const INITIAL_GROUP_EXPAND_STATE: GroupExpandState = {
  analysis_preparation: false,
  data_collection: false,
  data_analysis: false,
  insight_generation: false,
  completion: false,
};

interface UseSalesAnalysisScenarioOptions {
  onStepStart?: (stepId: string) => void;
  onStepComplete?: (stepId: string) => void;
  onHitlRequired?: (stepId: string, toolType: string) => void;
  onScenarioComplete?: () => void;
  onVisualizationStart?: () => void; // Called when visualization starts to open dashboard
}

interface UseSalesAnalysisScenarioReturn {
  messages: ScenarioMessage[];
  currentStepId: string | null;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;

  // State data
  selectedDataSource: string | null;
  validationData: DataValidationSummary;
  completedStepIds: Set<string>;
  isVisualizationComplete: boolean; // For skeleton control

  // Sales analysis scenario HITL data
  analysisScopeData: AnalysisScopeData;
  dataVerificationData: DataVerificationData;

  // Progress sync data
  progressTasks: ProgressTask[];

  // HITL floating panel state
  activeHitl: ActiveHitl | null;

  // Actions
  startScenario: () => void;
  resumeWithHitlSelection: (stepId: string, selectedOption: string) => void;
  pauseScenario: () => void;
  resetScenario: () => void;

  // Message toggle (accordion style)
  toggleMessageExpand: (messageId: string) => void;
  activeToolMessageId: string | null;
  isMessageExpanded: (messageId: string) => boolean;

  // External accordion (group) state - Claude Cowork style
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

  // Use shared orchestration hook
  const orchestration = useScenarioOrchestration({
    progressTaskGroups: SALES_ANALYSIS_PROGRESS_TASK_GROUPS,
    renderTaskGroups: SALES_ANALYSIS_RENDER_TASK_GROUPS,
    stepToToolTypeMap: STEP_TO_TOOL_TYPE,
    firstCompletionStepId: 'tool_request_analysis',
    initialGroupExpandState: INITIAL_GROUP_EXPAND_STATE,
  });

  // Scenario-specific state
  const [validationData] = useState<DataValidationSummary>(DEFAULT_ANALYSIS_VALIDATION_DATA);
  const [analysisScopeData] = useState<AnalysisScopeData>(DEFAULT_ANALYSIS_SCOPE_DATA);
  const [dataVerificationData] = useState<DataVerificationData>(DEFAULT_DATA_VERIFICATION_DATA);
  const [isVisualizationComplete, setIsVisualizationComplete] = useState(false);

  // Destructure orchestration for convenience
  const {
    messages,
    currentStepId,
    isRunning,
    isPaused,
    isComplete,
    selectedDataSource,
    activeHitl,
    completedStepIds,
    activeToolMessageId,
    groupExpandState,
    setMessages,
    setCurrentStepId,
    setIsRunning,
    setIsPaused,
    setIsComplete,
    setSelectedDataSource,
    setActiveHitl,
    setCompletedStepIds,
    setActiveToolMessageId,
    setGroupExpandState,
    timerRef,
    stepIndexRef,
    autoCollapsedGroupsRef,
    progressTasks,
    renderSegments,
    toggleMessageExpand,
    isMessageExpanded,
    toggleGroup,
    pauseScenario,
    resetState,
  } = orchestration;

  // Execute step (scenario-specific)
  const executeStep = useCallback((stepIndex: number) => {
    if (stepIndex >= SALES_ANALYSIS_SCENARIO_STEPS.length) {
      setIsComplete(true);
      setIsRunning(false);
      setActiveToolMessageId(null);
      // Collapse all groups on scenario completion
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

    // Callback when visualization generation starts
    if (step.id === 'tool_visualization_generation') {
      onVisualizationStart?.();
    }

    // Create message
    let newMessage: ScenarioMessage;

    if (step.type === 'tool-call' && step.toolType) {
      // Tool call message
      const initialStatus: ToolStatus = step.isHitl ? 'running' : 'running';

      newMessage = createScenarioMessage(step, initialStatus, {
        hitlOptions: step.toolType === 'data_source_select' ? DEFAULT_DATA_SOURCE_OPTIONS : undefined,
      });

      setMessages(prev => [...prev, newMessage]);

      // HITL step: pause and activate floating panel
      if (step.isHitl) {
        stepIndexRef.current = stepIndex;
        setIsPaused(true);
        setActiveHitl({
          stepId: step.id,
          toolType: step.toolType,
          question: HITL_QUESTIONS[step.toolType] || '\uC635\uC158\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
          options: HITL_OPTIONS[step.toolType] || DEFAULT_DATA_SOURCE_OPTIONS,
        });
        onHitlRequired?.(step.id, step.toolType);
        return;
      }

      // Normal tool call: complete after delay
      timerRef.current = setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === newMessage.id
              ? { ...msg, toolStatus: 'completed' as ToolStatus }
              : msg
          )
        );

        // Update visualization complete state
        if (step.id === 'tool_visualization_generation') {
          setIsVisualizationComplete(true);
        }

        // Mark step as completed
        setCompletedStepIds(prev => new Set([...prev, step.id]));
        onStepComplete?.(step.id);
        stepIndexRef.current = stepIndex + 1;

        // Check next step dependency
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
      // Agent text message
      newMessage = createScenarioMessage(step);
      setMessages(prev => [...prev, newMessage]);

      // Delay then next step
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
  }, [onStepStart, onStepComplete, onHitlRequired, onScenarioComplete, onVisualizationStart,
      setMessages, setCurrentStepId, setIsRunning, setIsComplete, setIsPaused,
      setActiveHitl, setCompletedStepIds, setActiveToolMessageId, setGroupExpandState,
      timerRef, stepIndexRef]);

  // Start scenario
  const startScenario = useCallback(() => {
    resetState();
    setIsVisualizationComplete(false);
    setIsRunning(true);
    executeStep(0);
  }, [executeStep, resetState, setIsRunning]);

  // Resume after HITL selection
  const resumeWithHitlSelection = useCallback((stepId: string, selectedOption: string) => {
    setActiveHitl(null);

    // data_source_select handling
    setSelectedDataSource(selectedOption);

    // Update current message status
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

    // Mark step as completed
    setCompletedStepIds(prev => new Set([...prev, stepId]));
    setIsPaused(false);
    onStepComplete?.(stepId);

    // Execute next step
    const nextIndex = stepIndexRef.current + 1;
    stepIndexRef.current = nextIndex;
    executeStep(nextIndex);
  }, [executeStep, onStepComplete, setActiveHitl, setSelectedDataSource, setMessages,
      setCompletedStepIds, setIsPaused, stepIndexRef]);

  // Reset scenario
  const resetScenario = useCallback(() => {
    resetState();
    setIsVisualizationComplete(false);
  }, [resetState]);

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
