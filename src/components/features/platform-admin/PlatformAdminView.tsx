'use client';

import React, { useCallback, Suspense, lazy } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Building2, Activity, Banknote, Bell, CreditCard, FileText, Sparkles,
  MessageSquare, AlertCircle, ThumbsUp,
} from '../../icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { ErrorBoundary } from '../../ui/error-boundary';
import TenantManagementTab from './components/TenantManagementTab';

const ConversationsTab = lazy(() => import('./components/ConversationsTab'));
const ErrorDashboardTab = lazy(() => import('./components/ErrorDashboardTab'));
const ActivityMonitoringTab = lazy(() => import('./components/ActivityMonitoringTab'));
const AlertManagementTab = lazy(() => import('./components/AlertManagementTab'));
const CostManagementTab = lazy(() => import('./components/CostManagementTab'));
const BillingTab = lazy(() => import('./components/BillingTab'));
const PlatformAuditLogTab = lazy(() => import('./components/PlatformAuditLogTab'));
const FeedbackMonitoringTab = lazy(() => import('./components/FeedbackMonitoringTab'));
const PlatformAIQualityTab = lazy(() => import('./components/PlatformAIQualityTab'));

const TabFallback = () => (
  <div className="flex items-center justify-center py-16 text-sm text-gray-400">
    로딩 중...
  </div>
);

const PA_TABS = [
  'tenants', 'conversations', 'errors', 'activity', 'alerts',
  'cost', 'billing', 'audit',
  'feedback', 'ai-quality',
] as const;
type PATab = typeof PA_TABS[number];

const SectionDivider = () => <div className="w-px h-5 bg-gray-300 mx-1 flex-shrink-0" />;

const PlatformAdminView: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const rawTab = searchParams.get('tab');
  const activeTab: PATab = PA_TABS.includes(rawTab as PATab) ? (rawTab as PATab) : 'tenants';
  const setActiveTab = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col bg-[#F7F9FB] animate-fade-in-up overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Platform Administration</h1>
            <p className="text-sm text-gray-500 mt-0.5">KonaI 에이전트 서비스의 전체 테넌트 및 운영을 관리합니다.</p>
          </div>
        </div>
        <TabsList className="bg-gray-100 p-1 rounded-lg h-auto flex-wrap gap-0.5">
          {/* Operations */}
          <span className="text-[10px] text-gray-400 uppercase tracking-wider px-2 py-1 self-center select-none">Operations</span>
          <TabsTrigger value="tenants" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
            <Building2 size={16} /> 테넌트 관리
          </TabsTrigger>
          <TabsTrigger value="conversations" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
            <MessageSquare size={16} /> 대화 모니터링
          </TabsTrigger>
          <TabsTrigger value="errors" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
            <AlertCircle size={16} /> 에러 대시보드
          </TabsTrigger>
          <TabsTrigger value="activity" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
            <Activity size={16} /> 활동 모니터링
          </TabsTrigger>
          <TabsTrigger value="alerts" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
            <Bell size={16} /> 알림 관리
          </TabsTrigger>

          <SectionDivider />

          {/* BI */}
          <span className="text-[10px] text-gray-400 uppercase tracking-wider px-2 py-1 self-center select-none">BI</span>
          <TabsTrigger value="cost" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
            <Banknote size={16} /> 비용 관리
          </TabsTrigger>
          <TabsTrigger value="billing" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
            <CreditCard size={16} /> 과금/빌링
          </TabsTrigger>
          <TabsTrigger value="audit" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
            <FileText size={16} /> 감사 로그
          </TabsTrigger>

          <SectionDivider />

          {/* Quality */}
          <span className="text-[10px] text-gray-400 uppercase tracking-wider px-2 py-1 self-center select-none">Quality</span>
          <TabsTrigger value="feedback" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
            <ThumbsUp size={16} /> 피드백 모니터링
          </TabsTrigger>
          <TabsTrigger value="ai-quality" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
            <Sparkles size={16} /> AI 품질 관리
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-7xl mx-auto pb-10">
          <TabsContent value="tenants" className="mt-0">
            <ErrorBoundary><TenantManagementTab /></ErrorBoundary>
          </TabsContent>
          <TabsContent value="conversations" className="mt-0">
            <ErrorBoundary><Suspense fallback={<TabFallback />}><ConversationsTab /></Suspense></ErrorBoundary>
          </TabsContent>
          <TabsContent value="errors" className="mt-0">
            <ErrorBoundary><Suspense fallback={<TabFallback />}><ErrorDashboardTab /></Suspense></ErrorBoundary>
          </TabsContent>
          <TabsContent value="activity" className="mt-0">
            <ErrorBoundary><Suspense fallback={<TabFallback />}><ActivityMonitoringTab /></Suspense></ErrorBoundary>
          </TabsContent>
          <TabsContent value="alerts" className="mt-0">
            <ErrorBoundary><Suspense fallback={<TabFallback />}><AlertManagementTab /></Suspense></ErrorBoundary>
          </TabsContent>
          <TabsContent value="cost" className="mt-0">
            <ErrorBoundary><Suspense fallback={<TabFallback />}><CostManagementTab onNavigateToTab={setActiveTab} /></Suspense></ErrorBoundary>
          </TabsContent>
          <TabsContent value="billing" className="mt-0">
            <ErrorBoundary><Suspense fallback={<TabFallback />}><BillingTab /></Suspense></ErrorBoundary>
          </TabsContent>
          <TabsContent value="audit" className="mt-0">
            <ErrorBoundary><Suspense fallback={<TabFallback />}><PlatformAuditLogTab /></Suspense></ErrorBoundary>
          </TabsContent>
          <TabsContent value="feedback" className="mt-0">
            <ErrorBoundary><Suspense fallback={<TabFallback />}><FeedbackMonitoringTab /></Suspense></ErrorBoundary>
          </TabsContent>
          <TabsContent value="ai-quality" className="mt-0">
            <ErrorBoundary><Suspense fallback={<TabFallback />}><PlatformAIQualityTab /></Suspense></ErrorBoundary>
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
};

export default PlatformAdminView;
