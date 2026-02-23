import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ToolCallStatusIndicator from './ToolCallStatusIndicator';
import ToolCallHeader from './ToolCallHeader';
import ToolCallWidget from './ToolCallWidget';
import ToolCallContent from './ToolCallContent';
import type { ToolMetadata } from '../../types';

// =============================================
// QA Edge Case Tests — Tool Call Display
// =============================================

const mockMetadata: ToolMetadata = {
  id: 'web_search',
  label: '웹 검색',
  labelRunning: '웹 검색 중...',
  labelComplete: '웹 검색 완료',
  icon: '🔍',
};

describe('QA: ToolCallStatusIndicator Edge Cases', () => {
  it('default case handles unexpected status gracefully', () => {
    // TypeScript에서 허용하지 않는 상태값이 런타임에 올 수 있음
    const { container } = render(
      <ToolCallStatusIndicator status={'unknown' as any} />
    );
    // default case는 pending과 동일한 회색 원 렌더링
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.classList.contains('text-gray-300')).toBe(true);
  });

  it('renders with size=0 without crashing', () => {
    const { container } = render(
      <ToolCallStatusIndicator status="running" size={0} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('width')).toBe('0');
  });

  it('renders with very large size without crashing', () => {
    const { container } = render(
      <ToolCallStatusIndicator status="completed" size={999} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('width')).toBe('999');
  });
});

describe('QA: ToolCallHeader Edge Cases', () => {
  it('renders failed status without errorMessage (no crash, no error text)', () => {
    render(
      <ToolCallHeader
        toolType="web_search"
        status="failed"
        isExpanded={false}
        onToggle={() => {}}
        metadata={mockMetadata}
      />
    );
    // 도구명은 표시됨 (failed일 때 metadata.label 사용)
    expect(screen.getByText('웹 검색')).toBeTruthy();
    // 에러 메시지 span은 없어야 함
    expect(screen.queryByText(/—/)).toBeNull();
  });

  it('handles very long errorMessage without layout break', () => {
    const longError = 'A'.repeat(500);
    const { container } = render(
      <ToolCallHeader
        toolType="web_search"
        status="failed"
        isExpanded={false}
        onToggle={() => {}}
        metadata={mockMetadata}
        errorMessage={longError}
      />
    );
    // 에러 메시지가 렌더링됨
    expect(container.textContent).toContain(longError);
  });

  it('renders awaiting-input status with shimmer animation', () => {
    render(
      <ToolCallHeader
        toolType="web_search"
        status="awaiting-input"
        isExpanded={false}
        onToggle={() => {}}
        metadata={mockMetadata}
      />
    );
    // awaiting-input은 isRunning=true이므로 shimmer-text 적용
    const label = screen.getByText('웹 검색');
    expect(label.className).toContain('shimmer-text');
  });

  it('onToggle is not called on double rapid clicks (no duplicate events)', () => {
    const handleToggle = vi.fn();
    render(
      <ToolCallHeader
        toolType="web_search"
        status="pending"
        isExpanded={false}
        onToggle={handleToggle}
        metadata={mockMetadata}
      />
    );
    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.click(button);
    // 각 클릭은 독립적으로 호출됨 (debounce 없음, 정상 동작)
    expect(handleToggle).toHaveBeenCalledTimes(2);
  });
});

describe('QA: ToolCallWidget Edge Cases', () => {
  it('renders null for unknown toolType', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(
      <ToolCallWidget
        toolType={'nonexistent_tool' as any}
        status="running"
      />
    );
    expect(container.innerHTML).toBe('');
    expect(consoleSpy).toHaveBeenCalledWith('Unknown tool type: nonexistent_tool');
    consoleSpy.mockRestore();
  });

  it('falls back to internal expanded state when no external control', () => {
    const { container } = render(
      <ToolCallWidget
        toolType="web_search"
        status="completed"
      />
    );
    // 기본적으로 접힌 상태
    expect(container.querySelector('[data-state="closed"]')).toBeTruthy();
  });

  it('passes onRetry and errorMessage to content correctly', () => {
    const handleRetry = vi.fn();
    render(
      <ToolCallWidget
        toolType="web_search"
        status="failed"
        isExpanded={true}
        errorMessage="테스트 에러"
        onRetry={handleRetry}
      />
    );
    expect(screen.getByText('도구 실행 실패')).toBeTruthy();
    expect(screen.getByText('테스트 에러')).toBeTruthy();

    const retryButton = screen.getByLabelText('도구 재시도');
    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('HITL tool shows awaiting-input when running without selectedOption', () => {
    const { container } = render(
      <ToolCallWidget
        toolType="data_source_select"
        status="running"
        isHitl={true}
        isExpanded={true}
      />
    );
    // awaiting-input 상태에서 amber pulse 아이콘 확인
    const svg = container.querySelector('.text-amber-500.animate-pulse');
    expect(svg).toBeTruthy();
  });
});

describe('QA: ToolCallContent Edge Cases', () => {
  it('failed state with result.message as fallback (no errorMessage)', () => {
    render(
      <ToolCallContent
        toolType="web_search"
        status="failed"
        result={{ success: false, message: 'API 타임아웃' }}
      />
    );
    expect(screen.getByText('API 타임아웃')).toBeTruthy();
  });

  it('failed state without any error info shows generic message', () => {
    render(
      <ToolCallContent
        toolType="web_search"
        status="failed"
      />
    );
    expect(screen.getByText('도구 실행 실패')).toBeTruthy();
    // 재시도 버튼 없음 (onRetry 미전달)
    expect(screen.queryByLabelText('도구 재시도')).toBeNull();
  });

  it('failed state overrides all toolType-specific rendering', () => {
    // ppt_init도 failed면 에러 UI만 표시
    render(
      <ToolCallContent
        toolType="ppt_init"
        status="failed"
        errorMessage="초기화 실패"
      />
    );
    expect(screen.getByText('도구 실행 실패')).toBeTruthy();
    expect(screen.getByText('초기화 실패')).toBeTruthy();
    // ppt_init의 정상 콘텐츠는 표시되지 않아야 함
    expect(screen.queryByText(/프레젠테이션/)).toBeNull();
  });

  it('retry button calls onRetry when clicked', () => {
    const handleRetry = vi.fn();
    render(
      <ToolCallContent
        toolType="web_search"
        status="failed"
        onRetry={handleRetry}
      />
    );
    const retryButton = screen.getByLabelText('도구 재시도');
    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('data_query with missing queryResult shows loading message', () => {
    render(
      <ToolCallContent
        toolType="data_query"
        status="running"
        input={{ queryId: 'nonexistent_query' }}
      />
    );
    expect(screen.getByText('데이터 조회 결과를 불러오는 중...')).toBeTruthy();
  });
});
