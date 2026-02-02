import React from 'react';
import { PanelRightClose, PanelRight } from 'lucide-react';
import { ProgressSection } from './ProgressSection';
import { ArtifactsSection } from './ArtifactsSection';
import { ContextSection } from './ContextSection';
import { ProgressTask, Artifact, ContextItem, SidebarSection } from '../../types';

interface RightSidebarProps {
  isCollapsed: boolean;
  expandedSections: SidebarSection[];
  onToggleSection: (section: SidebarSection) => void;
  onToggleCollapse: () => void;
  // Progress Props
  tasks: ProgressTask[];
  // Artifacts Props
  artifacts: Artifact[];
  selectedArtifactId?: string;
  onArtifactSelect: (artifact: Artifact) => void;
  onArtifactDownload: (artifact: Artifact) => void;
  // Context Props
  contextItems: ContextItem[];
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  isCollapsed,
  expandedSections,
  onToggleSection,
  onToggleCollapse,
  tasks,
  artifacts,
  selectedArtifactId,
  onArtifactSelect,
  onArtifactDownload,
  contextItems,
}) => {
  if (isCollapsed) {
    return (
      <div className="h-full flex items-start justify-center pt-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="사이드바 열기"
        >
          <PanelRight className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center justify-end px-3 py-2 border-b border-gray-200">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title="사이드바 닫기"
        >
          <PanelRightClose className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <ProgressSection
          tasks={tasks}
          isExpanded={expandedSections.includes('progress')}
          onToggle={() => onToggleSection('progress')}
        />
        <ArtifactsSection
          artifacts={artifacts}
          selectedArtifactId={selectedArtifactId}
          isExpanded={expandedSections.includes('artifacts')}
          onToggle={() => onToggleSection('artifacts')}
          onSelect={onArtifactSelect}
          onDownload={onArtifactDownload}
        />
        <ContextSection
          items={contextItems}
          isExpanded={expandedSections.includes('context')}
          onToggle={() => onToggleSection('context')}
        />
      </div>
    </div>
  );
};

export default RightSidebar;
