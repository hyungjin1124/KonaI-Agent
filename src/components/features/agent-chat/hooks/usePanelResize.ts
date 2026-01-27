import { useState, useEffect, useCallback, RefObject } from 'react';

const MIN_PANEL_WIDTH = 25; // 최소 25%
const MAX_PANEL_WIDTH = 70; // 최대 70%

interface UsePanelResizeOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  initialWidth?: number;
}

interface UsePanelResizeReturn {
  isRightPanelCollapsed: boolean;
  rightPanelWidth: number;
  isResizing: boolean;
  handleResizeStart: (e: React.MouseEvent) => void;
  toggleRightPanel: () => void;
}

export function usePanelResize({
  containerRef,
  initialWidth = 50,
}: UsePanelResizeOptions): UsePanelResizeReturn {
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const toggleRightPanel = useCallback(() => {
    setIsRightPanelCollapsed(prev => !prev);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;

      // 좌측 패널 비율 계산 (마우스 위치 기준)
      const leftPanelPercent = (mouseX / containerWidth) * 100;
      const rightPanelPercent = 100 - leftPanelPercent;

      // 범위 제한
      if (rightPanelPercent >= MIN_PANEL_WIDTH && rightPanelPercent <= MAX_PANEL_WIDTH) {
        setRightPanelWidth(rightPanelPercent);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, containerRef]);

  return {
    isRightPanelCollapsed,
    rightPanelWidth,
    isResizing,
    handleResizeStart,
    toggleRightPanel,
  };
}
