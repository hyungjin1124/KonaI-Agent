'use client';

import React from 'react';
import TeamSkillsTab from './components/TeamSkillsTab';

export default function SkillsPageView() {
  return (
    <div className="h-full flex flex-col bg-[#F7F9FB]">
      {/* ─── Page Header ─── */}
      <div className="shrink-0 bg-white border-b border-gray-200">
        <div className="px-8">
          <div className="flex items-center gap-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">팀 스킬</h1>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="flex-1 min-h-0 flex flex-col">
        <TeamSkillsTab />
      </div>
    </div>
  );
}
