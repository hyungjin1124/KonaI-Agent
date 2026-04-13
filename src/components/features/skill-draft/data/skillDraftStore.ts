// ============================================================================
// skillDraftStore — 채팅에서 저장된 스킬을 라이브러리 뷰로 전달하는 싱글턴
// ============================================================================
//
// SkillsPageView 와 GeneralChatView 는 서로 다른 라우트에 있어 React state 로
// 직접 공유할 수 없다. 모듈 레벨 싱글턴으로 단순 pub/sub 채널을 만들고,
// SkillsPageView 가 mount 시 store.getAll() 로 추가본을 mock 데이터에 합쳐
// 보여주는 방식으로 처리한다.
//
// 영구 저장은 하지 않는다 — 새로고침 시 사라지는 것이 mock 의 의도이다.
// ============================================================================

import type { TeamSkill } from '@/types/skill-management.types';

type Listener = () => void;

const items: TeamSkill[] = [];
const listeners = new Set<Listener>();

const newId = () =>
  `chat-skill-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

function notify() {
  listeners.forEach((cb) => cb());
}

export const skillDraftStore = {
  /** 새 스킬 추가 — id 가 없으면 자동 부여 */
  add(skill: Omit<TeamSkill, 'id'> | TeamSkill): TeamSkill {
    const withId: TeamSkill =
      'id' in skill && skill.id
        ? (skill as TeamSkill)
        : { ...(skill as Omit<TeamSkill, 'id'>), id: newId() };
    items.push(withId);
    notify();
    return withId;
  },

  /** 현재 저장된 모든 채팅 출처 스킬 (mock 데이터와 별개) */
  getAll(): TeamSkill[] {
    return [...items];
  },

  /** 변경 구독 — SkillsPageView mount 시 사용 */
  subscribe(cb: Listener): () => void {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },

  /** 테스트/디버그용 초기화 */
  clear(): void {
    items.length = 0;
    notify();
  },
};
