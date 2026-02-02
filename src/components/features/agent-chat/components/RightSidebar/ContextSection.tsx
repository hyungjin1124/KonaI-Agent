import React from 'react';
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FileText,
  Database,
  Link2,
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react';
import { ContextItem } from '../../types';

interface ContextSectionProps {
  items: ContextItem[];
  isExpanded: boolean;
  onToggle: () => void;
}

const getContextIcon = (item: ContextItem) => {
  // Custom icon if specified
  if (item.icon) {
    switch (item.icon) {
      case 'notion':
        return <div className="w-4 h-4 flex items-center justify-center text-xs">📝</div>;
      case 'erp':
        return <Database className="w-4 h-4 text-blue-500" />;
      default:
        break;
    }
  }

  // Default icons by type
  switch (item.type) {
    case 'folder':
      return <Folder className="w-4 h-4 text-yellow-500" />;
    case 'file':
      return <FileText className="w-4 h-4 text-gray-500" />;
    case 'connector':
      return <Link2 className="w-4 h-4 text-purple-500" />;
    case 'data-source':
      return <Database className="w-4 h-4 text-blue-500" />;
    default:
      return <FileText className="w-4 h-4 text-gray-400" />;
  }
};

const getStatusIcon = (status?: ContextItem['status']) => {
  switch (status) {
    case 'connected':
      return <Wifi className="w-3 h-3 text-green-500" />;
    case 'disconnected':
      return <WifiOff className="w-3 h-3 text-gray-400" />;
    case 'loading':
      return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />;
    default:
      return null;
  }
};

interface ContextItemRowProps {
  item: ContextItem;
  depth?: number;
}

const ContextItemRow: React.FC<ContextItemRowProps> = ({ item, depth = 0 }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 rounded-md cursor-pointer"
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {hasChildren && (
          isOpen ? (
            <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
          )
        )}
        {!hasChildren && <div className="w-3" />}
        {getContextIcon(item)}
        <span className="text-sm text-gray-700 flex-1 truncate">{item.name}</span>
        {getStatusIcon(item.status)}
      </div>
      {hasChildren && isOpen && (
        <div>
          {item.children!.map((child) => (
            <ContextItemRow key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const ContextSection: React.FC<ContextSectionProps> = ({
  items,
  isExpanded,
  onToggle,
}) => {
  // Group items by category
  const folders = items.filter(i => i.type === 'folder');
  const connectors = items.filter(i => i.type === 'connector');
  const workingFiles = items.filter(i => i.type === 'file');
  const dataSources = items.filter(i => i.type === 'data-source');

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <span className="text-sm font-medium text-gray-900">Context</span>
        </div>
        {items.length > 0 && (
          <span className="text-xs text-gray-500">{items.length}</span>
        )}
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div className="px-2 pb-3 space-y-2">
          {items.length === 0 ? (
            <p className="text-sm text-gray-400 py-2 px-2">컨텍스트가 없습니다</p>
          ) : (
            <>
              {/* Selected Folders */}
              {folders.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 px-2 py-1">Selected folders</p>
                  {folders.map((item) => (
                    <ContextItemRow key={item.id} item={item} />
                  ))}
                </div>
              )}

              {/* Connectors */}
              {connectors.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 px-2 py-1">Connectors</p>
                  {connectors.map((item) => (
                    <ContextItemRow key={item.id} item={item} />
                  ))}
                </div>
              )}

              {/* Data Sources */}
              {dataSources.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 px-2 py-1">Data Sources</p>
                  {dataSources.map((item) => (
                    <ContextItemRow key={item.id} item={item} />
                  ))}
                </div>
              )}

              {/* Working Files */}
              {workingFiles.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 px-2 py-1">Working files</p>
                  {workingFiles.map((item) => (
                    <ContextItemRow key={item.id} item={item} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ContextSection;
