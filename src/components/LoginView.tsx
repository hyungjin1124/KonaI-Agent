'use client';

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck } from './icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface LoginViewProps {
  onLogin: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network request
    setTimeout(() => {
      if (email && password) {
        onLogin();
      } else {
        setError('이메일과 비밀번호를 입력해주세요.');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div data-testid="login-view" className="flex w-full h-screen bg-white overflow-hidden animate-fade-in-up">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A0A0A] relative flex-col justify-between p-12 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="#333" />
            </svg>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF3C42] rounded-full filter blur-[120px] opacity-20 transform translate-x-1/3 -translate-y-1/3"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF3C42] rounded-lg flex items-center justify-center shadow-lg shadow-red-900/20">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">KonaAgent</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Enterprise AI<br />
            <span className="text-[#FF3C42]">Intelligence</span> Platform
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            데이터 분석부터 비즈니스 리포트 생성까지.<br />
            코나아이의 축적된 데이터와 AI가 만나 새로운 인사이트를 제공합니다.
          </p>
          <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
             <div className="flex items-center gap-2">
                <ShieldCheck size={16} /> Enterprise Security
             </div>
             <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
             <div>SSO Integration</div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-gray-600">
          © 2025 KONA I Co., Ltd. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
                <div className="w-12 h-12 bg-[#FF3C42] rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">K</span>
                </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-500">계정에 로그인하여 대시보드에 접속하세요.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            <div className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider">Email</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 py-3 h-auto rounded-xl bg-gray-50 focus:bg-white border-gray-200 focus-visible:ring-[#FF3C42] focus-visible:border-[#FF3C42]"
                    placeholder="name@company.com"
                    data-testid="email-input"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider">Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 py-3 h-auto rounded-xl bg-gray-50 focus:bg-white border-gray-200 focus-visible:ring-[#FF3C42] focus-visible:border-[#FF3C42]"
                    placeholder="••••••••"
                    data-testid="password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-500 font-medium flex items-center gap-1 animate-pulse" data-testid="error-message">
                <ShieldCheck size={12} /> {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" />
                <Label htmlFor="remember-me" className="text-sm text-gray-600 font-normal">
                  로그인 상태 유지
                </Label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-[#FF3C42] hover:text-[#E02B31]">
                  비밀번호 찾기
                </a>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 h-auto rounded-xl bg-[#1A1A1A] hover:bg-black text-sm font-bold group"
              data-testid="login-button"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Logging in...
                </>
              ) : (
                <>
                  로그인 <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
             <p className="text-xs text-gray-500">
               계정이 없으신가요? <a href="#" className="font-bold text-gray-900 hover:underline">관리자에게 문의하세요</a>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
