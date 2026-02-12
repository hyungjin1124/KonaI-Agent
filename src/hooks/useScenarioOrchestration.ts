import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  ScenarioMessage,
  ToolType,
  ProgressTask,
  TaskGroup,
  RenderSegment,
  GroupExpandState,
} from '../components/features/agent-chat/types';
import {
  TOOL_METADATA,
} from '../components/features/agent-chat/components/ToolCall/constants';
import { HitlOption } from '../types';
import type { RunStatus, InterruptPayload } from '../types/langgraph.types';

// HITL floating panel state type (shared across scenarios)
// Maps to LangGraph InterruptPayload pattern
export interface ActiveHitl {
  stepId: string;       // → InterruptPayload.node_id
  toolType: ToolType;   // → InterruptPayload.tool_type
  question: string;     // → InterruptPayload.question
  options: HitlOption[]; // → InterruptPayload.options
}

// Progress task group definition (scenario step -> progress mapping)
export interface ProgressTaskGroup {
  id: string;
  label: string;
  stepIds: string[];
}

// Configuration for the orchestration hook
export interface ScenarioOrchestrationConfig {
  progressTaskGroups: readonly ProgressTaskGroup[];
  renderTaskGroups: readonly TaskGroup[];
  stepToToolTypeMap: Record<string, ToolType>;
  firstCompletionStepId: string;
  initialGroupExpandState: GroupExpandState;
}

// Return type of the orchestration hook
export interface ScenarioOrchestrationReturn {
  // State
  messages: ScenarioMessage[];
  currentStepId: string | null;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  selectedDataSource: string | null;
  activeHitl: ActiveHitl | null;
  completedStepIds: Set<string>;
  activeToolMessageId: string | null;
  groupExpandState: GroupExpandState;

  // LangGraph-aligned aliases
  /** Consolidated run status (replaces isRunning/isPaused/isComplete) */
  runStatus: RunStatus;
  /** LangGraph interrupt payload (alias for activeHitl) */
  interruptPayload: InterruptPayload | null;

  // State setters (for scenario-specific logic in executeStep/startScenario/etc.)
  setMessages: React.Dispatch<React.SetStateAction<ScenarioMessage[]>>;
  setCurrentStepId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
  setIsComplete: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedDataSource: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveHitl: React.Dispatch<React.SetStateAction<ActiveHitl | null>>;
  setCompletedStepIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  setActiveToolMessageId: React.Dispatch<React.SetStateAction<string | null>>;
  setGroupExpandState: React.Dispatch<React.SetStateAction<GroupExpandState>>;

  // Refs
  timerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  stepIndexRef: React.MutableRefObject<number>;
  autoCollapsedGroupsRef: React.MutableRefObject<Set<string>>;

  // Computed values
  progressTasks: ProgressTask[];
  renderSegments: RenderSegment[];

  // Utility functions
  generateGroupLabel: (stepIds: string[]) => string;
  toggleMessageExpand: (messageId: string) => void;
  isMessageExpanded: (messageId: string) => boolean;
  toggleGroup: (groupId: string) => void;
  pauseScenario: () => void;
  resetState: () => void;
}

export function useScenarioOrchestration(config: ScenarioOrchestrationConfig): ScenarioOrchestrationReturn {
  const {
    progressTaskGroups,
    renderTaskGroups,
    stepToToolTypeMap,
    firstCompletionStepId,
    initialGroupExpandState,
  } = config;

  // =============================================
  // Shared State
  // =============================================
  const [messages, setMessages] = useState<ScenarioMessage[]>([]);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(null);
  const [activeHitl, setActiveHitl] = useState<ActiveHitl | null>(null);
  const [completedStepIds, setCompletedStepIds] = useState<Set<string>>(new Set());
  const [activeToolMessageId, setActiveToolMessageId] = useState<string | null>(null);
  const [groupExpandState, setGroupExpandState] = useState<GroupExpandState>(initialGroupExpandState);

  // =============================================
  // Shared Refs
  // =============================================
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepIndexRef = useRef(0);
  const autoCollapsedGroupsRef = useRef<Set<string>>(new Set());

  // =============================================
  // Shared Utility Functions
  // =============================================

  // Dynamic group label generation using stepToToolTypeMap
  const generateGroupLabel = useCallback((stepIds: string[]): string => {
    const uniqueLabels: string[] = [];
    const seenToolTypes = new Set<ToolType>();

    for (const stepId of stepIds) {
      const toolType = stepToToolTypeMap[stepId];
      if (toolType && !seenToolTypes.has(toolType)) {
        seenToolTypes.add(toolType);
        const label = TOOL_METADATA[toolType]?.label;
        if (label) uniqueLabels.push(label);
      }
    }

    if (uniqueLabels.length === 0) return '\uC791\uC5C5';
    if (uniqueLabels.length === 1) return uniqueLabels[0];
    if (uniqueLabels.length === 2) return uniqueLabels.join(' \uBC0F ');
    // 3+ items: show first and last only
    return `${uniqueLabels[0]} \uBC0F ${uniqueLabels[uniqueLabels.length - 1]}`;
  }, [stepToToolTypeMap]);

  // Message toggle (accordion style - only one expanded at a time)
  const toggleMessageExpand = useCallback((messageId: string) => {
    setActiveToolMessageId(prev => prev === messageId ? null : messageId);
  }, []);

  // Expand state check helper
  const isMessageExpanded = useCallback((messageId: string) => {
    return activeToolMessageId === messageId;
  }, [activeToolMessageId]);

  // Group toggle (per-group)
  const toggleGroup = useCallback((groupId: string) => {
    setGroupExpandState(prev => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  }, []);

  // Pause scenario (clear timer, set isPaused)
  const pauseScenario = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPaused(true);
  }, []);

  // Reset all shared state to initial values
  const resetState = useCallback(() => {
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
    setActiveHitl(null);
    setCompletedStepIds(new Set());
    setActiveToolMessageId(null);
    setGroupExpandState(initialGroupExpandState);
    autoCollapsedGroupsRef.current.clear();
    stepIndexRef.current = 0;
  }, [initialGroupExpandState]);

  // =============================================
  // Shared Computed Values
  // =============================================

  // Progress tasks (based on completedStepIds and currentStepId)
  // Only shown after firstCompletionStepId is completed
  const progressTasks = useMemo((): ProgressTask[] => {
    const isFirstStepComplete = completedStepIds.has(firstCompletionStepId);
    if (!isFirstStepComplete) {
      return [];
    }

    return progressTaskGroups.map(group => {
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
  }, [completedStepIds, currentStepId, progressTaskGroups, firstCompletionStepId]);

  // Render segments (group -> text -> group order)
  const renderSegments = useMemo((): RenderSegment[] => {
    const segments: RenderSegment[] = [];

    renderTaskGroups.forEach(group => {
      // Filter tool messages belonging to this group
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

      // Following text message (shown after group completes)
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
  }, [messages, renderTaskGroups, generateGroupLabel]);

  // =============================================
  // Shared Effects
  // =============================================

  // Auto-collapse completed groups (Claude Cowork style)
  // Note: groupExpandState removed from deps to prevent infinite loop
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    renderTaskGroups.forEach(group => {
      const allComplete = group.toolStepIds.every(id => completedStepIds.has(id));

      // Condition: completed + not yet auto-collapsed
      if (allComplete && !autoCollapsedGroupsRef.current.has(group.id)) {
        autoCollapsedGroupsRef.current.add(group.id);

        // 800ms delay before collapsing (time to review results)
        const timer = setTimeout(() => {
          setGroupExpandState(prev => ({ ...prev, [group.id]: false }));
        }, 800);
        timers.push(timer);
      }
    });

    return () => timers.forEach(t => clearTimeout(t));
  }, [completedStepIds, renderTaskGroups]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // =============================================
  // LangGraph-aligned Computed Values
  // =============================================

  // Consolidated run status (maps isRunning/isPaused/isComplete → RunStatus)
  const runStatus = useMemo((): RunStatus => {
    if (isComplete) return 'completed';
    if (isPaused || activeHitl) return 'interrupted';
    if (isRunning) return 'running';
    return 'idle';
  }, [isRunning, isPaused, isComplete, activeHitl]);

  // Map ActiveHitl → InterruptPayload for LangGraph compatibility
  const interruptPayload = useMemo((): InterruptPayload | null => {
    if (!activeHitl) return null;
    return {
      node_id: activeHitl.stepId,
      tool_type: activeHitl.toolType,
      question: activeHitl.question,
      options: activeHitl.options.map(opt => ({
        id: opt.id,
        label: opt.label,
        description: opt.description,
        icon: opt.icon,
      })),
    };
  }, [activeHitl]);

  // =============================================
  // Return
  // =============================================
  return {
    // State
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

    // LangGraph-aligned aliases
    runStatus,
    interruptPayload,

    // State setters
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

    // Refs
    timerRef,
    stepIndexRef,
    autoCollapsedGroupsRef,

    // Computed values
    progressTasks,
    renderSegments,

    // Utility functions
    generateGroupLabel,
    toggleMessageExpand,
    isMessageExpanded,
    toggleGroup,
    pauseScenario,
    resetState,
  };
}

export default useScenarioOrchestration;
