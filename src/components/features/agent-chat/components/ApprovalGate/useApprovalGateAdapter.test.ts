// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApprovalGateAdapter, extractApprovalRequests } from './useApprovalGateAdapter';
import type { ToolApprovalRequest, ToolRiskMapping } from './types';

describe('useApprovalGateAdapter', () => {
  const makeRequest = (
    overrides: Partial<ToolApprovalRequest> = {},
  ): ToolApprovalRequest => ({
    toolCallId: 'tc-1',
    toolName: 'deleteFile',
    args: { path: '/tmp/test.txt' },
    status: 'approval-requested',
    ...overrides,
  });

  const defaultMapping: Record<string, ToolRiskMapping> = {
    deleteFile: { riskLevel: 'high', actionType: 'delete' },
    readFile: { riskLevel: 'low', actionType: 'execute' },
  };

  it('converts approval-requested tools to pendingApprovals', () => {
    const requests = [makeRequest()];
    const addResponse = vi.fn();

    const { result } = renderHook(() =>
      useApprovalGateAdapter({
        toolApprovalRequests: requests,
        addToolApprovalResponse: addResponse,
        toolRiskMapping: defaultMapping,
      }),
    );

    expect(result.current.pendingApprovals).toHaveLength(1);
    expect(result.current.pendingApprovals[0]).toEqual({
      toolCallId: 'tc-1',
      toolName: 'deleteFile',
      args: { path: '/tmp/test.txt' },
      riskLevel: 'high',
      actionType: 'delete',
    });
    expect(result.current.hasPendingApprovals).toBe(true);
  });

  it('maps riskLevel and actionType from toolRiskMapping', () => {
    const requests = [makeRequest({ toolName: 'readFile', toolCallId: 'tc-2' })];
    const addResponse = vi.fn();

    const { result } = renderHook(() =>
      useApprovalGateAdapter({
        toolApprovalRequests: requests,
        addToolApprovalResponse: addResponse,
        toolRiskMapping: defaultMapping,
      }),
    );

    expect(result.current.pendingApprovals[0].riskLevel).toBe('low');
    expect(result.current.pendingApprovals[0].actionType).toBe('execute');
  });

  it('uses medium/execute default for unmapped tools', () => {
    const requests = [makeRequest({ toolName: 'unknownTool', toolCallId: 'tc-3' })];
    const addResponse = vi.fn();

    const { result } = renderHook(() =>
      useApprovalGateAdapter({
        toolApprovalRequests: requests,
        addToolApprovalResponse: addResponse,
        toolRiskMapping: defaultMapping,
      }),
    );

    expect(result.current.pendingApprovals[0].riskLevel).toBe('medium');
    expect(result.current.pendingApprovals[0].actionType).toBe('execute');
  });

  it('excludes non-approval-requested status tools', () => {
    const requests = [
      makeRequest({ status: 'approval-responded', toolCallId: 'tc-4' }),
      makeRequest({ status: 'output-available', toolCallId: 'tc-5' }),
      makeRequest({ status: 'approval-requested', toolCallId: 'tc-6' }),
    ];
    const addResponse = vi.fn();

    const { result } = renderHook(() =>
      useApprovalGateAdapter({
        toolApprovalRequests: requests,
        addToolApprovalResponse: addResponse,
        toolRiskMapping: defaultMapping,
      }),
    );

    expect(result.current.pendingApprovals).toHaveLength(1);
    expect(result.current.pendingApprovals[0].toolCallId).toBe('tc-6');
  });

  it('approveToolCall calls addToolApprovalResponse with approved: true', () => {
    const addResponse = vi.fn();

    const { result } = renderHook(() =>
      useApprovalGateAdapter({
        toolApprovalRequests: [makeRequest()],
        addToolApprovalResponse: addResponse,
        toolRiskMapping: defaultMapping,
      }),
    );

    act(() => {
      result.current.approveToolCall('tc-1');
    });

    expect(addResponse).toHaveBeenCalledWith({ id: 'tc-1', approved: true });
  });

  it('rejectToolCall calls addToolApprovalResponse with approved: false', () => {
    const addResponse = vi.fn();

    const { result } = renderHook(() =>
      useApprovalGateAdapter({
        toolApprovalRequests: [makeRequest()],
        addToolApprovalResponse: addResponse,
        toolRiskMapping: defaultMapping,
      }),
    );

    act(() => {
      result.current.rejectToolCall('tc-1');
    });

    expect(addResponse).toHaveBeenCalledWith({ id: 'tc-1', approved: false });
  });

  it('hasPendingApprovals is false when no requests', () => {
    const addResponse = vi.fn();

    const { result } = renderHook(() =>
      useApprovalGateAdapter({
        toolApprovalRequests: [],
        addToolApprovalResponse: addResponse,
      }),
    );

    expect(result.current.hasPendingApprovals).toBe(false);
    expect(result.current.pendingApprovals).toHaveLength(0);
  });

  it('handles multiple pending approvals', () => {
    const requests = [
      makeRequest({ toolCallId: 'tc-a', toolName: 'deleteFile' }),
      makeRequest({ toolCallId: 'tc-b', toolName: 'readFile' }),
    ];
    const addResponse = vi.fn();

    const { result } = renderHook(() =>
      useApprovalGateAdapter({
        toolApprovalRequests: requests,
        addToolApprovalResponse: addResponse,
        toolRiskMapping: defaultMapping,
      }),
    );

    expect(result.current.pendingApprovals).toHaveLength(2);
  });
});

describe('extractApprovalRequests', () => {
  it('extracts approval-requested tool invocations from messages', () => {
    const messages = [
      {
        role: 'assistant',
        parts: [
          {
            type: 'tool-invocation',
            toolInvocation: {
              toolCallId: 'tc-1',
              toolName: 'deleteFile',
              args: { path: '/tmp/test' },
              state: 'approval-requested',
            },
          },
        ],
      },
    ];

    const result = extractApprovalRequests(messages);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      toolCallId: 'tc-1',
      toolName: 'deleteFile',
      args: { path: '/tmp/test' },
      status: 'approval-requested',
    });
  });

  it('ignores non-approval-requested states', () => {
    const messages = [
      {
        role: 'assistant',
        parts: [
          {
            type: 'tool-invocation',
            toolInvocation: {
              toolCallId: 'tc-1',
              toolName: 'readFile',
              args: {},
              state: 'output-available',
            },
          },
        ],
      },
    ];

    const result = extractApprovalRequests(messages);
    expect(result).toHaveLength(0);
  });

  it('ignores user messages', () => {
    const messages = [
      {
        role: 'user',
        parts: [
          {
            type: 'tool-invocation',
            toolInvocation: {
              toolCallId: 'tc-1',
              toolName: 'test',
              args: {},
              state: 'approval-requested',
            },
          },
        ],
      },
    ];

    const result = extractApprovalRequests(messages);
    expect(result).toHaveLength(0);
  });

  it('handles messages without parts', () => {
    const messages = [{ role: 'assistant' }];
    const result = extractApprovalRequests(messages);
    expect(result).toHaveLength(0);
  });

  it('handles non-tool-invocation parts', () => {
    const messages = [
      {
        role: 'assistant',
        parts: [{ type: 'text' }],
      },
    ];
    const result = extractApprovalRequests(messages);
    expect(result).toHaveLength(0);
  });

  it('extracts multiple requests from multiple messages', () => {
    const messages = [
      {
        role: 'assistant',
        parts: [
          {
            type: 'tool-invocation',
            toolInvocation: {
              toolCallId: 'tc-1',
              toolName: 'a',
              args: {},
              state: 'approval-requested',
            },
          },
        ],
      },
      {
        role: 'assistant',
        parts: [
          {
            type: 'tool-invocation',
            toolInvocation: {
              toolCallId: 'tc-2',
              toolName: 'b',
              args: {},
              state: 'approval-requested',
            },
          },
        ],
      },
    ];

    const result = extractApprovalRequests(messages);
    expect(result).toHaveLength(2);
  });
});
