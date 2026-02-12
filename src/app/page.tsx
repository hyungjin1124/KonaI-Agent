'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ChatInterface from '../components/ChatInterface';
import { useScenario } from '../context';

export default function DashboardPage() {
  const router = useRouter();
  const { triggerScenario } = useScenario();

  return (
    <ChatInterface
      onScenarioTrigger={() => {
        triggerScenario('scenario_ppt');
        router.push('/agent/ppt');
      }}
      onAskAgent={(data) => {
        triggerScenario('scenario_analysis', data);
        router.push('/agent/analysis');
      }}
    />
  );
}
