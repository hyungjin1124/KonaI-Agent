import React, { useState, useCallback, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ApprovalToast } from './ApprovalToast';
import { ApprovalInlineCard } from './ApprovalInlineCard';
import { ApprovalModal } from './ApprovalModal';
import { ApprovalItemRow } from './ApprovalItemRow';
import type {
  ApprovalGateProps,
  ApprovalGateResult,
  ApprovalItem,
  ElicitationSchema,
} from './types';

// ─── Schema Form (MCP Elicitation AC3) ─────────────────────────
function SchemaForm({
  schema,
  values,
  onChange,
}: {
  schema: ElicitationSchema;
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-3">
      {Object.entries(schema.properties).map(([key, prop]) => {
        const isRequired = schema.required?.includes(key);
        const label = prop.title || key;

        if (prop.type === 'boolean') {
          return (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                id={`schema-${key}`}
                checked={!!values[key]}
                onCheckedChange={(v) => onChange(key, v)}
              />
              <Label htmlFor={`schema-${key}`} className="text-xs text-gray-700">
                {label}
                {isRequired && <span className="text-[#FF3C42]"> *</span>}
              </Label>
            </div>
          );
        }

        if (prop.enum && prop.enum.length > 0) {
          return (
            <div key={key}>
              <Label htmlFor={`schema-${key}`} className="mb-1 block text-xs text-gray-700">
                {label}
                {isRequired && <span className="text-[#FF3C42]"> *</span>}
              </Label>
              <select
                id={`schema-${key}`}
                value={String(values[key] ?? '')}
                onChange={(e) => onChange(key, prop.type === 'number' ? Number(e.target.value) : e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-[#FF3C42] focus:outline-none focus:ring-1 focus:ring-[#FF3C42]/30"
              >
                <option value="">선택...</option>
                {prop.enum.map((v) => (
                  <option key={String(v)} value={String(v)}>
                    {String(v)}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        return (
          <div key={key}>
            <Label htmlFor={`schema-${key}`} className="mb-1 block text-xs text-gray-700">
              {label}
              {isRequired && <span className="text-[#FF3C42]"> *</span>}
            </Label>
            <Input
              id={`schema-${key}`}
              type={prop.type === 'number' ? 'number' : 'text'}
              value={String(values[key] ?? prop.default ?? '')}
              onChange={(e) =>
                onChange(key, prop.type === 'number' ? Number(e.target.value) : e.target.value)
              }
              placeholder={prop.description}
              className="h-8 text-sm"
            />
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export const ApprovalGate: React.FC<ApprovalGateProps> = ({
  actionType,
  riskLevel,
  title,
  description,
  onApprove,
  onReject,
  onModify,
  onClose,
  items: initialItems,
  schema,
  showSessionPermission = false,
  onSessionPermissionChange,
  toolCallId,
  approveLabel = '승인',
  rejectLabel = '거절',
  modifyLabel,
}) => {
  // Item statuses (multi-item mode)
  const [itemStatuses, setItemStatuses] = useState<Map<string, 'pending' | 'approved' | 'rejected'>>(
    () => {
      const map = new Map<string, 'pending' | 'approved' | 'rejected'>();
      initialItems?.forEach((item) => map.set(item.id, item.status));
      return map;
    }
  );

  // Schema form data (MCP Elicitation)
  const [schemaFormData, setSchemaFormData] = useState<Record<string, unknown>>(() => {
    if (!schema) return {};
    const defaults: Record<string, unknown> = {};
    Object.entries(schema.properties).forEach(([key, prop]) => {
      if (prop.default !== undefined) defaults[key] = prop.default;
    });
    return defaults;
  });

  // Session permission
  const [sessionPermission, setSessionPermission] = useState(false);

  // Derived items with current statuses
  const items: ApprovalItem[] | undefined = useMemo(() => {
    if (!initialItems) return undefined;
    return initialItems.map((item) => ({
      ...item,
      status: itemStatuses.get(item.id) ?? item.status,
    }));
  }, [initialItems, itemStatuses]);

  // Item-level actions
  const handleItemApprove = useCallback((id: string) => {
    setItemStatuses((prev) => new Map(prev).set(id, 'approved'));
  }, []);

  const handleItemReject = useCallback((id: string) => {
    setItemStatuses((prev) => new Map(prev).set(id, 'rejected'));
  }, []);

  // Schema field change
  const handleSchemaChange = useCallback((key: string, value: unknown) => {
    setSchemaFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Session permission toggle
  const handleSessionPermissionChange = useCallback(
    (checked: boolean) => {
      setSessionPermission(checked);
      onSessionPermissionChange?.(actionType, checked);
    },
    [actionType, onSessionPermissionChange]
  );

  // Build result
  const buildResult = useCallback(
    (decision: 'approved' | 'rejected' | 'modify'): ApprovalGateResult => {
      const result: ApprovalGateResult = { decision };

      if (toolCallId) {
        result.toolCallId = toolCallId;
      }

      if (items) {
        result.approvedItemIds = items
          .filter((i) => (itemStatuses.get(i.id) ?? 'pending') === 'approved')
          .map((i) => i.id);
        result.rejectedItemIds = items
          .filter((i) => (itemStatuses.get(i.id) ?? 'pending') === 'rejected')
          .map((i) => i.id);
      }

      if (schema && Object.keys(schemaFormData).length > 0) {
        result.schemaData = schemaFormData;
      }

      return result;
    },
    [items, itemStatuses, schema, schemaFormData]
  );

  // Decision handlers
  const handleApprove = useCallback(() => {
    const result = buildResult('approved');

    // In multi-item mode: approve all remaining pending items
    if (items) {
      const approvedSet = new Set(result.approvedItemIds ?? []);
      items.forEach((item) => {
        if ((itemStatuses.get(item.id) ?? 'pending') === 'pending') {
          approvedSet.add(item.id);
        }
      });
      result.approvedItemIds = [...approvedSet];

      setItemStatuses((prev) => {
        const next = new Map(prev);
        items.forEach((item) => {
          if (next.get(item.id) === 'pending') next.set(item.id, 'approved');
        });
        return next;
      });
    }

    onApprove(result);
  }, [items, itemStatuses, onApprove, buildResult]);

  const handleReject = useCallback(() => {
    onReject(buildResult('rejected'));
  }, [onReject, buildResult]);

  const handleModify = useCallback(() => {
    onModify?.(buildResult('modify'));
  }, [onModify, buildResult]);

  // ─── Content: Items List ──────────────────────────────────────
  const itemsContent = items ? (
    <div className="max-h-60 space-y-1.5 overflow-y-auto" role="list" aria-label="승인 항목 목록">
      {items.map((item) => (
        <ApprovalItemRow
          key={item.id}
          item={item}
          onApprove={handleItemApprove}
          onReject={handleItemReject}
        />
      ))}
      {/* Summary */}
      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
        <span>
          승인: {items.filter((i) => (itemStatuses.get(i.id) ?? 'pending') === 'approved').length}
        </span>
        <span>
          거절: {items.filter((i) => (itemStatuses.get(i.id) ?? 'pending') === 'rejected').length}
        </span>
        <span>
          대기: {items.filter((i) => (itemStatuses.get(i.id) ?? 'pending') === 'pending').length}
        </span>
      </div>
    </div>
  ) : null;

  // ─── Content: Schema Form ─────────────────────────────────────
  const schemaContent = schema ? (
    <SchemaForm schema={schema} values={schemaFormData} onChange={handleSchemaChange} />
  ) : null;

  // ─── Session Permission Checkbox ──────────────────────────────
  const sessionPermissionEl = showSessionPermission ? (
    <div className="flex items-center gap-2">
      <Checkbox
        id="session-permission"
        checked={sessionPermission}
        onCheckedChange={(checked) => handleSessionPermissionChange(!!checked)}
      />
      <Label htmlFor="session-permission" className="text-xs text-gray-500">
        이 세션에서 동일 작업 자동 승인
      </Label>
    </div>
  ) : null;

  // ─── Combined children ────────────────────────────────────────
  const children = (
    <>
      {itemsContent}
      {schemaContent}
    </>
  );

  // ─── Shared tier props ────────────────────────────────────────
  const tierProps = {
    title,
    description,
    onApprove: handleApprove,
    onReject: handleReject,
    onModify: onModify ? handleModify : undefined,
    onClose,
    approveLabel,
    rejectLabel,
    modifyLabel,
    sessionPermissionCheckbox: sessionPermissionEl,
    children: (itemsContent || schemaContent) ? children : undefined,
  };

  // ─── Render by risk level ─────────────────────────────────────
  switch (riskLevel) {
    case 'low':
      return <ApprovalToast {...tierProps} />;
    case 'medium':
      return <ApprovalInlineCard {...tierProps} />;
    case 'high':
      return <ApprovalModal {...tierProps} />;
    default:
      return <ApprovalInlineCard {...tierProps} />;
  }
};
