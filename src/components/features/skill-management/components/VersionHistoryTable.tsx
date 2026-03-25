import React, { useState } from 'react';
import { CheckCircle, RotateCcw, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SkillVersion } from '@/types/skill-management.types';
import EvalQualityBadge from './EvalQualityBadge';

interface VersionHistoryTableProps {
  versions: SkillVersion[];
  onRollback: (version: SkillVersion) => void;
  onCompare?: (versionA: SkillVersion, versionB: SkillVersion) => void;
}

const VersionHistoryTable: React.FC<VersionHistoryTableProps> = ({
  versions,
  onRollback,
  onCompare,
}) => {
  const [compareSelection, setCompareSelection] = useState<string[]>([]);

  const toggleCompare = (version: string) => {
    setCompareSelection((prev) => {
      if (prev.includes(version)) return prev.filter((v) => v !== version);
      if (prev.length >= 2) return [prev[1], version];
      return [...prev, version];
    });
  };

  const handleCompare = () => {
    if (compareSelection.length !== 2 || !onCompare) return;
    const [a, b] = compareSelection;
    const vA = versions.find((v) => v.version === a);
    const vB = versions.find((v) => v.version === b);
    if (vA && vB) onCompare(vA, vB);
  };

  return (
    <div className="space-y-3">
      {/* Compare action bar */}
      {onCompare && versions.length >= 2 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {compareSelection.length === 0
              ? '비교할 버전을 2개 선택하세요'
              : `${compareSelection.length}/2 선택됨`}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            disabled={compareSelection.length !== 2}
            onClick={handleCompare}
          >
            <GitCompare size={12} />
            비교하기
          </Button>
        </div>
      )}

      {versions.map((v) => {
        const isSelected = compareSelection.includes(v.version);
        return (
          <div
            key={v.version}
            className={`rounded-xl border p-4 flex items-start gap-4 ${
              v.isActive
                ? 'border-[#FF3C42]/30 bg-[#FF3C42]/5'
                : isSelected
                  ? 'border-blue-300 bg-blue-50/50'
                  : 'border-gray-200 bg-white'
            }`}
          >
            {/* Compare checkbox */}
            {onCompare && versions.length >= 2 && (
              <div className="shrink-0 pt-0.5">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleCompare(v.version)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            )}

            {/* Version label */}
            <div className="shrink-0 w-20">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-gray-900">v{v.version}</span>
                {v.isActive && (
                  <CheckCircle size={13} className="text-[#FF3C42]" />
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{v.releasedAt}</p>
            </div>

            {/* Changelog */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 leading-relaxed">{v.changelog}</p>
              <div className="flex items-center gap-3 mt-2">
                <EvalQualityBadge passRate={v.evalPassRate} />
                {v.evalDelta !== null && (
                  <span
                    className={`text-xs font-medium ${
                      v.evalDelta >= 0 ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {v.evalDelta >= 0 ? '+' : ''}{Math.round(v.evalDelta * 100)}%p
                  </span>
                )}
                <span className="text-xs text-gray-400">{v.activeUserCount}명 사용 중</span>
              </div>
            </div>

            {/* Rollback button */}
            {!v.isActive && (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 h-7 text-xs gap-1"
                onClick={() => onRollback(v)}
              >
                <RotateCcw size={12} />
                롤백
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default VersionHistoryTable;
