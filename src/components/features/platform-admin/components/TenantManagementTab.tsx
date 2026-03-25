import React, { useState, useMemo } from 'react';
import { Search, Plus, Building2, Key } from '../../../icons';
import { KPICard } from '../../../shared/atoms/KPICard';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import TenantHealthCard from './TenantHealthCard';
import TenantTableView from './TenantTableView';
import TenantDetailPanel from './TenantDetailPanel';
import TenantCreateWizard from './TenantCreateWizard';
import { MOCK_TENANTS, computeTenantKPI, filterTenants } from '../data/tenantData';
import type { Tenant, TenantCreateInput } from '../data/platformAdminTypes';

type ViewMode = 'card' | 'table';

const STATUS_OPTIONS = ['헬스 상태 전체', '정상', '주의', '위험', '비활성'];
const HEALTH_ORDER: Record<string, number> = { danger: 0, warning: 1, healthy: 2 };

const TenantManagementTab: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [statusFilter, setStatusFilter] = useState('헬스 상태 전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>(MOCK_TENANTS);
  const [toastMsg, setToastMsg] = useState('');

  const kpi = useMemo(() => computeTenantKPI(tenants), [tenants]);

  const filteredTenants = useMemo(
    () => filterTenants(tenants, { status: statusFilter, search: searchQuery })
      .sort((a, b) => (HEALTH_ORDER[a.healthLevel] ?? 3) - (HEALTH_ORDER[b.healthLevel] ?? 3)),
    [tenants, statusFilter, searchQuery]
  );

  const handleSelect = (tenant: Tenant) => {
    setSelectedTenant(prev => prev?.id === tenant.id ? null : tenant);
  };

  const handleUpdate = (updated: Tenant) => {
    setTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
    setSelectedTenant(updated);
  };

  const handleCreate = (input: TenantCreateInput) => {
    const newTenant: Tenant = {
      id: `t-${Date.now()}`,
      name: input.name,
      domain: input.domain,
      industry: input.industry,
      plan: input.plan,
      status: 'Trial',
      healthScore: 100,
      healthLevel: 'healthy',
      metrics: {
        errorRate: 0,
        responseTimeSec: 0,
        tokenLimitUsage: 0,
        lastActivityAgo: '방금',
        lastActivityMinutes: 0,
        paymentStatus: 'trial',
      },
      contact: {
        name: input.contactName,
        email: input.contactEmail,
        phone: input.contactPhone,
      },
      contractPeriod: { start: input.contractStart, end: input.contractEnd },
      memo: input.memo || undefined,
      apiKeys: [],
      resourceLimits: {
        rateLimitPerMin: 1000,
        tokenLimitPerMonth: '5M',
        maxConcurrentSessions: 10,
        maxUsers: 50,
        fileStorageGb: 10,
        dataRetentionMonths: 12,
      },
      tags: input.tags,
    };
    setTenants(prev => [newTenant, ...prev]);
    setWizardOpen(false);
    setSelectedTenant(newTenant);
    setToastMsg(`"${input.name}" 테넌트가 생성되었습니다.`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div>
      {/* Data freshness */}
      <div className="flex justify-end mb-2">
        <span className="text-[11px] text-gray-400">마지막 업데이트: {new Date().toLocaleString('ko-KR')}</span>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard
          title="전체 테넌트"
          value={kpi.total.value}
          icon={<Building2 size={14} />}
        />
        <KPICard title="정상" value={kpi.healthy.value} />
        <KPICard
          title="주의 / 위험"
          value={`${kpi.warningDanger.warning} / ${kpi.warningDanger.danger}`}
        />
        <KPICard
          title="발급 API 키"
          value={kpi.apiKeys.value}
          subtitle={kpi.apiKeys.subtitle}
          icon={<Key size={14} />}
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {/* View toggle */}
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('card')}
            className={`text-xs px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'card' ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            헬스 카드
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`text-xs px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            테이블
          </button>
        </div>

        <select
          aria-label="테넌트 상태 필터"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setSelectedTenant(null); }}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
          {STATUS_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
        </select>

        <div className="relative flex-1 max-w-[200px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setSelectedTenant(null); }}
            placeholder="회사명, 도메인 검색..."
            className="h-8 text-xs pl-8"
          />
        </div>

        <Button
          size="sm"
          className="h-8 text-xs bg-[#534AB7] hover:bg-[#4339a0] ml-auto"
          onClick={() => setWizardOpen(true)}
        >
          <Plus size={14} className="mr-1" /> 테넌트 추가
        </Button>
      </div>

      {/* Card View */}
      {viewMode === 'card' && (
        filteredTenants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredTenants.map(t => (
              <TenantHealthCard key={t.id} tenant={t} onClick={handleSelect} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 size={32} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 mb-1">검색 결과가 없습니다.</p>
            <p className="text-xs text-gray-400">다른 검색어를 시도하거나 필터를 변경해보세요.</p>
          </div>
        )
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <TenantTableView tenants={filteredTenants} onSelect={handleSelect} />
      )}

      {/* Slide-over detail panel */}
      {selectedTenant && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 bg-black/20"
            onClick={() => setSelectedTenant(null)}
          />
          {/* Panel */}
          <div role="dialog" aria-modal="true" aria-label="테넌트 상세" className="fixed inset-y-0 right-0 z-40 w-[480px] max-w-full bg-[#F7F9FB] shadow-2xl overflow-y-auto animate-slide-in-right">
            <TenantDetailPanel
              key={selectedTenant.id}
              tenant={selectedTenant}
              onUpdate={handleUpdate}
              onClose={() => setSelectedTenant(null)}
            />
          </div>
        </>
      )}

      {/* Create Wizard */}
      {wizardOpen && (
        <TenantCreateWizard
          onClose={() => setWizardOpen(false)}
          onCreate={handleCreate}
          existingTenants={tenants}
        />
      )}
      {/* Toast */}
      {toastMsg && (
        <div role="alert" className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-green-600 text-white text-sm rounded-lg shadow-lg animate-fade-in-up">
          {toastMsg}
        </div>
      )}
    </div>
  );
};

export default TenantManagementTab;
