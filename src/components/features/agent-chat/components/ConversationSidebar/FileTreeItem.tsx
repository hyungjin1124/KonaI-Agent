import React from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  FileDown,
  Table2,
  Presentation,
  File,
} from 'lucide-react';
import { FileTreeNode, FILE_TREE_DRAG_MIME_TYPE } from './types';

interface FileTreeItemProps {
  node: FileTreeNode;
  depth?: number;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
}

const getFileIcon = (extension?: string) => {
  switch (extension) {
    case 'pdf':
      return <FileDown className="w-4 h-4 text-red-500 shrink-0" />;
    case 'xlsx':
    case 'xls':
    case 'csv':
      return <Table2 className="w-4 h-4 text-green-600 shrink-0" />;
    case 'docx':
    case 'doc':
      return <FileText className="w-4 h-4 text-blue-600 shrink-0" />;
    case 'pptx':
    case 'ppt':
      return <Presentation className="w-4 h-4 text-orange-500 shrink-0" />;
    case 'md':
      return <FileText className="w-4 h-4 text-purple-500 shrink-0" />;
    default:
      return <File className="w-4 h-4 text-gray-400 shrink-0" />;
  }
};

export const FileTreeItem: React.FC<FileTreeItemProps> = ({
  node,
  depth = 0,
  expandedIds,
  onToggleExpand,
}) => {
  const isFolder = node.type === 'folder';
  const isExpanded = expandedIds.has(node.id);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      FILE_TREE_DRAG_MIME_TYPE,
      JSON.stringify({ id: node.id, name: node.name, extension: node.extension })
    );
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <>
      <button
        className={`w-full flex items-center gap-1 py-1 px-1.5 rounded-md text-left transition-colors ${
          isFolder
            ? 'hover:bg-gray-100 text-gray-700'
            : 'hover:bg-gray-100 text-gray-600 cursor-grab active:cursor-grabbing'
        }`}
        style={{ paddingLeft: `${depth * 12 + 6}px` }}
        onClick={() => isFolder && onToggleExpand(node.id)}
        draggable={!isFolder}
        onDragStart={!isFolder ? handleDragStart : undefined}
        title={node.name}
      >
        {isFolder ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-yellow-500 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-yellow-500 shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5 shrink-0" />
            {getFileIcon(node.extension)}
          </>
        )}
        <span className="text-xs truncate leading-snug">{node.name}</span>
      </button>
      {isFolder && isExpanded && node.children && (
        <>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </>
      )}
    </>
  );
};

export default FileTreeItem;
