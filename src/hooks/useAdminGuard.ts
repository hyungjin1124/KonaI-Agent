'use client';

import { useEffect, useState } from 'react';

/**
 * Demo-level admin route guard.
 * Checks for a demo auth flag in sessionStorage.
 * In production, replace with real auth middleware.
 */
export function useAdminGuard(): { isAllowed: boolean; isChecking: boolean } {
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    // Demo: consider authenticated if any session flag or localStorage user exists
    const hasSession =
      typeof window !== 'undefined' &&
      (sessionStorage.getItem('konai_demo_auth') === 'true' ||
       localStorage.getItem('konai_demo_user') !== null);

    // For demo purposes, always allow access but set the flag
    // This ensures the guard infrastructure is in place for production migration
    if (!hasSession && typeof window !== 'undefined') {
      sessionStorage.setItem('konai_demo_auth', 'true');
    }

    setIsAllowed(true);
    setIsChecking(false);
  }, []);

  return { isAllowed, isChecking };
}
