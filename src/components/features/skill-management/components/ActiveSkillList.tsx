import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ChevronRight, Bell } from 'lucide-react';
import { Skill } from '@/types/skill-management.types';
import EvalQualityBadge from './EvalQualityBadge';
import SkillSourceBadge from './SkillSourceBadge';

interface ActiveSkillListProps {
  skills: Skill[];
  onToggle: (id: string) => void;
  onDetail: (skill: Skill) => void;
  onApplyUpdate: (skillId: string) => void;
  onTabChange: () => void;
}

const ActiveSkillList: React.FC<ActiveSkillListProps> = ({
  skills,
  onToggle,
  onDetail,
  onApplyUpdate,
  onTabChange,
}) => {
  const enabledSkills = skills.filter((s) => s.isEnabled);
  const disabledSkills = skills.filter((s) => !s.isEnabled);

  const renderRow = (skill: Skill) => {
    const isMandatory = skill.deployPolicy === 'mandatory';
    const isBlocked = skill.deployPolicy === 'blocked';

    return (
      <div
        key={skill.id}
        className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-4 -mx-4 rounded-xl group"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-bold text-gray-900 truncate">{skill.title}</span>
              {skill.pendingUpdate && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0 animate-pulse">
                  <Bell size={11} />
                  v{skill.pendingUpdate.version} 업데이트
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <SkillSourceBadge source={skill.source} />
              <EvalQualityBadge passRate={skill.evalPassRate} />
              <span className="text-xs text-gray-400">v{skill.version}</span>
            </div>
          </div>
        </div>

        <div
          className="flex items-center gap-2 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {skill.pendingUpdate && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 border-amber-200 text-amber-700 hover:bg-amber-50"
              onClick={() => onApplyUpdate(skill.id)}
            >
              <Bell size={11} />
              리뷰
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDetail(skill)}
          >
            <ChevronRight size={15} />
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
        </div>
      </div>
    );
  };

  if (skills.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
        <p className="text-sm text-gray-500">활성화된 스킬이 없습니다.</p>
        <p className="text-xs text-gray-400 mt-1">카탈로그에서 스킬을 활성화하세요.</p>
        {/* FI-8: 카탈로그로 이동 CTA */}
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={onTabChange}
        >
          카탈로그로 이동
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {enabledSkills.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            활성화됨 ({enabledSkills.length})
          </h3>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4">
            {enabledSkills.map(renderRow)}
          </div>
        </div>
      )}

      {disabledSkills.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            비활성화됨 ({disabledSkills.length})
          </h3>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 opacity-60">
            {disabledSkills.map(renderRow)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveSkillList;
