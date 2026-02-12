'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { SampleInterfaceContext, AppViewMode } from '../types';

interface ScenarioContextType {
  context: SampleInterfaceContext | null;
  query: string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  triggerScenario: (mode: AppViewMode, data?: any) => void;
  clearScenario: () => void;
}

const ScenarioContext = createContext<ScenarioContextType | null>(null);

export const ScenarioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agentContext, setAgentContext] = useState<SampleInterfaceContext | null>(null);
  const [agentQuery, setAgentQuery] = useState<string | undefined>(undefined);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const triggerScenario = useCallback((mode: AppViewMode, data?: any) => {
    // Handle composite data { context, query } from ChatInterface
    if (data && 'query' in data) {
      setAgentContext(data.context ?? null);
      setAgentQuery(data.query);
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
  }, []);

  const clearScenario = useCallback(() => {
    setAgentContext(null);
    setAgentQuery(undefined);
  }, []);

  const value = useMemo(() => ({
    context: agentContext,
    query: agentQuery,
    triggerScenario,
    clearScenario,
  }), [agentContext, agentQuery, triggerScenario, clearScenario]);

  return (
    <ScenarioContext.Provider value={value}>
      {children}
    </ScenarioContext.Provider>
  );
};

export const useScenario = () => {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error('useScenario must be used within a ScenarioProvider');
  }
  return context;
};
