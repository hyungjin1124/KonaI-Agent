'use client';

import React, { lazy, Suspense } from 'react';
import { ErrorBoundary } from '../../components/ui/error-boundary';
import { useAdminGuard } from '../../hooks/useAdminGuard';

const PlatformAdminView = lazy(() => import('../../components/features/platform-admin/PlatformAdminView'));

export default function PlatformAdminPage() {
  const { isAllowed, isChecking } = useAdminGuard();

  if (isChecking) {
    return (
      <div role="status" aria-label="인증 확인 중..." className="flex-1 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full gap-3">
        <p className="text-sm font-semibold text-red-600">접근 권한이 없습니다</p>
        <p className="text-xs text-gray-500">관리자 계정으로 로그인해주세요.</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<div role="status" aria-label="플랫폼 관리자 페이지 로딩 중..." className="flex-1 flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}>
        <PlatformAdminView />
      </Suspense>
    </ErrorBoundary>
  );
}
