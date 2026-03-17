import React from 'react';
import { AlertTriangle } from '../../../icons';
import type { DomainRole, DomainRoleDefinition, RoleDomain } from '../../../../types';
import { ROLE_DOMAIN_LABELS } from '../data/userManagementData';

interface RoleChipSelectorProps {
  allRoles: DomainRoleDefinition[];
  selected: DomainRole[];
  onChange: (roles: DomainRole[]) => void;
}

const CHIP_COLORS: Record<string, { bg: string; text: string; border: string; selectedBg: string; ring: string }> = {
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  selectedBg: 'bg-purple-100',  ring: 'ring-purple-300'  },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  selectedBg: 'bg-violet-100',  ring: 'ring-violet-300'  },
  gray:    { bg: 'bg-gray-50',    text: 'text-gray-600',    border: 'border-gray-200',    selectedBg: 'bg-gray-100',    ring: 'ring-gray-300'    },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', selectedBg: 'bg-emerald-100', ring: 'ring-emerald-300' },
  teal:    { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200',    selectedBg: 'bg-teal-100',    ring: 'ring-teal-300'    },
  pink:    { bg: 'bg-pink-50',    text: 'text-pink-700',    border: 'border-pink-200',    selectedBg: 'bg-pink-100',    ring: 'ring-pink-300'    },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    selectedBg: 'bg-rose-100',    ring: 'ring-rose-300'    },
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    selectedBg: 'bg-blue-100',    ring: 'ring-blue-300'    },
  sky:     { bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200',     selectedBg: 'bg-sky-100',     ring: 'ring-sky-300'     },
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200',  selectedBg: 'bg-indigo-100',  ring: 'ring-indigo-300'  },
  orange:  { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  selectedBg: 'bg-orange-100',  ring: 'ring-orange-300'  },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   selectedBg: 'bg-amber-100',   ring: 'ring-amber-300'   },
  lime:    { bg: 'bg-lime-50',    text: 'text-lime-700',    border: 'border-lime-200',    selectedBg: 'bg-lime-100',    ring: 'ring-lime-300'    },
  green:   { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200',   selectedBg: 'bg-green-100',   ring: 'ring-green-300'   },
  red:     { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     selectedBg: 'bg-red-100',     ring: 'ring-red-300'     },
};

function getChipColor(color: string) {
  return CHIP_COLORS[color] || CHIP_COLORS.gray;
}

export function RoleChipSelector({ allRoles, selected, onChange }: RoleChipSelectorProps) {
  const grouped = allRoles.reduce<Record<RoleDomain, DomainRoleDefinition[]>>((acc, role) => {
    if (!acc[role.domain]) acc[role.domain] = [];
    acc[role.domain].push(role);
    return acc;
  }, {} as Record<RoleDomain, DomainRoleDefinition[]>);

  const toggleRole = (code: DomainRole) => {
    if (selected.includes(code)) {
      onChange(selected.filter(r => r !== code));
    } else {
      onChange([...selected, code]);
    }
  };

  const hasHrConflict =
    selected.includes('ROLE_HR_ADMIN') &&
    selected.some(r => r !== 'ROLE_HR_ADMIN' && r !== 'ROLE_HR_USER');

  const domainOrder: RoleDomain[] = ['exec', 'fin', 'hr', 'sales', 'pjt', 'prod', 'scm', 'sys'];

  return (
    <div className="space-y-4">
      {domainOrder.map(domain => {
        const roles = grouped[domain];
        if (!roles || roles.length === 0) return null;
        return (
          <div key={domain}>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              {ROLE_DOMAIN_LABELS[domain] || domain}
            </div>
            <div className="flex flex-wrap gap-2">
              {roles.map(role => {
                const isSelected = selected.includes(role.code);
                const colors = getChipColor(role.color);
                return (
                  <button
                    key={role.code}
                    type="button"
                    onClick={() => toggleRole(role.code)}
                    title={role.description}
                    className={`
                      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                      border transition-all cursor-pointer
                      ${isSelected
                        ? `${colors.selectedBg} ${colors.text} ${colors.border} ring-2 ring-offset-1 ${colors.ring} shadow-sm`
                        : `bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:shadow-sm`
                      }
                    `}
                  >
                    <span
                      className={`w-2 h-2 rounded-full transition-colors ${isSelected ? colors.text.replace('text-', 'bg-') : 'bg-gray-300'}`}
                    />
                    {role.displayName}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {hasHrConflict && (
        <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-500" />
          <div>
            <div className="font-bold text-amber-900">HR 감사 강화 규칙 적용</div>
            <div className="text-xs text-amber-600 mt-0.5 leading-relaxed">
              ROLE_HR_ADMIN과 비인사 역할이 동시 할당되면 급여 데이터 노출 방지를 위해 감사 로그가 강화됩니다.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
