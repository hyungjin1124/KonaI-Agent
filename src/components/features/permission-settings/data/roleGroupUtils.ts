import {
  DOMAIN_ROLE_DEFINITIONS,
  ROLE_DOMAIN_LABELS,
} from '../../user-management/data/userManagementData';

const DOMAIN_ORDER = ['exec', 'fin', 'hr', 'sales', 'pjt', 'prod', 'scm', 'sys'] as const;

export interface GroupedRole {
  domain: string;
  label: string;
  roles: { code: string; displayName: string }[];
}

export const GROUPED_ROLES: GroupedRole[] = DOMAIN_ORDER.reduce<GroupedRole[]>((acc, domain) => {
  const roles = DOMAIN_ROLE_DEFINITIONS.filter(r => r.domain === domain);
  if (roles.length > 0) {
    acc.push({
      domain,
      label: ROLE_DOMAIN_LABELS[domain] ?? domain,
      roles: roles.map(r => ({ code: r.code, displayName: r.displayName })),
    });
  }
  return acc;
}, []);
