import React, { useState, useCallback, useMemo } from 'react';
import {
  Search, Download, Check, Trash2, ExternalLink, Shield, Zap, Star,
} from '../../icons';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Switch } from '../../ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../../ui/sheet';
import {
  type MarketplacePlugin,
  type PluginCategory,
  MOCK_PLUGINS,
  CATEGORY_LABELS,
  CATEGORY_LIST,
  TYPE_LABELS,
  STATUS_LABELS,
  filterPlugins,
  formatInstalls,
} from './agentMarketplaceData';

// --- Sub-Components ---

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-gray-500">
      <Star size={12} className="text-amber-400 fill-amber-400" />
      {rating.toFixed(1)}
    </span>
  );
}

function TypeBadge({ type }: { type: MarketplacePlugin['type'] }) {
  const styles: Record<string, string> = {
    mcp_server: 'bg-blue-50 text-blue-700 border-blue-200',
    mcp_app: 'bg-purple-50 text-purple-700 border-purple-200',
    skill: 'bg-green-50 text-green-700 border-green-200',
  };
  return (
    <Badge variant="outline" className={`text-[10px] font-bold ${styles[type]}`}>
      {TYPE_LABELS[type]}
    </Badge>
  );
}

function StatusBadge({ status }: { status: MarketplacePlugin['status'] }) {
  const styles: Record<string, string> = {
    available: 'bg-gray-50 text-gray-500 border-gray-200',
    installed: 'bg-green-50 text-green-700 border-green-200',
    update_available: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <Badge variant="outline" className={`text-[10px] font-bold ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

interface PluginCardProps {
  plugin: MarketplacePlugin;
  onSelect: (p: MarketplacePlugin) => void;
  onInstall: (id: string) => void;
  onUninstall: (id: string) => void;
  onToggle: (id: string) => void;
}

function PluginCard({ plugin, onSelect, onInstall, onUninstall, onToggle }: PluginCardProps) {
  const isInstalled = plugin.status === 'installed' || plugin.status === 'update_available';

  return (
    <div
      data-testid={`plugin-card-${plugin.id}`}
      className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
      onClick={() => onSelect(plugin)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect(plugin); }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ backgroundColor: plugin.logoColor }}
        >
          {plugin.logoInitial}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-gray-900 truncate">{plugin.name}</h4>
          <p className="text-xs text-gray-500">{plugin.publisher}</p>
        </div>
        <StatusBadge status={plugin.status} />
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-3">
        {plugin.description}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-2 mb-3">
        <TypeBadge type={plugin.type} />
        <Badge variant="outline" className="text-[10px] font-medium text-gray-500 border-gray-200">
          {CATEGORY_LABELS[plugin.category]}
        </Badge>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <StarRating rating={plugin.rating} />
          <span className="text-xs text-gray-400">
            <Download size={10} className="inline mr-0.5" />
            {formatInstalls(plugin.installs)}
          </span>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {isInstalled ? (
            <>
              <Switch
                checked={plugin.isEnabled}
                onCheckedChange={() => onToggle(plugin.id)}
                className="data-[state=checked]:bg-green-500"
                aria-label={`${plugin.name} 활성화 토글`}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onUninstall(plugin.id)}
                aria-label={`${plugin.name} 제거`}
              >
                <Trash2 size={14} />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="h-7 text-xs bg-[#1A1A1A] hover:bg-black text-white"
              onClick={() => onInstall(plugin.id)}
            >
              설치
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Detail Sheet ---

interface PluginDetailSheetProps {
  plugin: MarketplacePlugin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInstall: (id: string) => void;
  onUninstall: (id: string) => void;
  onToggle: (id: string) => void;
  onToolToggle: (pluginId: string, toolId: string) => void;
}

function PluginDetailSheet({
  plugin,
  open,
  onOpenChange,
  onInstall,
  onUninstall,
  onToggle,
  onToolToggle,
}: PluginDetailSheetProps) {
  if (!plugin) return null;
  const isInstalled = plugin.status === 'installed' || plugin.status === 'update_available';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[440px] sm:max-w-[440px] overflow-y-auto" data-testid="plugin-detail-sheet">
        <SheetHeader className="pb-4 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-base font-bold shrink-0"
              style={{ backgroundColor: plugin.logoColor }}
            >
              {plugin.logoInitial}
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg">{plugin.name}</SheetTitle>
              <p className="text-sm text-gray-500 mt-0.5">{plugin.publisher}</p>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 pt-5">
          {/* Meta Badges */}
          <div className="flex flex-wrap gap-2">
            <TypeBadge type={plugin.type} />
            <StatusBadge status={plugin.status} />
            <Badge variant="outline" className="text-[10px] font-medium text-gray-500 border-gray-200">
              v{plugin.version}
            </Badge>
            <Badge variant="outline" className="text-[10px] font-medium text-gray-500 border-gray-200">
              {CATEGORY_LABELS[plugin.category]}
            </Badge>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">설명</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{plugin.description}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-gray-900">{plugin.rating.toFixed(1)}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">평점</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-gray-900">{formatInstalls(plugin.installs)}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">설치 수</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-gray-900">{plugin.tools.length}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">도구 수</div>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Zap size={12} /> 포함된 도구 ({plugin.tools.length})
            </h4>
            <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
              {plugin.tools.map((tool) => (
                <div key={tool.id} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="text-sm font-medium text-gray-900 font-mono">{tool.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{tool.description}</div>
                  </div>
                  {isInstalled && (
                    <Switch
                      checked={tool.enabled}
                      onCheckedChange={() => onToolToggle(plugin.id, tool.id)}
                      className="data-[state=checked]:bg-green-500 shrink-0"
                      aria-label={`${tool.name} 도구 토글`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Shield size={12} /> 필요 권한 ({plugin.permissions.length})
            </h4>
            <div className="space-y-2">
              {plugin.permissions.map((perm) => (
                <div key={perm.id} className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                  <div className="text-sm font-medium text-amber-900">{perm.name}</div>
                  <div className="text-xs text-amber-700 mt-0.5">{perm.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          {plugin.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">태그</h4>
              <div className="flex flex-wrap gap-1.5">
                {plugin.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] font-medium">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 flex gap-3">
            {isInstalled ? (
              <>
                <Button
                  className="flex-1"
                  variant={plugin.isEnabled ? 'outline' : 'default'}
                  onClick={() => onToggle(plugin.id)}
                >
                  {plugin.isEnabled ? '비활성화' : '활성화'}
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    onUninstall(plugin.id);
                    onOpenChange(false);
                  }}
                >
                  <Trash2 size={14} className="mr-1.5" />
                  제거
                </Button>
              </>
            ) : (
              <Button
                className="flex-1 bg-[#1A1A1A] hover:bg-black text-white"
                onClick={() => onInstall(plugin.id)}
              >
                <Download size={14} className="mr-1.5" />
                설치하기
              </Button>
            )}
          </div>

          {/* Last Updated */}
          <p className="text-[10px] text-gray-400 text-center">
            최종 업데이트: {plugin.lastUpdated}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// --- Main View ---

export function AgentMarketplaceView() {
  const [plugins, setPlugins] = useState<MarketplacePlugin[]>(MOCK_PLUGINS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PluginCategory | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'catalog' | 'installed'>('catalog');
  const [selectedPlugin, setSelectedPlugin] = useState<MarketplacePlugin | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredPlugins = useMemo(
    () => filterPlugins(plugins, searchQuery, selectedCategory, activeTab),
    [plugins, searchQuery, selectedCategory, activeTab],
  );

  const installedCount = useMemo(
    () => plugins.filter((p) => p.status === 'installed' || p.status === 'update_available').length,
    [plugins],
  );

  const handleSelect = useCallback((plugin: MarketplacePlugin) => {
    setSelectedPlugin(plugin);
    setIsDetailOpen(true);
  }, []);

  const handleInstall = useCallback((id: string) => {
    setPlugins((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: 'installed' as const, isEnabled: true } : p,
      ),
    );
    setSelectedPlugin((prev) =>
      prev?.id === id ? { ...prev, status: 'installed' as const, isEnabled: true } : prev,
    );
  }, []);

  const handleUninstall = useCallback((id: string) => {
    setPlugins((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: 'available' as const, isEnabled: false } : p,
      ),
    );
    setSelectedPlugin((prev) =>
      prev?.id === id ? { ...prev, status: 'available' as const, isEnabled: false } : prev,
    );
  }, []);

  const handleToggle = useCallback((id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isEnabled: !p.isEnabled } : p)),
    );
    setSelectedPlugin((prev) =>
      prev?.id === id ? { ...prev, isEnabled: !prev.isEnabled } : prev,
    );
  }, []);

  const handleToolToggle = useCallback((pluginId: string, toolId: string) => {
    setPlugins((prev) =>
      prev.map((p) =>
        p.id === pluginId
          ? {
              ...p,
              tools: p.tools.map((t) =>
                t.id === toolId ? { ...t, enabled: !t.enabled } : t,
              ),
            }
          : p,
      ),
    );
    setSelectedPlugin((prev) =>
      prev?.id === pluginId
        ? {
            ...prev,
            tools: prev.tools.map((t) =>
              t.id === toolId ? { ...t, enabled: !t.enabled } : t,
            ),
          }
        : prev,
    );
  }, []);

  // Sync selectedPlugin when plugins change
  const currentSelectedPlugin = useMemo(
    () => (selectedPlugin ? plugins.find((p) => p.id === selectedPlugin.id) ?? selectedPlugin : null),
    [plugins, selectedPlugin],
  );

  return (
    <div data-testid="agent-marketplace-view">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-80">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <Input
            type="text"
            placeholder="플러그인 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="marketplace-search"
          />
        </div>

        {/* Tab Switch */}
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'catalog' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('catalog')}
            className={`rounded-full text-xs font-bold ${
              activeTab === 'catalog'
                ? 'bg-black text-white hover:bg-black/90'
                : 'bg-white text-gray-500 hover:bg-gray-100'
            }`}
          >
            카탈로그
          </Button>
          <Button
            variant={activeTab === 'installed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('installed')}
            className={`rounded-full text-xs font-bold ${
              activeTab === 'installed'
                ? 'bg-black text-white hover:bg-black/90'
                : 'bg-white text-gray-500 hover:bg-gray-100'
            }`}
          >
            내 설치 ({installedCount})
          </Button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap" data-testid="category-filters">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
          className={`rounded-full text-xs font-bold ${
            selectedCategory === 'all'
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'bg-white text-gray-500 hover:bg-gray-100'
          }`}
        >
          전체
        </Button>
        {CATEGORY_LIST.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full text-xs font-bold ${
              selectedCategory === cat
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-white text-gray-500 hover:bg-gray-100'
            }`}
            data-testid={`category-${cat}`}
          >
            {CATEGORY_LABELS[cat]}
          </Button>
        ))}
      </div>

      {/* Plugin Grid */}
      {filteredPlugins.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="plugin-grid">
          {filteredPlugins.map((plugin) => (
            <PluginCard
              key={plugin.id}
              plugin={plugin}
              onSelect={handleSelect}
              onInstall={handleInstall}
              onUninstall={handleUninstall}
              onToggle={handleToggle}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-500 font-medium">
            {activeTab === 'installed'
              ? '설치된 플러그인이 없습니다.'
              : '검색 결과가 없습니다.'}
          </p>
        </div>
      )}

      {/* Detail Sheet */}
      <PluginDetailSheet
        plugin={currentSelectedPlugin}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onInstall={handleInstall}
        onUninstall={handleUninstall}
        onToggle={handleToggle}
        onToolToggle={handleToolToggle}
      />
    </div>
  );
}
