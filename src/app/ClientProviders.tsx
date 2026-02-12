'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { NotificationProvider, ToastProvider, ScenarioProvider } from '../context';
import { Anomaly } from '../context/NotificationContext';
import AuthGuard from '../components/AuthGuard';
import Sidebar from '../components/Sidebar';
import { TooltipProvider } from '../components/ui/tooltip';

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen bg-[#FFFFFF] text-[#000000] overflow-hidden">
      <Sidebar
        isOpen={true}
        toggleSidebar={() => {}}
        onAnomalyClick={(anomaly: Anomaly) => {
          // Anomaly navigation handled by ScenarioContext + router
        }}
        onLogout={() => {
          window.location.href = '/login';
        }}
      />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 w-full h-full relative">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      <NotificationProvider>
        <ToastProvider>
          <ScenarioProvider>
            <AuthGuard>
              <AppShell>{children}</AppShell>
            </AuthGuard>
          </ScenarioProvider>
        </ToastProvider>
      </NotificationProvider>
    </TooltipProvider>
  );
}
