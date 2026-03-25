import React, { useState } from 'react';
import { Search, Users, Globe, Lock, X, FileDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skill, SkillDeployPolicy, TargetScope } from '@/types/skill-management.types';
import EvalQualityBadge from './EvalQualityBadge';
import SkillSourceBadge from './SkillSourceBadge';

interface OrgSkillManagementPanelProps {
  skills: Skill[];
  onPolicyChange: (skillId: string, policy: SkillDeployPolicy) => void;
  onToggle: (skillId: string) => void;
  onDetail?: (skill: Skill) => void;
}

const POLICY_OPTIONS: { value: SkillDeployPolicy; label: string; colorClass: string }[] = [
  { value: 'mandatory', label: '필수', colorClass: 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100' },
  { value: 'recommended', label: '권장', colorClass: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100' },
  { value: 'allowed', label: '허용', colorClass: 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100' },
  { value: 'blocked', label: '차단', colorClass: 'text-gray-400 bg-gray-100 border-gray-200 hover:bg-gray-200' },
];

const SCOPE_ICON: Record<TargetScope, React.ReactNode> = {
  all: <Globe size={12} className="text-gray-400" />,
  teams: <Users size={12} className="text-gray-400" />,
  personal: <Lock size={12} className="text-gray-400" />,
};

const SCOPE_LABEL: Record<TargetScope, string> = {
  all: '전체',
  teams: '팀',
  personal: '개인',
};

// ST-8: 확인이 필요한 위험 정책
const DANGEROUS_POLICIES: SkillDeployPolicy[] = ['mandatory', 'blocked'];

const OrgSkillManagementPanel: React.FC<OrgSkillManagementPanelProps> = ({
  skills,
  onPolicyChange,
  onToggle,
  onDetail,
}) => {
  const [search, setSearch] = useState('');
  const [policyConfirm, setPolicyConfirm] = useState<{ skillId: string; skillTitle: string; policy: SkillDeployPolicy } | null>(null);

  const filtered = skills.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.author.toLowerCase().includes(search.toLowerCase()),
  );

  // ST-8: 정책 변경 시 위험 정책은 확인 다이얼로그 표시
  const handlePolicySelect = (skill: Skill, policy: SkillDeployPolicy) => {
    if (DANGEROUS_POLICIES.includes(policy) && skill.deployPolicy !== policy) {
      setPolicyConfirm({ skillId: skill.id, skillTitle: skill.title, policy });
    } else {
      onPolicyChange(skill.id, policy);
    }
  };

  // Sprint 4-2: CSV export
  const handleExportCsv = () => {
    const headers = ['이름', '소스', '카테고리', '배포정책', '활성', '평가통과율', '활성사용자'];
    const rows = filtered.map((s) => [
      s.title,
      s.source,
      s.category,
      s.deployPolicy,
      s.isEnabled ? 'Y' : 'N',
      s.evalPassRate !== null ? `${Math.round(s.evalPassRate * 100)}%` : '-',
      String(s.activeUserCount),
    ]);
    const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skill-list-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Search + CSV export */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="스킬 검색"
            className="pl-9 pr-8 bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={handleExportCsv}
        >
          <FileDown size={14} />
          CSV 내보내기
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200">
          <span className="text-xs font-bold text-gray-400">스킬</span>
          <span className="text-xs font-bold text-gray-400 text-center w-16">평가</span>
          <span className="text-xs font-bold text-gray-400 text-center w-28">배포 정책</span>
          <span className="text-xs font-bold text-gray-400 text-center w-12">활성</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-400">검색 결과가 없습니다.</p>
            {/* FI-9: 필터 초기화 버튼 */}
            {search && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setSearch('')}
              >
                필터 초기화
              </Button>
            )}
          </div>
        ) : (
          filtered.map((skill) => (
            <div
              key={skill.id}
              className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer"
              onClick={() => onDetail?.(skill)}
            >
              {/* Skill info — QW-10: 행 클릭 → 상세 패널 */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-900 truncate">{skill.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <SkillSourceBadge source={skill.source} />
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    {SCOPE_ICON[skill.targetScope]}
                    {SCOPE_LABEL[skill.targetScope]}
                  </div>
                </div>
              </div>

              {/* Eval badge */}
              <div className="w-16 flex justify-center" onClick={(e) => e.stopPropagation()}>
                <EvalQualityBadge passRate={skill.evalPassRate} />
              </div>

              {/* Policy selector */}
              <div className="w-28" onClick={(e) => e.stopPropagation()}>
                <select
                  value={skill.deployPolicy}
                  onChange={(e) => handlePolicySelect(skill, e.target.value as SkillDeployPolicy)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
                >
                  {POLICY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggle */}
              <div className="w-12 flex justify-center" onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={skill.isEnabled}
                  onCheckedChange={() => onToggle(skill.id)}
                  disabled={skill.deployPolicy === 'mandatory' || skill.deployPolicy === 'blocked'}
                  className="data-[state=checked]:bg-green-500"
                />
                {(skill.deployPolicy === 'mandatory' || skill.deployPolicy === 'blocked') && (
                  <span className="text-[10px] text-gray-400 leading-none">
                    {skill.deployPolicy === 'mandatory' ? '필수' : '차단됨'}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-gray-400 text-right">
        전체 {filtered.length}개 스킬 · 활성 {filtered.filter((s) => s.isEnabled).length}개
      </p>

      {/* ST-8: 정책 변경 확인 다이얼로그 */}
      <ConfirmDialog
        open={policyConfirm !== null}
        title="배포 정책 변경"
        description={
          policyConfirm ? (
            <>
              <strong>&quot;{policyConfirm.skillTitle}&quot;</strong> 스킬의 배포 정책을{' '}
              <strong>{POLICY_OPTIONS.find((o) => o.value === policyConfirm.policy)?.label}</strong>
              (으)로 변경하시겠습니까?
              {policyConfirm.policy === 'mandatory' && (
                <span className="block mt-1 text-amber-600">모든 구성원에게 이 스킬이 필수로 적용됩니다.</span>
              )}
              {policyConfirm.policy === 'blocked' && (
                <span className="block mt-1 text-red-600">모든 구성원이 이 스킬을 사용할 수 없게 됩니다.</span>
              )}
            </>
          ) : ''
        }
        destructive={policyConfirm?.policy === 'blocked'}
        confirmLabel="변경"
        onConfirm={() => {
          if (policyConfirm) {
            onPolicyChange(policyConfirm.skillId, policyConfirm.policy);
            setPolicyConfirm(null);
          }
        }}
        onCancel={() => setPolicyConfirm(null)}
      />
    </div>
  );
};

export default OrgSkillManagementPanel;
