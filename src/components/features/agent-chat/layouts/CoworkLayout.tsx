import React, { useCallback, useRef, useState, useEffect } from 'react';

interface CoworkLayoutProps {
  // 좌측 패널 (대화)
  leftPanel: React.ReactNode;
  // 중앙 패널 (Artifact Preview - 조건부)
  centerPanel?: React.ReactNode;
  isCenterPanelOpen: boolean;
  // 우측 패널 (사이드바)
  rightPanel: React.ReactNode;
  isRightPanelCollapsed: boolean;
  // 하단 (입력 영역) - 좌측 패널 하단에 포함
  inputArea?: React.ReactNode;
  // 리사이즈
  onLeftPanelResize?: (width: number) => void;
  onCenterPanelResize?: (width: number) => void;
  // 설정
  rightPanelWidth?: number; // 픽셀 단위, 기본값 320
  minLeftPanelWidth?: number; // 퍼센트 단위, 기본값 30
  minCenterPanelWidth?: number; // 퍼센트 단위, 기본값 30
}

const RIGHT_PANEL_WIDTH = 320;
const RIGHT_PANEL_COLLAPSED_WIDTH = 48;
const MIN_LEFT_PANEL_PERCENT = 30;
const MIN_CENTER_PANEL_PERCENT = 30;

export const CoworkLayout: React.FC<CoworkLayoutProps> = ({
  leftPanel,
  centerPanel,
  isCenterPanelOpen,
  rightPanel,
  isRightPanelCollapsed,
  inputArea,
  onLeftPanelResize,
  onCenterPanelResize,
  rightPanelWidth = RIGHT_PANEL_WIDTH,
  minLeftPanelWidth = MIN_LEFT_PANEL_PERCENT,
  minCenterPanelWidth = MIN_CENTER_PANEL_PERCENT,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [leftPanelPercent, setLeftPanelPercent] = useState(isCenterPanelOpen ? 35 : 100);

  // 레이아웃 모드에 따른 기본값 업데이트
  useEffect(() => {
    if (isCenterPanelOpen) {
      // 3-panel 모드: 좌측 35%, 중앙 나머지, 우측 고정
      setLeftPanelPercent(35);
    } else {
      // 2-panel 모드: 좌측 100%, 우측 고정
      setLeftPanelPercent(100);
    }
  }, [isCenterPanelOpen]);

  // 리사이즈 핸들러
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingLeft(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizingLeft || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const effectiveRightWidth = isRightPanelCollapsed ? RIGHT_PANEL_COLLAPSED_WIDTH : rightPanelWidth;
      const availableWidth = containerRect.width - effectiveRightWidth;

      // 마우스 위치를 좌측 패널 너비 퍼센트로 계산
      const mouseX = e.clientX - containerRect.left;
      let newLeftPercent = (mouseX / availableWidth) * 100;

      // 최소/최대 범위 제한
      newLeftPercent = Math.max(minLeftPanelWidth, newLeftPercent);
      if (isCenterPanelOpen) {
        newLeftPercent = Math.min(100 - minCenterPanelWidth, newLeftPercent);
      }

      setLeftPanelPercent(newLeftPercent);
      onLeftPanelResize?.(newLeftPercent);
    },
    [isResizingLeft, isRightPanelCollapsed, rightPanelWidth, isCenterPanelOpen, minLeftPanelWidth, minCenterPanelWidth, onLeftPanelResize]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizingLeft(false);
  }, []);

  // 마우스 이벤트 리스너
  useEffect(() => {
    if (isResizingLeft) {
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
  }, [isResizingLeft, handleMouseMove, handleMouseUp]);

  // 레이아웃 계산
  const getLayoutStyles = () => {
    const effectiveRightWidth = isRightPanelCollapsed ? RIGHT_PANEL_COLLAPSED_WIDTH : rightPanelWidth;

    if (isCenterPanelOpen) {
      // 3-Panel 모드
      return {
        left: { width: `calc(${leftPanelPercent}% - ${(effectiveRightWidth * leftPanelPercent) / 100}px)` },
        center: { width: `calc(${100 - leftPanelPercent}% - ${(effectiveRightWidth * (100 - leftPanelPercent)) / 100}px)` },
        right: { width: `${effectiveRightWidth}px` },
      };
    } else {
      // 2-Panel 모드 (중앙 닫힘)
      return {
        left: { width: `calc(100% - ${effectiveRightWidth}px)` },
        center: { width: '0px', display: 'none' },
        right: { width: `${effectiveRightWidth}px` },
      };
    }
  };

  const layoutStyles = getLayoutStyles();

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full overflow-hidden bg-white"
    >
      {/* 좌측 패널 (대화 + 입력 영역) */}
      <div
        className="flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out"
        style={layoutStyles.left}
      >
        {/* 채팅 영역 */}
        <div className="flex-1 overflow-hidden">
          {leftPanel}
        </div>
        {/* 입력 영역 */}
        {inputArea && (
          <div className="shrink-0">
            {inputArea}
          </div>
        )}
      </div>

      {/* 리사이즈 핸들 (3-panel 모드일 때만) */}
      {isCenterPanelOpen && (
        <div
          className={`w-1 cursor-col-resize flex-shrink-0 transition-colors hover:bg-[#FF3C42] ${
            isResizingLeft ? 'bg-[#FF3C42]' : 'bg-gray-200'
          }`}
          onMouseDown={handleMouseDown}
        />
      )}

      {/* 중앙 패널 (Artifact Preview) */}
      {isCenterPanelOpen && centerPanel && (
        <div
          className="h-full overflow-hidden transition-all duration-300 ease-in-out"
          style={layoutStyles.center}
        >
          {centerPanel}
        </div>
      )}

      {/* 우측 패널 (사이드바) */}
      <div
        className={`h-full overflow-hidden border-l border-gray-200 transition-all duration-300 ease-in-out ${
          isRightPanelCollapsed ? 'bg-gray-50' : 'bg-gray-50/50'
        }`}
        style={layoutStyles.right}
      >
        {rightPanel}
      </div>
    </div>
  );
};

export default CoworkLayout;
