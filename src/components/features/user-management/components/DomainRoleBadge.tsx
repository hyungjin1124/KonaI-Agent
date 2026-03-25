import React from 'react';
import { Shield } from '../../../icons';
import { Badge } from '../../../ui/badge';
import type { DomainRole } from '../../../../types';
import { ROLE_LABEL_MAP } from '../../permission-settings/data/viewTableData';

interface DomainRoleBadgeProps {
  role: DomainRole | string;
  /** Override label; if omitted, looked up via ROLE_LABEL_MAP */
  label?: string;
}

export const DomainRoleBadge: React.FC<DomainRoleBadgeProps> = ({ role, label }) => {
  const displayLabel = label ?? (ROLE_LABEL_MAP[role as DomainRole] ?? role);
  const isAdmin = role.includes('ADMIN') || role === 'ROLE_EXEC';
  const isMgr = role.includes('MGR');
  const style = isAdmin
    ? 'text-purple-600 bg-purple-50 border-purple-100'
    : isMgr
      ? 'text-blue-600 bg-blue-50 border-blue-100'
      : 'text-gray-600 bg-gray-50 border-gray-100';
  return (
    <Badge variant="outline" className={`font-medium text-xs ${style}`}>
      {isAdmin && <Shield size={10} className="mr-1" aria-hidden="true" />}
      {displayLabel}
    </Badge>
  );
};
