'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div
          role="alert"
          className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3 text-sm text-gray-500"
        >
          <p className="font-semibold text-red-600">오류가 발생했습니다</p>
          {this.state.error && (
            <p className="text-xs text-gray-400 font-mono max-w-md truncate">
              {this.state.error.message}
            </p>
          )}
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
