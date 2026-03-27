'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Search, ChevronDown, ChevronRight, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DIRECTORY_TEAMS } from '../data/memberDirectoryData';
import type { SimpleUserRole, DirectoryMember } from '../types/admin.types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface MemberDirectoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (members: DirectoryMember[], role: SimpleUserRole) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MemberDirectoryModal({ open, onOpenChange, onAdd }: MemberDirectoryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [role, setRole] = useState<SimpleUserRole>('일반');
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  // Reset state when modal opens
  const handleOpenChange = useCallback((val: boolean) => {
    if (val) {
      setSearchQuery('');
      setSelectedIds(new Set());
      setRole('일반');
      setExpandedTeams(new Set());
    }
    onOpenChange(val);
  }, [onOpenChange]);

  // Filter teams by search query
  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return DIRECTORY_TEAMS;
    const q = searchQuery.toLowerCase();
    return DIRECTORY_TEAMS
      .map((team) => ({
        ...team,
        members: team.members.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q),
        ),
      }))
      .filter((team) => team.members.length > 0);
  }, [searchQuery]);

  // Selectable members (not already added)
  const getSelectableMembers = useCallback(
    (teamId: string) => {
      const team = filteredTeams.find((t) => t.id === teamId);
      return team?.members.filter((m) => !m.alreadyAdded) ?? [];
    },
    [filteredTeams],
  );

  // Check if all selectable members in a team are selected
  const isTeamFullySelected = useCallback(
    (teamId: string) => {
      const selectable = getSelectableMembers(teamId);
      return selectable.length > 0 && selectable.every((m) => selectedIds.has(m.id));
    },
    [getSelectableMembers, selectedIds],
  );

  const isTeamPartiallySelected = useCallback(
    (teamId: string) => {
      const selectable = getSelectableMembers(teamId);
      const selectedCount = selectable.filter((m) => selectedIds.has(m.id)).length;
      return selectedCount > 0 && selectedCount < selectable.length;
    },
    [getSelectableMembers, selectedIds],
  );

  // Toggle individual member
  const toggleMember = useCallback((memberId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
  }, []);

  // Toggle entire team
  const toggleTeam = useCallback(
    (teamId: string) => {
      const selectable = getSelectableMembers(teamId);
      const allSelected = isTeamFullySelected(teamId);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const m of selectable) {
          if (allSelected) next.delete(m.id);
          else next.add(m.id);
        }
        return next;
      });
    },
    [getSelectableMembers, isTeamFullySelected],
  );

  // Toggle team expand/collapse
  const toggleExpand = useCallback((teamId: string) => {
    setExpandedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      return next;
    });
  }, []);

  // Get all selected members for summary
  const selectedMembers = useMemo(() => {
    const all: DirectoryMember[] = [];
    for (const team of DIRECTORY_TEAMS) {
      for (const m of team.members) {
        if (selectedIds.has(m.id)) all.push(m);
      }
    }
    return all;
  }, [selectedIds]);

  const handleSubmit = useCallback(() => {
    if (selectedMembers.length === 0) return;
    onAdd(selectedMembers, role);
    handleOpenChange(false);
  }, [selectedMembers, role, onAdd, handleOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[80vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-semibold">사용자 추가</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            멤버 디렉토리에서 추가할 사용자를 선택하세요.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="이름 또는 이메일로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        {/* Team list */}
        <div className="flex-1 overflow-y-auto border-y border-gray-100 px-2 py-1 min-h-[280px] max-h-[380px]">
          {filteredTeams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-6 w-6 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">검색 결과가 없습니다</p>
            </div>
          ) : (
            filteredTeams.map((team) => {
              const selectableCount = team.members.filter((m) => !m.alreadyAdded).length;
              const isOpen = expandedTeams.has(team.id) || searchQuery.trim().length > 0;

              return (
                <Collapsible
                  key={team.id}
                  open={isOpen}
                  onOpenChange={() => toggleExpand(team.id)}
                >
                  <div className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center gap-1 flex-1 min-w-0 text-left">
                        {isOpen
                          ? <ChevronDown className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                          : <ChevronRight className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                        }
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {team.name}
                        </span>
                        <span className="text-xs text-gray-400 ml-1 shrink-0">
                          ({team.members.length}명)
                        </span>
                      </button>
                    </CollapsibleTrigger>

                    {/* Team-level checkbox */}
                    {selectableCount > 0 && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Checkbox
                          checked={
                            isTeamFullySelected(team.id)
                              ? true
                              : isTeamPartiallySelected(team.id)
                                ? 'indeterminate'
                                : false
                          }
                          onCheckedChange={() => toggleTeam(team.id)}
                          className="h-3.5 w-3.5"
                        />
                        <span className="text-[11px] text-gray-400">전체</span>
                      </div>
                    )}
                  </div>

                  <CollapsibleContent>
                    <div className="ml-5 border-l border-gray-100 pl-3 mb-1">
                      {team.members.map((member) => (
                        <label
                          key={member.id}
                          className={[
                            'flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors',
                            member.alreadyAdded
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-gray-50 cursor-pointer',
                          ].join(' ')}
                        >
                          <Checkbox
                            checked={selectedIds.has(member.id)}
                            onCheckedChange={() => toggleMember(member.id)}
                            disabled={member.alreadyAdded}
                            className="h-3.5 w-3.5"
                          />
                          <span
                            className={[
                              'font-medium truncate',
                              member.alreadyAdded ? 'text-gray-400' : 'text-gray-800',
                            ].join(' ')}
                          >
                            {member.name}
                          </span>
                          <span className="text-xs text-gray-400 truncate font-mono">
                            {member.email}
                          </span>
                          {member.alreadyAdded && (
                            <span className="text-[10px] text-gray-400 shrink-0 ml-auto">
                              (이미 추가됨)
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })
          )}
        </div>

        {/* Footer — selection summary + role + actions */}
        <div className="px-5 py-4 space-y-3">
          {/* Selection summary */}
          <div className="text-xs text-gray-600 min-h-[18px]">
            {selectedMembers.length > 0 ? (
              <>
                <span className="font-semibold text-gray-900">
                  선택: {selectedMembers.length}명
                </span>
                <span className="ml-1.5 text-gray-400">
                  ({selectedMembers.map((m) => m.name).join(', ')})
                </span>
              </>
            ) : (
              <span className="text-gray-400">추가할 사용자를 선택하세요</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            {/* Role select */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">역할</span>
              <Select value={role} onValueChange={(v) => setRole(v as SimpleUserRole)}>
                <SelectTrigger className="h-8 w-[100px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="일반">일반</SelectItem>
                  <SelectItem value="관리자">관리자</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <DialogFooter className="flex-row gap-2 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenChange(false)}
              >
                취소
              </Button>
              <Button
                size="sm"
                disabled={selectedMembers.length === 0}
                onClick={handleSubmit}
                className="bg-[#FF3C42] hover:bg-[#e63539] text-white disabled:bg-gray-200 disabled:text-gray-400"
              >
                추가 ({selectedMembers.length})
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
