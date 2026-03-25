import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, Users, Server, CheckCircle, XCircle, Trash2, Share2, Download } from 'lucide-react';
import { Skill, SkillDetailTab, SkillVersion, SkillDeployPolicy, EvalSubTab } from '@/types/skill-management.types';
import EvalQualityBadge from './EvalQualityBadge';
import SkillSourceBadge from './SkillSourceBadge';
import VersionHistoryTable from './VersionHistoryTable';
import VersionCompareView from './VersionCompareView';
import RollbackConfirmModal from './RollbackConfirmModal';
import OutputsTab from './OutputsTab';
import BenchmarkTab from './BenchmarkTab';

interface SkillDetailPanelProps {
  skill: Skill | null;
  isOpen: boolean;
  isAdmin?: boolean;
  onClose: () => void;
  onToggle: (id: string) => void;
  onRollback: (skillId: string, version: SkillVersion) => void;
  onApplyUpdate: (skillId: string) => void;
  onPolicyChange?: (skillId: string, policy: SkillDeployPolicy) => void;
  onDelete?: (skillId: string) => void;
  onPublish?: (skillId: string) => void;
  onInstall?: (skillId: string) => void;
}

const TABS: { id: SkillDetailTab; label: string }[] = [
  { id: 'overview', label: '개요' },
  { id: 'eval', label: '평가 결과' },
  { id: 'versions', label: '버전 이력' },
];

const DEPLOY_POLICY_OPTIONS: { value: SkillDeployPolicy; label: string }[] = [
  { value: 'mandatory', label: '필수 (모든 구성원 사용)' },
  { value: 'recommended', label: '권장 (기본 활성화, 해제 가능)' },
  { value: 'allowed', label: '허용 (선택적 사용)' },
  { value: 'blocked', label: '차단 (사용 불가)' },
];

const SkillDetailPanel: React.FC<SkillDetailPanelProps> = ({
  skill,
  isOpen,
  isAdmin = false,
  onClose,
  onToggle,
  onRollback,
  onApplyUpdate,
  onPolicyChange,
  onDelete,
  onPublish,
  onInstall,
}) => {
  const [activeTab, setActiveTab] = useState<SkillDetailTab>('overview');
  const [evalSubTab, setEvalSubTab] = useState<EvalSubTab>('outputs');
  const [rollbackTarget, setRollbackTarget] = useState<SkillVersion | null>(null);
  const [compareVersions, setCompareVersions] = useState<[SkillVersion, SkillVersion] | null>(null);

  if (!skill) return null;

  const isMandatory = skill.deployPolicy === 'mandatory';
  const isBlocked = skill.deployPolicy === 'blocked';

  const handleRollbackRequest = (version: SkillVersion) => {
    setRollbackTarget(version);
  };

  const handleRollbackConfirm = () => {
    if (rollbackTarget) {
      onRollback(skill.id, rollbackTarget);
      setRollbackTarget(null);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="w-full sm:max-w-[520px] overflow-y-auto p-0">
          {/* Header */}
          <SheetHeader className="px-6 py-5 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <SkillSourceBadge source={skill.source} />
                  {skill.pendingUpdate && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      <Bell size={11} />
                      업데이트 있음
                    </span>
                  )}
                </div>
                <SheetTitle className="text-base font-bold text-gray-900 leading-snug">
                  {skill.title}
                </SheetTitle>
                <p className="text-xs text-gray-400 mt-0.5">v{skill.version} · {skill.author}</p>
              </div>

              <div className="flex flex-col items-end gap-0.5 shrink-0 mt-1">
                <Switch
                  checked={skill.isEnabled}
                  onCheckedChange={() => onToggle(skill.id)}
                  disabled={isMandatory || isBlocked}
                  className="data-[state=checked]:bg-green-500"
                />
                {(isMandatory || isBlocked) && (
                  <span className="text-[10px] text-gray-400 leading-none">
                    {isMandatory ? '필수' : '차단됨'}
                  </span>
                )}
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 mt-4" role="tablist">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </SheetHeader>

          {/* Body */}
          <div className="px-6 py-5 space-y-6">

            {/* -- Overview tab -- */}
            {activeTab === 'overview' && (
              <>
                <section>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">설명</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{skill.description}</p>
                </section>

                {/* Tags */}
                {skill.tags.length > 0 && (
                  <section>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">태그</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {skill.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Stats */}
                <section>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">통계</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Users size={13} className="text-gray-400" />
                        <span className="text-xs text-gray-500">활성 사용자</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{skill.activeUserCount}명</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs text-gray-500">평가 통과율</span>
                      </div>
                      <EvalQualityBadge passRate={skill.evalPassRate} stdDev={skill.evalStdDev} size="md" />
                    </div>
                  </div>
                </section>

                {/* MCP requirements */}
                {skill.requiresMcp.length > 0 && (
                  <section>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      필요한 MCP 서버
                    </h3>
                    <div className="space-y-1.5">
                      {skill.requiresMcp.map((mcp) => (
                        <div key={mcp} className="flex items-center gap-2 text-xs text-gray-600">
                          <Server size={12} className="text-gray-400" />
                          {mcp}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Publish to team — personal skills only, not yet published */}
                {skill.source === 'personal' && !skill.publishMetadata && onPublish && (
                  <section>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                      onClick={() => onPublish(skill.id)}
                    >
                      <Share2 size={14} />
                      팀에 공유
                    </Button>
                  </section>
                )}

                {/* Published status */}
                {skill.publishMetadata && (
                  <section className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-blue-800 mb-1 flex items-center gap-1.5">
                          <Share2 size={12} />
                          {skill.publishMetadata.scope === 'team' ? '팀에 공유됨' : '조직에 공유됨'}
                        </p>
                        <p className="text-xs text-blue-700">{skill.publishMetadata.changelog}</p>
                        <p className="text-xs text-blue-500 mt-1">
                          {skill.publishMetadata.publishedBy} · {skill.publishMetadata.publishedAt}
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* Sprint 3-4: Install CTA for non-installed team/platform skills */}
                {!skill.isEnabled && skill.source !== 'personal' && onInstall && (
                  <section>
                    <Button
                      className="w-full bg-gray-900 hover:bg-black text-white gap-2"
                      onClick={() => onInstall(skill.id)}
                    >
                      <Download size={14} />
                      설치하기
                    </Button>
                  </section>
                )}

                {/* Pending update */}
                {skill.pendingUpdate && (
                  <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-amber-800 mb-1">
                          새 버전 v{skill.pendingUpdate.version} 이용 가능
                        </p>
                        <p className="text-xs text-amber-700">{skill.pendingUpdate.changelog}</p>
                      </div>
                      <Button
                        size="sm"
                        className="shrink-0 h-7 text-xs bg-amber-500 hover:bg-amber-600 text-white"
                        onClick={() => onApplyUpdate(skill.id)}
                      >
                        업데이트
                      </Button>
                    </div>
                  </section>
                )}

                {/* Deploy policy — ST-7: 관리자용 정책 변경 */}
                <section>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">배포 정책</h3>
                  {isAdmin && onPolicyChange ? (
                    <select
                      value={skill.deployPolicy}
                      onChange={(e) => onPolicyChange(skill.id, e.target.value as SkillDeployPolicy)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
                    >
                      {DEPLOY_POLICY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-gray-700">
                      {DEPLOY_POLICY_OPTIONS.find((o) => o.value === skill.deployPolicy)?.label ?? skill.deployPolicy}
                    </div>
                  )}
                </section>

                {/* ST-4: 삭제 버튼 (관리자 또는 개인 스킬) */}
                {(isAdmin || skill.source === 'personal') && onDelete && (
                  <section className="pt-2 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                      onClick={() => onDelete(skill.id)}
                    >
                      <Trash2 size={13} />
                      스킬 삭제
                    </Button>
                  </section>
                )}
              </>
            )}

            {/* -- Eval tab -- */}
            {activeTab === 'eval' && (
              <>
                {/* Eval summary header */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">평가 요약</h3>
                    {skill.evalLastRun && (
                      <span className="text-xs text-gray-400">마지막 실행: {skill.evalLastRun}</span>
                    )}
                  </div>

                  {skill.evalPassRate !== null ? (
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">통과율</p>
                        <EvalQualityBadge passRate={skill.evalPassRate} size="md" />
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">변동성</p>
                        <p className="text-sm font-bold text-gray-800">
                          {skill.evalStdDev !== null ? `\u00b1${Math.round(skill.evalStdDev * 100)}%` : '-'}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">기준 대비</p>
                        <p className={`text-sm font-bold ${skill.evalDelta !== null && skill.evalDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {skill.evalDelta !== null
                            ? `${skill.evalDelta >= 0 ? '+' : ''}${Math.round(skill.evalDelta * 100)}%p`
                            : '-'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-400 text-sm mb-5">
                      아직 평가가 실행되지 않았습니다.
                    </div>
                  )}
                </section>

                {/* Eval sub-tabs: Outputs / Benchmark */}
                <div className="flex gap-1 mb-4" role="tablist">
                  {([
                    { id: 'outputs' as EvalSubTab, label: 'Outputs' },
                    { id: 'benchmark' as EvalSubTab, label: 'Benchmark' },
                  ]).map((sub) => (
                    <button
                      key={sub.id}
                      role="tab"
                      aria-selected={evalSubTab === sub.id}
                      onClick={() => setEvalSubTab(sub.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        evalSubTab === sub.id
                          ? 'bg-gray-200 text-gray-900'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {evalSubTab === 'outputs' && (
                  <OutputsTab evalResults={skill.evalResults} />
                )}

                {evalSubTab === 'benchmark' && (
                  <BenchmarkTab benchmark={skill.benchmarkSummary} />
                )}
              </>
            )}

            {/* -- Versions tab -- */}
            {activeTab === 'versions' && (
              compareVersions ? (
                <VersionCompareView
                  skillTitle={skill.title}
                  versionA={compareVersions[0]}
                  versionB={compareVersions[1]}
                  onBack={() => setCompareVersions(null)}
                />
              ) : (
                <section>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">버전 이력</h3>
                  <VersionHistoryTable
                    versions={skill.versionHistory}
                    onRollback={handleRollbackRequest}
                    onCompare={(a, b) => setCompareVersions([a, b])}
                  />
                </section>
              )
            )}
          </div>
        </SheetContent>
      </Sheet>

      <RollbackConfirmModal
        isOpen={rollbackTarget !== null}
        targetVersion={rollbackTarget}
        skillTitle={skill.title}
        currentVersion={skill.version}
        onConfirm={handleRollbackConfirm}
        onCancel={() => setRollbackTarget(null)}
      />
    </>
  );
};

export default SkillDetailPanel;
