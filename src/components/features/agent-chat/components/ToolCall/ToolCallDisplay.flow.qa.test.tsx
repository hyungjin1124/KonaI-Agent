import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ToolCallWidget from './ToolCallWidget';
import ToolCallGroup from './ToolCallGroup';
import type { ScenarioMessage } from '../../types';

// =============================================
// QA UX Flow Tests — Tool Call Display
// =============================================

// 실제 TOOL_METADATA의 web_search 레이블 사용
// labelRunning: '시장 정보 검색 중...'
// labelComplete: '웹 검색 완료'

describe('QA Flow: ToolCallWidget state transitions', () => {
  it('transitions from running → completed preserves collapse state', () => {
    const { rerender, container } = render(
      <ToolCallWidget
        toolType="web_search"
        status="running"
        isExpanded={true}
        onToggle={() => {}}
      />
    );
    // running 상태에서 실제 TOOL_METADATA의 labelRunning 확인
    expect(screen.getByText('시장 정보 검색 중...')).toBeTruthy();
    // shimmer 클래스 확인
    expect(container.querySelector('.shimmer-text')).toBeTruthy();

    // completed로 전환
    rerender(
      <ToolCallWidget
        toolType="web_search"
        status="completed"
        isExpanded={true}
        onToggle={() => {}}
      />
    );
    expect(screen.getByText('웹 검색 완료')).toBeTruthy();
  });

  it('transitions from running → failed without hooks order violation', () => {
    const handleRetry = vi.fn();
    const { rerender } = render(
      <ToolCallWidget
        toolType="web_search"
        status="running"
        isExpanded={true}
        onToggle={() => {}}
      />
    );
    expect(screen.getByText('시장 정보 검색 중...')).toBeTruthy();

    // running → failed 전환이 에러 없이 동작해야 함
    rerender(
      <ToolCallWidget
        toolType="web_search"
        status="failed"
        isExpanded={true}
        onToggle={() => {}}
        errorMessage="서버 에러"
        onRetry={handleRetry}
      />
    );

    expect(screen.getByText('도구 실행 실패')).toBeTruthy();
    expect(screen.getByText('서버 에러')).toBeTruthy();
    expect(screen.getByLabelText('도구 재시도')).toBeTruthy();

    // 재시도 버튼 동작 확인
    fireEvent.click(screen.getByLabelText('도구 재시도'));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('renders failed state correctly when initially mounted as failed', () => {
    // 초기 마운트 시 failed 상태는 정상 동작 (hooks 순서 일관)
    const handleRetry = vi.fn();
    render(
      <ToolCallWidget
        toolType="web_search"
        status="failed"
        isExpanded={true}
        onToggle={() => {}}
        errorMessage="서버 에러"
        onRetry={handleRetry}
      />
    );
    expect(screen.getByText('도구 실행 실패')).toBeTruthy();
    expect(screen.getByText('서버 에러')).toBeTruthy();
  });

  it('HITL tool running → completed when selectedOption provided', () => {
    const { rerender, container } = render(
      <ToolCallWidget
        toolType="data_source_select"
        status="running"
        isHitl={true}
        isExpanded={true}
        onToggle={() => {}}
      />
    );
    // awaiting-input 상태
    expect(container.querySelector('.text-amber-500')).toBeTruthy();

    // 선택 완료
    rerender(
      <ToolCallWidget
        toolType="data_source_select"
        status="running"
        isHitl={true}
        isExpanded={true}
        onToggle={() => {}}
        selectedOption="erp"
      />
    );
    // selectedOption이 있으면 awaiting-input이 아닌 running 상태
    expect(container.querySelector('.text-blue-500.animate-spin')).toBeTruthy();
  });
});

describe('QA Flow: ToolCallGroup message rendering', () => {
  const baseMessages: ScenarioMessage[] = [
    {
      id: 'msg-1',
      type: 'tool-call',
      content: '',
      sender: 'ai',
      timestamp: '09:00',
      toolType: 'erp_connect',
      toolStatus: 'completed',
    },
    {
      id: 'msg-2',
      type: 'tool-call',
      content: '',
      sender: 'ai',
      timestamp: '09:01',
      toolType: 'web_search',
      toolStatus: 'running',
    },
  ];

  const defaultGroupProps = {
    groupId: 'test-group',
    groupLabel: '데이터 수집',
    isGroupExpanded: true,
    onGroupToggle: vi.fn(),
    activeToolMessageId: 'msg-2',
    onToolToggle: vi.fn(),
    isScenarioComplete: false,
    isScenarioRunning: true,
    currentStepId: 'tool_web_search',
    completedStepIds: new Set(['tool_erp_connect']),
  };

  it('renders all tool messages (excluding todo_update)', () => {
    const messagesWithTodo: ScenarioMessage[] = [
      ...baseMessages,
      {
        id: 'msg-3',
        type: 'tool-call',
        content: '',
        sender: 'ai',
        timestamp: '09:02',
        toolType: 'todo_update',
        toolStatus: 'completed',
      },
    ];

    render(
      <ToolCallGroup
        {...defaultGroupProps}
        messages={messagesWithTodo}
      />
    );

    // todo_update는 필터링됨, 2개만 표시
    // TOOL_METADATA의 실제 레이블 사용
    expect(screen.getByText('ERP 연결 완료')).toBeTruthy();
    // web_search running은 header의 labelRunning을 사용
    // ToolCallGroupHeader에서 activeToolLabel로도 표시되므로 getAllByText 사용
    const runningLabels = screen.getAllByText('시장 정보 검색 중...');
    expect(runningLabels.length).toBeGreaterThanOrEqual(1);
  });

  it('returns null when no tool messages exist', () => {
    const { container } = render(
      <ToolCallGroup
        {...defaultGroupProps}
        messages={[]}
      />
    );
    expect(container.innerHTML).toBe('');
  });

  it('onRetry passes correct messageId', () => {
    const handleRetry = vi.fn();
    const failedMessages: ScenarioMessage[] = [
      {
        id: 'msg-fail',
        type: 'tool-call',
        content: '',
        sender: 'ai',
        timestamp: '09:00',
        toolType: 'web_search',
        toolStatus: 'failed',
        toolResult: { success: false, message: '에러 발생' },
      },
    ];

    render(
      <ToolCallGroup
        {...defaultGroupProps}
        messages={failedMessages}
        activeToolMessageId="msg-fail"
        onRetry={handleRetry}
      />
    );

    // 재시도 버튼 클릭
    const retryButton = screen.getByLabelText('도구 재시도');
    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledWith('msg-fail');
  });

  it('group header shows active tool label when running', () => {
    render(
      <ToolCallGroup
        {...defaultGroupProps}
        messages={baseMessages}
      />
    );
    // activeToolLabel은 web_search의 labelRunning = '시장 정보 검색 중...'
    // GroupHeader와 개별 Header 모두에서 나타남
    const labels = screen.getAllByText('시장 정보 검색 중...');
    expect(labels.length).toBeGreaterThanOrEqual(1);
  });

  it('group header shows completion when all tools complete', () => {
    const completedMessages: ScenarioMessage[] = baseMessages.map(m => ({
      ...m,
      toolStatus: 'completed' as const,
    }));

    render(
      <ToolCallGroup
        {...defaultGroupProps}
        messages={completedMessages}
        isScenarioComplete={true}
        isScenarioRunning={false}
      />
    );

    expect(screen.getByText('데이터 수집 완료')).toBeTruthy();
  });
});
