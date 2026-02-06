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
  PPT_SCENARIO_STEPS,
  DEFAULT_VALIDATION_DATA,
  createScenarioMessage,
} from '../components/features/agent-chat/scenarios/pptScenario';
import {
  DEFAULT_DATA_SOURCE_OPTIONS,
  HITL_QUESTIONS,
  HITL_OPTIONS,
} from '../components/features/agent-chat/components/ToolCall/constants';
import { PPTConfig, HitlOption } from '../types';
import { useScenarioOrchestration, ActiveHitl } from './useScenarioOrchestration';

// stepId -> toolType mapping (for dynamic group label generation)
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
  tool_slide_outline_review: 'slide_outline_review',
  tool_theme_font_select: 'theme_font_select',
  tool_slide_generation: 'slide_generation',
  tool_completion: 'completion',
};

// Progress task group definitions (scenario step -> progress mapping)
const PROGRESS_TASK_GROUPS = [
  { id: 'planning', label: '\uC791\uC5C5 \uACC4\uD68D \uC218\uB9BD', stepIds: ['agent_greeting', 'tool_planning'] },
  { id: 'data_source', label: '\uB370\uC774\uD130 \uC18C\uC2A4 \uC120\uD0DD', stepIds: ['tool_data_source', 'agent_data_source_confirm'] },
  { id: 'data_query', label: '\uB370\uC774\uD130 \uC870\uD68C', stepIds: ['tool_erp_connect', 'tool_parallel_query', 'tool_data_query_1', 'tool_data_query_2', 'tool_data_query_3', 'tool_data_query_4'] },
  { id: 'data_validation', label: '\uB370\uC774\uD130 \uAC80\uC99D', stepIds: ['tool_data_validation', 'agent_validation_confirm'] },
  { id: 'ppt_setup', label: 'PPT \uC124\uC815', stepIds: ['tool_ppt_setup', 'agent_setup_confirm'] },
  { id: 'slide_planning', label: '\uC2AC\uB77C\uC774\uB4DC \uAD6C\uC131', stepIds: ['tool_web_search', 'tool_slide_planning', 'agent_slide_planning_confirm'] },
  { id: 'slide_outline_review', label: '\uC2AC\uB77C\uC774\uB4DC \uAC1C\uC694 \uAC80\uD1A0', stepIds: ['tool_slide_outline_review', 'agent_outline_approved'] },
  { id: 'theme_font_select', label: '\uD14C\uB9C8/\uD3F0\uD2B8 \uC120\uD0DD', stepIds: ['tool_theme_font_select', 'agent_theme_font_confirm'] },
  { id: 'slide_generation', label: '\uC2AC\uB77C\uC774\uB4DC \uC0DD\uC131', stepIds: ['tool_slide_generation'] },
  { id: 'completion', label: '\uC644\uB8CC', stepIds: ['tool_completion', 'agent_final'] },
];

// Render task groups (external accordion units - Claude Cowork style)
const RENDER_TASK_GROUPS: TaskGroup[] = [
  {
    id: 'data_source_selection',
    label: '\uB370\uC774\uD130 \uC18C\uC2A4 \uC120\uD0DD',
    toolStepIds: ['tool_planning', 'tool_data_source'],
    followingTextStepId: 'agent_data_source_confirm',
  },
  {
    id: 'data_collection',
    label: '\uB370\uC774\uD130 \uC218\uC9D1',
    toolStepIds: ['tool_erp_connect', 'tool_parallel_query', 'tool_data_query_1', 'tool_data_query_2', 'tool_data_query_3', 'tool_data_query_4'],
  },
  {
    id: 'data_validation',
    label: '\uB370\uC774\uD130 \uAC80\uC99D',
    toolStepIds: ['tool_data_validation'],
    followingTextStepId: 'agent_validation_confirm',
  },
  {
    id: 'ppt_setup',
    label: 'PPT \uC124\uC815',
    toolStepIds: ['tool_ppt_setup', 'tool_web_search', 'tool_slide_planning'],
    followingTextStepId: 'agent_slide_planning_confirm',
  },
  {
    id: 'slide_outline_review',
    label: '\uC2AC\uB77C\uC774\uB4DC \uAC1C\uC694 \uAC80\uD1A0',
    toolStepIds: ['tool_slide_outline_review'],
    followingTextStepId: 'agent_outline_approved',
  },
  {
    id: 'theme_font_select',
    label: '\uD14C\uB9C8/\uD3F0\uD2B8 \uC120\uD0DD',
    toolStepIds: ['tool_theme_font_select'],
    followingTextStepId: 'agent_theme_font_confirm',
  },
  {
    id: 'ppt_generation',
    label: 'PPT \uC0DD\uC131',
    toolStepIds: ['tool_slide_generation', 'tool_completion'],
    followingTextStepId: 'agent_final',
  },
];

const INITIAL_GROUP_EXPAND_STATE: GroupExpandState = {
  data_source_selection: false,
  data_collection: false,
  data_validation: false,
  ppt_setup: false,
  slide_outline_review: false,
  theme_font_select: false,
  ppt_generation: false,
};

interface UsePPTScenarioOptions {
  onStepStart?: (stepId: string) => void;
  onStepComplete?: (stepId: string) => void;
  onHitlRequired?: (stepId: string, toolType: string) => void;
  onScenarioComplete?: () => void;
  onSlideOutlineRevisionRequested?: () => void; // Called when "needs revision" is selected
  pptConfig?: PPTConfig;
  onPptConfigUpdate?: <K extends keyof PPTConfig>(key: K, value: PPTConfig[K]) => void;
}

interface UsePPTScenarioReturn {
  messages: ScenarioMessage[];
  currentStepId: string | null;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;

  // State data
  selectedDataSource: string | null;
  validationData: DataValidationSummary;
  completedStepIds: Set<string>;

  // Progress sync data
  progressTasks: ProgressTask[];

  // HITL floating panel state
  activeHitl: ActiveHitl | null;

  // Actions
  startScenario: () => void;
  resumeWithHitlSelection: (stepId: string, selectedOption: string) => void;
  confirmValidation: () => void;
  completePptSetup: () => void;
  completeSlideOutlineReview: () => void;
  completeThemeFontSelect: () => void;
  completeSlidePlanning: () => void;
  completeSlideGeneration: () => void;
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

export function usePPTScenario(options: UsePPTScenarioOptions = {}): UsePPTScenarioReturn {
  const {
    onStepStart,
    onStepComplete,
    onHitlRequired,
    onScenarioComplete,
    onSlideOutlineRevisionRequested,
  } = options;

  // Use shared orchestration hook
  const orchestration = useScenarioOrchestration({
    progressTaskGroups: PROGRESS_TASK_GROUPS,
    renderTaskGroups: RENDER_TASK_GROUPS,
    stepToToolTypeMap: STEP_TO_TOOL_TYPE,
    firstCompletionStepId: 'tool_planning',
    initialGroupExpandState: INITIAL_GROUP_EXPAND_STATE,
  });

  // Scenario-specific state
  const [validationData] = useState<DataValidationSummary>(DEFAULT_VALIDATION_DATA);

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
    if (stepIndex >= PPT_SCENARIO_STEPS.length) {
      setIsComplete(true);
      setIsRunning(false);
      setActiveToolMessageId(null);
      // Collapse all groups on scenario completion
      setGroupExpandState({
        data_source_selection: false,
        data_collection: false,
        data_validation: false,
        ppt_setup: false,
        slide_outline_review: false,
        ppt_generation: false,
      });
      onScenarioComplete?.();
      return;
    }

    const step = PPT_SCENARIO_STEPS[stepIndex];
    setCurrentStepId(step.id);
    onStepStart?.(step.id);

    // Create message
    let newMessage: ScenarioMessage;

    if (step.type === 'tool-call' && step.toolType) {
      // Tool call message
      const initialStatus: ToolStatus = step.isHitl ? 'running' : 'running';

      // data_query step -> queryId mapping
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

      // HITL step: pause and activate floating panel
      // (slide_outline_review has isHitl removed - handled via isAsyncTool)
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

      // Async tool (slide_generation, etc.) - wait for external completion signal
      if (step.isAsyncTool) {
        stepIndexRef.current = stepIndex;
        setIsPaused(true);
        // Show initial state and wait (resumed by complete* callbacks)
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
        // Mark step as completed
        setCompletedStepIds(prev => new Set([...prev, step.id]));
        onStepComplete?.(step.id);
        stepIndexRef.current = stepIndex + 1;

        // Check next step dependency
        const nextStep = PPT_SCENARIO_STEPS[stepIndex + 1];
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

        // Check next step dependency
        const nextStep = PPT_SCENARIO_STEPS[stepIndex + 1];
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
  }, [onStepStart, onStepComplete, onHitlRequired, onScenarioComplete,
      setMessages, setCurrentStepId, setIsRunning, setIsComplete, setIsPaused,
      setActiveHitl, setCompletedStepIds, setActiveToolMessageId, setGroupExpandState,
      timerRef, stepIndexRef]);

  // Start scenario
  const startScenario = useCallback(() => {
    resetState();
    setIsRunning(true);
    executeStep(0);
  }, [executeStep, resetState, setIsRunning]);

  // HITL selection resume (data source, data validation, PPT setup)
  const resumeWithHitlSelection = useCallback((stepId: string, selectedOption: string) => {
    setActiveHitl(null);

    // data_validation special handling (confirm/modify)
    if (stepId === 'tool_data_validation') {
      if (selectedOption === 'confirm' || selectedOption === 'modify') {
        confirmValidation();
      }
      return;
    }

    // ppt_setup special handling
    if (stepId === 'tool_ppt_setup') {
      completePptSetup();
      return;
    }

    // slide_outline_review special handling
    if (stepId === 'tool_slide_outline_review') {
      if (selectedOption === 'approve_all') {
        completeSlideOutlineReview();
      } else if (selectedOption === 'needs_revision') {
        onSlideOutlineRevisionRequested?.();
      }
      return;
    }

    // data_source_select and other HITL handling
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executeStep, onStepComplete]);  // confirmValidation, completePptSetup removed - circular dependency prevention

  // Helper: complete an async step and advance to next
  const completeAsyncStep = useCallback((stepId: string) => {
    setActiveHitl(null);

    setMessages(prev =>
      prev.map(msg =>
        msg.id.includes(stepId)
          ? { ...msg, toolStatus: 'completed' as ToolStatus }
          : msg
      )
    );

    setCompletedStepIds(prev => new Set([...prev, stepId]));
    setIsPaused(false);
    onStepComplete?.(stepId);

    const nextIndex = stepIndexRef.current + 1;
    stepIndexRef.current = nextIndex;
    executeStep(nextIndex);
  }, [executeStep, onStepComplete, setActiveHitl, setMessages, setCompletedStepIds, setIsPaused, stepIndexRef]);

  // Data validation confirm
  const confirmValidation = useCallback(() => {
    completeAsyncStep('tool_data_validation');
  }, [completeAsyncStep]);

  // PPT setup complete
  const completePptSetup = useCallback(() => {
    completeAsyncStep('tool_ppt_setup');
  }, [completeAsyncStep]);

  // Slide outline review complete (called when all slides are approved)
  const completeSlideOutlineReview = useCallback(() => {
    completeAsyncStep('tool_slide_outline_review');
  }, [completeAsyncStep]);

  // Theme/font selection complete
  const completeThemeFontSelect = useCallback(() => {
    completeAsyncStep('tool_theme_font_select');
  }, [completeAsyncStep]);

  // Slide planning complete (called when all markdown files are created)
  const completeSlidePlanning = useCallback(() => {
    const stepId = 'tool_slide_planning';

    setMessages(prev =>
      prev.map(msg =>
        msg.id.includes(stepId)
          ? { ...msg, toolStatus: 'completed' as ToolStatus }
          : msg
      )
    );

    setCompletedStepIds(prev => new Set([...prev, stepId]));
    setIsPaused(false);
    onStepComplete?.(stepId);

    const nextIndex = stepIndexRef.current + 1;
    stepIndexRef.current = nextIndex;
    executeStep(nextIndex);
  }, [executeStep, onStepComplete, setMessages, setCompletedStepIds, setIsPaused, stepIndexRef]);

  // Slide generation complete (called when PPTGenPanel finishes all slides)
  const completeSlideGeneration = useCallback(() => {
    const stepId = 'tool_slide_generation';

    setMessages(prev =>
      prev.map(msg =>
        msg.id.includes(stepId)
          ? { ...msg, toolStatus: 'completed' as ToolStatus }
          : msg
      )
    );

    setCompletedStepIds(prev => new Set([...prev, stepId]));
    setIsPaused(false);
    onStepComplete?.(stepId);

    const nextIndex = stepIndexRef.current + 1;
    stepIndexRef.current = nextIndex;
    executeStep(nextIndex);
  }, [executeStep, onStepComplete, setMessages, setCompletedStepIds, setIsPaused, stepIndexRef]);

  // Reset scenario
  const resetScenario = useCallback(() => {
    resetState();
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
    progressTasks,
    activeHitl,
    startScenario,
    resumeWithHitlSelection,
    confirmValidation,
    completePptSetup,
    completeThemeFontSelect,
    completeSlideOutlineReview,
    completeSlidePlanning,
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
