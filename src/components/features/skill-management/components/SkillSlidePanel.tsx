'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { TeamSkill, TeamMember } from '@/types/skill-management.types';
import { SkillSlidePanelHeader } from './SkillSlidePanelHeader';
import { SkillFileExplorer } from './SkillFileExplorer';
import { VersionHistoryTab } from './tabs/VersionHistoryTab';
import { QualityTestSection } from './QualityTestSection';

// ── Collapsed preview helpers ────────────────────────────────────────────────

/** Build a one-line version history preview: "v3 · 2026.03.20 · [변경] ... 외 N건" */
function buildVersionPreview(skill: TeamSkill): string | null {
  if (skill.versionHistory.length === 0) return null;
  const sorted = [...skill.versionHistory].sort((a, b) =>
    b.modifiedAt.localeCompare(a.modifiedAt),
  );
  const latest = sorted[0];
  const parts: string[] = [latest.version, latest.modifiedAt];

  if (latest.changeEntries.length > 0) {
    const first = latest.changeEntries[0];
    parts.push(`[${first.tag}] ${first.subject}`);
    if (latest.changeEntries.length > 1) {
      parts.push(`외 ${latest.changeEntries.length - 1}건`);
    }
  }
  return parts.join(' · ');
}

/** Build a one-line content preview: "SKILL.md 외 N개 파일" */
function buildContentPreview(skill: TeamSkill): string {
  const fileCount = skill.attachments.length; // +1 for SKILL.md is implicit
  if (fileCount === 0) return 'SKILL.md';
  return `SKILL.md 외 ${fileCount}개 파일`;
}

// ── Props ────────────────────────────────────────────────────────────────────

interface SkillSlidePanelProps {
  skill: TeamSkill;
  teamMembers: TeamMember[];
  onClose: () => void;
  onCopy: () => void;
  onChatEdit: () => void;
  onToggleActivation: () => void;
  onRename?: (skillId: string, newName: string) => string | null;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  /** 특정 버전 복사 (v11) */
  onCopyVersion?: (version: string) => void;
  /** 마켓플레이스 모드 (v10) */
  panelMode?: 'team' | 'marketplace';
  onActivate?: () => void;
  isAlreadyActivated?: boolean;
  /** 전사 공개 토글 (v10) */
  onTogglePublish?: () => void;
}

// ── Collapsible trigger style (shared) ───────────────────────────────────────

const TRIGGER_CLASS =
  'flex items-center gap-2 w-full px-5 py-3 border-b border-gray-100 text-xs xl:text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors [&[data-state=open]>svg:first-child]:rotate-90';

export function SkillSlidePanel({
  skill,
  teamMembers,
  onClose,
  onCopy,
  onChatEdit,
  onToggleActivation,
  onRename,
  isExpanded,
  onToggleExpand,
  onCopyVersion,
  panelMode,
  onActivate,
  isAlreadyActivated,
  onTogglePublish,
}: SkillSlidePanelProps) {
  const [selectedFile, setSelectedFile] = useState<string>('SKILL.md');

  // Reset file selection on skill change
  useEffect(() => {
    setSelectedFile('SKILL.md');
  }, [skill.id]);

  const versionPreview = useMemo(() => buildVersionPreview(skill), [skill]);
  const contentPreview = useMemo(() => buildContentPreview(skill), [skill]);

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header (sticky) */}
      <div className="shrink-0 border-b border-gray-200">
        <SkillSlidePanelHeader
          skill={skill}
          teamMembers={teamMembers}
          onClose={onClose}
          onCopy={onCopy}
          onChatEdit={onChatEdit}
          onToggleActivation={onToggleActivation}
          onRename={onRename}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          panelMode={panelMode}
          onActivate={onActivate}
          isAlreadyActivated={isAlreadyActivated}
          onTogglePublish={onTogglePublish}
        />
      </div>

      {/* Scrollable body — v9: 품질 테스트(open) → 버전 이력(closed) → 콘텐츠(closed) */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* 1. Quality Test — default OPEN */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className={TRIGGER_CLASS}>
            <ChevronRight size={13} className="transition-transform duration-200 shrink-0" />
            품질 테스트 ({skill.evalResult.testPrompts.length})
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-5 pb-4">
              <QualityTestSection evalResult={skill.evalResult} />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* 2. Version History — default CLOSED with collapsed preview */}
        <Collapsible className="group/version">
          <CollapsibleTrigger className={TRIGGER_CLASS}>
            <ChevronRight size={13} className="transition-transform duration-200 shrink-0" />
            <span className="flex-1 text-left">
              버전 이력 ({skill.versionHistory.length})
            </span>
          </CollapsibleTrigger>
          {/* Collapsed preview — hidden when section is open */}
          {versionPreview && (
            <div className="px-5 py-2 border-b border-gray-100 text-xs xl:text-sm text-gray-400 truncate group-data-[state=open]/version:hidden">
              {versionPreview}
            </div>
          )}
          <CollapsibleContent>
            <div className="px-5 pb-4">
              <VersionHistoryTab skill={skill} isExpanded={isExpanded} onCopyVersion={onCopyVersion} />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* 3. Skill Content — default CLOSED with collapsed preview */}
        <Collapsible className="group/content">
          <CollapsibleTrigger className={TRIGGER_CLASS}>
            <ChevronRight size={13} className="transition-transform duration-200 shrink-0" />
            <span className="flex-1 text-left">스킬 콘텐츠</span>
          </CollapsibleTrigger>
          {/* Collapsed preview — hidden when section is open */}
          <div className="px-5 py-2 border-b border-gray-100 text-xs xl:text-sm text-gray-400 truncate group-data-[state=open]/content:hidden">
            {contentPreview}
          </div>
          <CollapsibleContent>
            <SkillFileExplorer
              instructionBody={skill.instructionBody}
              attachments={skill.attachments}
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
