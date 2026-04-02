'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { AccessTarget } from '../types/data.types';

// ── Props ─────────────────────────────────────────────────────────────────────

interface AvailableUser {
  id: string;
  name: string;
  team: string;
}

interface AccessPermissionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewName: string;
  currentTargets: AccessTarget[];
  availableDepts: string[];
  availableUsers: AvailableUser[];
  onSave: (targets: AccessTarget[]) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AccessPermissionEditDialog({
  open,
  onOpenChange,
  viewName,
  currentTargets,
  availableDepts,
  availableUsers,
  onSave,
}: AccessPermissionEditDialogProps) {
  const [localTargets, setLocalTargets] = useState<AccessTarget[]>([]);
  const [deptToAdd, setDeptToAdd] = useState<string>('');
  const [userToAdd, setUserToAdd] = useState<string>('');

  // 초기화
  useEffect(() => {
    if (open) {
      setLocalTargets(currentTargets);
      setDeptToAdd('');
      setUserToAdd('');
    }
  }, [open, currentTargets]);

  const deptTargets = localTargets.filter((t) => t.type === '부서');
  const userTargets = localTargets.filter((t) => t.type === '사용자');

  const addedDeptNames = new Set(deptTargets.map((t) => t.name));
  const addedUserIds = new Set(userTargets.map((t) => t.name));

  const remainingDepts = availableDepts.filter((d) => !addedDeptNames.has(d));
  const remainingUsers = availableUsers.filter((u) => !addedUserIds.has(u.name));

  const handleAddDept = useCallback(() => {
    if (!deptToAdd) return;
    const newTarget: AccessTarget = {
      name: deptToAdd,
      type: '부서',
      basis: '관리자 직접 설정',
      memberCount: 0,
      members: [],
    };
    setLocalTargets((prev) => [...prev, newTarget]);
    setDeptToAdd('');
  }, [deptToAdd]);

  const handleAddUser = useCallback(() => {
    if (!userToAdd) return;
    const user = availableUsers.find((u) => u.id === userToAdd);
    if (!user) return;
    const newTarget: AccessTarget = {
      name: user.name,
      type: '사용자',
      basis: '관리자 직접 설정',
    };
    setLocalTargets((prev) => [...prev, newTarget]);
    setUserToAdd('');
  }, [userToAdd, availableUsers]);

  const handleRemove = useCallback((name: string, type: AccessTarget['type']) => {
    setLocalTargets((prev) => prev.filter((t) => !(t.name === name && t.type === type)));
  }, []);

  const handleSave = () => {
    onSave(localTargets);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>접근 권한 편집</DialogTitle>
          <p className="text-xs text-gray-500 mt-1">
            <span className="font-medium text-gray-700">{viewName}</span>에 접근 가능한 부서와 사용자를 관리합니다.
          </p>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* 부서 */}
          <section className="space-y-2">
            <h4 className="text-xs font-medium text-gray-600">접근 가능 부서</h4>

            {/* 현재 부서 목록 */}
            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {deptTargets.length === 0 ? (
                <p className="text-xs text-gray-400 self-center">추가된 부서가 없습니다.</p>
              ) : (
                deptTargets.map((t) => (
                  <Badge
                    key={t.name}
                    variant="outline"
                    className="border-blue-200 text-blue-700 gap-1 pl-2 pr-1 py-1"
                  >
                    {t.name}
                    <button
                      className="hover:text-red-500 transition-colors"
                      onClick={() => handleRemove(t.name, '부서')}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>

            {/* 부서 추가 */}
            {remainingDepts.length > 0 && (
              <div className="flex items-center gap-2">
                <Select value={deptToAdd} onValueChange={setDeptToAdd}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue placeholder="부서 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {remainingDepts.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 shrink-0"
                  disabled={!deptToAdd}
                  onClick={handleAddDept}
                >
                  <Plus className="h-3.5 w-3.5" />
                  추가
                </Button>
              </div>
            )}
          </section>

          {/* 사용자 */}
          <section className="space-y-2">
            <h4 className="text-xs font-medium text-gray-600">접근 가능 사용자 (개인 오버라이드)</h4>

            {/* 현재 사용자 목록 */}
            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {userTargets.length === 0 ? (
                <p className="text-xs text-gray-400 self-center">추가된 사용자가 없습니다.</p>
              ) : (
                userTargets.map((t) => (
                  <Badge
                    key={t.name}
                    variant="outline"
                    className="border-amber-200 text-amber-700 gap-1 pl-2 pr-1 py-1"
                  >
                    {t.name}
                    <button
                      className="hover:text-red-500 transition-colors"
                      onClick={() => handleRemove(t.name, '사용자')}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>

            {/* 사용자 추가 */}
            {remainingUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <Select value={userToAdd} onValueChange={setUserToAdd}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue placeholder="사용자 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {remainingUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} · {u.team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 shrink-0"
                  disabled={!userToAdd}
                  onClick={handleAddUser}
                >
                  <Plus className="h-3.5 w-3.5" />
                  추가
                </Button>
              </div>
            )}
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            className="bg-[#FF3C42] hover:bg-[#e63539] text-white"
            onClick={handleSave}
          >
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
