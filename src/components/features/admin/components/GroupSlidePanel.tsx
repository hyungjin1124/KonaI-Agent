'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, Users, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ERPGroup } from '../types/admin.types';

interface GroupSlidePanelProps {
  group: ERPGroup;
  onClose: () => void;
  onNavigateToUser: (userId: string) => void;
}

export function GroupSlidePanel({ group, onClose, onNavigateToUser }: GroupSlidePanelProps) {
  const router = useRouter();
  const [memberSearch, setMemberSearch] = useState('');
  const [showAllMembers, setShowAllMembers] = useState(false);

  const VISIBLE_LIMIT = 10;

  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return group.members;
    const q = memberSearch.toLowerCase();
    return group.members.filter(
      (m) => m.name.toLowerCase().includes(q) || m.department.toLowerCase().includes(q),
    );
  }, [group.members, memberSearch]);

  const visibleMembers = showAllMembers ? filteredMembers : filteredMembers.slice(0, VISIBLE_LIMIT);
  const hiddenCount = filteredMembers.length - VISIBLE_LIMIT;

  const allowedViews = group.viewAccess.filter((v) => v.secuValue !== '2');
  const blockedViews = group.viewAccess.filter((v) => v.secuValue === '2');

  const handleViewTableClick = (viewId: string) => {
    router.push(`/data?viewId=${viewId}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{group.name}</h3>
            <Badge variant="outline" className="text-[10px] font-normal shrink-0">
              {group.groupType} 그룹
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Users className="h-3 w-3" />
              소속 {group.memberCount}명
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Database className="h-3 w-3" />
              뷰테이블 {group.accessibleViewCount}개
            </span>
          </div>
        </div>
        <button
          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {/* 소속 사용자 */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-medium text-gray-500">소속 사용자</h4>
            <div className="relative w-[180px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="사용자 검색"
                value={memberSearch}
                onChange={(e) => { setMemberSearch(e.target.value); setShowAllMembers(false); }}
                className="pl-7 h-7 text-xs"
              />
            </div>
          </div>

          <div className="rounded-md border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                  <TableHead className="text-xs font-medium text-gray-500 py-1.5">이름</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 py-1.5">부서</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 py-1.5 w-[50px]">역할</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleMembers.map((m) => (
                  <TableRow
                    key={m.userId}
                    className="cursor-pointer hover:bg-gray-50/60"
                    onClick={() => onNavigateToUser(m.userId)}
                  >
                    <TableCell className="py-1.5 text-xs text-gray-900">{m.name}</TableCell>
                    <TableCell className="py-1.5 text-xs text-gray-500">{m.department}</TableCell>
                    <TableCell className="py-1.5">
                      <Badge
                        variant="outline"
                        className={[
                          'text-[10px] font-normal',
                          m.role === '관리자' ? 'border-red-200 text-[#FF3C42]' : 'border-gray-200 text-gray-500',
                        ].join(' ')}
                      >
                        {m.role}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-xs text-gray-400">
                      {memberSearch ? '검색 결과가 없습니다.' : '소속 사용자가 없습니다.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {!showAllMembers && hiddenCount > 0 && !memberSearch && (
            <button
              className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
              onClick={() => setShowAllMembers(true)}
            >
              ...외 {hiddenCount}명 더 보기
            </button>
          )}
          {showAllMembers && hiddenCount > 0 && !memberSearch && (
            <button
              className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
              onClick={() => setShowAllMembers(false)}
            >
              접기
            </button>
          )}
        </div>

        {/* 접근 가능 뷰테이블 */}
        <div className="px-4 py-4">
          <h4 className="text-xs font-medium text-gray-500 mb-3">접근 가능 뷰테이블</h4>

          <div className="rounded-md border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                  <TableHead className="text-xs font-medium text-gray-500 py-1.5">뷰테이블</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 py-1.5 w-[60px]">도메인</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 py-1.5">권한 근거</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allowedViews.map((v) => (
                  <TableRow
                    key={v.viewId}
                    className="cursor-pointer hover:bg-gray-50/60"
                    onClick={() => handleViewTableClick(v.viewId)}
                  >
                    <TableCell className="py-1.5 text-xs text-gray-900">{v.viewName}</TableCell>
                    <TableCell className="py-1.5">
                      <Badge variant="outline" className="text-[10px] font-normal">{v.domain}</Badge>
                    </TableCell>
                    <TableCell className="py-1.5 text-xs text-gray-500">{v.basis}</TableCell>
                  </TableRow>
                ))}
                {blockedViews.map((v) => (
                  <TableRow
                    key={v.viewId}
                    className="opacity-50"
                  >
                    <TableCell className="py-1.5 text-xs text-gray-400">{v.viewName}</TableCell>
                    <TableCell className="py-1.5">
                      <Badge variant="outline" className="text-[10px] font-normal text-gray-400 border-gray-200">{v.domain}</Badge>
                    </TableCell>
                    <TableCell className="py-1.5 text-xs text-gray-400">
                      {v.basis}
                      <Badge variant="outline" className="text-[9px] ml-1.5 text-red-400 border-red-200">차단</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {group.viewAccess.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-xs text-gray-400">
                      접근 가능한 뷰테이블이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
