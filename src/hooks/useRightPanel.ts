import { useState, useCallback, useEffect, useRef, RefObject } from 'react';
import { RightPanelType, Artifact } from '../components/features/agent-chat/types';

/**
 * 패널 리사이즈 옵션
 */
interface ResizeOptions {
  minWidth?: number; // 최소 너비 (퍼센트)
  maxWidth?: number; // 최대 너비 (퍼센트)
  defaultWidth?: number; // 기본 너비 (퍼센트)
}

/**
 * 우측 패널 컨텍스트 (히스토리 메시지 클릭 시 사용)
 */
export interface RightPanelContext {
  dashboardType: 'financial' | 'did' | 'ppt';
  pptStatus?: 'idle' | 'setup' | 'generating' | 'done';
  dashboardScenario?: string;
}

/**
 * useRightPanel 훅 반환 타입
 */
interface UseRightPanelReturn {
  // 상태
  isCollapsed: boolean;
  panelWidth: number;
  panelType: RightPanelType;
  isResizing: boolean;

  // Actions
  togglePanel: () => void;
  setIsCollapsed: (collapsed: boolean) => void;
  setPanelType: (type: RightPanelType) => void;
  openArtifactsPanel: () => void;
  openRightPanelWithContext: (context: RightPanelContext) => void;

  // 리사이즈 핸들러
  handleResizeStart: (e: React.MouseEvent) => void;

  // 아티팩트 관련
  handleArtifactClick: (
    artifact: Artifact,
    setDashboardType: (type: 'financial' | 'did' | 'ppt') => void,
    setDashboardScenario: (scenario: string | undefined) => void
  ) => void;
}

const DEFAULT_RESIZE_OPTIONS: ResizeOptions = {
  minWidth: 25,
  maxWidth: 70,
  defaultWidth: 60,
};

/**
 * 우측 패널 상태 관리 커스텀 훅
 *
 * AgentChatView에서 우측 패널 관련 상태 로직을 분리하여 관리
 */
export function useRightPanel(
  containerRef: RefObject<HTMLDivElement>,
  options: ResizeOptions = {}
): UseRightPanelReturn {
  const { minWidth, maxWidth, defaultWidth } = { ...DEFAULT_RESIZE_OPTIONS, ...options };

  // 상태
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [panelWidth, setPanelWidth] = useState(defaultWidth!);
  const [panelType, setPanelType] = useState<RightPanelType>('dashboard');
  const [isResizing, setIsResizing] = useState(false);

  /**
   * 패널 토글
   */
  const togglePanel = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  /**
   * 아티팩트 패널 열기
   */
  const openArtifactsPanel = useCallback(() => {
    setPanelType('artifacts');
    setIsCollapsed(false);
  }, []);

  /**
   * 컨텍스트와 함께 우측 패널 열기
   */
  const openRightPanelWithContext = useCallback((context: RightPanelContext) => {
    // 외부에서 dashboardType, pptStatus, dashboardScenario 설정 필요
    // 이 훅에서는 패널 열기만 담당
    setIsCollapsed(false);
    setPanelType('dashboard');
  }, []);

  /**
   * 리사이즈 시작 핸들러
   */
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  /**
   * 아티팩트 클릭 핸들러
   */
  const handleArtifactClick = useCallback((
    artifact: Artifact,
    setDashboardType: (type: 'financial' | 'did' | 'ppt') => void,
    setDashboardScenario: (scenario: string | undefined) => void
  ) => {
    setPanelType('dashboard');

    switch (artifact.type) {
      case 'ppt':
        setDashboardType('ppt');
        setIsCollapsed(false);
        break;
      case 'chart':
        setDashboardType('financial');
        if (artifact.id.includes('sales')) {
          setDashboardScenario('sales_analysis');
        } else if (artifact.id.includes('anomaly')) {
          setDashboardScenario('anomaly_cost_spike');
        }
        setIsCollapsed(false);
        break;
      default:
        console.log('Unsupported artifact type:', artifact.type);
    }
  }, []);

  /**
   * 리사이즈 마우스 이동 및 해제 이벤트 처리
   * RAF throttling으로 60fps 제한 (js-batch-dom-css)
   */
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      // RAF throttle: 한 프레임에 한 번만 DOM 업데이트
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const mouseX = e.clientX - containerRect.left;

        const leftPanelPercent = (mouseX / containerWidth) * 100;
        const rightPanelPercent = 100 - leftPanelPercent;

        if (rightPanelPercent >= minWidth! && rightPanelPercent <= maxWidth!) {
          setPanelWidth(rightPanelPercent);
        }
      });
    };

    const handleMouseUp = () => {
      cancelAnimationFrame(rafRef.current);
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, containerRef, minWidth, maxWidth]);

  return {
    isCollapsed,
    panelWidth,
    panelType,
    isResizing,
    togglePanel,
    setIsCollapsed,
    setPanelType,
    openArtifactsPanel,
    openRightPanelWithContext,
    handleResizeStart,
    handleArtifactClick,
  };
}

export default useRightPanel;
