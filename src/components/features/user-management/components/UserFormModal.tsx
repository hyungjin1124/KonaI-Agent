import React, { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Users, Mail, ChevronRight, Check, Shield, AlertTriangle } from '../../../icons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Badge } from '../../../ui/badge';
import { OrgTreeSelector } from './OrgTreeSelector';
import type {
  EnhancedUser,
  DomainRole,
  DataScopeType,
  PositionLevel,
} from '../../../../types';
import {
  buildOrgPath,
  findOrgNode,
  DOMAIN_ROLE_DEFINITIONS,
  ORG_TREE,
} from '../data/userManagementData';
import { ORG_ROLE_MAPPINGS } from '../../permission-settings/data/orgRoleMappingData';

interface UserFormModalProps {
  open: boolean;
  user: EnhancedUser | null;
  existingEmails?: string[];
  onSave: (user: EnhancedUser) => void;
  onClose: () => void;
}

const STEPS = [
  { num: 1, label: '기본 정보' },
  { num: 2, label: '역할 확인' },
] as const;

const POSITION_LEVELS: { level: PositionLevel; desc: string }[] = [
  { level: '실무자', desc: '팀원 ~ 과장' },
  { level: '관리자', desc: '팀장 / 그룹장 / 실장' },
  { level: '임원', desc: '부문장 이상' },
];

const SCOPE_LABELS: Record<string, string> = {
  All: '전체',
  Div: '사업부',
  Dept: '부서',
  Pjt: '프로젝트',
  Plant: '공장',
  PlantLine: '공장+라인',
  WH: '창고',
  Self: '본인',
  Division: '사업부',
  Department: '부서',
  Project: '프로젝트',
  'Plant+Line': '공장+라인',
  Warehouse: '창고',
};

/** Group roles by domain for read-only display */
const DOMAIN_GROUPS: { label: string; roles: DomainRole[] }[] = [
  { label: '경영', roles: ['ROLE_EXEC', 'ROLE_DEPT_MGR'] },
  { label: '재무', roles: ['ROLE_FIN_ADMIN', 'ROLE_FIN_USER'] },
  { label: 'HR', roles: ['ROLE_HR_ADMIN', 'ROLE_HR_USER'] },
  { label: '영업', roles: ['ROLE_SALES_MGR', 'ROLE_SALES_USER'] },
  { label: '프로젝트', roles: ['ROLE_PJT_MGR'] },
  { label: '생산', roles: ['ROLE_PROD_MGR', 'ROLE_PROD_USER'] },
  { label: 'SCM', roles: ['ROLE_PURCH_USER', 'ROLE_LOG_USER'] },
  { label: '시스템', roles: ['ROLE_SYS_ADMIN'] },
];

export function UserFormModal({ open, user, existingEmails = [], onSave, onClose }: UserFormModalProps) {
  const isEdit = user !== null;
  const [step, setStep] = useState(1);

  // Step 1 state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [orgNodeId, setOrgNodeId] = useState<string | null>(user?.orgNodeId || null);
  const [positionLevel, setPositionLevel] = useState<PositionLevel | null>(user?.positionLevel || null);

  // Auto-mapped roles (set by matchOrgRoles, displayed read-only in Step 2)
  const [roles, setRoles] = useState<DomainRole[]>(user?.roles || []);

  // --- Edit-mode diff highlight ---
  // Snapshot original values when the modal opens for editing
  const originalValues = useMemo(() => {
    if (!user) return null;
    return {
      name: user.name || '',
      email: user.email || '',
      orgNodeId: user.orgNodeId || null,
      positionLevel: user.positionLevel || null,
      roles: [...(user.roles || [])],
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  const isFieldChanged = useCallback((field: 'name' | 'email' | 'orgNodeId' | 'positionLevel' | 'roles') => {
    if (!originalValues) return false;
    if (field === 'roles') {
      const orig = originalValues.roles;
      return roles.length !== orig.length || roles.some(r => !orig.includes(r));
    }
    const currentValues = { name, email, orgNodeId, positionLevel };
    return currentValues[field] !== originalValues[field];
  }, [originalValues, name, email, orgNodeId, positionLevel, roles]);

  const diffRingClass = 'ring-1 ring-amber-300 bg-amber-50/30';
  const DiffBadge = () => (
    <span className="ml-1.5 text-[10px] font-medium text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">변경됨</span>
  );
  const [matchedMappings, setMatchedMappings] = useState<typeof ORG_ROLE_MAPPINGS>([]);
  const [manualOverride, setManualOverride] = useState(false);

  const matchOrgRoles = useCallback((nodeId: string | null, level: PositionLevel | null) => {
    if (!nodeId || !level) { setRoles([]); setMatchedMappings([]); return; }
    const orgPath = buildOrgPath(ORG_TREE, nodeId);
    const parts = orgPath.split(' > ');
    const division = parts[1] || parts[0] || '';
    const subOrg = parts.length > 2 ? parts[2] : '';

    const matched = ORG_ROLE_MAPPINGS.filter(m =>
      m.division === division &&
      (subOrg === '' || m.subOrg === subOrg || m.subOrg === '') &&
      m.positionLevel === level,
    );

    setMatchedMappings(matched);

    if (!manualOverride) {
      const mappedRoles: DomainRole[] = [];
      for (const m of matched) {
        if (m.primaryRole && !mappedRoles.includes(m.primaryRole)) mappedRoles.push(m.primaryRole);
        if (m.additionalRole && !mappedRoles.includes(m.additionalRole)) mappedRoles.push(m.additionalRole);
      }
      setRoles(mappedRoles);
    }
  }, [manualOverride]);

  const handleOrgSelect = useCallback((id: string) => {
    setOrgNodeId(id);
    matchOrgRoles(id, positionLevel);
  }, [positionLevel, matchOrgRoles]);

  const handlePositionSelect = useCallback((level: PositionLevel) => {
    setPositionLevel(level);
    matchOrgRoles(orgNodeId, level);
  }, [orgNodeId, matchOrgRoles]);

  React.useEffect(() => {
    if (open) {
      setStep(1);
      setName(user?.name || '');
      setEmail(user?.email || '');
      setOrgNodeId(user?.orgNodeId || null);
      setPositionLevel(user?.positionLevel || null);
      setRoles(user?.roles || []);
      setMatchedMappings([]);
      setManualOverride(false);
    }
  }, [open, user]);

  const handleSave = useCallback(() => {
    const orgPath = orgNodeId ? buildOrgPath(ORG_TREE, orgNodeId) : '';
    const orgNode = orgNodeId ? findOrgNode(ORG_TREE, orgNodeId) : null;
    const pathParts = orgPath.split(' > ');

    const newUser: EnhancedUser = {
      id: user?.id || `u${Date.now()}`,
      name,
      email,
      department: orgNode?.name || pathParts[pathParts.length - 1] || '',
      division: pathParts[0] || '',
      position: positionLevel || '',
      positionLevel: positionLevel || undefined,
      orgNodeId: orgNodeId || undefined,
      orgPath: orgPath || undefined,
      roles,
      status: user?.status || 'Pending',
      lastLogin: user?.lastLogin || '-',
      avatarColor: user?.avatarColor || `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
    };
    onSave(newUser);
    onClose();
  }, [user, name, email, orgNodeId, positionLevel, roles, onSave, onClose]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isEmailDuplicate = useMemo(() => {
    if (!email.trim()) return false;
    const normalizedEmail = email.toLowerCase().trim();
    // When editing, exclude the current user's own email
    const editingEmail = user?.email?.toLowerCase().trim();
    return existingEmails.some(e => e.toLowerCase().trim() === normalizedEmail && e.toLowerCase().trim() !== editingEmail);
  }, [email, existingEmails, user?.email]);
  const canProceedStep1 = name.trim() !== '' && email.trim() !== '' && isEmailValid && !isEmailDuplicate && orgNodeId !== null && positionLevel !== null;
  const canSave = roles.length > 0;

  const effectiveScope = useMemo((): DataScopeType => {
    if (roles.includes('ROLE_EXEC') || roles.includes('ROLE_SYS_ADMIN') || roles.includes('ROLE_FIN_ADMIN') || roles.includes('ROLE_HR_ADMIN')) return 'All';
    if (roles.includes('ROLE_SALES_MGR') || roles.includes('ROLE_PROD_MGR')) return 'Div';
    if (roles.includes('ROLE_PJT_MGR')) return 'Pjt';
    if (roles.includes('ROLE_PROD_USER')) return 'PlantLine';
    if (roles.includes('ROLE_LOG_USER')) return 'WH';
    if (roles.length > 0) return 'Dept';
    return 'Self';
  }, [roles]);

  // Org path for display
  const orgPathLabel = useMemo(() => {
    if (!orgNodeId) return '';
    return buildOrgPath(ORG_TREE, orgNodeId);
  }, [orgNodeId]);

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {isEdit ? '사용자 정보 수정' : '새 사용자 등록'}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-1 pb-4 border-b border-gray-100">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.num}>
              {i > 0 && (
                <ChevronRight size={14} className="text-gray-300" />
              )}
              <button
                type="button"
                onClick={() => {
                  if (s.num <= step || (s.num === 2 && canProceedStep1)) {
                    setStep(s.num);
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                  ${step === s.num
                    ? 'bg-gray-900 text-white shadow-md shadow-gray-900/20'
                    : step > s.num
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-400'
                  }
                `}
              >
                {step > s.num ? (
                  <Check size={12} />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px] font-bold">
                    {s.num}
                  </span>
                )}
                {s.label}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto py-4 px-1">
          {step === 1 && (
            <div className="space-y-4">
              <div className={`space-y-1 rounded-lg p-2 -mx-2 transition-all ${isEdit && isFieldChanged('name') ? diffRingClass : ''}`}>
                <Label className="text-xs font-bold text-gray-500 uppercase">
                  이름 <span className="text-red-500">*</span>
                  {isEdit && isFieldChanged('name') && <DiffBadge />}
                </Label>
                <div className="relative">
                  <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                  <Input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="pl-9"
                    placeholder="홍길동"
                  />
                </div>
              </div>
              <div className={`space-y-1 rounded-lg p-2 -mx-2 transition-all ${isEdit && isFieldChanged('email') ? diffRingClass : ''}`}>
                <Label className="text-xs font-bold text-gray-500 uppercase">
                  이메일 <span className="text-red-500">*</span>
                  {isEdit && isFieldChanged('email') && <DiffBadge />}
                </Label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`pl-9 ${(email && !isEmailValid) || isEmailDuplicate ? 'border-red-300 focus-visible:ring-red-300' : ''}`}
                    placeholder="example@konai.com"
                  />
                </div>
                {email && !isEmailValid && (
                  <p className="text-[11px] text-red-500 mt-0.5 pl-1">올바른 이메일 형식을 입력해주세요.</p>
                )}
                {isEmailDuplicate && (
                  <p className="text-[11px] text-red-500 mt-0.5 pl-1">이미 등록된 이메일입니다.</p>
                )}
              </div>
              <div className={`space-y-1 rounded-lg p-2 -mx-2 transition-all ${isEdit && isFieldChanged('orgNodeId') ? diffRingClass : ''}`}>
                <Label className="text-xs font-bold text-gray-500 uppercase">
                  소속 조직 <span className="text-red-500">*</span>
                  {isEdit && isFieldChanged('orgNodeId') && <DiffBadge />}
                </Label>
                <OrgTreeSelector
                  tree={ORG_TREE}
                  selected={orgNodeId}
                  onSelect={handleOrgSelect}
                />
              </div>
              <div className={`space-y-1 rounded-lg p-2 -mx-2 transition-all ${isEdit && isFieldChanged('positionLevel') ? diffRingClass : ''}`}>
                <Label className="text-xs font-bold text-gray-500 uppercase">
                  직급 <span className="text-red-500">*</span>
                  {isEdit && isFieldChanged('positionLevel') && <DiffBadge />}
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {POSITION_LEVELS.map(({ level, desc }) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handlePositionSelect(level)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        positionLevel === level
                          ? 'border-gray-900 bg-gray-50 shadow-sm'
                          : 'border-gray-100 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className={`text-sm font-bold ${positionLevel === level ? 'text-gray-900' : 'text-gray-700'}`}>
                        {level}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {roles.length > 0 ? (
                <>
                  {/* Success banner */}
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm">
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-green-600" />
                      <span className="text-green-800 font-medium">
                        {manualOverride ? '수동 오버라이드 모드' : `조직-직급 매핑 기반으로 ${roles.length}개 역할이 자동 할당되었습니다.`}
                      </span>
                    </div>
                    <p className="text-xs text-green-700 mt-1.5 ml-6">
                      {orgPathLabel} · {positionLevel}
                    </p>
                  </div>

                  {/* Mapping rationale */}
                  {matchedMappings.length > 0 && !manualOverride && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1.5">매핑 근거</div>
                      <div className="space-y-1">
                        {matchedMappings.map(m => (
                          <div key={m.id} className="text-xs text-blue-800 flex items-baseline gap-1.5">
                            <span className="text-blue-400">•</span>
                            <span>
                              {m.division} {'>'} {m.subOrg || '(전체)'} · {m.positionTitle} → {m.primaryRole.replace('ROLE_', '')}
                              {m.additionalRole && `, ${m.additionalRole.replace('ROLE_', '')}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manual override toggle */}
                  <div className="flex items-center justify-between py-2 px-3 border border-gray-200 rounded-xl">
                    <div>
                      <div className="text-xs font-medium text-gray-700">수동 오버라이드</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">자동 매핑을 무시하고 역할을 직접 선택</div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={manualOverride}
                      onClick={() => {
                        const next = !manualOverride;
                        setManualOverride(next);
                        if (!next) matchOrgRoles(orgNodeId, positionLevel);
                      }}
                      className={`relative w-9 h-5 rounded-full transition-colors ${manualOverride ? 'bg-[#534AB7]' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${manualOverride ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  {/* Read-only role display grouped by domain */}
                  <div className={`space-y-2 rounded-lg p-2 -mx-2 transition-all ${isEdit && isFieldChanged('roles') ? diffRingClass : ''}`}>
                    {isEdit && isFieldChanged('roles') && (
                      <div className="flex items-center mb-1">
                        <span className="text-[10px] font-medium text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">역할 변경됨</span>
                      </div>
                    )}
                    {DOMAIN_GROUPS
                      .filter(g => g.roles.some(r => roles.includes(r)))
                      .map(group => (
                        <div key={group.label} className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase w-14 shrink-0">{group.label}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {group.roles
                              .filter(r => roles.includes(r))
                              .map(role => {
                                const def = DOMAIN_ROLE_DEFINITIONS.find(d => d.code === role);
                                const isAdmin = role.includes('ADMIN') || role === 'ROLE_EXEC';
                                return (
                                  <Badge
                                    key={role}
                                    variant="outline"
                                    className={`text-xs font-medium ${
                                      isAdmin
                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}
                                  >
                                    {isAdmin && <Shield size={10} className="mr-1" />}
                                    {def?.displayName ?? role.replace('ROLE_', '')}
                                  </Badge>
                                );
                              })}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Manual override: role selection */}
                  {manualOverride && (
                    <div className="p-3 border border-dashed border-gray-300 rounded-xl">
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">역할 선택</div>
                      <div className="flex flex-wrap gap-1.5">
                        {DOMAIN_GROUPS.flatMap(g => g.roles).map(role => {
                          const def = DOMAIN_ROLE_DEFINITIONS.find(d => d.code === role);
                          const selected = roles.includes(role);
                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => {
                                setRoles(prev =>
                                  prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
                                );
                              }}
                              className={`text-[11px] px-2 py-1 rounded-lg border transition-colors ${
                                selected
                                  ? 'bg-[#534AB7] text-white border-[#534AB7]'
                                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {def?.displayName ?? role.replace('ROLE_', '')}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Effective scope */}
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">유효 데이터 범위</div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-sm font-bold bg-white shadow-sm">
                        {effectiveScope}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {SCOPE_LABELS[effectiveScope] || effectiveScope}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                /* No mapping found */
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        이 조직+직급 조합에 대한 역할 매핑이 없습니다.
                      </p>
                      <p className="text-xs text-amber-700 mt-1.5">
                        권한 설정 &gt; 조직-역할 매핑에서 매핑을 추가해 주세요.{' '}
                        <Link
                          href="/admin?tab=permissions"
                          className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
                          onClick={() => onClose()}
                        >
                          권한 설정으로 이동 →
                        </Link>
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        {orgPathLabel} · {positionLevel}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                이전
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            {step < 2 ? (
              <Button
                type="button"
                disabled={!canProceedStep1}
                onClick={() => setStep(step + 1)}
                className="bg-[#1A1A1A] hover:bg-black text-white"
              >
                다음
              </Button>
            ) : (
              <Button
                type="button"
                disabled={!canSave}
                onClick={handleSave}
                className="bg-[#1A1A1A] hover:bg-black text-white shadow-sm"
              >
                {isEdit ? '수정하기' : '등록하기'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
