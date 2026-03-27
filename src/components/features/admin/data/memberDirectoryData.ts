import type { DirectoryTeam } from '../types/admin.types';
import { ADMIN_USERS } from './userMockData';

// ORG_TREE를 단순화한 팀-멤버 플랫 구조
// 멤버 디렉토리 모달에서 사용

function buildDirectoryTeams(): DirectoryTeam[] {
  const addedIds = new Set(ADMIN_USERS.map((u) => u.id));
  const teamMap = new Map<string, DirectoryTeam>();

  // 기존 등록 사용자를 팀별로 그룹핑
  for (const user of ADMIN_USERS) {
    if (!teamMap.has(user.team)) {
      teamMap.set(user.team, {
        id: `team-${user.team}`,
        name: user.team,
        members: [],
      });
    }
    teamMap.get(user.team)!.members.push({
      id: user.id,
      name: user.name,
      email: user.email,
      team: user.team,
      alreadyAdded: true,
    });
  }

  // 미등록 사용자 (멤버 디렉토리에는 있지만 아직 추가되지 않은)
  const unregistered = [
    { id: 'u32', name: '송마케팅', email: 'mkt.song@konai.com', team: '마케팅그룹' },
    { id: 'u33', name: '유데이터', email: 'data.yoo@konai.com', team: '데이터마이닝팀' },
    { id: 'u34', name: '변사업', email: 'biz.byun@konai.com', team: '데이터사업팀' },
    { id: 'u35', name: '탁IoT', email: 'iot.tak@konai.com', team: 'IoT개발그룹' },
    { id: 'u36', name: '임서버', email: 'server.lim@konai.com', team: '서버/웹/앱 그룹' },
    { id: 'u37', name: '차결제', email: 'pay.cha@konai.com', team: '결제플랫폼팀' },
    { id: 'u38', name: '고서비스', email: 'svc.go@konai.com', team: '서비스팀' },
    { id: 'u39', name: '최CS', email: 'cs.choi@konai.com', team: '고객만족서비스' },
    { id: 'u40', name: '원법무', email: 'legal.won@konai.com', team: '법무팀' },
    { id: 'u41', name: '허MVNO', email: 'mvno.heo@konai.com', team: 'MVNO사업팀' },
    { id: 'u42', name: '맹인프라', email: 'infra.maeng@konai.com', team: '인프라Processing팀' },
    { id: 'u43', name: '진Biz2', email: 'biz2.jin@konai.com', team: 'Biz2그룹' },
    { id: 'u44', name: '피Biz3', email: 'biz3.pi@konai.com', team: 'Biz3그룹' },
    { id: 'u45', name: '지역화폐', email: 'lc.kim@konai.com', team: '지역화폐사업실' },
  ];

  for (const person of unregistered) {
    if (!teamMap.has(person.team)) {
      teamMap.set(person.team, {
        id: `team-${person.team}`,
        name: person.team,
        members: [],
      });
    }
    teamMap.get(person.team)!.members.push({
      id: person.id,
      name: person.name,
      email: person.email,
      team: person.team,
      alreadyAdded: addedIds.has(person.id),
    });
  }

  return Array.from(teamMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'ko'),
  );
}

export const DIRECTORY_TEAMS: DirectoryTeam[] = buildDirectoryTeams();
