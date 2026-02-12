/**
 * LangGraph-compatible type definitions
 *
 * These types align with LangGraph's streaming/event architecture patterns
 * without requiring the LangGraph SDK. Used for typing the scenario
 * orchestration hooks and ensuring compatibility with the production
 * LangGraph-based agent system.
 */

// ===== Stream Event Types =====

/** LangGraph streaming event types */
export type StreamEventType =
  | 'on_chain_start'
  | 'on_chain_end'
  | 'on_chat_model_start'
  | 'on_chat_model_stream'
  | 'on_chat_model_end'
  | 'on_tool_start'
  | 'on_tool_end'
  | 'on_checkpoint'
  | 'on_interrupt';  // HITL interrupt

/** A single streaming event from LangGraph */
export interface StreamEvent {
  event: StreamEventType;
  name: string;
  run_id: string;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

// ===== Graph State =====

/** Base message type (aligned with LangChain message format) */
export interface BaseMessage {
  id: string;
  type: 'human' | 'ai' | 'tool' | 'system';
  content: string;
  additional_kwargs?: Record<string, unknown>;
  tool_calls?: ToolCall[];
}

/** Tool call within a message */
export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

/** Graph execution state */
export interface GraphState {
  messages: BaseMessage[];
  current_node: string | null;
  interrupted: boolean;
  checkpoint_id: string | null;
}

// ===== Run Status =====

/** LangGraph run status (replaces isRunning + isPaused) */
export type RunStatus = 'idle' | 'running' | 'interrupted' | 'completed' | 'error';

// ===== Interrupt / HITL =====

/** Interrupt payload for Human-In-The-Loop interactions */
export interface InterruptPayload {
  /** The graph node that triggered the interrupt */
  node_id: string;
  /** Tool type associated with this interrupt */
  tool_type: string;
  /** Question or prompt for the user */
  question: string;
  /** Available options for the user */
  options: InterruptOption[];
  /** Current question index for multi-step HITL */
  current_step?: number;
  /** Total number of questions in this HITL sequence */
  total_steps?: number;
}

/** A single option in an HITL interrupt */
export interface InterruptOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

/** Resume data sent back after user interaction */
export interface InterruptResume {
  node_id: string;
  selected_option: string;
  additional_data?: Record<string, unknown>;
}

// ===== Graph Definition =====

/** A node in the graph (replaces ScenarioStep) */
export interface GraphNode {
  id: string;
  type: 'tool' | 'model' | 'interrupt' | 'conditional';
  name: string;
  /** Tool type for tool nodes */
  tool_type?: string;
  /** Whether this node triggers an interrupt (HITL) */
  is_interrupt?: boolean;
  /** Whether this node waits for async external completion */
  is_async?: boolean;
  /** Delay for simulated execution (demo mode) */
  delay_ms?: number;
  /** Node this depends on */
  depends_on?: string;
}

/** A group of related nodes (subgraph concept) */
export interface NodeGroup {
  id: string;
  label: string;
  nodes: string[]; // node IDs
  /** Whether this group auto-collapses after completion */
  auto_collapse?: boolean;
}

// ===== Checkpoint =====

/** Checkpoint for save/restore of graph state */
export interface Checkpoint {
  id: string;
  thread_id: string;
  node_id: string;
  state: GraphState;
  created_at: string;
}

/** Thread represents a conversation/execution session */
export interface Thread {
  id: string;
  created_at: string;
  updated_at: string;
  status: RunStatus;
  metadata?: Record<string, unknown>;
}
