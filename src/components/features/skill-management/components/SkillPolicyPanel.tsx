import React, { useState, useMemo } from 'react';
import { Shield, Info, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import type { SkillDeployPolicy, PolicySettings, Skill } from '@/types/skill-management.types';

interface SkillPolicyPanelProps {
  initialSettings?: Partial<PolicySettings>;
  skills?: Skill[];
  onSave: (settings: PolicySettings) => void;
}

const POLICY_OPTIONS: { value: SkillDeployPolicy; label: string; description: string }[] = [
  { value: 'mandatory', label: '필수', description: '모든 구성원이 반드시 사용해야 합니다.' },
  { value: 'recommended', label: '권장', description: '기본 활성화되지만 개인이 해제할 수 있습니다.' },
  { value: 'allowed', label: '허용', description: '개인이 선택적으로 활성화할 수 있습니다.' },
  { value: 'blocked', label: '차단', description: '구성원이 사용할 수 없습니다.' },
];

const DEFAULT_SETTINGS: PolicySettings = {
  defaultPolicy: 'allowed',
  allowPersonalUpload: true,
  requireApprovalForPersonal: true,
  allowExternalSkills: false,
  evalMinPassRate: null,
};

const SkillPolicyPanel: React.FC<SkillPolicyPanelProps> = ({
  initialSettings,
  skills = [],
  onSave,
}) => {
  const [settings, setSettings] = useState<PolicySettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });
  const [isDirty, setIsDirty] = useState(false);
  const [savedSettings] = useState<PolicySettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });

  const update = <K extends keyof PolicySettings>(key: K, value: PolicySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    onSave(settings);
    setIsDirty(false);
  };

  // QW-8: 취소 — 저장 전 상태로 되돌리기
  const handleCancel = () => {
    setSettings(savedSettings);
    setIsDirty(false);
  };

  // 정책 변경 시 영향받는 스킬 수
  const affectedSkillCount = useMemo(() => {
    if (!isDirty || skills.length === 0) return null;

    let count = 0;
    // evalMinPassRate 변경 시 미달 스킬 수
    if (settings.evalMinPassRate !== null) {
      count = skills.filter(
        (s) => s.evalPassRate !== null && s.evalPassRate < settings.evalMinPassRate!,
      ).length;
    }
    return count;
  }, [isDirty, skills, settings.evalMinPassRate]);

  return (
    <div className="space-y-6">

      {/* Default Deploy Policy */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-gray-500" />
          <h3 className="text-sm font-bold text-gray-900">신규 플랫폼 스킬 기본 정책</h3>
        </div>
        <div className="space-y-2">
          {POLICY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                settings.defaultPolicy === opt.value
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:bg-gray-50/50'
              }`}
            >
              <input
                type="radio"
                name="defaultPolicy"
                value={opt.value}
                checked={settings.defaultPolicy === opt.value}
                onChange={() => update('defaultPolicy', opt.value)}
                className="mt-0.5 accent-gray-900"
              />
              <div>
                <p className="text-sm font-bold text-gray-800">{opt.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Upload & Approval Settings */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">업로드 및 승인 설정</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">개인 스킬 업로드 허용</p>
              <p className="text-xs text-gray-500 mt-0.5">구성원이 직접 스킬 파일을 업로드할 수 있습니다.</p>
            </div>
            <Switch
              checked={settings.allowPersonalUpload}
              onCheckedChange={(v) => update('allowPersonalUpload', v)}
              className="data-[state=checked]:bg-green-500"
            />
          </div>

          {settings.allowPersonalUpload && (
            <div className="flex items-center justify-between pl-4 border-l-2 border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-800">관리자 승인 필요</p>
                <p className="text-xs text-gray-500 mt-0.5">업로드 후 관리자 검토를 거쳐 활성화됩니다.</p>
              </div>
              <Switch
                checked={settings.requireApprovalForPersonal}
                onCheckedChange={(v) => update('requireApprovalForPersonal', v)}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">외부 스킬 허용</p>
              <p className="text-xs text-gray-500 mt-0.5">외부 플랫폼에서 가져온 스킬을 허용합니다.</p>
            </div>
            <Switch
              checked={settings.allowExternalSkills}
              onCheckedChange={(v) => update('allowExternalSkills', v)}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </div>
      </section>

      {/* Eval threshold */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-1">평가 통과율 기준</h3>
        <div className="flex items-center gap-2 mb-4">
          <Info size={13} className="text-gray-400" />
          <p className="text-xs text-gray-500">이 기준 미달 시 스킬 활성화가 제한됩니다. 비워두면 제한 없음.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={100}
            value={settings.evalMinPassRate !== null ? Math.round(settings.evalMinPassRate * 100) : ''}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                update('evalMinPassRate', null);
                return;
              }
              // QW-5: NaN 방어
              const num = Number(val);
              if (Number.isNaN(num)) return;
              update('evalMinPassRate', Math.min(100, Math.max(0, num)) / 100);
            }}
            placeholder="예: 70"
            className="w-24 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <span className="text-sm text-gray-500">% 이상</span>
        </div>
      </section>

      {/* Affected skills preview */}
      {affectedSkillCount !== null && affectedSkillCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle size={14} className="text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700">
            이 설정 변경은 <strong>{affectedSkillCount}개 스킬</strong>에 영향을 미칩니다.
            (평가 통과율 기준 미달)
          </p>
        </div>
      )}

      {/* Save + Cancel */}
      <div className="flex justify-end gap-2">
        {/* QW-8: 취소 버튼 */}
        {isDirty && (
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            취소
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={!isDirty}
          className="bg-[#1A1A1A] hover:bg-black text-white"
        >
          설정 저장
        </Button>
      </div>
    </div>
  );
};

export default SkillPolicyPanel;
