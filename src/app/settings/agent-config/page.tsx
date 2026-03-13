'use client';

import React, { lazy, Suspense } from 'react';

const AgentConfigView = lazy(() =>
  import('../../../components/features/agent-config').then(m => ({ default: m.AgentConfigView }))
);

export default function AgentConfigPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}>
      <AgentConfigView />
    </Suspense>
  );
}
