import React, { useState, useMemo, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Position,
  Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Building2, FolderOpen, Users, Edit2, Trash2, ChevronRight, Check } from '../../../icons';
import type { HierarchicalOrgNode, EnhancedUser, DomainRole } from '../../../../types';
import { ORG_TREE, buildOrgPath } from '../data/userManagementData';
import { DomainRoleBadge } from './DomainRoleBadge';

// ============================================================================
// Types & Constants
// ============================================================================

interface OrgChartViewProps {
  users: EnhancedUser[];
  onEditUser: (user: EnhancedUser) => void;
  onDeleteUser: (id: string) => void;
}

const NODE_WIDTH = 156;
const NODE_GAP = 12;
const LEVEL_GAP = 100;

const TIER_STYLES = {
  division: {
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    selectedBorder: 'border-purple-500',
    selectedBg: 'bg-purple-100',
    text: 'text-purple-800',
    badge: 'bg-purple-200 text-purple-700',
    Icon: Building2,
  },
  section: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    selectedBorder: 'border-blue-500',
    selectedBg: 'bg-blue-100',
    text: 'text-blue-800',
    badge: 'bg-blue-200 text-blue-700',
    Icon: FolderOpen,
  },
  unit: {
    bg: 'bg-white',
    border: 'border-gray-200',
    selectedBorder: 'border-gray-500',
    selectedBg: 'bg-gray-50',
    text: 'text-gray-800',
    badge: 'bg-gray-200 text-gray-600',
    Icon: Users,
  },
} as const;

// ============================================================================
// Custom Node Component
// ============================================================================

interface OrgNodeData {
  name: string;
  tier: 'division' | 'section' | 'unit';
  userCount: number;
  descendantUserCount: number;
  isSelected: boolean;
}

function OrgNodeComponent({ data }: { data: OrgNodeData }) {
  const style = TIER_STYLES[data.tier];
  const { Icon } = style;
  const count = data.tier === 'unit' ? data.userCount : data.descendantUserCount;

  return (
    <div
      className={`
        rounded-lg border-2 cursor-pointer transition-all
        hover:shadow-md
        ${data.isSelected ? `${style.selectedBg} ${style.selectedBorder} shadow-md ring-1 ring-offset-1 ${style.selectedBorder.replace('border-', 'ring-')}` : `${style.bg} ${style.border} shadow-sm`}
      `}
      style={{ width: NODE_WIDTH }}
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-0 !h-0" />
      <div className="px-2.5 py-2">
        <div className="flex items-center gap-1.5">
          <Icon size={12} className={style.text} />
          <span className={`text-[11px] font-bold ${style.text} truncate flex-1`}>{data.name}</span>
          {count > 0 && (
            <span className={`text-[9px] font-bold px-1 py-0.5 rounded-full shrink-0 ${style.badge}`}>
              {count}
            </span>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-0 !h-0" />
    </div>
  );
}

const nodeTypes = { orgNode: OrgNodeComponent };

// ============================================================================
// Layout Algorithm
// ============================================================================

function countDescendantUsers(
  node: HierarchicalOrgNode,
  usersByNode: Map<string, EnhancedUser[]>,
): number {
  let count = usersByNode.get(node.id)?.length ?? 0;
  if (node.children) {
    for (const child of node.children) {
      count += countDescendantUsers(child, usersByNode);
    }
  }
  return count;
}

function getLeafCount(node: HierarchicalOrgNode): number {
  if (!node.children || node.children.length === 0) return 1;
  return node.children.reduce((sum, c) => sum + getLeafCount(c), 0);
}

function buildLayout(
  tree: HierarchicalOrgNode[],
  users: EnhancedUser[],
  selectedNodeId: string | null,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Group users by orgNodeId
  const usersByNode = new Map<string, EnhancedUser[]>();
  for (const u of users) {
    if (!u.orgNodeId) continue;
    const list = usersByNode.get(u.orgNodeId) ?? [];
    list.push(u);
    usersByNode.set(u.orgNodeId, list);
  }

  // Pre-calculate descendant counts
  const descendantCounts = new Map<string, number>();
  const calcDescendants = (node: HierarchicalOrgNode) => {
    descendantCounts.set(node.id, countDescendantUsers(node, usersByNode));
    node.children?.forEach(calcDescendants);
  };
  tree.forEach(calcDescendants);

  // Calculate total leaf count for positioning
  const totalLeaves = tree.reduce((sum, n) => sum + getLeafCount(n), 0);
  const totalWidth = totalLeaves * (NODE_WIDTH + NODE_GAP) - NODE_GAP;

  // Recursive layout
  const layoutNode = (
    node: HierarchicalOrgNode,
    depth: number,
    startX: number,
    allocatedWidth: number,
    parentId: string | null,
  ) => {
    const leafCount = getLeafCount(node);
    const centerX = startX + allocatedWidth / 2 - NODE_WIDTH / 2;

    nodes.push({
      id: node.id,
      type: 'orgNode',
      position: { x: centerX, y: depth * LEVEL_GAP },
      data: {
        name: node.name,
        tier: node.tier,
        userCount: usersByNode.get(node.id)?.length ?? 0,
        descendantUserCount: descendantCounts.get(node.id) ?? 0,
        isSelected: selectedNodeId === node.id,
      } satisfies OrgNodeData,
    });

    if (parentId) {
      edges.push({
        id: `${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: 'smoothstep',
        style: { stroke: '#D1D5DB', strokeWidth: 1.5 },
      });
    }

    if (node.children && node.children.length > 0) {
      let childX = startX;
      for (const child of node.children) {
        const childLeaves = getLeafCount(child);
        const childWidth = (childLeaves / leafCount) * allocatedWidth;
        layoutNode(child, depth + 1, childX, childWidth, node.id);
        childX += childWidth;
      }
    }
  };

  let currentX = 0;
  for (const rootNode of tree) {
    const rootLeaves = getLeafCount(rootNode);
    const rootWidth = (rootLeaves / totalLeaves) * totalWidth;
    layoutNode(rootNode, 0, currentX, rootWidth, null);
    currentX += rootWidth;
  }

  return { nodes, edges };
}

// ============================================================================
// User Detail Panel
// ============================================================================


function collectDescendantIds(node: HierarchicalOrgNode): string[] {
  const ids = [node.id];
  if (node.children) {
    for (const child of node.children) {
      ids.push(...collectDescendantIds(child));
    }
  }
  return ids;
}

function findNode(tree: HierarchicalOrgNode[], id: string): HierarchicalOrgNode | null {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

interface UserDetailPanelProps {
  selectedNodeId: string | null;
  users: EnhancedUser[];
  includeChildren: boolean;
  onIncludeChildrenChange: (v: boolean) => void;
  onEditUser: (user: EnhancedUser) => void;
  onDeleteUser: (id: string) => void;
}

function UserDetailPanel({
  selectedNodeId,
  users,
  includeChildren,
  onIncludeChildrenChange,
  onEditUser,
  onDeleteUser,
}: UserDetailPanelProps) {
  const node = selectedNodeId ? findNode(ORG_TREE, selectedNodeId) : null;
  const path = selectedNodeId ? buildOrgPath(ORG_TREE, selectedNodeId) : '';

  const filteredUsers = useMemo(() => {
    if (!selectedNodeId) return [];
    if (!node) return [];

    if (includeChildren) {
      const ids = new Set(collectDescendantIds(node));
      return users.filter(u => u.orgNodeId && ids.has(u.orgNodeId));
    }
    return users.filter(u => u.orgNodeId === selectedNodeId);
  }, [selectedNodeId, node, users, includeChildren]);

  if (!selectedNodeId || !node) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-400 px-6 text-center">
        조직 노드를 클릭하면<br />소속 사용자를 표시합니다
      </div>
    );
  }

  const tierStyle = TIER_STYLES[node.tier];
  const { Icon } = tierStyle;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <Icon size={16} className={tierStyle.text} />
          <h3 className="text-sm font-bold text-gray-900">{node.name}</h3>
        </div>
        {path.includes(' > ') && (
          <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
            {path.split(' > ').map((seg, i, arr) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight size={8} />}
                <span className={i === arr.length - 1 ? 'text-gray-600 font-medium' : ''}>{seg}</span>
              </React.Fragment>
            ))}
          </div>
        )}
        {node.tier !== 'unit' && (
          <label className="flex items-center gap-2 mt-2 cursor-pointer group">
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                includeChildren
                  ? 'bg-blue-600 border-blue-600'
                  : 'border-gray-300 group-hover:border-gray-400'
              }`}
              onClick={() => onIncludeChildrenChange(!includeChildren)}
            >
              {includeChildren && <Check size={10} className="text-white" />}
            </div>
            <span className="text-xs text-gray-600" onClick={() => onIncludeChildrenChange(!includeChildren)}>
              하위 조직 포함
            </span>
          </label>
        )}
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            소속 사용자가 없습니다
          </div>
        ) : (
          <div className="p-2 space-y-1.5">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className="bg-white rounded-lg border border-gray-100 p-3 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: user.avatarColor }}
                  >
                    {user.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">{user.name}</span>
                      {user.positionLevel && (
                        <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                          user.positionLevel === '임원'
                            ? 'bg-purple-100 text-purple-600'
                            : user.positionLevel === '관리자'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-500'
                        }`}>
                          {user.positionLevel}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">{user.email}</div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => onEditUser(user)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="수정"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => onDeleteUser(user.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="삭제"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                {user.roles.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {user.roles.map(role => (
                      <DomainRoleBadge key={role} role={role} />
                    ))}
                  </div>
                )}
                {includeChildren && user.orgNodeId !== selectedNodeId && (
                  <div className="text-[9px] text-gray-400 mt-1.5">{user.department}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-100 text-[10px] text-gray-400 shrink-0">
        총 {filteredUsers.length}명
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function OrgChartView({ users, onEditUser, onDeleteUser }: OrgChartViewProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [includeChildren, setIncludeChildren] = useState(true);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(prev => (prev === node.id ? null : node.id));
  }, []);

  const { nodes, edges } = useMemo(
    () => buildLayout(ORG_TREE, users, selectedNodeId),
    [users, selectedNodeId],
  );

  return (
    <div className="flex bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 260px)', minHeight: 480 }}>
      {/* ReactFlow Area */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.15, minZoom: 0.3, maxZoom: 1 }}
          minZoom={0.2}
          maxZoom={2}
          nodesDraggable={false}
          nodesConnectable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#E5E7EB" gap={20} size={1} />
          <Controls
            showInteractive={false}
            className="!shadow-sm !border-gray-200"
          />
          <MiniMap
            nodeColor={(node) => {
              const tier = (node.data as OrgNodeData).tier;
              return tier === 'division' ? '#C084FC' : tier === 'section' ? '#93C5FD' : '#D1D5DB';
            }}
            maskColor="rgba(255, 255, 255, 0.7)"
            className="!shadow-sm !border-gray-200"
          />
        </ReactFlow>
      </div>

      {/* User Detail Panel */}
      <div className="w-72 border-l border-gray-200 bg-gray-50/50 shrink-0">
        <UserDetailPanel
          selectedNodeId={selectedNodeId}
          users={users}
          includeChildren={includeChildren}
          onIncludeChildrenChange={setIncludeChildren}
          onEditUser={onEditUser}
          onDeleteUser={onDeleteUser}
        />
      </div>
    </div>
  );
}
