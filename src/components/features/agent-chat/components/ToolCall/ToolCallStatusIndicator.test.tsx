import React from 'react';
import { render, screen } from '@testing-library/react';
import ToolCallStatusIndicator from './ToolCallStatusIndicator';

describe('ToolCallStatusIndicator', () => {
  it('renders without error for each status', () => {
    const statuses = ['pending', 'running', 'completed', 'failed', 'awaiting-input'] as const;
    statuses.forEach((status) => {
      const { container } = render(<ToolCallStatusIndicator status={status} />);
      expect(container.querySelector('svg')).toBeTruthy();
    });
  });

  it('renders spinning loader for running status', () => {
    const { container } = render(<ToolCallStatusIndicator status="running" />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('animate-spin')).toBe(true);
    expect(svg?.classList.contains('text-blue-500')).toBe(true);
  });

  it('renders check icon for completed status', () => {
    const { container } = render(<ToolCallStatusIndicator status="completed" />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('text-green-500')).toBe(true);
  });

  it('renders error icon for failed status', () => {
    const { container } = render(<ToolCallStatusIndicator status="failed" />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('text-red-500')).toBe(true);
  });

  it('renders pulsing icon for awaiting-input status', () => {
    const { container } = render(<ToolCallStatusIndicator status="awaiting-input" />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('animate-pulse')).toBe(true);
    expect(svg?.classList.contains('text-amber-500')).toBe(true);
  });

  it('renders gray circle for pending status', () => {
    const { container } = render(<ToolCallStatusIndicator status="pending" />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('text-gray-300')).toBe(true);
  });

  it('respects custom size prop', () => {
    const { container } = render(<ToolCallStatusIndicator status="running" size={16} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('16');
    expect(svg?.getAttribute('height')).toBe('16');
  });

  it('includes aria-label for accessibility', () => {
    render(<ToolCallStatusIndicator status="running" />);
    expect(screen.getByLabelText('실행 중')).toBeTruthy();
  });
});
