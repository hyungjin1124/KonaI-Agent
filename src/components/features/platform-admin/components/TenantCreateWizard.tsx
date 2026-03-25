import React, { useState } from 'react';
import { X, Check, ChevronRight } from '../../../icons';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import type { Tenant, TenantCreateInput, TenantPlan, TenantIndustry } from '../data/platformAdminTypes';

interface TenantCreateWizardProps {
  onClose: () => void;
  onCreate: (input: TenantCreateInput) => void;
  existingTenants?: Tenant[];
}

type Step = 1 | 2 | 3 | 4;

const STEPS: { id: Step; label: string }[] = [
  { id: 1, label: '기본 정보' },
  { id: 2, label: '플랜 & 계약' },
  { id: 3, label: '관리자 계정' },
  { id: 4, label: '초기 설정' },
];

const PLAN_OPTIONS: { id: TenantPlan; name: string; desc: string; price: string }[] = [
  { id: 'Starter', name: 'Starter', desc: '소규모 팀, 월 50만 토큰', price: '₩290,000 / 월' },
  { id: 'Business', name: 'Business', desc: '중규모 기업, 월 500만 토큰', price: '₩890,000 / 월' },
  { id: 'Enterprise', name: 'Enterprise', desc: '대기업, 무제한 + SLA 보장', price: '협의' },
];

const INDUSTRY_OPTIONS: { id: TenantIndustry; label: string }[] = [
  { id: 'finance', label: '금융' },
  { id: 'manufacturing', label: '제조' },
  { id: 'healthcare', label: '헬스케어' },
  { id: 'retail', label: '유통/리테일' },
  { id: 'education', label: '교육' },
  { id: 'other', label: '기타' },
];

const DEFAULT_INPUT: TenantCreateInput = {
  name: '', domain: '', industry: 'other',
  contactName: '', contactEmail: '', contactPhone: '',
  plan: 'Business', contractStart: '', contractEnd: '',
  adminEmail: '', useInviteLink: false, enableSso: false,
  tags: [], memo: '', deployDemoAgent: false,
};

const FieldRow: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({
  label, required, children,
}) => (
  <div>
    <label className="text-xs font-medium text-gray-700 mb-1 block">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const DOMAIN_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TenantCreateWizard: React.FC<TenantCreateWizardProps> = ({ onClose, onCreate, existingTenants = [] }) => {
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<TenantCreateInput>(DEFAULT_INPUT);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: keyof TenantCreateInput, value: unknown) => {
    setData(prev => ({ ...prev, [field]: value }));
    // Clear the error for this field when the user edits it
    if (errors[field]) {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const isDomainDuplicate = data.domain.trim() && existingTenants.some(t => t.domain.toLowerCase() === data.domain.trim().toLowerCase());
  const isNameDuplicate = data.name.trim() && existingTenants.some(t => t.name.toLowerCase() === data.name.trim().toLowerCase());

  const validateStep = (s: Step): boolean => {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!data.name.trim()) errs.name = '회사명을 입력해 주세요.';
      else if (isNameDuplicate) errs.name = '이미 등록된 회사명입니다.';
      if (!data.domain.trim()) errs.domain = '도메인을 입력해 주세요.';
      else if (!DOMAIN_REGEX.test(data.domain.trim())) errs.domain = '올바른 도메인 형식을 입력해 주세요. (예: company.example.com)';
      else if (isDomainDuplicate) errs.domain = '이미 등록된 도메인입니다.';
      if (!data.contactName.trim()) errs.contactName = '담당자 이름을 입력해 주세요.';
      if (!data.contactEmail.trim()) errs.contactEmail = '담당자 이메일을 입력해 주세요.';
      else if (!EMAIL_REGEX.test(data.contactEmail.trim())) errs.contactEmail = '올바른 이메일 형식을 입력해 주세요.';
    } else if (s === 2) {
      if (!data.contractStart) errs.contractStart = '계약 시작일을 선택해 주세요.';
      if (!data.contractEnd) errs.contractEnd = '계약 종료일을 선택해 주세요.';
      else if (data.contractStart && new Date(data.contractEnd) <= new Date(data.contractStart)) {
        errs.contractEnd = '종료일은 시작일 이후여야 합니다.';
      }
    } else if (s === 3) {
      if (!data.adminEmail.trim()) errs.adminEmail = '관리자 이메일을 입력해 주세요.';
      else if (!EMAIL_REGEX.test(data.adminEmail.trim())) errs.adminEmail = '올바른 이메일 형식을 입력해 주세요.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    if (step < 4) setStep((step + 1) as Step);
    else onCreate(data);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !data.tags.includes(t)) {
      set('tags', [...data.tags, t]);
    }
    setTagInput('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">새 테넌트 생성</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-0">
            {STEPS.map((s, idx) => (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    step > s.id
                      ? 'bg-green-500 text-white'
                      : step === s.id
                      ? 'bg-[#534AB7] text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step > s.id ? <Check size={12} /> : s.id}
                  </div>
                  <span className={`text-xs font-medium ${step === s.id ? 'text-gray-900' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="flex-1 h-px bg-gray-200 mx-3 min-w-[20px]" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Step 1: 기본 정보 */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              <FieldRow label="회사명" required>
                <Input value={data.name} onChange={e => set('name', e.target.value)} placeholder="예: 삼성전자" className={`h-8 text-sm ${errors.name ? 'border-red-300' : ''}`} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </FieldRow>
              <FieldRow label="도메인" required>
                <Input value={data.domain} onChange={e => set('domain', e.target.value)} placeholder="samsung.example.com" className={`h-8 text-sm ${errors.domain ? 'border-red-300' : ''}`} />
                {errors.domain && <p className="text-xs text-red-500 mt-1">{errors.domain}</p>}
              </FieldRow>
              <FieldRow label="산업군">
                <select
                  value={data.industry}
                  onChange={e => set('industry', e.target.value as TenantIndustry)}
                  className="w-full h-8 text-sm border border-gray-200 rounded-lg px-3 focus:outline-none focus:ring-1 focus:ring-gray-300"
                >
                  {INDUSTRY_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </FieldRow>
              <div />
              <FieldRow label="담당자 이름" required>
                <Input value={data.contactName} onChange={e => set('contactName', e.target.value)} placeholder="홍길동" className={`h-8 text-sm ${errors.contactName ? 'border-red-300' : ''}`} />
                {errors.contactName && <p className="text-xs text-red-500 mt-1">{errors.contactName}</p>}
              </FieldRow>
              <FieldRow label="담당자 이메일" required>
                <Input type="email" value={data.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="contact@company.com" className={`h-8 text-sm ${errors.contactEmail ? 'border-red-300' : ''}`} />
                {errors.contactEmail && <p className="text-xs text-red-500 mt-1">{errors.contactEmail}</p>}
              </FieldRow>
              <FieldRow label="연락처">
                <Input
                  type="tel"
                  value={data.contactPhone}
                  onChange={e => {
                    const raw = e.target.value.replace(/[^\d-]/g, '');
                    set('contactPhone', raw);
                  }}
                  placeholder="010-0000-0000"
                  className="h-8 text-sm"
                />
              </FieldRow>
            </div>
          )}

          {/* Step 2: 플랜 & 계약 */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-2">요금제 선택<span className="text-red-500 ml-0.5">*</span></label>
                <div className="grid grid-cols-3 gap-3">
                  {PLAN_OPTIONS.map(plan => (
                    <button
                      key={plan.id}
                      onClick={() => set('plan', plan.id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        data.plan === plan.id
                          ? 'border-[#534AB7] bg-indigo-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-semibold text-gray-900 mb-1">{plan.name}</div>
                      <div className="text-[11px] text-gray-500 mb-2">{plan.desc}</div>
                      <div className={`text-xs font-medium ${data.plan === plan.id ? 'text-[#534AB7]' : 'text-gray-700'}`}>{plan.price}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FieldRow label="계약 시작일" required>
                  <Input type="date" value={data.contractStart} onChange={e => set('contractStart', e.target.value)} className={`h-8 text-sm ${errors.contractStart ? 'border-red-300' : ''}`} />
                  {errors.contractStart && <p className="text-xs text-red-500 mt-1">{errors.contractStart}</p>}
                </FieldRow>
                <FieldRow label="계약 종료일" required>
                  <Input type="date" value={data.contractEnd} onChange={e => set('contractEnd', e.target.value)} className={`h-8 text-sm ${errors.contractEnd ? 'border-red-300' : ''}`} />
                  {errors.contractEnd && <p className="text-xs text-red-500 mt-1">{errors.contractEnd}</p>}
                </FieldRow>
              </div>
            </div>
          )}

          {/* Step 3: 관리자 계정 */}
          {step === 3 && (
            <div className="space-y-4">
              <FieldRow label="관리자 이메일" required>
                <Input type="email" value={data.adminEmail} onChange={e => set('adminEmail', e.target.value)} placeholder="admin@company.com" className={`h-8 text-sm ${errors.adminEmail ? 'border-red-300' : ''}`} />
                {errors.adminEmail && <p className="text-xs text-red-500 mt-1">{errors.adminEmail}</p>}
              </FieldRow>
              <div className="flex items-center justify-between py-3 border border-gray-200 rounded-xl px-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">초대 링크로 계정 설정</div>
                  <div className="text-xs text-gray-500 mt-0.5">관리자에게 계정 설정 이메일 전송</div>
                </div>
                <button
                  onClick={() => set('useInviteLink', !data.useInviteLink)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${data.useInviteLink ? 'bg-[#534AB7]' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${data.useInviteLink ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between py-3 border border-gray-200 rounded-xl px-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">SSO 활성화</div>
                  <div className="text-xs text-gray-500 mt-0.5">SAML/OIDC 기반 싱글 사인온</div>
                </div>
                <button
                  onClick={() => set('enableSso', !data.enableSso)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${data.enableSso ? 'bg-[#534AB7]' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${data.enableSso ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: 초기 설정 (optional) */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">이 단계는 선택 사항입니다. 건너뛰기를 눌러 바로 생성할 수 있습니다.</p>

              {/* Tags */}
              <FieldRow label="태그">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTag()}
                    placeholder="태그 입력 후 Enter"
                    className="h-8 text-sm flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={addTag} className="h-8 px-3 text-xs">추가</Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {data.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md flex items-center gap-1"
                    >
                      {tag}
                      <button onClick={() => set('tags', data.tags.filter(t => t !== tag))} className="text-indigo-400 hover:text-indigo-700"><X size={10} /></button>
                    </span>
                  ))}
                </div>
              </FieldRow>

              {/* Memo */}
              <FieldRow label="메모">
                <textarea
                  value={data.memo}
                  onChange={e => set('memo', e.target.value)}
                  placeholder="내부 메모 (옵션)"
                  rows={3}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none"
                />
              </FieldRow>

              {/* Deploy demo agent */}
              <div className="flex items-center justify-between py-3 border border-gray-200 rounded-xl px-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">샘플 에이전트 배포</div>
                  <div className="text-xs text-gray-500 mt-0.5">기본 데모 에이전트를 이 테넌트에 즉시 배포</div>
                </div>
                <button
                  onClick={() => set('deployDemoAgent', !data.deployDemoAgent)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${data.deployDemoAgent ? 'bg-[#534AB7]' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${data.deployDemoAgent ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" size="sm" onClick={() => { setErrors({}); setStep((step - 1) as Step); }}>이전</Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>취소</Button>
          </div>
          <div className="flex gap-2">
            {step === 4 && (
              <Button variant="outline" size="sm" onClick={() => onCreate(data)}>건너뛰기</Button>
            )}
            <Button
              size="sm"
              className="bg-[#534AB7] hover:bg-[#4339a0] gap-1"
              onClick={handleNext}
            >
              {step === 4 ? '생성 완료' : '다음'}
              {step < 4 && <ChevronRight size={13} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantCreateWizard;
