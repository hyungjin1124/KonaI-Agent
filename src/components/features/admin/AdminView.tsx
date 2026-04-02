'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Users, Activity, MessageSquare } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UserManagementSection } from './components/UserManagementSection';
import { MonitoringSection } from './components/MonitoringSection';
import { ConversationHistorySection } from './components/ConversationHistorySection';

// ── Types ─────────────────────────────────────────────────────────────────────

type AdminTab = 'users' | 'operations' | 'conversations';

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = (searchParams.get('tab') as AdminTab) || 'users';

  const userId = searchParams.get('userId');

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'users') {
      params.delete('tab');
    } else {
      params.set('tab', value);
    }
    // Clear cross-nav params when switching tabs
    params.delete('innerTab');
    params.delete('groupId');
    params.delete('userId');
    const qs = params.toString();
    router.replace(`/admin${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  const tabTriggerClass =
    'rounded-none border-b-2 border-transparent px-4 pb-2.5 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700 data-[state=active]:border-[#FF3C42] data-[state=active]:text-[#FF3C42] data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAFAFA]">
      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        className="flex flex-col h-full"
      >
        {/* Tab header */}
        <div className="px-6 pt-5 pb-0 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">관리자</h1>
          </div>
          <TabsList className="bg-transparent p-0 h-auto gap-0 rounded-none">
            <TabsTrigger value="users" className={tabTriggerClass}>
              <Users className="h-4 w-4 mr-1.5" />
              사용자 관리
            </TabsTrigger>
            <TabsTrigger value="operations" className={tabTriggerClass}>
              <Activity className="h-4 w-4 mr-1.5" />
              운영 현황
            </TabsTrigger>
            <TabsTrigger value="conversations" className={tabTriggerClass}>
              <MessageSquare className="h-4 w-4 mr-1.5" />
              대화 이력
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab content */}
        <TabsContent value="users" className="flex-1 flex flex-col min-h-0 mt-0 p-6">
          <UserManagementSection
            initialUserId={userId}
          />
        </TabsContent>

        <TabsContent value="operations" className="flex-1 overflow-y-auto mt-0 p-6">
          <MonitoringSection />
        </TabsContent>

        <TabsContent value="conversations" className="flex-1 overflow-y-auto mt-0 p-6">
          <ConversationHistorySection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
