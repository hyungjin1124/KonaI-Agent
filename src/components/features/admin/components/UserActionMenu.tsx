'use client';

import React, { useState } from 'react';
import { MoreVertical, Power, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { SimpleUserStatus } from '../types/admin.types';

interface UserActionMenuProps {
  status: SimpleUserStatus;
  userName: string;
  onToggleStatus: () => void;
}

export function UserActionMenu({ status, userName, onToggleStatus }: UserActionMenuProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleAction = () => {
    if (status === '활성') {
      setConfirmOpen(true);
    } else {
      onToggleStatus();
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem onClick={handleAction} className="cursor-pointer">
            {status === '활성' ? (
              <>
                <Power className="h-4 w-4 text-gray-500" />
                <span>비활성화</span>
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 text-green-600" />
                <span>활성화</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        title="사용자 비활성화"
        description={
          <>
            <span className="font-medium text-foreground">{userName}</span>
            님을 비활성화하면 로그인할 수 없습니다.
          </>
        }
        confirmLabel="비활성화"
        cancelLabel="취소"
        destructive
        onConfirm={() => {
          onToggleStatus();
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
