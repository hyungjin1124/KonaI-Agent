import React, { useState, useCallback, useMemo } from 'react';
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

export function UserFormModal({ open, user, onSave, onClose }: UserFormModalProps) {
  const isEdit = user !== null;
  const [step, setStep] = useState(1);

  // Step 1 state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [orgNodeId, setOrgNodeId] = useState<string | null>(user?.orgNodeId || null);
  const [positionLevel, setPositionLevel] = useState<PositionLevel | null>(user?.positionLevel || null);

  // Auto-mapped roles (set by matchOrgRoles, displayed read-only in Step 2)
  const [roles, setRoles] = useState<DomainRole[]>(user?.roles || []);

  const matchOrgRoles = useCallback((nodeId: string | null, level: PositionLevel | null) => {
    if (!nodeId || !level) { setRoles([]); return; }
    const orgPath = buildOrgPath(ORG_TREE, nodeId);
    const parts = orgPath.split(' > ');
    // ORG_TREE: root(경영지원) > section(경영기획부문) > unit(경영기획실)
    // Mapping:  division=경영기획부문, subOrg=경영기획실
    const division = parts[1] || parts[0] || '';
    const subOrg = parts.length > 2 ? parts[2] : '';

    const matched = ORG_ROLE_MAPPINGS.filter(m =>
      m.division === division &&
      (subOrg === '' || m.subOrg === subOrg || m.subOrg === '') &&
      m.positionLevel === level,
    );

    const mappedRoles: DomainRole[] = [];
    for (const m of matched) {
      if (m.primaryRole && !mappedRoles.includes(m.primaryRole)) mappedRoles.push(m.primaryRole);
      if (m.additionalRole && !mappedRoles.includes(m.additionalRole)) mappedRoles.push(m.additionalRole);
    }
    setRoles(mappedRoles);
  }, []);

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

  const canProceedStep1 = name.trim() !== '' && email.trim() !== '' && orgNodeId !== null && positionLevel !== null;
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
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500 uppercase">이름</Label>
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
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500 uppercase">이메일</Label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-9"
                    placeholder="example@konai.com"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500 uppercase">소속 조직</Label>
                <OrgTreeSelector
                  tree={ORG_TREE}
                  selected={orgNodeId}
                  onSelect={handleOrgSelect}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500 uppercase">직급</Label>
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
                        조직-직급 매핑 기반으로 {roles.length}개 역할이 자동 할당되었습니다.
                      </span>
                    </div>
                    <p className="text-xs text-green-700 mt-1.5 ml-6">
                      {orgPathLabel} · {positionLevel}
                    </p>
                  </div>

                  {/* Read-only role display grouped by domain */}
                  <div className="space-y-2">
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
                        권한 설정 &gt; 조직-역할 매핑에서 매핑을 추가해 주세요.
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
                className="bg-[#FF3C42] hover:bg-[#E02B31] text-white shadow-sm"
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
