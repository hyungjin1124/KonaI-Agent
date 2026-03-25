'use client';

import React, { lazy, Suspense } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';

const SkillsPageView = lazy(() => import('../../../components/features/skill-management/SkillsPageView'));

export default function SkillsPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
        </div>
      }>
        <SkillsPageView />
      </Suspense>
    </ErrorBoundary>
  );
}
