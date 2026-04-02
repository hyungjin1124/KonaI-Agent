'use client';

import React, { useMemo, useState } from 'react';
import { X, Shield, ChevronDown, ChevronRight } from 'lucide-react';
import { ERP_GROUPS } from '../data/groupMockData';
import { Badge } from '@/components/ui/badge';
import { UserViewTableAccess } from './UserViewTableAccess';
import type { AdminUser } from '../types/admin.types';

interface UserSlidePanelProps {
  user: AdminUser;
  onClose: () => void;
}

export function UserSlidePanel({ user, onClose }: UserSlidePanelProps) {
  const [isUserInfoExpanded, setIsUserInfoExpanded] = useState(false);

  const userGroups = useMemo(
    () => ERP_GROUPS.filter((g) => g.members.some((m) => m.userId === user.id)).map((g) => g.name),
    [user.id],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header — 이름·역할·팀 항상 표시 (설계 4.1) */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: user.avatarColor || '#94A3B8' }}
          >
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {user.name}
              </h3>
              {user.role === '관리자' && (
                <Shield className="h-3.5 w-3.5 text-[#FF3C42] shrink-0" />
              )}
              <span
                className={[
                  'text-xs shrink-0',
                  user.role === '관리자' ? 'text-[#FF3C42] font-medium' : 'text-gray-400',
                ].join(' ')}
              >
                {user.role}
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate">{user.team}</p>
          </div>
        </div>
        <button
          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body — 사용자 정보(접힘) 상단 + 뷰테이블 접근 현황(펼침) 하단 (설계 v6) */}
      <div className="flex-1 overflow-y-auto">
        {/* 사용자 정보 (기본 접힘, 상단 고정) */}
        <div className="border-b border-gray-100">
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            onClick={() => setIsUserInfoExpanded((v) => !v)}
          >
            <h4 className="text-xs font-medium text-gray-500">사용자 정보</h4>
            {isUserInfoExpanded
              ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            }
          </button>
          {isUserInfoExpanded && (
            <div className="px-4 pb-4">
              <dl className="space-y-2.5">
                <div className="flex gap-2">
                  <dt className="text-xs text-gray-400 w-16 shrink-0">이메일</dt>
                  <dd className="text-xs text-gray-700 font-mono">{user.email}</dd>
                </div>
                {userGroups.length > 0 && (
                  <div className="flex gap-2">
                    <dt className="text-xs text-gray-400 w-16 shrink-0">그룹</dt>
                    <dd className="flex flex-wrap gap-1">
                      {userGroups.map((g) => (
                        <Badge
                          key={g}
                          variant="outline"
                          className="text-[10px] font-normal border-violet-200 text-violet-700"
                        >
                          {g}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                )}
                <div className="flex gap-2">
                  <dt className="text-xs text-gray-400 w-16 shrink-0">최근 활동</dt>
                  <dd className="text-xs text-gray-700 tabular-nums">{user.lastActivityDate}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {/* 뷰테이블 접근 현황 (기본 펼침) */}
        <div className="px-4 py-4 border-b border-gray-100">
          <h4 className="text-xs font-medium text-gray-500 mb-3">뷰테이블 접근 현황</h4>
          <UserViewTableAccess userId={user.id} />
        </div>
      </div>
    </div>
  );
}
