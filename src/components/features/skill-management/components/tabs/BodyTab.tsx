'use client';

import React from 'react';
import type { TeamSkill } from '@/types/skill-management.types';

interface BodyTabProps {
  skill: TeamSkill;
}

/** 원본 보기 전용 — SKILL.md 지시사항 본문 전문 표시 (파라미터 별도 테이블 없음) */
export function BodyTab({ skill }: BodyTabProps) {
  return (
    <div className="py-2">
      <div className="relative rounded-xl border border-gray-200 bg-gray-950 overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 border-b border-gray-700">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
          <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
          <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
          <span className="ml-auto text-xs text-gray-500 font-mono">SKILL.md</span>
        </div>
        <pre className="p-4 text-xs font-mono text-gray-200 leading-relaxed overflow-x-auto whitespace-pre-wrap break-words max-h-96 overflow-y-auto custom-scrollbar">
          <code>{skill.instructionBody}</code>
        </pre>
      </div>
    </div>
  );
}
