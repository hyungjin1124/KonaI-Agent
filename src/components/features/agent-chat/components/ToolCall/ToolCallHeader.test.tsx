import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ToolCallHeader from './ToolCallHeader';
import type { ToolMetadata } from '../../types';

const mockMetadata: ToolMetadata = {
  id: 'web_search',
  label: '웹 검색',
  labelRunning: '웹 검색 중...',
  labelComplete: '웹 검색 완료',
  icon: '🔍',
};

describe('ToolCallHeader', () => {
  it('renders without error', () => {
    render(
      <ToolCallHeader
        toolType="web_search"
        status="pending"
        isExpanded={false}
        onToggle={() => {}}
        metadata={mockMetadata}
      />
    );
    expect(screen.getByText('웹 검색')).toBeTruthy();
  });

  it('shows running label and shimmer when running', () => {
    render(
      <ToolCallHeader
        toolType="web_search"
        status="running"
        isExpanded={false}
        onToggle={() => {}}
        metadata={mockMetadata}
      />
    );
    expect(screen.getByText('웹 검색 중...')).toBeTruthy();
    const label = screen.getByText('웹 검색 중...');
    expect(label.className).toContain('shimmer-text');
  });

  it('shows completed label when completed', () => {
    render(
      <ToolCallHeader
        toolType="web_search"
        status="completed"
        isExpanded={false}
        onToggle={() => {}}
        metadata={mockMetadata}
      />
    );
    expect(screen.getByText('웹 검색 완료')).toBeTruthy();
    const label = screen.getByText('웹 검색 완료');
    expect(label.className).toContain('text-completed');
  });

  it('shows error styling and message when failed', () => {
    render(
      <ToolCallHeader
        toolType="web_search"
        status="failed"
        isExpanded={false}
        onToggle={() => {}}
        metadata={mockMetadata}
        errorMessage="네트워크 오류"
      />
    );
    expect(screen.getByText('웹 검색')).toBeTruthy();
    expect(screen.getByText(/네트워크 오류/)).toBeTruthy();
  });

  it('calls onToggle when clicked', () => {
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
    fireEvent.click(screen.getByRole('button'));
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('renders status indicator icon', () => {
    const { container } = render(
      <ToolCallHeader
        toolType="web_search"
        status="running"
        isExpanded={false}
        onToggle={() => {}}
        metadata={mockMetadata}
      />
    );
    // Should have 2 SVGs: ChevronDown + StatusIndicator (Loader2)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(2);
  });

  it('has aria-expanded attribute', () => {
    render(
      <ToolCallHeader
        toolType="web_search"
        status="pending"
        isExpanded={true}
        onToggle={() => {}}
        metadata={mockMetadata}
      />
    );
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });
});
