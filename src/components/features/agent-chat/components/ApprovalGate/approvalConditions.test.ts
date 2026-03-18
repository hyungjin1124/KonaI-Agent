import { describe, it, expect } from 'vitest';
import {
  createApprovalCondition,
  createRBACCondition,
  createSessionPermissionStore,
} from './approvalConditions';

describe('createApprovalCondition', () => {
  it('returns true for high-risk action (approval needed)', async () => {
    const condition = createApprovalCondition({
      actionType: 'delete',
      riskLevel: 'high',
    });
    expect(await condition({})).toBe(true);
  });

  it('returns true for medium-risk action (approval needed)', async () => {
    const condition = createApprovalCondition({
      actionType: 'modify',
      riskLevel: 'medium',
    });
    expect(await condition({})).toBe(true);
  });

  it('returns false for low-risk action (auto-approve)', async () => {
    const condition = createApprovalCondition({
      actionType: 'execute',
      riskLevel: 'low',
    });
    expect(await condition({})).toBe(false);
  });

  it('returns false when user role is in autoApproveRoles', async () => {
    const condition = createApprovalCondition(
      {
        actionType: 'delete',
        riskLevel: 'high',
        autoApproveRoles: ['admin', 'operator'],
      },
      { userRole: 'admin' },
    );
    expect(await condition({})).toBe(false);
  });

  it('returns true when user role is NOT in autoApproveRoles', async () => {
    const condition = createApprovalCondition(
      {
        actionType: 'delete',
        riskLevel: 'high',
        autoApproveRoles: ['admin'],
      },
      { userRole: 'viewer' },
    );
    expect(await condition({})).toBe(true);
  });

  it('returns true when autoApproveRoles not specified (always ask)', async () => {
    const condition = createApprovalCondition(
      {
        actionType: 'execute',
        riskLevel: 'medium',
      },
      { userRole: 'admin' },
    );
    expect(await condition({})).toBe(true);
  });

  it('returns false when session permission is set', async () => {
    const store = createSessionPermissionStore();
    store.setAutoApproved('delete', true);

    const condition = createApprovalCondition(
      { actionType: 'delete', riskLevel: 'high' },
      { sessionStore: store },
    );
    expect(await condition({})).toBe(false);
  });

  it('session permission takes precedence over risk level', async () => {
    const store = createSessionPermissionStore();
    store.setAutoApproved('execute', true);

    const condition = createApprovalCondition(
      { actionType: 'execute', riskLevel: 'high' },
      { sessionStore: store },
    );
    // Session permission → auto-approve even for high risk
    expect(await condition({})).toBe(false);
  });
});

describe('createRBACCondition', () => {
  it('wraps createApprovalCondition with userRole', async () => {
    const condition = createRBACCondition('admin', {
      actionType: 'delete',
      riskLevel: 'high',
      autoApproveRoles: ['admin'],
    });
    expect(await condition({})).toBe(false);
  });

  it('supports session store integration', async () => {
    const store = createSessionPermissionStore();
    store.setAutoApproved('execute', true);

    const condition = createRBACCondition(
      'viewer',
      { actionType: 'execute', riskLevel: 'medium' },
      store,
    );
    expect(await condition({})).toBe(false);
  });
});

describe('createSessionPermissionStore', () => {
  it('returns false for unknown action types', () => {
    const store = createSessionPermissionStore();
    expect(store.isAutoApproved('delete')).toBe(false);
  });

  it('returns true after setAutoApproved(actionType, true)', () => {
    const store = createSessionPermissionStore();
    store.setAutoApproved('delete', true);
    expect(store.isAutoApproved('delete')).toBe(true);
  });

  it('returns false after setAutoApproved(actionType, false)', () => {
    const store = createSessionPermissionStore();
    store.setAutoApproved('delete', true);
    store.setAutoApproved('delete', false);
    expect(store.isAutoApproved('delete')).toBe(false);
  });

  it('clears all permissions', () => {
    const store = createSessionPermissionStore();
    store.setAutoApproved('delete', true);
    store.setAutoApproved('execute', true);
    store.clear();
    expect(store.isAutoApproved('delete')).toBe(false);
    expect(store.isAutoApproved('execute')).toBe(false);
  });

  it('isolates action types', () => {
    const store = createSessionPermissionStore();
    store.setAutoApproved('delete', true);
    expect(store.isAutoApproved('delete')).toBe(true);
    expect(store.isAutoApproved('execute')).toBe(false);
  });
});
