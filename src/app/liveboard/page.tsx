'use client';

import React, { lazy, Suspense } from 'react';

const LiveboardView = lazy(() => import('../../components/features/liveboard/LiveboardView'));

export default function LiveboardPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}>
      <LiveboardView />
    </Suspense>
  );
}
