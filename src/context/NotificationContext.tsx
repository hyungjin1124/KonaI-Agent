
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// 이상 징후 데이터 인터페이스 정의
export interface Anomaly {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  metric: string;
  timestamp: string;
  description: string;
  isRead: boolean;
  // 상세 분석을 위한 메타 데이터
  contextData: {
    name: string; // 예: '12월 원가율 급등'
    scenario: string; // Dashboard 등에서 사용할 시나리오 키
    agentMessage: string; // 에이전트 초기 분석 메시지
  };
}

interface NotificationContextType {
  anomalies: Anomaly[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addAnomaly: (anomaly: Anomaly) => void; // 데모용 트리거
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 초기 목업 데이터 (데모 시나리오)
  const [anomalies, setAnomalies] = useState<Anomaly[]>([
    {
      id: 'anom_001',
      type: 'critical',
      title: '제조 원가율 급등 경보',
      metric: 'Cost Efficiency',
      timestamp: '10분 전',
      description: '메탈 카드 공정 원가율이 목표치(65%)를 7%p 초과했습니다.',
      isRead: false,
      contextData: {
        name: '원가율 이상 징후',
        scenario: 'anomaly_cost_spike',
        agentMessage: '현재 메탈 카드 공정의 **원가율이 72%로 급등**하는 이상 징후가 포착되었습니다. 주요 원인은 원자재 가격 변동과 3라인 자동화 설비의 일시적 가동 중단으로 분석됩니다.'
      }
    },
    {
      id: 'anom_002',
      type: 'warning',
      title: '일본 지사 매출 감소 예측',
      metric: 'Revenue Forecast',
      timestamp: '1시간 전',
      description: '환율 변동으로 인한 Q1 예상 매출 -5% 하향 조정 필요.',
      isRead: false,
      contextData: {
        name: '일본 매출 경보',
        scenario: 'sales_analysis',
        agentMessage: '엔화 약세 지속으로 인해 일본 지사 Q1 매출 목표 달성에 경고등이 켜졌습니다.'
      }
    }
  ]);

  const unreadCount = anomalies.filter(a => !a.isRead).length;

  const markAsRead = useCallback((id: string) => {
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  }, []);

  const markAllAsRead = useCallback(() => {
    setAnomalies(prev => prev.map(a => ({ ...a, isRead: true })));
  }, []);

  const addAnomaly = useCallback((anomaly: Anomaly) => {
    setAnomalies(prev => [anomaly, ...prev]);
  }, []);

  const value = useMemo(() => ({
    anomalies, unreadCount, markAsRead, markAllAsRead, addAnomaly
  }), [anomalies, unreadCount, markAsRead, markAllAsRead, addAnomaly]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
