import React, { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, Building2, FolderOpen, Users } from '../../../icons';
import type { HierarchicalOrgNode } from '../../../../types';

interface OrgTreeSelectorProps {
  tree: HierarchicalOrgNode[];
  selected: string | null;
  onSelect: (nodeId: string) => void;
}

const TIER_ICONS = {
  division: Building2,
  section: FolderOpen,
  unit: Users,
} as const;

const TIER_COLORS = {
  division: 'text-purple-600',
  section: 'text-blue-600',
  unit: 'text-gray-600',
} as const;

const TIER_BG = {
  division: 'hover:bg-purple-50/60',
  section: 'hover:bg-blue-50/60',
  unit: 'hover:bg-gray-50',
} as const;

const TIER_TAG_STYLE = {
  division: 'bg-purple-100/60 text-purple-500',
  section: 'bg-blue-100/60 text-blue-500',
  unit: '',
} as const;

function OrgTreeNode({
  node,
  depth,
  selected,
  expanded,
  onSelect,
  onToggle,
}: {
  node: HierarchicalOrgNode;
  depth: number;
  selected: string | null;
  expanded: Record<string, boolean>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded[node.id] ?? (depth < 1);
  const isSelected = selected === node.id;
  const Icon = TIER_ICONS[node.tier];
  const tierBg = TIER_BG[node.tier];
  const tagStyle = TIER_TAG_STYLE[node.tier];

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          onSelect(node.id);
          if (hasChildren) onToggle(node.id);
        }}
        className={`
          w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all
          ${tierBg}
          ${isSelected
            ? 'bg-blue-50 ring-1 ring-blue-300/80 text-blue-900 font-medium shadow-sm'
            : 'text-gray-700'
          }
        `}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        {hasChildren ? (
          <span className="w-4 h-4 flex items-center justify-center text-gray-400 shrink-0">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <Icon size={14} className={`shrink-0 ${isSelected ? 'text-blue-600' : TIER_COLORS[node.tier]}`} />
        <span className="truncate">{node.name}</span>
        {tagStyle && (
          <span className={`ml-auto text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${tagStyle}`}>
            {node.tier === 'division' ? '구분' : '부문'}
          </span>
        )}
      </button>
      {hasChildren && isExpanded && (
        <div className="relative">
          {depth < 2 && (
            <div
              className="absolute left-0 top-0 bottom-0 border-l border-gray-200/60"
              style={{ marginLeft: `${22 + depth * 20}px` }}
            />
          )}
          {node.children!.map(child => (
            <OrgTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selected={selected}
              expanded={expanded}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function OrgTreeSelector({ tree, selected, onSelect }: OrgTreeSelectorProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    tree.forEach(n => { init[n.id] = true; });
    return init;
  });

  const handleToggle = useCallback((id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const buildPath = (nodes: HierarchicalOrgNode[], target: string, trail: string[]): string[] | null => {
    for (const node of nodes) {
      const current = [...trail, node.name];
      if (node.id === target) return current;
      if (node.children) {
        const found = buildPath(node.children, target, current);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedPath = selected ? buildPath(tree, selected, []) : null;

  return (
    <div className="space-y-2">
      {selectedPath && (
        <div className="flex items-center gap-1.5 text-xs px-2 py-1.5 bg-blue-50/50 rounded-md border border-blue-100/60">
          {selectedPath.map((segment, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight size={10} className="text-blue-300" />}
              <span className={i === selectedPath.length - 1 ? 'text-blue-700 font-semibold' : 'text-blue-500'}>
                {segment}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}
      <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto py-1 bg-white shadow-inner shadow-gray-100/50">
        {tree.map(node => (
          <OrgTreeNode
            key={node.id}
            node={node}
            depth={0}
            selected={selected}
            expanded={expanded}
            onSelect={onSelect}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}
