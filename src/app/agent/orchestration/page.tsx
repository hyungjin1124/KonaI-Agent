'use client';

import React, { lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useScenario } from '../../../context';

const AgentChatView = lazy(() => import('../../../components/features/agent-chat/AgentChatView'));

const DEFAULT_MULTI_AGENT_QUERY = "종합 보고서를 멀티 에이전트 팀으로 작성해주세요.";

export default function AgentOrchestrationPage() {
  const router = useRouter();
  const { query } = useScenario();

  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}>
      <AgentChatView
        initialQuery={query || DEFAULT_MULTI_AGENT_QUERY}
        onNavigateToChat={() => router.push('/chat')}
      />
    </Suspense>
  );
}
