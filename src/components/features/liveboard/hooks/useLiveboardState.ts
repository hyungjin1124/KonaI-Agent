import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  DrillLevel,
  DrillState,
  DrillMenuState,
  DrillMenuData,
  Turn,
  GridLayout,
} from '../../../../types';
import { storageService } from '../../../../services';
import { useCaptureStateInjection, StateInjectionHandlers } from '../../../../hooks';
import { WidgetId } from '../types';

interface WidgetSelectionItem {
  id: string;
  title: string;
  type: string;
  date: string;
  checked: boolean;
}

export interface UseLiveboardStateReturn {
  // View state
  showFullDashboard: boolean;
  setShowFullDashboard: (show: boolean) => void;
  isAgentOpen: boolean;
  setIsAgentOpen: (open: boolean) => void;
  agentInput: string;
  setAgentInput: (input: string) => void;

  // Dashboard tab state
  activeDashboardTab: 'default' | 'custom';
  setActiveDashboardTab: (tab: 'default' | 'custom') => void;
  customLayout: GridLayout;
  setCustomLayout: (layout: GridLayout) => void;
  customWidgets: WidgetId[];
  setCustomWidgets: (widgets: WidgetId[]) => void;

  // Layout editing state
  isEditMode: boolean;
  setIsEditMode: (edit: boolean) => void;
  editLayout: GridLayout;
  setEditLayout: (layout: GridLayout) => void;
  originalLayout: GridLayout;

  // Time filter state
  timeFilter: string;
  setTimeFilter: (filter: string) => void;
  isTimeFilterOpen: boolean;
  setIsTimeFilterOpen: (open: boolean) => void;
  timeOptions: string[];

  // Scenario states
  currentTurnIndex: number;
  setCurrentTurnIndex: (index: number) => void;
  history: Turn[];
  setHistory: React.Dispatch<React.SetStateAction<Turn[]>>;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  dashboardComponents: React.ReactNode[];
  setDashboardComponents: React.Dispatch<React.SetStateAction<React.ReactNode[]>>;

  // Drill-down states
  metalDrill: DrillState;
  setMetalDrill: React.Dispatch<React.SetStateAction<DrillState>>;
  metalMenu: DrillMenuState;
  setMetalMenu: React.Dispatch<React.SetStateAction<DrillMenuState>>;
  activeContextData: DrillMenuData | null;
  setActiveContextData: (data: DrillMenuData | null) => void;
  clientDrill: DrillState;
  setClientDrill: React.Dispatch<React.SetStateAction<DrillState>>;
  japanDrill: DrillState;
  setJapanDrill: React.Dispatch<React.SetStateAction<DrillState>>;
  didDrill: DrillState;
  setDidDrill: React.Dispatch<React.SetStateAction<DrillState>>;

  // Widget selection
  widgetSelection: WidgetSelectionItem[];
  setWidgetSelection: React.Dispatch<React.SetStateAction<WidgetSelectionItem[]>>;

  // Refs
  chatEndRef: React.RefObject<HTMLDivElement>;
  dashboardEndRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLTextAreaElement>;

  // Handlers
  handleBack: (drillSetter: React.Dispatch<React.SetStateAction<DrillState>>, index: number) => void;
  handleAgentSubmit: () => void;
  handleInputResize: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleEditToggle: () => void;
  handleSaveLayout: () => void;
  handleCancelEdit: () => void;
  handleResetLayout: () => void;
}

const ANALYST_REPORT_RESPONSE = `
**[2026년 사업 전망 보고서]**

**1. 종합 전망**
추가해주신 12월 4주차 데이터를 포함하여 분석한 결과, 2026년은 **매출 5,200억 원(+18% YoY)** 달성이 유력합니다.

**2. 핵심 성장 동력**
*   **프리미엄 라인업 확대:** Gold Edition 및 LED Metal 카드의 수요가 전년 대비 45% 증가할 것으로 예측됩니다.
*   **글로벌 시장 침투:** 일본 및 동남아 시장의 수주 잔고가 1분기부터 매출로 실현됩니다.

**3. 리스크 요인 및 대응**
*   원자재 공급망 불안정성이 존재하나, 장기 계약을 통해 2026년 상반기 물량은 이미 확보되었습니다.

상세한 내용은 하단의 리포트 파일을 다운로드하여 확인하시기 바랍니다.
`;

export function useLiveboardState(): UseLiveboardStateReturn {
  // --- State Management ---
  const [showFullDashboard, setShowFullDashboard] = useState(true);
  const [isAgentOpen, setIsAgentOpen] = useState(true);
  const [agentInput, setAgentInput] = useState("");

  // Tab State for Custom Dashboard
  const [activeDashboardTab, setActiveDashboardTab] = useState<'default' | 'custom'>('default');
  const [customLayout, setCustomLayout] = useState<GridLayout>([]);
  const [customWidgets, setCustomWidgets] = useState<WidgetId[]>([]);

  // Layout Editing State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editLayout, setEditLayout] = useState<GridLayout>([]);
  const [originalLayout, setOriginalLayout] = useState<GridLayout>([]);

  // Time Filter State
  const [timeFilter, setTimeFilter] = useState('월간');
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);
  const timeOptions = ['일간', '주간', '월간', '연간'];

  // Scenario States
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [history, setHistory] = useState<Turn[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [dashboardComponents, setDashboardComponents] = useState<React.ReactNode[]>([]);

  // Drill-down States
  const [metalDrill, setMetalDrill] = useState<DrillState>({ level: 1, path: ['Metal Card'] });
  const [metalMenu, setMetalMenu] = useState<DrillMenuState>({ isOpen: false, step: 'initial', x: 0, y: 0, data: null });
  const [activeContextData, setActiveContextData] = useState<DrillMenuData | null>(null);
  const [clientDrill, setClientDrill] = useState<DrillState>({ level: 1, path: ['Client Growth'] });
  const [japanDrill, setJapanDrill] = useState<DrillState>({ level: 1, path: ['Japan P&L'], context: '9.5' });
  const [didDrill, setDidDrill] = useState<DrillState>({ level: 1, path: ['DID Chip'] });

  // Widget Selection State
  const [widgetSelection, setWidgetSelection] = useState<WidgetSelectionItem[]>([
    { id: 'kpi', title: '주요 경영 지표 (Main KPIs)', type: 'KPI Grid', date: '2025.12.28', checked: true },
    { id: 'chart1', title: '메탈카드 월별 매출 추이', type: 'Line Chart', date: '2025.12.28', checked: true },
    { id: 'chart2', title: '원가율 개선 추이', type: 'Composed Chart', date: '2025.12.28', checked: true },
    { id: 'chart3', title: '고객사별 매출 성장 분석', type: 'Bar Chart', date: '2025.12.28', checked: true },
    { id: 'chart4', title: 'DID 칩 수주 vs 매출 흐름', type: 'Composed Chart', date: '2025.12.28', checked: true },
    { id: 'stock', title: '주식 관련 재무 지표', type: 'Stock Grid', date: '2025.12.28', checked: true },
  ]);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const dashboardEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 캡처 자동화용 상태 주입 핸들러
  const stateInjectionHandlers = useMemo<StateInjectionHandlers>(() => ({
    setActiveDashboardTab,
    setIsEditMode,
  }), []);

  // 외부 상태 주입 훅 사용
  useCaptureStateInjection(stateInjectionHandlers);

  // Load Saved Dashboard on Mount or Tab Change
  useEffect(() => {
    if (activeDashboardTab === 'custom') {
      const { layout, widgets } = storageService.loadDashboard();

      if (layout) {
        setCustomLayout(layout);
      }
      if (widgets) {
        setCustomWidgets(widgets);
      }
    }
  }, [activeDashboardTab]);

  // Auto-resize input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [agentInput]);

  // Common Back Handler
  const handleBack = useCallback((drillSetter: React.Dispatch<React.SetStateAction<DrillState>>, index: number) => {
    drillSetter((prev: DrillState) => ({
      level: (index + 1) as DrillLevel,
      path: prev.path.slice(0, index + 1),
      context: index === 0 ? undefined : prev.context
    }));
    setMetalMenu({ isOpen: false, step: 'initial', x: 0, y: 0, data: null });
  }, []);

  // Agent Submit Handler
  const handleAgentSubmit = useCallback(() => {
    if (!agentInput.trim()) return;

    const userMessage = agentInput;
    const newTurnId = Date.now();
    const isAnalystRequest = userMessage.includes("원인") || userMessage.includes("분석") || userMessage.includes("제안");

    let responseMessage = "요청하신 데이터를 분석하고 있습니다. 대시보드 지표와 연동하여 상세 리포트를 생성 중입니다...";

    if (isAnalystRequest) {
      responseMessage = ANALYST_REPORT_RESPONSE;
    }

    setHistory(prev => [...prev, {
      id: newTurnId,
      userMessage,
      aiMessage: responseMessage,
      widgets: [],
      quickReplies: [],
      isInterim: false
    }]);
    setAgentInput("");
  }, [agentInput]);

  // Input Resize Handler
  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAgentInput(e.target.value);
  };

  // Layout Editing Handlers
  const handleEditToggle = useCallback(() => {
    if (!isEditMode) {
      setOriginalLayout(JSON.parse(JSON.stringify(customLayout)));
      setEditLayout(customLayout);
    }
    setIsEditMode(!isEditMode);
  }, [isEditMode, customLayout]);

  const handleSaveLayout = useCallback(() => {
    setCustomLayout(editLayout);
    localStorage.setItem('my_dashboard_layout', JSON.stringify(editLayout));
    setIsEditMode(false);
  }, [editLayout]);

  const handleCancelEdit = useCallback(() => {
    setCustomLayout(originalLayout);
    setEditLayout(originalLayout);
    setIsEditMode(false);
  }, [originalLayout]);

  const handleResetLayout = useCallback(() => {
    if (window.confirm('대시보드를 초기화하시겠습니까? 저장된 설정이 모두 삭제됩니다.')) {
      localStorage.removeItem('my_dashboard_layout');
      localStorage.removeItem('my_dashboard_widgets');
      setCustomLayout([]);
      setCustomWidgets([]);
      setIsEditMode(false);
    }
  }, []);

  return {
    // View state
    showFullDashboard,
    setShowFullDashboard,
    isAgentOpen,
    setIsAgentOpen,
    agentInput,
    setAgentInput,

    // Dashboard tab state
    activeDashboardTab,
    setActiveDashboardTab,
    customLayout,
    setCustomLayout,
    customWidgets,
    setCustomWidgets,

    // Layout editing state
    isEditMode,
    setIsEditMode,
    editLayout,
    setEditLayout,
    originalLayout,

    // Time filter state
    timeFilter,
    setTimeFilter,
    isTimeFilterOpen,
    setIsTimeFilterOpen,
    timeOptions,

    // Scenario states
    currentTurnIndex,
    setCurrentTurnIndex,
    history,
    setHistory,
    isTyping,
    setIsTyping,
    dashboardComponents,
    setDashboardComponents,

    // Drill-down states
    metalDrill,
    setMetalDrill,
    metalMenu,
    setMetalMenu,
    activeContextData,
    setActiveContextData,
    clientDrill,
    setClientDrill,
    japanDrill,
    setJapanDrill,
    didDrill,
    setDidDrill,

    // Widget selection
    widgetSelection,
    setWidgetSelection,

    // Refs
    chatEndRef,
    dashboardEndRef,
    inputRef,

    // Handlers
    handleBack,
    handleAgentSubmit,
    handleInputResize,
    handleEditToggle,
    handleSaveLayout,
    handleCancelEdit,
    handleResetLayout,
  };
}
