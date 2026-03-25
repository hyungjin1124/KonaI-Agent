import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SkillApprovalRequest, ApprovalStatus, SKILL_CATEGORIES } from '@/types/skill-management.types';

interface SkillApprovalQueueProps {
  requests: SkillApprovalRequest[];
  onApprove: (id: string, note: string) => void;
  onReject: (id: string, note: string) => void;
}

const STATUS_CONFIG: Record<ApprovalStatus, { label: string; icon: React.ReactNode; colorClass: string }> = {
  pending: {
    label: '검토 대기',
    icon: <Clock size={13} className="text-amber-500" />,
    colorClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  approved: {
    label: '승인됨',
    icon: <CheckCircle size={13} className="text-green-600" />,
    colorClass: 'bg-green-50 text-green-700 border-green-200',
  },
  rejected: {
    label: '반려됨',
    icon: <XCircle size={13} className="text-red-500" />,
    colorClass: 'bg-red-50 text-red-700 border-red-200',
  },
};

// FI-5: SKILL_CATEGORIES에서 카테고리 라벨 추출 (중복 정의 제거)
const getCategoryLabel = (category: string): string => {
  const found = SKILL_CATEGORIES.find((c) => c.id === category);
  return found ? found.label : category;
};

const ApprovalCard: React.FC<{
  request: SkillApprovalRequest;
  onApprove: (id: string, note: string) => void;
  onReject: (id: string, note: string) => void;
}> = ({ request, onApprove, onReject }) => {
  const [note, setNote] = useState('');
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const status = STATUS_CONFIG[request.status];

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-bold text-gray-900 truncate">{request.skillTitle}</h4>
              <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                {getCategoryLabel(request.skillCategory)}
              </span>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">{request.skillDescription}</p>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border shrink-0 ${status.colorClass}`}>
            {status.icon}
            {status.label}
          </span>
        </div>

        {/* Requester info */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>신청자: <span className="font-medium text-gray-700">{request.requestedBy}</span></span>
          <span>{request.requestedAt}</span>
        </div>

        {/* Request note */}
        {request.requestNote && (
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-bold text-gray-400 mb-1">신청 사유</p>
            <p className="text-xs text-gray-600">{request.requestNote}</p>
          </div>
        )}

        {/* Review note (if reviewed) */}
        {request.reviewNote && (
          <div className={`rounded-xl p-3 ${request.status === 'approved' ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className="text-xs font-bold text-gray-400 mb-1">검토 의견</p>
            <p className="text-xs text-gray-600">{request.reviewNote}</p>
            {request.reviewedBy && (
              <p className="text-xs text-gray-400 mt-1">— {request.reviewedBy} · {request.reviewedAt}</p>
            )}
          </div>
        )}

        {/* Actions (only for pending) */}
        {request.status === 'pending' && (
          <div className="space-y-2 pt-1 border-t border-gray-100">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="검토 의견 (선택)"
              rows={2}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700 text-white gap-1"
                onClick={() => onApprove(request.id, note)}
              >
                <CheckCircle size={13} />
                승인
              </Button>
              {/* QW-7: 반려 시 확인 다이얼로그 */}
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs border-red-200 text-red-600 hover:bg-red-50 gap-1"
                onClick={() => setRejectTarget(request.id)}
              >
                <XCircle size={13} />
                반려
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* QW-7: 반려 확인 다이얼로그 */}
      <ConfirmDialog
        open={rejectTarget !== null}
        title="스킬 반려"
        description={
          <>
            <strong>&quot;{request.skillTitle}&quot;</strong> 스킬을 반려하시겠습니까?
            {note && (
              <span className="block mt-1 text-gray-500">검토 의견: {note}</span>
            )}
          </>
        }
        destructive
        confirmLabel="반려"
        onConfirm={() => {
          onReject(request.id, note);
          setRejectTarget(null);
        }}
        onCancel={() => setRejectTarget(null)}
      />
    </>
  );
};

const SkillApprovalQueue: React.FC<SkillApprovalQueueProps> = ({
  requests,
  onApprove,
  onReject,
}) => {
  const [filter, setFilter] = useState<ApprovalStatus | 'all'>('all');

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter);
  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex items-center gap-2" role="tablist">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              filter === f
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f === 'all' && `전체 (${requests.length})`}
            {f === 'pending' && `대기 (${pendingCount})`}
            {f === 'approved' && '승인됨'}
            {f === 'rejected' && '반려됨'}
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
          <p className="text-sm text-gray-400">승인 요청이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => (
            <ApprovalCard
              key={req.id}
              request={req}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillApprovalQueue;
