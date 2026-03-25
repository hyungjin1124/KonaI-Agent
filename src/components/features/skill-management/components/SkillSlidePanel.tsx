'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { TeamSkill, TeamMember } from '@/types/skill-management.types';
import { SkillSlidePanelHeader } from './SkillSlidePanelHeader';
import { SkillFileExplorer } from './SkillFileExplorer';
import { VersionHistoryTab } from './tabs/VersionHistoryTab';

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
}

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
}: SkillSlidePanelProps) {
  const [selectedFile, setSelectedFile] = useState<string>('SKILL.md');

  // Reset file selection on skill change
  useEffect(() => {
    setSelectedFile('SKILL.md');
  }, [skill.id]);

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
        />
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Version History — v7: top, default OPEN */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center gap-2 w-full px-5 py-3 border-b border-gray-100 text-xs xl:text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors [&[data-state=open]>svg]:rotate-90">
            <ChevronRight size={13} className="transition-transform duration-200 shrink-0" />
            버전 이력 ({skill.versionHistory.length})
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-5 pb-4">
              <VersionHistoryTab skill={skill} />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Skill Content — v7: bottom, default CLOSED */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 w-full px-5 py-3 border-t border-gray-100 text-xs xl:text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors [&[data-state=open]>svg]:rotate-90">
            <ChevronRight size={13} className="transition-transform duration-200 shrink-0" />
            스킬 콘텐츠
          </CollapsibleTrigger>
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
