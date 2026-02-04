import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import { AgentChatView } from './components/features/agent-chat';
import { GeneralChatView } from './components/features/general-chat';
import DataManagementView from './components/DataManagementView';
import SkillManagementView from './components/SkillManagementView';
import AdminView from './components/AdminView';
import ChatHistoryView from './components/ChatHistoryView';
import LoginView from './components/LoginView';
import { LiveboardView } from './components/features/liveboard';
import { ViewType, SampleInterfaceContext, AppViewMode } from './types';
import { NotificationProvider, Anomaly, ToastProvider } from './context';
import { useCaptureStateInjection, StateInjectionHandlers } from './hooks';

// Scenario trigger data type
interface ScenarioTriggerData {
  context?: SampleInterfaceContext;
  query?: string;
}

interface AppContentProps {
  onLogout: () => void;
}

const AppContent: React.FC<AppContentProps> = ({ onLogout }) => {
  const [viewMode, setViewMode] = useState<AppViewMode>('landing');
  const [agentContext, setAgentContext] = useState<AgentChatViewContext | null>(null);
  const [agentQuery, setAgentQuery] = useState<string | undefined>(undefined);

  // 캡처 자동화용 상태 주입 핸들러
  const stateInjectionHandlers = useMemo<StateInjectionHandlers>(() => ({
    setViewMode,
    setAgentContext,
    setAgentQuery,
  }), []);

  // 외부 상태 주입 훅 사용 (Puppeteer 캡처 자동화 지원)
  useCaptureStateInjection(stateInjectionHandlers);

  const handleSidebarNavigate = (view: ViewType) => {
    // If user clicks "Data Management"
    if (view === 'data') {
        setViewMode('data_management');
        setAgentContext(null);
        setAgentQuery(undefined);
        return;
    }
    
    // If user clicks "Skill Management"
    if (view === 'skills') {
        setViewMode('skills_management');
        setAgentContext(null);
        setAgentQuery(undefined);
        return;
    }

    // If user clicks "Admin"
    if (view === 'admin') {
        setViewMode('admin_management');
        setAgentContext(null);
        setAgentQuery(undefined);
        return;
    }

    // If user clicks "History"
    if (view === 'history') {
        setViewMode('history_view');
        setAgentContext(null);
        setAgentQuery(undefined);
        return;
    }

    // If user clicks "General Chat"
    if (view === 'general-chat') {
        setViewMode('general_chat');
        setAgentContext(null);
        setAgentQuery(undefined);
        return;
    }

    // If user clicks "Dashboard" (which maps to 'dashboard' ID in Sidebar), go to Landing
    if (view === 'dashboard') {
      setViewMode('landing');
      setAgentContext(null);
      setAgentQuery(undefined);
    }
    // 'chat' is technically the current default view in Sidebar logic, keeping it consistent
    if (view === 'chat') {
        setViewMode('landing');
        setAgentContext(null);
        setAgentQuery(undefined);
    }
  };

  const handleScenarioTrigger = (mode: AppViewMode, data?: ScenarioTriggerData | SampleInterfaceContext) => {
    // Handle composite data { context, query } from ChatInterface
    if (data && 'query' in data) {
      const triggerData = data as ScenarioTriggerData;
      setAgentContext(triggerData.context ?? null);
      setAgentQuery(triggerData.query);
    } else if (data && 'name' in data) {
      setAgentContext(data as SampleInterfaceContext);
      setAgentQuery(undefined);
    } else {
      setAgentContext(null);
      setAgentQuery(undefined);
    }

    // Special case for PPT trigger button
    if (mode === 'scenario_ppt') {
      setAgentQuery("Q4 2025 경영 실적 보고서 PPT를 만들어주세요.");
    }

    setViewMode(mode);
  };

  // Handler for clicking an anomaly in the notification popup
  const handleAnomalyNavigation = (anomaly: Anomaly) => {
    // Switch to analysis mode
    setViewMode('scenario_analysis');
    // Inject the anomaly context
    setAgentContext(anomaly.contextData);
    // Optionally set a query to trigger the agent immediately (SampleInterface handles this)
    setAgentQuery(anomaly.contextData.agentMessage ? `[Auto-Trigger] ${anomaly.title} 상세 분석` : undefined);
  };

  // Helper to determine current sidebar active state
  const getCurrentSidebarView = (): ViewType => {
      if (viewMode === 'data_management') return 'data';
      if (viewMode === 'skills_management') return 'skills';
      if (viewMode === 'admin_management') return 'admin';
      if (viewMode === 'history_view') return 'history';
      if (viewMode === 'general_chat') return 'general-chat';
      return viewMode === 'landing' ? 'dashboard' : 'chat';
  };

  return (
    <div className="flex flex-col h-screen bg-[#FFFFFF] text-[#000000] overflow-hidden">
      {/* Top Navigation */}
      <Sidebar
        isOpen={true}
        toggleSidebar={() => {}}
        currentView={getCurrentSidebarView()}
        onNavigate={handleSidebarNavigate}
        onAnomalyClick={handleAnomalyNavigation}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 w-full h-full relative">
           {viewMode === 'general_chat' ? (
             <GeneralChatView />
           ) : viewMode === 'data_management' ? (
             <DataManagementView />
           ) : viewMode === 'skills_management' ? (
             <SkillManagementView />
           ) : viewMode === 'admin_management' ? (
             <AdminView />
           ) : viewMode === 'history_view' ? (
             <ChatHistoryView />
           ) : viewMode === 'liveboard' ? (
             <LiveboardView />
           ) : viewMode === 'scenario_ppt' ? (
             <AgentChatView
                initialQuery={agentQuery}
             />
           ) : viewMode === 'landing' ? (
             <ChatInterface
                onScenarioTrigger={() => handleScenarioTrigger('scenario_ppt')}
                onAskAgent={(data) => handleScenarioTrigger('scenario_analysis', data)}
             />
           ) : (
             <AgentChatView
                initialQuery={agentQuery}
                initialContext={viewMode === 'scenario_analysis' ? agentContext : undefined}
             />
           )}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  // Login State Management
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 캡처 자동화용 상태 주입 핸들러 (로그인 상태 제어)
  const loginInjectionHandlers = useMemo<StateInjectionHandlers>(() => ({
    setIsLoggedIn,
  }), []);

  // 외부 상태 주입 훅 사용 (Puppeteer에서 로그인 상태 직접 제어 가능)
  useCaptureStateInjection(loginInjectionHandlers);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // If not logged in, render Login View
  if (!isLoggedIn) {
    return <LoginView onLogin={() => setIsLoggedIn(true)} />;
  }

  // If logged in, render Main App content wrapped in Providers
  return (
    <NotificationProvider>
      <ToastProvider>
        <AppContent onLogout={handleLogout} />
      </ToastProvider>
    </NotificationProvider>
  );
};

export default App;
