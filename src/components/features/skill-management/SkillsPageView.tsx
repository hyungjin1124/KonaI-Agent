'use client';

import React, { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TeamSkill, MarketplaceSkill } from '@/types/skill-management.types';
import { mockTeamSkills, CURRENT_USER } from './data/skillMockData';
import TeamSkillsTab from './components/TeamSkillsTab';
import MarketplaceTab from './components/MarketplaceTab';

// ── Toast ─────────────────────────────────────────────────────────────────────

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SkillsPageView() {
  const [activeTab, setActiveTab] = useState<'team' | 'marketplace'>('team');
  const [skills, setSkills] = useState<TeamSkill[]>(mockTeamSkills);
  const [toast, setToast] = useState<ToastState | null>(null);

  // ── Toast helper ────────────────────────────────────────────────────────────
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Marketplace → 팀 참조 추가 ─────────────────────────────────────────────
  const handleAddReference = useCallback(
    (mktSkill: MarketplaceSkill) => {
      // 이미 참조 중인지 확인
      if (skills.some((s) => s.marketplaceRefId === mktSkill.id)) {
        showToast('이미 팀에 활성화된 스킬입니다', 'info');
        return;
      }

      const now = new Date();
      const today = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

      const refSkill: TeamSkill = {
        ...mktSkill,
        id: `ref-${mktSkill.id}-${Date.now()}`,
        activatedBy: [CURRENT_USER.id],
        isActivatedByMe: true,
        creationSource: 'marketplace-ref',
        isMarketplaceRef: true,
        marketplaceRefId: mktSkill.id,
        createdAt: today,
        lastModifiedAt: mktSkill.lastModifiedAt,
        callCount: 0,
      };

      setSkills((prev) => [refSkill, ...prev]);
      showToast(`'${mktSkill.name}' 스킬이 팀에 활성화되었습니다`, 'success');
    },
    [skills, showToast],
  );

  // ── Marketplace → 독립 복사 ────────────────────────────────────────────────
  const handleCopyFromMarketplace = useCallback(
    (mktSkill: MarketplaceSkill) => {
      const now = new Date();
      const today = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

      // 자동 넘버링
      const baseName = mktSkill.name;
      const mySkillNames = new Set(
        skills.filter((s) => s.authorId === CURRENT_USER.id).map((s) => s.name),
      );
      let copyName = baseName;
      if (mySkillNames.has(baseName)) {
        for (let n = 2; ; n++) {
          const candidate = `${baseName} (${n})`;
          if (!mySkillNames.has(candidate)) {
            copyName = candidate;
            break;
          }
        }
      }

      const newSkill: TeamSkill = {
        ...mktSkill,
        id: `skill-copy-mkt-${Date.now()}`,
        name: copyName,
        author: CURRENT_USER.name,
        authorId: CURRENT_USER.id,
        createdAt: today,
        lastModifiedAt: today,
        version: 'v1',
        callCount: 0,
        activatedBy: [CURRENT_USER.id],
        isActivatedByMe: true,
        creationSource: 'copied',
        isMarketplaceRef: undefined,
        marketplaceRefId: undefined,
        isPublishedToMarketplace: false,
        authorTeam: undefined,
        copySource: {
          originalSkillId: mktSkill.id,
          originalSkillName: mktSkill.name,
          originalAuthor: `${mktSkill.author} (${mktSkill.authorTeam})`,
        },
        versionHistory: [
          {
            version: 'v1',
            modifiedAt: today,
            modifiedBy: CURRENT_USER.name,
            changeEntries: [{ tag: '추가', subject: `${mktSkill.author}(${mktSkill.authorTeam})의 '${mktSkill.name}' ${mktSkill.version}에서 복사` }],
          },
        ],
      };

      setSkills((prev) => [newSkill, ...prev]);
      showToast(`'${copyName}' 스킬이 생성되었습니다`, 'success');
    },
    [skills, showToast],
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as 'team' | 'marketplace')}
      className="h-full flex flex-col bg-[#F7F9FB] overflow-hidden"
    >
      {/* ─── Page Header (AdminView 탭 패턴: 좌=타이틀, 우=탭) ─── */}
      <div className="px-8 py-5 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">스킬</h1>
            <p className="text-sm text-gray-500 mt-0.5">팀 스킬을 관리하고, 마켓플레이스에서 다른 팀의 스킬을 탐색합니다.</p>
          </div>
          <TabsList className="bg-gray-100 p-1 rounded-lg h-auto">
            <TabsTrigger
              value="team"
              className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
            >
              팀 스킬
            </TabsTrigger>
            <TabsTrigger
              value="marketplace"
              className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
            >
              마켓플레이스
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* ─── Content (single flex-1 wrapper → TabsContent fills h-full) ─── */}
      <div className="flex-1 min-h-0">
        <TabsContent value="team" className="mt-0 h-full">
          <TeamSkillsTab
            skills={skills}
            onSkillsChange={setSkills}
            showToast={showToast}
          />
        </TabsContent>
        <TabsContent value="marketplace" className="mt-0 h-full">
          <MarketplaceTab
            teamSkills={skills}
            onAddReference={handleAddReference}
            onCopyFromMarketplace={handleCopyFromMarketplace}
            showToast={showToast}
          />
        </TabsContent>
      </div>

      {/* ─── Toast ─── */}
      {toast && (
        <div
          className={[
            'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium transition-all duration-300',
            toast.type === 'success' && 'bg-green-600 text-white',
            toast.type === 'error' && 'bg-red-600 text-white',
            toast.type === 'info' && 'bg-gray-800 text-white',
          ].filter(Boolean).join(' ')}
        >
          {toast.message}
        </div>
      )}
    </Tabs>
  );
}
