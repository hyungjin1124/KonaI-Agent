'use client';

import React, { lazy, Suspense } from 'react';

const AgentMarketplaceView = lazy(() =>
  import('../../../components/features/agent-marketplace').then(m => ({ default: m.AgentMarketplaceView }))
);

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}>
      <AgentMarketplaceView />
    </Suspense>
  );
}
