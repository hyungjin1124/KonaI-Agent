'use client';

import React, { lazy, Suspense } from 'react';

const ScheduledTasksView = lazy(() =>
  import('../../../components/features/scheduled-tasks').then(m => ({ default: m.ScheduledTasksView }))
);

export default function ScheduledTasksPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}>
      <ScheduledTasksView />
    </Suspense>
  );
}
