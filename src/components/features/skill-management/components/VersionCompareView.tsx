import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SkillVersion } from '@/types/skill-management.types';
import EvalQualityBadge from './EvalQualityBadge';
import DeltaSummary from './DeltaSummary';
import RubricScoreChart from './RubricScoreChart';

interface VersionCompareViewProps {
  skillTitle: string;
  versionA: SkillVersion;
  versionB: SkillVersion;
  onBack: () => void;
}

// Mock rubric data for demonstration
function generateMockRubric(passRate: number | null) {
  const base = passRate !== null ? Math.round(passRate * 100) : 50;
  return [
    { label: 'Content', score: Math.min(100, base + Math.round(Math.random() * 15)) },
    { label: 'Structure', score: Math.min(100, base - 5 + Math.round(Math.random() * 20)) },
    { label: 'Accuracy', score: Math.min(100, base + Math.round(Math.random() * 10)) },
    { label: 'Tone', score: Math.min(100, base - 10 + Math.round(Math.random() * 25)) },
    { label: 'Completeness', score: Math.min(100, base + Math.round(Math.random() * 12)) },
  ];
}

const VersionCompareView: React.FC<VersionCompareViewProps> = ({
  skillTitle,
  versionA,
  versionB,
  onBack,
}) => {
  const rubricA = generateMockRubric(versionA.evalPassRate);
  const rubricB = generateMockRubric(versionB.evalPassRate);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={onBack}
        >
          <ArrowLeft size={14} />
          버전 이력
        </Button>
        <span className="text-xs text-gray-400">
          {skillTitle} — v{versionA.version} vs v{versionB.version}
        </span>
      </div>

      {/* Version headers */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-xs text-blue-500 mb-1">버전 A</p>
          <p className="text-lg font-bold text-blue-700">v{versionA.version}</p>
          <p className="text-xs text-blue-400 mt-0.5">{versionA.releasedAt}</p>
          <div className="mt-2 flex justify-center">
            <EvalQualityBadge passRate={versionA.evalPassRate} size="md" />
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">버전 B</p>
          <p className="text-lg font-bold text-gray-700">v{versionB.version}</p>
          <p className="text-xs text-gray-400 mt-0.5">{versionB.releasedAt}</p>
          <div className="mt-2 flex justify-center">
            <EvalQualityBadge passRate={versionB.evalPassRate} size="md" />
          </div>
        </div>
      </div>

      {/* Delta summary */}
      <section>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          성능 비교
        </h4>
        <DeltaSummary
          items={[
            {
              label: '통과율',
              oldValue: versionB.evalPassRate,
              newValue: versionA.evalPassRate,
              unit: '%',
              isPercentage: true,
            },
            {
              label: '활성 사용자',
              oldValue: versionB.activeUserCount,
              newValue: versionA.activeUserCount,
              unit: '명',
            },
          ]}
        />
      </section>

      {/* Rubric radar chart */}
      <section>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Rubric 점수 비교
        </h4>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <RubricScoreChart
            versionA={{ label: `v${versionA.version}`, axes: rubricA }}
            versionB={{ label: `v${versionB.version}`, axes: rubricB }}
          />
        </div>
      </section>

      {/* Changelogs */}
      <section>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          변경 내역
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-500 mb-1">v{versionA.version}</p>
            <p className="text-sm text-gray-700">{versionA.changelog}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-500 mb-1">v{versionB.version}</p>
            <p className="text-sm text-gray-700">{versionB.changelog}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VersionCompareView;
