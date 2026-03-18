import { useMemo, useCallback } from 'react';
import type {
  ToolApprovalRequest,
  ToolApprovalResponse,
  ToolRiskMapping,
  PendingApproval,
  ApprovalGateAdapterResult,
  RiskLevel,
  ActionType,
} from './types';

/** 도구명에 매핑이 없을 때 사용하는 기본값 */
const DEFAULT_RISK_MAPPING: ToolRiskMapping = {
  riskLevel: 'medium',
  actionType: 'execute',
};

/**
 * AI SDK `needsApproval` 패턴을 ApprovalGate 컴포넌트와 연결하는 어댑터 훅.
 *
 * AI SDK의 `approval-requested` 상태 도구 호출을 감지하여
 * ApprovalGate에 전달할 pendingApprovals 배열로 변환하고,
 * 승인/거절 시 `addToolApprovalResponse`를 호출한다.
 *
 * @example
 * ```tsx
 * const { messages, addToolApprovalResponse } = useChat({ ... });
 *
 * const { pendingApprovals, approveToolCall, rejectToolCall, hasPendingApprovals } =
 *   useApprovalGateAdapter({
 *     toolApprovalRequests: extractApprovalRequests(messages),
 *     addToolApprovalResponse,
 *     toolRiskMapping: {
 *       deleteFile: { riskLevel: 'high', actionType: 'delete' },
 *       readFile:   { riskLevel: 'low',  actionType: 'execute' },
 *     },
 *   });
 *
 * {hasPendingApprovals && pendingApprovals.map(pa => (
 *   <ApprovalGate
 *     key={pa.toolCallId}
 *     toolCallId={pa.toolCallId}
 *     riskLevel={pa.riskLevel}
 *     actionType={pa.actionType}
 *     title={`${pa.toolName} 실행 승인`}
 *     onApprove={() => approveToolCall(pa.toolCallId)}
 *     onReject={() => rejectToolCall(pa.toolCallId)}
 *   />
 * ))}
 * ```
 */
export function useApprovalGateAdapter({
  toolApprovalRequests,
  addToolApprovalResponse,
  toolRiskMapping = {},
}: {
  /** AI SDK에서 추출한 approval-requested 상태 도구 호출 목록 */
  toolApprovalRequests: ToolApprovalRequest[];
  /** AI SDK useChat의 addToolApprovalResponse 콜백 */
  addToolApprovalResponse: (response: ToolApprovalResponse) => void;
  /** 도구명 → risk/action 매핑 (미매핑 도구는 medium/execute 기본값 사용) */
  toolRiskMapping?: Record<string, ToolRiskMapping>;
}): ApprovalGateAdapterResult {
  // approval-requested 상태만 필터링하여 pendingApprovals로 변환
  const pendingApprovals: PendingApproval[] = useMemo(() => {
    return toolApprovalRequests
      .filter((req) => req.status === 'approval-requested')
      .map((req) => {
        const mapping = toolRiskMapping[req.toolName] ?? DEFAULT_RISK_MAPPING;
        return {
          toolCallId: req.toolCallId,
          toolName: req.toolName,
          args: req.args,
          riskLevel: mapping.riskLevel,
          actionType: mapping.actionType,
        };
      });
  }, [toolApprovalRequests, toolRiskMapping]);

  const approveToolCall = useCallback(
    (toolCallId: string) => {
      addToolApprovalResponse({ id: toolCallId, approved: true });
    },
    [addToolApprovalResponse],
  );

  const rejectToolCall = useCallback(
    (toolCallId: string) => {
      addToolApprovalResponse({ id: toolCallId, approved: false });
    },
    [addToolApprovalResponse],
  );

  return {
    pendingApprovals,
    approveToolCall,
    rejectToolCall,
    hasPendingApprovals: pendingApprovals.length > 0,
  };
}

/**
 * AI SDK useChat의 messages에서 approval-requested 상태 도구 호출을 추출하는 유틸리티.
 *
 * AI SDK의 메시지 구조에서 도구 호출 파트를 순회하며,
 * `status === 'approval-requested'`인 항목을 ToolApprovalRequest 형태로 반환한다.
 *
 * @example
 * ```ts
 * const { messages } = useChat({ ... });
 * const requests = extractApprovalRequests(messages);
 * ```
 */
export function extractApprovalRequests(
  messages: Array<{
    role: string;
    parts?: Array<{
      type: string;
      toolInvocation?: {
        toolCallId: string;
        toolName: string;
        args: Record<string, unknown>;
        state: string;
      };
    }>;
  }>,
): ToolApprovalRequest[] {
  const requests: ToolApprovalRequest[] = [];

  for (const message of messages) {
    if (message.role !== 'assistant' || !message.parts) continue;

    for (const part of message.parts) {
      if (part.type !== 'tool-invocation' || !part.toolInvocation) continue;

      const { toolCallId, toolName, args, state } = part.toolInvocation;
      if (state === 'approval-requested') {
        requests.push({
          toolCallId,
          toolName,
          args,
          status: 'approval-requested',
        });
      }
    }
  }

  return requests;
}
