import React, { useState, useCallback } from 'react';
import { ScrollArea } from '../../../../ui/scroll-area';
import { FileTreeItem } from './FileTreeItem';
import { MOCK_FILE_TREE } from './mockFileTree';

export const FileDirectoryPanel: React.FC = () => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(['folder-reports', 'folder-2025-q4'])
  );

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-3 py-2">
        <span className="text-xs font-medium text-gray-400">내 파일</span>
      </div>
      <ScrollArea className="flex-1 px-1.5 pb-2">
        <div className="space-y-0">
          {MOCK_FILE_TREE.map((node) => (
            <FileTreeItem
              key={node.id}
              node={node}
              expandedIds={expandedIds}
              onToggleExpand={handleToggleExpand}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FileDirectoryPanel;
