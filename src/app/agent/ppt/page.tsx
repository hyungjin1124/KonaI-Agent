'use client';

import React, { lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useScenario } from '../../../context';

const AgentChatView = lazy(() => import('../../../components/features/agent-chat/AgentChatView'));

const DEFAULT_PPT_QUERY = "Q4 2025 경영 실적 보고서 PPT를 만들어주세요.";

export default function AgentPPTPage() {
  const router = useRouter();
  const { query } = useScenario();

  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}>
      <AgentChatView
        initialQuery={query || DEFAULT_PPT_QUERY}
        onNavigateToChat={() => router.push('/chat')}
      />
    </Suspense>
  );
}
