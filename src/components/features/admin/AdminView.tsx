'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Users, Activity } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UserManagementSection } from './components/UserManagementSection';
import { MonitoringSection } from './components/MonitoringSection';

// ── Types ─────────────────────────────────────────────────────────────────────

type AdminTab = 'users' | 'monitoring';

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = (searchParams.get('tab') as AdminTab) || 'users';

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'users') {
      params.delete('tab');
    } else {
      params.set('tab', value);
    }
    const qs = params.toString();
    router.replace(`/admin${qs ? `?${qs}` : ''}`, { scroll: false });
  };

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
            <TabsTrigger
              value="users"
              className="rounded-none border-b-2 border-transparent px-4 pb-2.5 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700 data-[state=active]:border-[#FF3C42] data-[state=active]:text-[#FF3C42] data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors"
            >
              <Users className="h-4 w-4 mr-1.5" />
              사용자 관리
            </TabsTrigger>
            <TabsTrigger
              value="monitoring"
              className="rounded-none border-b-2 border-transparent px-4 pb-2.5 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700 data-[state=active]:border-[#FF3C42] data-[state=active]:text-[#FF3C42] data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors"
            >
              <Activity className="h-4 w-4 mr-1.5" />
              모니터링
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab content */}
        <TabsContent value="users" className="flex-1 overflow-y-auto mt-0 p-6">
          <UserManagementSection />
        </TabsContent>

        <TabsContent value="monitoring" className="flex-1 overflow-y-auto mt-0 p-6">
          <MonitoringSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
