import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ChevronRight, Bell, Download } from 'lucide-react';
import { Skill } from '@/types/skill-management.types';
import EvalQualityBadge from './EvalQualityBadge';
import SkillSourceBadge from './SkillSourceBadge';

interface SkillCardProps {
  skill: Skill;
  onToggle: (id: string) => void;
  onClick: (skill: Skill) => void;
  onInstall?: (id: string) => void;
}

const POLICY_LABEL: Record<string, { label: string; colorClass: string }> = {
  mandatory: { label: '필수', colorClass: 'text-red-600 bg-red-50 border-red-200' },
  recommended: { label: '권장', colorClass: 'text-blue-600 bg-blue-50 border-blue-200' },
  allowed: { label: '허용', colorClass: 'text-gray-500 bg-gray-50 border-gray-200' },
  blocked: { label: '차단', colorClass: 'text-gray-400 bg-gray-100 border-gray-200' },
};

const SkillCard: React.FC<SkillCardProps> = ({ skill, onToggle, onClick, onInstall }) => {
  const policy = POLICY_LABEL[skill.deployPolicy];
  const isMandatory = skill.deployPolicy === 'mandatory';
  const isBlocked = skill.deployPolicy === 'blocked';

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(skill); } }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
      onClick={() => onClick(skill)}
    >
      {/* Top row: source badge + policy badge */}
      <div className="flex items-center justify-between">
        <SkillSourceBadge source={skill.source} />
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${policy.colorClass}`}
        >
          {policy.label}
        </span>
      </div>

      {/* Title + description — FI-2: title에 tooltip */}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4
            className="text-sm font-bold text-gray-900 leading-tight line-clamp-2"
            title={skill.title}
          >
            {skill.title}
          </h4>
          {skill.pendingUpdate && (
            <Bell size={14} className="text-amber-500 shrink-0 mt-0.5" />
          )}
        </div>
        <p
          className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-3"
          title={skill.description}
        >
          {skill.description}
        </p>
      </div>

      {/* Tags */}
      {skill.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {skill.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom row: eval badge + toggle/install */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <EvalQualityBadge passRate={skill.evalPassRate} stdDev={skill.evalStdDev} />

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Sprint 3-4: Show install button for non-installed non-personal skills */}
          {!skill.isEnabled && skill.source !== 'personal' && onInstall ? (
            <Button
              size="sm"
              className="h-7 text-xs bg-gray-900 hover:bg-black text-white gap-1"
              onClick={() => onInstall(skill.id)}
            >
              <Download size={12} />
              설치
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onClick(skill)}
              >
                <ChevronRight size={14} />
              </Button>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillCard;
