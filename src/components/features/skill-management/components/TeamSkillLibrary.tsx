import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Download, Bell } from 'lucide-react';
import { Skill } from '@/types/skill-management.types';
import EvalQualityBadge from './EvalQualityBadge';

interface TeamSkillLibraryProps {
  /** All skills, including team-published ones */
  skills: Skill[];
  onDetail: (skill: Skill) => void;
  onInstall: (skillId: string) => void;
}

const TeamSkillLibrary: React.FC<TeamSkillLibraryProps> = ({
  skills,
  onDetail,
  onInstall,
}) => {
  // Show only skills that have publishMetadata (team/org published)
  const teamSkills = skills.filter((s) => s.publishMetadata !== null);

  if (teamSkills.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
        <Users size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">팀 공유 스킬이 없습니다.</p>
        <p className="text-xs text-gray-400 mt-1">
          개인 스킬의 상세 페이지에서 &quot;팀에 공유&quot; 버튼을 눌러 공유할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          팀 공유 스킬 ({teamSkills.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamSkills.map((skill) => {
          const pm = skill.publishMetadata!;
          const isInstalled = skill.isEnabled;

          return (
            <div
              key={skill.id}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onDetail(skill);
                }
              }}
              onClick={() => onDetail(skill)}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
            >
              {/* Top: author + scope badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                    {pm.publishedBy.charAt(0)}
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{pm.publishedBy}</span>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                  pm.scope === 'team'
                    ? 'text-blue-600 bg-blue-50 border-blue-200'
                    : 'text-purple-600 bg-purple-50 border-purple-200'
                }`}>
                  {pm.scope === 'team' ? '팀' : '조직'}
                </span>
              </div>

              {/* Title + description */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2" title={skill.title}>
                    {skill.title}
                  </h4>
                  {skill.pendingUpdate && (
                    <Bell size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2" title={skill.description}>
                  {skill.description}
                </p>
              </div>

              {/* Tags */}
              {skill.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {skill.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Bottom: eval + install/installed */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <EvalQualityBadge passRate={skill.evalPassRate} stdDev={skill.evalStdDev} />
                  <span className="text-xs text-gray-400">v{skill.version}</span>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  {isInstalled ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-green-700 bg-green-50 border border-green-200">
                      <Download size={11} />
                      설치됨
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      onClick={() => onInstall(skill.id)}
                    >
                      <Download size={12} />
                      설치
                    </Button>
                  )}
                </div>
              </div>

              {/* Changelog */}
              <p className="text-xs text-gray-400 line-clamp-1">
                {pm.publishedAt} · {pm.changelog}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamSkillLibrary;
