'use client';

import React, { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import LoginView from './LoginView';
import { useCaptureStateInjection, StateInjectionHandlers } from '../hooks';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  // 캡처 자동화용 상태 주입 핸들러 (로그인 상태 제어)
  const loginInjectionHandlers = useMemo<StateInjectionHandlers>(() => ({
    setIsLoggedIn,
  }), []);

  useCaptureStateInjection(loginInjectionHandlers);

  // Allow login page without auth
  if (pathname === '/login') {
    return <LoginView onLogin={() => setIsLoggedIn(true)} />;
  }

  if (!isLoggedIn) {
    return <LoginView onLogin={() => setIsLoggedIn(true)} />;
  }

  return <>{children}</>;
};

export default AuthGuard;
