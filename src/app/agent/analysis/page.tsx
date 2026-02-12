'use client';

import React, { lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useScenario } from '../../../context';

const AgentChatView = lazy(() => import('../../../components/features/agent-chat/AgentChatView'));

const DEFAULT_ANALYSIS_QUERY = "Q4 매출 실적을 분석해주세요.";

export default function AgentAnalysisPage() {
  const router = useRouter();
  const { context, query } = useScenario();

  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}>
      <AgentChatView
        initialQuery={query || DEFAULT_ANALYSIS_QUERY}
        initialContext={context ?? undefined}
        onNavigateToChat={() => router.push('/chat')}
      />
    </Suspense>
  );
}
