'use client';

import React, { lazy, Suspense } from 'react';

const DataPageView = lazy(() => import('../../components/features/data/DataPageView'));

export default function DataPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF3C42]" /></div>}>
      <DataPageView />
    </Suspense>
  );
}
